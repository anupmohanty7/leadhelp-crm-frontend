import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  LeadType,
  LeadTypeRequest
} from '../models/lead-type';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeadTypeService {

  private readonly apiUrl =
  `${environment.apiUrl}/api/lead-types`;

  constructor(
    private readonly http: HttpClient
  ) {
  }

  getAllLeadTypes(): Observable<LeadType[]> {
    return this.http.get<LeadType[]>(
      this.apiUrl
    );
  }

  getActiveLeadTypes(): Observable<LeadType[]> {
    return this.http.get<LeadType[]>(
      `${this.apiUrl}/active`
    );
  }

  getLeadTypeById(
    id: number
  ): Observable<LeadType> {

    return this.http.get<LeadType>(
      `${this.apiUrl}/${id}`
    );
  }

  searchLeadTypes(
    name: string
  ): Observable<LeadType[]> {

    return this.http.get<LeadType[]>(
      `${this.apiUrl}/search`,
      {
        params: {
          name
        }
      }
    );
  }

  createLeadType(
    request: LeadTypeRequest
  ): Observable<LeadType> {

    return this.http.post<LeadType>(
      this.apiUrl,
      request
    );
  }

  updateLeadType(
    id: number,
    request: LeadTypeRequest
  ): Observable<LeadType> {

    return this.http.put<LeadType>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  deleteLeadType(
    id: number
  ): Observable<{ message: string }> {

    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`
    );
  }
}