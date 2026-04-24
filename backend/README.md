# Career Bridge Backend

Backend server for Career Bridge application.

## Setup

1. Install dependencies from the repository root so both the MongoDB backend and the readiness workspace are installed:
```bash
npm install
```

2. Create `.env` file with:
```
MONGODB_URI=mongodb://localhost:27017/career-bridge
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
```

3. Start the servers from the `backend` folder:

For development (with auto-reload):
```bash
npm run dev
```

This starts the MongoDB backend on `http://localhost:5000` and the readiness API on `http://localhost:4000`.

If you only need the readiness API, run `npm run dev` in the `server` folder.

The readiness API now looks up `/api/users/me` in MongoDB first and mirrors the user into Prisma when needed, so Mongo auth users are visible to the readiness routes.

For production:
```bash
npm start
```

The backend server will run on `http://localhost:5000`.

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/login` - Login user

### Users (Admin only)
- GET `/api/users` - Get all users
- POST `/api/users` - Create new user
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

### Questions
- GET `/api/questions` - Get all questions
- POST `/api/questions` - Create question
- DELETE `/api/questions/:id` - Delete question
- POST `/api/questions/:id/upvote` - Upvote question

### Feedback
- GET `/api/feedback` - Get all feedback
- POST `/api/feedback` - Submit feedback
- PATCH `/api/feedback/:id` - Update feedback status
- DELETE `/api/feedback/:id` - Delete feedback
