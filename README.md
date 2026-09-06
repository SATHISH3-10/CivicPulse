# CivicPulse AI

An AI-assisted civic complaint reporting and municipal operations platform for Chennai. CivicPulse connects a citizen report to AI triage, department dispatch, field repair, and resolution verification.

`Citizen report → AI analysis → department dispatch → field resolution → citizen verification`

## What it does

CivicPulse supports photo- and location-based issue reporting, automatic category and priority recommendations, SLA deadlines, duplicate detection, complaint timelines, notifications, officer dispatch, city analytics, and hotspot detection.

### Citizen space — `/citizen/*`

- Dashboard with report, in-progress, resolved, and verification statistics, recent activity, and issue-proof map viewer.
- Report issues with photo evidence, geolocation, AI category/priority/SLA recommendations, and duplicate checks.
- Track complaints with status badges, live SLA countdowns, evidence, timelines, and verification feedback.
- Explore nearby complaints on the civic map and manage ward/profile details with circular image crop, Gravatar, or Unavatar.

### Field officer space — `/officer/*`

- Field dashboard with workload, P1 alerts, breached SLAs, department, and ward information.
- Priority-sorted work orders with live SLA indicators and one-tap Claim or In Progress actions.
- Route map with numbered pins for assigned work across the officer's ward.
- Work-order repair notes, status progression, before/after evidence uploads, and completion workflow.

### Municipal admin space — `/admin/*`

- Command center for complaint volume, SLA compliance, P1 alerts, department breakdown, and resolution speed.
- User and team directory with search, role filtering, and officer permit assignment.
- City-wide master complaint desk with assignment and re-dispatch controls.
- Live command map, department management, analytics, and AI hotspots for preventive maintenance.

## Technology

- Frontend: React 18, Vite, React Router, Leaflet/OpenStreetMap, Chart.js, Lucide React
- Backend: Node.js, Express, JWT authentication, role-based access control
- Database: Supabase (PostgreSQL JSONB document tables)
- AI: local deterministic rule-based analysis engine

## Project structure

```text
CivicPulse/
├── client/                 React/Vite frontend
│   ├── public/             Static and demo evidence assets
│   └── src/
│       ├── components/     Shared UI components
│       ├── context/        Authentication, language, and toast providers
│       ├── layouts/        Role-aware dashboard shell
│       └── pages/          Citizen, officer, admin, and public views
├── server/                 Express API
│   ├── controllers/        Request handlers
│   ├── db/                 Supabase client, adapter, schema, and seed script
│   ├── middleware/         Authentication and role checks
│   ├── models/             Supabase-backed model interfaces
│   ├── routes/             API route definitions
│   └── services/           AI analysis engine
├── .env.example
└── package.json
```

## Requirements

- Node.js 18 or newer
- npm
- A Supabase project

## Setup

### 1. Create the database tables

In the Supabase SQL Editor, run [server/supabase-schema.sql](server/supabase-schema.sql).

### 2. Configure environment variables

Copy `.env.example` to `.env` at the repository root and supply your values:

```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=use-a-long-random-secret
JWT_EXPIRES_IN=24h

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
VITE_GOOGLE_CLIENT_ID=your-google-oauth-web-client-id.apps.googleusercontent.com
```

Keep `SUPABASE_SERVICE_ROLE_KEY` private: it is used only by the Express server. `MONGODB_URI` remains in the example file for legacy compatibility but is not used by the application.

For Google login, enable Google in Supabase Authentication and add `http://localhost:5173` as an authorized JavaScript origin in Google Cloud Console.

### 3. Install dependencies

```bash
npm run install-all
```

### 4. Seed demo data

```bash
npm run seed
```

The seed includes departments, officers, complaints, evidence, timelines, feedback, and notifications. It can be run repeatedly without replacing existing demo data.

## Run locally

Start frontend and backend together:

```bash
npm run dev
```

Or start them in separate terminals:

```bash
# Terminal 1 — API and Supabase connection
npm run server

# Terminal 2 — React app
npm run client
```

Open `http://localhost:5173`.

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Express API | `http://localhost:5000` |
| API health check | `http://localhost:5000/api/health` |

Vite proxies frontend `/api` calls to the Express server on port `5000`. On startup, the API terminal should print `Supabase connected`.

If port `5173` is already used, either open the existing app or run:

```bash
cd client
npm run dev -- --port 5174
```

## Demo accounts

All seeded accounts use `password123`.

| Role | Email |
|---|---|
| Citizen | `citi@123` |
| Field officer | `off@123` |
| Administrator | `admin@123` |

The configured municipal authority email is enforced as an administrator by the server during email and Google login.

## API summary

Protected endpoints require `Authorization: Bearer <token>`.

| Area | Endpoints |
|---|---|
| Authentication | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Complaints | `GET/POST /api/complaints`, `GET/PUT /api/complaints/:id` |
| Complaint workflow | Timeline, evidence, verification, feedback, and support endpoints |
| Field officer | Work orders, stats, claiming, status updates, and repair evidence |
| Admin | Analytics, hotspots, departments, users, officers, complaints, and assignment |
| AI | `POST /api/ai/analyze`, `POST /api/ai/detect-duplicate` |
| Notifications | List, mark one read, and mark all read |

## Notes

- Documents are stored as JSONB records in Supabase while the server retains a model-style API.
- Demo evidence is in `client/public/demo`; uploaded files are served from `server/uploads`.
- The AI service is local and deterministic, so no third-party AI key is required.
