import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { Majors } from '../../ENUMs/Majors';

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile-setup.html',
  styleUrls: ['./profile-setup.css']
})
export class ProfileSetup {

  constructor(private router: Router,
    private _profilesetup_http: HttpClient
  ) { }

  // This turns your Enum into a clean list of choices
  isExtracting: boolean = false; // To show a loading spinner
  currentStep: 1 | 2 = 1;

  // STEP 1
  uploadedFileName = '';
  uploadSuccess = false;
  extractedSkills: string[] = [];
  newSkill = ""
  extractedCV = ''


  student_form = new FormGroup({
    major: new FormControl('', Validators.required),
    university: new FormControl('', Validators.required),
    experience: new FormControl(''),
    gpa: new FormControl<number | null>(null),
    graduationYear: new FormControl<number | null>(null),
    linkedInUrl: new FormControl(''),
    gitHubUrl: new FormControl(''),
    certifications: new FormControl(''), // Handled as string in UI, converted to array on submit
    cvUrl: new FormControl('')
  });


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.uploadedFileName = file.name;

      this.isExtracting = true;

      // 1. Prepare the data
      const formData = new FormData();
      formData.append('file', file); // This key 'file' must match the FastAPI parameter name
      console.log("sending request..")
      // 2. Send to FastAPI
      this._profilesetup_http.post<any>('http://localhost:8000/upload-cv', formData).subscribe({
        next: (response) => {
          this.uploadSuccess = true;
          this.isExtracting = false;
          this.extractedCV = response.data
          const extractedData = response.data;


          if (extractedData && extractedData.skills) {
            // 2. Since 'Skills' is already an array ['C++', 'C#', ...], 
            // just assign it and clean up whitespace
            this.extractedSkills = extractedData.skills;
          }


          console.log('Successfully extracted and mapped:', response);
        },

        error: (err) => {
          this.isExtracting = false;
          console.error('Extraction failed:', err);
          alert('Error extracting CV data. Check console for details.');
        }
      });
    }
  }

  removeSkill(skill: string): void {
    this.extractedSkills = this.extractedSkills.filter(s => s !== skill);
  }

  addSkill(): void {
    if (this.newSkill.trim() && !this.extractedSkills.includes(this.newSkill.trim())) {
      this.extractedSkills.push(this.newSkill.trim());
      this.newSkill = '';
    }
  }

  pendingSkillNames: string[] = [];

  goToStep2(): void {
    this.pendingSkillNames = [...this.extractedSkills];
    this.currentStep = 2;
    this.mapExtractedDataToForm(this.extractedCV);
    this.extractedSkills = [];
  }

  goBack(): void {
    this.currentStep = 1;
  }
  isSaving = false;
  saveError = '';

  completeProfile(): void {
    this.student_form.markAllAsTouched();
    console.log('completeProfile called, form valid:', this.student_form.valid);
    console.log('form errors:', this.student_form.errors);
    console.log('major value:', this.student_form.get('major')?.value, 'valid:', this.student_form.get('major')?.valid);
    console.log('university value:', this.student_form.get('university')?.value, 'valid:', this.student_form.get('university')?.valid);

    if (!this.student_form.valid) {
      this.saveError = 'Please fill in all required fields (Major and University).';
      return;
    }

    const rawValue = this.student_form.value;
    const token = localStorage.getItem('token');
    console.log('token:', token ? 'found' : 'MISSING');

    if (!token) {
      this.saveError = 'You are not logged in. Please log in again.';
      return;
    }

    this.isSaving = true;
    this.saveError = '';

    const major_name = rawValue.major?.toLowerCase().replace(/\s+/g, '');
    const major_id = Majors[major_name as keyof typeof Majors];

    const yearVal = rawValue.graduationYear ? parseInt(rawValue.graduationYear as any, 10) : null;
    const certsRaw = rawValue.certifications ?? '';
    const certsArray = Array.isArray(certsRaw)
      ? certsRaw
      : certsRaw.split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0);

    const profilePayload = {
      major: major_id,
      university: rawValue.university,
      experience: rawValue.experience,
      gpa: rawValue.gpa ? parseFloat(rawValue.gpa as any) : null,
      graduationYear: yearVal,
      linkedinUrl: rawValue.linkedInUrl,
      githubUrl: rawValue.gitHubUrl,
      cvUrl: rawValue.cvUrl,
      certifications: certsArray
    };

    const headers = { 'Authorization': `Bearer ${token}` };

    this._profilesetup_http.put('http://localhost:5002/student/profile', profilePayload, { headers })
      .subscribe({
        next: () => {
          if (this.pendingSkillNames.length > 0) {
            this._profilesetup_http.get<any[]>('http://localhost:5002/skills').subscribe({
              next: (allSkills) => {
                const matched = allSkills.filter(s =>
                  this.pendingSkillNames.some(n => n.toLowerCase() === s.name.toLowerCase())
                );
                matched.forEach(s => {
                  this._profilesetup_http.post('http://localhost:5002/student/skills',
                    { skillId: s.id, experience: 0 }, { headers }
                  ).subscribe();
                });
                this.router.navigate(['/student-dashboard']);
              },
              error: () => this.router.navigate(['/student-dashboard'])
            });
          } else {
            this.router.navigate(['/student-dashboard']);
          }
        },
        error: (err) => {
          this.isSaving = false;
          this.saveError = err.error?.error ?? err.error?.message ?? `Error ${err.status}: Failed to save profile.`;
          console.error('Profile save failed:', err);
        }
      });
  }
  private mapExtractedDataToForm(data: any) {
    console.log(data)
    this.student_form.patchValue({
      major: data.major,
      university: data.university,
      gpa: data.gpa,
      graduationYear: data.graduationYear,
      experience: data.experience,
      linkedInUrl: data.linkedInUrl,
      gitHubUrl: data.gitHubUrl,
      certifications: data.certifications ? data.certifications.join(', ') : ''
    });
  }
}