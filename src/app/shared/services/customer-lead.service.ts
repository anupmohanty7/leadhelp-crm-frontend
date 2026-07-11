import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CustomerLead } from '../models/customer-lead';
import { environment } from '../../../environments/environment.development';

export interface CustomerLeadRequest {
  customerName: string;
  mobile: string;
  alternateNumber: string;
  email: string;
  city: string;
  address: string;
  requirement: string;
  leadSource: string;
  assignedExecutive: string;
  discussionDetails: string;
  visitDate: string | null;
  nextFollowUpDate: string | null;
  leadTypeId: number;
  statusId: number;
  priorityId: number;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerLeadService {

  private readonly apiUrl =
  `${environment.apiUrl}/api/customer-leads`;

  constructor(
    private readonly http: HttpClient
  ) {
  }

  getAllCustomerLeads(): Observable<CustomerLead[]> {
    return this.http.get<CustomerLead[]>(
      this.apiUrl
    );
  }

  getActiveCustomerLeads(): Observable<CustomerLead[]> {
    return this.http.get<CustomerLead[]>(
      `${this.apiUrl}/active`
    );
  }

  getCustomerLeadById(
    id: number
  ): Observable<CustomerLead> {

    return this.http.get<CustomerLead>(
      `${this.apiUrl}/${id}`
    );
  }

  createCustomerLead(
    request: CustomerLeadRequest
  ): Observable<CustomerLead> {

    return this.http.post<CustomerLead>(
      this.apiUrl,
      request
    );
  }

  updateCustomerLead(
    id: number,
    request: CustomerLeadRequest
  ): Observable<CustomerLead> {

    return this.http.put<CustomerLead>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  deleteCustomerLead(id: number): Observable<unknown> {
    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }

  searchByName(name: string): Observable<CustomerLead[]> {
    return this.http.get<CustomerLead[]>(
      `${this.apiUrl}/search/name`,
      {
        params: {
          name
        }
      }
    );
  }

  searchByMobile(
    mobile: string
  ): Observable<CustomerLead[]> {

    return this.http.get<CustomerLead[]>(
      `${this.apiUrl}/search/mobile`,
      {
        params: {
          mobile
        }
      }
    );
  }

  searchByCity(city: string): Observable<CustomerLead[]> {
    return this.http.get<CustomerLead[]>(
      `${this.apiUrl}/search/city`,
      {
        params: {
          city
        }
      }
    );
  }

  filterByLeadType(
    leadTypeId: number
  ): Observable<CustomerLead[]> {

    return this.http.get<CustomerLead[]>(
      `${this.apiUrl}/filter/lead-type/${leadTypeId}`
    );
  }

  filterByStatus(
    statusId: number
  ): Observable<CustomerLead[]> {

    return this.http.get<CustomerLead[]>(
      `${this.apiUrl}/filter/status/${statusId}`
    );
  }

  filterByPriority(
    priorityId: number
  ): Observable<CustomerLead[]> {

    return this.http.get<CustomerLead[]>(
      `${this.apiUrl}/filter/priority/${priorityId}`
    );
  }
}