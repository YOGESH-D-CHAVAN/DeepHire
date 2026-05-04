import React from 'react';
import { Zap, Mail } from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 pt-16 pb-8 px-8">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#0a0a0a] fill-current" />
            </div>
            <span className="text-xl font-bold text-white">DeepHire</span>
          </div>
          <p className="text-sm text-white/40 leading-relaxed max-w-xs">
            Elevating interview experiences with state-of-the-art AI behavioral analysis and technical assessment tools.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/10 transition-all text-white/40 hover:text-white">
              <FaTwitter className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/10 transition-all text-white/40 hover:text-white">
              <FaLinkedinIn className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/10 transition-all text-white/40 hover:text-white">
              <FaGithub className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Links Section 1 */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Product</h4>
          <ul className="space-y-4">
            <li><a href="#" className="text-sm text-white/40 hover:text-cyan-400 transition-colors">AI Interviewer</a></li>
            <li><a href="#" className="text-sm text-white/40 hover:text-cyan-400 transition-colors">Behavioral Labs</a></li>
            <li><a href="#" className="text-sm text-white/40 hover:text-cyan-400 transition-colors">Pricing Plans</a></li>
            <li><a href="#" className="text-sm text-white/40 hover:text-cyan-400 transition-colors">Enterprise</a></li>
          </ul>
        </div>

        {/* Links Section 2 */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Company</h4>
          <ul className="space-y-4">
            <li><a href="#" className="text-sm text-white/40 hover:text-violet-400 transition-colors">About Us</a></li>
            <li><a href="#" className="text-sm text-white/40 hover:text-violet-400 transition-colors">Careers</a></li>
            <li><a href="#" className="text-sm text-white/40 hover:text-violet-400 transition-colors">Contact</a></li>
            <li><a href="#" className="text-sm text-white/40 hover:text-violet-400 transition-colors">Press Kit</a></li>
          </ul>
        </div>

        {/* Newsletter Section */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Stay Updated</h4>
          <p className="text-sm text-white/40 mb-4">Get the latest insights on AI recruitment.</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="email" 
                placeholder="Email address"
                className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            <button className="px-4 py-2 bg-white text-black font-bold rounded-xl text-sm hover:bg-white/90 transition-colors">
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-white/20">
          © 2026 DeepHire Inc. All rights reserved.
        </p>
        <div className="flex items-center gap-8">
          <a href="#" className="text-xs text-white/20 hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="text-xs text-white/20 hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="text-xs text-white/20 hover:text-white transition-colors">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
