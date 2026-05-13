import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import helmet from "helmet";
import compression from "compression";
import { rateLimit } from "express-rate-limit";
import analysisRoutes from "./routes/analysisRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Performance Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Disabled for development, fine-tune for production
}));
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests from this IP, please try again after 15 minutes",
    isRateLimit: true
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to AI routes specifically to prevent cost spikes
app.use("/api/interview/message", limiter);
app.use("/api/analysis/analyze-session", limiter);

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://tenais-deephire.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/analysis", analysisRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/resume", resumeRoutes);

// Basic Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "DeepHire API Server is running smoothly!",
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Server Error]", err);

  if (err.name === "MulterError") {
    if (err.code === "FILE_TOO_LARGE") {
      return res.status(413).json({ success: false, error: "File too large. Maximum size is 10MB." });
    }
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

// Database Connection & Server Start
const startServer = async () => {
  try {
    // 1. Connect to Database First
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/deephire",
    );
    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);

    // 2. Start Listening
    app.listen(PORT, () => {
      console.log(`✨ Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`❌ Initialization Error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
