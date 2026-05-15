import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Internship } from '../../interfaces/iInternship';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';
import { Application } from '../../interfaces/iapplication';
import { skill } from '../../interfaces/iskill';
import { Student } from '../../interfaces/istudent';
import { Status } from '../../ENUMs/applicationStatus';
import { NgxPaginationModule } from 'ngx-pagination';
import { internship_location } from '../../ENUMs/internship-location';
import { InternshipSkill } from '../../interfaces/internshipSkill';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Majors } from '../../ENUMs/Majors';
import { MajorsLabels } from '../../ENUMs/MappedMajors';
import { SkillSelectionService } from '../../services/skill-selection-service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import * as bootstrap from 'bootstrap'


@Component({
  selector: 'recruiter-dashboard',
  imports: [CommonModule, NgxPaginationModule, ReactiveFormsModule, DatePipe, FormsModule],
  templateUrl: './recruiter-dashboard.html',
  styleUrls: ['./recruiter-dashboard.css'],
})
export class RecruiterDashboard implements OnInit, OnDestroy {

  private baseUrl = 'http://localhost:5002';
  private destroy$ = new Subject<void>();

  public majorLabels = MajorsLabels;
  public majors = Majors;
  minDate: string = new Date().toISOString().split('T')[0];
  private get token(): string { return localStorage.getItem('token') ?? ''; }
  private get headers() { return { Authorization: `Bearer ${this.token}` }; }

  /** Debounce stream for the skill search input */
  searchSubject = new Subject<string>();

  private locationToString: Record<number, string> = {
    [internship_location.on_site]: 'Onsite',  // was 'On_site'
    [internship_location.remote]: 'Remote',
    [internship_location.hybrid]: 'Hybrid',
  };

  // ── View refs ────────────────────────────────────────────────────────────────
  @ViewChild('postInternshipModal') postInternshipModal!: ElementRef;
  @ViewChild('skillsInput') skillsinput!: ElementRef;
  @ViewChild('applicationModalButton') ApplicationModalButton!: ElementRef;
  @ViewChild('modalCloseBtn') modalCloseBtn!: ElementRef;


  // ── Component state ──────────────────────────────────────────────────────────
  companyName: string = 'InternPath';
  dashboardStats = { activeInternships: 0, totalApplicants: 0, pendingReviews: 0, totalAccepted: 0 };
  closingSoonList: { title: string; submissionDeadline: string; applicantsCount: number }[] = [];
  topMatchingList: { applicantName: string; major: number | null; matchingScore: number }[] = [];
  internshipStatsMap: Record<number, { totalApplications: number; pending: number; accepted: number; rejected: number }> = {};
  matchScoreMap: Record<number, number> = {};

  paginationConfig = { itemsPerPage: 7, currentPage: 1 };
  breadcrumpSectionName: string = 'overview';
  applicants: any;
  applicationModalStudent: Student | undefined;
  applicationModalApplication: Application | undefined;
  applicationStatus = Status;
  locationOptions = Object.entries(internship_location);
  companyStatus: 'verified' | 'pending' | 'unverified' = 'pending';

  // ── Skill UI state (driven by SkillSelectionService) ─────────────────────────
  /** Live search results shown in the dropdown */
  searchSkills: skill[] = [];
  /** Currently selected skills for the modal form */
  pendingSkills: InternshipSkill[] = [];
  searchQuery: string = '';
  skillsTouched: boolean = false;

  // ── Edit state ───────────────────────────────────────────────────────────────
  isEditing: boolean = false;
  editingId: number | null = null;

  // ── Data collections ─────────────────────────────────────────────────────────
  students: Student[] = [];
  internships: Internship[] = [];
  applications: Application[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private skillSelectionService: SkillSelectionService
  ) { }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  ngOnInit(): void {


    // ── Wire up skill service observables ─────────────────────────────────────
    this.skillSelectionService.loadAllSkills();

    this.skillSelectionService.searchResults$
      .pipe(takeUntil(this.destroy$))
      .subscribe(results => { this.searchSkills = results; });

    this.skillSelectionService.selectedSkills$
      .pipe(takeUntil(this.destroy$))
      .subscribe(selected => { this.pendingSkills = selected; });

    // ── Debounced search input ─────────────────────────────────────────────────
    this.searchSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(query => { this.skillSelectionService.search(query); });

    // ── HTTP data loads ────────────────────────────────────────────────────────
    const myId = parseInt(localStorage.getItem('userId') ?? '0');

    this.http.get<any>(`${this.baseUrl}/company/profile`, { headers: this.headers }).subscribe({
      next: company => {
        this.companyName = company.name;
        this.companyStatus = company.status;
      },
      error: () => { }
    });

    this.http.get<any>(`${this.baseUrl}/company/dashboard`, { headers: this.headers })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: stats => {
          this.dashboardStats = stats;

          this.activeInternshipsCount = stats.activeInternships;
          this.totalApplicantsCount = stats.totalApplicants;
          this.totalPendingCount = stats.pendingReviews;
          this.totalAcceptedCount = stats.totalAccepted;
        }
      });

    this.http.get<any[]>(`${this.baseUrl}/company/applications`, { headers: this.headers }).subscribe({
      next: data => {
        data.forEach(a => { this.matchScoreMap[a.applicationId] = a.matchingScore; });
      }
    });

    this.http.get<any[]>(`${this.baseUrl}/company/internships/stats`, { headers: this.headers }).subscribe({
      next: data => {
        data.forEach(s => {
          this.internshipStatsMap[s.internshipId] = {
            totalApplications: s.totalApplications,
            pending: s.pending,
            accepted: s.accepted,
            rejected: s.rejected
          };
        });
      }
    });

    this.http.get<any[]>(`${this.baseUrl}/company/applicants/top-matching`, { headers: this.headers }).subscribe({
      next: data => { this.topMatchingList = data; }
    });

    this.http.get<any[]>(`${this.baseUrl}/company/internships/closing-soon`, { headers: this.headers }).subscribe({
      next: data => {
        this.closingSoonList = data.map(i => ({
          title: i.title,
          submissionDeadline: i.deadline,
          applicantsCount: i.applicantsCount
        }));
      }
    });

    this.http.get<any>(`${this.baseUrl}/listings`, { headers: this.headers }).subscribe({
      next: res => {
        this.internships = res.listings
          .filter((l: any) => l.company?.userId === myId).map((l: any) => ({
            id: l.id,
            companyId: l.company.userId,
            title: l.title,
            description: l.description ?? '',
            postDate: new Date(l.postDate),
            submissionDeadline: new Date(l.submissionDeadline),
            duration: l.duration ?? '',
            location: (
              {
                'On_site': internship_location.on_site,
                'Remote': internship_location.remote,
                'Hybrid': internship_location.hybrid
              } as any
            )[l.location] ?? internship_location.on_site,
            active: l.status,
            isPaid: l.isPaid,
            skills: (l.internshipSkills ?? []).map((s: any) => ({ skillId: s.skillId, level: 0 }))
          }));

        this.applications = [];
        this.students = [];

        this.http.get<any>(`${this.baseUrl}/listings`, { headers: this.headers })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: res => {

              this.internships = res.listings
                .filter((l: any) => l.company.userId === myId)
                .map((l: any) => ({
                  id: l.id,
                  companyId: l.company.userId,
                  title: l.title,
                  description: l.description ?? '',
                  postDate: new Date(l.postDate),
                  submissionDeadline: new Date(l.submissionDeadline),
                  duration: l.duration ?? '',
                  location: (
                    {
                      'On_site': internship_location.on_site,
                      'Remote': internship_location.remote,
                      'Hybrid': internship_location.hybrid
                    } as any
                  )[l.location] ?? internship_location.on_site,
                  active: l.status,
                  isPaid: l.isPaid,
                  skills: (l.internshipSkills ?? []).map((s: any) => ({
                    skillId: s.skillId,
                    level: 0
                  }))
                }));

              // reset before refilling
              this.applications = [];
              this.students = [];

              // ✅ THIS PART goes INSIDE the same subscribe
              this.internships.forEach(internship => {
                this.http.get<any[]>(`${this.baseUrl}/applications/${internship.id}`, { headers: this.headers })
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: apps => {
                      apps.forEach(a => {

                        this.applications.push({
                          id: a.id,
                          studentId: a.studentId,
                          internshipId: a.internshipId,
                          status: a.status,
                          matchScore: 0
                        });

                        if (!this.students.find(s => s.id === a.studentId)) {
                          const u = a.student?.user;
                          const st = a.student;

                          this.students.push({
                            id: a.studentId,
                            first_name: u?.firstName ?? '',
                            last_name: u?.lastName ?? '',
                            email: u?.email ?? '',
                            phone: u?.phoneNumber ?? '',
                            password: '',
                            role: 'student',
                            major: parseInt(st?.major) || 0,
                            university: st?.university ?? '',
                            experience: st?.experience ?? null,
                            gpa: st?.gpa ?? 0,
                            graduationYear: st?.graduationYear ?? null,
                            linkedInUrl: st?.linkedinUrl ?? '',
                            gitHubUrl: st?.githubUrl ?? '',
                            certifications: [],
                            cvUrl: st?.cvUrl ?? null,
                            studentSkills: (st?.studentSkills ?? []).map((ss: any) => ({
                              skill_id: ss.skillId,
                              studentId: a.studentId,
                              experience: ss.experience ?? 0
                            }))
                          });
                        }

                      });
                    }
                  });
              });

            },
            error: err => console.error('Failed to load listings', err)
          });
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FORM
  // ═══════════════════════════════════════════════════════════════════════════

  internship_form = new FormGroup({
    title: new FormControl('', Validators.required),
    companyId: new FormControl(parseInt(localStorage.getItem('userId') ?? '0'), Validators.required),
    description: new FormControl('', Validators.required),
    postDate: new FormControl(new Date(), Validators.required),
    submissionDeadline: new FormControl('', Validators.required),
    duration: new FormControl('', Validators.required),
    location: new FormControl(internship_location.on_site, Validators.required),
    active: new FormControl(1, Validators.required),
    isPaid: new FormControl(0, Validators.required),
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SKILL METHODS — all delegate to SkillSelectionService
  // ═══════════════════════════════════════════════════════════════════════════

  /** Called by the (input) event on the skills text field */
  searchSkill(query: string): void {
    this.searchSubject.next(query);
  }

  /** Select an existing skill from the dropdown */
  selectSkill(skill: skill): void {
    this.skillSelectionService.selectSkill(skill);
    this.searchQuery = '';
    // Clear the raw input element value too (bypasses Angular model)
    if (this.skillsinput?.nativeElement) {
      this.skillsinput.nativeElement.value = '';
    }
  }

  /**
   * POST a new skill to the DB if it doesn't exist, then select it.
   * The service handles the fallback case where the skill already exists.
   */
  addCustomSkill(name: string): void {
    if (!name.trim()) return;
    this.skillSelectionService.addCustomSkill(name.trim());
    this.searchQuery = '';
    if (this.skillsinput?.nativeElement) {
      this.skillsinput.nativeElement.value = '';
    }
  }

  /** Remove a skill tag from the selection */
  removeSkill(id: number): void {
    this.skillSelectionService.removeSkill(id);
  }

  /** Resolve a skill ID to its display name */
  getSkillName(id: number): string {
    return this.skillSelectionService.getSkillName(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODAL HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  clearModal(): void {
    this.internship_form.reset({
      title: '',
      companyId: parseInt(localStorage.getItem('userId') ?? '0'),
      description: '',
      postDate: new Date(),
      submissionDeadline: '',
      duration: '',
      location: internship_location.on_site,
      active: 1,
      isPaid: 0
    });

    this.skillsTouched = false;
    this.searchQuery = '';
    this.skillSelectionService.clearAll();
    this.isEditing = false;
    this.editingId = null;
  }

  private closeModal(): void {
    this.modalCloseBtn?.nativeElement.click();
  }
  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNSHIP CRUD
  // ═══════════════════════════════════════════════════════════════════════════

  postInternship(): void {
    console.log("========== POST INTERNSHIP CLICKED ==========");
    console.log("Mode:", this.isEditing ? "EDIT" : "CREATE");
    console.log("Editing ID:", this.editingId);
    console.log("Form value:", this.internship_form.value);
    console.log("Form valid:", this.internship_form.valid);
    console.log("Pending skills:", this.pendingSkills);

    Object.keys(this.internship_form.controls).forEach(key => {
      const control = this.internship_form.get(key);

      if (control?.invalid) {
        console.error("Invalid form field:", key, {
          value: control.value,
          errors: control.errors
        });
      }
    });

    if (this.internship_form.invalid) {
      console.error("Stopped because form is invalid.");
      return;
    }

    const currentSkills = this.skillSelectionService.getSelectedSkills();

    console.log("Current skills from service:", currentSkills);

    if (currentSkills.length === 0) {
      console.error("Stopped because no skills were selected.");
      this.skillsTouched = true;
      return;
    }

    const payload = {
      title: this.internship_form.value.title,
      description: this.internship_form.value.description,
      submissionDeadline: new Date(this.internship_form.value.submissionDeadline!).toISOString(),
      duration: this.internship_form.value.duration,
      location: this.locationToString[this.internship_form.value.location!],
      isPaid: this.internship_form.value.isPaid === 1,
      status: this.internship_form.value.active === 1,
      skillIds: currentSkills.map(s => s.skillId)
    };

    console.log("Payload being sent:", payload);
    console.log("Location being sent:", payload.location);
    console.log("Full payload:", payload);

    if (this.isEditing && this.editingId !== null) {
      console.log("Sending UPDATE request to:", `${this.baseUrl}/listings/${this.editingId}`);

      this.http.put<any>(`${this.baseUrl}/listings/${this.editingId}`, payload, { headers: this.headers }).subscribe({
        next: res => {
          console.log("Update success:", res);

          const index = this.internships.findIndex(x => x.id === this.editingId);

          console.log("Internship index found:", index);

          if (index !== -1) {
            this.internships[index] = {
              ...this.internships[index],
              title: res.updatedListing.title,
              description: res.updatedListing.description ?? '',
              submissionDeadline: new Date(res.updatedListing.submissionDeadline),
              duration: res.updatedListing.duration ?? '',
              isPaid: res.updatedListing.isPaid,
              active: res.updatedListing.status,
              skills: [...currentSkills]
            };

            console.log("Updated local internship:", this.internships[index]);
          }

          this.closeModal();
          this.clearModal();
          this.ngOnInit()
        },
        error: err => {
          console.error("Update failed.");
          console.error("Full error:", err);
          console.error("Status:", err.status);
          console.error("Backend response:", err.error);

          alert(err.error?.error ?? err.error?.message ?? `Error ${err.status}: Failed to update listing`);
        }
      });
    } else {
      console.log("Sending CREATE request to:", `${this.baseUrl}/listings`);

      this.http.post<any>(`${this.baseUrl}/listings`, payload, { headers: this.headers }).subscribe({
        next: res => {
          console.log("Create success:", res);

          const l = res.listing;

          console.log("Created listing:", l);

          this.internships.push({
            id: l.id,
            company: l.company,
            title: l.title,
            description: l.description ?? '',
            postDate: new Date(l.postDate),
            submissionDeadline: new Date(l.submissionDeadline),
            duration: l.duration ?? '',
            location: this.internship_form.value.location!,
            active: l.status,
            isPaid: l.isPaid,
            skills: [...currentSkills]
          });

          console.log("Internships after create:", this.internships);

          this.closeModal();
          this.clearModal();
        },
        error: err => {
          console.error("Create failed.");
          console.error("Full error:", err);
          console.error("Status:", err.status);
          console.error("Backend response:", err.error);

          alert(err.error?.error ?? err.error?.message ?? `Error ${err.status}: Failed to create listing`);
        }
      });
    }
  }

  editInternship(internship: Internship): void {
    this.isEditing = true;
    this.editingId = internship.id;

    const d = internship.submissionDeadline;
    const dateStr = new Date(internship.submissionDeadline)
      .toISOString()
      .split('T')[0];
    this.internship_form.patchValue({
      title: internship.title,
      description: internship.description,
      submissionDeadline: dateStr,
      duration: internship.duration,
      location: internship.location,
      isPaid: internship.isPaid ? 1 : 0,
      active: internship.active ? 1 : 0,
      postDate: internship.postDate
    });

    // Hydrate the service with the internship's saved skills
    this.skillSelectionService.setSkills(internship.skills);
  }

  deleteInternship(internship_id: number): void {
    this.http.delete<any>(`${this.baseUrl}/listings/${internship_id}`, { headers: this.headers }).subscribe({
      next: () => { this.internships = this.internships.filter(x => x.id !== internship_id); },
      error: err => alert(err.error?.message ?? 'Failed to delete listing')
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // APPLICATION / STUDENT METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  updateApplicationStatus(status: number): void {
    if (!this.applicationModalApplication) return;

    this.http.put<any>(
      `${this.baseUrl}/applications/${this.applicationModalApplication.id}/status`,
      { status },
      { headers: this.headers }
    ).subscribe({
      next: () => {
        const index = this.applications.findIndex(a => a.id === this.applicationModalApplication!.id);
        if (index !== -1) {
          this.applications[index] = { ...this.applications[index], status };
        }
        this.applicationModalApplication = { ...this.applicationModalApplication!, status };
        this.ApplicationModalButton.nativeElement.click();
      },
      error: err => alert(err.error?.message ?? 'Failed to update status')
    });
  }

  studentInfo(studentId: number, application: Application): void {
    this.applicationModalApplication = { ...application };
    this.applicationModalStudent = this.students.find(x => x.id === studentId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ROUTING
  // ═══════════════════════════════════════════════════════════════════════════

  goToSettings(): void {
    this.router.navigate(['/recruiter-settings']);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DISPLAY HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  setSection(sectionName: string): void {
    this.breadcrumpSectionName = sectionName;
  }

  getClosingSoon() { return this.closingSoonList; }
  getTopCandidates() { return this.topMatchingList; }

  getStudentById(id: number): Student | undefined {
    return this.students.find(s => s.id === id);
  }

  getInternshipName(internshipId: number): string {
    return this.internships.find(i => i.id === internshipId)?.title ?? 'Unknown';
  }

  getApplicationsForInternship(internshipId: number): Application[] {
    return this.applications.filter(a => a.internshipId === internshipId);
  }

  getMajorLabel(major: number | null): string {
    if (major == null) return '';
    return this.majorLabels[major as unknown as Majors] ?? '';
  }

  getStudentMajorLabel(studentId: number): string {
    const student = this.getStudentById(studentId);
    if (student?.major == null) return '';
    return this.majorLabels[student.major as Majors] ?? '';
  }

  getModalStudentMajorLabel(): string {
    if (this.applicationModalStudent?.major == null) return '';
    return this.majorLabels[this.applicationModalStudent.major as Majors] ?? '';
  }


  activeInternshipsCount = 0;
  totalApplicantsCount = 0;
  totalPendingCount = 0;
  totalAcceptedCount = 0;



  countPending(internshipId: number): number { return this.internshipStatsMap[internshipId]?.pending ?? 0; }
  countAccepted(internshipId: number): number { return this.internshipStatsMap[internshipId]?.accepted ?? 0; }

  isExactSkillMatch(): boolean {
    const q = this.searchQuery.trim().toLowerCase();
    return this.searchSkills.some(s => s.skill_name.toLowerCase() === q);
  }
}