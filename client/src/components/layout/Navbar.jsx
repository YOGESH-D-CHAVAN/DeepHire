import React from 'react';
import { Search, Bell, User, Settings, LogOut } from 'lucide-react';
import { cn } from '../../utils/cn';

const Navbar = () => {
  return (
    <nav className="h-16 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Search interviews, candidates..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-white/20"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-white/5 relative text-white/60 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full border-2 border-[#0a0a0a]" />
        </button>
        
        <div className="h-8 w-[1px] bg-white/10 mx-2" />

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">Yogesh Chavan</p>
            <p className="text-xs text-white/40">Premium Account</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 p-[2px] cursor-pointer hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
               <User className="w-5 h-5 text-white/80" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
