import "dotenv/config";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import analysisRoutes from "./routes/analysisRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "*", // For now allow all, or you can specify your frontend URL here
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

// 404 Handler (must be after all routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
    availableRoutes: [
      "POST /api/resume/extract",
      "GET /api/analysis/...",
      "GET /api/interview/...",
    ],
  });
});

// Global Error Handler (must be after all routes and 404 handler)
app.use((err, req, res, next) => {
  console.error("[Server Error]", err);

  // Handle multer errors
  if (err.name === "MulterError") {
    if (err.code === "FILE_TOO_LARGE") {
      return res.status(413).json({
        success: false,
        error: "File too large. Maximum size is 10MB.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: "Only one file can be uploaded at a time.",
      });
    }
  }

  // Handle file filter errors
  if (err.message === "Only PDF files are allowed.") {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

// Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/deephire",
    );
    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Start Server
app.listen(PORT, async () => {
  await connectDB();
  console.log(
    `✨ Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});
