import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
  isLoading = false;

  constructor(private router: Router, private authService: AuthService) {}

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

    this.isLoading = true;
    const roleNumber = this.selectedRole === 'student' ? 0 : 1;

    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      phoneNumber: this.phone,
      role: roleNumber
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        // After register, navigate to login
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message ?? 'Registration failed. Please try again.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}