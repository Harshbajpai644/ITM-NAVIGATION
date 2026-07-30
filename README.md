# ITM Campus Navigator

Production-ready campus navigation platform with visitor passes, admin dashboard, building directory, and live OpenStreetMap routing.

Frontend and backend are **completely separate**.

```
ITM-NAVIGATION/
├── frontend/          Website (React)
├── backend/           API (Django)
├── setup-windows.ps1  One-click Windows setup (PowerShell)
├── setup-windows.bat  One-click Windows setup (CMD)
└── README.md
```

## Windows pe website kaise chalayein (important)

Aapka Downloads zip **incomplete** ho sakta hai (`backend` folder missing).  
**Incomplete zip mat use karo.** Full project clone karo:

### Step 1 — Full project download

PowerShell mein yeh commands **ek-ek karke** chalao (`&&` mat use karo):

```powershell
cd $HOME\Downloads
git clone -b cursor/itm-campus-navigator-6e99 https://github.com/Harshbajpai644/ITM-NAVIGATION.git
cd ITM-NAVIGATION
dir
```

`dir` mein **backend** aur **frontend** dono dikhne chahiye.

### Step 2 — Setup

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
.\setup-windows.ps1
```

### Step 3 — Website start (2 windows)

**Window 1 — API:**

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python manage.py runserver
```

**Window 2 — Website:**

```powershell
cd frontend
npm run dev
```

Browser kholo: **http://localhost:5173**  
Admin login: `admin` / `Admin@12345`

> Need: [Python 3](https://www.python.org/downloads/) + [Node.js LTS](https://nodejs.org/) + [Git](https://git-scm.com/download/win) installed.

## Features

1. **Visitor Pass System** — full name, mobile, email, department, purpose, destination, visit time (stored via Django ORM → Supabase/Postgres)
2. **Admin Dashboard** — JWT login, visitor list, search, filter, approve, reject, delete
3. **Campus Navigation** — OpenStreetMap, live GPS, destination markers, route line, distance & walking time
4. **Buildings Module** — full CRUD, categories, search
5. **REST APIs** — `/api/visitor-pass`, `/api/buildings`, `/api/admin`

---

## Quick Start — Windows (PowerShell)

> PowerShell does **not** support `&&` or `source`. Run each command on its own line.

### 1) Backend

Open **PowerShell**, then:

```powershell
cd "C:\Users\harsh bajpai\Downloads\ITM-NAVIGATION-4644cba4962360fd5578fea9cde0b1dc8963e738"
dir
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python scripts\create_admin.py
python scripts\seed_buildings.py
python manage.py runserver
```

If `Activate.ps1` is blocked, run once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then activate again:

```powershell
.\.venv\Scripts\Activate.ps1
```

API: http://127.0.0.1:8000  
Default admin: `admin` / `Admin@12345`

### 2) Frontend (new PowerShell window)

Keep the backend running. Open a **second** PowerShell window:

```powershell
cd "C:\Users\harsh bajpai\Downloads\ITM-NAVIGATION-4644cba4962360fd5578fea9cde0b1dc8963e738\frontend"
npm install
copy .env.example .env
npm run dev
```

App: http://localhost:5173

---

## Quick Start — macOS / Linux (bash)

```bash
# Backend
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python scripts/create_admin.py
python scripts/seed_buildings.py
python manage.py runserver 0.0.0.0:8000
```

```bash
# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## Get a complete copy (recommended)

If folders are missing, clone the branch instead of using a partial zip:

```powershell
git clone -b cursor/itm-campus-navigator-6e99 https://github.com/Harshbajpai644/ITM-NAVIGATION.git
cd ITM-NAVIGATION
dir
```

---

## Supabase PostgreSQL

1. Create a Supabase project and copy the database connection string.
2. In `backend/.env`:

```env
USE_SQLITE=False
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Or set `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT` individually.

3. Run migrations again (from `backend` with venv active):

```powershell
python manage.py migrate
python scripts\create_admin.py
python scripts\seed_buildings.py
```

## API Overview

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/visitor-pass/` | POST | Public | Submit visitor pass |
| `/api/visitor-pass/` | GET | Admin JWT | List / search / filter |
| `/api/visitor-pass/{id}/approve/` | PATCH | Admin JWT | Approve |
| `/api/visitor-pass/{id}/reject/` | PATCH | Admin JWT | Reject |
| `/api/visitor-pass/{id}/` | DELETE | Admin JWT | Delete |
| `/api/buildings/` | GET | Public | List / search buildings |
| `/api/buildings/` | POST/PUT/PATCH/DELETE | Admin JWT | CRUD |
| `/api/buildings/categories/` | GET | Public | Category list |
| `/api/admin/login/` | POST | Public | JWT login |
| `/api/admin/dashboard/` | GET | Admin JWT | Stats + recent visitors |
| `/api/admin/campus-info/` | GET | Public | Map center |
| `/api/token/refresh/` | POST | — | Refresh JWT |

## Architecture

- **MVC-style Django apps**: Models → Serializers → ViewSets → URLs
- **JWT** via `djangorestframework-simplejwt`
- **Environment variables** via `python-dotenv` / Vite `import.meta.env`
- React SPA talks to DRF over Axios; tokens stored in `localStorage`

## Tech Stack

- React 19, Vite, React Router, Axios, Leaflet, modern CSS (glassmorphism map UI)
- Python, Django 5, Django REST Framework, SimpleJWT
- Supabase PostgreSQL (SQLite fallback for local development)
- No Node.js/Express backend
