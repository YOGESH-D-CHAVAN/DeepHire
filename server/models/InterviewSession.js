import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema({
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
    feedback: String
  }
}, { timestamps: true });

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

export default InterviewSession;
