import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Internship } from '../../interfaces/iInternship';
import { InternshipService } from '../internship-list/internship';
import { internship_location } from '../../ENUMs/internship-location';

type UserState = 'guest' | 'loggedIn' | 'matchCalculated';

@Component({
  selector: 'app-internship-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './internship-detail.html',
  styleUrls: ['./internship-detail.css']
})
export class InternshipDetailComponent implements OnInit {

  internship: Internship | undefined;
  companyName = '';
  skills: string[] = [];


 
  userState: UserState = 'guest';

  matchScore = 50;
  matchLabel = 'Skill Gap';
  matchMessage = 'Consider improving your skills to better match this role';
  isCalculating = false;
  roadmapRequested = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private internshipService: InternshipService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.internship = this.internshipService.getById(id);
    if (this.internship) {
      this.companyName = this.internshipService.getCompanyName(this.internship.companyId);
     this.skills = this.internshipService.getSkillNames(this.internship);
    }
  }

  get locationIcon(): string {
  const icons: Record<number, string> = {
    [internship_location.on_site]: '📋',
    [internship_location.remote]: '🏠',
    [internship_location.hyprid]: '🏢',
  };
  return icons[this.internship?.location ?? -1] ?? '📍';
}
get locationLabel(): string {
  return this.internshipService.getLocationLabel(this.internship?.location ?? 0);
}
  goBack(): void {
    this.router.navigate(['/internships']);
  }

  loginToApply(): void {
    // Later: this.router.navigate(['/login'])
    // For now simulate login
    this.userState = 'loggedIn';
  }

  calculateMatch(): void {
    this.isCalculating = true;
    // simulatation only rnn AI 
    setTimeout(() => {
      this.isCalculating = false;
      this.userState = 'matchCalculated';
      // Later replace with real AI score from backend
      this.matchScore = 50;
      this.updateMatchLabel();
    }, 1500);
  }

  updateMatchLabel(): void {
    if (this.matchScore >= 80) {
      this.matchLabel = 'Strong Match';
      this.matchMessage = 'You are a great fit for this role!';
    } else if (this.matchScore >= 50) {
      this.matchLabel = 'Skill Gap';
      this.matchMessage = 'Consider improving your skills to better match this role';
    } else {
      this.matchLabel = 'Low Match';
      this.matchMessage = 'This role may require significant upskilling';
    }
  }

  applyNow(): void {
    // Laterrrrrr connect to backend application API
    alert('Application submitted! (connect to backend)');
  }

  generateRoadmap(): void {
    this.roadmapRequested = true;
    // Latercall AI roadmap API
  }
}