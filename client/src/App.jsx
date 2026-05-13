import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const InterviewSession = lazy(() => import('./pages/InterviewSession'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const SignInPage = lazy(() => import('./pages/SignInPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const InterviewsHistory = lazy(() => import('./pages/InterviewsHistory'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const ProPage = lazy(() => import('./pages/ProPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const InterviewAnalysis = lazy(() => import('./pages/InterviewAnalysis'));

// Fallback component
const PageLoader = () => (
  <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center gap-4">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 animate-pulse" />
      <Loader2 className="w-12 h-12 text-cyan-500 animate-spin absolute inset-0" />
    </div>
    <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em] animate-pulse">Loading DeepHire...</p>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <>
                <SignedIn><Dashboard /></SignedIn>
                <SignedOut><RedirectToSignIn /></SignedOut>
              </>
            } 
          />
          <Route 
            path="/interview" 
            element={
              <>
                <SignedIn><InterviewSession /></SignedIn>
                <SignedOut><RedirectToSignIn /></SignedOut>
              </>
            } 
          />

          <Route 
            path="/history" 
            element={
              <>
                <SignedIn><InterviewsHistory /></SignedIn>
                <SignedOut><RedirectToSignIn /></SignedOut>
              </>
            } 
          />
          <Route 
            path="/help" 
            element={
              <>
                <SignedIn><HelpCenter /></SignedIn>
                <SignedOut><RedirectToSignIn /></SignedOut>
              </>
            } 
          />
          <Route 
            path="/pro" 
            element={
              <>
                <SignedIn><ProPage /></SignedIn>
                <SignedOut><RedirectToSignIn /></SignedOut>
              </>
            } 
          />

          <Route 
            path="/account" 
            element={
              <>
                <SignedIn><AccountPage /></SignedIn>
                <SignedOut><RedirectToSignIn /></SignedOut>
              </>
            } 
          />

          <Route 
            path="/analysis/:sessionId" 
            element={
              <>
                <SignedIn><InterviewAnalysis /></SignedIn>
                <SignedOut><RedirectToSignIn /></SignedOut>
              </>
            } 
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
