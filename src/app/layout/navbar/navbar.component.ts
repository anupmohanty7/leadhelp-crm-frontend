import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  finalize,
  forkJoin
} from 'rxjs';

import {
  FollowUp
} from '../../shared/models/follow-up';

import {
  FollowUpService
} from '../../shared/services/follow-up.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  @Output()
  sidebarToggle = new EventEmitter<void>();

  reminderPanelOpen = false;
  remindersLoading = false;

  globalSearchText = '';

  todayFollowUps: FollowUp[] = [];
  pendingFollowUps: FollowUp[] = [];

  constructor(
    private readonly router: Router,
    private readonly followUpService: FollowUpService
  ) {
  }

  ngOnInit(): void {
    this.loadReminders();
  }

  emitSidebarToggle(): void {
    this.sidebarToggle.emit();
  }

  toggleReminderPanel(): void {
    this.reminderPanelOpen =
      !this.reminderPanelOpen;

    if (this.reminderPanelOpen) {
      this.loadReminders();
    }
  }

  closeReminderPanel(): void {
    this.reminderPanelOpen = false;
  }

  loadReminders(): void {
    this.remindersLoading = true;

    forkJoin({
      today:
        this.followUpService.getTodayFollowUps(),

      pending:
        this.followUpService.getPendingFollowUps()
    })
      .pipe(
        finalize(() => {
          this.remindersLoading = false;
        })
      )
      .subscribe({
        next: response => {
          this.todayFollowUps =
            this.sortFollowUps(response.today);

          this.pendingFollowUps =
            this.sortFollowUps(response.pending);
        },

        error: error => {
          console.error(
            'Unable to load reminders:',
            error
          );

          this.todayFollowUps = [];
          this.pendingFollowUps = [];
        }
      });
  }

  openCustomersPage(): void {
    this.closeReminderPanel();

    this.router.navigate(
      ['/customers'],
      {
        queryParams: {
          add: true
        }
      }
    );
  }

  openFollowUpsPage(
    selectedTab?: 'TODAY' | 'PENDING'
  ): void {

    this.closeReminderPanel();

    this.router.navigate(
      ['/follow-ups'],
      {
        queryParams: selectedTab
          ? { tab: selectedTab }
          : {}
      }
    );
  }

  openCustomerFromReminder(
    followUp: FollowUp
  ): void {

    this.closeReminderPanel();

    this.router.navigate(
      ['/customers'],
      {
        queryParams: {
          search:
            followUp.customerLead.customerName
        }
      }
    );
  }

  performGlobalSearch(): void {
    const cleanedSearch =
      this.globalSearchText.trim();

    if (!cleanedSearch) {
      return;
    }

    this.closeReminderPanel();

    this.router.navigate(
      ['/customers'],
      {
        queryParams: {
          search: cleanedSearch
        }
      }
    );
  }

  clearGlobalSearch(): void {
    this.globalSearchText = '';
  }

  getNotificationCount(): number {
    return (
      this.todayFollowUps.length +
      this.pendingFollowUps.length
    );
  }

  getInitials(
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

  private sortFollowUps(
    followUps: FollowUp[]
  ): FollowUp[] {

    return [...followUps].sort(
      (first, second) => {

        const firstDate =
          first.nextFollowUpDate ??
          first.followUpDate;

        const secondDate =
          second.nextFollowUpDate ??
          second.followUpDate;

        return (
          new Date(firstDate).getTime() -
          new Date(secondDate).getTime()
        );
      }
    );
  }
}