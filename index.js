import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import listingRouter from './routes/listing.route.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// ✅ Declare connection flag
let isConnected = false;

// ✅ Allow CORS for frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://mern-sttk.netlify.app'
];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// ✅ MongoDB connection middleware (for Vercel deployment)
app.use((req, res, next) => {
  if (!isConnected) {
    connectToMongoDB();
  }
  next();
});

// ✅ Routes
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);

// ✅ Health check route
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend + DB alive 🚀' });
});

// ✅ Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ MongoDB connection function
async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
  }
}

export default app;
