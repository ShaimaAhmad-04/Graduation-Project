import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Internship } from '../../interfaces/iInternship';
import { InternshipService } from '../internship-list/internship';
import { internship_location } from '../../ENUMs/internship-location';
import { AuthService } from '../../services/auth.service';

type UserState = 'guest' | 'loggedIn' | 'matchCalculated' | 'applied';

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

  isApplying = false;
  applyError = '';

  // AI Roadmap
  roadmapData: { summary: string; steps: { title: string; description: string; duration: string; resources: string[] }[] } | null = null;
  isGeneratingRoadmap = false;
  roadmapError = '';

  private baseUrl = 'http://localhost:5002';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private internshipService: InternshipService,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (this.authService.isLoggedIn()) {
      this.userState = 'loggedIn';
      // Check if student already applied
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      if (role === '0' && token) {
        this.http.get<any[]>(`${this.baseUrl}/student/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
          next: (apps) => {
            if (apps.some(a => a.internshipId === id)) {
              this.userState = 'applied';
            }
          }
        });
      }
    }

    const cached = this.internshipService.getById(id);
    if (cached) {
      this.internship = cached;
      this.skills = this.internshipService.getSkillNames(cached);
    } else {
      this.internshipService.fetchById(id).subscribe({
        next: (internship) => {
          this.internship = internship;
          this.skills = this.internshipService.getSkillNames(internship);
        },
        error: () => this.router.navigate(['/internships'])
      });
    }
  }

  get locationIcon(): string {
    const icons: Record<number, string> = {
      [internship_location.on_site]: '📋',
      [internship_location.remote]: '🏠',
      [internship_location.hybrid]: '🏢',
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
    this.router.navigate(['/login']);
  }

  calculateMatch(): void {
    if (!this.internship) return;
    this.isCalculating = true;
    const token = localStorage.getItem('token');

    this.http.get<any[]>(`${this.baseUrl}/student/skills`, {
      headers: { Authorization: `Bearer ${token ?? ''}` }
    }).subscribe({
      next: (studentSkills) => {
        const studentSkillIds = new Set(studentSkills.map(s => s.skillId));
        const requiredSkillIds = this.internship!.skills.map(s => s.skillId);

        if (requiredSkillIds.length === 0) {
          this.matchScore = 100;
        } else {
          const matched = requiredSkillIds.filter(id => studentSkillIds.has(id)).length;
          this.matchScore = Math.round((matched / requiredSkillIds.length) * 100);
        }

        this.isCalculating = false;
        this.userState = 'matchCalculated';
        this.updateMatchLabel();
      },
      error: () => {
        this.isCalculating = false;
        this.matchScore = 0;
        this.userState = 'matchCalculated';
        this.updateMatchLabel();
      }
    });
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
    const token = localStorage.getItem('token');
    if (!token || !this.internship) return;

    this.isApplying = true;
    this.applyError = '';

    this.http.post<any>(`${this.baseUrl}/student/applications`,
      { internshipId: this.internship.id },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.isApplying = false;
        this.userState = 'applied';
      },
      error: (err) => {
        this.isApplying = false;
        this.applyError = err.error?.message ?? err.error?.error ?? `Error ${err.status}: Failed to apply. Please try again.`;
      }
    });
  }

  generateRoadmap(): void {
    if (!this.internship) return;
    this.isGeneratingRoadmap = true;
    this.roadmapError = '';
    const token = localStorage.getItem('token');

    this.http.post<any>(
      `${this.baseUrl}/student/roadmaps/ai`,
      { desiredPosition: this.internship.title },
      { headers: { Authorization: `Bearer ${token ?? ''}` } }
    ).subscribe({
      next: (res) => {
        this.isGeneratingRoadmap = false;
        this.roadmapRequested = true;
        // Store it so the dashboard can pick it up
        localStorage.setItem('pendingRoadmap', JSON.stringify({
          desiredPosition: this.internship!.title,
          roadmap: res.roadmap
        }));
        this.router.navigate(['/student-dashboard'], { queryParams: { tab: 'roadmap' } });
      },
      error: (err) => {
        this.roadmapError = err.error?.message ?? err.error?.error ?? 'Failed to generate roadmap.';
        this.isGeneratingRoadmap = false;
      }
    });
  }
}