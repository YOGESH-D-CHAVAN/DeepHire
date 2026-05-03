import * as faceapi from 'face-api.js';
import canvas from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let modelsLoaded = false;

const loadModels = async () => {
    if (modelsLoaded) return;
    
    const modelPath = path.join(__dirname, '../public/models');
    
    try {
        await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
        await faceapi.nets.faceExpressionNet.loadFromDisk(modelPath);
        modelsLoaded = true;
        console.log('Face API models loaded successfully');
    } catch (error) {
        console.error('Error loading Face API models:', error);
    }
};

// Initialize models
loadModels();

export const detectExpression = async (req, res) => {
    try {
        const { image } = req.body; // Expecting base64 image string

        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Ensure models are loaded
        if (!modelsLoaded) {
            await loadModels();
        }

        // Convert base64 to Image
        const img = await canvas.loadImage(image);
        
        // Detect expressions with optimized settings for speed
        const detections = await faceapi.detectAllFaces(
            img, 
            new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 })
        ).withFaceExpressions();

        if (detections.length === 0) {
            return res.json({ 
                success: true, 
                message: 'No face detected',
                expressions: null 
            });
        }

        // Get the expressions of the first face
        const expressions = detections[0].expressions;
        
        // Sort expressions to find the most dominant one
        const dominantExpression = Object.entries(expressions)
            .reduce((prev, current) => (prev[1] > current[1]) ? prev : current)[0];

        // Log all expressions for monitoring
        console.log('--- Facial Expression Analysis ---');
        console.log('Dominant:', dominantExpression.toUpperCase());
        console.log('Details:', JSON.stringify(expressions, null, 2));
        console.log('-----------------------------------');

        res.json({
            success: true,
            dominantExpression,
            allExpressions: expressions,
            detectionCount: detections.length
        });

    } catch (error) {
        console.error('Face Detection Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error during face detection' 
        });
    }
};
