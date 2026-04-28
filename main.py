from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import os
import shutil
from rag import RAGEngine

app = FastAPI(title="StudyMind AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

rag_engines = {}

class ChatRequest(BaseModel):
    notebook_id: str
    message: str

class GenerateRequest(BaseModel):
    notebook_id: str
    type: str  # flashcards, quiz, concepts

@app.get("/")
def root():
    return {"status": "StudyMind AI Backend Running"}

@app.post("/notebook/create")
def create_notebook(name: str):
    notebook_id = name.lower().replace(" ", "_")
    nb_dir = os.path.join(UPLOAD_DIR, notebook_id)
    os.makedirs(nb_dir, exist_ok=True)
    return {"notebook_id": notebook_id, "name": name}

@app.get("/notebooks")
def list_notebooks():
    notebooks = []
    if os.path.exists(UPLOAD_DIR):
        for item in os.listdir(UPLOAD_DIR):
            item_path = os.path.join(UPLOAD_DIR, item)
            if os.path.isdir(item_path):
                files = [f for f in os.listdir(item_path) if f.endswith(".pdf") or f.endswith(".txt")]
                notebooks.append({
                    "id": item,
                    "name": item.replace("_", " ").title(),
                    "file_count": len(files),
                    "files": files
                })
    return {"notebooks": notebooks}

@app.post("/upload/{notebook_id}")
async def upload_file(notebook_id: str, file: UploadFile = File(...)):
    nb_dir = os.path.join(UPLOAD_DIR, notebook_id)
    os.makedirs(nb_dir, exist_ok=True)

    if not (file.filename.endswith(".pdf") or file.filename.endswith(".txt")):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files supported")

    file_path = os.path.join(nb_dir, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Index the document
    engine = get_or_create_engine(notebook_id)
    engine.add_document(file_path)

    return {"message": f"File {file.filename} uploaded and indexed successfully"}

@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        engine = get_or_create_engine(req.notebook_id)
        result = engine.query(req.message)
        return {
            "response": result["answer"],
            "sources": result["sources"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate")
async def generate(req: GenerateRequest):
    try:
        engine = get_or_create_engine(req.notebook_id)
        if req.type == "flashcards":
            result = engine.generate_flashcards()
        elif req.type == "quiz":
            result = engine.generate_quiz()
        elif req.type == "concepts":
            result = engine.generate_concepts()
        else:
            raise HTTPException(status_code=400, detail="Invalid type")
        return {"result": result, "type": req.type}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/notebook/{notebook_id}")
def delete_notebook(notebook_id: str):
    nb_dir = os.path.join(UPLOAD_DIR, notebook_id)
    if os.path.exists(nb_dir):
        shutil.rmtree(nb_dir)
    if notebook_id in rag_engines:
        del rag_engines[notebook_id]
    return {"message": "Notebook deleted"}

def get_or_create_engine(notebook_id: str) -> RAGEngine:
    if notebook_id not in rag_engines:
        rag_engines[notebook_id] = RAGEngine(notebook_id)
    return rag_engines[notebook_id]

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
