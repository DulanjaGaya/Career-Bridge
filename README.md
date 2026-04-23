# Career Bridge Integrated (T / I / D / M)

This workspace keeps each member module separate and adds one website entry point.

## Folder Order

- `M/` - Login/Auth, User Management, Q&A, Feedback
- `I/` - Internship Posting, Smart Filter/Search
- `T/` - CV/Resume Builder, Dashboard Progress
- `D/` - Mock Interview Lobby, Resource Tracker
- `frontend/shell/` - single UI launcher for all modules
- `backend/api-gateway/` - single API gateway (optional, scaffolded)

## Ports (pre-set)

- M frontend: `5174`, backend: `5001`
- I frontend: `5175`, backend: `5002`
- T frontend: `5176`, backend: `5003`
- D frontend: `5177`, backend: `5004`
- Shell frontend: `5173`
- Gateway backend: `5050`

## Baby-Step Run Guide

1. Open terminal at project root:
   - `C:\Users\theru\Downloads\Career-Bridge-Integrated`
2. Install shell dependencies:
   - `npm install --prefix frontend/shell`
3. Start shell:
   - `npm run dev --prefix frontend/shell`
4. In separate terminals, start each module frontend and backend:
   - M frontend: `npm install --prefix M/career/Career-Bridge/frontend`
   - M backend: `npm install --prefix M/career/Career-Bridge/backend`
   - I frontend: `npm install --prefix I/Internship-Vacancy-Management/frontend`
   - I backend: `npm install --prefix I/Internship-Vacancy-Management/backend`
   - T frontend: `npm install --prefix T/frontend`
   - T backend: `npm install --prefix T/backend`
   - D frontend: `npm install --prefix D/Career-Bridge/frontend`
   - D backend: `npm install --prefix D/Career-Bridge/backend`
5. Run each service with its local `npm run dev`.
6. Open `http://localhost:5173` and choose `M`, `I`, `T`, or `D`.

## Phase 3 (Single Native App Foundation)

This project now includes a no-iframe native app shell at:

- `frontend/main-app`

Run it with:

1. `npm install --prefix frontend/main-app`
2. `npm run dev --prefix frontend/main-app`
3. Open `http://localhost:5180`

Notes:

- This is the migration base for full deep merge.
- Feature routes exist for all `M/I/T/D` components.
- Next steps are page-by-page migration from member folders into `frontend/main-app/src/pages`.

## One Command Startup (what you asked)

From project root:

1. First-time only:
   - `npm run install:all`
2. Every time you want to run locally:
   - `npm run dev`
3. Open:
   - `http://localhost:5180`

Use this as the only website URL. Other localhost links printed in terminal are internal services for modules.

This starts:

- Main app (`frontend/main-app`)
- API gateway (`backend/api-gateway`)
- All module backends (`M`, `I`, `T`, `D`)
- All module frontends (`M`, `I`, `T`, `D`)

## Notes

- Member folders stay separate and unchanged in structure.
- Integration is non-destructive: shell/gateway are additive.
- If any module needs `.env`, keep that file inside that module only.
