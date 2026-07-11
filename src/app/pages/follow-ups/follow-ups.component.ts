import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  finalize,
  forkJoin
} from 'rxjs';

import { CustomerLead } from '../../shared/models/customer-lead';
import { FollowUp } from '../../shared/models/follow-up';
import { FollowUpRequest } from '../../shared/models/follow-up-request';
import { LeadStatus } from '../../shared/models/lead-status';

import {
  CustomerLeadService
} from '../../shared/services/customer-lead.service';

import {
  FollowUpService
} from '../../shared/services/follow-up.service';

import {
  MasterDataService
} from '../../shared/services/master-data.service';

@Component({
  selector: 'app-follow-ups',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './follow-ups.component.html',
  styleUrl: './follow-ups.component.css'
})
export class FollowUpsComponent implements OnInit {

  allFollowUps: FollowUp[] = [];
  displayedFollowUps: FollowUp[] = [];

  todayFollowUps: FollowUp[] = [];
  pendingFollowUps: FollowUp[] = [];

  customers: CustomerLead[] = [];
  statuses: LeadStatus[] = [];

  followUpForm: FormGroup;

  selectedTab:
    'ALL' | 'TODAY' | 'PENDING' = 'ALL';

  searchText = '';

  loading = false;
  saving = false;
  formOpen = false;

  editingFollowUpId: number | null = null;

  successMessage = '';
  errorMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly followUpService: FollowUpService,
    private readonly customerLeadService: CustomerLeadService,
    private readonly masterDataService: MasterDataService
  ) {
    this.followUpForm = this.formBuilder.group({
      customerLeadId: [
        '',
        Validators.required
      ],

      followUpDate: [
        this.getTodayDate(),
        Validators.required
      ],

      discussionDetails: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(3000)
        ]
      ],

      nextFollowUpDate: [''],

      statusId: [
        '',
        Validators.required
      ]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      allFollowUps:
        this.followUpService.getAllFollowUps(),

      todayFollowUps:
        this.followUpService.getTodayFollowUps(),

      pendingFollowUps:
        this.followUpService.getPendingFollowUps(),

      customers:
        this.customerLeadService.getAllCustomerLeads(),

      statuses:
        this.masterDataService.getActiveLeadStatuses()
    })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: response => {
          this.allFollowUps =
            this.sortFollowUps(response.allFollowUps);

          this.todayFollowUps =
            this.sortFollowUps(response.todayFollowUps);

          this.pendingFollowUps =
            this.sortFollowUps(response.pendingFollowUps);

          this.customers =
            [...response.customers].sort(
              (first, second) =>
                first.customerName.localeCompare(
                  second.customerName
                )
            );

          this.statuses = response.statuses;

          this.applyCurrentView();
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            'Unable to load follow-up data. Make sure the backend is running.';
        }
      });
  }

  selectTab(
    tab: 'ALL' | 'TODAY' | 'PENDING'
  ): void {

    this.selectedTab = tab;
    this.applyCurrentView();
  }

  onSearch(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    this.searchText = input.value;
    this.applyCurrentView();
  }

  clearSearch(): void {
    this.searchText = '';
    this.applyCurrentView();
  }

  openAddForm(
    customerLeadId?: number
  ): void {

    this.resetMessages();

    this.editingFollowUpId = null;

    const followUpStatus =
      this.statuses.find(
        status =>
          status.statusName.toLowerCase() ===
          'follow up'
      );

    this.followUpForm.reset({
      customerLeadId:
        customerLeadId ?? '',

      followUpDate:
        this.getTodayDate(),

      discussionDetails: '',

      nextFollowUpDate: '',

      statusId:
        followUpStatus?.id ??
        this.statuses[0]?.id ??
        ''
    });

    this.formOpen = true;
  }

  openEditForm(
    followUp: FollowUp
  ): void {

    this.resetMessages();

    this.editingFollowUpId = followUp.id;

    this.followUpForm.reset({
      customerLeadId:
        followUp.customerLead.id,

      followUpDate:
        followUp.followUpDate,

      discussionDetails:
        followUp.discussionDetails,

      nextFollowUpDate:
        followUp.nextFollowUpDate ?? '',

      statusId:
        followUp.status.id
    });

    this.formOpen = true;
  }

  closeForm(): void {
    this.formOpen = false;
    this.editingFollowUpId = null;

    this.followUpForm.reset({
      followUpDate:
        this.getTodayDate()
    });
  }

  saveFollowUp(): void {
    this.resetMessages();

    if (this.followUpForm.invalid) {
      this.followUpForm.markAllAsTouched();
      return;
    }

    const value =
      this.followUpForm.value;

    const request: FollowUpRequest = {
      customerLeadId:
        Number(value.customerLeadId),

      followUpDate:
        value.followUpDate || null,

      discussionDetails:
        value.discussionDetails.trim(),

      nextFollowUpDate:
        value.nextFollowUpDate || null,

      statusId:
        Number(value.statusId)
    };

    this.saving = true;

    const operation =
      this.editingFollowUpId === null
        ? this.followUpService
            .createFollowUp(request)
        : this.followUpService
            .updateFollowUp(
              this.editingFollowUpId,
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
            this.editingFollowUpId === null
              ? 'Follow-up created successfully.'
              : 'Follow-up updated successfully.';

          this.closeForm();
          this.loadInitialData();
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            this.extractErrorMessage(error);
        }
      });
  }

  deleteFollowUp(
    followUp: FollowUp
  ): void {

    const confirmed =
      window.confirm(
        `Delete this follow-up for "${followUp.customerLead.customerName}"?`
      );

    if (!confirmed) {
      return;
    }

    this.resetMessages();

    this.followUpService
      .deleteFollowUp(followUp.id)
      .subscribe({
        next: response => {
          this.successMessage =
            response.message ||
            'Follow-up deleted successfully.';

          this.loadInitialData();
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            this.extractErrorMessage(error);
        }
      });
  }

  getCustomerInitials(
    customerName: string
  ): string {

    return customerName
      .split(' ')
      .filter(part => part.length > 0)
      .slice(0, 2)
      .map(part =>
        part.charAt(0).toUpperCase()
      )
      .join('');
  }

  isOverdue(
    followUp: FollowUp
  ): boolean {

    if (!followUp.nextFollowUpDate) {
      return false;
    }

    return (
      followUp.nextFollowUpDate <
      this.getTodayDate()
    );
  }

  isDueToday(
    followUp: FollowUp
  ): boolean {

    return (
      followUp.nextFollowUpDate ===
      this.getTodayDate()
    );
  }

  private applyCurrentView(): void {
    let source: FollowUp[];

    if (this.selectedTab === 'TODAY') {
      source = this.todayFollowUps;
    } else if (
      this.selectedTab === 'PENDING'
    ) {
      source = this.pendingFollowUps;
    } else {
      source = this.allFollowUps;
    }

    const search =
      this.searchText
        .trim()
        .toLowerCase();

    this.displayedFollowUps =
      source.filter(followUp => {

        if (!search) {
          return true;
        }

        return (
          followUp.customerLead.customerName
            .toLowerCase()
            .includes(search) ||

          followUp.customerLead.mobile
            .includes(search) ||

          followUp.discussionDetails
            .toLowerCase()
            .includes(search) ||

          followUp.status.statusName
            .toLowerCase()
            .includes(search)
        );
      });
  }

  private sortFollowUps(
    followUps: FollowUp[]
  ): FollowUp[] {

    return [...followUps].sort(
      (first, second) =>
        new Date(second.createdDate).getTime() -
        new Date(first.createdDate).getTime()
    );
  }

  private getTodayDate(): string {
    const today = new Date();

    const year =
      today.getFullYear();

    const month =
      String(today.getMonth() + 1)
        .padStart(2, '0');

    const day =
      String(today.getDate())
        .padStart(2, '0');

    return `${year}-${month}-${day}`;
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