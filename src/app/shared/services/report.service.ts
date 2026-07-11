import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { LabelCount } from '../models/label-count';
import { ReportSummary } from '../models/report-summary';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private readonly apiUrl =
  `${environment.apiUrl}/api/reports`;

  constructor(
    private readonly http: HttpClient
  ) {
  }

  getReportSummary(): Observable<ReportSummary> {
    return this.http.get<ReportSummary>(
      `${this.apiUrl}/summary`
    );
  }

  getLeadsByStatus(): Observable<LabelCount[]> {
    return this.http.get<LabelCount[]>(
      `${this.apiUrl}/leads-by-status`
    );
  }

  getLeadsByLeadType(): Observable<LabelCount[]> {
    return this.http.get<LabelCount[]>(
      `${this.apiUrl}/leads-by-lead-type`
    );
  }

  getLeadsBySource(): Observable<LabelCount[]> {
    return this.http.get<LabelCount[]>(
      `${this.apiUrl}/leads-by-source`
    );
  }
}