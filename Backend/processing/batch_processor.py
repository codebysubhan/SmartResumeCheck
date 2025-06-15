from ..utils.file_io import read_job_description, load_resumes_from_folder, read_resume_file
from ..utils.preprocess_text import clean_text, extract_skills
from ..model.sbert_model import SBERTModel
from ..model.scorer import Scorer
import os

def process_resumes(jd_path, resume_folder):
    model = SBERTModel()  # No longer using get_sbert_instance
    scorer = Scorer(model)

    jd_text = read_job_description(jd_path)
    jd_clean = clean_text(jd_text)

    resumes = load_resumes_from_folder(resume_folder)
    results = []

    for resume in resumes:
        resume_clean = clean_text(resume["text"])
        score = scorer.score_resume(resume_clean, jd_clean)

        results.append({
            "filename": resume["filename"],
            "score": round(score*100,2)
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results

def process_single_resume(resume_path, jd_path):
    model = SBERTModel()
    scorer = Scorer(model)

    jd_text = read_job_description(jd_path)
    jd_clean = clean_text(jd_text)

    resume_text = read_resume_file(resume_path)
    resume_clean = clean_text(resume_text)

    score = scorer.score_resume(resume_clean, jd_clean)

    # Define some dummy target skills for demonstration
    target_skills = ["python", "java", "javascript", "react", "sql", "aws", "docker", "project management", "communication", "leadership", "data analysis"]
    
    extracted_skills = extract_skills(resume_text)
    matched_skills = []
    for skill in target_skills:
        if skill.lower() in [s.lower() for s in extracted_skills]:
            matched_skills.append({"name": skill, "match": 100}) 
        else:
            matched_skills.append({"name": skill, "match": 0})

    recommendations = []
    if score < 50:
        recommendations.append("Consider gaining more relevant experience or certifications.")
        recommendations.append("Tailor your resume more closely to the job description.")
    elif score < 75:
        recommendations.append("Highlight your key achievements and quantifiable results.")
        recommendations.append("Strengthen your skills in areas related to the job requirements.")
    else:
        recommendations.append("Excellent match! Consider adding a cover letter emphasizing your strengths.")

    for skill in target_skills:
        if skill.lower() not in [s.lower() for s in extracted_skills] and skill in ["python", "java", "sql"]:
            recommendations.append(f"Consider developing stronger skills in {skill}.")

    return {
        "filename": os.path.basename(resume_path),
        "overall_score": round(score * 100, 2),
        "skills": matched_skills,
        "recommendations": list(set(recommendations))
    }
