# StudyMind AI 🎓
### Offline AI-Powered Study Assistant | TechFusion 2.0

> "NotebookLM for every student, even without internet"

---

## Quick Start (Windows)

### Prerequisites (must be installed first)
- Python 3.10+ 
- Node.js 18+
- Ollama → https://ollama.com
- Git

### First Time Setup
```bash
# Pull AI models (do this once)
ollama pull llama3
ollama pull nomic-embed-text

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install
```

### Run the App
Double-click `start.bat` OR run manually:

```bash
# Terminal 1 - AI Engine
ollama serve

# Terminal 2 - Backend
cd backend
python main.py

# Terminal 3 - Frontend
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser 🎉

---

## Features
- 📚 **Multiple Notebooks** - Organize by subject
- 📄 **PDF & TXT Upload** - Upload your study materials
- 💬 **AI Chat** - Ask questions, get cited answers
- 🃏 **Flashcards** - Auto-generated study cards (flip animation)
- 📝 **Quiz Mode** - MCQ quiz with score tracking
- 💡 **Key Concepts** - Extract important definitions
- 🎨 **Two Themes** - Ocean 🌊 & Forest 🌿

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React + Tailwind CSS |
| Backend | Python FastAPI |
| AI Model | Ollama + Llama 3 |
| RAG | LlamaIndex + ChromaDB |
| PDF | PyPDF2 |

---

## Project Structure
```
studymind-ai/
├── backend/
│   ├── main.py          ← FastAPI server (API routes)
│   ├── rag.py           ← RAG pipeline (AI logic)
│   ├── requirements.txt
│   └── uploads/         ← Stored documents
├── frontend/
│   ├── src/
│   │   ├── App.jsx          ← Main app + theme switching
│   │   ├── api.js           ← Backend API calls
│   │   ├── components/
│   │   │   └── Sidebar.jsx  ← Navigation + notebook management
│   │   └── pages/
│   │       ├── WelcomePage.jsx
│   │       ├── ChatPage.jsx
│   │       ├── FlashcardsPage.jsx
│   │       ├── QuizPage.jsx
│   │       └── ConceptsPage.jsx
│   └── package.json
├── start.bat            ← One-click Windows launcher
└── README.md
```

---

## Hackathon Info
- **Event:** TechFusion 2.0 by Oculus Aegis
- **Theme:** Web Platforms for Digital Transformation & Social Impact
- **Problem:** Offline AI education for low-connectivity areas
- **Prize Pool:** ₹50,000+
