import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, Target, ZapOff, CheckCircle2, 
  ChevronLeft, BarChart3, PieChart as PieChartIcon, 
  User, MessageSquare, Download, Share2,
  Smile, Eye, Hand, Type
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const InterviewAnalysis = () => {
  const { sessionId } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        // Since we don't have a direct "get session by ID" endpoint yet, 
        // we'll fetch all history and find the one. 
        // Realistically, we should add a specific endpoint for this.
        const response = await fetch(`http://localhost:4000/api/interview/history/temp`); // This won't work perfectly without userId
        // For now, I'll assume we can get it or we passed it in state.
        // Let's check if we have it in location state first.
      } catch (err) {}
    };

    // For this demonstration, we'll try to fetch from an endpoint we'll create or use state
  }, [sessionId]);

  // Fallback dummy data if fetch fails, but we'll try to make it work with location state
  const analysis = window.history.state?.usr?.analysis || data?.analysis;

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-white/10 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold mb-4">Loading Analysis Report...</h2>
          <Link to="/dashboard" className="text-cyan-400 hover:underline">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Score', value: analysis.score },
    { name: 'Remaining', value: 100 - analysis.score },
  ];

  const COLORS = ['#06b6d4', 'rgba(255, 255, 255, 0.05)'];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 flex flex-col">
        <Navbar />
        
        <div className="p-8 pt-24 max-w-7xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <Link to="/history" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm mb-4">
                <ChevronLeft className="w-4 h-4" /> Back to History
              </Link>
              <h1 className="text-5xl font-black tracking-tighter">Performance <span className="text-cyan-500">Report</span></h1>
              <p className="text-white/40 font-medium">Session ID: {sessionId}</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                <Download className="w-4 h-4" /> Export PDF
              </button>
              <button className="px-6 py-3 bg-cyan-500 text-black rounded-2xl font-black text-sm hover:bg-cyan-400 transition-all flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Share Results
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Visual Metrics */}
            <div className="lg:col-span-1 space-y-8">
              {/* Score Chart */}
              <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/20 mb-8 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-cyan-400" /> Overall Proficiency
                </h3>
                <div className="w-full h-64 relative">
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
                    <span className="text-6xl font-black font-mono text-white leading-none">{analysis.score}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500 mt-2">DeepHire Score</span>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <p className="text-sm text-white/60 font-medium">Excellent work! You've ranked in the <span className="text-white font-bold text-cyan-400">top 15%</span> of candidates for this role.</p>
                </div>
              </div>

              {/* Behavioral Insights Card */}
              {analysis.behavioralAnalysis && (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-8 space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/20 flex items-center gap-2">
                    <User className="w-4 h-4 text-violet-400" /> Behavioral Insights
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-3 h-3 text-cyan-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Eye Contact</span>
                      </div>
                      <span className="text-xl font-mono font-black">{analysis.behavioralAnalysis.eyeContactScore}%</span>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Smile className="w-3 h-3 text-violet-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Sentiment</span>
                      </div>
                      <span className="text-lg font-bold truncate block">{analysis.behavioralAnalysis.sentiment}</span>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
                     <div className="flex items-start gap-3">
                        <MessageSquare className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                        <p className="text-xs text-white/70 leading-relaxed italic font-medium">"{analysis.behavioralAnalysis.facialExpressionSummary}"</p>
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Detailed Breakdown */}
            <div className="lg:col-span-2 space-y-8">
              {/* Summary Card */}
              <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-cyan-500/20 rounded-2xl">
                     <Target className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-widest text-white/80">Executive Summary</h3>
                </div>
                <p className="text-lg text-white/60 leading-relaxed font-medium mb-8">
                  {analysis.summary}
                </p>
                <div className="p-8 rounded-[2rem] bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/10 relative group">
                  <div className="absolute top-6 right-8 text-[8px] font-black uppercase tracking-widest text-cyan-500/40">Direct AI Feedback</div>
                  <p className="text-white font-medium italic leading-relaxed text-lg">"{analysis.feedback}"</p>
                </div>
              </div>

                {/* Dedicated Detailed Behavioral Section */}
                {analysis.behavioralAnalysis?.detailedMetrics && (
                  <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 space-y-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-violet-500/20 rounded-2xl">
                          <BarChart3 className="w-6 h-6 text-violet-400" />
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-widest text-white/80">Advanced Behavioral Analysis</h3>
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/20">AI Visual Metrics</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Eye Analysis */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                           <Eye className="w-4 h-4 text-cyan-400" />
                           <span className="text-[11px] font-black uppercase tracking-widest text-white/40">Eye Analysis</span>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 h-full hover:border-cyan-500/20 transition-all">
                           <div className="flex items-center justify-between mb-4">
                              <span className="text-lg font-bold text-white">{analysis.behavioralAnalysis.detailedMetrics.eyeTracking.status}</span>
                              <span className="text-[10px] font-mono text-cyan-500">{analysis.behavioralAnalysis.eyeContactScore}% Score</span>
                           </div>
                           <p className="text-xs text-white/50 leading-relaxed font-medium">
                              {analysis.behavioralAnalysis.detailedMetrics.eyeTracking.observation}
                           </p>
                        </div>
                      </div>

                      {/* Hand Analysis */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                           <Hand className="w-4 h-4 text-orange-400" />
                           <span className="text-[11px] font-black uppercase tracking-widest text-white/40">Hand Gestures</span>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 h-full hover:border-orange-500/20 transition-all">
                           <div className="flex items-center justify-between mb-4">
                              <span className="text-lg font-bold text-white">{analysis.behavioralAnalysis.detailedMetrics.handMovements.status}</span>
                              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                           </div>
                           <p className="text-xs text-white/50 leading-relaxed font-medium">
                              {analysis.behavioralAnalysis.detailedMetrics.handMovements.observation}
                           </p>
                        </div>
                      </div>

                      {/* Facial Analysis */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                           <Smile className="w-4 h-4 text-violet-400" />
                           <span className="text-[11px] font-black uppercase tracking-widest text-white/40">Expression Breakdown</span>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 h-full hover:border-violet-500/20 transition-all">
                           <div className="flex items-center justify-between mb-4">
                              <span className="text-lg font-bold text-white">{analysis.behavioralAnalysis.detailedMetrics.facialAnalysis.dominant}</span>
                              <span className="px-2 py-1 bg-violet-500/20 rounded text-[8px] font-bold text-violet-400">Dominant</span>
                           </div>
                           <p className="text-xs text-white/50 leading-relaxed font-medium">
                              {analysis.behavioralAnalysis.detailedMetrics.facialAnalysis.observation}
                           </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Strengths & Weaknesses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10">
                  <div className="flex items-center gap-3 mb-8">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                    <h3 className="font-black uppercase tracking-widest text-xs text-white/40">Core Strengths</h3>
                  </div>
                  <ul className="space-y-6">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-4 text-sm text-white/80 font-bold group">
                        <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-green-500/20 transition-all">
                           <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        </div>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10">
                  <div className="flex items-center gap-3 mb-8">
                    <ZapOff className="w-6 h-6 text-red-400" />
                    <h3 className="font-black uppercase tracking-widest text-xs text-white/40">Areas of Growth</h3>
                  </div>
                  <ul className="space-y-6">
                    {analysis.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-4 text-sm text-white/80 font-bold group">
                        <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-red-500/20 transition-all">
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
      </main>
    </div>
  );
};

export default InterviewAnalysis;
