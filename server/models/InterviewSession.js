import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  transcript: [{
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  behavioralLogs: [{
    expression: String,
    eyeStatus: String,
    handStatus: String,
    timestamp: { type: Date, default: Date.now }
  }],
  analysis: {
    score: Number,
    summary: String,
    strengths: [String],
    weaknesses: [String],
    feedback: String,
    behavioralAnalysis: {
      sentiment: String,
      eyeContactScore: Number,
      engagementLevel: String,
      facialExpressionSummary: String,
      bodyLanguageNotes: String
    }
  }
}, { timestamps: true });

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

export default InterviewSession;
