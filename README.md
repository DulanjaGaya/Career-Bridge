# Career readiness platform (résumé + dashboard)

Full-stack demo aligned with **React**, **Node.js (Express)**, and a **SQL** database via **Prisma** (SQLite locally; PostgreSQL-ready).

## Features (assignment coverage)

| Area | What is implemented |
| --- | --- |
| **Résumé builder** | Guided sections (profile, contact, education, skills, projects, experience), client-side validation (Zod + React Hook Form), PDF (**jsPDF**) & Word (**docx**) export |
| **Dummy data** | “Load demo CV” on the home page |
| **AI / NLP (demo)** | `POST /api/suggestions/achievement` — rule-based phrasing helper you can swap for OpenAI later |
| **Dashboard** | Readiness score engine, **Chart.js** charts, milestone progress bars, task CRUD, notifications |
| **Real-time** | **Socket.IO** — server pushes notifications to the signed-in user’s room |
| **Automation** | **node-cron** — daily due-soon reminders + periodic overdue alerts (creates `Notification` rows and emits over the socket) |
| **Modularity** | REST routes grouped by domain (`/api/resumes`, `/api/dashboard`, `/api/users`) so internship / mock-interview modules can attach later |

## Prerequisites

- **Node.js 20+** (LTS recommended)
- npm (comes with Node)

## Setup

```bash
cd c:\Users\theru\OneDrive\Desktop\ITPM
npm install
cd server
npx prisma generate
npx prisma db push
cd ..
npm run dev
```

- **API + WebSocket:** [http://localhost:4000](http://localhost:4000) (`/api/health`)
- **React app:** [http://localhost:5173](http://localhost:5173)

The Vite dev server proxies `/api` to the backend. For production, serve the built client and API behind one origin or set `VITE_SOCKET_URL` to your API’s public URL.

## PostgreSQL (optional)

1. Create a database and set `DATABASE_URL` in `server/.env` (see `server/.env.example`).
2. In `server/prisma/schema.prisma`, change:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Run `npx prisma db push` again.

## Presentation tip (2-minute demo)

1. Home → **Load demo CV** → open **Résumé builder** → **Save** → **Download PDF**.
2. Open **Dashboard** → add or toggle tasks → point at the **readiness score** and **charts**.

## Project structure

- `client/` — React (Vite) SPA  
- `server/` — Express API, Prisma, cron, Socket.IO  

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Runs API + client together |
| `npm run db:push` | Applies Prisma schema to the local DB |
| `npm run db:studio` | Opens Prisma Studio |
