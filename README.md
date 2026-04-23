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

1. Open terminal at project root.
2. Install shell dependencies: `npm install --prefix frontend/shell`
3. Start shell: `npm run dev --prefix frontend/shell`
4. In separate terminals, start each module frontend and backend (see `install:all` in `package.json` for paths).
5. Open `http://localhost:5173` and choose `M`, `I`, `T`, or `D`.

## Phase 3 (Single Native App Foundation)

`frontend/main-app` is the unified app:

1. `npm install --prefix frontend/main-app`
2. `npm run dev --prefix frontend/main-app`
3. Open `http://localhost:5180`

## One Command Startup

1. First-time only: `npm run install:all`
2. Every time: `npm run dev`
3. Open `http://localhost:5180`

## Database

See `DATABASE_SETUP.md`.

## Notes

- Member folders stay separate; integration is additive.
- If any module needs `.env`, keep that file inside that module only.
