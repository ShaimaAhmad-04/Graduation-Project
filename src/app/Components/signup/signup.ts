import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {

  selectedRole: 'student' | 'recruiter' = 'student';
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(private router: Router) {}

  selectRole(role: 'student' | 'recruiter'): void {
    this.selectedRole = role;
    this.errorMessage = '';
  }

  onCreateAccount(): void {
    if (!this.firstName || !this.lastName || !this.email || !this.phone || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    // CONNECT TO BACKEND: SEND REGISTRATION DATA TO API
    // CONNECT TO BACKEND: IF STUDENT NAVIGATE TO PROFILE-SETUP, IF RECRUITER NAVIGATE TO RECRUITER-DASHBOARD
    if (this.selectedRole === 'student') {
      this.router.navigate(['/profile-setup']);
    } else {
      this.router.navigate(['/recruiter-dashboard']);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}