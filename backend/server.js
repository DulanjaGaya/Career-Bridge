require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const studentRoutes = require('./routes/studentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const faqRoutes = require('./routes/faqRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const questionRoutes = require('./routes/questionRoutes');
const User = require('./models/User');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/questions', questionRoutes);

(async () => {
  const [lobbyRoutesModule, resourceRoutesModule, answerRoutesModule, progressRoutesModule] = await Promise.all([
    import('./routes/lobbyRoutes.js'),
    import('./routes/resourceRoutes.js'),
    import('./routes/answerRoutes.js'),
    import('./routes/progressRoutes.js'),
  ]);

  app.use('/api/lobbies', lobbyRoutesModule.default);
  app.use('/api/resources', resourceRoutesModule.default);
  app.use('/api/answers', answerRoutesModule.default);
  app.use('/api/progress', progressRoutesModule.default);

  app.get('/health', (req, res) => {
    res.json({ message: 'Career Bridge API is running' });
  });

  app.get('/api/readiness/users/me', async (req, res) => {
    try {
      const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';

      if (!email) {
        return res.status(400).json({ message: 'email query required' });
      }

      const user = await User.findOne({ email }).select('name email createdAt');
      if (!user) {
        return res.status(404).json({ message: 'Not found' });
      }

      return res.json({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('Failed to resolve readiness user lookup:', error);
      return res.status(500).json({ message: 'Failed to resolve user' });
    }
  });

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.use((err, req, res, next) => {
    console.error(err);
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err.statusCode || 500);
    res.status(statusCode).json({
      message: err.message || 'Internal server error',
    });
  });

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Career Bridge Backend running on port ${PORT}`);
    console.log(`Make sure MongoDB is running on ${process.env.MONGODB_URI || 'mongodb://localhost:27017/career-bridge'}`);
  });
})().catch((error) => {
  console.error('Failed to start Career Bridge backend:', error);
  process.exit(1);
});