import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest } from '../models/login-request';
import { SignupRequest } from '../models/signup-request';
import { AuthResponse } from '../models/auth-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl =
  `${environment.apiUrl}/api/auth`;

  constructor(private readonly http: HttpClient) {
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      request
    );
  }

  signup(request: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/signup`,
      request
    );
  }

  saveLoggedInUser(response: AuthResponse): void {
    localStorage.setItem(
      'leadhelpUser',
      JSON.stringify(response)
    );
  }

  getLoggedInUser(): AuthResponse | null {
    const userData = localStorage.getItem('leadhelpUser');

    if (!userData) {
      return null;
    }

    try {
      return JSON.parse(userData) as AuthResponse;
    } catch {
      localStorage.removeItem('leadhelpUser');
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.getLoggedInUser()?.success === true;
  }

  logout(): void {
    localStorage.removeItem('leadhelpUser');
  }
}