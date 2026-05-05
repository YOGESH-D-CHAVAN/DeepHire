import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { Check, Zap, Star, Shield, Zap as ZapIcon, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProPage = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      features: ['2 Interviews / month', 'Basic AI feedback', 'Standard support'],
      cta: 'Current Plan',
      popular: false,
      color: 'white/5'
    },
    {
      name: 'Pro',
      price: '$19',
      features: ['Unlimited interviews', 'Advanced behavior analysis', 'Custom feedback engine', 'Priority support', 'Download reports'],
      cta: 'Go Pro Now',
      popular: true,
      color: 'cyan-500'
    },
    {
      name: 'Business',
      price: '$49',
      features: ['Team analytics', 'API access', 'Custom AI avatars', 'White-labeling', 'Dedicated account manager'],
      cta: 'Contact Sales',
      popular: false,
      color: 'violet-500'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 flex flex-col">
        <Navbar />
        
        <div className="flex-1 p-8 pt-24 overflow-y-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-20 pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6"
            >
              <Sparkles className="w-4 h-4" /> Pricing Plans
            </motion.div>
            <h1 className="text-6xl font-black mb-6 tracking-tight">Supercharge your prep.</h1>
            <p className="text-xl text-white/40">
              Get unlimited access to advanced AI behavioral analysis and ace your dream job.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {plans.map((plan, index) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className={`relative p-10 rounded-[50px] border ${plan.popular ? 'border-cyan-500 bg-cyan-500/[0.03] scale-105 z-10' : 'border-white/10 bg-white/5'} transition-all hover:border-white/20`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-cyan-500 text-black font-black text-xs uppercase tracking-widest rounded-full shadow-[0_0_40px_rgba(6,182,212,0.5)]">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-5xl font-black">{plan.price}</span>
                    <span className="text-white/40 font-bold">/mo</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-cyan-500' : 'bg-white/10'}`}>
                        <Check className="w-3 h-3 text-black" />
                      </div>
                      <span className="text-white/60 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <button className={`w-full py-5 rounded-2xl font-black transition-all active:scale-95 ${plan.popular ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_20px_40px_rgba(6,182,212,0.2)]' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Features Comparison */}
          <div className="max-w-4xl mx-auto p-12 rounded-[50px] bg-white/5 border border-white/10 mb-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[100px] rounded-full" />
            <h2 className="text-3xl font-bold mb-12 text-center">Why go Pro?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex gap-6">
                <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <ZapIcon className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Real-time Emotion AI</h4>
                  <p className="text-white/40 leading-relaxed">Our advanced models detect micro-expressions to gauge your stress and confidence levels instantly.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-16 h-16 rounded-3xl bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Star className="w-8 h-8 text-violet-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Detailed Reports</h4>
                  <p className="text-white/40 leading-relaxed">Get 10+ page PDF reports with line-by-line analysis of your answers and body language.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProPage;
