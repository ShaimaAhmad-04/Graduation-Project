import { Routes } from '@angular/router';
import { Homepage } from './Components/homepage/homepage';
import { RecruiterDashboard } from './Components/recruiter-dashboard/recruiter-dashboard';
import { InternshipListComponent } from './Components/internship-list/internship-list';
import { InternshipDetailComponent } from './Components/internship-detail/internship-detail';
import { LoginComponent } from './Components/login/login';
import { Signup } from './Components/signup/signup';
import { StudentDashboard } from './Components/student-dashboard/student-dashboard';
import { StudentSettings } from './Components/student-settings/student-settings';
import { RecruiterSettings } from './Components/recruiter-settings/recruiter-settings';
import { ProfileSetup } from './Components/profile-setup/profile-setup';
import { AdminDashboard } from './Components/admin-dashboard/admin-dashboard';
import { authGuard } from './auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'homepage', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: Signup },
  { path: 'homepage', component: Homepage },
  { path: 'student-dashboard', component: StudentDashboard, canActivate: [authGuard] },
  { path: 'student-settings', component: StudentSettings, canActivate: [authGuard] },
  { path: 'profile-setup', component: ProfileSetup, canActivate: [authGuard] },
  { path: 'internships', component: InternshipListComponent, canActivate: [authGuard] },
  { path: 'internships/:id', component: InternshipDetailComponent, canActivate: [authGuard] },
  { path: 'recruiter-dashboard', component: RecruiterDashboard, canActivate: [authGuard] },
  { path: 'recruiter-settings', component: RecruiterSettings, canActivate: [authGuard] },
  { path: 'admin-dashboard', component: AdminDashboard, canActivate: [authGuard] },
];