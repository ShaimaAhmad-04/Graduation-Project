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

  constructor(private router: Router, private authService: AuthService) { }

  selectRole(role: 'student' | 'recruiter'): void {
    this.selectedRole = role;
    this.errorMessage = '';
  }

  onCreateAccount(): void {

    // Remove old errors
    this.errorMessage = '';

    // Check empty fields
    if (
      !this.firstName ||
      !this.lastName ||
      !this.email ||
      !this.phone ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    // Phone validation
    // Allows numbers only, 9–15 digits
    const phoneRegex = /^[0-9]{9,15}$/;

    if (!phoneRegex.test(this.phone)) {
      this.errorMessage = 'Please enter a valid phone number.';
      return;
    }

    // Password validation
    // Minimum 8 chars, uppercase, lowercase, number
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(this.password)) {
      this.errorMessage =
        'Password must be at least 8 characters and include uppercase, lowercase, and a number.';
      return;
    }

    // Confirm password
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

        // Save auth data
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', String(res.user.id));
        localStorage.setItem('userRole', String(res.user.role));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', res.user.firstName);
        // Recruiter
        if (this.selectedRole === 'recruiter') {

          this.router.navigate(['/company-setup']);

        } else {

          this.router.navigate(['/profile-setup']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.message ?? 'Registration failed. Please try again.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}