import React from 'react';
import { 
  LayoutDashboard, 
  Video, 
  History, 
  Users, 
  Settings, 
  HelpCircle,
  Zap
} from 'lucide-react';
import { cn } from '../../utils/cn';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Video, label: 'Interviews' },
  { icon: Users, label: 'Candidates' },
  { icon: History, label: 'History' },
];

const secondaryItems = [
  { icon: Settings, label: 'Settings' },
  { icon: HelpCircle, label: 'Help Center' },
];

const Sidebar = () => {
  return (
    <aside className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#0a0a0a] fill-current" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            DeepHire
          </span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                item.active 
                  ? "bg-cyan-500/10 text-cyan-400" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                item.active ? "text-cyan-400" : "text-white/40"
              )} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-1">
        {secondaryItems.map((item, index) => (
          <button
            key={index}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-white/5">
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">Upgrade Plan</p>
          <p className="text-sm text-white/60 mb-4">Get unlimited AI interviews & reports.</p>
          <button className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-[#0a0a0a] rounded-lg text-sm font-bold transition-colors">
            Go Pro
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
