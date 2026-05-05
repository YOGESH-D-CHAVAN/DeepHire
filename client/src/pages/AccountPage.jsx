import React from 'react';
import { motion } from 'framer-motion';
import { useUser, useClerk, UserProfile } from '@clerk/clerk-react';
import Navbar from '../components/layout/Navbar';
import { LogOut, User, Shield, Bell, CreditCard, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      
      <main className="flex-1 flex flex-col">
        <Navbar />
        
        <div className="flex-1 p-8 pt-24 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto px-4 md:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4"
                >
                  <User className="w-3 h-3" /> Account Settings
                </motion.div>
                <h1 className="text-4xl font-black tracking-tight">Your Profile</h1>
                <p className="text-white/40 mt-2 text-lg">Manage your account details and security preferences.</p>
              </div>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95 group"
              >
                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Log Out
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-1 space-y-6">
                <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 text-center relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="w-24 h-24 rounded-full mx-auto mb-6 p-1 bg-gradient-to-tr from-cyan-500 to-violet-500">
                     <img 
                       src={user?.imageUrl} 
                       alt="Profile" 
                       className="w-full h-full rounded-full border-4 border-[#0a0a0a]"
                     />
                   </div>
                   <h3 className="text-xl font-bold mb-1">{user?.fullName}</h3>
                   <p className="text-white/40 text-sm mb-6">{user?.primaryEmailAddress?.emailAddress}</p>
                   
                   <div className="pt-6 border-t border-white/5 space-y-3">
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-white/40">Status</span>
                       <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-bold text-[10px] uppercase">Active</span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-white/40">Member Since</span>
                       <span className="text-white/60 font-medium">
                         {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                       </span>
                     </div>
                   </div>
                </div>

                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-1">
                   <SidebarItem icon={Shield} label="Privacy & Security" />
                   <SidebarItem icon={Bell} label="Notifications" />
                   <SidebarItem icon={CreditCard} label="Billing & Plan" />
                </div>
              </div>

              {/* Clerk UserProfile */}
              <div className="lg:col-span-2">
                <div className="rounded-[40px] overflow-hidden border border-white/10 bg-[#0a0a0a]">
                  <UserProfile 
                    appearance={{
                      elements: {
                        rootBox: 'w-full h-full',
                        card: 'bg-transparent shadow-none border-none w-full',
                        navbar: 'hidden', // We have our own sidebar
                        scrollBox: 'bg-transparent',
                        headerTitle: 'text-white font-black text-2xl',
                        headerSubtitle: 'text-white/40',
                        profileSectionTitleText: 'text-cyan-400 font-bold',
                        userPreviewMainIdentifier: 'text-white font-bold',
                        userPreviewSecondaryIdentifier: 'text-white/40',
                        formButtonPrimary: 'bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl',
                        formFieldLabel: 'text-white/60 font-bold',
                        formFieldInput: 'bg-white/5 border border-white/10 text-white rounded-xl focus:ring-cyan-500/50',
                        breadcrumbs: 'hidden',
                        badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                        activeDeviceIcon: 'text-cyan-400'
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label }) => (
  <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group">
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-white/40 group-hover:text-cyan-400 transition-colors" />
      <span className="font-bold text-white/60 group-hover:text-white transition-colors">{label}</span>
    </div>
    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-cyan-400 transition-all" />
  </button>
);

export default AccountPage;
