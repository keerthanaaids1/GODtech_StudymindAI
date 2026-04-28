@echo off
title StudyMindAI Launcher
color 0A

echo.
echo  ============================================
echo    StudyMindAI - Starting everything...
echo  ============================================
echo.

:: ── Step 1: Start Ollama if not already running ──
echo  [1/3] Checking Ollama...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I "ollama.exe" >NUL
if %ERRORLEVEL% NEQ 0 (
    echo  Starting Ollama...
    start "" "C:\Users\%USERNAME%\AppData\Local\Programs\Ollama\ollama.exe" serve
    timeout /t 4 /nobreak >NUL
    echo  Ollama started!
) else (
    echo  Ollama already running - OK
)

:: ── Step 2: Start Flask backend ──
echo.
echo  [2/3] Starting Flask backend...
cd /d "%~dp0backend"
start "" cmd /k "python app.py"
timeout /t 3 /nobreak >NUL
echo  Flask started on http://localhost:5000

:: ── Step 3: Open browser ──
echo.
echo  [3/3] Opening browser...
timeout /t 2 /nobreak >NUL
start "" "%~dp0frontend\index.html"

echo.
echo  ============================================
echo    Everything is running!
echo    Close the Flask window to stop the server
echo  ============================================
echo.
pause
