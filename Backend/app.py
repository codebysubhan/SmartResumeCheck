# Backend/app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from Backend.processing.batch_processor import process_resumes

app = Flask(__name__)
CORS(app)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"}), 200

@app.route("/upload", methods=["POST"])
def upload_files():
    if 'job_description' not in request.files:
        return jsonify({"error": "Missing job description file"}), 400

    jd_file = request.files['job_description']
    resume_files = request.files.getlist('resumes')

    # Save job description
    jd_path = os.path.join(UPLOAD_DIR, "job_description.txt")
    jd_file.save(jd_path)

    # Create a temporary folder to hold resumes
    resume_folder = os.path.join(UPLOAD_DIR, "resumes")
    os.makedirs(resume_folder, exist_ok=True)

    # Clear previous files
    for f in os.listdir(resume_folder):
        os.remove(os.path.join(resume_folder, f))

    # Save all uploaded resumes
    for rfile in resume_files:
        if rfile.filename.endswith((".pdf", ".docx")):
            save_path = os.path.join(resume_folder, rfile.filename)
            rfile.save(save_path)

    # Run the ranking processor
    try:
        results = process_resumes(jd_path, resume_folder)
        return jsonify({"results": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/process-paths", methods=["POST"])
def process_from_paths():
    data = request.get_json()
    jd_path = data.get("jd_path")
    resume_folder = data.get("resume_folder")

    if not jd_path or not resume_folder:
        return jsonify({"error": "Missing jd_path or resume_folder"}), 400

    try:
        results = process_resumes(jd_path, resume_folder)
        return jsonify({"results": results})
    except Exception as e:
        print(f"❌ Error processing paths: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
