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
