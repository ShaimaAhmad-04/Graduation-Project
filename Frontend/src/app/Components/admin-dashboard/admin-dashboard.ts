import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export interface Company {
  id: number;
  name: string;
  industry: string | null;
  description: string | null;
  email: string;
  website: string | null;
  isVerified: boolean;
}

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: number;
}

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {

  activeTab: 'overview' | 'companies' | 'users' = 'overview';
  companyFilter: 'all' | 'verified' | 'unverified' = 'all';
  searchQuery = '';
  userSearchQuery = '';

  companies: Company[] = [];
  users: AdminUser[] = [];

  totalStudents = 0;
  totalInternships = 0;
  totalApplications = 0;

  private baseUrl = 'http://localhost:5002';
  private get headers() { return { Authorization: `Bearer ${this.authService.getToken() ?? ''}` }; }

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) { this.router.navigate(['/login']); return; }

    this.loadStats();
    this.loadCompanies();
    this.loadUsers();
  }

  private loadStats(): void {
    this.http.get<any>(`${this.baseUrl}/admin/stats`, { headers: this.headers }).subscribe({
      next: (stats) => {
        this.totalStudents     = stats.totalStudents;
        this.totalInternships  = stats.totalInternships;
        this.totalApplications = stats.totalApplications;
      }
    });
  }

  private loadCompanies(): void {
    this.http.get<any[]>(`${this.baseUrl}/admin/companies`, { headers: this.headers }).subscribe({
      next: (data) => {
        this.companies = data.map(c => ({
          id:          c.userId,
          name:        c.name,
          industry:    c.industry ?? null,
          description: c.description ?? null,
          email:       c.user?.email ?? '',
          website:     c.website ?? null,
          isVerified:  c.verified
        }));
      }
    });
  }

  private loadUsers(): void {
    this.http.get<AdminUser[]>(`${this.baseUrl}/admin/users`, { headers: this.headers }).subscribe({
      next: (data) => { this.users = data; }
    });
  }

  get totalCompanies(): number  { return this.companies.length; }
  get verifiedCount(): number   { return this.companies.filter(c =>  c.isVerified).length; }
  get unverifiedCount(): number { return this.companies.filter(c => !c.isVerified).length; }
  get unverifiedCompanies(): Company[] { return this.companies.filter(c => !c.isVerified); }

  get filteredCompanies(): Company[] {
    let list = this.companies;
    if (this.companyFilter === 'verified')   list = list.filter(c =>  c.isVerified);
    if (this.companyFilter === 'unverified') list = list.filter(c => !c.isVerified);
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.industry ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }

  get filteredUsers(): AdminUser[] {
    if (!this.userSearchQuery.trim()) return this.users;
    const q = this.userSearchQuery.toLowerCase();
    return this.users.filter(u =>
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }

  roleName(role: number): string {
    if (role === 0) return 'Student';
    if (role === 1) return 'Recruiter';
    if (role === 2) return 'Admin';
    return 'Unknown';
  }

  setTab(tab: 'overview' | 'companies' | 'users'): void { this.activeTab = tab; }
  setFilter(filter: 'all' | 'verified' | 'unverified'): void { this.companyFilter = filter; }

  verifyCompany(company: Company): void {
    this.http.put(`${this.baseUrl}/admin/companies/${company.id}/verify`, {}, { headers: this.headers }).subscribe({
      next: () => { company.isVerified = true; }
    });
  }

  goToUnverified(): void {
    this.activeTab = 'companies';
    this.companyFilter = 'unverified';
    this.searchQuery = '';
  }

  deleteUser(user: AdminUser): void {
    const confirmed = confirm(`Delete user ${user.firstName} ${user.lastName}? This cannot be undone.`);
    if (!confirmed) return;
    this.http.delete(`${this.baseUrl}/admin/users/${user.id}`, { headers: this.headers }).subscribe({
      next: () => { this.users = this.users.filter(u => u.id !== user.id); }
    });
  }

  getInitial(name: string): string { return name.charAt(0).toUpperCase(); }
}
