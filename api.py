from typing import List

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from ranking_engine import load_model, rank_resume_files


app = FastAPI(
    title="SmartHire AI Resume Ranking API",
    description="FastAPI backend that hosts the Sentence Transformer model and hybrid scoring logic.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """Load the model once when the backend starts."""
    load_model()


@app.get("/health")
def health_check():
    """Simple endpoint to confirm that the FastAPI backend is running."""
    return {
        "status": "ok",
        "message": "SmartHire AI FastAPI model server is running",
    }


@app.post("/rank-resumes")
async def rank_resumes_api(
    job_description: str = Form(...),
    resumes: List[UploadFile] = File(...),
):
    """Accept a job description and multiple resumes, then return ranked results."""
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    if not resumes:
        raise HTTPException(status_code=400, detail="Please upload at least one resume.")

    resume_files = []

    for resume in resumes:
        file_name = resume.filename or "uploaded_resume"
        lower_file_name = file_name.lower()

        if not lower_file_name.endswith((".pdf", ".docx")):
            raise HTTPException(
                status_code=400,
                detail=f"{file_name} is not a supported PDF or DOCX file.",
            )

        file_bytes = await resume.read()

        if not file_bytes:
            raise HTTPException(status_code=400, detail=f"{file_name} is empty.")

        if len(file_bytes) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail=f"{file_name} is too large. Please upload a file below 5 MB.",
            )

        resume_files.append(
            {
                "file_name": file_name,
                "file_bytes": file_bytes,
            }
        )

    try:
        return rank_resume_files(job_description, resume_files)
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
