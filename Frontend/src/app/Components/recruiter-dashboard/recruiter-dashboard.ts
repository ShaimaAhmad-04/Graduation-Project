import { ApplicationInitStatus, Component, ElementRef, ViewChild, viewChild } from '@angular/core';
import { Internship } from '../../interfaces/iInternship';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';
import { Application } from '../../interfaces/iapplication';
import { SkillExperience } from '../../ENUMs/skillLevel'
import { skill } from '../../interfaces/iskill';
import { Student } from '../../interfaces/istudent';
import { Status } from '../../ENUMs/applicationStatus';
import { NgxPaginationModule } from 'ngx-pagination';
import { internship_location } from '../../ENUMs/internship-location';
import { InternshipSkill } from '../../interfaces/internshipSkill';

@Component({
  selector: 'recruiter-dashboard',
  imports: [CommonModule, NgxPaginationModule, ReactiveFormsModule, DatePipe, FormsModule],
  templateUrl: './recruiter-dashboard.html',
  styleUrls: ['./recruiter-dashboard.css'], // FIXED
})

export class RecruiterDashboard {

  // TODO (Backend): Inject services here
  // constructor(
  //   private internshipService: InternshipService,
  //   private applicationService: ApplicationService,
  //   private companyService: CompanyService
  // ) {}
  constructor() { }

  @ViewChild('postInternshipModal') postInternshipModal!: ElementRef;
  @ViewChild('skills-input') skillsinput!: ElementRef;

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


  internship_form = new FormGroup({
    title: new FormControl('', Validators.required),
    companyName: new FormControl('', Validators.required),
    companyId: new FormControl(10000, Validators.required),
    description: new FormControl('', Validators.required),
    postDate: new FormControl(new Date(), Validators.required),
    submissionDeadline: new FormControl('', Validators.required),
    duration: new FormControl('', Validators.required),
    location: new FormControl(internship_location.on_site, Validators.required),
    active: new FormControl(0, Validators.required),
    isPaid: new FormControl(0, Validators.required),
  })

  // skils
  skills: skill[] = [
    { skill_id: 1, skill_name: "Angular" },
    { skill_id: 2, skill_name: "SQL" },
    { skill_id: 3, skill_name: "C#" },
    { skill_id: 4, skill_name: "Flutter" }
  ];

  //  students
  students: Student[] = [
    {
      id: 1,
      first_name: "Ahmad Khaled",
      email: "ahmad.khaled@example.com",
      password: "",
      role: "student",
      major: "Computer Science",
      university: "University of Jordan",
      experience: "Internship at TechSoft",
      gpa: 88,
      graduationYear: 2026,
      linkedInUrl: "https://linkedin.com/in/ahmadkhaled",
      gitHubUrl: "https://github.com/ahmadkhaled",
      certifications: ["Angular Basics", "SQL Fundamentals"],
      cvUrl: "https://example.com/cv/ahmad.pdf",
      phone: "0778899553",
      studentSkills: [
        { skill_id: 1, studentId: 1, experience: SkillExperience.Expert },
        { skill_id: 2, studentId: 1, experience: SkillExperience.Intermediate },
        { skill_id: 3, studentId: 1, experience: SkillExperience.Beginner, }
      ]
    },
    {
      id: 2,
      first_name: "Sara Mahmoud",
      email: "sara.mahmoud@example.com",
      password: "",
      role: "student",
      major: "Software Engineering",
      university: "Princess Sumaya University",
      experience: null,
      gpa: 92,
      graduationYear: 2025,
      linkedInUrl: "https://linkedin.com/in/saramahmoud",
      gitHubUrl: null,
      certifications: ["C# Programming"],
      cvUrl: null,
      phone: "0778899553",
      studentSkills: [
        { skill_id: 1, studentId: 2, experience: SkillExperience.Intermediate },
        { skill_id: 4, studentId: 2, experience: SkillExperience.Expert }
      ]
    },
    {
      id: 3,
      first_name: "Omar",
      last_name: "Hassan",
      email: "omar.hassan@example.com",
      password: "",
      role: "student",
      major: "Computer Engineering",
      university: "Jordan University of Science and Technology",
      experience: "Part-time developer at StartupJO",
      gpa: 85,
      graduationYear: 2026,
      linkedInUrl: "https://linkedin.com/in/omarhassan",
      gitHubUrl: "https://github.com/omarhassan",
      certifications: ["Flutter Fundamentals"],
      cvUrl: "https://example.com/cv/omar.pdf",
      phone: "0791234567",
      studentSkills: [
        { skill_id: 2, studentId: 3, experience: SkillExperience.Expert },
        { skill_id: 4, studentId: 3, experience: SkillExperience.Intermediate }
      ]
    },
    {
      id: 4,
      first_name: "Lina",
      last_name: "Nasser",
      email: "lina.nasser@example.com",
      password: "",
      role: "student",
      major: "Information Technology",
      university: "German Jordanian University",
      experience: null,
      gpa: 90,
      graduationYear: 2025,
      linkedInUrl: "https://linkedin.com/in/linanasser",
      gitHubUrl: "https://github.com/linanasser",
      certifications: ["Angular Basics", "C# Programming"],
      cvUrl: "https://example.com/cv/lina.pdf",
      phone: "0796543210",
      studentSkills: [
        { skill_id: 1, studentId: 4, experience: SkillExperience.Expert },
        { skill_id: 3, studentId: 4, experience: SkillExperience.Intermediate }
      ]
    },
    {
      id: 5,
      first_name: "Khalid",
      last_name: "Ali",
      email: "khalid.ali@example.com",
      password: "",
      role: "student",
      major: "Software Engineering",
      university: "Al-Ahliyya Amman University",
      experience: null,
      gpa: 78,
      graduationYear: 2027,
      linkedInUrl: "https://linkedin.com/in/khalidali",
      gitHubUrl: null,
      certifications: [],
      cvUrl: null,
      phone: "0789876543",
      studentSkills: [
        { skill_id: 2, studentId: 5, experience: SkillExperience.Beginner },
        { skill_id: 3, studentId: 5, experience: SkillExperience.Intermediate }
      ]
    },
    {
      id: 6,
      first_name: "Rania",
      last_name: "Yousef",
      email: "rania.yousef@example.com",
      password: "",
      role: "student",
      major: "Computer Science",
      university: "University of Jordan",
      experience: "Research Assistant at UJ AI Lab",
      gpa: 95,
      graduationYear: 2025,
      linkedInUrl: "https://linkedin.com/in/raniayousef",
      gitHubUrl: "https://github.com/raniayousef",
      certifications: ["SQL Fundamentals", "Angular Basics", "C# Programming"],
      cvUrl: "https://example.com/cv/rania.pdf",
      phone: "0771122334",
      studentSkills: [
        { skill_id: 1, studentId: 6, experience: SkillExperience.Expert },
        { skill_id: 2, studentId: 6, experience: SkillExperience.Expert },
        { skill_id: 3, studentId: 6, experience: SkillExperience.Intermediate }
      ]
    }
  ];

  //  internships
  internships: Internship[] = [
    {
      id: 1,
      companyId: 1,
      title: "Frontend Intern",
      description: "Work on Angular projects",
      postDate: new Date("2026-01-01"),
      submissionDeadline: new Date("2026-03-01"),
      duration: "3 months",
      location: internship_location.hyprid,
      isPaid: true,
      active: true,
      skills: [
        { skillId: 1, level: SkillExperience.Beginner },
        { skillId: 2, level: SkillExperience.Intermediate },
        { skillId: 3, level: SkillExperience.Beginner }
      ]
    },
    {
      id: 2,
      companyId: 1,
      title: "Frontend Intern",
      description: "Work on Angular projects",
      postDate: new Date("2026-01-01"),
      submissionDeadline: new Date("2026-03-01"),
      duration: "3 months",
      location: internship_location.hyprid,
      isPaid: true,
      active: true,
      skills: [
        { skillId: 1, level: SkillExperience.Intermediate },
        { skillId: 4, level: SkillExperience.Beginner }
      ]
    },
    {
      id: 3,
      companyId: 1,
      title: "Frontend Intern",
      description: "Work on Angular projects",
      postDate: new Date("2026-01-01"),
      submissionDeadline: new Date("2026-03-01"),
      duration: "3 months",
      location: internship_location.on_site,
      isPaid: true,
      active: true,
      skills: [
        { skillId: 2, level: SkillExperience.Beginner },
        { skillId: 5, level: SkillExperience.Intermediate },
        { skillId: 6, level: SkillExperience.Beginner }
      ]
    },
    {
      id: 4,
      companyId: 1,
      title: "Frontend Intern",
      description: "Work on Angular projects",
      postDate: new Date("2026-01-01"),
      submissionDeadline: new Date("2026-03-01"),
      duration: "3 months",
      location: internship_location.on_site,
      isPaid: true,
      active: true,
      skills: [
        { skillId: 1, level: SkillExperience.Beginner },
        { skillId: 3, level: SkillExperience.Expert }
      ]
    },
    {
      id: 5,
      companyId: 1,
      title: "Frontend Intern",
      description: "Work on Angular projects",
      postDate: new Date("2026-01-01"),
      submissionDeadline: new Date("2026-03-01"),
      duration: "3 months",
      location: internship_location.on_site,
      isPaid: true,
      active: true,
      skills: [
        { skillId: 2, level: SkillExperience.Intermediate },
        { skillId: 4, level: SkillExperience.Beginner },
        { skillId: 7, level: SkillExperience.Beginner }
      ]
    },
    {
      id: 6,
      companyId: 1,
      title: "Frontend Intern",
      description: "Work on Angular projects",
      postDate: new Date("2026-01-01"),
      submissionDeadline: new Date("2026-03-01"),
      duration: "3 months",
      location: internship_location.remote,
      isPaid: true,
      active: true,
      skills: [
        { skillId: 1, level: SkillExperience.Expert },
        { skillId: 5, level: SkillExperience.Intermediate }
      ]
    },
    {
      id: 7,
      companyId: 1,
      title: "Frontend Intern",
      description: "Work on Angular projects",
      postDate: new Date("2026-01-01"),
      submissionDeadline: new Date("2026-03-01"),
      duration: "3 months",
      location: internship_location.remote,
      isPaid: true,
      active: true,
      skills: [
        { skillId: 3, level: SkillExperience.Beginner },
        { skillId: 6, level: SkillExperience.Intermediate },
        { skillId: 8, level: SkillExperience.Beginner }
      ]
    },
    {
      id: 8,
      companyId: 2,
      title: "Backend Intern",
      description: "C# and SQL projects",
      postDate: new Date("2026-01-10"),
      submissionDeadline: new Date("2026-03-10"),
      duration: "6 months",
      location: internship_location.remote,
      isPaid: false,
      active: true,
      skills: [
        { skillId: 9, level: SkillExperience.Intermediate },
        { skillId: 10, level: SkillExperience.Beginner },
        { skillId: 7, level: SkillExperience.Expert }
      ]
    }
  ];

  //  applications
  applications: Application[] = [
    // Internship 1 (Frontend Intern)
    { id: 1,  studentId: 1, internshipId: 1, status: Status.Pending,  matchScore: 90 },
    { id: 2,  studentId: 2, internshipId: 1, status: Status.Rejected, matchScore: 30 },
    { id: 3,  studentId: 3, internshipId: 1, status: Status.Pending,  matchScore: 75 },
    { id: 4,  studentId: 6, internshipId: 1, status: Status.Accepted, matchScore: 95 },
    // Internship 2 (Frontend Intern)
    { id: 5,  studentId: 1, internshipId: 2, status: Status.Accepted, matchScore: 80 },
    { id: 6,  studentId: 4, internshipId: 2, status: Status.Accepted, matchScore: 88 },
    { id: 7,  studentId: 5, internshipId: 2, status: Status.Pending,  matchScore: 62 },
    // Internship 3 (Frontend Intern)
    { id: 8,  studentId: 4, internshipId: 3, status: Status.Pending,  matchScore: 71 },
    { id: 9,  studentId: 6, internshipId: 3, status: Status.Accepted, matchScore: 93 },
    // Internship 5 (Frontend Intern)
    { id: 10, studentId: 3, internshipId: 5, status: Status.Pending,  matchScore: 68 },
    { id: 11, studentId: 5, internshipId: 5, status: Status.Rejected, matchScore: 44 },
    // Internship 8 (Backend Intern)
    { id: 12, studentId: 2, internshipId: 8, status: Status.Pending,  matchScore: 85 },
    { id: 13, studentId: 5, internshipId: 8, status: Status.Accepted, matchScore: 77 },
    { id: 14, studentId: 6, internshipId: 8, status: Status.Pending,  matchScore: 91 },
  ];


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

    const index = this.applications.findIndex(a => a.id === this.applicationModalApplication!.id);
    if (index === -1) return;

    // Update in the local array
    this.applications[index] = { ...this.applications[index], status };
    // Keep the modal reference in sync so the badge updates immediately
    this.applicationModalApplication = { ...this.applicationModalApplication, status };
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
      level: SkillExperience.Beginner
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

    if (this.isEditing && this.editingId !== null) {
      // TODO (Backend): PUT /api/internships/{editingId}   Body: updated internship object
      // this.internshipService.update(this.editingId, payload).subscribe(updated => { ... });
      const index = this.internships.findIndex(x => x.id === this.editingId);
      if (index !== -1) {
        this.internships[index] = {
          ...this.internships[index],
          title: this.internship_form.value.title!,
          companyName: this.internship_form.value.companyName!,
          description: this.internship_form.value.description!,
          submissionDeadline: new Date(this.internship_form.value.submissionDeadline!),
          duration: this.internship_form.value.duration!,
          location: this.internship_form.value.location!,
          isPaid: this.internship_form.value.isPaid === 1,
          skills: [...this.pendingSkills]
        };
      }
    } else {
      // TODO (Backend): POST /api/internships   Body: newInternship object
      // this.internshipService.create(payload).subscribe(created => this.internships.push(created));
      const newInternship: Internship = {
        id: this.internships.length + 1,
        companyId: this.internship_form.value.companyId!,
        companyName: this.internship_form.value.companyName!,
        title: this.internship_form.value.title!,
        description: this.internship_form.value.description!,
        postDate: new Date(),
        submissionDeadline: new Date(this.internship_form.value.submissionDeadline!),
        duration: this.internship_form.value.duration!,
        location: this.internship_form.value.location!,
        active: true,
        isPaid: this.internship_form.value.isPaid === 1,
        skills: [...this.pendingSkills]
      };
      this.internships.push(newInternship);
    }

    this.closeModal();
    this.clearModal();
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
    // TODO (Backend): DELETE /api/internships/{internship_id}
    // this.internshipService.delete(internship_id).subscribe(() => { ... });
    this.internships = this.internships.filter(x => x.id !== internship_id);
  }
}

