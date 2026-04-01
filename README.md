# Career Bridge

This repository contains multiple full-stack apps developed in collaboration.

---

## App A — Interview practice (`frontend/` + `backend/`)

Full-stack interview practice platform built with React, Vite, Tailwind CSS, Express, and MongoDB:

- Real-time mock interview lobbies with timed multiple-choice questions and live scoring
- Personal resource tracker with progress history, ratings, PDF resource submission, and downloadable progress reports

### Features

- JWT-based user registration and login
- Protected frontend routes and authenticated API requests
- Mock interview lobbies with host controls, participant tracking, timed questions, and a live scoreboard
- Topic-based question retrieval from MongoDB
- Resource tracking with filters, search, completion toggling, and topic summaries
- Feedback and rating system for learning resources
- Completion timeline view for each user
- PDF resource link submission from the UI
- Downloadable PDF completion report generated on the backend
- Seed script for sample questions and resources

### Tech stack (App A)

| | |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS, React Router, Axios, Framer Motion |
| Backend | Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs, PDFKit |

### Project structure (App A)

```text
.
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- seed/
|   |-- utils/
|   `-- server.js
|-- frontend/
|   |-- public/
|   |-- src/
|   `-- vite.config.js
```

### Prerequisites (App A)

- Node.js 18+
- npm
- MongoDB running locally or a connection string

### Environment (App A)

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/interview_prep
JWT_SECRET=add_your_secret_here
NODE_ENV=development
```

### Run App A locally

```bash
cd backend && npm install && npm run dev
```

```bash
cd frontend && npm install && npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` to `http://localhost:5000`.

### Seed (App A)

```bash
cd backend
node seed/seeder.js
```

Delete seeded data: `node seed/seeder.js -d`

---

## App B — Career readiness / résumé + dashboard (`client/` + `server/`)

Full-stack demo aligned with **React**, **Node.js (Express)**, and **SQL** via **Prisma** (SQLite locally; PostgreSQL-ready).

### Features (App B)

| Area | What is implemented |
| --- | --- |
| **Résumé builder** | Guided sections, client-side validation (Zod + React Hook Form), PDF (jsPDF) & Word (docx) export |
| **Dummy data** | “Load demo CV” on the home page |
| **AI / NLP (demo)** | `POST /api/suggestions/achievement` — rule-based phrasing helper |
| **Dashboard** | Readiness score, Chart.js charts, milestone progress, task CRUD, notifications |
| **Real-time** | Socket.IO — notifications to the signed-in user’s room |
| **Automation** | node-cron — daily due-soon reminders + overdue alerts |

### Prerequisites (App B)

- **Node.js 20+** (LTS recommended)
- npm

### Setup (App B)

```bash
npm install
cd server
npx prisma generate
npx prisma db push
cd ..
npm run dev
```

- **API + WebSocket:** [http://localhost:4000](http://localhost:4000) (`/api/health`)
- **React app:** [http://localhost:5173](http://localhost:5173) — *note:* conflicts with App A’s Vite port if both run; use one stack at a time or change ports in config.

Create `server/.env` from `server/.env.example` for database URL and secrets.

### PostgreSQL (optional, App B)

Set `DATABASE_URL` in `server/.env`, switch `provider` in `server/prisma/schema.prisma` to `postgresql`, then `npx prisma db push`.

### Project structure (App B)

- `client/` — React (Vite) SPA  
- `server/` — Express API, Prisma, cron, Socket.IO  

### Scripts (App B)

| Command | Description |
| --- | --- |
| `npm run dev` | Runs API + client together (from repo root) |
| `npm run db:push` | Applies Prisma schema |
| `npm run db:studio` | Prisma Studio |

---

## Notes

- **App A** auth tokens are stored in local storage; several routes require a Bearer token.
- **App B** is a separate module in this monorepo; coordinate ports and env files when running both.
