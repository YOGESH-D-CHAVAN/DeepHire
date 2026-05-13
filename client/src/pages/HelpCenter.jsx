import React from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import { HelpCircle, BookOpen, MessageCircle, Play, Shield, Zap, Search, ChevronRight } from 'lucide-react';

const HelpCenter = () => {
  const categories = [
    { 
      icon: Play, 
      title: 'Getting Started', 
      desc: 'Learn the basics of using DeepHire AI for your interview prep.',
      color: 'text-cyan-400'
    },
    { 
      icon: Zap, 
      title: 'AI Analysis', 
      desc: 'Understand how our AI evaluates your speech and body language.',
      color: 'text-violet-400'
    },
    { 
      icon: Shield, 
      title: 'Privacy & Security', 
      desc: 'How we handle your data and video recordings.',
      color: 'text-emerald-400'
    },
    { 
      icon: MessageCircle, 
      title: 'Feedback Tips', 
      desc: 'How to use AI feedback to improve your real-world performance.',
      color: 'text-amber-400'
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex-1 p-4 md:p-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6"
          >
            <HelpCircle className="w-4 h-4" /> Support Center
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">How can we help?</h1>
          <div className="relative group">
            <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search guides..."
              className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-4 md:py-5 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl outline-none focus:border-cyan-500/50 transition-all text-base md:text-lg"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index}
              className="p-6 md:p-8 rounded-[2rem] md:rounded-[40px] bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all group cursor-pointer"
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                <cat.icon className={`w-6 h-6 md:w-7 md:h-7 ${cat.color}`} />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">{cat.title}</h3>
              <p className="text-white/40 text-xs md:text-sm leading-relaxed">{cat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
            < BookOpen className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-3 md:space-y-4">
            {[
              "How does the AI score my confidence?",
              "Can I download my interview transcripts?",
              "Is my camera recording saved permanently?",
              "What kind of questions does the AI bot ask?"
            ].map((faq, i) => (
              <div key={i} className="p-5 md:p-6 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between group">
                <span className="text-sm md:text-base font-medium">{faq}</span>
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white/20 group-hover:text-cyan-400 transition-all" />
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="p-8 md:p-12 rounded-[2rem] md:rounded-[50px] bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-white/10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-cyan-500/10 blur-[100px] rounded-full" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Still need help?</h2>
          <p className="text-white/40 text-xs md:text-sm mb-8 max-w-md mx-auto">
            Our support team is available 24/7 to help you with any technical issues or feedback.
          </p>
          <button className="px-8 md:px-10 py-3 md:py-4 bg-white text-black font-bold text-sm rounded-xl md:rounded-2xl hover:bg-cyan-400 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HelpCenter;
