import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Internship } from '../../interfaces/iInternship';
import { internship_location } from '../../ENUMs/internship-location';

@Injectable({ providedIn: 'root' })
export class InternshipService {

  private baseUrl = 'http://localhost:5002';

  private internships$ = new BehaviorSubject<Internship[]>([]);
  private search$ = new BehaviorSubject<string>('');
  private location$ = new BehaviorSubject<number>(-1);
  private type$ = new BehaviorSubject<string>('All Types');

  private locationMap: Record<string, internship_location> = {
    'In_site': internship_location.on_site,
    'Remote': internship_location.remote,
    'Hybrid': internship_location.hyprid,
  };

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<any>(`${this.baseUrl}/listings`).subscribe({
      next: (res) => this.internships$.next(res.listings.map((l: any) => this.mapListing(l))),
      error: (err) => console.error('Failed to load internships', err)
    });
  }

  mapListing(l: any): Internship {
    return {
      id: l.id,
      companyId: l.companyId,
      companyName: l.company?.name ?? '',
      title: l.title,
      description: l.description ?? '',
      postDate: new Date(l.postDate),
      submissionDeadline: new Date(l.submissionDeadline),
      duration: l.duration ?? '',
      location: this.locationMap[l.location] ?? internship_location.on_site,
      active: l.status,
      isPaid: l.isPaid,
      skills: (l.internshipSkills ?? []).map((s: any) => ({
        skillId: s.skillId,
        level: 0,
        skillName: s.skill?.name ?? ''
      }))
    };
  }

  fetchById(id: number): Observable<Internship> {
    return this.http.get<any>(`${this.baseUrl}/listings/${id}`).pipe(
      map(res => this.mapListing(res.listing))
    );
  }

  setSearch(val: string) { this.search$.next(val); }
  setLocation(val: number) { this.location$.next(val); }
  setType(val: string) { this.type$.next(val); }

  getById(id: number): Internship | undefined {
    return this.internships$.getValue().find(i => i.id === id);
  }

  getCompanyName(_companyId: number): string { return ''; }

  getSkillNames(internship: Internship): string[] {
    return internship.skills.map(s => s.skillName ?? String(s.skillId));
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
    return combineLatest([this.internships$, this.search$, this.location$, this.type$]).pipe(
      map(([internships, search, location, type]) =>
        internships.filter(i => {
          if (!i.active) return false;
          const matchSearch = !search ||
            i.title.toLowerCase().includes(search.toLowerCase());
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
