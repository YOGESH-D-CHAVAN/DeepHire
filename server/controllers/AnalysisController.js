import * as faceapi from 'face-api.js';
import path from 'path';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';
import InterviewSession from '../models/InterviewSession.js';

// Lazy load canvas to prevent server crash if build fails
let canvas;
try {
    canvas = (await import('canvas')).default;
    const { Canvas, Image, ImageData } = canvas;
    faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
} catch (e) {
    console.warn('⚠️ [WARNING] canvas module not found or failed to load. Facial expression detection will be disabled.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy load Groq to ensure env vars are ready
let groq;
const getGroq = () => {
    if (!groq) {
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
    }
    return groq;
};

let modelsLoaded = false;

const loadModels = async () => {
    if (modelsLoaded || !canvas) return;
    const modelPath = path.join(__dirname, '../public/models');
    try {
        await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
        await faceapi.nets.faceExpressionNet.loadFromDisk(modelPath);
        modelsLoaded = true;
        console.log('✅ Face API models loaded successfully');
    } catch (error) {
        console.error('❌ Error loading Face API models:', error);
    }
};

if (canvas) {
    loadModels();
}

export const analyzeSession = async (req, res) => {
    console.log(">>> [DEBUG] analyzeSession started");
    try {
        const { userId, transcript, behavioralLogs, startTime, endTime, evaluations = [], sessionInsights = null } = req.body;

        if (!userId || !transcript || !behavioralLogs) {
            console.log(">>> [DEBUG] Missing data");
            return res.status(400).json({ error: 'Missing session data' });
        }

        console.log(`>>> [DEBUG] Data size - User: ${userId}, Transcript: ${transcript.length}, Logs: ${behavioralLogs.length}`);

        // Safety slice
        const slicedTranscript = transcript.slice(-100);
        const slicedLogs = behavioralLogs.slice(-50);
        const slicedEvaluations = evaluations.slice(-12);

        const prompt = `
            Evaluate this job interview session based on the transcript and behavioral data.
            
            TRANSCRIPT: 
            ${slicedTranscript.map(t => `[${t.timestamp}] ${t.text}`).join('\n')}

            BEHAVIORAL DATA (SAMPLED):
            ${slicedLogs.map(l => `- Expression: ${l.expression}, Eye Contact: ${l.eyeStatus}, Hands: ${l.handStatus}`).join('\n')}

            LIVE QUESTION-BY-QUESTION EVALUATIONS:
            ${slicedEvaluations.map((e, index) => `${index + 1}. Q: ${e.question}\nScore: ${e.score}/10\nSkills shown: ${(e.skillsDemonstrated || []).join(', ') || 'None'}\nMissing: ${(e.skillsMissing || []).join(', ') || 'None'}\nConceptual gaps: ${(e.conceptualGaps || []).join(', ') || 'None'}\nCommunication gaps: ${(e.communicationGaps || []).join(', ') || 'None'}\nFeedback: ${e.feedback}`).join('\n\n')}

            SESSION INSIGHTS:
            ${sessionInsights ? JSON.stringify(sessionInsights, null, 2) : 'No structured session insights provided.'}

            Your task:
            1. Analyze the candidate's technical responses (from transcript).
            2. Analyze non-verbal communication (from behavioral data).
            3. Provide a combined score (0-100).
            4. Identify 3 specific strengths and 3 specific areas for improvement.
            5. Provide a summary and a direct piece of feedback.
            6. Summarize behavioral metrics: Calculate approximate % of time for "Happy/Neutral" expressions, "Focused" eye contact, and "Hand movement" detected.
            7. Use repeated patterns across the full session, not just the last answer.

            Output ONLY a JSON object with this exact structure:
            {
              "score": number,
              "summary": "string",
              "strengths": ["string", "string", "string"],
              "weaknesses": ["string", "string", "string"],
              "feedback": "string",
              "behavioralAnalysis": {
                "sentiment": "string (e.g. Confident, Nervous, Positive)",
                "eyeContactScore": number (0-100),
                "engagementLevel": "string",
                "facialExpressionSummary": "string",
                "bodyLanguageNotes": "string"
              }
            }
        `;

        let analysis;
        try {
            console.log(">>> [DEBUG] Calling Groq...");
            const chatCompletion = await getGroq().chat.completions.create({
                messages: [
                    { role: 'system', content: 'You are an expert technical recruiter and behavioral psychologist. Output JSON only.' },
                    { role: 'user', content: prompt }
                ],
                model: 'llama-3.3-70b-versatile', // Using the better model for analysis
            });

            let rawContent = chatCompletion.choices[0]?.message?.content;
            console.log(">>> [DEBUG] Groq responded:", rawContent?.substring(0, 50) + "...");

            if (rawContent) {
                rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
                analysis = JSON.parse(rawContent);
            }
        } catch (groqErr) {
            console.error(">>> [DEBUG] Groq Call Failed:", groqErr.message);
            analysis = {
                score: 70,
                summary: "AI Analysis currently unavailable, but your session data was captured.",
                strengths: ["Session completed successfully", "Video/Audio stream maintained"],
                weaknesses: ["AI feedback engine timeout"],
                feedback: "We were unable to reach our AI engine for a detailed report. Error: " + groqErr.message
            };
        }

        // Save to Database
        const newSession = new InterviewSession({
            userId,
            startTime: startTime || new Date(Date.now() - 300000), // Default 5 mins ago if missing
            endTime: endTime || new Date(),
            transcript,
            behavioralLogs,
            analysis: analysis || { score: 0, summary: "Error generating analysis", strengths: [], weaknesses: [], feedback: "Try again." }
        });

        await newSession.save();
        console.log(">>> [DEBUG] Session saved to DB:", newSession._id);

        res.json({
            success: true,
            analysis: newSession.analysis,
            sessionId: newSession._id
        });

    } catch (error) {
        console.error('>>> [DEBUG] CRITICAL ERROR:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

export const detectExpression = async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ error: 'No image provided' });

        if (!canvas) {
            return res.status(503).json({ success: false, error: 'Facial detection module unavailable on server.' });
        }

        if (!modelsLoaded) await loadModels();

        const img = await canvas.loadImage(image);
        const detections = await faceapi.detectAllFaces(
            img, 
            new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 })
        ).withFaceExpressions();

        if (detections.length === 0) {
            return res.json({ success: true, message: 'No face detected', expressions: null });
        }

        const expressions = detections[0].expressions;
        const dominantExpression = Object.entries(expressions)
            .reduce((prev, current) => (prev[1] > current[1]) ? prev : current)[0];

        console.log('--- Facial Expression Analysis ---');
        console.log('Dominant:', dominantExpression.toUpperCase());
        console.log('-----------------------------------');

        res.json({
            success: true,
            dominantExpression,
            allExpressions: expressions,
            detectionCount: detections.length
        });
    } catch (error) {
        console.error('Face Detection Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
