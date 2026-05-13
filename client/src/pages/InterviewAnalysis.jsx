import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, Target, ZapOff, CheckCircle2, 
  ChevronLeft, BarChart3, PieChart as PieChartIcon, 
  User, MessageSquare,
  Smile, Eye, Hand, Type
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../components/layout/DashboardLayout';
import API_BASE_URL from '../config/api';
import { useUser } from '@clerk/clerk-react';

const InterviewAnalysis = () => {
  const { sessionId } = useParams();
  const { user } = useUser();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/interview/history/${user.id}`);
        const result = await response.json();
        const session = result.history?.find(s => s._id === sessionId);
        if (session) setData(session);
      } catch (err) {
        console.error("Error fetching session:", err);
      }
    };

    fetchSessionData();
  }, [sessionId, user]);

  const analysis = window.history.state?.usr?.analysis || data?.analysis;

  if (!analysis) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 md:w-16 md:h-16 text-white/10 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl md:text-2xl font-bold mb-4">Loading Analysis Report...</h2>
            <Link to="/dashboard" className="text-cyan-400 hover:underline">Return to Dashboard</Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const chartData = [
    { name: 'Score', value: analysis.score },
    { name: 'Remaining', value: 100 - analysis.score },
  ];

  const COLORS = ['#06b6d4', 'rgba(255, 255, 255, 0.05)'];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full space-y-6 md:space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link to="/history" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs md:text-sm">
            <ChevronLeft className="w-4 h-4" /> Back to History
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter">
              Performance <span className="text-cyan-500">Report</span>
            </h1>
            <p className="text-[10px] md:text-sm text-white/40 font-medium font-mono uppercase tracking-wider">Session ID: {sessionId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column: Visual Metrics */}
          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            {/* Score Chart */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6 md:mb-8 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-cyan-400" /> Overall Proficiency
              </h3>
              <div className="w-full h-48 md:h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl md:text-6xl font-black font-mono text-white leading-none">{analysis.score}</span>
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-cyan-500 mt-2 md:mt-3">DeepHire Score</span>
                </div>
              </div>
              <div className="mt-6 md:mt-8 text-center">
                <p className="text-xs md:text-sm text-white/60 font-medium">Excellent work! You've ranked in the <span className="text-white font-bold text-cyan-400">top 15%</span> of candidates for this role.</p>
              </div>
            </div>

            {/* Behavioral Insights Card */}
            {analysis.behavioralAnalysis && (
              <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 flex items-center gap-2">
                  <User className="w-4 h-4 text-violet-400" /> Behavioral Insights
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 md:p-5 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-3 h-3 text-cyan-400" />
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/40">Eye Contact</span>
                    </div>
                    <span className="text-lg md:text-xl font-mono font-black">{analysis.behavioralAnalysis.eyeContactScore}%</span>
                  </div>
                  <div className="p-4 md:p-5 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Smile className="w-3 h-3 text-violet-400" />
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/40">Sentiment</span>
                    </div>
                    <span className="text-base md:text-lg font-bold truncate block">{analysis.behavioralAnalysis.sentiment}</span>
                  </div>
                </div>
                <div className="p-4 md:p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
                   <div className="flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                      <p className="text-[11px] md:text-xs text-white/70 leading-relaxed italic font-medium">"{analysis.behavioralAnalysis.facialExpressionSummary}"</p>
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Detailed Breakdown */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Summary Card */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 md:p-3 bg-cyan-500/20 rounded-xl md:rounded-2xl">
                   <Target className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest text-white/80">Executive Summary</h3>
              </div>
              <p className="text-base md:text-lg text-white/60 leading-relaxed font-medium mb-6 md:mb-8">
                {analysis.summary}
              </p>
              <div className="p-6 md:p-8 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/10 relative group">
                <div className="absolute top-4 right-6 md:top-6 md:right-8 text-[8px] font-black uppercase tracking-widest text-cyan-500/40">Direct AI Feedback</div>
                <p className="text-white font-medium italic leading-relaxed text-base md:text-lg">"{analysis.feedback}"</p>
              </div>
            </div>

              {/* Dedicated Detailed Behavioral Section */}
              {analysis.behavioralAnalysis?.detailedMetrics && (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 space-y-8 md:space-y-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 md:p-3 bg-violet-500/20 rounded-xl md:rounded-2xl">
                        <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-violet-400" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest text-white/80">Advanced Metrics</h3>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/20 sm:text-right">AI Visual Analytics</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {/* Eye Analysis */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <Eye className="w-4 h-4 text-cyan-400" />
                         <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white/40">Eye Analysis</span>
                      </div>
                      <div className="p-5 md:p-6 rounded-2xl md:rounded-[2rem] bg-white/5 border border-white/5 h-full hover:border-cyan-500/20 transition-all">
                         <div className="flex items-center justify-between mb-4">
                            <span className="text-base md:text-lg font-bold text-white">{analysis.behavioralAnalysis.detailedMetrics.eyeTracking.status}</span>
                            <span className="text-[9px] md:text-[10px] font-mono text-cyan-500">{analysis.behavioralAnalysis.eyeContactScore}%</span>
                         </div>
                         <p className="text-[11px] md:text-xs text-white/50 leading-relaxed font-medium">
                            {analysis.behavioralAnalysis.detailedMetrics.eyeTracking.observation}
                         </p>
                      </div>
                    </div>

                    {/* Hand Analysis */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <Hand className="w-4 h-4 text-orange-400" />
                         <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white/40">Gestures</span>
                      </div>
                      <div className="p-5 md:p-6 rounded-2xl md:rounded-[2rem] bg-white/5 border border-white/5 h-full hover:border-orange-500/20 transition-all">
                         <div className="flex items-center justify-between mb-4">
                            <span className="text-base md:text-lg font-bold text-white">{analysis.behavioralAnalysis.detailedMetrics.handMovements.status}</span>
                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                         </div>
                         <p className="text-[11px] md:text-xs text-white/50 leading-relaxed font-medium">
                            {analysis.behavioralAnalysis.detailedMetrics.handMovements.observation}
                         </p>
                      </div>
                    </div>

                    {/* Facial Analysis */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <Smile className="w-4 h-4 text-violet-400" />
                         <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white/40">Expressions</span>
                      </div>
                      <div className="p-5 md:p-6 rounded-2xl md:rounded-[2rem] bg-white/5 border border-white/5 h-full hover:border-violet-500/20 transition-all">
                         <div className="flex items-center justify-between mb-4">
                            <span className="text-base md:text-lg font-bold text-white">{analysis.behavioralAnalysis.detailedMetrics.facialAnalysis.dominant}</span>
                            <span className="px-2 py-0.5 bg-violet-500/20 rounded text-[8px] font-bold text-violet-400">Dominant</span>
                         </div>
                         <p className="text-[11px] md:text-xs text-white/50 leading-relaxed font-medium">
                            {analysis.behavioralAnalysis.detailedMetrics.facialAnalysis.observation}
                         </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Strengths & Weaknesses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                  <h3 className="font-black uppercase tracking-widest text-[10px] md:text-xs text-white/40">Core Strengths</h3>
                </div>
                <ul className="space-y-5 md:space-y-6">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-4 text-xs md:text-sm text-white/80 font-bold group">
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-green-500/20 transition-all">
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      </div>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <ZapOff className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
                  <h3 className="font-black uppercase tracking-widest text-[10px] md:text-xs text-white/40">Areas of Growth</h3>
                </div>
                <ul className="space-y-5 md:space-y-6">
                  {analysis.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-4 text-xs md:text-sm text-white/80 font-bold group">
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-red-500/20 transition-all">
                         <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      </div>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewAnalysis;
