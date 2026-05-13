import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import InterviewSetup from '../components/dashboard/InterviewSetup';
import { Video, Award, Target, Clock, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import API_BASE_URL from '../config/api';

const Dashboard = () => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    avgConfidence: 0,
    goalsMet: '0/0',
    practiceTime: '0h'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/interview/stats/${user.id}`);
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Fetch Stats Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [user?.id]);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8 pt-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 font-black">
              Good evening, {user?.firstName || 'User'}! 👋
            </h1>
            <p className="text-white/40 text-sm md:text-base">Here's what's happening with your interview prep today.</p>
          </div>
          <Link to="/interview" className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <Video className="w-4 h-4" />
            Start Mock Interview
          </Link>
        </div>

        {isLoading ? (
          <div className="h-[50vh] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCard 
                label="Total Interviews" 
                value={stats.totalInterviews.toString()} 
                icon={Video} 
                trend={15} 
                color="cyan" 
              />
              <StatCard 
                label="Avg. Confidence" 
                value={`${stats.avgConfidence}%`} 
                icon={Award} 
                trend={5} 
                color="violet" 
              />
              <StatCard 
                label="Goals Met" 
                value={stats.goalsMet} 
                icon={Target} 
                color="cyan" 
              />
              <StatCard 
                label="Practice Time" 
                value={stats.practiceTime} 
                icon={Clock} 
                trend={22} 
                color="violet" 
              />
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Video className="w-4 h-4 text-cyan-400" />
                  Active AI Session
                </h2>
                <button className="text-sm text-cyan-400 hover:underline">View Guidelines</button>
              </div>
              <div>
                <InterviewSetup />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
