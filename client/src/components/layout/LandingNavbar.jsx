import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

const LandingNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-[100] transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-[#050505]/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
            <Zap className="w-6 h-6 text-[#050505] fill-current" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">DeepHire</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#solutions">Solutions</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <NavLink href="#about">About</NavLink>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <SignedOut>
            <Link to="/sign-in" className="text-sm font-bold text-white/60 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/sign-up" className="px-6 py-2.5 bg-white text-black font-black rounded-xl text-sm hover:bg-white/90 transition-all active:scale-95">
              Get Started
            </Link>
          </SignedOut>
          <SignedIn>
            <Link to="/dashboard" className="text-sm font-bold text-white/60 hover:text-white transition-colors">
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-white/60 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#0a0a0a] border-b border-white/5 p-6 flex flex-col gap-6 md:hidden backdrop-blur-xl">
          <NavLink href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</NavLink>
          <NavLink href="#solutions" onClick={() => setIsMobileMenuOpen(false)}>Solutions</NavLink>
          <NavLink href="#pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</NavLink>
          <NavLink href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</NavLink>
          <hr className="border-white/5" />
          <SignedOut>
            <SignInButton mode="modal">
              <button className="w-full py-3 bg-white text-black font-black rounded-xl text-center">
                Get Started
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-3 bg-white text-black font-black rounded-xl text-center">
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ href, children, onClick }) => (
  <a 
    href={href} 
    onClick={onClick}
    className="text-sm font-bold text-white/40 hover:text-cyan-400 transition-colors"
  >
    {children}
  </a>
);

export default LandingNavbar;
