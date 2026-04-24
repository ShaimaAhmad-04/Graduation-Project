import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-settings.html',
  styleUrls: ['./student-settings.css']
})
export class StudentSettings implements OnInit {

  activeTab: 'profile' | 'security' = 'profile';

  firstName = '';
  lastName = '';
  email = '';
  phone = '';

  // Student profile fields
  university = '';
  experience = '';
  gpa: number | null = null;
  graduationYear: number | null = null;
  linkedinUrl = '';
  githubUrl = '';

  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';

mySkills: { skillId: number; name: string }[] = [];
  allSkills: { id: number; name: string }[] = [];
  filteredSkills: { id: number; name: string }[] = [];
  skillSearch = '';
  showDropdown = false;

  successMessage = '';
  errorMessage = '';

  private baseUrl = 'http://localhost:5002';
  private get headers() { return { Authorization: `Bearer ${this.authService.getToken() ?? ''}` }; }

  constructor(private router: Router, private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) { this.router.navigate(['/login']); return; }

    this.authService.getMe(token).subscribe({
      next: (user) => {
        this.firstName = user.firstName;
        this.lastName  = user.lastName ?? '';
        this.email     = user.email;
        this.phone     = user.phoneNumber;
      },
      error: () => this.router.navigate(['/login'])
    });

    // Load student academic profile
    this.http.get<any>(`${this.baseUrl}/student/profile`, { headers: this.headers }).subscribe({
      next: (profile) => {
        this.university     = profile.university ?? '';
        this.experience     = profile.experience ?? '';
        this.gpa            = profile.gpa ?? null;
        this.graduationYear = profile.graduationYear
          ? new Date(profile.graduationYear).getFullYear()
          : null;
        this.linkedinUrl    = profile.linkedinUrl ?? '';
        this.githubUrl      = profile.githubUrl ?? '';
      }
    });

    // Load student's current skills
    this.http.get<any[]>(`${this.baseUrl}/student/skills`, { headers: this.headers }).subscribe({
      next: (skills) => {
        this.mySkills = skills.map(s => ({ skillId: s.skillId, name: s.skill.name }));
      }
    });

    // Load all available skills for search
    this.http.get<any[]>(`${this.baseUrl}/skills`).subscribe({
      next: (skills) => { this.allSkills = skills; }
    });
  }

  onSkillSearch(): void {
    const q = this.skillSearch.toLowerCase().trim();
    if (!q) { this.filteredSkills = []; this.showDropdown = false; return; }
    this.filteredSkills = this.allSkills.filter(s =>
      s.name.toLowerCase().includes(q) && !this.mySkills.find(ms => ms.skillId === s.id)
    );
    this.showDropdown = true;
  }

  addSkill(skill: { id: number; name: string }): void {
    this.http.post<any>(`${this.baseUrl}/student/skills`,
      { skillId: skill.id, experience: 0 },
      { headers: this.headers }
    ).subscribe({
      next: () => {
        this.mySkills.push({ skillId: skill.id, name: skill.name });
        this.skillSearch = '';
        this.filteredSkills = [];
        this.showDropdown = false;
      },
      error: (err) => { this.errorMessage = err.error?.message ?? 'Failed to add skill'; }
    });
  }

  removeSkill(skillId: number): void {
    this.http.delete(`${this.baseUrl}/student/skills/${skillId}`, { headers: this.headers }).subscribe({
      next: () => { this.mySkills = this.mySkills.filter(s => s.skillId !== skillId); },
      error: (err) => { this.errorMessage = err.error?.message ?? 'Failed to remove skill'; }
    });
  }

  goBack(): void {
    this.router.navigate(['/student-dashboard']);
  }

  saveProfile(): void {
    this.errorMessage = '';
    const gpaVal = this.gpa !== null && this.gpa !== undefined && this.gpa !== ('' as any)
      ? parseFloat(this.gpa as any) : null;
    const yearVal = this.graduationYear !== null && this.graduationYear !== undefined && this.graduationYear !== ('' as any)
      ? parseInt(this.graduationYear as any, 10) : null;

    const graduationDate = (!isNaN(yearVal as any) && yearVal)
      ? new Date(yearVal, 0, 1).toISOString()
      : null;

    this.http.put(`${this.baseUrl}/student/profile`, {
      university:     this.university || null,
      experience:     this.experience || null,
      gpa:            isNaN(gpaVal as any) ? null : gpaVal,
      graduationYear: graduationDate,
      linkedinUrl:    this.linkedinUrl || null,
      githubUrl:      this.githubUrl || null
    }, { headers: this.headers }).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? err.error?.error ?? 'Failed to save profile.';
      }
    });
  }

  updatePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      this.errorMessage = 'Please fill in all password fields.';
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.errorMessage = 'New passwords do not match.';
      return;
    }
    // CONNECT TO BACKEND: SEND PASSWORD CHANGE REQUEST TO API
    this.successMessage = 'Password updated successfully!';
    this.errorMessage = '';
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
    setTimeout(() => this.successMessage = '', 3000);
  }

  deleteAccount(): void {
    const confirmed = confirm('Are you sure you want to delete your account? This cannot be undone.');
    if (confirmed) {
      // CONNECT TO BACKEND: SEND DELETE ACCOUNT REQUEST TO API
      this.router.navigate(['/homepage']);
    }
  }

}