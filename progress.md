# StudyMindAI — Hackathon Progress Log 📋

**Event:** TechFusion 2.0 | Oculus Aegis | DSATM  
**Team:** GODtech  
**Dates:** 28–29 April 2026  
**Theme:** Web Platforms for Digital Transformation & Social Impact

---

## ✅ Completed

### Core Infrastructure
- [x] Project folder structure set up (`frontend/`, `backend/`)
- [x] Ollama installed and running locally
- [x] AI model pulled — `llama3.2:3b` (offline, 6GB RAM)
- [x] Flask backend running on `http://localhost:5000`
- [x] CORS configured for local frontend-backend communication

### Backend (`app.py`)
- [x] `/ask` endpoint — streams AI responses using Server-Sent Events (SSE)
- [x] `/upload_notes` endpoint — accepts PDF and TXT files
- [x] PDF text extraction using PyPDF2
- [x] Notes stored in memory per session and injected into AI prompt
- [x] `/clear_notes` endpoint
- [x] `/health` endpoint — checks if Ollama is connected
- [x] Smart prompt builder — uses notes if uploaded, else answers from own knowledge
- [x] Error handling for Ollama offline / connection errors

### Frontend (`index.html` + `style.css` + `script.js`)
- [x] ChatGPT-style dark UI — black background, white text, teal accents
- [x] Sidebar with topic list
- [x] "New Topic" button
- [x] Topic history saved to `localStorage`
- [x] Delete topic with confirmation (hover to reveal trash icon)
- [x] Real-time streaming — words appear one by one as AI generates
- [x] Markdown rendering (bold, italic, headers, lists, code blocks, tables)
- [x] Syntax highlighting for code blocks (highlight.js)
- [x] "Copy" button on every code block
- [x] Upload Notes button in topbar (PDF/TXT support)
- [x] Notes loaded badge with remove option
- [x] Toast notifications (success/error)
- [x] Welcome screen with suggestion chips
- [x] Thinking animation (dots) while AI is generating
- [x] Enter key to send, Shift+Enter for new line
- [x] Auto-resize textarea
- [x] Ollama status indicator in sidebar
- [x] Sidebar collapse/expand toggle

### DevOps / Launcher
- [x] `START.bat` — one double-click launches Ollama + Flask + browser

---

## 🔄 In Progress / Known Issues

- [ ] UI not fully tested on smaller laptop screens (1366×768)
- [ ] PDF extraction may miss text in scanned/image PDFs (no OCR yet)
- [ ] Topic history resets if browser localStorage is cleared
- [ ] Notes reset when Flask server restarts (in-memory only)

---

## 🔮 Planned / Future Scope

- [ ] Flashcard generator from uploaded notes
- [ ] MCQ quiz generator
- [ ] Voice input support
- [ ] Multi-language responses (Hindi, Tamil, Kannada)
- [ ] OCR for handwritten notes
- [ ] Mobile app version
- [ ] Study group / collaborative notes feature
- [ ] Persistent notes storage (SQLite or JSON file)

---

## 🐛 Bugs Fixed During Hackathon

| Bug | Fix |
|---|---|
| Send button not working | `script.js` was missing from frontend folder entirely |
| CSS layout broken | Sidebar, input area had no layout rules — rewrote from scratch |
| Ollama "address in use" error | Ollama was already running — no need to restart |
| Flask path not found | Used OneDrive Desktop path: `C:\Users\...\OneDrive\Desktop\project\backend` |
| Streaming not working | Added `X-Accel-Buffering: no` header to Flask response |

---

## 📊 Time Log

| Time | Activity |
|---|---|
| Day 1 - Morning | Project setup, Ollama install, Flask skeleton |
| Day 1 - Afternoon | Backend streaming API, PDF upload endpoint |
| Day 1 - Evening | Frontend UI build, CSS dark theme |
| Day 2 - Morning | script.js logic — send, stream, markdown render |
| Day 2 - Afternoon | Topic history, delete, notes badge, toast |
| Day 2 - Evening | START.bat launcher, bug fixes, final testing |
| Day 2 - Night | README, progress.md, PPT preparation |

---

## 👥 Team Contributions

| Member | Contributions |
|---|---|
| **Keerthana M** (Lead) | Architecture decisions, Flask backend, frontend integration, bug fixes |
| **Nuthan V N** | Ollama setup, streaming SSE implementation, model selection & optimization |
| **Hansika Chandru** | UI design, CSS dark theme, sidebar & chat layout, PPT slides |
| **Chinmay Gowda S** | QA testing, bug reporting, README, progress log, demo prep |

---

## 🏆 Hackathon Submission Checklist

- [x] Working prototype demo-ready
- [x] `START.bat` one-click launcher
- [x] README.md
- [x] progress.md
- [x] PPT slides (10 slides)
- [ ] GitHub repository link *(add before submission)*
- [ ] Live demo on judge's laptop tested

---

> Last updated: 29 April 2026 | Team GODtech
