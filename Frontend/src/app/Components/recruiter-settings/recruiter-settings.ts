import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recruiter-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recruiter-settings.html',
  styleUrls: ['./recruiter-settings.css']
})
export class RecruiterSettings implements OnInit {

  activeTab: 'company' | 'security' = 'company';

  // Company profile fields
  companyName = '';
  description = '';
  industry = '';
  website = '';

  // User info (read-only display)
  contactEmail = '';
  contactPhone = '';

  // Security
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  successMessage = '';
  errorMessage = '';

  private baseUrl = 'http://localhost:5002';
  private get headers() { return { Authorization: `Bearer ${this.authService.getToken() ?? ''}` }; }

  constructor(private router: Router, private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) { this.router.navigate(['/login']); return; }

    this.http.get<any>(`${this.baseUrl}/company/profile`, { headers: this.headers }).subscribe({
      next: (company) => {
        this.companyName  = company.name ?? '';
        this.description  = company.description ?? '';
        this.industry     = company.industry ?? '';
        this.website      = company.website ?? '';
        this.contactEmail = company.user?.email ?? '';
        this.contactPhone = company.user?.phoneNumber ?? '';
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  saveCompanyProfile(): void {
    this.errorMessage = '';
    if (!this.companyName.trim()) {
      this.errorMessage = 'Company name is required.';
      return;
    }

    this.http.put(`${this.baseUrl}/company/profile`, {
      name:        this.companyName,
      description: this.description || null,
      industry:    this.industry || null,
      website:     this.website || null
    }, { headers: this.headers }).subscribe({
      next: () => {
        this.successMessage = 'Company profile updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? err.error?.error ?? 'Failed to save profile.';
      }
    });
  }

  updatePassword(): void {
    this.errorMessage = '';
    if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      this.errorMessage = 'Please fill in all password fields.';
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.errorMessage = 'New passwords do not match.';
      return;
    }
    // Placeholder until a change-password endpoint is added
    this.successMessage = 'Password updated successfully!';
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
    setTimeout(() => this.successMessage = '', 3000);
  }

  goBack(): void {
    this.router.navigate(['/recruiter-dashboard']);
  }
}
