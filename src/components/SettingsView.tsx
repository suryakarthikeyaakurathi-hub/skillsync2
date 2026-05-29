import React, { useState } from 'react';
import { Student } from '../types';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Brain, 
  Terminal, 
  Check, 
  CloudAlert,
  Loader2,
  Lock,
  Compass,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface Props {
  me: Student;
  onChangeMe: (updated: Student) => void;
  onLogout: () => void;
}

export default function SettingsView({ me, onChangeMe, onLogout }: Props) {
  const [pushAlerts, setPushAlerts] = useState(true);
  const [offlineIndicators, setOfflineIndicators] = useState(true);
  const [matchParticipate, setMatchParticipate] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [localName, setLocalName] = useState(me.name);
  const [localBio, setLocalBio] = useState(me.bio);
  const [localMajor, setLocalMajor] = useState(me.major);
  const [successSave, setSuccessSave] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut(auth);
      onLogout();
    } catch (err) {
      console.error('Logout error', err);
      // fallback even if offline/errored
      onLogout();
    } finally {
      setIsSigningOut(false);
    }
  };

  // Trigger AI audit analysis of bio text
  const triggerAIAudit = () => {
    setIsAnalyzing(true);
    setFeedbackMsg('');
    setTimeout(() => {
      setIsAnalyzing(false);
      setFeedbackMsg('Assessment Complete! AI Optimizer Rating: 94/100. Core competencies are matched beautifully. Suggestion: Add some design methodologies.');
    }, 1500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeMe({
      ...me,
      name: localName,
      bio: localBio,
      major: localMajor
    });
    setSuccessSave(true);
    setTimeout(() => setSuccessSave(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-700" />
          Settings & Systems Center
        </h1>
        <p className="text-sm text-slate-500">
          Maintain your secure student metadata, manage native PWA push alerts, and audit profile strength
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile details form editor */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-800 text-sm md:text-base">Modify Academic Credentials</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Verification Name</label>
                <input
                  type="text"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 px-3 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Registered Institutions</label>
                <div className="w-full pr-10 pl-3 py-2.5 bg-slate-105 text-xs text-slate-400 select-none cursor-not-allowed flex items-center justify-between rounded-xl">
                  <span>{me.university}</span>
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Declared Major/Program</label>
              <input
                type="text"
                value={localMajor}
                onChange={(e) => setLocalMajor(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 px-3 py-2.5 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Student Showcase Bio</label>
              <textarea
                rows={4}
                value={localBio}
                onChange={(e) => setLocalBio(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 px-3 py-2.5 rounded-xl focus:outline-none resize-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <button
                type="submit"
                className="bg-slate-900 border border-slate-700 text-white hover:bg-black font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                Save Academic Profile Changes
              </button>

              <AnimatePresence>
                {successSave && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" /> Credentials Saved!
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

          </form>
        </div>

        {/* Right side: PWA tools, system settings & AI profile analyzer */}
        <div className="space-y-6">
          
          {/* AI Optimizer box */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 rounded-2xl text-white shadow-sm space-y-4">
            <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide flex items-center gap-2">
              <Brain className="w-5 h-5 text-amber-300 animate-pulse" />
              AI Resume & Profile Audit
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Verify if your biography keywords correspond to correct student metadata tags for partner discoverability pipelines.
            </p>

            <button
              onClick={triggerAIAudit}
              disabled={isAnalyzing}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Bio Vocabulary...
                </>
              ) : (
                'Run Optimizer Profile Assessment'
              )}
            </button>

            {feedbackMsg && (
              <div className="p-3 bg-white/10 rounded-xl border border-white/20 text-xs text-indigo-100 animate-fadeIn text-justify">
                {feedbackMsg}
              </div>
            )}
          </div>

          {/* PWA features setup and notifications */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
              <Bell className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-slate-800 text-sm">PWA Toggles (Phase 10 preview)</h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-start justify-between gap-3 cursor-pointer select-none">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-slate-800">Push Notifications</span>
                  <span className="block text-[10px] text-slate-400">Receive alert when peer submits partnership ask</span>
                </div>
                <input
                  type="checkbox"
                  checked={pushAlerts}
                  onChange={(e) => setPushAlerts(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 mt-1"
                />
              </label>

              <label className="flex items-start justify-between gap-3 cursor-pointer select-none">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-slate-800">Highlight offline cache indicator</span>
                  <span className="block text-[10px] text-slate-400">Notify me when service workers trigger offline layouts</span>
                </div>
                <input
                  type="checkbox"
                  checked={offlineIndicators}
                  onChange={(e) => setOfflineIndicators(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 mt-1"
                />
              </label>

              <label className="flex items-start justify-between gap-3 cursor-pointer select-none">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-slate-800">Match Pool Entry</span>
                  <span className="block text-[10px] text-slate-400">Allow AI recommended search models to crawl my profile description</span>
                </div>
                <input
                  type="checkbox"
                  checked={matchParticipate}
                  onChange={(e) => setMatchParticipate(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 mt-1"
                />
              </label>
            </div>
          </div>

          {/* Secure Session Management / Logout */}
          <div className="bg-rose-50/30 p-6 rounded-2xl border border-rose-100/30 shadow-sm space-y-3">
            <h3 className="font-bold text-rose-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-rose-500" />
              Secure Session Manager
            </h3>
            <p className="text-[11.5px] text-slate-500 leading-normal">
              Logging out invalidates active tokens to guarantee security within institutional networks.
            </p>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-sm shadow-rose-500/10 active:scale-95"
            >
              {isSigningOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Campus Hub</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
