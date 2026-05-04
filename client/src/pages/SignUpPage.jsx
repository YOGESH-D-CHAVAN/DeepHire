import { SignUp } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

const SignUpPage = () => {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md flex flex-col items-center"
      >
        <Link to="/" className="flex items-center gap-2 mb-8 group">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
            <Zap className="w-6 h-6 text-[#050505] fill-current" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">DeepHire</span>
        </Link>

        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 rounded-xl transition-all',
              card: 'bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl',
              headerTitle: 'text-white font-black',
              headerSubtitle: 'text-white/40',
              socialButtonsBlockButton: 'bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all rounded-xl',
              socialButtonsBlockButtonText: 'text-white font-bold',
              dividerLine: 'bg-white/10',
              dividerText: 'text-white/40',
              formFieldLabel: 'text-white/60 font-bold',
              formFieldInput: 'bg-white/5 border border-white/10 text-white rounded-xl focus:ring-cyan-500/50',
              footerActionText: 'text-white/40',
              footerActionLink: 'text-cyan-400 hover:text-cyan-300 font-bold',
              identityPreviewText: 'text-white',
              identityPreviewEditButtonIcon: 'text-cyan-400'
            }
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/dashboard"
        />
      </motion.div>
    </div>
  );
};

export default SignUpPage;
