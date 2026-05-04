import * as faceapi from 'face-api.js';
import path from 'path';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';

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
        const { transcript, behavioralLogs } = req.body;

        if (!transcript || !behavioralLogs) {
            console.log(">>> [DEBUG] Missing data");
            return res.status(400).json({ error: 'Missing session data' });
        }

        console.log(`>>> [DEBUG] Data size - Transcript: ${transcript.length}, Logs: ${behavioralLogs.length}`);

        // Safety slice
        const slicedTranscript = transcript.slice(-30);
        const slicedLogs = behavioralLogs.slice(-30);

        const prompt = `
            Evaluate this interview.
            TRANSCRIPT: ${slicedTranscript.map(t => t.text).join(' ')}
            BEHAVIOR: ${slicedLogs.map(l => l.expression).join(', ')}
            Output JSON only: { "score": 85, "summary": "...", "strengths": [], "weaknesses": [], "feedback": "..." }
        `;

        let analysis;
        try {
            console.log(">>> [DEBUG] Calling Groq...");
            const chatCompletion = await getGroq().chat.completions.create({
                messages: [
                    { role: 'system', content: 'You are an interviewer. Output JSON only.' },
                    { role: 'user', content: prompt }
                ],
                model: 'llama-3.1-8b-instant',
            });

            let rawContent = chatCompletion.choices[0]?.message?.content;
            console.log(">>> [DEBUG] Groq responded:", rawContent?.substring(0, 50) + "...");

            if (rawContent) {
                rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
                analysis = JSON.parse(rawContent);
            }
        } catch (groqErr) {
            console.error(">>> [DEBUG] Groq Call Failed:", groqErr.message);
            // Fallback Analysis if Groq fails
            analysis = {
                score: 70,
                summary: "AI Analysis currently unavailable, but your session data was captured.",
                strengths: ["Session completed successfully", "Video/Audio stream maintained"],
                weaknesses: ["AI feedback engine timeout"],
                feedback: "We were unable to reach our AI engine for a detailed report, but based on your activity, you maintained a steady pace. Error: " + groqErr.message
            };
        }

        res.json({
            success: true,
            analysis: analysis || { score: 0, summary: "Error generating analysis", strengths: [], weaknesses: [], feedback: "Try again." }
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
