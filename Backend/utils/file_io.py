# Backend/utils/file_io.py
import os
import pandas as pd
from Backend.utils.extract_text import extract_text_generic

def read_job_description(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

def load_resume_data(csv_path):
    return pd.read_csv(csv_path)

def load_resumes_from_folder(folder_path):
    resumes = []
    for filename in os.listdir(folder_path):
        if filename.endswith(".pdf") or filename.endswith(".docx"):
            full_path = os.path.join(folder_path, filename)
            try:
                text = extract_text_generic(full_path)
                resumes.append({
                    "filename": filename,
                    "text": text
                })
            except Exception as e:
                print(f"❌ Failed to process {filename}: {e}")
    return resumes

def read_resume_file(file_path):
    try:
        text = extract_text_generic(file_path)
        return text
    except Exception as e:
        print(f"❌ Failed to read resume file {file_path}: {e}")
        raise
