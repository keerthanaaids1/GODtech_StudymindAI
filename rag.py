import os
import json
import PyPDF2
import requests

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL = "llama3"

def ask_ollama(prompt):
    try:
        r = requests.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False
        }, timeout=120)
        return r.json().get("response", "No response")
    except Exception as e:
        return f"Error: {str(e)}"

class RAGEngine:
    def __init__(self, notebook_id):
        self.notebook_id = notebook_id
        self.texts = []
        store_file = f"./uploads/{notebook_id}/store.json"
        if os.path.exists(store_file):
            with open(store_file, "r", encoding="utf-8") as f:
                self.texts = json.load(f)

    def save_store(self):
        store_file = f"./uploads/{self.notebook_id}/store.json"
        os.makedirs(os.path.dirname(store_file), exist_ok=True)
        with open(store_file, "w", encoding="utf-8") as f:
            json.dump(self.texts, f)

    def add_document(self, file_path):
        if file_path.endswith(".pdf"):
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for i, page in enumerate(reader.pages):
                    text = page.extract_text()
                    if text and text.strip():
                        self.texts.append({"source": os.path.basename(file_path), "page": i+1, "text": text[:1000]})
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
            chunks = [text[i:i+1000] for i in range(0, len(text), 800)]
            for i, chunk in enumerate(chunks):
                self.texts.append({"source": os.path.basename(file_path), "page": i+1, "text": chunk})
        self.save_store()

    def get_context(self):
        context = ""
        for t in self.texts[:4]:
            context += f"\n[Source: {t['source']} Page {t['page']}]\n{t['text']}\n"
        return context

    def query(self, question):
        if not self.texts:
            return {"answer": "No documents uploaded yet. Please upload a PDF or text file first.", "sources": []}
        context = self.get_context()
        prompt = f"You are a helpful study assistant. Use the document content below to answer the question.\n\nDocument:\n{context}\n\nQuestion: {question}\n\nAnswer:"
        answer = ask_ollama(prompt)
        sources = [{"file": t["source"], "page": t["page"], "score": 1.0, "text": t["text"][:150]} for t in self.texts[:2]]
        return {"answer": answer, "sources": sources}

    def generate_flashcards(self):
        if not self.texts:
            return [{"question": "No documents uploaded", "answer": "Please upload a document first"}]
        context = self.get_context()
        prompt = f"Based on this content, generate 6 flashcards.\nFormat:\nCARD 1:\nQ: question\nA: answer\n\nContent:\n{context}\n\nGenerate flashcards:"
        response = ask_ollama(prompt)
        cards = []
        for block in response.split("CARD ")[1:]:
            lines = block.strip().split("\n")
            q = next((l.replace("Q:", "").strip() for l in lines if l.strip().startswith("Q:")), None)
            a = next((l.replace("A:", "").strip() for l in lines if l.strip().startswith("A:")), None)
            if q and a:
                cards.append({"question": q, "answer": a})
        return cards if cards else [{"question": "What is the main topic?", "answer": "Review the document."}]

    def generate_quiz(self):
        if not self.texts:
            return []
        context = self.get_context()
        prompt = f"Generate 4 MCQ questions from this content.\nFormat:\nQ1: question\nA) option\nB) option\nC) option\nD) option\nANSWER: letter\n\nContent:\n{context}\n\nGenerate questions:"
        response = ask_ollama(prompt)
        questions = []
        for block in response.split("Q")[1:]:
            try:
                lines = [l.strip() for l in block.strip().split("\n") if l.strip()]
                qt = lines[0].split(":", 1)[-1].strip() if ":" in lines[0] else lines[0]
                opts = {}
                ans = None
                for l in lines[1:]:
                    if l.startswith("A)"):
                        opts["A"] = l[2:].strip()
                    elif l.startswith("B)"):
                        opts["B"] = l[2:].strip()
                    elif l.startswith("C)"):
                        opts["C"] = l[2:].strip()
                    elif l.startswith("D)"):
                        opts["D"] = l[2:].strip()
                    elif "ANSWER:" in l:
                        ans = l.replace("ANSWER:", "").strip()
                if qt and len(opts) >= 2 and ans:
                    questions.append({"question": qt, "options": opts, "correct": ans})
            except Exception:
                continue
        return questions

    def generate_concepts(self):
        if not self.texts:
            return []
        context = self.get_context()
        prompt = f"Extract 6 key concepts from this content.\nFormat:\nCONCEPT: name\nDEFINITION: explanation\n\nContent:\n{context}\n\nExtract concepts:"
        response = ask_ollama(prompt)
        concepts = []
        for block in response.split("CONCEPT:")[1:]:
            lines = [l.strip() for l in block.strip().split("\n") if l.strip()]
            name = lines[0].strip()
            defn = next((l.replace("DEFINITION:", "").strip() for l in lines[1:] if "DEFINITION:" in l), "")
            if name and defn:
                concepts.append({"concept": name, "definition": defn})
        return concepts
