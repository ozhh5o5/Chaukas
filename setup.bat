@echo off
echo Installing Frontend Dependencies...
cd frontend
call npm install
cd ..

echo Installing Backend Dependencies...
if not exist .venv (
	echo Creating Python virtual environment...
	where py >nul 2>nul
	if %errorlevel%==0 (
		py -3.12 -m venv .venv 2>nul || py -3.11 -m venv .venv 2>nul || python -m venv .venv
	) else (
		python -m venv .venv
	)
)

echo Installing backend Python packages into .venv...
call .venv\Scripts\python.exe -m pip install --upgrade pip
call .venv\Scripts\python.exe -m pip install -r backend/requirements.txt

echo.
echo All dependencies installed!
echo Start frontend:  cd frontend ^&^& npm run dev
echo Start backend:   .venv\Scripts\python.exe -m uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
pause
