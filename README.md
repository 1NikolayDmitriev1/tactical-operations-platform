# Tactical Operations Platform (TOP)

## What it does

A web dashboard for military command posts and UAV crews. Pulls together tactical map data, drone recon with object detection, and task management into one screen.

Main capabilities:
- **Tactical map** — Leaflet-based, 3 tile providers (satellite, topo, dark/night mode). Threat density zones rendered as circles around markers.
- **Drone recon** — Upload aerial images, YOLOv8 runs inference, draws bounding boxes with confidence scores. Adjustable confidence threshold.
- **Task management** — CRUD for operational markers with coordinates, priority levels, status tracking.
- **Auth** — Callsign + password, JWT tokens (24h expiry), bcrypt hashing.
- **i18n** — Ukrainian military terminology + NATO English.
- **4 color themes** — Amber, Emerald, Neutral, Sky.

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind v4, React-Leaflet, Lucide |
| Backend | Python 3.11, FastAPI, SQLAlchemy 2.0, PostgreSQL, YOLOv8, PyJWT |
| Infra | Docker Compose, Nginx, Pytest |

---

## Quick Start

### Docker (easiest)

```bash
git clone https://github.com/YOUR_USERNAME/tactical-operations-platform.git
cd tactical-operations-platform
docker compose up --build
```

Dashboard: `http://localhost:5173`
API docs: `http://localhost:5000/docs`

### Local dev

**1. Database** — PostgreSQL on port 5432, database `tactical_db`.

**2. Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate   
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload --port 5000
```

**3. Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Demo credentials

Created by `seed.py` along with 5 map markers:

| | |
|---|---|
| Callsign | `GHOST-7` |
| Password | `tactical_pass` |

---

## Tests

```bash
cd backend
pytest -v tests/test_api.py
```