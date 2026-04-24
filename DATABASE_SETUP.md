# Career-Bridge Database Setup

This integrated project already has backend services in each module folder. Use these databases:

- `M` module: MongoDB (`M/career/Career-Bridge/backend`)
- `I` module: MongoDB (`I/Internship-Vacancy-Management/backend`)
- `T` module: PostgreSQL via Prisma (`T/backend`)
- `D` module: MongoDB (`D/Career-Bridge/backend`)

## 1) Environment Variables

Create `.env` files inside each backend module (never commit these):

- `M/career/Career-Bridge/backend/.env`
- `I/Internship-Vacancy-Management/backend/.env`
- `T/backend/.env`
- `D/Career-Bridge/backend/.env`

Minimum expected values:

- MongoDB modules: `MONGO_URI`, `JWT_SECRET`, `PORT`
- Prisma module (`T/backend`): `DATABASE_URL`, `PORT`

## 2) Run Database-Backed App

From project root:

1. `npm run install:all`
2. `npm run dev`
3. Open `http://localhost:5180`

The unified website (`frontend/main-app`) includes:

- Home page with all module options
- Dedicated Login page
- Dedicated Sign Up page
- Shared header and footer across pages
