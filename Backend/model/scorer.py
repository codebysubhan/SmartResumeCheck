# Backend/model/scorer.py
class Scorer:
    def __init__(self, model):
        self.model = model

    def score_resume(self, resume_text, jd_text):
        jd_vec = self.model.get_embedding(jd_text)
        resume_vec = self.model.get_embedding(resume_text)
        return float(round(self.model.cosine_similarity(resume_vec, jd_vec), 4))
