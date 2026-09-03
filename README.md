# CivicPulse AI

Smart civic complaint reporting and resolution platform for citizens, municipal officers, and administrators.

## Overview

CivicPulse connects the full complaint lifecycle:

`Citizen report -> AI analysis -> department dispatch -> officer resolution -> citizen verification`

The application supports location-based reports, evidence uploads, duplicate detection, priority and SLA calculation, complaint timelines, officer assignment, notifications, hotspot analysis, and administrative analytics.

## Features

### Citizens
- Register and sign in
- Report an issue with category, description, location, and evidence
- View complaints, status history, nearby complaints, and notifications
- Support other complaints
- Verify or reject a submitted resolution and provide feedback

### Field officers
- View assigned complaints and nearby department complaints
- Claim eligible complaints
- Update complaint status
- Upload before and after evidence
- Track SLA deadlines and officer statistics

### Administrators
- View city-wide complaint analytics
- Review live complaint locations and hotspots
- Inspect department performance
- Search and filter complaints
- Assign departments and officers

## Technology

- Frontend: React 18, Vite, React Router, Leaflet, Chart.js, Lucide React
- Backend: Node.js, Express, JWT authentication, role-based access control
- Database: Supabase using PostgreSQL JSONB document tables
- AI: Local deterministic rule-based analysis engine

## Project Structure

```text
Hacksparo/
├── client/                 React/Vite frontend
│   └── src/
│       ├── components/     Shared UI components
│       ├── context/        Auth, language, and toast providers
│       ├── layouts/        Dashboard layout
│       └── pages/          Landing, citizen, officer, and admin views
├── server/                 Express API
│   ├── controllers/        Request handlers
│   ├── db/                 Supabase client, adapter, and seed script
│   ├── middleware/         Authentication and role checks
│   ├── models/             Supabase-backed model interfaces
│   ├── routes/             API route definitions
│   └── services/           AI analysis engine
├── server/supabase-schema.sql
└── .env.example
```

## Requirements

- Node.js 18 or newer
- npm
- A Supabase project

## Setup

### 1. Create the Supabase tables

Open the Supabase SQL Editor and run [server/supabase-schema.sql](server/supabase-schema.sql).

The backend uses the Supabase service-role key. Keep this key on the server and never expose it in the React client.

### 2. Configure environment variables

Copy `.env.example` to `.env` in the repository root and set:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=use-a-long-random-secret
JWT_EXPIRES_IN=24h
PORT=5000
```

Create `client/.env` from [client/.env.example](client/.env.example) and set the same Supabase project URL plus the frontend publishable key:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
VITE_GOOGLE_CLIENT_ID=your-google-oauth-web-client-id.apps.googleusercontent.com
```

Enable Google as a provider in Supabase. In Google Cloud Console, add your frontend origins (for example `http://localhost:5173`) to the OAuth web client configured in `VITE_GOOGLE_CLIENT_ID`.

### 3. Install dependencies

From the repository root:

```bash
npm run install-all
```

### 4. Seed demo data

```bash
npm run seed
```

The seed command creates demo users, departments, officers, complaints, timelines, evidence, feedback, and notifications.

## Run the application

Start both frontend and backend:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1
npm run server

# Terminal 2
npm run client
```

URLs:

- Frontend: http://localhost:5173
- API: http://localhost:5000
- Health check: http://localhost:5000/api/health

## Demo accounts

All demo accounts use the password `password123`.

| Role | Email |
|---|---|
| Citizen | `citizen@civicpulse.demo` |
| Field officer | `officer@civicpulse.demo` |
| Administrator | `admin@civicpulse.demo` |

## API summary

All protected endpoints require `Authorization: Bearer <token>`.

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Complaints | `GET /api/complaints`, `POST /api/complaints`, `GET /api/complaints/:id` |
| Complaint workflow | `PUT /api/complaints/:id`, timeline, evidence, verification, feedback, support |
| Officer | `GET /api/officer/complaints`, stats, status, claim, evidence |
| Admin | analytics, hotspots, departments, complaints, officers, assignment |
| AI | `POST /api/ai/analyze`, `POST /api/ai/detect-duplicate` |
| Notifications | list, mark one read, mark all read |

## Notes

- The application stores documents as JSONB records in separate Supabase tables while retaining the existing model-style server API.
- Uploaded files are served from `server/uploads`; demo evidence assets are served from the client public directory.
- The AI service is local and deterministic, so the demo does not require an external AI provider.
- Google Identity Services obtains an ID token in the frontend and passes it to Supabase with `signInWithIdToken`, then the app exchanges the resulting verified Supabase access token for its existing CivicPulse JWT. No Supabase OAuth redirect URL is used.
