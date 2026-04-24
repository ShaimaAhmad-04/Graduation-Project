import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboard implements OnInit {

  private baseUrl = 'http://localhost:5002';

  student = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    university: '',
    gpa: '',
    major: '',
    skills: [] as string[],
    profileCompletion: 0
  };

  applications: {
    id: number;
    title: string;
    company: string;
    appliedDate: Date;
    status: string;
    matchScore: number;
  }[] = [];

  activeTab: 'overview' | 'applications' | 'roadmap' = 'overview';

  // Roadmap
  positions = [
    'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'Mobile App Developer', 'DevOps Engineer', 'Data Scientist',
    'Machine Learning Engineer', 'UI/UX Designer', 'Cybersecurity Analyst',
    'Cloud Infrastructure Engineer', 'Business Intelligence Analyst',
    'Digital Marketing Specialist'
  ];

  selectedPosition = '';
  isGenerating = false;
  currentRoadmap: { roadmapId: number; desiredPosition: string; generatedAt: string; nodes: { title: string; orderIndex: number }[] } | null = null;

  stepMeta: Record<string, { description: string; resources: string[] }> = {
    'Frontend Basics':               { description: 'Learn HTML, CSS, and JavaScript to build modern UIs.', resources: ['https://www.freecodecamp.org', 'https://www.codecademy.com', 'https://developer.mozilla.org'] },
    'Backend Development':           { description: 'Build servers, REST APIs, and handle business logic.', resources: ['https://www.udemy.com', 'https://www.coursera.org', 'https://www.pluralsight.com'] },
    'Databases & APIs':              { description: 'Work with SQL/NoSQL databases and integrate APIs.', resources: ['https://www.mongodb.com/university', 'https://www.postgresqltutorial.com', 'https://restfulapi.net'] },
    'Deployment & DevOps':           { description: 'Deploy apps with CI/CD, Docker, and cloud platforms.', resources: ['https://www.docker.com/get-started', 'https://www.github.com', 'https://aws.amazon.com/training'] },
    'HTML & CSS Fundamentals':       { description: 'Master the building blocks of every web page.', resources: ['https://www.freecodecamp.org', 'https://css-tricks.com', 'https://developer.mozilla.org'] },
    'JavaScript Mastery':            { description: 'Deep dive into modern JavaScript and TypeScript.', resources: ['https://javascript.info', 'https://www.udemy.com', 'https://www.codecademy.com'] },
    'Modern Frameworks':             { description: 'Build apps with Angular, React, or Vue.', resources: ['https://angular.io', 'https://reactjs.org', 'https://www.pluralsight.com'] },
    'Performance & Testing':         { description: 'Optimize load times and write reliable tests.', resources: ['https://web.dev', 'https://jestjs.io', 'https://www.cypress.io'] },
    'Programming Fundamentals':      { description: 'Build a solid programming foundation.', resources: ['https://www.freecodecamp.org', 'https://www.codecademy.com', 'https://developer.mozilla.org'] },
    'Server & APIs':                 { description: 'Design and implement scalable REST APIs.', resources: ['https://www.udemy.com', 'https://www.coursera.org', 'https://restfulapi.net'] },
    'Databases & ORM':               { description: 'Work with relational databases and ORM tools.', resources: ['https://www.prisma.io', 'https://www.postgresqltutorial.com', 'https://www.mongodb.com/university'] },
    'Security & Scalability':        { description: 'Secure your APIs and scale your infrastructure.', resources: ['https://owasp.org', 'https://www.educative.io', 'https://leetcode.com'] },
    'Mobile UI Fundamentals':        { description: 'Design responsive and native-feeling mobile UIs.', resources: ['https://flutter.dev', 'https://reactnative.dev', 'https://www.udemy.com'] },
    'Cross-Platform Development':    { description: 'Build apps that run on iOS and Android.', resources: ['https://flutter.dev', 'https://reactnative.dev', 'https://www.coursera.org'] },
    'State & Storage':               { description: 'Manage app state and persist data locally.', resources: ['https://pub.dev', 'https://www.udemy.com', 'https://www.pluralsight.com'] },
    'Publishing & Testing':          { description: 'Test and publish your app to app stores.', resources: ['https://developer.apple.com', 'https://play.google.com/console', 'https://www.firebase.google.com'] },
    'Linux & Networking':            { description: 'Master Linux commands and networking basics.', resources: ['https://linuxjourney.com', 'https://www.coursera.org', 'https://www.udemy.com'] },
    'CI/CD Pipelines':               { description: 'Automate builds, tests, and deployments.', resources: ['https://github.com/features/actions', 'https://www.jenkins.io', 'https://circleci.com'] },
    'Containers & Orchestration':    { description: 'Use Docker and Kubernetes to manage services.', resources: ['https://www.docker.com', 'https://kubernetes.io', 'https://www.pluralsight.com'] },
    'Monitoring & Cloud':            { description: 'Monitor systems and deploy on cloud platforms.', resources: ['https://grafana.com', 'https://aws.amazon.com/training', 'https://cloud.google.com/training'] },
    'Python & Statistics':           { description: 'Learn Python and core statistical concepts.', resources: ['https://www.kaggle.com', 'https://www.coursera.org', 'https://www.udemy.com'] },
    'Data Wrangling':                { description: 'Clean, transform, and explore datasets.', resources: ['https://pandas.pydata.org', 'https://www.kaggle.com', 'https://www.datacamp.com'] },
    'Machine Learning Models':       { description: 'Build and evaluate ML models.', resources: ['https://scikit-learn.org', 'https://www.coursera.org', 'https://www.kaggle.com'] },
    'Data Visualization':            { description: 'Communicate insights through charts and dashboards.', resources: ['https://matplotlib.org', 'https://www.tableau.com', 'https://plotly.com'] },
    'Math & Python Foundations':     { description: 'Linear algebra, calculus, and Python for ML.', resources: ['https://www.khanacademy.org', 'https://www.coursera.org', 'https://www.udemy.com'] },
    'ML Algorithms':                 { description: 'Understand supervised and unsupervised learning.', resources: ['https://scikit-learn.org', 'https://www.kaggle.com', 'https://www.coursera.org'] },
    'Deep Learning':                 { description: 'Build neural networks with TensorFlow or PyTorch.', resources: ['https://www.tensorflow.org', 'https://pytorch.org', 'https://www.fast.ai'] },
    'MLOps & Deployment':            { description: 'Deploy and monitor ML models in production.', resources: ['https://mlflow.org', 'https://www.coursera.org', 'https://aws.amazon.com/sagemaker'] },
    'Design Principles':             { description: 'Learn color theory, typography, and layout.', resources: ['https://www.figma.com', 'https://www.coursera.org', 'https://www.nngroup.com'] },
    'Wireframing & Prototyping':     { description: 'Create wireframes and interactive prototypes.', resources: ['https://www.figma.com', 'https://www.sketch.com', 'https://www.invisionapp.com'] },
    'User Research':                 { description: 'Conduct interviews, surveys, and usability tests.', resources: ['https://www.nngroup.com', 'https://www.udemy.com', 'https://www.coursera.org'] },
    'Design Systems':                { description: 'Build and maintain consistent design systems.', resources: ['https://storybook.js.org', 'https://material.io', 'https://www.figma.com'] },
    'Networking Basics':             { description: 'Understand TCP/IP, DNS, and network protocols.', resources: ['https://www.cisco.com/c/en/us/training-events', 'https://www.coursera.org', 'https://www.udemy.com'] },
    'Security Fundamentals':         { description: 'Learn cryptography, authentication, and threat models.', resources: ['https://owasp.org', 'https://www.coursera.org', 'https://tryhackme.com'] },
    'Ethical Hacking':               { description: 'Practice penetration testing and vulnerability assessment.', resources: ['https://tryhackme.com', 'https://www.hackthebox.com', 'https://www.udemy.com'] },
    'Incident Response':             { description: 'Detect, contain, and recover from security incidents.', resources: ['https://www.sans.org', 'https://www.coursera.org', 'https://www.pluralsight.com'] },
    'Cloud Basics':                  { description: 'Get started with cloud computing concepts and services.', resources: ['https://aws.amazon.com/training', 'https://cloud.google.com/training', 'https://learn.microsoft.com/azure'] },
    'Infrastructure as Code':        { description: 'Automate infrastructure with Terraform and Ansible.', resources: ['https://www.terraform.io', 'https://www.ansible.com', 'https://www.udemy.com'] },
    'Networking & Storage':          { description: 'Configure cloud networks, VPCs, and storage solutions.', resources: ['https://aws.amazon.com/training', 'https://www.coursera.org', 'https://www.pluralsight.com'] },
    'Cost & Performance':            { description: 'Optimize cloud costs and improve performance.', resources: ['https://aws.amazon.com/training', 'https://cloud.google.com/training', 'https://www.educative.io'] },
    'SQL & Data Modeling':           { description: 'Write advanced SQL and design efficient data models.', resources: ['https://www.postgresqltutorial.com', 'https://www.datacamp.com', 'https://www.udemy.com'] },
    'BI Tools':                      { description: 'Use Power BI, Tableau, or Looker to analyze data.', resources: ['https://www.tableau.com', 'https://powerbi.microsoft.com', 'https://www.coursera.org'] },
    'Dashboard Design':              { description: 'Build interactive, insightful dashboards.', resources: ['https://www.tableau.com', 'https://www.udemy.com', 'https://www.pluralsight.com'] },
    'Advanced Analytics':            { description: 'Apply predictive analytics and statistical modeling.', resources: ['https://www.coursera.org', 'https://www.datacamp.com', 'https://www.kaggle.com'] },
    'Marketing Fundamentals':        { description: 'Learn core marketing concepts and customer behavior.', resources: ['https://www.coursera.org', 'https://www.udemy.com', 'https://www.hubspot.com/academy'] },
    'SEO & Content':                 { description: 'Optimize content for search engines and audiences.', resources: ['https://moz.com/learn/seo', 'https://www.semrush.com/academy', 'https://www.udemy.com'] },
    'Social Media & Ads':            { description: 'Run paid campaigns and grow social media presence.', resources: ['https://www.facebook.com/business', 'https://ads.google.com', 'https://www.coursera.org'] },
    'Analytics & Reporting':         { description: 'Measure performance with Google Analytics and dashboards.', resources: ['https://analytics.google.com', 'https://www.udemy.com', 'https://www.datacamp.com'] },
    // Fallback generics
    'Foundation Skills':             { description: 'Build a strong foundation with essential programming concepts and tools.', resources: ['https://www.freecodecamp.org', 'https://www.codecademy.com', 'https://developer.mozilla.org'] },
    'Core Technologies':             { description: 'Master the core technologies and frameworks required for this role.', resources: ['https://www.udemy.com', 'https://www.coursera.org', 'https://www.pluralsight.com'] },
    'Build Projects':                { description: 'Apply your knowledge by building real-world projects.', resources: ['https://github.com/collections', 'https://www.frontendmentor.io', 'https://www.youtube.com'] },
    'Advanced Concepts':             { description: 'Dive deeper into advanced topics and best practices.', resources: ['https://www.educative.io', 'https://leetcode.com', 'https://www.hackerrank.com'] },
  };

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<any>(`${this.baseUrl}/student/profile`, { headers }).subscribe({
      next: (profile) => {
        this.student = {
          firstName: profile.user.firstName,
          lastName: profile.user.lastName ?? '',
          email: profile.user.email,
          phone: profile.user.phoneNumber,
          university: profile.university ?? '',
          gpa: profile.gpa ? String(profile.gpa) : '',
          major: profile.major ? String(profile.major) : '',
          skills: this.student.skills,
          profileCompletion: this.calcCompletion(profile)
        };
      },
      error: () => this.router.navigate(['/login'])
    });

    this.http.get<any[]>(`${this.baseUrl}/student/applications`, { headers }).subscribe({
      next: (apps) => {
        const statusMap: Record<number, string> = { 0: 'pending', 1: 'accepted', 2: 'rejected' };
        this.applications = apps.map(a => ({
          id: a.id,
          title: a.internship.title,
          company: '',
          appliedDate: new Date(),
          status: statusMap[a.status] ?? 'pending',
          matchScore: 0
        }));
      }
    });

    this.http.get<any[]>(`${this.baseUrl}/student/skills`, { headers }).subscribe({
      next: (skills) => {
        this.student.skills = skills.map(s => s.skill.name);
      }
    });

    // Load most recent roadmap if exists
    this.http.get<any[]>(`${this.baseUrl}/student/roadmaps`, { headers }).subscribe({
      next: (roadmaps) => {
        if (roadmaps.length > 0) {
          this.currentRoadmap = roadmaps[roadmaps.length - 1];
          this.selectedPosition = this.currentRoadmap!.desiredPosition ?? '';
        }
      }
    });
  }

  private calcCompletion(profile: any): number {
    const fields = ['university', 'major', 'gpa', 'graduationYear', 'linkedinUrl', 'githubUrl', 'cvUrl', 'experience'];
    const filled = fields.filter(f => profile[f] != null && profile[f] !== '').length;
    return Math.round((filled / fields.length) * 100);
  }

  get totalApplications(): number { return this.applications.length; }
  get pendingCount(): number { return this.applications.filter(a => a.status === 'pending').length; }
  get acceptedCount(): number { return this.applications.filter(a => a.status === 'accepted').length; }
  get rejectedCount(): number { return this.applications.filter(a => a.status === 'rejected').length; }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      accepted: 'badge--accepted',
      pending: 'badge--pending',
      rejected: 'badge--rejected'
    };
    return map[status] ?? '';
  }

  generateRoadmap(): void {
    if (!this.selectedPosition) return;
    this.isGenerating = true;
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token ?? ''}` };
    this.http.post<any>(`${this.baseUrl}/student/roadmaps`, { desiredPosition: this.selectedPosition }, { headers }).subscribe({
      next: (roadmap) => {
        this.currentRoadmap = roadmap;
        this.isGenerating = false;
      },
      error: () => { this.isGenerating = false; }
    });
  }

  getStepMeta(title: string): { description: string; resources: string[] } {
    return this.stepMeta[title] ?? { description: 'Master this topic to advance your career.', resources: ['https://www.udemy.com', 'https://www.coursera.org'] };
  }

  goToInternships(): void { this.router.navigate(['/internships']); }
  goToSettings(): void { this.router.navigate(['/student-settings']); }
  goToProfileSetup(): void { this.router.navigate(['/profile-setup']); }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    this.router.navigate(['/homepage']);
  }
}
