import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DashboardResponse } from '../models/dashboard-response';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly apiUrl =
  `${environment.apiUrl}/api/dashboard`;

  constructor(
    private readonly http: HttpClient
  ) {
  }

  getDashboardSummary(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(
      this.apiUrl
    );
  }
}