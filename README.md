# ResumeRankerAI

ResumeRankerAI, shown as SmartHire AI in the interface, is a viva-ready AI resume ranking demo. It compares a job description with multiple resumes and returns explainable ranked results.

## Final Architecture

```text
React/Vite Frontend -> FastAPI Backend -> ranking_engine.py -> Sentence Transformer Model -> Ranked Results
```

- Final frontend: `http://localhost:5173`
- Backend API: `http://127.0.0.1:8000`
- `api.py` exposes the FastAPI endpoints.
- `ranking_engine.py` handles resume text extraction, semantic matching, skill matching, experience matching, education/certification matching, and final ranking.
- `old_streamlit_prototype.py` was the old Streamlit prototype and is not used in the final demo.

## Features

- Accepts a job description from the React frontend.
- Accepts multiple PDF and DOCX resume uploads.
- Extracts PDF text using PyMuPDF.
- Extracts DOCX text using python-docx, including paragraphs and table cells.
- Uses `sentence-transformers/all-MiniLM-L6-v2` for semantic similarity.
- Uses cosine similarity for semantic score calculation.
- Ranks candidates by final score in descending order.
- Shows final score, semantic score, skill score, experience score, education score, matched skills, missing skills, recommendation, reason, file name, and candidate name when available.
- Supports CSV download from the React frontend.

## Scoring Formula

The final score is calculated with the required fixed weights:

```text
Final Score =
60% Semantic Similarity
+ 25% Skill Match
+ 10% Experience Match
+ 5% Education/Certification Match
```

In code:

```python
SEMANTIC_WEIGHT = 0.60
SKILL_WEIGHT = 0.25
EXPERIENCE_WEIGHT = 0.10
EDUCATION_WEIGHT = 0.05
```

## Recommendation Rules

- Final Score >= 75: Shortlist
- Final Score >= 50 and < 75: Maybe Review
- Final Score < 50: Not Recommended

## API Endpoints

Health check:

```text
GET /health
```

Resume ranking:

```text
POST /rank-resumes
```

The ranking endpoint accepts:

- `job_description` as a form field
- `resumes` as multiple uploaded PDF/DOCX files

Each ranking result includes `rank`, `candidate_name`, `file_name`, `final_score`, `semantic_score`, `skill_score`, `experience_score`, `education_score`, `matched_skills`, `missing_skills`, `recommendation`, and `reason`.

## Setup

Install backend dependencies:

```powershell
pip install -r requirements.txt
```

Install frontend dependencies:

```powershell
cd frontend
npm install
```

The Sentence Transformer model downloads the first time it is installed/cached. After dependencies and the model are installed, the app can work offline.

## How To Run

Open two terminals in the project folder.

Terminal 1: start the FastAPI backend:

```powershell
python -m uvicorn api:app --reload
```

Terminal 2: start the React/Vite frontend:

```powershell
cd frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

Backend health check:

```text
http://127.0.0.1:8000/health
```

## Demo Data

Use `sample_resumes/` for viva demo files. The included README in that folder gives a recommended job description and expected ranking.
