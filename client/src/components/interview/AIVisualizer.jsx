import React from 'react';
import { motion } from 'framer-motion';

const AIVisualizer = ({ isTalking }) => {
  const bars = [...Array(15)];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a]">
      {/* Background Ambient Glow */}
      <motion.div 
        animate={{ 
          opacity: isTalking ? 0.15 : 0.05,
          scale: isTalking ? [1, 1.2, 1] : 1
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute w-96 h-96 bg-cyan-500 rounded-full blur-[120px]"
      />

      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Frequency Wave Container */}
        <div className="flex items-center gap-2 h-32">
          {bars.map((_, i) => {
            const distanceFromCenter = Math.abs(i - 7);
            const activeHeight = 80 - (distanceFromCenter * 8);

            return (
              <motion.div
                key={i}
                initial={{ height: 4 }}
                animate={{ 
                  height: isTalking 
                    ? [4, activeHeight, 12, activeHeight * 0.7, 4] 
                    : 4,
                  opacity: isTalking ? 1 : 0.2
                }}
                transition={{ 
                  duration: isTalking ? 0.8 : 0.3, 
                  repeat: isTalking ? Infinity : 0, 
                  ease: "easeInOut",
                  delay: isTalking ? i * 0.05 : 0
                }}
                className="w-2 bg-cyan-500 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              />
            );
          })}
        </div>

        {/* Minimal Status Text */}
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            animate={{ 
              color: isTalking ? "#22d3ee" : "#ffffff40",
              scale: isTalking ? 1.05 : 1
            }}
            className="text-[10px] font-black uppercase tracking-[0.5em]"
          >
            {isTalking ? "AI Transmitting" : "System Idle"}
          </motion.div>
          
          <div className="w-48 h-[1px] bg-white/[0.03] relative overflow-hidden">
             {isTalking && (
               <motion.div 
                 initial={{ x: "-100%" }}
                 animate={{ x: "100%" }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
               />
             )}
          </div>
        </div>
      </div>

      {/* Aesthetic Frame */}
      <div className="absolute inset-8 border border-white/[0.01] rounded-[3rem] pointer-events-none" />
    </div>
  );
};

export default AIVisualizer;
