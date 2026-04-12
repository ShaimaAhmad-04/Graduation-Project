import { SkillExperience } from '../ENUMs/skillLevel'



export interface student_skill {
    skill_id: number;
    studentId: number;
    experience: SkillExperience | null;
}