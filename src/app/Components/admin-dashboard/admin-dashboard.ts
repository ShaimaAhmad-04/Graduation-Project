import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Company {
  id: number;
  name: string;
  industry: string;
  description: string;
  email: string;
  website: string;
  location: string;
  isVerified: boolean;
}

@Component({
  selector: 'admin-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard {

  // TODO (Backend): Inject AdminService, CompanyService
  // constructor(private companyService: CompanyService) {}

  activeTab: 'overview' | 'companies' = 'overview';
  companyFilter: 'all' | 'verified' | 'unverified' = 'all';
  searchQuery: string = '';

  // TODO (Backend): Load from GET /api/companies
  companies: Company[] = [
    {
      id: 1,
      name: 'TechCorp Solutions',
      industry: 'Information Technology',
      description: 'Leading technology solutions provider in the MENA region',
      email: 'hr@techcorp.com',
      website: 'https://techcorp.com',
      location: 'Amman, Jordan',
      isVerified: true,
    },
    {
      id: 2,
      name: 'Innovate Jordan',
      industry: 'Technology & Innovation',
      description: 'Startup accelerator and innovation hub',
      email: 'careers@innovate.jo',
      website: 'https://innovate.jo',
      location: 'Amman, Jordan',
      isVerified: true,
    },
    {
      id: 3,
      name: 'DataTech Analytics',
      industry: 'Data Science',
      description: 'Data science and analytics company',
      email: 'jobs@datatech.com',
      website: 'https://datatech.com',
      location: 'Amman, Jordan',
      isVerified: false,
    },
    {
      id: 4,
      name: 'CyberGuard Security',
      industry: 'Cybersecurity',
      description: 'Leading cybersecurity firm protecting businesses across the Middle East',
      email: 'hr@cyberguard.jo',
      website: 'https://cyberguard.jo',
      location: 'Amman, Jordan',
      isVerified: false,
    },
    {
      id: 5,
      name: 'CloudNine Technologies',
      industry: 'Cloud Services',
      description: 'Cloud computing and infrastructure solutions provider',
      email: 'careers@cloudnine.com',
      website: 'https://cloudnine.com',
      location: 'Dubai, UAE',
      isVerified: false,
    },
    {
      id: 6,
      name: 'NexaCode Labs',
      industry: 'Software Development',
      description: 'Custom software development and digital transformation agency',
      email: 'hello@nexacode.io',
      website: 'https://nexacode.io',
      location: 'Amman, Jordan',
      isVerified: false,
    },
    {
      id: 7,
      name: 'GreenTech Jordan',
      industry: 'Clean Energy',
      description: 'Renewable energy solutions and sustainability consulting',
      email: 'info@greentech.jo',
      website: 'https://greentech.jo',
      location: 'Aqaba, Jordan',
      isVerified: false,
    },
    {
      id: 8,
      name: 'FinWave Solutions',
      industry: 'FinTech',
      description: 'Digital banking and financial technology services for the Arab world',
      email: 'careers@finwave.com',
      website: 'https://finwave.com',
      location: 'Amman, Jordan',
      isVerified: false,
    },
    {
      id: 9,
      name: 'MedConnect',
      industry: 'HealthTech',
      description: 'Connecting patients with healthcare providers through digital platforms',
      email: 'hr@medconnect.jo',
      website: 'https://medconnect.jo',
      location: 'Amman, Jordan',
      isVerified: false,
    },
    {
      id: 10,
      name: 'LogiTrack',
      industry: 'Logistics & Supply Chain',
      description: 'Smart logistics and fleet management solutions across the MENA region',
      email: 'jobs@logitrack.com',
      website: 'https://logitrack.com',
      location: 'Zarqa, Jordan',
      isVerified: false,
    },
  ];

  // ── Computed counts ─────────────────────────────────────────────────────────
  // TODO (Backend): Replace with GET /api/companies/stats
  get totalCompanies(): number {
    return this.companies.length;
  }

  get verifiedCount(): number {
    return this.companies.filter(c => c.isVerified).length;
  }

  get unverifiedCount(): number {
    return this.companies.filter(c => !c.isVerified).length;
  }

  get unverifiedCompanies(): Company[] {
    return this.companies.filter(c => !c.isVerified);
  }

  get filteredCompanies(): Company[] {
    let list = this.companies;

    if (this.companyFilter === 'verified')   list = list.filter(c => c.isVerified);
    if (this.companyFilter === 'unverified') list = list.filter(c => !c.isVerified);

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q)
      );
    }

    return list;
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  setTab(tab: 'overview' | 'companies'): void {
    this.activeTab = tab;
  }

  setFilter(filter: 'all' | 'verified' | 'unverified'): void {
    this.companyFilter = filter;
  }

  // TODO (Backend): PUT /api/companies/{id}/verify
  // this.companyService.verify(id).subscribe(() => { company.isVerified = true; });
  verifyCompany(company: Company): void {
    company.isVerified = true;
  }

  // TODO (Backend): PUT /api/companies/verify-all  (bulk verify unverified)
  goToUnverified(): void {
    this.activeTab = 'companies';
    this.companyFilter = 'unverified';
    this.searchQuery = '';
  }

  verifyAll(): void {
    this.companies.filter(c => !c.isVerified).forEach(c => c.isVerified = true);
  }

  getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
