# Career Bridge - Quick Start Guide

## 🚀 Fast Setup (5 minutes)

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
cd career
setup.bat
```

**macOS/Linux:**
```bash
cd career
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

#### Step 1: Backend Setup
```bash
cd career/backend

# Copy environment file
cp .env.example .env

# Edit .env file and update:
# - MONGODB_URI
# - JWT_SECRET

# Install dependencies
npm install

# Start the backend
npm run dev
```

#### Step 2: Frontend Setup (New Terminal)
```bash
cd career/frontend

# Install dependencies
npm install

# Start the frontend
npm run dev
```

#### Step 3: Open in Browser
```
http://localhost:5173
```

---

## 📋 Database Setup

### Local MongoDB

1. Download from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install and run: `mongod`
3. Backend will connect to `mongodb://localhost:27017/career-bridge`

### MongoDB Atlas (Cloud)

1. Go to [atlas.mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Create free account and cluster
3. Get connection string
4. Update `MONGODB_URI` in `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/career-bridge
```

---

## 🔑 Default Admin Credentials

The system will create an admin on first run:

```
Email: admin@test.com
Password: 123456
Role: admin
```

Create this user through the admin panel or manually in MongoDB.

---

## 📱 Testing Different Roles

### Create Test Users

1. Go to `http://localhost:5173/signup`
2. Create accounts with different roles:
   - **Student**: For job seekers
   - **University**: For educational institutions
   - **Employer**: For companies
   - **Admin**: For system administration

### Test Features

1. **Login**: `http://localhost:5173/login`
2. **Q&A**: `http://localhost:5173/qa` (requires login)
3. **Feedback**: `http://localhost:5173/feedback` (requires login)
4. **Admin**: `http://localhost:5173/admin` (admin only)

---

## 🛠️ Troubleshooting

### Port Already in Use

**Frontend (5173):**
```bash
# Kill process on port 5173
# Windows: netstat -ano | findstr :5173
# macOS/Linux: lsof -i :5173 | kill
```

**Backend (5000):**
```bash
# Kill process on port 5000
# Windows: netstat -ano | findstr :5000
# macOS/Linux: lsof -i :5000 | kill
```

Or change ports in:
- Frontend: `vite.config.js` → `server.port`
- Backend: `.env` → `PORT`

### MongoDB Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
1. Ensure mongod is running
2. Check MONGODB_URI in `.env`
3. Use MongoDB Atlas if local MongoDB unavailable

### CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Backend has CORS enabled globally
- Check frontend proxy in `vite.config.js`
- Ensure backend runs on `http://localhost:5000`

### Token Expired

- Clear localStorage: `localStorage.clear()`
- Login again

---

## 📚 File Structure Overview

```
career/
├── frontend/
│   ├── src/
│   │   ├── components/     (Reusable UI components)
│   │   ├── pages/          (Page components)
│   │   ├── context/        (Auth state management)
│   │   ├── styles/         (CSS files)
│   │   └── App.jsx         (Main app with routing)
│   └── vite.config.js      (Build config)
│
├── backend/
│   ├── config/             (Database config)
│   ├── models/             (Database schemas)
│   ├── controllers/        (Business logic)
│   ├── routes/             (API endpoints)
│   ├── middleware/         (Auth & validation)
│   └── server.js           (Express server)
│
└── README.md               (Full documentation)
```

---

## 🚀 Development Commands

### Frontend
```bash
cd frontend

npm run dev      # Start dev server
npm run build    # Optimize for production
npm run preview  # Preview production build
```

### Backend
```bash
cd backend

npm run dev      # Start with auto-reload
npm start        # Run production
```

---

## 🌐 API Endpoints

Quick reference for testing with Postman or curl:

```bash
# Auth
POST   http://localhost:5000/api/auth/signup
POST   http://localhost:5000/api/auth/login

# Users (Admin)
GET    http://localhost:5000/api/users
POST   http://localhost:5000/api/users
PUT    http://localhost:5000/api/users/:id
DELETE http://localhost:5000/api/users/:id

# Questions
GET    http://localhost:5000/api/questions
POST   http://localhost:5000/api/questions
DELETE http://localhost:5000/api/questions/:id
POST   http://localhost:5000/api/questions/:id/upvote

# Feedback
GET    http://localhost:5000/api/feedback
POST   http://localhost:5000/api/feedback
PATCH  http://localhost:5000/api/feedback/:id
DELETE http://localhost:5000/api/feedback/:id
```

---

## 💡 Tips

1. **Hot Reload**: Code changes auto-reload in dev mode
2. **Database Browser**: Use MongoDB Compass for visual DB management
3. **API Testing**: Use Postman or VS Code REST Client
4. **Console Logs**: Check browser console and terminal for errors
5. **Local Storage**: Admin login token stored in browser

---

## 📖 Next Steps

1. ✅ Complete setup
2. 📝 Explore the codebase
3. 🎨 Customize colors and theme
4. 🔌 Add more features
5. 🚀 Deploy to production

Happy coding! 🎉
