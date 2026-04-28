StudyMindAI 🧠
> \*\*Offline AI-powered study assistant for every student — no internet required.\*\*
Built for TechFusion 2.0 Hackathon | Oculus Aegis | DSATM | April 2026  
Theme: Web Platforms for Digital Transformation & Social Impact  
Team: GODtech
---
🚀 What is StudyMindAI?
StudyMindAI is a fully offline, ChatGPT-style study assistant that runs on your laptop using Ollama. Upload your notes (PDF or TXT), ask questions, and get accurate, streaming AI answers — all without sending a single byte to the cloud.
No internet. No subscriptions. No privacy risks.
---
✨ Features
Feature	Description
💬 Streaming Chat	Word-by-word answers just like ChatGPT
📄 Upload Notes	Chat with your own PDF or TXT study material
📚 Topic History	Conversations saved locally, switch anytime
🗑️ Delete Topics	Full topic management with one click
🔌 100% Offline	Powered by Ollama — no internet needed
⚡ One-Click Launch	`START.bat` starts everything automatically
🌙 Dark Theme	Clean ChatGPT-style dark UI
📋 Copy Code	Syntax-highlighted code blocks with copy button
---
🛠️ Tech Stack
AI Engine
Ollama — local AI runtime
`llama3.2:3b` — fast, accurate, runs on 6GB RAM
Backend
Python 3.11
Flask + Flask-CORS
PyPDF2 (PDF text extraction)
Server-Sent Events (real-time streaming)
Frontend
HTML5 + CSS3 + Vanilla JavaScript
Marked.js — markdown rendering
highlight.js — code syntax highlighting
Sora — Google Font
JetBrains Mono — code font
---
📁 Project Structure
```
project/
├── START.bat              ← Double-click to launch everything
├── frontend/
│   ├── index.html         ← Main UI
│   ├── style.css          ← Dark theme styles
│   └── script.js          ← All frontend logic
└── backend/
    └── app.py             ← Flask API server
```
---
⚙️ Setup & Installation
1. Install Ollama
Download from https://ollama.com/download
2. Pull the AI model
```bash
ollama pull llama3.2:3b
```
3. Install Python dependencies
```bash
pip install flask flask-cors PyPDF2
```
4. Run the app
Option A — One click:  
Double-click `START.bat`
Option B — Manual:
```bash
# Terminal 1
ollama serve

# Terminal 2
cd backend
python app.py

# Then open frontend/index.html in your browser
```
---
🎯 How to Use
Open `frontend/index.html` in Chrome
Type any study question and press Enter or click Send
To use with your notes:
Click Upload Notes in the top bar
Select a `.pdf` or `.txt` file
Ask questions — AI will answer using your notes as context
Your conversations are saved as Topics in the sidebar
Click any topic to go back to it, hover to delete
---
🤖 Recommended Models
Model	RAM Needed	Speed	Quality
`llama3.2:3b` ⭐	6 GB	Fast	Great
`llama3.1:8b`	16 GB	Medium	Excellent
`mistral:7b`	10 GB	Medium	Very Good
`gemma:2b`	4 GB	Fastest	Basic
To switch models, edit `MODEL = "llama3.2:3b"` in `backend/app.py`.
---
👥 Team GODtech
Name	Role
Keerthana M	Team Lead & Full-Stack
Nuthan V N	AI & Backend Engineer
Hansika Chandru	Frontend Developer
Chinmay Gowda S	Testing & Documentation
---
🔮 Future Scope
📱 Mobile app (Android/iOS)
🃏 Auto flashcard generator from notes
📝 MCQ quiz generator
🎤 Voice input & text-to-speech
🌍 Multi-language support (Hindi, Tamil, Kannada...)
📷 OCR for handwritten notes
---
> — Team GODtech, TechFusion 2.0
---
> \*"Making AI education offline, private and accessible for every Indian student."\*  
> — Team GODtech, TechFusion 2.0
