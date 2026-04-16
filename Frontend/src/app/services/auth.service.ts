import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = 'http://localhost:5002';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password });
  }

  register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    role: number;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  getMe(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getStudentProfile(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/student/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}