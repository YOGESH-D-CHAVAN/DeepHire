import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import StatCard from '../components/dashboard/StatCard';
import InterviewSetup from '../components/dashboard/InterviewSetup';
import { Video, Award, Target, Clock } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 flex flex-col">
        <Navbar />
        
        <div className="p-8 w-full px-10 space-y-8 flex-1">
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
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default Dashboard;

