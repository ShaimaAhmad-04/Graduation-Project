import { Application } from "./iapplication";
import { skill } from "./iskill";
import { User } from "./iuser";
import { student_skill } from "./student-skill";

export interface Student extends User {
    major: number ;
    university: string | null;
    experience: string | null;
    gpa: number | null;
    graduationYear: number | null;
    linkedInUrl: string | null;
    gitHubUrl: string | null;
    certifications: string[];
    cvUrl: string | null;
    phone:string | null
    studentSkills?: student_skill[];
}