import { internship_location } from '../ENUMs/internship-location';
import { InternshipSkill } from './internshipSkill'

export interface Internship {
  id: number;
  companyId: number;
  companyName?: string;
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