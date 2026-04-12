import { Component, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('InternPath');

  isLoggedIn = false;
  userName = 'Sama';
  userInitial = 'S';
  dropdownOpen = false;

  constructor(private router: Router) {
    this.checkAuth();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // CONNECT TO BACKEND: REPLACE WITH REAL AUTH SERVICE
        this.checkAuth();
        this.dropdownOpen = false;
      }
    });
  }

  checkAuth(): void {
    const stored = localStorage.getItem('isLoggedIn');
    this.isLoggedIn = stored === 'true';
    if (this.isLoggedIn) {
      this.userName = localStorage.getItem('userName') ?? 'User';
      this.userInitial = this.userName[0].toUpperCase();
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.navbar__dropdown-wrapper')) {
      this.dropdownOpen = false;
    }
  }

  logout(): void {
    // CONNECT TO BACKEND: CLEAR AUTH TOKEN AND SESSION
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    this.isLoggedIn = false;
    this.dropdownOpen = false;
    this.router.navigate(['/homepage']);
  }
}