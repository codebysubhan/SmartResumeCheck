# SmartResumeCheck

An AI-powered resume evaluation system that helps both students and HR professionals evaluate resumes against job descriptions.

## Features

- **Student Mode**: Detailed resume evaluation with skill matching and personalized recommendations
- **HR Mode**: Bulk resume evaluation for efficient candidate screening
- Real-time skill extraction from job descriptions
- Support for PDF and DOCX file formats
- Detailed analysis and scoring system
- Export functionality for results

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn package manager

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. (Optional) Create the uploads directory if it doesn't exist:
   ```bash
   mkdir uploads
   ```
4. Start the backend server:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

## Running the Application

### Start the Backend Server

1. Make sure you're in the Backend directory and your virtual environment is activated
2. Run the Flask server:
```bash
python app.py
```
The backend server will start on `http://localhost:5000`

### Start the Frontend Development Server

1. Open a new terminal window
2. Navigate to the frontend directory
3. Start the development server:
```bash
npm start
# or
yarn start
```
The frontend will start on `http://localhost:3000`

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Choose between Student Mode or HR Mode
3. Enter a job description
4. Upload resume(s):
   - Student Mode: Upload a single resume
   - HR Mode: Upload multiple resumes or a folder of resumes
5. View the evaluation results

## API Endpoints

### Student Mode
- `POST /evaluate`
  - Accepts: Resume file and job description
  - Returns: Overall score, skills match, and recommendations

### HR Mode
- `POST /evaluate-folder`
  - Accepts: Multiple resume files and job description
  - Returns: List of resume evaluations with scores

## File Format Support

- PDF (.pdf)
- Microsoft Word (.docx)

## Troubleshooting

1. If the backend server fails to start:
   - Check if port 5000 is available
   - Ensure all Python dependencies are installed
   - Verify the virtual environment is activated

2. If the frontend fails to start:
   - Check if port 3000 is available
   - Ensure all npm dependencies are installed
   - Clear npm cache if needed: `npm cache clean --force`

3. If file uploads fail:
   - Check file size limits
   - Verify file formats
   - Ensure the uploads directory exists and has proper permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request


