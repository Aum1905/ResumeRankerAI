# ResumeRankerAI

**ResumeRankerAI** is an AI-powered resume screening and ranking system that compares a job description with multiple candidate resumes and generates an explainable ranking based on semantic similarity, skills, experience, and education.

The project combines a **React + Vite frontend** with a **FastAPI backend** and a **Sentence Transformer model** to perform semantic resume matching.

> **UI Name:** SmartHire AI  
> **Repository:** ResumeRankerAI

---

## 🚀 Features

- 📄 Upload multiple PDF and DOCX resumes
- 💼 Enter a job description
- 🤖 AI-powered semantic resume matching
- 🧠 Sentence Transformer based similarity analysis
- 🔍 Automatic skill extraction and matching
- 💼 Experience matching
- 🎓 Education and certification matching
- 📊 Explainable candidate scores
- 🏆 Automatic candidate ranking
- ✅ Candidate recommendations:
  - Shortlist
  - Maybe Review
  - Not Recommended
- 📥 Export ranking results as CSV
- ⚡ React + Vite frontend
- 🚀 FastAPI backend
- 🔌 REST API for resume ranking
- 🛡️ File type and file size validation

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────────┐
                         │      React Frontend      │
                         │       Vite + React       │
                         │                          │
                         │      SmartHire AI UI     │
                         └────────────┬─────────────┘
                                      │
                                      │ HTTP / REST API
                                      ▼
                         ┌──────────────────────────┐
                         │     FastAPI Backend      │
                         │         api.py            │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │      Ranking Engine      │
                         │    ranking_engine.py     │
                         └────────────┬─────────────┘
                                      │
                 ┌────────────────────┼────────────────────┐
                 │                    │                    │
                 ▼                    ▼                    ▼
        ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
        │ Resume Text    │   │ Skill Matching │   │ Experience &   │
        │ Extraction     │   │                │   │ Education      │
        └───────┬────────┘   └───────┬────────┘   └───────┬────────┘
                │                    │                    │
                └────────────────────┼────────────────────┘
                                     ▼
                         ┌──────────────────────────┐
                         │ Sentence Transformer     │
                         │ all-MiniLM-L6-v2         │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │ Hybrid Score Calculation │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │   Ranked Candidates      │
                         │   + Explanations         │
                         └──────────────────────────┘
🧠 How It Works

ResumeRankerAI follows a hybrid resume-ranking approach.

1. Job Description

The recruiter enters a job description containing the required skills, experience, education, and other requirements.

2. Resume Upload

Multiple candidate resumes can be uploaded in:

PDF
DOCX
3. Resume Text Extraction

The backend extracts text from uploaded resumes using:

PyMuPDF for PDF files
python-docx for DOCX files

DOCX processing also extracts text from tables.

4. Semantic Matching

The system uses:

sentence-transformers/all-MiniLM-L6-v2

to generate embeddings for the job description and resume content.

Cosine similarity is then used to calculate the semantic similarity score.

5. Skill Matching

The system identifies skills from the job description and resumes using a predefined skill list and aliases.

Examples include:

Python
Java
JavaScript
React
Node.js
SQL
MongoDB
Machine Learning
Deep Learning
NLP
FastAPI
AWS
Docker
Kubernetes
6. Experience Matching

The system extracts experience requirements and candidate experience from the text using pattern-based processing.

It supports formats such as:

2 years
3+ years
1.5 years
1-2 years
Fresher
Entry level
7. Education Matching

The system checks education and certification related keywords such as:

B.Tech
B.E
M.Tech
BCA
MCA
Computer Science
Engineering
Certification
Diploma
8. Final Ranking

The individual scores are combined into a final score and candidates are ranked accordingly.

📊 Scoring System

The current ranking engine uses the following weights:

Component	Weight
Semantic Similarity	60%
Skill Match	25%
Experience Match	10%
Education Match	5%
Total	100%
Formula
Final Score =
    (Semantic Score × 0.60)
  + (Skill Score × 0.25)
  + (Experience Score × 0.10)
  + (Education Score × 0.05)

The final score is normalized to a 0–100 scale.

🏆 Candidate Recommendations

Candidates are categorized based on their final score:

Score	Recommendation
75–100	Shortlist
50–74.99	Maybe Review
Below 50	Not Recommended

The application also provides:

Final score
Semantic similarity score
Skill score
Experience score
Education score
Matched skills
Missing skills
Candidate name
Resume filename
Recommendation
Reason for recommendation
🛠️ Tech Stack
Frontend
React 19
Vite
JavaScript
HTML
CSS
Backend
Python
FastAPI
Uvicorn
Python Multipart
AI / NLP
Sentence Transformers
all-MiniLM-L6-v2
Cosine Similarity
Keyword-based skill matching
Regular-expression based experience extraction
Document Processing
PyMuPDF
python-docx
Data / Machine Learning
NumPy
Scikit-learn
📁 Project Structure
ResumeRankerAI/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
│
├── sample_resumes/
│   ├── 1_strong_python_ml_resume.docx
│   ├── 2_medium_backend_resume.docx
│   ├── 3_weak_frontend_resume.docx
│   └── README.txt
│
├── api.py
├── ranking_engine.py
├── old_streamlit_prototype.py
├── requirements.txt
├── .gitignore
└── README.md
⚙️ Installation
Prerequisites

Make sure the following are installed:

Python 3.11+
Node.js
npm
Git
1. Clone the Repository
git clone https://github.com/Aum1905/ResumeRankerAI.git
cd ResumeRankerAI
2. Create a Virtual Environment
python -m venv venv
3. Activate the Virtual Environment
Windows
venv\Scripts\activate
macOS / Linux
source venv/bin/activate
4. Install Backend Dependencies
pip install -r requirements.txt
🎨 Frontend Setup

Open a new terminal and navigate to the frontend:

cd frontend

Install the frontend dependencies:

npm install
▶️ Running the Application

The application requires both the backend and frontend to be running.

Terminal 1 — FastAPI Backend

From the project root:

python -m uvicorn api:app --reload

The backend will run at:

http://127.0.0.1:8000

FastAPI documentation is available at:

http://127.0.0.1:8000/docs

Health check:

http://127.0.0.1:8000/health
Terminal 2 — React Frontend

Navigate to the frontend:

cd frontend

Start the Vite development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173

Open the URL in your browser.

🔌 API Endpoints
Health Check
GET /health

Used to verify that the FastAPI server is running.

Resume Ranking
POST /rank-resumes

The endpoint accepts:

Job description
Multiple PDF/DOCX resumes

The endpoint processes the uploaded resumes and returns ranked candidate results.

📤 Resume Upload Validation

The backend validates uploaded files before processing.

Supported Formats
.pdf
.docx
Maximum File Size
5 MB per resume

The backend rejects:

Unsupported file formats
Empty files
Files larger than 5 MB
Empty job descriptions
Requests without resumes
🧪 Sample Resumes

The sample_resumes/ directory contains sample resumes for testing the ranking system.

The sample candidates represent different profiles:

1. Strong Python / Machine Learning Resume
2. Medium Backend Resume
3. Weak Frontend Resume


🔄 Application Workflow
Enter Job Description
          │
          ▼
Upload Multiple Resumes
          │
          ▼
Validate Files
          │
          ▼
Extract Resume Text
          │
          ▼
Analyze Skills / Experience / Education
          │
          ▼
Generate Sentence Embeddings
          │
          ▼
Calculate Semantic Similarity
          │
          ▼
Calculate Hybrid Score
          │
          ▼
Rank Candidates
          │
          ▼
Display Explainable Results
          │
          ▼
Export Results as CSV
🔮 Future Improvements

Possible future improvements include:

Advanced Named Entity Recognition for resume parsing
Improved skill taxonomy and skill relationships
Better experience extraction
More advanced education and certification parsing
Support for additional resume formats
User authentication
Recruiter dashboards
Database integration
Job recommendation system
Resume improvement suggestions
Model fine-tuning using recruitment datasets
Cloud deployment
Automated model evaluation
Bias and fairness evaluation for ranking systems
⚠️ Current Limitations

The current system uses a predefined skill dictionary and rule-based extraction for some resume attributes.

Therefore:

Unlisted skills may not be detected by the skill matcher.
Complex resume layouts may affect text extraction.
Experience extraction relies on recognized textual patterns.
Semantic similarity is one component of the overall ranking and does not replace human review.

The system is intended as a resume screening and ranking aid, not as a replacement for human hiring decisions.



📄 License

This project is currently intended for educational, demonstration, and portfolio purposes.
