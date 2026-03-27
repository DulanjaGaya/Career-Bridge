# Career Bridge

Full-stack interview practice platform built with React, Vite, Tailwind CSS, Express, and MongoDB. The app combines two main workflows:

- real-time mock interview lobbies with timed multiple-choice questions and live scoring
- a personal resource tracker with progress history, ratings, PDF resource submission, and downloadable progress reports

## Features

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

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- Axios
- Framer Motion

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JSON Web Tokens
- bcryptjs
- PDFKit

## Project Structure

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
|   |   |-- api/
|   |   |-- components/
|   |   |-- context/
|   |   `-- pages/
|   `-- vite.config.js
`-- README.md
```

## Prerequisites

- Node.js 18+
- npm
- MongoDB running locally or a MongoDB connection string you can use

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/interview_prep
JWT_SECRET=add_your_secret_here
NODE_ENV=development
```

### Variable Reference

| Variable | Description |
| --- | --- |
| `PORT` | Port used by the Express API |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign auth tokens |
| `NODE_ENV` | Runtime environment name |

## Installation

Install dependencies for both apps:

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

## Running Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Open the app at `http://localhost:5173`.

The Vite dev server proxies `/api` requests to `http://localhost:5000`.

## Seed Sample Data

The repo includes starter interview questions and learning resources in `backend/seed/`.

Import the sample data:

```bash
cd backend
node seed/seeder.js
```

Delete seeded questions and resources:

```bash
cd backend
node seed/seeder.js -d
```

Note: the seed script clears the `Question` and `Resource` collections before importing.

## Available Scripts

### Backend

| Command | Description |
| --- | --- |
| `npm start` | Start the API with Node |
| `npm run dev` | Start the API with Nodemon |

### Frontend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Main API Areas

| Area | Endpoints |
| --- | --- |
| Auth | `/api/auth/register`, `/api/auth/login`, `/api/auth/me` |
| Lobbies | `/api/lobbies`, `/api/lobbies/:id`, `/api/lobbies/:id/join`, `/api/lobbies/:id/next-question`, `/api/lobbies/:id/close` |
| Questions | `/api/questions` |
| Answers | `/api/answers`, `/api/answers/results/:lobbyId/:questionId`, `/api/answers/scoreboard/:lobbyId` |
| Resources | `/api/resources`, `/api/resources/:id`, `/api/resources/add-pdf`, `/api/resources/timeline`, `/api/resources/report/download` |
| Progress | `/api/progress/toggle`, `/api/progress/summary` |
| Feedback | `/api/feedback`, `/api/feedback/:resourceId`, `/api/feedback/resource/:resourceId` |

## Current User Flows

1. Register or log in.
2. Browse or create a mock interview lobby.
3. Join a topic-based session and answer timed questions.
4. Track learning resources, mark items complete, and review your progress history.
5. Rate resources and export your completion report as a PDF.

## Notes

- Authentication tokens are stored in local storage on the frontend.
- Several API routes require a Bearer token.
- There is currently no automated test suite configured in either app.
