import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import StatCard from '../components/dashboard/StatCard';
import InterviewInterface from '../components/dashboard/InterviewInterface';
import { Video, Award, Target, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 flex flex-col">
        <Navbar />
        
        <div className="p-8 max-w-7xl mx-auto space-y-8 flex-1">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">Good evening, Yogesh! 👋</h1>
              <p className="text-white/40">Here's what's happening with your interview prep today.</p>
            </div>
            <Link to="/interview" className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
              <Video className="w-4 h-4" />
              Start Mock Interview
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Total Interviews" 
              value="12" 
              icon={Video} 
              trend={15} 
              color="cyan" 
            />
            <StatCard 
              label="Avg. Confidence" 
              value="84%" 
              icon={Award} 
              trend={5} 
              color="violet" 
            />
            <StatCard 
              label="Goals Met" 
              value="8/10" 
              icon={Target} 
              color="cyan" 
            />
            <StatCard 
              label="Practice Time" 
              value="14.5h" 
              icon={Clock} 
              trend={22} 
              color="violet" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Interview Area */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Video className="w-5 h-5 text-cyan-400" />
                  Active AI Session
                </h2>
                <button className="text-sm text-cyan-400 hover:underline">View Guidelines</button>
              </div>
              <InterviewInterface />
            </div>

            {/* Sidebar Content */}
            <div className="space-y-8">
              {/* Upcoming Interviews */}
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-violet-400" />
                  Upcoming
                </h2>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg">Technical</span>
                        <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                      </div>
                      <h4 className="font-bold text-white mb-1">Senior React Developer</h4>
                      <p className="text-xs text-white/40 mb-3">Google • May 15, 2026</p>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                           <div className="w-6 h-6 rounded-full border border-[#0a0a0a] bg-gray-800" />
                           <div className="w-6 h-6 rounded-full border border-[#0a0a0a] bg-gray-700" />
                        </div>
                        <span className="text-[10px] text-white/20">+2 interviewers</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Feedback */}
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Recent Feedback
                </h2>
                <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-500/10 to-transparent border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                       <Award className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">System Design Pro</p>
                      <p className="text-xs text-white/40">Last session score: 92/100</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed italic">
                    "Excellent articulation of microservices architecture. Focus slightly more on database sharding strategy next time."
                  </p>
                  <button className="w-full mt-4 py-2 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/5 transition-colors">
                    Download Full Report
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default Dashboard;

