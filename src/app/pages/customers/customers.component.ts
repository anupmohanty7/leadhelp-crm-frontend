import { CommonModule } from '@angular/common';

import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Subscription,
  finalize,
  forkJoin
} from 'rxjs';

import {
  CustomerLead
} from '../../shared/models/customer-lead';

import {
  LeadStatus
} from '../../shared/models/lead-status';

import {
  LeadType
} from '../../shared/models/lead-type';

import {
  Priority
} from '../../shared/models/priority';

import {
  CustomerLeadRequest,
  CustomerLeadService
} from '../../shared/services/customer-lead.service';

import {
  LeadTypeService
} from '../../shared/services/lead-type.service';

import {
  MasterDataService
} from '../../shared/services/master-data.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent
  implements OnInit, OnDestroy {

  customers: CustomerLead[] = [];
  displayedCustomers: CustomerLead[] = [];

  leadTypes: LeadType[] = [];
  filteredLeadTypes: LeadType[] = [];
  statuses: LeadStatus[] = [];
  priorities: Priority[] = [];

  customerForm: FormGroup;

  loading = false;
  saving = false;
  initialDataLoaded = false;

  formOpen = false;
  leadTypeDropdownOpen = false;
  createLeadTypeVisible = false;

  editingCustomerId: number | null = null;

  selectedLeadType: LeadType | null = null;
  leadTypeSearchText = '';

  globalSearchText = '';
  selectedFilterLeadTypeId = 0;
  selectedFilterStatusId = 0;
  selectedFilterPriorityId = 0;

  successMessage = '';
  errorMessage = '';

  private querySubscription?: Subscription;
  private requestedAddForm = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly customerLeadService:
      CustomerLeadService,
    private readonly leadTypeService:
      LeadTypeService,
    private readonly masterDataService:
      MasterDataService,
    private readonly activatedRoute:
      ActivatedRoute,
    private readonly router:
      Router
  ) {
    this.customerForm = this.formBuilder.group({
      customerName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100)
        ]
      ],

      mobile: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[6-9][0-9]{9}$/
          )
        ]
      ],

      alternateNumber: [
        '',
        [
          Validators.pattern(
            /^$|^[6-9][0-9]{9}$/
          )
        ]
      ],

      email: [
        '',
        [
          Validators.email
        ]
      ],

      city: [''],
      address: [''],
      requirement: [''],
      leadSource: [''],
      assignedExecutive: [''],
      discussionDetails: [''],
      visitDate: [''],
      nextFollowUpDate: [''],

      statusId: [
        '',
        Validators.required
      ],

      priorityId: [
        '',
        Validators.required
      ],

      active: [true]
    });
  }

  ngOnInit(): void {
    this.subscribeToQueryParameters();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
  }

  loadInitialData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.initialDataLoaded = false;

    forkJoin({
      customers:
        this.customerLeadService
          .getAllCustomerLeads(),

      leadTypes:
        this.leadTypeService
          .getActiveLeadTypes(),

      statuses:
        this.masterDataService
          .getActiveLeadStatuses(),

      priorities:
        this.masterDataService
          .getActivePriorities()
    })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: response => {
          this.customers = response.customers;

          this.leadTypes = response.leadTypes;

          this.filteredLeadTypes =
            response.leadTypes;

          this.statuses = response.statuses;
          this.priorities = response.priorities;

          this.initialDataLoaded = true;

          this.applyFilters();

          if (this.requestedAddForm) {
            this.openAddCustomerForm();
            this.requestedAddForm = false;
          }
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            'Unable to load customer data. Make sure the backend is running.';
        }
      });
  }

  openAddCustomerForm(): void {
    if (!this.initialDataLoaded) {
      this.requestedAddForm = true;
      return;
    }

    this.resetForm();

    this.editingCustomerId = null;
    this.formOpen = true;

    this.setDefaultMasterValues();

    this.removeAddQueryParameter();
  }

  openEditCustomerForm(
    customer: CustomerLead
  ): void {

    this.resetMessages();

    this.editingCustomerId = customer.id;
    this.formOpen = true;

    this.selectedLeadType =
      customer.leadType;

    this.leadTypeSearchText =
      customer.leadType.leadTypeName;

    this.customerForm.patchValue({
      customerName:
        customer.customerName,

      mobile:
        customer.mobile,

      alternateNumber:
        customer.alternateNumber ?? '',

      email:
        customer.email ?? '',

      city:
        customer.city ?? '',

      address:
        customer.address ?? '',

      requirement:
        customer.requirement ?? '',

      leadSource:
        customer.leadSource ?? '',

      assignedExecutive:
        customer.assignedExecutive ?? '',

      discussionDetails:
        customer.discussionDetails ?? '',

      visitDate:
        customer.visitDate ?? '',

      nextFollowUpDate:
        customer.nextFollowUpDate ?? '',

      statusId:
        customer.status.id,

      priorityId:
        customer.priority.id,

      active:
        customer.active
    });
  }

  closeCustomerForm(): void {
    this.formOpen = false;
    this.resetForm();
    this.removeAddQueryParameter();
  }

  saveCustomer(): void {
    this.resetMessages();

    if (!this.selectedLeadType) {
      this.errorMessage =
        'Please select or create a lead type.';
      return;
    }

    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    const value =
      this.customerForm.value;

    const request: CustomerLeadRequest = {
      customerName:
        value.customerName.trim(),

      mobile:
        value.mobile.trim(),

      alternateNumber:
        value.alternateNumber?.trim() ?? '',

      email:
        value.email?.trim() ?? '',

      city:
        value.city?.trim() ?? '',

      address:
        value.address?.trim() ?? '',

      requirement:
        value.requirement?.trim() ?? '',

      leadSource:
        value.leadSource?.trim() ?? '',

      assignedExecutive:
        value.assignedExecutive?.trim() ?? '',

      discussionDetails:
        value.discussionDetails?.trim() ?? '',

      visitDate:
        value.visitDate || null,

      nextFollowUpDate:
        value.nextFollowUpDate || null,

      leadTypeId:
        this.selectedLeadType.id,

      statusId:
        Number(value.statusId),

      priorityId:
        Number(value.priorityId),

      active:
        value.active === true
    };

    this.saving = true;

    const operation =
      this.editingCustomerId === null
        ? this.customerLeadService
            .createCustomerLead(request)
        : this.customerLeadService
            .updateCustomerLead(
              this.editingCustomerId,
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
            this.editingCustomerId === null
              ? 'Customer created successfully.'
              : 'Customer updated successfully.';

          this.formOpen = false;
          this.resetForm();
          this.loadCustomersOnly();
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            this.extractErrorMessage(error);
        }
      });
  }

  deleteCustomer(
    customer: CustomerLead
  ): void {

    const confirmed = window.confirm(
      `Delete customer "${customer.customerName}"?`
    );

    if (!confirmed) {
      return;
    }

    this.resetMessages();

    this.customerLeadService
      .deleteCustomerLead(customer.id)
      .subscribe({
        next: () => {
          this.successMessage =
            'Customer deleted successfully.';

          this.loadCustomersOnly();
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            this.extractErrorMessage(error);
        }
      });
  }

  onLeadTypeSearchInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    this.leadTypeSearchText =
      input.value;

    this.selectedLeadType = null;
    this.leadTypeDropdownOpen = true;

    const searchValue =
      this.leadTypeSearchText
        .trim()
        .toLowerCase();

    if (!searchValue) {
      this.filteredLeadTypes =
        this.leadTypes;

      this.createLeadTypeVisible = false;
      return;
    }

    this.filteredLeadTypes =
      this.leadTypes.filter(
        leadType =>
          leadType.leadTypeName
            .toLowerCase()
            .includes(searchValue)
      );

    const exactMatch =
      this.leadTypes.some(
        leadType =>
          leadType.leadTypeName
            .toLowerCase() ===
          searchValue
      );

    this.createLeadTypeVisible =
      !exactMatch &&
      this.filteredLeadTypes.length === 0;
  }

  selectLeadType(
    leadType: LeadType
  ): void {

    this.selectedLeadType = leadType;

    this.leadTypeSearchText =
      leadType.leadTypeName;

    this.leadTypeDropdownOpen = false;
    this.createLeadTypeVisible = false;
  }

  createLeadTypeFromSearch(): void {
    const newLeadTypeName =
      this.leadTypeSearchText.trim();

    if (!newLeadTypeName) {
      return;
    }

    this.leadTypeService
      .createLeadType({
        leadTypeName: newLeadTypeName,
        active: true
      })
      .subscribe({
        next: createdLeadType => {
          this.leadTypes = [
            ...this.leadTypes,
            createdLeadType
          ].sort(
            (first, second) =>
              first.leadTypeName.localeCompare(
                second.leadTypeName
              )
          );

          this.filteredLeadTypes =
            this.leadTypes;

          this.selectLeadType(
            createdLeadType
          );

          this.successMessage =
            `Lead type "${createdLeadType.leadTypeName}" created successfully.`;
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            this.extractErrorMessage(error);
        }
      });
  }

  applyFilters(): void {
    const search =
      this.globalSearchText
        .trim()
        .toLowerCase();

    this.displayedCustomers =
      this.customers.filter(customer => {

        const matchesSearch =
          !search ||

          customer.customerName
            .toLowerCase()
            .includes(search) ||

          customer.mobile.includes(search) ||

          (customer.city ?? '')
            .toLowerCase()
            .includes(search) ||

          (customer.email ?? '')
            .toLowerCase()
            .includes(search);

        const matchesLeadType =
          this.selectedFilterLeadTypeId === 0 ||

          customer.leadType.id ===
            this.selectedFilterLeadTypeId;

        const matchesStatus =
          this.selectedFilterStatusId === 0 ||

          customer.status.id ===
            this.selectedFilterStatusId;

        const matchesPriority =
          this.selectedFilterPriorityId === 0 ||

          customer.priority.id ===
            this.selectedFilterPriorityId;

        return (
          matchesSearch &&
          matchesLeadType &&
          matchesStatus &&
          matchesPriority
        );
      });
  }

  onGlobalSearch(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    this.globalSearchText =
      input.value;

    this.applyFilters();

    this.updateSearchQueryParameter();
  }

  onLeadTypeFilter(
    event: Event
  ): void {

    const select =
      event.target as HTMLSelectElement;

    this.selectedFilterLeadTypeId =
      Number(select.value);

    this.applyFilters();
  }

  onStatusFilter(
    event: Event
  ): void {

    const select =
      event.target as HTMLSelectElement;

    this.selectedFilterStatusId =
      Number(select.value);

    this.applyFilters();
  }

  onPriorityFilter(
    event: Event
  ): void {

    const select =
      event.target as HTMLSelectElement;

    this.selectedFilterPriorityId =
      Number(select.value);

    this.applyFilters();
  }

  clearFilters(): void {
    this.globalSearchText = '';
    this.selectedFilterLeadTypeId = 0;
    this.selectedFilterStatusId = 0;
    this.selectedFilterPriorityId = 0;

    this.displayedCustomers =
      this.customers;

    this.router.navigate(
      [],
      {
        relativeTo:
          this.activatedRoute,

        queryParams: {
          search: null
        },

        queryParamsHandling:
          'merge',

        replaceUrl:
          true
      }
    );
  }

  getInitials(
    name: string
  ): string {

    return name
      .split(' ')
      .filter(part => part.length > 0)
      .slice(0, 2)
      .map(part =>
        part.charAt(0).toUpperCase()
      )
      .join('');
  }

  private subscribeToQueryParameters(): void {
    this.querySubscription =
      this.activatedRoute
        .queryParamMap
        .subscribe(parameters => {

          const search =
            parameters.get('search') ?? '';

          const addCustomer =
            parameters.get('add') === 'true';

          this.globalSearchText = search;

          if (this.initialDataLoaded) {
            this.applyFilters();
          }

          if (addCustomer) {
            if (this.initialDataLoaded) {
              this.openAddCustomerForm();
            } else {
              this.requestedAddForm = true;
            }
          }
        });
  }

  private loadCustomersOnly(): void {
    this.loading = true;

    this.customerLeadService
      .getAllCustomerLeads()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: customers => {
          this.customers = customers;
          this.applyFilters();
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            'Unable to reload customer records.';
        }
      });
  }

  private setDefaultMasterValues(): void {
    const defaultStatus =
      this.statuses.find(
        status =>
          status.statusName
            .toLowerCase() === 'new'
      );

    const defaultPriority =
      this.priorities.find(
        priority =>
          priority.priorityName
            .toLowerCase() === 'warm'
      );

    this.customerForm.patchValue({
      statusId:
        defaultStatus?.id ??
        this.statuses[0]?.id ??
        '',

      priorityId:
        defaultPriority?.id ??
        this.priorities[0]?.id ??
        ''
    });
  }

  private resetForm(): void {
    this.customerForm.reset({
      active: true
    });

    this.editingCustomerId = null;
    this.selectedLeadType = null;
    this.leadTypeSearchText = '';
    this.leadTypeDropdownOpen = false;
    this.createLeadTypeVisible = false;

    this.resetMessages();
  }

  private resetMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private updateSearchQueryParameter(): void {
    this.router.navigate(
      [],
      {
        relativeTo:
          this.activatedRoute,

        queryParams: {
          search:
            this.globalSearchText.trim() ||
            null
        },

        queryParamsHandling:
          'merge',

        replaceUrl:
          true
      }
    );
  }

  private removeAddQueryParameter(): void {
    this.router.navigate(
      [],
      {
        relativeTo:
          this.activatedRoute,

        queryParams: {
          add: null
        },

        queryParamsHandling:
          'merge',

        replaceUrl:
          true
      }
    );
  }

  private extractErrorMessage(error: {
    error?: {
      message?: string;
      validationErrors?:
        Record<string, string>;
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