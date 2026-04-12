import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboard {

  // CONNECT TO BACKEND: REPLACE WITH REAL LOGGED-IN STUDENT DATA FROM API
  student = {
    firstName: 'Sama',
    lastName: 'Al-Otaiby',
    email: 'sama@student.psut.edu.jo',
    phone: '+962791234567',
    university: 'Princess Sumaya University for Technology',
    gpa: '3.8/4.0',
    major: 'Computer Science',
    skills: ['React', 'Node.js', 'JavaScript', 'TypeScript'],
    profileCompletion: 85
  };

  // CONNECT TO BACKEND: REPLACE WITH REAL APPLICATIONS FROM API
  applications = [
    {
      id: 1,
      title: 'Full Stack Developer Intern',
      company: 'TechCorp Solutions',
      appliedDate: new Date('2026-01-20'),
      status: 'accepted',
      matchScore: 92
    }
  ];

  activeTab: 'overview' | 'applications' = 'overview';

  constructor(private router: Router) {}

  get totalApplications(): number { return this.applications.length; }
  get pendingCount(): number { return this.applications.filter(a => a.status === 'pending').length; }
  get acceptedCount(): number { return this.applications.filter(a => a.status === 'accepted').length; }
  get rejectedCount(): number { return this.applications.filter(a => a.status === 'rejected').length; }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      accepted: 'badge--accepted',
      pending: 'badge--pending',
      rejected: 'badge--rejected'
    };
    return map[status] ?? '';
  }

  goToInternships(): void { this.router.navigate(['/internships']); }
  goToSettings(): void { this.router.navigate(['/student-settings']); }
  goToProfileSetup(): void { this.router.navigate(['/profile-setup']); }

  // CONNECT TO BACKEND: LOGOUT SHOULD CLEAR AUTH TOKEN AND SESSION
  logout(): void { this.router.navigate(['/homepage']); }
}