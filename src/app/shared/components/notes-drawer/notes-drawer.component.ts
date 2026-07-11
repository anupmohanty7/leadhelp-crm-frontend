import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  finalize
} from 'rxjs';

import {
  AuthService
} from '../../services/auth.service';

import {
  CustomerLead
} from '../../models/customer-lead';

import {
  Note
} from '../../models/note';

import {
  NoteRequest
} from '../../models/note-request';

import {
  CustomerLeadService
} from '../../services/customer-lead.service';

import {
  NoteService
} from '../../services/note.service';

@Component({
  selector: 'app-notes-drawer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './notes-drawer.component.html',
  styleUrl: './notes-drawer.component.css'
})
export class NotesDrawerComponent
  implements OnChanges {

  @Input()
  open = false;

  @Output()
  closed = new EventEmitter<void>();

  customers: CustomerLead[] = [];
  notes: Note[] = [];

  selectedCustomerId = 0;
  noteText = '';

  loading = false;
  saving = false;

  errorMessage = '';

  constructor(
    private readonly customerLeadService:
      CustomerLeadService,

    private readonly noteService:
      NoteService,

    private readonly authService:
      AuthService
  ) {
  }

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['open'] &&
      this.open
    ) {
      this.loadCustomers();
    }
  }

  closeDrawer(): void {
    this.closed.emit();
  }

  onCustomerChange(
    event: Event
  ): void {

    const select =
      event.target as HTMLSelectElement;

    this.selectedCustomerId =
      Number(select.value);

    if (this.selectedCustomerId > 0) {
      this.loadCustomerNotes();
    } else {
      this.notes = [];
    }
  }

  addNote(): void {
    this.errorMessage = '';

    const cleanedText =
      this.noteText.trim();

    if (
      this.selectedCustomerId <= 0
    ) {
      this.errorMessage =
        'Please select a customer.';
      return;
    }

    if (!cleanedText) {
      this.errorMessage =
        'Please enter note text.';
      return;
    }

    const currentUser =
      this.authService.getLoggedInUser();

    const request: NoteRequest = {
      customerLeadId:
        this.selectedCustomerId,

      noteText:
        cleanedText,

      createdBy:
        currentUser?.fullName ??
        currentUser?.username ??
        'CRM User'
    };

    this.saving = true;

    this.noteService
      .createNote(request)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({
        next: createdNote => {
          this.notes = [
            createdNote,
            ...this.notes
          ];

          this.noteText = '';
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            error.error?.message ??
            'Unable to save note.';
        }
      });
  }

  deleteNote(
    note: Note
  ): void {

    const confirmed =
      window.confirm(
        'Delete this note?'
      );

    if (!confirmed) {
      return;
    }

    this.noteService
      .deleteNote(note.id)
      .subscribe({
        next: () => {
          this.notes =
            this.notes.filter(
              existingNote =>
                existingNote.id !== note.id
            );
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            error.error?.message ??
            'Unable to delete note.';
        }
      });
  }

  private loadCustomers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.customerLeadService
      .getAllCustomerLeads()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: customers => {
          this.customers =
            [...customers].sort(
              (first, second) =>
                first.customerName.localeCompare(
                  second.customerName
                )
            );
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            'Unable to load customers.';
        }
      });
  }

  private loadCustomerNotes(): void {
    this.loading = true;
    this.errorMessage = '';

    this.noteService
      .getNotesByCustomer(
        this.selectedCustomerId
      )
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: notes => {
          this.notes = notes;
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            error.error?.message ??
            'Unable to load notes.';
        }
      });
  }
}