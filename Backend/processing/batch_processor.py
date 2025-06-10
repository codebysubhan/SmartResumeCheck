from Backend.utils.file_io import read_job_description, load_resumes_from_folder
from Backend.utils.preprocess_text import clean_text
from Backend.model.sbert_model import SBERTModel
from Backend.model.scorer import Scorer

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
