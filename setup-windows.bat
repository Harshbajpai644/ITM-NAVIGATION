@echo off
REM ITM Campus Navigator — Windows setup (CMD)
REM Run from the PROJECT ROOT (folder that contains backend + frontend)

echo.
echo === Checking project folders ===
if not exist "backend\manage.py" (
  echo ERROR: backend folder missing.
  echo Clone the full repo first:
  echo   git clone -b cursor/itm-campus-navigator-6e99 https://github.com/Harshbajpai644/ITM-NAVIGATION.git
  exit /b 1
)
if not exist "frontend\package.json" (
  echo ERROR: frontend folder missing.
  exit /b 1
)

echo Folders OK.
echo.
echo === Backend setup ===
cd backend
if not exist ".venv" python -m venv .venv
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
if not exist ".env" copy .env.example .env
python manage.py migrate
python scripts\create_admin.py
python scripts\seed_buildings.py
cd ..

echo.
echo === Frontend setup ===
cd frontend
if not exist ".env" copy .env.example .env
call npm install
cd ..

echo.
echo === Setup complete ===
echo.
echo Open TWO terminals:
echo.
echo   Window 1 - API:
echo     cd backend
echo     .venv\Scripts\activate
echo     python manage.py runserver
echo.
echo   Window 2 - Website:
echo     cd frontend
echo     npm run dev
echo.
echo Then open http://localhost:5173
echo Admin: admin / Admin@12345
echo.
pause
