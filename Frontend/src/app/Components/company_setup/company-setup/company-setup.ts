import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-company-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-setup.html',
  styleUrls: ['./company-setup.css']
})
export class CompanySetup {

  private baseUrl = 'http://localhost:5002';
  isSubmitting = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  companyForm = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl(''),
    website: new FormControl(''),
    industry: new FormControl(''),
    location: new FormControl('', Validators.required)
  });

  get headers() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    };
  }
  skipSetup(): void {
    this.router.navigate(['/recruiter-dashboard']);
  }
  saveCompany(): void {
      console.log('Token being sent:', localStorage.getItem('token')); // ← add this

    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.http.post(
      `${this.baseUrl}/company`,
      this.companyForm.value,
      { headers: this.headers }
    ).subscribe({
      next: () => {
        localStorage.setItem('companyCompleted', 'true');
        this.isSubmitting = false;
        this.router.navigate(['/recruiter-dashboard']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Company update failed:', err);
      }
    });
  }
}