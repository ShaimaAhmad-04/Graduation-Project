import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  successMessage = ''


  private baseUrl = 'http://localhost:5002';
  private get headers() { return { Authorization: `Bearer ${this.authService.getToken() ?? ''}` }; }


  constructor(private router: Router, private authService: AuthService, private http: HttpClient) { }

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }
    this.isLoading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.authService.getMe(res.token).subscribe({
          next: (user) => {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', user.firstName);
            localStorage.setItem('userRole', user.role.toString());
            localStorage.setItem('userId', user.id.toString());
            localStorage.setItem('companyCompleted', res.companyCompleted);

            if (user.role === 0) {
              this.authService.getStudentProfile(res.token).subscribe({
                next: (profile) => {
                  this.isLoading = false;
                  if (!profile.university) {
                    this.router.navigate(['/profile-setup']);
                  } else {
                    this.router.navigate(['/student-dashboard']);
                  }
                },
                error: () => {
                  this.isLoading = false;
                  this.router.navigate(['/profile-setup']);
                }
              });

              // ✅ REPLACE YOUR OLD else if (user.role === 1) BLOCK WITH THIS
            } else if (user.role === 1) {
              this.isLoading = false;

              if (!res.companyCompleted) {
                this.router.navigate(['/company-setup']);
              } else {
                this.authService.getCompanyProfile(res.token).subscribe({
                  next: (company) => {
                    if (company?.name) localStorage.setItem('userName', company.name);
                  },
                  error: () => { }
                });
                this.router.navigate(['/recruiter-dashboard']);
              }

            } else {
              this.isLoading = false;
              this.router.navigate(['/admin-dashboard']);
            }
          },
          error: () => {
            this.isLoading = false;
            this.errorMessage = 'Login failed. Please try again.';
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message ?? 'Login failed. Please try again.';
      }
    });
  }
  goToSignup(): void {
    this.router.navigate(['/signup']);
  }


  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}