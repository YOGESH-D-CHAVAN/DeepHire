import express from 'express';
import { detectExpression } from '../controllers/AnalysisController.js';

const router = express.Router();

router.post('/detect-expression', detectExpression);

export default router;
