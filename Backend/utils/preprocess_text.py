# Backend/utils/preprocess_text.py
import spacy
from nltk.corpus import stopwords
import nltk

nltk.download('stopwords')

nlp = spacy.load("en_core_web_sm")
stop_words = set(stopwords.words('english'))

def clean_text(text):
    doc = nlp(text.lower())
    return " ".join([
        token.lemma_ for token in doc
        if token.is_alpha and token.text not in stop_words
    ])

def extract_skills(text):
    doc = nlp(text.lower())
    skills = set()
    # Extract noun phrases as potential skills
    for chunk in doc.noun_chunks:
        skills.add(chunk.text)
    # Extract proper nouns as potential skills
    for ent in doc.ents:
        if ent.label_ == "ORG" or ent.label_ == "PRODUCT" or ent.label_ == "GPE": # Common entities that might be skills/technologies
            skills.add(ent.text)
    
    # Add a simple keyword-based approach for common skills
    keywords = ["python", "java", "javascript", "react", "sql", "aws", "azure", "docker", "kubernetes", "machine learning", "data analysis", "project management", "communication", "leadership"]
    for keyword in keywords:
        if keyword in text.lower():
            skills.add(keyword)

    return list(skills)
