/* ═══════════════════════════════════════════════════════
   StudyMindAI — script.js
   - Built-in markdown parser (works 100% offline, no CDN)
   - Streaming chat with Ollama
   - Notes upload (PDF/TXT)
   - Topic history with DELETE button
═══════════════════════════════════════════════════════ */

const API        = "http://localhost:5000";
const SESSION_ID = "session_" + Math.random().toString(36).slice(2, 9);

let topics      = JSON.parse(localStorage.getItem("smai_topics") || "[]");
let activeIdx   = -1;
let isStreaming  = false;

let input, sendBtn, messagesInner, welcome,
    topicList, topbarTitle, statusDot, statusText,
    notesBadge, messagesWrap;

/* ─── Init ──────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  input         = document.getElementById("userInput");
  sendBtn       = document.getElementById("sendBtn");
  messagesInner = document.getElementById("messagesInner");
  welcome       = document.getElementById("welcome");
  topicList     = document.getElementById("topicList");
  topbarTitle   = document.getElementById("topbarTitle");
  statusDot     = document.getElementById("statusDot");
  statusText    = document.getElementById("statusText");
  notesBadge    = document.getElementById("notesBadge");
  messagesWrap  = document.getElementById("messagesWrap");

  renderTopicList();
  checkOllama();
  input.focus();
});

/* ─── Built-in Markdown Parser (offline, no CDN needed) */
function renderMarkdown(text) {
  if (!text) return "";

  let html = escHtml(text);

  // Code blocks ```lang\n...\n```
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><button class="copy-btn" onclick="copyCode(this)">Copy</button><code class="lang-${lang}">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

  // Bold
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_\n]+)_/g,   '<em>$1</em>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm,  '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm,   '<h1>$1</h1>');

  // Blockquote
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr>');

  // Bullet list items
  html = html.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
  // Numbered list items
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>[\s\S]+?<\/li>)(\n<li>[\s\S]+?<\/li>)*/g, (match) => {
    return '<ul>' + match + '</ul>';
  });

  // Paragraphs: wrap plain lines
  const lines = html.split('\n');
  const out   = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const isBlock = /^<(h[1-6]|ul|ol|li|pre|blockquote|hr)/.test(t);
    out.push(isBlock ? t : '<p>' + t + '</p>');
  }

  return out.join('\n');
}

function copyCode(btn) {
  const code = btn.nextElementSibling;
  navigator.clipboard.writeText(code ? code.innerText : "");
  btn.textContent = "Copied!";
  setTimeout(() => btn.textContent = "Copy", 2000);
}

/* ─── Ollama health check ───────────────────────────── */
async function checkOllama() {
  try {
    const r = await fetch(`${API}/health`);
    const d = await r.json();
    if (d.ollama === "connected") {
      statusDot.className    = "status-dot online";
      statusText.textContent = `${d.model} · ready`;
    } else throw new Error();
  } catch {
    statusDot.className    = "status-dot offline";
    statusText.textContent = "Ollama offline — run: ollama serve";
  }
}

/* ─── Sidebar toggle ────────────────────────────────── */
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("collapsed");
}

/* ─── Enter = send, Shift+Enter = newline ───────────── */
function handleKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

/* ─── Auto-resize textarea ──────────────────────────── */
function autoResize(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 180) + "px";
}

/* ─── Suggestion chips ──────────────────────────────── */
function useChip(btn) {
  input.value = btn.textContent.trim();
  autoResize(input);
  sendMessage();
}

/* ─── New Topic ─────────────────────────────────────── */
function newTopic() {
  activeIdx = -1;
  topbarTitle.textContent = "StudyMindAI";
  messagesInner.querySelectorAll(".message,.thinking").forEach(m => m.remove());
  welcome.style.display = "flex";
  input.value = "";
  autoResize(input);
  input.focus();
  document.querySelectorAll(".topic-item").forEach(el => el.classList.remove("active"));
}

/* ─── Render topic list with trash + rename ─────────── */
function renderTopicList() {
  if (!topicList) return;
  topicList.innerHTML = "";

  if (topics.length === 0) {
    topicList.innerHTML = '<div class="no-topics">No topics yet</div>';
    return;
  }

  topics.forEach((t, i) => {
    const el = document.createElement("div");
    el.className = "topic-item" + (i === activeIdx ? " active" : "");

    el.innerHTML = `
      <svg class="topic-icon" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
      <span class="topic-title" title="Double-click to rename">${escHtml(t.title)}</span>
      <button class="topic-del" title="Delete topic" onclick="deleteTopic(event,${i})">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14H6L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
      </button>`;

    // Single click = load topic
    el.addEventListener("click", (e) => {
      if (e.target.closest(".topic-del")) return;
      if (e.target.closest(".topic-rename-input")) return;
      loadTopic(i);
    });

    // Double click on title = rename inline
    const titleSpan = el.querySelector(".topic-title");
    titleSpan.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      startRename(titleSpan, i);
    });

    topicList.appendChild(el);
  });
}

/* ─── Inline rename ─────────────────────────────────── */
function startRename(span, idx) {
  const current = topics[idx].title;
  const inp = document.createElement("input");
  inp.type = "text";
  inp.className = "topic-rename-input";
  inp.value = current;
  span.replaceWith(inp);
  inp.focus();
  inp.select();

  function commit() {
    const val = inp.value.trim();
    if (val && val !== current) {
      topics[idx].title = val;
      localStorage.setItem("smai_topics", JSON.stringify(topics));
      if (idx === activeIdx) topbarTitle.textContent = val;
      showToast("Topic renamed", "");
    }
    renderTopicList();
  }

  inp.addEventListener("keydown", (e) => {
    if (e.key === "Enter")  { e.preventDefault(); commit(); }
    if (e.key === "Escape") { renderTopicList(); }
  });
  inp.addEventListener("blur", commit);
}

/* ─── Delete topic ──────────────────────────────────── */
function deleteTopic(e, idx) {
  e.stopPropagation();
  topics.splice(idx, 1);
  localStorage.setItem("smai_topics", JSON.stringify(topics));
  if (idx === activeIdx) {
    activeIdx = -1;
    newTopic();
  } else if (idx < activeIdx) {
    activeIdx--;
  }
  renderTopicList();
  showToast("Topic deleted", "");
}

/* ─── Load topic ────────────────────────────────────── */
function loadTopic(idx) {
  activeIdx = idx;
  const topic = topics[idx];
  topbarTitle.textContent = topic.title;
  messagesInner.querySelectorAll(".message,.thinking").forEach(m => m.remove());
  welcome.style.display = "none";
  topic.messages.forEach(m => appendMessage(m.role, m.text));
  renderTopicList();
  scrollBottom();
}

/* ─── Save topic ────────────────────────────────────── */
function saveTopic(title, msgs) {
  if (activeIdx === -1) {
    topics.unshift({ title, messages: msgs });
    activeIdx = 0;
  } else {
    topics[activeIdx].messages = msgs;
  }
  localStorage.setItem("smai_topics", JSON.stringify(topics));
  renderTopicList();
}

/* ─── Collect messages from DOM ─────────────────────── */
function collectMessages() {
  const out = [];
  messagesInner.querySelectorAll(".message").forEach(el => {
    const role = el.classList.contains("user") ? "user" : "ai";
    const raw  = el.querySelector(".msg-text").dataset.raw || "";
    out.push({ role, text: raw });
  });
  return out;
}

/* ─── SEND MESSAGE ──────────────────────────────────── */
async function sendMessage() {
  if (isStreaming) return;
  const question = input.value.trim();
  if (!question) return;

  welcome.style.display = "none";
  appendMessage("user", question);
  input.value = "";
  autoResize(input);

  if (activeIdx === -1) {
    topbarTitle.textContent = question.length > 45 ? question.slice(0, 45) + "…" : question;
  }

  isStreaming = true;
  sendBtn.disabled = true;

  // Thinking animation
  const thinking = document.createElement("div");
  thinking.className = "thinking";
  thinking.innerHTML = "<span></span><span></span><span></span>";
  messagesInner.appendChild(thinking);
  scrollBottom();

  let aiRaw = "";
  const aiEl = document.createElement("div");
  aiEl.className = "message ai";
  aiEl.innerHTML = `
    <div class="msg-avatar avatar-ai">◈</div>
    <div class="msg-body">
      <div class="msg-name">STUDYMINDAI</div>
      <div class="msg-text" data-raw=""></div>
    </div>`;

  try {
    const res = await fetch(`${API}/ask`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ question, session_id: SESSION_ID }),
    });

    if (!res.ok) throw new Error("Server error " + res.status);

    thinking.remove();
    messagesInner.appendChild(aiEl);
    scrollBottom();

    const msgText = aiEl.querySelector(".msg-text");
    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const obj = JSON.parse(line.slice(6));
          aiRaw += obj.token;
          msgText.dataset.raw = aiRaw;
          msgText.innerHTML = renderMarkdown(aiRaw) + '<span class="cursor"></span>';
          scrollBottom();
          if (obj.done) break;
        } catch { /* skip */ }
      }
    }

    msgText.innerHTML   = renderMarkdown(aiRaw);
    msgText.dataset.raw = aiRaw;

  } catch (err) {
    thinking.remove();
    if (!messagesInner.contains(aiEl)) messagesInner.appendChild(aiEl);
    aiEl.querySelector(".msg-text").innerHTML =
      `<span style="color:#ef4444">⚠️ ${err.message}<br>Make sure Flask and Ollama are running.</span>`;
  }

  saveTopic(topbarTitle.textContent, collectMessages());
  isStreaming = false;
  sendBtn.disabled = false;
  scrollBottom();
  input.focus();
}

/* ─── Append message bubble ─────────────────────────── */
function appendMessage(role, text) {
  const el = document.createElement("div");
  el.className = `message ${role}`;
  if (role === "user") {
    el.innerHTML = `
      <div class="msg-avatar avatar-user">U</div>
      <div class="msg-body">
        <div class="msg-name">YOU</div>
        <div class="msg-text" data-raw="${escHtml(text)}">${escHtml(text)}</div>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="msg-avatar avatar-ai">◈</div>
      <div class="msg-body">
        <div class="msg-name">STUDYMINDAI</div>
        <div class="msg-text" data-raw="${escHtml(text)}">${renderMarkdown(text)}</div>
      </div>`;
  }
  messagesInner.appendChild(el);
  scrollBottom();
  return el;
}

/* ─── Scroll to bottom ──────────────────────────────── */
function scrollBottom() {
  if (messagesWrap) messagesWrap.scrollTop = messagesWrap.scrollHeight;
}

/* ─── Upload notes ──────────────────────────────────── */
async function uploadNotes(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;
  showToast("Uploading notes…", "");
  const form = new FormData();
  form.append("file", file);
  form.append("session_id", SESSION_ID);
  try {
    const r = await fetch(`${API}/upload_notes`, { method: "POST", body: form });
    const d = await r.json();
    if (d.success) {
      notesBadge.style.display = "flex";
      showToast(`✓ Notes loaded (${d.chars} chars)`, "success");
    } else {
      showToast("✗ " + (d.error || "Upload failed"), "error");
    }
  } catch {
    showToast("✗ Cannot reach Flask server", "error");
  }
  fileInput.value = "";
}

/* ─── Clear notes ───────────────────────────────────── */
async function clearNotes() {
  try {
    await fetch(`${API}/clear_notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: SESSION_ID }),
    });
  } catch { /* ignore */ }
  notesBadge.style.display = "none";
  showToast("Notes removed", "");
}

/* ─── Toast notification ────────────────────────────── */
function showToast(msg, type) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = "toast " + type;
  void toast.offsetWidth;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 3000);
}

/* ─── HTML escape ───────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
