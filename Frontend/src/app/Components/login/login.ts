import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
isLoggedIn = false;
  email = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router) {}

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }
    // CONNECT TO BACKEND: VERIFY CREDENTIALS VIA AUTH API
    // CONNECT TO BACKEND: IF NEW USER NAVIGATE TO PROFILE-SETUP, IF EXISTING NAVIGATE TO STUDENT-DASHBOARD
    this.errorMessage = 'Invalid credentials. (connect to backend)';
  }

loginAsStudent(): void {
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('userName', 'Sama');
  this.router.navigate(['/homepage']);
}

  loginAsRecruiter(): void {
    // CONNECT TO BACKEND: AUTO-LOGIN WITH RECRUITER DEMO ACCOUNT TOKEN
    this.router.navigate(['/recruiter-dashboard']);
  }

  loginAsAdmin(): void {
    // CONNECT TO BACKEND: AUTO-LOGIN WITH ADMIN DEMO ACCOUNT TOKEN
    this.router.navigate(['/admin-dashboard']);
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }
}