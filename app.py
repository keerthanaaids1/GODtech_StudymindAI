from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import requests
import json
import PyPDF2
import io

app = Flask(__name__)
CORS(app)

OLLAMA_URL = "http://localhost:11434/api/generate"

# ─── RECOMMENDED MODEL ──────────────────────────────────────────────────────
# llama3.2:3b  → Best for most PCs. Fast + smart. Needs ~6GB RAM.  ← USE THIS
# llama3.1:8b  → Smarter answers. Needs 16GB RAM or a GPU.
# mistral:7b   → Great at structured answers. Needs ~10GB RAM.
# gemma:2b     → Fastest but weakest. Only if you have low RAM.
#
# To download: open terminal and run →  ollama pull llama3.2:3b
# ─────────────────────────────────────────────────────────────────────────────
MODEL = "llama3.2:3b"

# In-memory notes store  { session_id: "extracted text..." }
notes_store = {}


def build_prompt(question: str, session_id: str) -> str:
    note = notes_store.get(session_id, "")
    system = (
        "You are StudyMindAI, a smart study assistant. "
        "Answer clearly and accurately. Use markdown: **bold** key terms, "
        "`code` for code, bullet points for lists, numbered steps for procedures."
    )
    if note:
        return (
            f"{system}\n\n"
            f"The student has uploaded these notes for context:\n"
            f"---\n{note[:6000]}\n---\n\n"
            f"Answer using the notes if relevant, otherwise use your own knowledge.\n\n"
            f"Question: {question}"
        )
    return f"{system}\n\nQuestion: {question}"


# ─── STREAM CHAT ─────────────────────────────────────────────────────────────
@app.route("/ask", methods=["POST"])
def ask_ai():
    data = request.json or {}
    question = data.get("question", "").strip()
    session_id = data.get("session_id", "default")

    if not question:
        return jsonify({"error": "No question provided"}), 400

    prompt = build_prompt(question, session_id)

    def generate():
        try:
            resp = requests.post(
                OLLAMA_URL,
                json={"model": MODEL, "prompt": prompt, "stream": True},
                stream=True,
                timeout=120,
            )
            for line in resp.iter_lines():
                if line:
                    try:
                        obj = json.loads(line.decode("utf-8"))
                        token = obj.get("response", "")
                        done = obj.get("done", False)
                        yield f"data: {json.dumps({'token': token, 'done': done})}\n\n"
                        if done:
                            break
                    except json.JSONDecodeError:
                        continue
        except requests.exceptions.ConnectionError:
            msg = "⚠️ Ollama is not running. Open a terminal and run: ollama serve"
            yield f"data: {json.dumps({'token': msg, 'done': True})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'token': f'⚠️ Error: {str(e)}', 'done': True})}\n\n"

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ─── UPLOAD NOTES (PDF or TXT) ───────────────────────────────────────────────
@app.route("/upload_notes", methods=["POST"])
def upload_notes():
    session_id = request.form.get("session_id", "default")
    file = request.files.get("file")

    if not file:
        return jsonify({"error": "No file provided"}), 400

    filename = file.filename.lower()
    content = file.read()
    extracted = ""

    if filename.endswith(".pdf"):
        try:
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    extracted += t + "\n"
        except Exception as e:
            return jsonify({"error": f"PDF read error: {e}"}), 400

    elif filename.endswith(".txt") or filename.endswith(".md"):
        try:
            extracted = content.decode("utf-8")
        except Exception:
            extracted = content.decode("latin-1", errors="ignore")

    else:
        return jsonify({"error": "Only PDF and TXT files supported"}), 400

    extracted = extracted.strip()
    if not extracted:
        return jsonify({"error": "Could not extract text from file"}), 400

    notes_store[session_id] = extracted
    return jsonify({
        "success": True,
        "chars": len(extracted),
        "preview": extracted[:200] + ("..." if len(extracted) > 200 else ""),
    })


# ─── CLEAR NOTES ─────────────────────────────────────────────────────────────
@app.route("/clear_notes", methods=["POST"])
def clear_notes():
    session_id = request.json.get("session_id", "default")
    notes_store.pop(session_id, None)
    return jsonify({"success": True})


# ─── HEALTH CHECK ────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=2)
        models = [m["name"] for m in r.json().get("models", [])]
        return jsonify({"ollama": "connected", "model": MODEL, "available_models": models})
    except Exception:
        return jsonify({"ollama": "offline", "model": MODEL})


if __name__ == "__main__":
    print(f"\n🚀 StudyMindAI backend running on http://localhost:5000")
    print(f"📦 Model: {MODEL}")
    print(f"💡 If Ollama is not running, open a terminal and run: ollama serve\n")
    app.run(port=5000, debug=True, threaded=True)
