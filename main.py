from fastapi import FastAPI, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import requests
import io
from typing import List
try:
    import PyPDF2
except Exception:
    PyPDF2 = None
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")

# In-memory storage for uploaded program content (simple MVP).
# You can replace this with a persistent store or vector DB later.
PROGRAM_TEXT = ""


def _text_chunks(text: str, chunk_size: int = 1000) -> List[str]:
    # naive chunk by paragraphs and then into fixed-size slices
    paras = [p.strip() for p in text.split("\n") if p.strip()]
    chunks = []
    cur = ""
    for p in paras:
        if len(cur) + len(p) + 1 <= chunk_size:
            cur = (cur + "\n" + p).strip()
        else:
            if cur:
                chunks.append(cur)
            cur = p
    if cur:
        chunks.append(cur)
    return chunks


def _get_relevant_context(query: str, text: str, max_chars: int = 1200) -> str:
    if not text:
        return ""
    query_tokens = set([t.lower() for t in query.split() if len(t) > 2])
    chunks = _text_chunks(text, chunk_size=800)
    scored = []
    for c in chunks:
        c_tokens = set([t.lower().strip(".,;:()\"'`)[]") for t in c.split() if len(t) > 2])
        score = len(query_tokens & c_tokens)
        scored.append((score, c))
    scored.sort(key=lambda x: x[0], reverse=True)
    selected = [c for s, c in scored if s > 0][:3]
    if not selected:
        # fallback: return beginning of document
        return text[:max_chars]
    out = "\n\n".join(selected)
    return out[:max_chars]

@app.post("/api/gemini")
async def get_gemini_data(request: Request):
    body = await request.json()
    query = body.get("query", "").strip()

    if not query:
        return {"error": "Missing query"}

    if not GEMINI_API_KEY:
        return {"error": "Server missing Gemini API key. Set GEMINI_API_KEY or VITE_GEMINI_API_KEY."}

    # Correct endpoint and format (keep model name as configured/available for your account)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}

    # If program text has been uploaded, extract the most relevant context and include it in the prompt.
    context_snippet = _get_relevant_context(query, PROGRAM_TEXT) if PROGRAM_TEXT else ""

    prompt_text = ""
    if context_snippet:
        prompt_text += (
            "Context from MDC program (relevant excerpts):\n" + context_snippet + "\n\n"
        )
    prompt_text += (
        f"Provide 3 concise, clear suggestions for someone pursuing a career as a {query}. "
        "List each suggestion on a new line with no extra text or numbering."
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt_text
                    }
                ]
            }
        ]
    }

    def _extract_text_from_response(data: dict) -> str:
        candidates = data.get("candidates") or []
        if candidates:
            content = candidates[0].get("content", {})
            parts = content.get("parts", [])
            if parts and isinstance(parts[0], dict):
                return parts[0].get("text", "").strip()
        return ""

    def _redact_key(s: str) -> str:
        if not s or not GEMINI_API_KEY:
            return s
        return s.replace(GEMINI_API_KEY, "[REDACTED]")

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        print("Gemini status:", response.status_code)
        print("Gemini raw response (redacted):", _redact_key(response.text[:800]))
        response.raise_for_status()
        data = response.json()
        text_output = _extract_text_from_response(data)
        return {"text": text_output}

    except requests.exceptions.RequestException as e:
        err_str = _redact_key(str(e))
        print("Request error:", err_str)
        return {"error": err_str}


@app.post("/api/upload_program")
async def upload_program(file: UploadFile = File(...)):
    """Upload a PDF containing the MDC program content. The server will extract text
    and store it in-memory for subsequent Gemini queries."""
    global PROGRAM_TEXT

    if PyPDF2 is None:
        return {"error": "PyPDF2 is not installed on the server. Install it with 'pip install PyPDF2'."}

    if not file.filename.lower().endswith(".pdf"):
        return {"error": "Only PDF uploads are accepted."}

    try:
        # Read bytes from the uploaded file and feed to PyPDF2
        contents = await file.read()
        reader = PyPDF2.PdfReader(io.BytesIO(contents))
        texts = []
        for page in reader.pages:
            try:
                texts.append(page.extract_text() or "")
            except Exception:
                # best-effort: skip page if extraction fails
                continue
        PROGRAM_TEXT = "\n\n".join(t.strip() for t in texts if t and t.strip())
        print(f"Uploaded program file: {file.filename} (chars={len(PROGRAM_TEXT)})")
        return {"ok": True, "message": f"Uploaded and extracted {len(PROGRAM_TEXT)} characters."}

    except Exception as e:
        print("Upload error:", str(e))
        return {"error": str(e)}
