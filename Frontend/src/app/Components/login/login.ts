import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  constructor(private router: Router, private authService: AuthService) {}

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }
    this.isLoading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        // Get user info after login
        this.authService.getMe(res.token).subscribe({
          next: (user) => {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', user.firstName);
            localStorage.setItem('userRole', user.role.toString());
            localStorage.setItem('userId', user.id.toString());
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
            } else if (user.role === 1) {
              this.isLoading = false;
              this.router.navigate(['/recruiter-dashboard']);
            } else {
              this.isLoading = false;
              this.router.navigate(['/homepage']);
            }
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
}