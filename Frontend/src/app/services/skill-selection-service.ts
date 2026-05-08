import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { skill } from '../interfaces/iskill';
import { InternshipSkill } from '../interfaces/internshipSkill';
import { SkillService } from './skills_service';

@Injectable({ providedIn: 'root' })
export class SkillSelectionService {

  // ── Emitted state ───────────────────────────────────────────────────────────
  private selectedSkillsSubject = new BehaviorSubject<InternshipSkill[]>([]);
  selectedSkills$ = this.selectedSkillsSubject.asObservable();

  private searchResultsSubject = new BehaviorSubject<skill[]>([]);
  searchResults$ = this.searchResultsSubject.asObservable();

  // ── Local name-lookup cache (populated once via loadAllSkills) ───────────────
  private skillsCache: skill[] = [];

  constructor(private api: SkillService) {}

  // ── SEED ─────────────────────────────────────────────────────────────────────
  /**
   * Load every skill from the DB into the local name-lookup cache.
   * Call once at component init so getSkillName() always resolves correctly.
   */
  loadAllSkills(): void {
    this.api.getAll().subscribe({
      next: skills => { this.skillsCache = skills; },
      error: err  => console.error('Failed to load skills cache:', err)
    });
  }

  // ── SEARCH ────────────────────────────────────────────────────────────────────
  /**
   * Query the DB for matching skills and emit results.
   * Clears results when the query is blank.
   */
  search(query: string): void {
    this.searchResultsSubject.next([]); // clear stale results immediately
    if (!query.trim()) return;

    this.api.search(query).subscribe({
      next: results => this.searchResultsSubject.next(results),
      error: err    => console.error('Skill search failed:', err)
    });
  }

  // ── SELECT (existing DB skill) ────────────────────────────────────────────────
  /**
   * Add an existing skill to the selection.
   * Silently ignores duplicates.
   */
  selectSkill(skill: skill): void {
    const current = this.selectedSkillsSubject.value;
    if (current.some(s => s.skillId === skill.skill_id)) return;

    // Ensure the skill is in the name-lookup cache
    if (!this.skillsCache.find(s => s.skill_id === skill.skill_id)) {
      this.skillsCache.push(skill);
    }

    this.selectedSkillsSubject.next([
      ...current,
      { skillId: skill.skill_id, level: 0 }
    ]);

    this.clearSearch();
  }

  // ── ADD CUSTOM (not yet in DB) ────────────────────────────────────────────────
  /**
   * POST a brand-new skill to the DB, then select it automatically.
   * If the skill already exists in the DB, the error handler tries to find and
   * select the existing match from the local cache.
   */
  addCustomSkill(name: string): void {
    if (!name.trim()) return;

    this.api.add(name.trim()).subscribe({
      next: created => {
        this.selectSkill(created);     // also pushes to cache inside selectSkill
      },
      error: err => {
        // The skill may already exist — fall back to the local cache
        const existing = this.skillsCache.find(
          s => s.skill_name.toLowerCase() === name.trim().toLowerCase()
        );
        if (existing) {
          this.selectSkill(existing);
        } else {
          console.error('Failed to add custom skill and no local match found:', err);
        }
      }
    });

    this.clearSearch();
  }

  // ── REMOVE ────────────────────────────────────────────────────────────────────
  removeSkill(id: number): void {
    this.selectedSkillsSubject.next(
      this.selectedSkillsSubject.value.filter(s => s.skillId !== id)
    );
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────────
  /** Resolve a skill ID to its display name. Requires loadAllSkills() to have run. */
  getSkillName(id: number): string {
    return this.skillsCache.find(s => s.skill_id === id)?.skill_name ?? 'Unknown';
  }

  getSelectedSkills(): InternshipSkill[] {
    return this.selectedSkillsSubject.value;
  }

  /**
   * Hydrate the selection from saved data (e.g. when editing an existing internship).
   * Accepts the InternshipSkill array stored on the internship object.
   */
  setSkills(skills: InternshipSkill[]): void {
    this.selectedSkillsSubject.next([...skills]);
  }

  clearSearch(): void {
    this.searchResultsSubject.next([]);
  }

  clearAll(): void {
    this.selectedSkillsSubject.next([]);
    this.searchResultsSubject.next([]);
  }
}