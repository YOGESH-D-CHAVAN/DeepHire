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

  return (
    <aside className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center gap-2 mb-8 group">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12">
            <Zap className="w-5 h-5 text-[#0a0a0a] fill-current" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            DeepHire
          </span>
        </Link>

        <nav className="space-y-1">
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
