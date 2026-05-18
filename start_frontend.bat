@echo off
echo Starting Chaukas Frontend on http://localhost:5173 ...
echo.
cd frontend
if not exist node_modules (
    echo node_modules not found. Running npm install...
    call npm install
)
call npm run dev
pause
