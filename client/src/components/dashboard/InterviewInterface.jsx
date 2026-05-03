import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Send, Bot, User as UserIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

const InterviewInterface = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hello! I'm your AI interviewer today. Are you ready to begin the technical assessment for the Senior Software Engineer position?" }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    
    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "That's great. Let's start with a foundational question. Can you explain the difference between prototypal inheritance and class inheritance in JavaScript?" 
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white/5 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AI Technical Interviewer</h3>
            <p className="text-xs text-cyan-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              Live Assessment
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsRecording(!isRecording)}
            className={cn(
              "p-2.5 rounded-xl transition-all",
              isRecording ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/5 text-white/60 hover:text-white border border-white/10"
            )}
          >
            {isRecording ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button className="p-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white border border-white/10 transition-all">
            <Video className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                msg.role === 'bot' ? "bg-cyan-500/20 border border-cyan-500/30" : "bg-violet-500/20 border border-violet-500/30"
              )}>
                {msg.role === 'bot' ? <Bot className="w-4 h-4 text-cyan-400" /> : <UserIcon className="w-4 h-4 text-violet-400" />}
              </div>
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                msg.role === 'bot' 
                  ? "bg-white/5 text-white/80 border border-white/10 rounded-tl-none" 
                  : "bg-cyan-500 text-[#0a0a0a] font-medium rounded-tr-none"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-[#0a0a0a]/50 border-t border-white/10">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your answer or speak..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-24 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button 
              onClick={handleSend}
              className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-[#0a0a0a] rounded-xl transition-all shadow-lg shadow-cyan-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-white/30 text-center mt-3 uppercase tracking-widest font-bold">
          AI Interviewer is analyzing your response in real-time
        </p>
      </div>
    </div>
  );
};

export default InterviewInterface;
