// ========================================
// Career Bridge - Complete Project Overview
// ========================================

// FRONTEND COMPONENTS & PAGES GUIDE
// ========================================

/* 
  COMPONENTS (Reusable UI Elements)
  
  1. Navbar.jsx
     - Global navigation header
     - Shows auth state (logged in / logged out)
     - Different options based on user role
     - Mobile responsive hamburger menu
     - Features: Logo, navigation links, user info, logout button
  
  2. HeroSection.jsx
     - Landing page hero with main headline
     - Shows: "Bridging the Gap Between Education and Employment"
     - CTA buttons: Get Started, Watch Demo
     - Stats display (10K+ Students, 500+ Universities, etc.)
     - Icon/image placeholder (handshake)
  
  3. StakeholderCards.jsx
     - Three cards for: Students, Universities, Employers
     - Shows benefits for each stakeholder
     - Hover effects and animations
     - Benefits listed for each group
  
  4. AnalyticsSection.jsx
     - Charts for data visualization (using Recharts)
     - Line chart: Placements trend over time
     - Pie chart: Job role distribution
     - Stats cards: Average placement time, satisfaction, match rate
     - Sample data included (can be replaced with real API data)
  
  5. CTASection.jsx
     - Call-to-action section
     - Encourages users to sign up
     - Links to signup page
     - Professional SaaS-style layout
  
  6. Footer.jsx
     - Company info
     - Quick links
     - Resources (docs, privacy, terms, FAQs)
     - Social media links
     - Copyright year (auto-updated)
*/

/*
  PAGES (Full Page Components)
  
  1. HomePage.jsx
     - Landing page combining all sections
     - Navbar + Hero + Stakeholders + Analytics + CTA + Footer
     - Entry point for first-time visitors
     - Shows full platform overview
  
  2. LoginPage.jsx
     - User login form
     - Email and password input
     - Remember me option
     - Recovery link
     - Link to signup page
     - Shows success/error messages
     - Uses useAuth() hook for authentication
  
  3. SignupPage.jsx
     - User registration form
     - Full name, email, password, role selection
     - Role options: Student, University, Employer
     - Password confirmation and validation
     - Terms acceptance checkbox
     - Uses useAuth() hook for account creation
     - Redirects to dashboard on success
  
  4. QAPage.jsx
     - Q&A community platform
     - View all questions
     - Create new question (logged-in users only)
     - Upvote questions
     - Delete own questions or (admin can delete any)
     - Shows answer count
     - Date and user info for each question
  
  5. FeedbackPage.jsx
     - Feedback submission system
     - User form to submit feedback
     - View all feedback with status
     - Admin can change status: pending, in-progress, resolved
     - Admin can delete feedback
     - User can only delete their own feedback
  
  6. AdminPage.jsx
     - User management dashboard
     - View all users in table format
     - Create new user
     - Edit user details
     - Delete users
     - Change user roles (student, university, employer, admin)
     - Redirects non-admin users to home page
     - Shows role badges with color coding
*/

// CONTEXT & STATE MANAGEMENT
// ========================================

/*
  AuthContext.jsx
  - Manages user authentication state
  - Provides: user, token, isLoading, login, signup, logout
  
  Usage:
    const { user, token, isLoading, login, signup, logout } = useAuth()
  
  Features:
    - Persists login state in localStorage
    - Auto-loads saved session on app start
    - JWT token management
    - Error handling for auth requests
    - Automatic timeout handling (tokens expire in 7 days)
*/

// BACKEND API ROUTES GUIDE
// ========================================

/*
  BASE URL: http://localhost:5000/api
  
  AUTHENTICATION ENDPOINTS
  ========================
  POST /auth/signup
    Body: { name, email, password, role }
    Response: { token, user }
    Public endpoint
  
  POST /auth/login
    Body: { email, password }
    Response: { token, user }
    Public endpoint
  
  
  USER MANAGEMENT ENDPOINTS (Admin only)
  ======================================
  GET /users
    Headers: Authorization: Bearer {token}
    Response: [{ _id, name, email, role, createdAt }, ...]
    Requires: Admin role
  
  POST /users
    Headers: Authorization: Bearer {token}
    Body: { name, email, password, role }
    Response: { _id, name, email, role }
    Requires: Admin role
  
  PUT /users/:id
    Headers: Authorization: Bearer {token}
    Body: { name, email, role }
    Response: Updated user object
    Requires: Admin role
  
  DELETE /users/:id
    Headers: Authorization: Bearer {token}
    Requires: Admin role
  
  
  QUESTION ENDPOINTS
  ==================
  GET /questions
    Response: [{ _id, title, description, userId, answers, upvotes, createdAt }, ...]
    Public endpoint
  
  POST /questions
    Headers: Authorization: Bearer {token}
    Body: { title, description }
    Response: Created question object
    Requires: Authentication
  
  DELETE /questions/:id
    Headers: Authorization: Bearer {token}
    Requires: Question owner or Admin
  
  POST /questions/:id/upvote
    Headers: Authorization: Bearer {token}
    Response: Updated question with upvotes count
    Requires: Authentication
  
  
  FEEDBACK ENDPOINTS
  ==================
  GET /feedback
    Response: [{ _id, message, userId, status, createdAt }, ...]
    Public endpoint
  
  POST /feedback
    Headers: Authorization: Bearer {token}
    Body: { message }
    Response: Created feedback object
    Requires: Authentication
  
  PATCH /feedback/:id
    Headers: Authorization: Bearer {token}
    Body: { status, response }
    Response: Updated feedback object
    Requires: Admin or Feedback owner
  
  DELETE /feedback/:id
    Headers: Authorization: Bearer {token}
    Requires: Feedback owner or Admin
*/

// DATABASE MODELS SCHEMA
// ========================================

/*
  USER MODEL
  ==========
  Fields:
    - _id (ObjectId)
    - name (String, required)
    - email (String, required, unique, validated)
    - password (String, required, hashed with bcrypt, min 6)
    - role (String, enum: ['student', 'university', 'employer', 'admin'])
    - createdAt (Date)
    - updatedAt (Date)
  
  
  QUESTION MODEL
  ==============
  Fields:
    - _id (ObjectId)
    - title (String, required)
    - description (String, required)
    - userId (ObjectId, ref: User, required)
    - answers (Array of Answer objects)
      - text (String)
      - userId (ObjectId, ref: User)
      - createdAt (Date)
    - upvotes (Number, default: 0)
    - upvoters (Array of ObjectId refs to Users)
    - createdAt (Date)
    - updatedAt (Date)
  
  
  FEEDBACK MODEL
  ==============
  Fields:
    - _id (ObjectId)
    - message (String, required)
    - userId (ObjectId, ref: User, required)
    - status (String, enum: ['pending', 'in-progress', 'resolved'])
    - response (String, optional admin response)
    - createdAt (Date)
    - updatedAt (Date)
*/

// AUTHENTICATION & AUTHORIZATION FLOW
// ========================================

/*
  SIGNUP FLOW
  ===========
  1. User fills signup form with: name, email, password, role
  2. Frontend validates fields
  3. Frontend sends POST /api/auth/signup with form data
  4. Backend validates input
  5. Backend checks if user exists
  6. Backend hashes password with bcrypt
  7. Backend creates user in MongoDB
  8. Backend generates JWT token (expires in 7 days)
  9. Backend returns token and user data
  10. Frontend stores token in localStorage
  11. Frontend stores user in localStorage
  12. Frontend redirects to dashboard
  
  
  LOGIN FLOW
  ==========
  1. User fills login form with: email, password
  2. Frontend validates fields
  3. Frontend sends POST /api/auth/login with credentials
  4. Backend finds user by email
  5. Backend compares password with bcrypt
  6. Backend generates JWT token if password matches
  7. Backend returns token and user data
  8. Frontend stores token and user
  9. Frontend redirects to home/dashboard
  
  
  PROTECTED REQUESTS
  ==================
  1. Frontend gets token from localStorage
  2. Frontend adds token to Authorization header: "Bearer {token}"
  3. Send API request with authorization header
  4. Backend middleware verifies token
  5. Backend extracts user ID from token
  6. Backend finds user in database
  7. Backend attaches user to req.user
  8. Request proceeds if authorized
  
  
  AUTHORIZATION LEVELS
  ====================
  Public: No authentication required
    - GET /questions
    - GET /feedback
    - POST /auth/signup
    - POST /auth/login
  
  Authenticated: Must be logged in
    - POST /questions
    - POST /questions/:id/upvote
    - POST /feedback
    - DELETE own feedback
    - DELETE own questions
  
  Admin Only: Must have admin role
    - GET /users
    - POST /users
    - PUT /users/:id
    - DELETE /users/:id
    - PATCH /feedback/:id (manage status)
*/

// STYLING & THEME
// ========================================

/*
  COLOR SCHEME
  ============
  Primary: Dark Blue (#1e3a8a)
  Accent: Orange (#FF8C00)
  Dark Background: #0f172a
  Text: White (default), Gray-300 (secondary)
  
  TAILWIND CLASSES
  ================
  gradient-text: Gradient from primary to accent
  glass-effect: Frosted glass background effect
  card-hover: Smooth hover animation and scale
  
  RESPONSIVE DESIGN
  =================
  Mobile-first approach
  Breakpoints: sm (640px), md (768px), lg (1024px)
  
  Example: md:grid-cols-3 (3 columns on medium+ screens)
*/

// FILE ORGANIZATION BEST PRACTICES
// ========================================

/*
  FOLDER STRUCTURE
  ================
  
  frontend/src/
    ├── components/          (Reusable UI components)
    ├── pages/               (Full page components)
    ├── context/             (State management - Context API)
    ├── services/            (API calls, utilities)
    ├── styles/              (CSS files)
    ├── App.jsx              (Main app with routing)
    └── main.jsx             (React DOM entry point)
  
  backend/
    ├── config/              (Database and app config)
    ├── models/              (Mongoose schemas)
    ├── controllers/         (Business logic)
    ├── routes/              (API route definitions)
    ├── middleware/          (Auth, validation, error handling)
    └── server.js            (Express app entry point)
  
  
  NAMING CONVENTIONS
  ==================
  Files:
    - Components: PascalCase (HomePage.jsx)
    - Utilities: camelCase (helpers.js)
    - Models: PascalCase (User.js)
    - Routes: camelCase (authRoutes.js)
  
  Variables:
    - Constants: UPPER_SNAKE_CASE
    - Functions: camelCase
    - Classes: PascalCase
    - Booleans: isX, hasX, shouldX pattern
*/

// COMMON TASKS & HOW-TO
// ========================================

/*
  ADD NEW PAGE
  ============
  1. Create new file in frontend/src/pages/
  2. Import components needed
  3. Create export default function
  4. Add route to App.jsx
  5. Link from Navbar if public
  
  
  ADD NEW API ENDPOINT
  ====================
  1. Create controller in backend/controllers/
  2. Create route in backend/routes/
  3. Mount route in server.js
  4. Call from frontend with fetch or axios
  
  
  MODIFY DATABASE SCHEMA
  ======================
  1. Update model file in backend/models/
  2. Run migrations (if needed)
  3. Update API controller to use new fields
  4. Update frontend form/display
  
  
  ADD NEW USER ROLE
  =================
  1. Update User model enum in backend/models/User.js
  2. Update authorize middleware if needed
  3. Add role option in signup form
  4. Add role-specific pages/features
  
  
  CHANGE COLOR THEME
  ==================
  Update in tailwind.config.js:
    colors: {
      primary: '#1e3a8a',
      accent: '#FF8C00',
      'dark-blue': '#0f172a'
    }
  
  Then replace class names:
    bg-primary → bg-[your-new-color]
    text-accent → text-[your-new-color]
*/

// DEBUGGING TIPS
// ========================================

/*
  FRONTEND DEBUGGING
  ==================
  1. Open browser DevTools (F12)
  2. Check Console tab for errors
  3. Check Network tab for API calls
  4. Check Application > localStorage for auth token
  5. Use React DevTools extension for state inspection
  
  
  BACKEND DEBUGGING
  =================
  1. Check terminal output for logs
  2. Use console.log() for debugging
  3. Check MongoDB connection
  4. Test API with Postman
  5. Check request/response headers
  6. Verify JWT token validity
  
  
  COMMON ERRORS & FIXES
  =====================
  
  "CORS error":
    - Check backend has cors() middleware
    - Check frontend proxy in vite.config.js
    - Restart both servers
  
  "Token not found":
    - Check localStorage: localStorage.getItem('token')
    - Re-login if expired
    - Clear cache: localStorage.clear()
  
  "MongoDB connection failed":
    - Ensure mongod is running
    - Check MONGODB_URI in .env
    - Verify network/firewall if using Atlas
  
  "Port already in use":
    - Use different port in config
    - Kill existing process on that port
    - Check for other running servers
*/

// DEPLOYMENT CHECKLIST
// ========================================

/*
  BEFORE DEPLOYING
  ================
  [ ] Update JWT_SECRET in production .env
  [ ] Use production MongoDB (Atlas or similar)
  [ ] Set NODE_ENV=production
  [ ] Run npm run build for frontend
  [ ] Test all features in production build
  [ ] Check all environment variables
  [ ] Remove console.log statements
  [ ] Update CORS allowed origins if needed
  [ ] Test on multiple browsers/devices
  
  
  FRONTEND DEPLOYMENT (Vercel/Netlify)
  ====================================
  1. npm run build
  2. Upload dist/ folder
  3. Set environment variables
  4. Deploy
  
  
  BACKEND DEPLOYMENT (Heroku/Railway)
  ===================================
  1. Set environment variables
  2. Deploy from GitHub
  3. Verify database connection
  4. Check health endpoint
  5. Monitor logs
*/

console.log('Career Bridge - Complete Project Guide');
