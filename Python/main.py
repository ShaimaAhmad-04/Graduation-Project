import os
import json
import fitz  # PyMuPDF
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI  # Use the Async version!
from dotenv import load_dotenv
import httpx # Use this instead of requests
from docx2python import docx2python
import aiofiles # For async file operations
import uvicorn

load_dotenv()

app = FastAPI()

# --- CORS CONFIGURATION ---
# Necessary so your Angular app on port 4200 doesn't get blocked
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:4200"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Initialize OpenAI Client (using your config/env)
ai_client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("BASE_URL")
)

@app.post("/upload-cv")
async def create_profile_from_cv(file: UploadFile = File(...)):
  try:
    file_bytes = await file.read()
    text = ""
    file_extension = file.filename.split('.')[-1].lower()
    # --- Handle PDF ---
    if file.content_type == "application/pdf" or file_extension == "pdf":
      print("Processing PDF...")
      doc = fitz.open(stream=file_bytes, filetype="pdf")
      text = "".join([page.get_text() for page in doc])

    # --- Handle DOCX ---
    elif file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" or file_extension == "docx":
      print("Processing DOCX...")
      # We save temporarily because docx2python works best with file paths
      temp_path = f"temp_{file.filename}"
      with open(temp_path, "wb") as f:
        f.write(file_bytes)

      with docx2python(temp_path) as docx_content:
        text = docx_content.text

      os.remove(temp_path)  # Clean up immediately

    else:
      raise HTTPException(
        status_code=400,
        detail="Unsupported file type. Please upload PDF or DOCX."
      )

    if not text.strip():
      raise HTTPException(status_code=400, detail="Could not extract text.")

    # 2. AI Parsing (Rest of your Groq logic remains the same)
    prompt = (
      f"Extract information from the following CV text and return ONLY a valid JSON object. "
      f"Use these exact keys and follow the data type instructions:\n\n"
      f"- 'major': string (e.g., 'Computer Science')\n"
      f"- 'university': string (Full name of the university)\n"
      f"- 'experience': string (A 2-3 sentence summary of work or internship experience)\n"
      f"- 'gpa': number (Float value out of 4.0, e.g., 3.95)\n"
      f"- 'graduationYear': number (The 4-digit year only, e.g., 2026)\n if doesnt exists leave null"
      f"- 'linkedInUrl': string (Full URL or empty string if not found)\n"
      f"- 'gitHubUrl': string (Full URL or empty string if not found)\n"
      f"- 'certifications': array of strings (List names of certificates and institution and year )\n"
      f"- 'skills': array of strings (A flat list of all technical and soft skills)\n"
      f"- 'phone': string (Found contact number or empty string)\n\n  "
      f"CV Text: {text}"
    )
    ai_response = await ai_client.chat.completions.create(
      model=os.getenv("MODEL_NAME"),
      messages=[{"role": "user", "content": prompt}],
      response_format={"type": "json_object"}
    )

    structured_data = json.loads(ai_response.choices[0].message.content)
    return {
      "status": "success",
      "data": structured_data
    }

  except Exception as e:
    print(f"System Error: {e}")
    raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
  import uvicorn

  uvicorn.run(app, host="0.0.0.0", port=8000)
