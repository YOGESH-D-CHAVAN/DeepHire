import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  MessageSquare, BarChart3, Settings, 
  AlertCircle, ChevronRight, Bot, User
} from 'lucide-react';
import { cn } from '../utils/cn';

const InterviewSession = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [timer, setTimer] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Camera Streaming Logic
  useEffect(() => {
    const enableCamera = async () => {
      try {
        if (!isVideoOff) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 1280, height: 720, facingMode: 'user' },
            audio: false 
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          stopCamera();
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    enableCamera();

    return () => stopCamera();
  }, [isVideoOff]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden font-sans">
      {/* Top Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/60">Live Interview</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <span className="text-sm font-medium text-cyan-400">Senior Software Engineer Role</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Duration</span>
            <span className="text-sm font-mono font-bold text-white">{formatTime(timer)}</span>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-white/40" />
          </button>
        </div>
      </header>

      {/* Main Content Area - Side-by-Side Redesign */}
      <div className="flex-1 flex overflow-hidden p-8 gap-8 relative bg-[#050505]">
        
        {/* Left: AI Bot Container */}
        <div className="flex-1 bg-gradient-to-br from-[#0a0a0a] to-[#080808] rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl group transition-all duration-500 hover:border-cyan-500/20">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
          
          {/* AI Bot Visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative scale-90 sm:scale-100">
              <motion.div 
                animate={{ 
                  scale: [1, 1.15, 1], 
                  opacity: [0.1, 0.25, 0.1],
                  rotate: [0, -90, -180, -270, -360]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-20 bg-cyan-500 rounded-full blur-[80px]"
              />
              <div className="w-56 h-56 rounded-full bg-[#111] border border-cyan-500/20 flex items-center justify-center relative z-10 shadow-[inset_0_0_50px_rgba(6,182,212,0.1)]">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/10 animate-[spin_25s_linear_infinite]" />
                <Bot className="w-24 h-24 text-cyan-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]" />
              </div>
            </div>
          </div>

          <div className="absolute top-6 left-6 z-20">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Interviewer</span>
            </div>
          </div>
        </div>

        {/* Right: User Camera Container */}
        <div className="flex-1 bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl group transition-all duration-500 hover:border-violet-500/20">
          {!isVideoOff ? (
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover grayscale-[20%] contrast-[1.1]"
              />
              {/* Animated corner indicators for focus effect */}
              <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-white/20 rounded-tl-lg" />
              <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
              <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-white/20 rounded-bl-lg" />
              <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-white/20 rounded-br-lg" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-[#050505] flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                 <User className="w-10 h-10 text-white/20" />
              </div>
            </div>
          )}
          
          <div className="absolute top-6 right-6 z-20">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Candidate</span>
            </div>
          </div>
        </div>
      </div>



      {/* Bottom Control Bar */}
      <footer className="h-28 bg-[#0a0a0a] border-t border-white/5 px-12 flex items-center justify-between">
        <div className="flex items-center gap-8">
           <div className="flex flex-col">
              <span className="text-[9px] text-white/20 uppercase font-black tracking-[0.2em] mb-1">Session Target</span>
              <span className="text-sm font-bold text-white/80">Senior React Engineer</span>
           </div>
        </div>

        <div className="flex items-center gap-5">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border",
              isMuted ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20" : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/20"
            )}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border",
              isVideoOff ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20" : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/20"
            )}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button className="px-10 h-14 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
             End Interview
          </button>
        </div>

        <div className="flex items-center gap-4">
           <button className="p-3 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
           </button>
        </div>

      </footer>

    </div>
  );
};

export default InterviewSession;
