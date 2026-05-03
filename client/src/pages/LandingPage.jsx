import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Video, 
  BarChart3, 
  ShieldCheck, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  Bot,
  BrainCircuit,
  MessageSquare,
  Globe
} from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import LandingNavbar from '../components/layout/LandingNavbar';
import Footer from '../components/layout/Footer';
import { cn } from '../utils/cn';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">Next Gen AI Recruitment</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1]"
            >
              Elevate Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-violet-500">
                Interview Intelligence
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/40 max-w-2xl leading-relaxed font-medium"
            >
              The first AI-powered behavioral analysis platform designed to help you master technical interviews with real-time feedback and proctoring.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 pt-4"
            >
              <Link 
                to="/dashboard" 
                className="px-8 py-4 bg-white text-black font-black rounded-2xl flex items-center gap-2 hover:bg-white/90 transition-all group shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all backdrop-blur-md active:scale-95">
                Watch Demo
              </button>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative mt-20 w-full max-w-5xl group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
              <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="h-12 border-b border-white/5 flex items-center px-6 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <img 
                  src="/assets/hero.png" 
                  alt="Dashboard Preview" 
                  className="w-full h-auto opacity-80"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-8 bg-[#070707] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Designed for the <br /> <span className="text-cyan-400">Future of Work</span></h2>
            <p className="text-white/40 text-lg">Powerful tools to help candidates shine and recruiters make data-driven decisions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={BrainCircuit}
              title="Behavioral AI"
              description="Real-time sentiment analysis and emotion detection to provide objective feedback on soft skills."
              color="cyan"
              delay={0.1}
            />
            <FeatureCard 
              icon={Bot}
              title="Smart Proctoring"
              description="Advanced anti-cheat measures including tab tracking and multi-face detection for secure sessions."
              color="violet"
              delay={0.2}
            />
            <FeatureCard 
              icon={BarChart3}
              title="Insightful Reports"
              description="Comprehensive post-session analytics covering grammar, confidence, and technical accuracy."
              color="cyan"
              delay={0.3}
            />
            <FeatureCard 
              icon={MessageSquare}
              title="Real-time Feedback"
              description="Instant suggestions during practice modes to help you refine your answers on the fly."
              color="violet"
              delay={0.4}
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Enterprise Grade"
              description="Secure, scalable, and compliant infrastructure built for the world's most demanding teams."
              color="cyan"
              delay={0.5}
            />
            <FeatureCard 
              icon={Globe}
              title="Global Access"
              description="Interview from anywhere with low-latency streaming and multilingual support."
              color="violet"
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-8 border-y border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xs text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">Loved by Industry Leaders</h3>
              <p className="text-sm text-white/40 font-medium">Empowering the next generation of software engineers globally.</p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-20 grayscale">
               <span className="text-xl font-black tracking-tighter">ALPHABET</span>
               <span className="text-xl font-black tracking-tighter">MICROSOFT</span>
               <span className="text-xl font-black tracking-tighter">STRIPE</span>
               <span className="text-xl font-black tracking-tighter">AIRBNB</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8">
        <div className="max-w-6xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
          <div className="relative overflow-hidden rounded-[3rem] bg-[#0a0a0a] border border-white/10 p-12 md:p-24 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none" />
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-[1.1]"
            >
              Start your journey to <br /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-400">career excellence</span>
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link to="/dashboard" className="px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-white/90 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95">
                Get Started for Free
              </Link>
              <button className="flex items-center gap-2 text-white font-bold hover:text-cyan-400 transition-colors group">
                Schedule a Demo <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, color, delay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 group relative overflow-hidden hover:-translate-y-2"
    >
      <div className={cn(
        "absolute -top-10 -right-10 w-40 h-40 blur-[60px] rounded-full transition-colors duration-500 opacity-20",
        color === 'cyan' ? "bg-cyan-500/20 group-hover:bg-cyan-500/40" : "bg-violet-500/20 group-hover:bg-violet-500/40"
      )} />
      
      <div className={cn(
        "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
        color === 'cyan' ? "bg-cyan-500/10 border border-cyan-500/20" : "bg-violet-500/10 border border-violet-500/20"
      )}>
        <Icon className={cn(
          "w-8 h-8",
          color === 'cyan' ? "text-cyan-400" : "text-violet-400"
        )} />
      </div>
      
      <h3 className="text-2xl font-black mb-4 tracking-tight">{title}</h3>
      <p className="text-white/40 leading-relaxed font-medium">
        {description}
      </p>
    </motion.div>
  );
};

export default LandingPage;
