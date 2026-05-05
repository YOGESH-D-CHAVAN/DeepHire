import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { HelpCircle, BookOpen, MessageCircle, Play, Shield, Zap, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 flex flex-col">
        <Navbar />
        
        <div className="flex-1 p-8 pt-24 overflow-y-auto">
          {/* Hero Section */}
          <div className="text-center max-w-2xl mx-auto mb-16 pt-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6"
            >
              <HelpCircle className="w-4 h-4" /> Support Center
            </motion.div>
            <h1 className="text-5xl font-black mb-6 tracking-tight">How can we help?</h1>
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search for articles, guides, and tips..."
                className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-3xl outline-none focus:border-cyan-500/50 transition-all text-lg"
              />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {categories.map((cat, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className="p-8 rounded-[40px] bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all group cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                  <cat.icon className={`w-7 h-7 ${cat.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{cat.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-cyan-400" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                "How does the AI score my confidence?",
                "Can I download my interview transcripts?",
                "Is my camera recording saved permanently?",
                "What kind of questions does the AI bot ask?"
              ].map((faq, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between group">
                  <span className="font-medium">{faq}</span>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-cyan-400 transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-20 p-12 rounded-[50px] bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-white/10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full" />
            <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
            <p className="text-white/40 mb-8 max-w-md mx-auto">
              Our support team is available 24/7 to help you with any technical issues or feedback.
            </p>
            <button className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-cyan-400 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpCenter;
