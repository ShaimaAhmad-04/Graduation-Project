from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


router = APIRouter()

# Load model once when the server starts
model = SentenceTransformer("all-MiniLM-L6-v2")


class MatchRequest(BaseModel):
    studentSkills: List[str]
    requiredSkills: List[str]


@router.post("/calculate-match")
async def calculate_match(data: MatchRequest):
    student_skills = [
        skill.strip().lower()
        for skill in data.studentSkills
        if skill and skill.strip()
    ]

    required_skills = [
        skill.strip().lower()
        for skill in data.requiredSkills
        if skill and skill.strip()
    ]

    if len(required_skills) == 0:
        return {
            "score": 0,
            "matchedSkills": [],
            "missingSkills": [],
            "details": []
        }

    if len(student_skills) == 0:
        return {
            "score": 0,
            "matchedSkills": [],
            "missingSkills": required_skills,
            "details": []
        }

    # Convert skills to embeddings
    student_embeddings = model.encode(student_skills)
    required_embeddings = model.encode(required_skills)

    # Compare every required skill with every student skill
    similarity_matrix = cosine_similarity(required_embeddings, student_embeddings)

    threshold = 0.65

    total_score = 0
    matched_skills = []
    missing_skills = []
    details = []

    for i, required_skill in enumerate(required_skills):
        similarities = similarity_matrix[i]

        best_match_index = similarities.argmax()
        best_score = float(similarities[best_match_index])
        best_student_skill = student_skills[best_match_index]

        if best_score >= threshold:
            matched_skills.append(required_skill)
            total_score += best_score

            details.append({
                "requiredSkill": required_skill,
                "matchedStudentSkill": best_student_skill,
                "similarity": round(best_score, 3),
                "status": "matched"
            })
        else:
            missing_skills.append(required_skill)

            details.append({
                "requiredSkill": required_skill,
                "matchedStudentSkill": best_student_skill,
                "similarity": round(best_score, 3),
                "status": "missing"
            })

    final_score = (total_score / len(required_skills)) * 100

    return {
        "score": round(final_score, 2),
        "matchedSkills": matched_skills,
        "missingSkills": missing_skills,
        "details": details
    }