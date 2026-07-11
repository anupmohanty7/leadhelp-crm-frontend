import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Note } from '../models/note';
import { NoteRequest } from '../models/note-request';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  private readonly apiUrl =
  `${environment.apiUrl}/api/notes`;
  constructor(
    private readonly http: HttpClient
  ) {
  }

  createNote(
    request: NoteRequest
  ): Observable<Note> {

    return this.http.post<Note>(
      this.apiUrl,
      request
    );
  }

  getAllNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(
      this.apiUrl
    );
  }

  getNoteById(
    id: number
  ): Observable<Note> {

    return this.http.get<Note>(
      `${this.apiUrl}/${id}`
    );
  }

  getNotesByCustomer(
    customerLeadId: number
  ): Observable<Note[]> {

    return this.http.get<Note[]>(
      `${this.apiUrl}/customer/${customerLeadId}`
    );
  }

  updateNote(
    id: number,
    request: NoteRequest
  ): Observable<Note> {

    return this.http.put<Note>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  deleteNote(
    id: number
  ): Observable<{ message: string }> {

    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`
    );
  }
}