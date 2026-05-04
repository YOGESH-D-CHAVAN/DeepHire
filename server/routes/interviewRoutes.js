import express from 'express';
import { processInterviewMessage } from '../controllers/InterviewController.js';

const router = express.Router();

router.post('/message', processInterviewMessage);

export default router;
