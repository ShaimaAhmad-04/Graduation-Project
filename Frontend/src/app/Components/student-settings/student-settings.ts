import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-settings.html',
  styleUrls: ['./student-settings.css']
})
export class StudentSettings {

  activeTab: 'profile' | 'security' | 'notifications' = 'profile';

  // CONNECT TO BACKEND: LOAD REAL USER DATA FROM API
  firstName = 'Sama';
  lastName = 'Al-Otaiby';
  email = 'sama@student.psut.edu.jo';
  phone = '+962791234567';

  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  emailNotifications = true;
  internshipAlerts = true;
  statusUpdates = true;

  successMessage = '';
  errorMessage = '';

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/student-dashboard']);
  }

  saveProfile(): void {
    // CONNECT TO BACKEND: SEND UPDATED PROFILE DATA TO API
    this.successMessage = 'Profile updated successfully!';
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 3000);
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

  saveNotifications(): void {
    // CONNECT TO BACKEND: SAVE NOTIFICATION PREFERENCES TO API
    this.successMessage = 'Preferences saved!';
    setTimeout(() => this.successMessage = '', 3000);
  }
}