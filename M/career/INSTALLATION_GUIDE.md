# Career Bridge - Step-by-Step Installation Guide

## Prerequisites

- **Node.js** (v14+) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) OR use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud)

## ⚡ Quick Start (< 5 minutes)

### Step 1: Run Setup Script

**Windows:**
```bash
cd c:\Users\ASUS\Desktop\career
setup.bat
```

**macOS/Linux:**
```bash
cd ~/Desktop/career
chmod +x setup.sh
./setup.sh
```

This will:
- Install all dependencies
- Create `.env` file
- Set up both frontend and backend

---

## 🔧 Manual Installation (if scripts don't work)

### Step 1: Set Up Backend

```bash
cd career/backend

# Copy environment file
copy .env.example .env
# Or on Mac/Linux:
cp .env.example .env
```

### Step 2: Edit Backend Configuration

Open `backend/.env` and update:

```env
MONGODB_URI=mongodb://localhost:27017/career-bridge
JWT_SECRET=your_super_secret_key_123
PORT=5000
NODE_ENV=development
```

**If using MongoDB Atlas instead:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/career-bridge
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

Wait for installation to complete... (takes 1-2 minutes)

### Step 4: Start Backend Server

```bash
npm run dev
```

You should see:
```
Career Bridge Backend running on port 5000
```

**Keep this terminal open!**

### Step 5: Set Up Frontend

Open **NEW terminal** and navigate to frontend:

```bash
cd career/frontend
npm install
```

Wait for installation... (takes 1-2 minutes)

### Step 6: Start Frontend Server

```bash
npm run dev
```

You should see:
```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
```

### Step 7: Open in Browser

Open your browser and go to:
```
http://localhost:5173
```

🎉 **You should see the Career Bridge landing page!**

---

## ✅ Verify Installation

### Check Backend is Running

Open a new terminal and run:

```bash
curl http://localhost:5000/health
```

You should see:
```json
{"message":"Career Bridge API is running"}
```

### Check Frontend is Running

Open browser to `http://localhost:5173` and you should see:
- Career Bridge heading
- Hero section with CTA buttons
- Stakeholder cards
- Analytics dashboard
- Footer

---

## 🗄️ Database Setup Options

### Option A: Local MongoDB (Recommended for Development)

1. Install from [mongodb.com/community](https://www.mongodb.com/try/download/community)
2. Start MongoDB:
   - **Windows**: `mongod` in command prompt
   - **macOS**: `mongod` or use `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`
3. Leave running in background
4. Backend will auto-connect to `mongodb://localhost:27017/career-bridge`

### Option B: MongoDB Atlas (Cloud - Free)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free"
3. Create account and login
4. Create organization → Create project → Create cluster
5. Wait for cluster to deploy (5-10 minutes)
6. Click "Connect" → "Connect your application"
7. Copy connection string
8. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/career-bridge
   ```
9. Restart backend server

---

## 📝 Create Test Users

### Option 1: Via UI (Recommended)

1. Go to http://localhost:5173/signup
2. Fill in form:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Password: "password123"
   - Role: "student"
3. Click "Create Account"
4. You're now logged in!

### Option 2: Create Admin User

1. Go to http://localhost:5173/signup
2. Fill in form with role: "admin"
3. Go to http://localhost:5173/admin
4. Now you can manage users!

### Option 3: Via API (curl)

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```

---

## 🧪 Test Core Features

### 1. Test Login
- Go to http://localhost:5173/login
- Use email: "test@example.com"
- Use password: "password123"
- Should redirect to home page

### 2. Test Q&A
- Go to http://localhost:5173/qa
- Click "Ask a Question"
- Fill in question details
- Submit and see it in the list

### 3. Test Feedback
- Go to http://localhost:5173/feedback
- Type feedback message
- Submit and see it in list

### 4. Test Admin Dashboard
- Go to http://localhost:5173/admin (if logged in as admin)
- View users table
- Try creating/editing/deleting users

---

## 🐛 Troubleshooting

### "Port already in use"

**Frontend (5173):**
```bash
# Find and kill process
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5173
kill -9 <PID>
```

**Backend (5000):**
```bash
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5000
kill -9 <PID>
```

Or change port in:
- Frontend: `frontend/vite.config.js` → `server.port`
- Backend: `backend/.env` → `PORT=3000`

### "MongoDB connection failed"

Error:
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

Solutions:
1. **Start MongoDB locally:**
   ```bash
   mongod
   ```

2. **Or use MongoDB Atlas:**
   - Get connection string
   - Update `backend/.env` MONGODB_URI
   - Restart backend

3. **Check connection string:**
   ```bash
   # Test connection
   mongo mongodb://localhost:27017/career-bridge
   ```

### "CORS error"

Error appears in browser console:
```
Access to XMLHttpRequest blocked by CORS policy
```

Solutions:
1. Check backend is running on `http://localhost:5000`
2. Check frontend proxy in `frontend/vite.config.js`
3. Restart both servers

### "npm dependencies installation fails"

```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules

# Reinstall
npm install
```

### "Token not valid"

- Clear browser storage: `localStorage.clear()`
- Login again
- Make sure token header is: `Authorization: Bearer {token}`

---

## 📂 Project Files Location

All files are located in:
```
c:\Users\ASUS\Desktop\career\
```

### Frontend Code:
```
c:\Users\ASUS\Desktop\career\frontend\src\
```

### Backend Code:
```
c:\Users\ASUS\Desktop\career\backend\
```

### Documentation:
- `README.md` - Full documentation
- `QUICK_START.md` - Setup guide
- `PROJECT_GUIDE.md` - Feature guide
- `API_TESTING_GUIDE.md` - API reference
- `PROJECT_FILES.md` - File structure

---

## 🚀 Development Workflow

### Daily Development

**Terminal 1 - Backend:**
```bash
cd career/backend
npm run dev
# Runs with auto-reload on file changes
```

**Terminal 2 - Frontend:**
```bash
cd career/frontend
npm run dev
# Runs with hot module replacement
```

**Terminal 3 - Optional:**
```bash
# Use for debugging or running utilities
```

### File Changes

- **Backend changes**: Auto-reload (via nodemon)
- **Frontend changes**: Hot reload (via Vite)
- **CSS changes**: Instant update
- **Config changes**: Need manual restart

---

## 📦 Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

Creates optimized files in `frontend/dist/` for deployment.

### Backend Deployment

```bash
# Set production environment
# Deploy to Heroku, Railway, or similar
npm start
```

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change JWT_SECRET in `.env`
- [ ] Use MongoDB Atlas (not local)
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Add input validation
- [ ] Remove console.log statements
- [ ] Set secure CORS origins
- [ ] Use environment variables for all secrets
- [ ] Enable database backups
- [ ] Monitor error logs

---

## 📚 Learning Resources

### Recommended Reading

1. **React Router**: https://reactrouter.com/docs
2. **Mongoose**: https://mongoosejs.com/docs/
3. **Express**: https://expressjs.com/
4. **Tailwind CSS**: https://tailwindcss.com/docs
5. **JWT**: https://jwt.io/introduction

### Testing APIs

Use `API_TESTING_GUIDE.md` for:
- curl commands
- Postman setup
- Expected responses
- Error handling

---

## 💬 Need Help?

### Common Questions

**Q: How do I change the theme colors?**
A: Edit `frontend/tailwind.config.js` → colors section

**Q: How do I add a new page?**
A: Create file in `frontend/src/pages/`, add route in `App.jsx`

**Q: How do I add an API endpoint?**
A: Create controller → route file → mount in `server.js`

**Q: How long does setup take?**
A: First time: 5-10 minutes (npm install)
   After that: Just run the servers (< 1 minute)

**Q: Can I use without MongoDB locally?**
A: Yes! Use MongoDB Atlas (free cloud version)

---

## ✨ You're Ready!

Everything is set up! Now you can:

1. ✅ Start both servers
2. ✅ Open http://localhost:5173
3. ✅ Create a test account
4. ✅ Test all features
5. ✅ Explore the codebase
6. ✅ Customize the application
7. ✅ Deploy to production

Happy coding! 🎉

---

**Need the documentation?** Check:
- `README.md` - Complete overview
- `PROJECT_GUIDE.md` - Feature explanations
- `API_TESTING_GUIDE.md` - API reference
