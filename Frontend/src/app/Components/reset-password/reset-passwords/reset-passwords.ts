import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-passwords',
  templateUrl: './reset-passwords.html',
  styleUrl: './reset-passwords.css',
  imports: [FormsModule, CommonModule]
})
export class ResetPasswordComponent {

  email = '';
  token = '';
  newPassword = '';
  confirmPassword = '';

  message = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      this.token = params['token'];
    });
  }

  onResetPassword() {
    this.message = '';
    this.errorMessage = '';

    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'All fields are required';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;

    this.authService.resetPassword(
      this.email,
      this.token,
      this.newPassword
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.message = 'Password reset successful 🎉';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message || 'Reset failed or token expired';
      }
    });
  }
}