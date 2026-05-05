import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { History, Calendar, Award, ArrowRight, Loader2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const InterviewsHistory = () => {
  const { user } = useUser();
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`http://localhost:4000/api/interview/history/${user.id}`);
        const data = await response.json();
        if (data.success) {
          setInterviews(data.sessions);
        }
      } catch (err) {
        console.error("Fetch History Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [user?.id]);

  const filteredInterviews = interviews.filter(interview => 
    interview.analysis?.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(interview.createdAt).toLocaleDateString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 flex flex-col">
        <Navbar />
        
        <div className="flex-1 p-8 pt-24 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                <History className="w-8 h-8 text-cyan-400" />
                Interview History
              </h1>
              <p className="text-white/40">Review your past performance and track your growth.</p>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search interviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-6 py-3 bg-white/5 border border-white/10 rounded-2xl w-full md:w-64 focus:border-cyan-500/50 focus:ring-0 outline-none transition-all"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="h-[60vh] flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
            </div>
          ) : filteredInterviews.length > 0 ? (
            <div className="grid gap-4">
              {filteredInterviews.map((interview, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={interview._id}
                  className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">
                          {new Date(interview.createdAt).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h3>
                        <p className="text-white/40 text-sm line-clamp-1 max-w-xl">
                          {interview.analysis?.summary || 'No summary available'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Score</p>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-400" />
                          <span className="text-2xl font-black text-white">{interview.analysis?.score || 0}%</span>
                        </div>
                      </div>
                      
                      <Link 
                        to={`/interview`} // For now linking back to interview, or could create a detail page
                        className="p-4 rounded-2xl bg-white text-black hover:bg-cyan-400 transition-colors"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-white/5 border border-white/10 rounded-[40px] border-dashed">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                <History className="w-10 h-10 text-white/20" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No Interviews Found</h2>
              <p className="text-white/40 max-w-md mb-8">
                You haven't completed any AI interviews yet. Start your first session to see your history and analysis.
              </p>
              <Link to="/interview" className="px-8 py-4 bg-cyan-500 text-[#0a0a0a] font-bold rounded-2xl hover:bg-cyan-400 transition-colors">
                Start First Interview
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InterviewsHistory;
