import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
  imports: [FormsModule, CommonModule]
})
export class ForgotPasswordComponent {

  email = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private authService: AuthService,private router: Router) {}

  onForgotPassword() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email) {
      this.errorMessage = 'Email is required';
      return;
    }

    this.isLoading = true;

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'If this email exists, a reset link has been sent.';
      },

      error: (err) => {
        this.isLoading = false;

        // better error handling if backend sends message
        this.errorMessage =
          err?.error?.message || 'Something went wrong. Please try again later.';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login'])
  }
}