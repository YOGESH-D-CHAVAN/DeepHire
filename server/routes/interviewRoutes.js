import express from 'express';
import { getInterviewHistory, getDashboardStats } from '../controllers/InterviewController.js';
import {processInterviewMessage} from '../controllers/InterviewController.js';

const router = express.Router();

router.get('/history/:userId', getInterviewHistory);
router.get('/stats/:userId', getDashboardStats);




router.post('/message', processInterviewMessage);

export default router;
