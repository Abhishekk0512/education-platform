// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import connectDB from './config/db.js';

// // Import routes
// import authRoutes from './routes/auth.js';
// import courseRoutes from './routes/courses.js';
// import enrollmentRoutes from './routes/enrollments.js';
// import adminRoutes from './routes/admin.js';
// import uploadRoutes from './routes/upload.js';
// import discussionRoutes from './routes/discussions.js';

// dotenv.config();

// // Connect to database
// connectDB();

// const app = express();

// // CORS Configuration with Environment Variable
// const allowedOrigins = [
//   'http://localhost:5173',
//   'http://localhost:3000',
//   process.env.CLIENT_URL
// ].filter(Boolean); // Remove undefined values

// const corsOptions = {
//   origin: function (origin, callback) {
//     // Allow requests with no origin (mobile apps, Postman, etc.)
//     if (!origin) return callback(null, true);
    
//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   optionsSuccessStatus: 200,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// };

// app.use(cors(corsOptions));

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Basic route
// app.get('/', (req, res) => {
//   res.json({ 
//     message: 'Education Platform API',
//     status: 'Running',
//     allowedOrigins: allowedOrigins
//   });
// });

// // Health check route
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date() });
// });

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/courses', courseRoutes);
// app.use('/api/enrollments', enrollmentRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/upload', uploadRoutes);
// app.use('/api/discussions', discussionRoutes);

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ 
//     message: 'Something went wrong!',
//     error: process.env.NODE_ENV === 'development' ? err.message : undefined
//   });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
// });

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import enrollmentRoutes from './routes/enrollments.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import discussionRoutes from './routes/discussions.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS Configuration - MUST BE BEFORE OTHER MIDDLEWARE
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://edon-platform-phi-five.vercel.app' // Your frontend URL
];

// Add your actual Vercel deployment URL if different
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(null, true); // Still allow it but log it
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-JSON'],
  maxAge: 86400 // 24 hours
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parsing middleware - AFTER CORS
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Education Platform API',
    status: 'Running',
    allowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/discussions', discussionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});