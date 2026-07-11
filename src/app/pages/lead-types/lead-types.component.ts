import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { finalize } from 'rxjs';

import {
  LeadType,
  LeadTypeRequest
} from '../../shared/models/lead-type';

import {
  LeadTypeService
} from '../../shared/services/lead-type.service';

@Component({
  selector: 'app-lead-types',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './lead-types.component.html',
  styleUrl: './lead-types.component.css'
})
export class LeadTypesComponent implements OnInit {

  leadTypes: LeadType[] = [];
  filteredLeadTypes: LeadType[] = [];

  leadTypeForm: FormGroup;

  loading = false;
  saving = false;
  formOpen = false;

  editingLeadTypeId: number | null = null;

  searchText = '';
  statusFilter = 'ALL';

  successMessage = '';
  errorMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly leadTypeService: LeadTypeService
  ) {
    this.leadTypeForm = this.formBuilder.group({
      leadTypeName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100)
        ]
      ],

      active: [true]
    });
  }

  ngOnInit(): void {
    this.loadLeadTypes();
  }

  loadLeadTypes(): void {
    this.loading = true;
    this.errorMessage = '';

    this.leadTypeService
      .getAllLeadTypes()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: leadTypes => {
          this.leadTypes = [...leadTypes].sort(
            (first, second) =>
              first.leadTypeName.localeCompare(
                second.leadTypeName
              )
          );

          this.applyFilters();
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            'Unable to load lead types. Make sure the backend is running.';
        }
      });
  }

  openAddForm(): void {
    this.resetMessages();

    this.editingLeadTypeId = null;

    this.leadTypeForm.reset({
      leadTypeName: '',
      active: true
    });

    this.formOpen = true;
  }

  openEditForm(
    leadType: LeadType
  ): void {

    this.resetMessages();

    this.editingLeadTypeId = leadType.id;

    this.leadTypeForm.reset({
      leadTypeName: leadType.leadTypeName,
      active: leadType.active
    });

    this.formOpen = true;
  }

  closeForm(): void {
    this.formOpen = false;
    this.editingLeadTypeId = null;

    this.leadTypeForm.reset({
      leadTypeName: '',
      active: true
    });
  }

  saveLeadType(): void {
    this.resetMessages();

    if (this.leadTypeForm.invalid) {
      this.leadTypeForm.markAllAsTouched();
      return;
    }

    const request: LeadTypeRequest = {
      leadTypeName:
        this.leadTypeForm.value.leadTypeName.trim(),

      active:
        this.leadTypeForm.value.active === true
    };

    this.saving = true;

    const operation =
      this.editingLeadTypeId === null
        ? this.leadTypeService
            .createLeadType(request)
        : this.leadTypeService
            .updateLeadType(
              this.editingLeadTypeId,
              request
            );

    operation
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({
        next: () => {
          this.successMessage =
            this.editingLeadTypeId === null
              ? 'Lead type created successfully.'
              : 'Lead type updated successfully.';

          this.closeForm();
          this.loadLeadTypes();
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            this.extractErrorMessage(error);
        }
      });
  }

  toggleStatus(
    leadType: LeadType
  ): void {

    this.resetMessages();

    const request: LeadTypeRequest = {
      leadTypeName: leadType.leadTypeName,
      active: !leadType.active
    };

    this.leadTypeService
      .updateLeadType(
        leadType.id,
        request
      )
      .subscribe({
        next: () => {
          this.successMessage =
            request.active
              ? 'Lead type activated successfully.'
              : 'Lead type deactivated successfully.';

          this.loadLeadTypes();
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            this.extractErrorMessage(error);
        }
      });
  }

  deleteLeadType(
    leadType: LeadType
  ): void {

    const confirmed = window.confirm(
      `Delete lead type "${leadType.leadTypeName}"?`
    );

    if (!confirmed) {
      return;
    }

    this.resetMessages();

    this.leadTypeService
      .deleteLeadType(leadType.id)
      .subscribe({
        next: response => {
          this.successMessage =
            response.message ||
            'Lead type deleted successfully.';

          this.loadLeadTypes();
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            this.extractErrorMessage(error);
        }
      });
  }

  onSearch(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    this.searchText = input.value;
    this.applyFilters();
  }

  onStatusFilter(
    event: Event
  ): void {

    const select =
      event.target as HTMLSelectElement;

    this.statusFilter = select.value;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchText = '';
    this.statusFilter = 'ALL';

    this.applyFilters();
  }

  applyFilters(): void {
    const search =
      this.searchText
        .trim()
        .toLowerCase();

    this.filteredLeadTypes =
      this.leadTypes.filter(leadType => {

        const matchesSearch =
          !search ||
          leadType.leadTypeName
            .toLowerCase()
            .includes(search);

        const matchesStatus =
          this.statusFilter === 'ALL' ||
          (
            this.statusFilter === 'ACTIVE' &&
            leadType.active
          ) ||
          (
            this.statusFilter === 'INACTIVE' &&
            !leadType.active
          );

        return matchesSearch && matchesStatus;
      });
  }

  getActiveCount(): number {
    return this.leadTypes.filter(
      leadType => leadType.active
    ).length;
  }

  getInactiveCount(): number {
    return this.leadTypes.filter(
      leadType => !leadType.active
    ).length;
  }

  private resetMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private extractErrorMessage(error: {
    error?: {
      message?: string;
      validationErrors?: Record<string, string>;
    };
  }): string {

    const validationErrors =
      error.error?.validationErrors;

    if (validationErrors) {
      const messages =
        Object.values(validationErrors);

      if (messages.length > 0) {
        return messages[0];
      }
    }

    return (
      error.error?.message ??
      'Something went wrong. Please try again.'
    );
  }
}