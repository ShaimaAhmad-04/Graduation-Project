import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboard implements OnInit {

  private baseUrl = 'http://localhost:5002';

  student = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    university: '',
    gpa: '',
    major: '',
    skills: [] as string[],
    profileCompletion: 0
  };

  applications: {
    id: number;
    title: string;
    company: string;
    appliedDate: Date;
    status: string;
    matchScore: number;
  }[] = [];

  activeTab: 'overview' | 'applications' = 'overview';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<any>(`${this.baseUrl}/student/profile`, { headers }).subscribe({
      next: (profile) => {
        this.student = {
          firstName: profile.user.firstName,
          lastName: profile.user.lastName ?? '',
          email: profile.user.email,
          phone: profile.user.phoneNumber,
          university: profile.university ?? '',
          gpa: profile.gpa ? String(profile.gpa) : '',
          major: profile.major ? String(profile.major) : '',
          skills: this.student.skills,
          profileCompletion: this.calcCompletion(profile)
        };
      },
      error: () => this.router.navigate(['/login'])
    });

    this.http.get<any[]>(`${this.baseUrl}/student/applications`, { headers }).subscribe({
      next: (apps) => {
        const statusMap: Record<number, string> = { 0: 'pending', 1: 'accepted', 2: 'rejected' };
        this.applications = apps.map(a => ({
          id: a.id,
          title: a.internship.title,
          company: '',
          appliedDate: new Date(),
          status: statusMap[a.status] ?? 'pending',
          matchScore: 0
        }));
      }
    });

    this.http.get<any[]>(`${this.baseUrl}/student/skills`, { headers }).subscribe({
      next: (skills) => {
        this.student.skills = skills.map(s => s.skill.name);
      }
    });
  }

  private calcCompletion(profile: any): number {
    const fields = ['university', 'major', 'gpa', 'graduationYear', 'linkedinUrl', 'githubUrl', 'cvUrl', 'experience'];
    const filled = fields.filter(f => profile[f] != null && profile[f] !== '').length;
    return Math.round((filled / fields.length) * 100);
  }

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

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    this.router.navigate(['/homepage']);
  }
}
