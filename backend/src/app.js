const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const hrRoutes = require('./routes/hrRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const debugRoutes = require('./routes/debugRoutes');
const { errorHandler } = require('./middlewares/errorHandler');

require('dotenv').config();

const app = express();

// CORS configuration - allow frontend domain
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://hirefloww.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// connect mongodb and seed default admin if missing
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hr-onboarding', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('MongoDB connected');
  // seed admin
  try {
    const User = require('./models/User');
    const bcrypt = require('bcrypt');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';
    const existing = await User.findOne({ email: adminEmail, role: 'admin' });
    if (!existing) {
      const hashed = await bcrypt.hash(adminPassword, 10);
      await User.create({ name: 'Super Admin', email: adminEmail, phone: '', password: hashed, role: 'admin' });
      console.log(`Seeded admin: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log(`Admin already exists: ${adminEmail}`);
    }
  } catch (err) {
    console.error('Error seeding admin:', err.message || err);
  }
}).catch(err => console.error(err));

app.use('/api/auth', authRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
// Aadhaar routes removed - Aadhaar OTP mock has been removed from the codebase
app.use('/api/user', userRoutes);
// Debug endpoints (local/dev only)
app.use('/api/debug', debugRoutes);

app.get('/', (req, res) => res.json({ message: 'HR Onboarding API' }));

app.use(errorHandler);

module.exports = app;
