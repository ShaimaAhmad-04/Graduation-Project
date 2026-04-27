import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import {
  MajorsLabels

} from '../../ENUMs/MappedMajors';
@Component({
  selector: 'recruiter-dashboard',
  imports: [CommonModule, NgxPaginationModule, ReactiveFormsModule, DatePipe, FormsModule],
  templateUrl: './recruiter-dashboard.html',
  styleUrls: ['./recruiter-dashboard.css'],
})

export class RecruiterDashboard implements OnInit {

  private baseUrl = 'http://localhost:5002';

  public majorLabels = MajorsLabels;
  public majors = Majors
  private get token(): string { return localStorage.getItem('token') ?? ''; }
  private get headers() { return { Authorization: `Bearer ${this.token}` }; }

  private locationToString: Record<number, string> = {
    [internship_location.on_site]: 'In_site',
    [internship_location.remote]: 'Remote',
    [internship_location.hyprid]: 'Hybrid',
  };

  constructor(private http: HttpClient, private router: Router) { }

  goToSettings(): void {
    this.router.navigate(['/recruiter-settings']);
  }

  @ViewChild('postInternshipModal') postInternshipModal!: ElementRef;
  @ViewChild('skills-input') skillsinput!: ElementRef;
  @ViewChild('applicationModalButton') ApplicationModalButton!: ElementRef;


  companyName: string = 'InternPath';

  paginationConfig = { itemsPerPage: 7, currentPage: 1 };
  breadcrumpSectionName: string = "overview";
  applicants: any;
  applicationModalStudent: Student | undefined;
  applicationModalApplication: Application | undefined
  applicationStatus = Status
  locationOptions = Object.entries(internship_location);
  searchSkills: skill[] = [];
  pendingSkills: InternshipSkill[] = [];
  searchQuery: string = '';
  skillsTouched: boolean = false;
  isEditing: boolean = false;
  editingId: number | null = null;


  ngOnInit(): void {
    const myId = parseInt(localStorage.getItem('userId') ?? '0');

    // Load company profile
    this.http.get<any>(`${this.baseUrl}/company/profile`, { headers: this.headers }).subscribe({
      next: (company) => { this.companyName = company.name; },
      error: () => { }
    });

    // Load listings then fetch applicants for each
    this.http.get<any>(`${this.baseUrl}/listings`, { headers: this.headers }).subscribe({
      next: (res) => {
        this.internships = res.listings
          .filter((l: any) => l.companyId === myId)
          .map((l: any) => ({
            id: l.id,
            companyId: l.companyId,
            title: l.title,
            description: l.description ?? '',
            postDate: new Date(l.postDate),
            submissionDeadline: new Date(l.submissionDeadline),
            duration: l.duration ?? '',
            location: ({ 'In_site': internship_location.on_site, 'Remote': internship_location.remote, 'Hybrid': internship_location.hyprid } as any)[l.location] ?? internship_location.on_site,
            active: l.status,
            isPaid: l.isPaid,
            skills: (l.internshipSkills ?? []).map((s: any) => ({ skillId: s.skillId, level: 0 }))
          }));

        // Fetch applications for each internship
        this.applications = [];
        this.students = [];
        this.internships.forEach(internship => {
          this.http.get<any[]>(`${this.baseUrl}/applications/${internship.id}`, { headers: this.headers }).subscribe({
            next: (apps) => {
              apps.forEach(a => {
                // Map application
                this.applications.push({
                  id: a.id,
                  studentId: a.studentId,
                  internshipId: a.internshipId,
                  status: a.status,
                  matchScore: 0
                });
                // Map student (avoid duplicates)
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
      error: (err) => console.error('Failed to load listings', err)
    });
  }

  internship_form = new FormGroup({
    title: new FormControl('', Validators.required),
    companyName: new FormControl('', Validators.required),
    companyId: new FormControl(10000, Validators.required),
    description: new FormControl('', Validators.required),
    postDate: new FormControl(new Date(), Validators.required),
    submissionDeadline: new FormControl('', Validators.required),
    duration: new FormControl('', Validators.required),
    location: new FormControl(internship_location.on_site, Validators.required),
    active: new FormControl(1, Validators.required),
    isPaid: new FormControl(0, Validators.required),
  })

  skills: skill[] = [];
  students: Student[] = [];
  internships: Internship[] = [];
  applications: Application[] = [];


  // TODO (Backend): Replace with API call
  // GET /api/internships?active=true&sort=deadline&limit=2
  getClosingSoon(): Internship[] {
    return [...this.internships]
      .filter(i => i.active)
      .sort((a, b) => new Date(a.submissionDeadline).getTime() - new Date(b.submissionDeadline).getTime())
      .slice(0, 2);
  }

  // TODO (Backend): Replace with API call
  // GET /api/applications?sort=matchScore&limit=2
  getTopCandidates(): Application[] {
    return [...this.applications]
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 2);
  }

  // TODO (Backend): Replace with API call
  // GET /api/students/{id}
  getStudentById(id: number): Student | undefined {
    return this.students.find(s => s.id === id);
  }

  setSection(sectionName: string): void {
    this.breadcrumpSectionName = sectionName;
  }

  getInternshipName(internshipId: number): string {
    return this.internships.find(i => i.id === internshipId)?.title ?? 'Unknown';
  }

  // TODO (Backend): Replace with API call
  // GET /api/applications?internshipId={internshipId}
  getApplicationsForInternship(internshipId: number): Application[] {
    return this.applications.filter(a => a.internshipId === internshipId);
  }

  // TODO (Backend): Open modal then GET /api/students/{studentId} if not already loaded
  studentInfo(studentId: number, application: Application) {
    this.applicationModalApplication = { ...application };
    this.applicationModalStudent = this.students.find(x => x.id === studentId);
  }

  // TODO (Backend): Replace computed counts with API aggregates
  // GET /api/applications/stats?internshipId={id}
  countPending(internshipId: number): number {
    return this.applications.filter(x => x.internshipId === internshipId && x.status === Status.Pending).length;
  }

  countAccepted(internshipId: number): number {
    return this.applications.filter(x => x.internshipId === internshipId && x.status === Status.Accepted).length;
  }

  // TODO (Backend): Replace with API aggregates
  // GET /api/dashboard/stats (returns activeInternships, totalApplicants, pending, accepted)
  totalApplicants(): number {
    return this.applications.length;
  }

  totalPending(): number {
    return this.applications.filter(x => x.status === Status.Pending).length;
  }

  totalAccepted(): number {
    return this.applications.filter(x => x.status === Status.Accepted).length;
  }

  activeInternships(): number {
    return this.internships.filter(x => x.active === true).length;
  }

  // TODO (Backend): Call API then update local state on success
  // PUT /api/applications/{id}/status   Body: { status: number }
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
        this.ApplicationModalButton.nativeElement.click()

      },
      error: (err) => alert(err.error?.message ?? 'Failed to update status')
    });

  }
  searchSkill(query: string) {
    this.searchQuery = query
    this.searchSkills = this.skills.filter(x => x.skill_name.toLowerCase().includes(query.toLowerCase()))
    return this.searchSkills;
  }
  selectSkill(skill: skill) {
    //avoid duplicates
    if (this.pendingSkills?.find(s => s.skillId === skill.skill_id)) return;

    this.pendingSkills.push({
      skillId: skill.skill_id,
      level: 0
    });
    this.searchSkills = [];       // close dropdown
    this.searchQuery = '';        // clear query
    this.skillsinput.nativeElement.value = '';
  }
  addCustomSkill(newSkill: string) {
    if (!newSkill.trim()) return;

    const new_skill: skill = {
      skill_id: this.skills.length + 1,
      skill_name: newSkill.trim()
    };

    this.skills.push(new_skill);
    this.selectSkill(new_skill);

    // extra safety clear
    this.searchQuery = '';
    this.searchSkills = [];
    this.skillsinput.nativeElement.value = '';
  }

  removeSkill(id: number) {
    this.pendingSkills = this.pendingSkills.filter(s => s.skillId !== id);
  }

  getSkillName(id: number): string {
    return this.skills.find(s => s.skill_id === id)?.skill_name ?? 'Unknown';
  }

  // TODO (Backend): Replace with API call
  // GET /api/skills
  searchSkillsFromBackend(_query: string) {
    // TODO (Backend): GET /api/skills?search={_query}
    // this.skillService.search(_query).subscribe(results => this.searchSkills = results);
  }

  clearModal() {
    this.internship_form.reset();
    this.skillsTouched = false;
    this.pendingSkills = [];
    this.searchQuery = '';
    this.searchSkills = [];
    this.isEditing = false;
    this.editingId = null;
  }

  private closeModal() {
    const modal = (window as any).bootstrap?.Modal?.getInstance(this.postInternshipModal.nativeElement);
    modal?.hide();
  }

  postInternship() {
    if (this.internship_form.invalid) return;
    if (this.pendingSkills.length === 0) {
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
    };

    if (this.isEditing && this.editingId !== null) {
      this.http.put<any>(`${this.baseUrl}/listings/${this.editingId}`, payload, { headers: this.headers }).subscribe({
        next: (res) => {
          const index = this.internships.findIndex(x => x.id === this.editingId);
          if (index !== -1) {
            this.internships[index] = {
              ...this.internships[index],
              title: res.updatedListing.title,
              description: res.updatedListing.description ?? '',
              submissionDeadline: new Date(res.updatedListing.submissionDeadline),
              duration: res.updatedListing.duration ?? '',
              isPaid: res.updatedListing.isPaid,
              active: res.updatedListing.status,
            };
          }
          this.closeModal();
          this.clearModal();
        },
        error: (err) => alert(err.error?.message ?? 'Failed to update listing')
      });
    } else {
      this.http.post<any>(`${this.baseUrl}/listings`, payload, { headers: this.headers }).subscribe({
        next: (res) => {
          const l = res.listing;
          this.internships.push({
            id: l.id,
            companyId: l.companyId,
            title: l.title,
            description: l.description ?? '',
            postDate: new Date(l.postDate),
            submissionDeadline: new Date(l.submissionDeadline),
            duration: l.duration ?? '',
            location: this.internship_form.value.location!,
            active: l.status,
            isPaid: l.isPaid,
            skills: [...this.pendingSkills]
          });
          this.closeModal();
          this.clearModal();
        },
        error: (err) => alert(err.error?.message ?? 'Failed to create listing')
      });
    }
  }

  editInternship(internship: Internship) {
    this.isEditing = true;
    this.editingId = internship.id;
    this.internship_form.patchValue({
      title: internship.title,
      companyName: internship.companyName ?? '',
      description: internship.description,
      submissionDeadline: internship.submissionDeadline.toISOString().split('T')[0],
      duration: internship.duration,
      location: internship.location,
      isPaid: internship.isPaid ? 1 : 0,
      companyId: internship.companyId,
      postDate: internship.postDate
    });

    this.pendingSkills = [...internship.skills];
  }
  deleteInternship(internship_id: number) {
    this.http.delete<any>(`${this.baseUrl}/listings/${internship_id}`, { headers: this.headers }).subscribe({
      next: () => { this.internships = this.internships.filter(x => x.id !== internship_id); },
      error: (err) => alert(err.error?.message ?? 'Failed to delete listing')
    });
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
}

