# ITM Campus Navigator — Windows setup (PowerShell)
# Run from the PROJECT ROOT (folder that contains backend + frontend)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== Checking project folders ===" -ForegroundColor Cyan
if (-not (Test-Path ".\backend\manage.py")) {
    Write-Host "ERROR: backend folder missing." -ForegroundColor Red
    Write-Host "This zip is incomplete. Clone the full repo:" -ForegroundColor Yellow
    Write-Host '  git clone -b cursor/itm-campus-navigator-6e99 https://github.com/Harshbajpai644/ITM-NAVIGATION.git'
    Write-Host '  cd ITM-NAVIGATION'
    Write-Host '  .\setup-windows.ps1'
    exit 1
}
if (-not (Test-Path ".\frontend\package.json")) {
    Write-Host "ERROR: frontend folder missing." -ForegroundColor Red
    exit 1
}

Write-Host "Folders OK." -ForegroundColor Green

Write-Host ""
Write-Host "=== Backend setup ===" -ForegroundColor Cyan
Set-Location backend
if (-not (Test-Path ".\.venv")) {
    python -m venv .venv
}
& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\pip.exe install -r requirements.txt
if (-not (Test-Path ".\.env")) {
    Copy-Item .env.example .env
}
& .\.venv\Scripts\python.exe manage.py migrate
& .\.venv\Scripts\python.exe scripts\create_admin.py
& .\.venv\Scripts\python.exe scripts\seed_buildings.py
Set-Location ..

Write-Host ""
Write-Host "=== Frontend setup ===" -ForegroundColor Cyan
Set-Location frontend
if (-not (Test-Path ".\.env")) {
    Copy-Item .env.example .env
}
npm install
Set-Location ..

Write-Host ""
Write-Host "=== Setup complete ===" -ForegroundColor Green
Write-Host "Now open TWO PowerShell windows:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Window 1 (API):" -ForegroundColor White
Write-Host "    cd backend"
Write-Host "    .\.venv\Scripts\Activate.ps1"
Write-Host "    python manage.py runserver"
Write-Host ""
Write-Host "  Window 2 (Website):" -ForegroundColor White
Write-Host "    cd frontend"
Write-Host "    npm run dev"
Write-Host ""
Write-Host "Then open: http://localhost:5173" -ForegroundColor Green
Write-Host "Admin login: admin / Admin@12345" -ForegroundColor Green
Write-Host ""
