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
