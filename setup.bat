@echo off
echo ==========================================
echo   CHAUKAS - Setup Script
echo ==========================================
echo.

echo [1/3] Installing Frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed. Make sure Node.js >= 18 is installed.
    pause
    exit /b 1
)
cd ..

echo.
echo [2/3] Creating Python virtual environment (.venv)...
if not exist .venv (
    where py >nul 2>nul
    if %errorlevel%==0 (
        py -m venv .venv 2>nul || python -m venv .venv
    ) else (
        python -m venv .venv
    )
    if %errorlevel% neq 0 (
        echo ERROR: Failed to create virtual environment. Make sure Python 3.10+ is installed.
        pause
        exit /b 1
    )
)

echo.
echo [3/3] Installing Backend Python packages into .venv...
call .venv\Scripts\python.exe -m pip install --upgrade pip --quiet
call .venv\Scripts\python.exe -m pip install -r backend\requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: pip install failed. Check the error above.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   Setup complete!
echo ==========================================
echo.
echo To START Chaukas, run these in TWO separate terminals:
echo.
echo   Terminal 1 (Backend):
echo     start_backend.bat
echo.
echo   Terminal 2 (Frontend):
echo     start_frontend.bat
echo.
echo Or open http://localhost:5173 after both are running.
echo.
pause
