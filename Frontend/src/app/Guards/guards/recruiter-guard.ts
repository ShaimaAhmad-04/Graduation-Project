import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

// recruiter-guard.ts — protects dashboard, not setup page
@Injectable({ providedIn: 'root' })
export class RecruiterGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(): boolean {
    const role = localStorage.getItem('role');
    const companyCompleted = localStorage.getItem('companyCompleted');

    if (role === '1' && companyCompleted !== 'true') {
      // They haven't finished setup — send them there
      this.router.navigate(['/company-setup']);
      return false;
    }

    return true;
  }
}