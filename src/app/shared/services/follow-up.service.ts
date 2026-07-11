import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FollowUp } from '../models/follow-up';
import { FollowUpRequest } from '../models/follow-up-request';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class FollowUpService {

  private readonly apiUrl =
  `${environment.apiUrl}/api/follow-ups`;

  constructor(
    private readonly http: HttpClient
  ) {
  }

  createFollowUp(
    request: FollowUpRequest
  ): Observable<FollowUp> {

    return this.http.post<FollowUp>(
      this.apiUrl,
      request
    );
  }

  getAllFollowUps(): Observable<FollowUp[]> {
    return this.http.get<FollowUp[]>(
      this.apiUrl
    );
  }

  getFollowUpById(
    id: number
  ): Observable<FollowUp> {

    return this.http.get<FollowUp>(
      `${this.apiUrl}/${id}`
    );
  }

  getFollowUpsByCustomer(
    customerLeadId: number
  ): Observable<FollowUp[]> {

    return this.http.get<FollowUp[]>(
      `${this.apiUrl}/customer/${customerLeadId}`
    );
  }

  updateFollowUp(
    id: number,
    request: FollowUpRequest
  ): Observable<FollowUp> {

    return this.http.put<FollowUp>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  deleteFollowUp(
    id: number
  ): Observable<{ message: string }> {

    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`
    );
  }

  getTodayFollowUps(): Observable<FollowUp[]> {
    return this.http.get<FollowUp[]>(
      `${this.apiUrl}/today`
    );
  }

  getPendingFollowUps(): Observable<FollowUp[]> {
    return this.http.get<FollowUp[]>(
      `${this.apiUrl}/pending`
    );
  }
}