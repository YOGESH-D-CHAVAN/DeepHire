import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Video, 
  History, 
  Users, 
  Settings, 
  HelpCircle,
  Zap,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useUser } from '@clerk/clerk-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: History, label: 'Interviews', path: '/history' },
];

const secondaryItems = [
  { icon: Settings, label: 'Settings', path: '/account' },
  { icon: HelpCircle, label: 'Help Center', path: '/help' },
];

const Sidebar = () => {
  const { user } = useUser();
  const location = useLocation();
  const [recentInterviews, setRecentInterviews] = React.useState([]);

  React.useEffect(() => {
    const fetchRecent = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`http://localhost:4000/api/interview/history/${user.id}`);
        const data = await response.json();
        if (data.success) {
          setRecentInterviews(data.sessions.slice(0, 3));
        }
      } catch (err) {
        console.error("Sidebar History Error:", err);
      }
    };
    fetchRecent();
  }, [user?.id]);

  return (
    <aside className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
        <Link to="/dashboard" className="flex items-center gap-2 mb-8 group">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12">
            <Zap className="w-5 h-5 text-[#0a0a0a] fill-current" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            DeepHire
          </span>
        </Link>

        <nav className="space-y-1 mb-8">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-cyan-500/10 text-cyan-400" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-cyan-400" : "text-white/40"
                )} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Recent Interviews Section */}
        {recentInterviews.length > 0 && (
          <div className="space-y-3">
            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Recent Sessions</h3>
            <div className="space-y-1">
              {recentInterviews.map((session) => (
                <Link 
                  key={session._id}
                  to="/history"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-all group"
                >
                  <div className="w-2 h-2 rounded-full bg-cyan-500/40 group-hover:bg-cyan-400 transition-colors" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[11px] font-bold text-white/60 truncate group-hover:text-white transition-colors">
                      {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[9px] text-white/20 truncate">Score: {session.analysis?.score || 0}%</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto p-6 space-y-2">
        {secondaryItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-cyan-500/10 text-cyan-400" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-cyan-400" : "text-white/40"
              )} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-white/5 mb-4">
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">Upgrade Plan</p>
          <p className="text-[11px] text-white/40 mb-3 leading-tight">Get unlimited AI interviews & reports.</p>
          <Link 
            to="/pro"
            className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-[#0a0a0a] rounded-lg text-xs font-bold transition-colors block text-center"
          >
            Go Pro
          </Link>
        </div>

        <Link 
          to="/account"
          className={cn(
            "flex items-center gap-3 p-3 rounded-2xl transition-all border border-transparent hover:border-white/10 group",
            location.pathname === '/account' ? "bg-white/5 border-white/10" : "hover:bg-white/5"
          )}
        >
          <img 
            src={user?.imageUrl} 
            alt="Profile" 
            className="w-9 h-9 rounded-xl border border-white/10"
          />
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.firstName || 'User'}</p>
            <p className="text-[10px] text-white/40 truncate">Manage Account</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-cyan-400 transition-all" />
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
