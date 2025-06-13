# Backend/app.py
import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import pandas as pd

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from Backend.processing.batch_processor import process_resumes, process_single_resume

app = Flask(__name__)
CORS(app)

UPLOAD_DIR = "uploads"
JD_PATH = "dummy_jd.txt" # Path to your dummy job description file
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"}), 200

@app.route("/evaluate", methods=["POST"])
def evaluate_resume():
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file provided"}), 400

    file = request.files['resume']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_DIR, filename)
        file.save(filepath)
        
        try:
            results = process_single_resume(filepath, JD_PATH)
            return jsonify(results)
        except Exception as e:
            print(f"❌ Error processing resume: {e}")
            return jsonify({"error": str(e)}), 500

@app.route("/evaluate-csv", methods=["POST"])
def evaluate_csv_resumes():
    if 'csv_file' not in request.files:
        return jsonify({"error": "No CSV file provided"}), 400

    csv_file = request.files['csv_file']
    if csv_file.filename == '':
        return jsonify({"error": "No selected CSV file"}), 400

    if csv_file:
        csv_filename = secure_filename(csv_file.filename)
        csv_filepath = os.path.join(UPLOAD_DIR, csv_filename)
        csv_file.save(csv_filepath)

        try:
            df = pd.read_csv(csv_filepath)
            csv_results = []
            
            if 'resume_filename' not in df.columns:
                return jsonify({"error": "CSV must contain a 'resume_filename' column"}), 400

            for index, row in df.iterrows():
                resume_name = row['resume_filename']
                resume_path_for_processing = os.path.join(UPLOAD_DIR, resume_name)
                
                if not os.path.exists(resume_path_for_processing):
                    print(f"⚠️ Resume file not found: {resume_path_for_processing}")
                    csv_results.append({
                        "filename": resume_name,
                        "overall_score": "N/A",
                        "skills": [],
                        "recommendations": [f"Error: Resume file '{resume_name}' not found."]
                    })
                    continue

                try:
                    single_resume_result = process_single_resume(resume_path_for_processing, JD_PATH)
                    csv_results.append(single_resume_result)
                except Exception as e:
                    print(f"❌ Error processing resume {resume_name} from CSV: {e}")
                    csv_results.append({
                        "filename": resume_name,
                        "overall_score": "Error",
                        "skills": [],
                        "recommendations": [f"Error processing: {str(e)}"]
                    })
            
            return jsonify({"csv_results": csv_results})
        except Exception as e:
            print(f"❌ Error processing CSV file: {e}")
            return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
