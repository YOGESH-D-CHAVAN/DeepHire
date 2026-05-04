import express from 'express';
import { detectExpression, analyzeSession } from '../controllers/AnalysisController.js';

const router = express.Router();

router.post('/detect-expression', detectExpression);
router.post('/analyze-session', analyzeSession);

export default router;
