import os
import json
import uuid
import fitz
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from openai import AsyncOpenAI
from dotenv import load_dotenv
from docx2python import docx2python
import uvicorn

from matching import router as matching_router

load_dotenv()

app = FastAPI()

# Serve uploaded CVs as static files at /uploads
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include matching routes
app.include_router(matching_router)

# --- CORS CONFIGURATION ---
# Necessary so your Angular app on port 4200 and Node backend on port 5002 don't get blocked
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://localhost:5002"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI Client
ai_client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("BASE_URL")
)


@app.post("/upload-cv")
async def create_profile_from_cv(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        text = ""
        file_extension = file.filename.split(".")[-1].lower()

        # --- Handle PDF ---
        if file.content_type == "application/pdf" or file_extension == "pdf":
            print("Processing PDF...")
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            text = "".join([page.get_text() for page in doc])

        # --- Handle DOCX ---
        elif (
            file.content_type
            == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            or file_extension == "docx"
        ):
            print("Processing DOCX...")

            temp_path = f"temp_{file.filename}"

            with open(temp_path, "wb") as f:
                f.write(file_bytes)

            with docx2python(temp_path) as docx_content:
                text = docx_content.text

            os.remove(temp_path)

        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please upload PDF or DOCX."
            )

        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text.")

        prompt = (
            "Extract information from the following CV text and return ONLY a valid JSON object. "
            "Use these exact keys and follow the data type instructions:\n\n"
            "- 'major': string (e.g., 'Computer Science')\n"
            "- 'university': string (Full name of the university)\n"
            "- 'experience': string (A 2-3 sentence summary of work or internship experience)\n"
            "- 'gpa': number (Float value out of 4.0, e.g., 3.95)\n"
            "- 'graduationYear': number (The 4-digit year only, e.g., 2026; if it doesn't exist, return null)\n"
            "- 'linkedInUrl': string (Full URL or empty string if not found)\n"
            "- 'gitHubUrl': string (Full URL or empty string if not found)\n"
            "- 'certifications': array of strings (List names of certificates, institution, and year)\n"
            "- 'skills': array of strings (A flat list of all technical and soft skills)\n"
            "- 'phone': string (Found contact number or empty string)\n\n"
            f"CV Text: {text}"
        )

        ai_response = await ai_client.chat.completions.create(
            model=os.getenv("MODEL_NAME"),
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )

        structured_data = json.loads(ai_response.choices[0].message.content)

        # Save the original file so recruiters can download it
        ext = file_extension if file_extension in ("pdf", "docx") else "pdf"
        saved_filename = f"{uuid.uuid4()}.{ext}"
        saved_path = os.path.join(UPLOAD_DIR, saved_filename)
        with open(saved_path, "wb") as f:
            f.write(file_bytes)
        cv_url = f"http://localhost:8000/uploads/{saved_filename}"

        return {
            "status": "success",
            "data": structured_data,
            "cvUrl": cv_url
        }

    except Exception as e:
        print(f"System Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)