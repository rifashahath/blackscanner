# BlackScanner — AI-Powered Web Vulnerability Intelligence

An advanced AI-first authorized web vulnerability scanner with a futuristic cybersecurity dashboard interface.

## Architecture

```
blackscanner/
├── frontend/          # Next.js + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── app/       # Next.js App Router pages
│   │   ├── components/ # Reusable UI components
│   │   ├── lib/       # Utilities, API client, mock data
│   │   ├── types/     # TypeScript type definitions
│   │   └── hooks/     # Custom React hooks
│   └── ...
├── backend/           # FastAPI + SQLAlchemy + SQLite
│   ├── app/
│   │   ├── api/       # API route handlers
│   │   ├── models/    # SQLAlchemy ORM models
│   │   ├── schemas/   # Pydantic request/response schemas
│   │   ├── services/  # Business logic services
│   │   ├── workers/   # Scan pipeline workers
│   │   └── core/      # Configuration, database setup
│   └── ...
└── README.md
```

## Pages

1. **Command Center** — Launch scans, view stats, monitor recent operations
2. **Live Scan View** — Real-time scan monitoring with event log and attack surface graph
3. **Surface Intelligence** — Discovered routes, forms, parameters, JS files, API calls
4. **Findings Board** — Vulnerability findings with severity, confidence, and AI reasoning
5. **Finding Detail** — Deep dive into evidence, request/response data, diff viewer
6. **Reports** — Generated security reports with export options

## Quick Start

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Recharts
- **Backend**: FastAPI, SQLAlchemy, SQLite (async), Pydantic v2
- **Design**: Cyber-noir theme, glassmorphism, neon accents, monospace terminals

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/v1/dashboard/stats | Dashboard statistics |
| POST   | /api/v1/scans | Create new scan |
| GET    | /api/v1/scans | List all scans |
| GET    | /api/v1/scans/:id | Get scan details |
| GET    | /api/v1/scans/:id/events | Get scan events |
| POST   | /api/v1/scans/:id/cancel | Cancel a scan |
| GET    | /api/v1/scans/:id/surface | Get attack surface |
| GET    | /api/v1/scans/:id/hypotheses | Get AI hypotheses |
| GET    | /api/v1/scans/:id/findings | Get findings |
| GET    | /api/v1/findings/:id | Get finding detail with evidence |
| GET    | /api/v1/reports | List reports |
| POST   | /api/v1/scans/:id/report | Generate report |
