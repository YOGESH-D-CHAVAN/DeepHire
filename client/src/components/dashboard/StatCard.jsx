import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const StatCard = ({ label, value, icon: Icon, trend, color }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group"
    >
      <div className={cn(
        "absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity",
        color === 'cyan' ? "bg-cyan-500" : "bg-violet-500"
      )} />
      
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "p-3 rounded-2xl",
          color === 'cyan' ? "bg-cyan-500/10 text-cyan-400" : "bg-violet-500/10 text-violet-400"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-bold px-2 py-1 rounded-lg",
            trend > 0 ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"
          )}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      
      <p className="text-sm font-medium text-white/40 mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
    </motion.div>
  );
};

export default StatCard;
