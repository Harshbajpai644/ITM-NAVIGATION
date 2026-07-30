# ITM Campus Navigator

Production-ready campus navigation platform with visitor passes, admin dashboard, building directory, and live OpenStreetMap routing.

Frontend and backend are **completely separate**.

```
frontend/   React 19 + Vite + React Router + Axios + Leaflet
backend/    Django + Django REST Framework + JWT + Supabase PostgreSQL
```

## Features

1. **Visitor Pass System** — full name, mobile, email, department, purpose, destination, visit time (stored via Django ORM → Supabase/Postgres)
2. **Admin Dashboard** — JWT login, visitor list, search, filter, approve, reject, delete
3. **Campus Navigation** — OpenStreetMap, live GPS, destination markers, route line, distance & walking time
4. **Buildings Module** — full CRUD, categories, search
5. **REST APIs** — `/api/visitor-pass`, `/api/buildings`, `/api/admin`

## Quick Start

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # already configured for local SQLite
python manage.py migrate
python scripts/create_admin.py
python scripts/seed_buildings.py
python manage.py runserver 0.0.0.0:8000
```

Default admin: `admin` / `Admin@12345`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

## Supabase PostgreSQL

1. Create a Supabase project and copy the database connection string.
2. In `backend/.env`:

```env
USE_SQLITE=False
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Or set `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT` individually.

3. Run migrations again:

```bash
python manage.py migrate
python scripts/create_admin.py
python scripts/seed_buildings.py
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