@echo off
echo Starting Chaukas Backend on http://localhost:8000 ...
echo.
if not exist .venv (
    echo ERROR: .venv not found. Run setup.bat first.
    pause
    exit /b 1
)
.venv\Scripts\python.exe -m uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
pause
