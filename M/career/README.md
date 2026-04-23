# Career Bridge - Full Stack Application

> Bridging the Gap Between Education and Employment

Career Bridge is a comprehensive platform connecting students, universities, and employers. It provides a modern web application with Q&A functionality, feedback system, user management, and beautiful analytics dashboard.

## 🌟 Features

- **User Authentication** - JWT-based secure login/signup
- **Role-Based Access Control** - Student, University, Employer, Admin roles
- **Q&A Community** - Ask questions, get answers, upvote content
- **Feedback System** - Users submit feedback, admins track and resolve
- **User Management** - Admin dashboard to manage all users
- **Analytics Dashboard** - Real-time statistics and charts
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Modern UI** - Dark blue theme with orange accents

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Context API** - State management
- **Lucide React** - Icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin support

## 📁 Project Structure

```
career/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── StakeholderCards.jsx
│   │   │   ├── AnalyticsSection.jsx
│   │   │   ├── CTASection.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── QAPage.jsx
│   │   │   ├── FeedbackPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── context/          # Context API
│   │   │   └── AuthContext.jsx
│   │   ├── styles/           # CSS files
│   │   │   └── index.css
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── backend/                  # Node.js + Express backend
    ├── config/               # Configuration
    │   └── db.js
    ├── models/               # Database models
    │   ├── User.js
    │   ├── Question.js
    │   └── Feedback.js
    ├── controllers/          # Business logic
    │   ├── authController.js
    │   ├── userController.js
    │   ├── questionController.js
    │   └── feedbackController.js
    ├── routes/               # API routes
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── questionRoutes.js
    │   └── feedbackRoutes.js
    ├── middleware/           # Custom middlewares
    │   ├── auth.js           # JWT authentication
    │   └── authorize.js      # Role-based authorization
    ├── server.js             # Entry point
    ├── package.json
    ├── .env.example
    └── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (running locally or cloud)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Edit `.env` and add MongoDB URI and JWT secret:
```
MONGODB_URI=mongodb://localhost:27017/career-bridge
JWT_SECRET=your_super_secret_key
PORT=5000
NODE_ENV=development
```

5. Start the backend server:
```bash
npm run dev    # Development with auto-reload
npm start      # Production
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📚 API Documentation

All API responses follow REST conventions.

### Authentication
```
POST /api/auth/signup
POST /api/auth/login
```

### Users (Admin only)
```
GET    /api/users           - Get all users
POST   /api/users           - Create user
PUT    /api/users/:id       - Update user
DELETE /api/users/:id       - Delete user
```

### Questions
```
GET    /api/questions                  - Get all questions
POST   /api/questions                  - Create question (authenticated)
DELETE /api/questions/:id              - Delete question
POST   /api/questions/:id/upvote       - Upvote question
```

### Feedback
```
GET    /api/feedback        - Get all feedback
POST   /api/feedback        - Submit feedback (authenticated)
PATCH  /api/feedback/:id    - Update status (admin)
DELETE /api/feedback/:id    - Delete feedback
```

## 🎨 UI Components

### Design System
- **Primary Color**: Dark Blue (#1e3a8a)
- **Accent Color**: Orange (#FF8C00)
- **Dark Background**: #0f172a

### Key Components
1. **Navbar** - Global navigation with auth state
2. **Hero Section** - Landing page headline with CTAs
3. **Stakeholder Cards** - Benefits for each user type
4. **Analytics Section** - Charts and statistics
5. **CTA Section** - Call-to-action for signup
6. **Footer** - Links and social media

## 🔐 Authentication Flow

1. User submits signup/login form
2. Backend validates credentials
3. JWT token generated and returned
4. Token stored in localStorage
5. Subsequent requests include token in Authorization header
6. Protected routes check token validity with middleware

## 👤 User Roles

- **Student** - Can ask questions, answer, view feedback
- **University** - Can post resources, view placements
- **Employer** - Can browse talent, post jobs
- **Admin** - Full access, manage users, moderate content

## 🧪 Testing

### Login Test Account
```
Email: test@example.com
Password: 123456
Role: admin
```

### Create Custom Test Users
Use the Admin panel at `/admin` to create users with different roles.

## 📝 Environment Variables

### Backend (.env)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

### Frontend
- Proxy configured in `vite.config.js` to `/api` on `localhost:5000`

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in `.env`

### CORS Error
- Backend has CORS enabled for all origins
- Check frontend proxy in `vite.config.js`

### JWT Token Error
- Token expires in 7 days
- Clear localStorage and login again if needed

## 📦 Deployment

### Frontend (Vercel, Netlify)
```bash
npm run build
# Deploy the 'dist' folder
```

### Backend (Heroku, Railway)
```bash
# Set environment variables
# Push to platform
```

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Built with ❤️ for bridging education and employment opportunities.

---

For more information, visit the individual README files in `frontend/` and `backend/` directories.
