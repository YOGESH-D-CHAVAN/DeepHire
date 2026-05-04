import InterviewSession from '../models/InterviewSession.js';

export const getInterviewHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const sessions = await InterviewSession.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, sessions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const { userId } = req.params;
        const sessions = await InterviewSession.find({ userId });
        
        if (sessions.length === 0) {
            return res.json({
                success: true,
                stats: {
                    totalInterviews: 0,
                    avgConfidence: 0,
                    goalsMet: '0/0',
                    practiceTime: '0h'
                }
            });
        }

        const totalInterviews = sessions.length;
        const avgScore = sessions.reduce((acc, s) => acc + (s.analysis?.score || 0), 0) / totalInterviews;
        
        const totalDurationMs = sessions.reduce((acc, s) => {
            if (s.startTime && s.endTime) {
                return acc + (new Date(s.endTime) - new Date(s.startTime));
            }
            return acc;
        }, 0);
        
        const practiceTimeHours = (totalDurationMs / (1000 * 60 * 60)).toFixed(1);

        res.json({
            success: true,
            stats: {
                totalInterviews,
                avgConfidence: Math.round(avgScore),
                goalsMet: `${sessions.filter(s => (s.analysis?.score || 0) >= 80).length}/${totalInterviews}`,
                practiceTime: `${practiceTimeHours}h`
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
