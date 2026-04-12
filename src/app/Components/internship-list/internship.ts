import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Internship } from '../../interfaces/iInternship';
import { internship_location } from '../../ENUMs/internship-location';
import { SkillExperience } from '../../ENUMs/skillLevel';

@Injectable({
  providedIn: 'root'
})
export class InternshipService {

  private internships: Internship[] = [
    {
      id: 1, companyId: 1,
      title: 'Full Stack Developer Intern',
      description: 'Join our team to work on cutting-edge web applications using React and Node.js. You will collaborate with experienced developers and gain hands-on experience in modern web development.',
      postDate: new Date('2026-01-15'),
      submissionDeadline: new Date('2026-03-15'),
      duration: '3 months',
      location: internship_location.hyprid,
      isPaid: true, active: true,
      skills: [
        { skillId: 1, level: SkillExperience.Intermediate },
        { skillId: 2, level: SkillExperience.Intermediate },
        { skillId: 3, level: SkillExperience.Beginner },
        { skillId: 4, level: SkillExperience.Beginner },
      ]
    },
    {
      id: 2, companyId: 2,
      title: 'UI/UX Design Intern',
      description: 'Design user interfaces for mobile and web applications. Work with our design team to create beautiful and intuitive user experiences.',
      postDate: new Date('2026-01-20'),
      submissionDeadline: new Date('2026-03-20'),
      duration: '2 months',
      location: internship_location.on_site,
      isPaid: true, active: true,
      skills: [
        { skillId: 5, level: SkillExperience.Intermediate },
        { skillId: 1, level: SkillExperience.Beginner },
      ]
    },
    {
      id: 3, companyId: 1,
      title: 'DevOps Intern',
      description: 'Learn about cloud infrastructure, CI/CD pipelines, and modern DevOps practices. Experience with AWS preferred.',
      postDate: new Date('2026-01-20'),
      submissionDeadline: new Date('2026-03-25'),
      duration: '4 months',
      location: internship_location.remote,
      isPaid: true, active: true,
      skills: [
        { skillId: 6, level: SkillExperience.Intermediate },
        { skillId: 7, level: SkillExperience.Beginner },
        { skillId: 8, level: SkillExperience.Beginner },
      ]
    },
    {
      id: 4, companyId: 3,
      title: 'Data Science Intern',
      description: 'Work with large datasets and build machine learning models to drive meaningful business insights.',
      postDate: new Date('2026-01-20'),
      submissionDeadline: new Date('2026-04-01'),
      duration: '3 months',
      location: internship_location.remote,
      isPaid: false, active: true,
      skills: [
        { skillId: 9, level: SkillExperience.Intermediate },
        { skillId: 10, level: SkillExperience.Beginner },
        { skillId: 11, level: SkillExperience.Beginner },
      ]
    }
  ];

  private companyNames: Record<number, string> = {
    1: 'TechCorp Solutions',
    2: 'Innovate Jordan',
    3: 'StartUp Hub'
  };

  private skillNames: Record<number, string> = {
    1: 'React',
    2: 'Node.js',
    3: 'JavaScript',
    4: 'SQL',
    5: 'UI/UX Design',
    6: 'AWS',
    7: 'Docker',
    8: 'Git',
    9: 'Python',
    10: 'ML',
    11: 'SQL'
  };

  private search$ = new BehaviorSubject<string>('');
  private location$ = new BehaviorSubject<number>(-1);
  private type$ = new BehaviorSubject<string>('All Types');

  setSearch(val: string) { this.search$.next(val); }
  setLocation(val: number) { this.location$.next(val); }
  setType(val: string) { this.type$.next(val); }

  getCompanyName(companyId: number): string {
    return this.companyNames[companyId] ?? 'Unknown Company';
  }

  getSkillName(skillId: number): string {
    return this.skillNames[skillId] ?? 'Unknown Skill';
  }

  getSkillNames(internship: Internship): string[] {
    return internship.skills.map(s => this.getSkillName(s.skillId));
  }

  getById(id: number): Internship | undefined {
    return this.internships.find(i => i.id === id);
  }

  getLocationLabel(location: internship_location): string {
    const labels: Record<number, string> = {
      [internship_location.on_site]: 'On-Site',
      [internship_location.remote]: 'Remote',
      [internship_location.hyprid]: 'Hybrid',
    };
    return labels[location] ?? 'Unknown';
  }

  getFiltered(): Observable<Internship[]> {
    return combineLatest([this.search$, this.location$, this.type$]).pipe(
      map(([search, location, type]) =>
        this.internships.filter(i => {
          if (!i.active) return false;
          const name = this.getCompanyName(i.companyId);
          const matchSearch = !search ||
            i.title.toLowerCase().includes(search.toLowerCase()) ||
            name.toLowerCase().includes(search.toLowerCase());
          const matchLocation = location === -1 || i.location === location;
          const matchType = type === 'All Types' ||
            (type === 'Paid' && i.isPaid) ||
            (type === 'Unpaid' && !i.isPaid);
          return matchSearch && matchLocation && matchType;
        })
      )
    );
  }
}