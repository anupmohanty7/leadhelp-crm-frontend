import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { LeadStatus } from '../models/lead-status';
import { Priority } from '../models/priority';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {

  private readonly apiUrl =
  `${environment.apiUrl}/api/master-data`;

  constructor(
    private readonly http: HttpClient
  ) {
  }

  getActiveLeadStatuses(): Observable<LeadStatus[]> {
    return this.http.get<LeadStatus[]>(
      `${this.apiUrl}/lead-statuses/active`
    );
  }

  getActivePriorities(): Observable<Priority[]> {
    return this.http.get<Priority[]>(
      `${this.apiUrl}/priorities/active`
    );
  }
}