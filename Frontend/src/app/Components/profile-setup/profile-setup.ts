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

  goToStep2(): void {
    this.currentStep = 2;
    this.mapExtractedDataToForm(this.extractedCV)
    console.log(this.extractedSkills)
    this.extractedSkills = []
  }

  goBack(): void {
    this.currentStep = 1;
  }
  completeProfile(): void {
    if (this.student_form.valid) {
      const rawValue = this.student_form.value;

      const token = localStorage.getItem('token');
      let major_name = rawValue.major?.toLowerCase().replace(' ','')
      let major_id = Majors[major_name as keyof typeof Majors];

      const profilePayload = {
        major: major_id,
        university: rawValue.university,
        experience: rawValue.experience,
        gpa: rawValue.gpa, // Ensure it's a number for Prisma
        graduationYear: rawValue.graduationYear, // Ensure it's a number
        linkedinUrl: rawValue.linkedInUrl, // Backend uses lowercase 'i'
        githubUrl: rawValue.gitHubUrl,     // Backend uses lowercase 'h'
        cvUrl: rawValue.cvUrl,
        certifications: Array.isArray(rawValue.certifications)
          ? rawValue.certifications.join(', ') // Joins them into "Cert 1, Cert 2, Cert 3"
          : rawValue.certifications
      };

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      this._profilesetup_http.put('http://localhost:5002/student/profile', profilePayload, { headers })
        .subscribe({
          next: (res) => {
            console.log('Profile saved to DB!', res);
            this.router.navigate(['/student-dashboard']);
          },
          error: (err) => {
            console.error('Database save failed:', err);
          }
        });
    }
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