/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { Tab, Student } from './types';
import { ME_PROFILE } from './data';
import DashboardView from './components/DashboardView';
import DiscoverView from './components/DiscoverView';
import ProjectsView from './components/ProjectsView';
import CommunitiesView from './components/CommunitiesView';
import MessagesView from './components/MessagesView';
import SettingsView from './components/SettingsView';
import AuthView from './components/AuthView';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { 
  Compass, 
  Sparkles, 
  GraduationCap, 
  MessageSquare, 
  Users, 
  FolderGit2, 
  Settings as SettingsIcon,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  Activity,
  Heart,
  Github,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [me, setMe] = useState<Student | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Authenticated! Fetch custom student profile from Firestore
        try {
          const userDocRef = doc(db, 'students', firebaseUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setMe(snap.data() as Student);
          } else {
            // No profile doc exists yet. Let AuthView onboarding handle layout
            setMe(null);
          }
        } catch (error) {
          console.warn("Firestore access restricted, offline, or uninitialized, setting fallback name state.", error);
          setMe({
            id: firebaseUser.uid,
            name: firebaseUser.email?.split('@')[0] || 'Academic Peer',
            avatar: 'AP',
            email: firebaseUser.email || 'student@skillsync.edu',
            university: 'Academic Institute of Technology',
            major: 'Computer Science',
            year: 'Junior Year',
            bio: 'Passionate about structural engineering and collaborative academic partnerships.',
            skills: ['React', 'TypeScript'],
            interests: ['Hackathons'],
            availability: 'Available'
          });
        }
      } else {
        setMe(null);
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper to trigger navigation into chat from Discover
  const handleOpenMessageThread = (participantName: string) => {
    setActiveTab(Tab.Messages);
    // Find the thread with this participant or set default thread 't1'
    if (participantName.includes('Sarah')) {
      setActiveThreadId('t1');
    } else if (participantName.includes('Maya')) {
      setActiveThreadId('t2');
    } else {
      setActiveThreadId('t3');
    }
  };

  const menuItems = [
    { tab: Tab.Dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { tab: Tab.Discover, label: 'Find Peers', icon: Compass },
    { tab: Tab.Projects, label: 'Projects', icon: FolderGit2 },
    { tab: Tab.Communities, label: 'Communities', icon: Users },
    { tab: Tab.Messages, label: 'Messages', icon: MessageSquare, badge: 2 },
    { tab: Tab.Settings, label: 'Settings', icon: SettingsIcon }
  ];

  const getStatusColor = (status: 'Available' | 'Busy' | 'Part-time') => {
    if (status === 'Available') return 'bg-emerald-500 text-emerald-800 border-emerald-200';
    if (status === 'Part-time') return 'bg-amber-500 text-amber-800 border-amber-200';
    return 'bg-rose-500 text-rose-800 border-rose-200';
  };

  if (!authChecked) {
    return (
      <div id="loading-hydrating-frame" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/20 animate-bounce mx-auto">
            S²
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Loader2 className="w-4.5 h-4.5 text-blue-600 animate-spin" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Hydrating Credentials...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!me) {
    return <AuthView onAuthSuccess={(student) => {
      setMe(student);
      setActiveTab(Tab.Dashboard);
    }} />;
  }

  return (
    <div id="skillsync-app-root" className="min-h-screen bg-slate-50 flex font-sans overflow-x-hidden">
      
      {/* 1. Large Screen Persistent Desktop Sidebar Menu */}
      <aside 
        id="desktop-sidebar-pane"
        className="hidden lg:flex flex-col justify-between w-64 bg-white border-r border-slate-100 p-6 shrink-0 h-screen sticky top-0"
      >
        <div className="space-y-6">
          {/* Platform Branding Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">
              S²
            </div>
            <div>
              <span className="block font-black text-slate-900 tracking-tight text-base leading-none">SkillSync</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Academic Sphere</span>
            </div>
          </div>

          {/* Student mini representation header */}
          <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center shadow-inner tracking-wider">
              {me.avatar}
            </div>
            <div className="min-w-0">
              <span className="block font-bold text-slate-800 text-xs truncate leading-none mb-1">
                {me.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block truncate">
                {me.university}
              </span>
              <span className="inline-flex items-center gap-1 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  me.availability === 'Available' ? 'bg-emerald-500 animate-pulse' :
                  me.availability === 'Part-time' ? 'bg-amber-500' : 'bg-rose-500'
                }`}></span>
                <span className="text-[9px] font-bold text-slate-500 tracking-wide uppercase leading-none">
                  {me.availability}
                </span>
              </span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Nav Items list */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  id={`nav-link-${item.tab}`}
                  onClick={() => setActiveTab(item.tab)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all cursor-pointer font-sans ${
                    isActive 
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/10' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-xs md:text-sm">{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="bg-rose-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Desktop sidebar footer */}
        <div className="space-y-4">
          <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100/30 text-center">
            <span className="block text-[10px] text-blue-750 font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              PWA Mode Connected
            </span>
            <p className="text-[10px] text-slate-500 leading-normal">
              Syncing metadata smoothly with local database cache.
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-0.5">Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> on React</span>
          </div>
        </div>
      </aside>

      {/* 2. Responsive Core Viewing Frame (Right & Main space) */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Universal Top Header */}
        <header 
          id="common-header-bar"
          className="bg-white border-b border-slate-100 px-4 py-3 md:px-6 sticky top-0 z-40 flex items-center justify-between"
        >
          {/* Left branding layout for mobile viewports */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm">
                S
              </div>
              <span className="font-extrabold text-slate-950 text-sm tracking-tight">SkillSync</span>
            </div>
          </div>

          <div className="hidden lg:block text-xs font-semibold text-slate-500">
            Institution: <span className="text-slate-800 font-bold">{me.university}</span>
          </div>

          {/* Right quick avatar controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 bg-slate-50 border border-slate-200/50 px-2.5 py-1 rounded-lg">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-bold text-slate-600">Local Cache: Stable</span>
            </div>

            <div className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border flex items-center gap-1 shrink-0 ${
              me.availability === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
              me.availability === 'Part-time' ? 'bg-amber-50 text-amber-700 border-amber-100' :
              'bg-rose-50 text-rose-700 border-rose-100'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                me.availability === 'Available' ? 'bg-emerald-500 animate-ping' :
                me.availability === 'Part-time' ? 'bg-amber-500' : 'bg-rose-500'
              }`}></span>
              {me.availability}
            </div>

            {/* Microavatar with navigation hook */}
            <div 
              onClick={() => setActiveTab(Tab.Settings)}
              className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-500/20 transition-all shadow-inner"
              title="View settings"
            >
              {me.avatar}
            </div>
          </div>
        </header>

        {/* Drawer Mobile Hub Navigation Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden flex"
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                onClick={(e) => e.stopPropagation()}
                className="w-72 bg-white h-full p-6 space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold">S²</div>
                      <span className="font-bold text-slate-800">SkillSync</span>
                    </div>
                    <button 
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5.5 h-5.5" />
                    </button>
                  </div>

                  <nav className="space-y-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.tab;
                      return (
                        <button
                          key={item.tab}
                          id={`mobile-nav-link-${item.tab}`}
                          onClick={() => {
                            setActiveTab(item.tab);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-blue-600 text-white font-bold' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            <span className="text-xs md:text-sm">{item.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl text-center space-y-1">
                  <span className="text-xs font-bold text-slate-700 block">Suryakarthikeya Akurathi</span>
                  <span className="text-[10px] text-slate-400 block truncate">{me.email}</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary View Mounting Frame */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto pb-24 lg:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === Tab.Dashboard && (
                <DashboardView me={me} onChangeMe={setMe} />
              )}
              {activeTab === Tab.Discover && (
                <DiscoverView me={me} onOpenMessageThread={handleOpenMessageThread} />
              )}
              {activeTab === Tab.Projects && (
                <ProjectsView me={me} />
              )}
              {activeTab === Tab.Communities && (
                <CommunitiesView />
              )}
              {activeTab === Tab.Messages && (
                <MessagesView 
                  me={me} 
                  activeThreadId={activeThreadId || ''} 
                  setActiveThreadId={(id) => setActiveThreadId(id)} 
                />
              )}
              {activeTab === Tab.Settings && (
                <SettingsView me={me} onChangeMe={setMe} onLogout={() => setMe(null)} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* 3. Mobile Persistent Bottom Tab Bar (Strict 44px compliance) */}
        <nav 
          id="mobile-bottom-tabs"
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-around py-2.5 z-40 px-3 select-none"
        >
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                id={`mobile-tab-btn-${item.tab}`}
                onClick={() => setActiveTab(item.tab)}
                className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
                  isActive ? 'text-blue-650' : 'text-slate-400 hover:text-slate-600'
                }`}
                style={{ minWidth: '48px', minHeight: '44px' }}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-2 text-blue-600 scale-105' : ''}`} />
                  {item.badge && !isActive && (
                    <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white font-extrabold text-[8px] w-4 h-4 rounded-full flex items-center justify-center leading-none">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] mt-1 tracking-tight font-medium ${isActive ? 'font-bold text-blue-600' : 'text-slate-400'}`}>
                  {item.label === 'Find Peers' ? 'Peers' : item.label}
                </span>
              </button>
            );
          })}
          
          {/* Quick Settings mobile override to permit configuration swap */}
          <button
            onClick={() => setActiveTab(Tab.Settings)}
            className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
              activeTab === Tab.Settings ? 'text-blue-650' : 'text-slate-400 hover:text-slate-600'
            }`}
            style={{ minWidth: '48px', minHeight: '44px' }}
          >
            <SettingsIcon className={`w-5 h-5 ${activeTab === Tab.Settings ? 'stroke-2 text-blue-600 scale-105' : ''}`} />
            <span className={`text-[9px] mt-1 tracking-tight font-medium ${activeTab === Tab.Settings ? 'font-bold text-blue-600' : 'text-slate-400'}`}>
              Settings
            </span>
          </button>
        </nav>

      </div>

    </div>
  );
}

