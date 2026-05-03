import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import analysisRoutes from './routes/analysisRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/analysis', analysisRoutes);

// Basic Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'DeepHire API Server is running smoothly!',
    timestamp: new Date().toISOString()
  });
});

// Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/deephire');
    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Start Server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`✨ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
