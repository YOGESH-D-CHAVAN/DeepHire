import React from 'react';
import { Bell, User, Settings, LogOut } from 'lucide-react';
import { cn } from '../../utils/cn';

const Navbar = () => {
  return (
    <nav className="h-16 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
      {/* Branding */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-xl">D</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-white">Deep<span className="text-cyan-500">Hire</span></span>
        </div>
        <div className="h-4 w-[1px] bg-white/10 mx-2" />
        <span className="text-[10px] font-medium text-white/30 uppercase tracking-[0.2em] hidden md:block">
          Powered by TenAi's Consulting india
        </span>
      </div>

      <div className="flex-1" />

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
