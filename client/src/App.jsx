import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InterviewSession from './pages/InterviewSession';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import InterviewsHistory from './pages/InterviewsHistory';
import HelpCenter from './pages/HelpCenter';
import ProPage from './pages/ProPage';
import AccountPage from './pages/AccountPage';
import InterviewAnalysis from './pages/InterviewAnalysis';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <>
              <SignedIn>
                <Dashboard />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          } 
        />
        <Route 
          path="/interview" 
          element={
            <>
              <SignedIn>
                <InterviewSession />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          } 
        />

        <Route 
          path="/history" 
          element={
            <>
              <SignedIn>
                <InterviewsHistory />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          } 
        />
        <Route 
          path="/help" 
          element={
            <>
              <SignedIn>
                <HelpCenter />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          } 
        />
        <Route 
          path="/pro" 
          element={
            <>
              <SignedIn>
                <ProPage />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          } 
        />

        <Route 
          path="/account" 
          element={
            <>
              <SignedIn>
                <AccountPage />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          } 
        />

        <Route 
          path="/analysis/:sessionId" 
          element={
            <>
              <SignedIn>
                <InterviewAnalysis />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          } 
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;


