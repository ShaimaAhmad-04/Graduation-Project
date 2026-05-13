import { internship_location } from '../ENUMs/internship-location';
import { Company } from './icompany';
import { InternshipSkill } from './internshipSkill'

export interface Internship {
  id: number;
  company? :Company;
  title: string;
  description?: string;
  postDate: Date;
  submissionDeadline: Date;
  duration?: string;
  location: internship_location;
  active: boolean;
  isPaid: boolean;
  skills: InternshipSkill[];
}