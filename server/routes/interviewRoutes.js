import express from 'express';
import { getInterviewHistory, getDashboardStats } from '../controllers/InterviewController.js';

const router = express.Router();

router.get('/history/:userId', getInterviewHistory);
router.get('/stats/:userId', getDashboardStats);

export default router;
