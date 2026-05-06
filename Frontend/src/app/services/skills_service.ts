import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { skill } from '../interfaces/iskill';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SkillService {

  private baseUrl = 'http://localhost:5002';

  constructor(private http: HttpClient) {}

  /** Search skills by query string. Maps raw API shape → skill interface. */
  search(query: string): Observable<skill[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/skills?search=${encodeURIComponent(query)}`)
      .pipe(map(results => results.map(s => ({ skill_id: s.id, skill_name: s.name }))));
  }

  /** Add a brand-new skill to the DB. Returns the created skill. */
  add(name: string): Observable<skill> {
    return this.http
      .post<any>(`${this.baseUrl}/skills`, { name })
      .pipe(map(s => ({ skill_id: s.id, skill_name: s.name })));
  }

  /** Fetch all skills from the DB. */
  getAll(): Observable<skill[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/skills`)
      .pipe(map(results => results.map(s => ({ skill_id: s.id, skill_name: s.name }))));
  }
}