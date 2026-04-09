# AI Hospital Receptionist - Startup Script

Write-Host "Starting AI Hospital Receptionist..." -ForegroundColor Cyan

# ---------------- BACKEND ----------------
Write-Host "Launching Backend Server (FastAPI + LangGraph)..." -ForegroundColor Yellow

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; if (!(Test-Path 'venv')) { Write-Host 'Virtual environment not found!' -ForegroundColor Red } else { .\venv\Scripts\Activate.ps1; uvicorn main:app --reload }"

# Wait for backend
Start-Sleep -Seconds 3

# ---------------- FRONTEND ----------------
Write-Host "Launching Frontend Server (React + Vite)..." -ForegroundColor Green

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ai-hospital-frontend; if (!(Test-Path 'node_modules')) { Write-Host 'Installing dependencies...' -ForegroundColor Yellow; npm install }; npm run dev"

# ---------------- DONE ----------------
Write-Host "Both servers are starting in separate windows!" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:5173"