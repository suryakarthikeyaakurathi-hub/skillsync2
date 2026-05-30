import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Student } from '../types';
import { db } from '../firebase';
import { onSnapshot, collection } from 'firebase/firestore';
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  MessageSquare, 
  UserPlus, 
  Briefcase, 
  Clock, 
  Check, 
  X,
  Award,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Code,
  Compass,
  FileCode,
  Github,
  Linkedin,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  me: Student;
  onOpenMessageThread: (participantName: string) => void;
}

export default function DiscoverView({ me, onOpenMessageThread }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [minMatchScore, setMinMatchScore] = useState<number>(0);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  
  // Selected student for detail deep-dive modal
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Connection states
  const [connectedIds, setConnectedIds] = useState<string[]>([]);

  // Infinite Scroll & Pagination state
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState<boolean>(true);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Target element for scroll monitoring
  const loadingTriggerRef = useRef<HTMLDivElement | null>(null);

  // Active Peer connections list from Cloud Database
  const [peers, setPeers] = useState<Student[]>([]);

  useEffect(() => {
    // Open a real-time snapshot channel over students collection
    const unsubscribe = onSnapshot(
      collection(db, 'students'),
      (snapshot) => {
        const list: Student[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Student);
        });
        setPeers(list);
      },
      (error) => {
        console.warn("Firestore access restricted inside DiscoverView:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Collect all unique skills for filter list
  const allSkills = useMemo(() => {
    const list = new Set<string>();
    peers.forEach(student => {
      student.skills.forEach(skill => list.add(skill));
    });
    return Array.from(list);
  }, [peers]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return peers.filter(student => {
      // Search text matches name, bio, major, university
      const text = `${student.name} ${student.major} ${student.university} ${student.bio}`.toLowerCase();
      if (searchQuery.trim() && !text.includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Availability check
      if (selectedAvailability.length > 0 && !selectedAvailability.includes(student.availability)) {
        return false;
      }

      // Skill check
      if (selectedSkill !== 'All' && !student.skills.includes(selectedSkill)) {
        return false;
      }

      // Compatibility score check
      const score = student.matchScore || calculateFallbackScore(me, student);
      if (score < minMatchScore) {
        return false;
      }

      return true;
    });
  }, [peers, searchQuery, selectedAvailability, selectedSkill, minMatchScore, me]);

  // Handle intersection observer for infinite scroll
  useEffect(() => {
    if (!isAutoScrollEnabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && filteredStudents.length > visibleCount && !isLoadingMore) {
          triggerLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTrigger = loadingTriggerRef.current;
    if (currentTrigger) {
      observer.observe(currentTrigger);
    }

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger);
      }
    };
  }, [isAutoScrollEnabled, filteredStudents.length, visibleCount, isLoadingMore]);

  // Calculate matching score dynamically based on overlapping skills
  function calculateFallbackScore(user: Student, target: Student): number {
    const matched = target.skills.filter(s => 
      user.skills.some(my => my.toLowerCase() === s.toLowerCase())
    );
    let base = Math.round((matched.length / Math.max(1, target.skills.length)) * 50) + 50;
    if (target.availability === 'Available') base = Math.min(100, base + 8);
    return Math.min(100, base);
  }

  const triggerLoadMore = () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    // Simulate smart matching score indexing delay
    setTimeout(() => {
      setVisibleCount(prev => Math.min(filteredStudents.length, prev + 4));
      setIsLoadingMore(false);
    }, 1200);
  };

  const toggleAvailabilityFilter = (status: string) => {
    if (selectedAvailability.includes(status)) {
      setSelectedAvailability(selectedAvailability.filter(s => s !== status));
    } else {
      setSelectedAvailability([...selectedAvailability, status]);
    }
    // reset visible count for fresh query
    setVisibleCount(4);
  };

  const handleConnect = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening details
    if (connectedIds.includes(studentId)) return;
    setConnectedIds([...connectedIds, studentId]);

    const peer = peers.find(p => p.id === studentId);
    if (peer) {
      setShowNotification(`Partnership invite sent to ${peer.name}!`);
      setTimeout(() => setShowNotification(null), 3000);
    }
  };

  const handleStartChat = (student: Student) => {
    onOpenMessageThread(student.name);
  };

  return (
    <div className="space-y-6 relative">

      {/* Connection notification banner */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ x: '-50%' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-750 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{showNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
            <Compass className="w-6.5 h-6.5 text-indigo-600" />
            Campus Peer Discovery
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Discover peer competencies, cross-compare project compatibility, and initiate partnerships.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Quick toggle for auto-scroll vs manual scroll */}
          <button
            onClick={() => setIsAutoScrollEnabled(!isAutoScrollEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              isAutoScrollEnabled 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-white text-slate-500 border-slate-200'
            }`}
            title="Auto stream loads more cards automatically as you near the bottom of the page"
          >
            <span className={`w-2 h-2 rounded-full ${isAutoScrollEnabled ? 'bg-emerald-500 animate-ping' : 'bg-slate-350'}`} />
            {isAutoScrollEnabled ? 'Infinite Scroll: Active' : 'Infinite Scroll: Manual'}
          </button>

          <button
            onClick={() => setShowFiltersMobile(true)}
            className="lg:hidden shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer select-none transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            Filter Sheet {selectedAvailability.length > 0 || selectedSkill !== 'All' ? '• Active' : ''}
          </button>
        </div>
      </div>

      {/* Main Grid Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Desktop Filter Block (Sticky viewport configuration) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-150/80 shadow-sm space-y-6 hidden lg:block sticky top-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Advanced Filters
            </h3>
            <button
              onClick={() => {
                setSelectedAvailability([]);
                setSelectedSkill('All');
                setMinMatchScore(0);
                setSearchQuery('');
                setVisibleCount(4);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
            >
              Reset All
            </button>
          </div>

          {/* Search box within sidebar */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Name or College</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(4);
                }}
                placeholder="Name, bio keywords, major..."
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 rounded-xl focus:outline-none placeholder-slate-400/80"
              />
            </div>
          </div>

          {/* Availability Block */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sync Availability</label>
            <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
              {['Available', 'Part-time', 'Busy'].map((status) => {
                const checked = selectedAvailability.includes(status);
                return (
                  <label key={status} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none py-1 hover:text-slate-900 transition-colors">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAvailabilityFilter(status)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="font-semibold">{status}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Skills dropdown */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Core Skill Requirement</label>
            <select
              value={selectedSkill}
              onChange={(e) => {
                setSelectedSkill(e.target.value);
                setVisibleCount(4);
              }}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none cursor-pointer font-semibold text-slate-700"
            >
              <option value="All">All Competency Tags</option>
              {allSkills.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Match Score Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fit Score Threshold</label>
              <span className="text-xs font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">≥ {minMatchScore}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minMatchScore}
              onChange={(e) => {
                setMinMatchScore(Number(e.target.value));
                setVisibleCount(4);
              }}
              className="w-full accent-indigo-600 cursor-ew-resize h-1.5 bg-slate-100 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono font-bold">
              <span>0% Off</span>
              <span>50% Mid</span>
              <span>80% Premium</span>
            </div>
          </div>

          {/* Proactive Help message built for the matching mechanism */}
          <div className="bg-indigo-50/55 p-4 rounded-xl border border-indigo-100/50 text-left space-y-1">
            <span className="text-[9.5px] font-extrabold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Overlapping Fit Index
            </span>
            <p className="text-[11px] text-indigo-600 leading-normal font-medium">
              We compare your core competencies against student showcase skills dynamically to calculate verified fitness profiles.
            </p>
          </div>
        </div>

        {/* Dynamic Mobile Filter Slide-out Drawer */}
        <AnimatePresence>
          {showFiltersMobile && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden flex justify-end"
              onClick={() => setShowFiltersMobile(false)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                onClick={(e) => e.stopPropagation()} // retain clicks
                className="w-80 bg-white h-full p-6 space-y-6 overflow-y-auto shadow-2xl flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-extrabold text-slate-850 text-sm uppercase tracking-wide flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-indigo-600" />
                      Peers Filters
                    </h3>
                    <button onClick={() => setShowFiltersMobile(false)}>
                      <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search string</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setVisibleCount(4);
                        }}
                        placeholder="Search peers..."
                        className="w-full text-xs pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Availability</label>
                    <div className="space-y-1.5">
                      {['Available', 'Part-time', 'Busy'].map((status) => (
                        <label key={status} className="flex items-center gap-2 text-xs text-slate-700">
                          <input
                            type="checkbox"
                            checked={selectedAvailability.includes(status)}
                            onChange={() => toggleAvailabilityFilter(status)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          <span className="font-semibold">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Skill Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skill Tag</label>
                    <select
                      value={selectedSkill}
                      onChange={(e) => {
                        setSelectedSkill(e.target.value);
                        setVisibleCount(4);
                      }}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="All">All Skill Types</option>
                      {allSkills.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Match score threshold for mobile */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Match Percentage</label>
                      <span className="text-xs font-mono font-bold text-indigo-600">≥ {minMatchScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      step="10"
                      value={minMatchScore}
                      onChange={(e) => {
                        setMinMatchScore(Number(e.target.value));
                        setVisibleCount(4);
                      }}
                      className="w-full h-1 bg-slate-200 accent-indigo-600 rounded-md cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-6 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedAvailability([]);
                      setSelectedSkill('All');
                      setMinMatchScore(0);
                      setSearchQuery('');
                      setVisibleCount(4);
                      setShowFiltersMobile(false);
                    }}
                    className="w-full text-xs border border-slate-200 text-slate-600 py-2.5 font-bold rounded-xl cursor-pointer"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setShowFiltersMobile(false)}
                    className="w-full text-xs bg-indigo-600 text-white py-2.5 font-bold rounded-xl cursor-pointer"
                  >
                    Apply Filter Set
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Side: Primary Directory Cards Grid */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Quick inline search header for quick inputs */}
          <div className="relative lg:hidden">
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(4);
              }}
              placeholder="Search peers by major or college (e.g. Stanford)..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-1 focus:ring-indigo-500/20 text-xs font-semibold shadow-sm placeholder-slate-400"
            />
          </div>

          {/* Results Summary banner */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing <strong className="text-slate-800 font-bold">{Math.min(filteredStudents.length, visibleCount)}</strong> of <strong className="text-slate-900 font-extrabold">{filteredStudents.length}</strong> qualified student partners</span>
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setVisibleCount(4);
                }}
                className="text-indigo-600 font-bold hover:underline"
              >
                Clear Search
              </button>
            )}
          </div>

          {/* Student representation grid list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredStudents.slice(0, visibleCount).map((student) => {
                const isConnected = connectedIds.includes(student.id);
                const score = student.matchScore || calculateFallbackScore(me, student);
                
                // Categorize fit rating
                const scoreTier = 
                  score >= 90 ? { label: 'Excellent Match', bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700', fill: 'bg-emerald-500' } :
                  score >= 80 ? { label: 'Strong Fit', bg: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-700', fill: 'bg-indigo-500' } :
                  { label: 'Complementary Fit', bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700', fill: 'bg-amber-500' };

                // Find overlaps with my competencies
                const mutualSkills = student.skills.filter(s => 
                  me.skills.some(my => my.toLowerCase() === s.toLowerCase())
                );
                const complementarySkills = student.skills.filter(s => 
                  !me.skills.some(my => my.toLowerCase() === s.toLowerCase())
                );

                return (
                  <motion.div
                    key={student.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedStudent(student)}
                    className="bg-white border border-slate-150/80 hover:border-indigo-100 p-5 rounded-2xl transition-all hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden"
                  >
                    
                    {/* Top match score accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-50 group-hover:bg-indigo-100 transition-colors" />

                    <div>
                      {/* Top header row */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {/* Colored dynamic styled initial avatar */}
                          <div className={`w-11 h-11 rounded-2xl text-white font-extrabold font-sans text-sm flex items-center justify-center shadow-sm ${
                            student.id === 's1' ? 'bg-indigo-500' :
                            student.id === 's2' ? 'bg-amber-500' :
                            student.id === 's3' ? 'bg-emerald-500' :
                            student.id === 's4' ? 'bg-rose-500' : 
                            student.id === 's5' ? 'bg-purple-500' : 'bg-blue-650'
                          }`}>
                            {student.avatar}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 text-xs md:text-sm group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                              {student.name}
                            </h3>
                            <p className="text-slate-400 text-[10px] font-bold flex items-center gap-1 leading-none mt-1">
                              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                              {student.university}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Match score pill widget */}
                        <div className={`px-2 py-1 rounded-xl border text-center shrink-0 ${scoreTier.bg}`}>
                          <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wide leading-none mb-0.5">Match Index</span>
                          <span className={`text-sm font-black font-mono leading-none ${scoreTier.text}`}>{score}%</span>
                        </div>
                      </div>

                      {/* Major indicators and year */}
                      <div className="mt-3 flex items-center gap-2">
                        <div className="text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-150/50 inline-block px-2.5 py-0.8 rounded-lg">
                          {student.major}
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50/50 px-2 py-0.8 rounded-lg">
                          {student.year}
                        </span>
                      </div>

                      {/* Brief bio paragraph */}
                      <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed font-medium">
                        {student.bio}
                      </p>

                      {/* Shared & Complementary Competency breakdown */}
                      <div className="mt-3.5 space-y-2 pt-2 border-t border-dashed border-slate-100">
                        
                        {/* Complementary skills is great to find match value */}
                        {complementarySkills.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-wider block mr-1">Taps:</span>
                            {complementarySkills.slice(0, 3).map((item) => (
                              <span 
                                key={item} 
                                className="text-[9.5px] bg-slate-50 border border-slate-150/60 text-slate-650 font-bold px-2 py-0.5 rounded-md"
                              >
                                {item}
                              </span>
                            ))}
                            {complementarySkills.length > 3 && (
                              <span className="text-[9.5px] text-slate-400 font-bold px-1 select-none">
                                +{complementarySkills.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Overlaps / Mutual skills */}
                        {mutualSkills.length > 0 && (
                          <div className="flex items-center gap-1.5 bg-emerald-50/40 p-1.5 rounded-lg border border-emerald-100/30 text-[9px] text-emerald-800 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>Overlapping expertise: <strong>{mutualSkills.join(', ')}</strong></span>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Bottom Action Footer strip */}
                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className={`font-semibold text-[11px] ${
                          student.availability === 'Available' ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50' :
                          student.availability === 'Part-time' ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/50' :
                          'text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-150/50'
                        }`}>{student.availability}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          id={`connect-btn-s-${student.id}`}
                          onClick={(e) => handleConnect(student.id, e)}
                          className={`text-xs px-3 py-1.5 font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 ${
                            isConnected 
                              ? 'bg-slate-150 text-slate-400 border border-slate-200 select-none' 
                              : 'bg-indigo-50 text-indigo-700 hover:bg-slate-900 hover:text-white border border-indigo-100'
                          }`}
                        >
                          {isConnected ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5 animate-pulse" />}
                          {isConnected ? 'Sent' : 'Sync Request'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartChat(student);
                          }}
                          className="bg-slate-800 text-white hover:bg-indigo-650 p-2 text-xs rounded-xl transition-colors cursor-pointer border border-slate-700"
                          title="Message Partner"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {filteredStudents.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center p-12 bg-white rounded-2xl border border-slate-100/80 shadow-sm">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-extrabold text-slate-800 text-sm mb-1">No Academic Peers Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                  Try lowering your match compatibility score or clearing the search fields.
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedAvailability([]);
                    setSelectedSkill('All');
                    setMinMatchScore(0);
                    setVisibleCount(4);
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Clear Active Filters
                </button>
              </div>
            )}
          </div>

          {/* Sticky target bottom infinite scrolling loader OR Button trigger */}
          {filteredStudents.length > visibleCount && (
            <div 
              ref={loadingTriggerRef}
              className="py-6 flex flex-col justify-center items-center gap-2 border border-slate-100 bg-slate-50/50 rounded-2xl text-center p-4"
            >
              <AnimatePresence mode="wait">
                {isLoadingMore ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" strokeWidth="2.5" />
                    <span className="text-xs font-mono font-bold text-indigo-700">Recalculating match scores and streaming peers...</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-2 w-full"
                  >
                    <p className="text-xs text-slate-400 font-medium">
                      Scroll down slightly or press lower command to fetch remaining student profiles.
                    </p>
                    <button 
                      onClick={triggerLoadMore}
                      type="button"
                      className="px-5 py-2.5 bg-slate-805 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-indigo-650 transition-colors shadow-sm"
                    >
                      Stream More Peers Cards Sync
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Slide-out Student Detailed Profile Drawer (/student/{id}) */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={() => setSelectedStudent(null)}>
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()} // retain drawer click target
              className="w-full max-w-md md:max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-6">
                
                {/* Drawer header segment */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase text-indigo-600 tracking-wider flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                    Verified Partnership Audit Profile
                  </span>
                  <button 
                    onClick={() => setSelectedStudent(null)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Hero profile cards body */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-150 flex items-start gap-4 shadow-inner relative">
                  <div className={`w-14 h-14 rounded-2xl text-white font-black text-lg flex items-center justify-center shrink-0 shadow ${
                    selectedStudent.id === 's1' ? 'bg-indigo-500' :
                    selectedStudent.id === 's2' ? 'bg-amber-500' :
                    selectedStudent.id === 's3' ? 'bg-emerald-500' :
                    selectedStudent.id === 's4' ? 'bg-rose-500' : 
                    selectedStudent.id === 's5' ? 'bg-purple-500' : 'bg-indigo-600'
                  }`}>
                    {selectedStudent.avatar}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="text-base font-bold text-slate-900 leading-none">{selectedStudent.name}</h2>
                      <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-1.5 py-0.5 rounded border border-blue-250">
                        SYNC VERIFIED
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 block leading-none pt-0.5">{selectedStudent.email}</span>
                    <p className="text-xs text-slate-600 font-bold flex items-center gap-1 pt-1.5">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      {selectedStudent.university}
                    </p>
                  </div>
                </div>

                {/* Major/Year Metadata panels */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3.5 bg-slate-50 border border-slate-150/70 rounded-xl">
                    <span className="text-[10px] text-slate-400 block uppercase font-black tracking-wide mb-1 leading-none">Academic Major</span>
                    <span className="text-xs font-bold text-slate-700">{selectedStudent.major}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-150/70 rounded-xl">
                    <span className="text-[10px] text-slate-400 block uppercase font-black tracking-wide mb-1 leading-none">Class Standing</span>
                    <span className="text-xs font-bold text-slate-700">{selectedStudent.year}</span>
                  </div>
                </div>

                {/* Bio detail information */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Aesthetic student biography:</h4>
                  <p className="text-xs leading-relaxed text-slate-600 bg-white p-4 rounded-xl border border-slate-100 text-justify font-medium">
                    {selectedStudent.bio}
                  </p>
                </div>

                {/* Score breakdown metrics card */}
                <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 text-indigo-850">
                      <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" style={{ animationDuration: '6s' }} />
                      Direct Overlap Fit Calculation
                    </span>
                    <span className="text-sm font-black font-mono text-indigo-700 bg-white/80 px-2 py-0.5 rounded border border-indigo-100">
                      {selectedStudent.matchScore || calculateFallbackScore(me, selectedStudent)}% Efficiency
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-600 leading-normal font-semibold">
                    Highly compatible matching indices based on mutual interest tags, university alignment, and complementary availability timings!
                  </p>
                </div>

                {/* Skills indicators with mutual/shared highlighting */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Skills Inventory Assessment:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.skills.map(s => {
                      const hasMutual = me.skills.some(my => my.toLowerCase() === s.toLowerCase());
                      return (
                        <span 
                          key={s} 
                          className={`text-xs px-3 py-1.5 font-bold rounded-xl flex items-center gap-1 border ${
                            hasMutual 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                              : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                          }`}
                        >
                          {hasMutual ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Award className="w-3.5 h-3.5 text-indigo-400" />}
                          {s}
                          {hasMutual && <span className="text-[8px] bg-emerald-100 px-1 rounded text-emerald-700 uppercase font-black font-sans ml-1">Shared</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Interests layout tags */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Academic Fields of study:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.interests.map(i => (
                      <span key={i} className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-lg uppercase tracking-wide">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action commands row */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3 mt-6">
                <button
                  id={`drawer-connect-btn-sc-${selectedStudent.id}`}
                  onClick={(e) => {
                    handleConnect(selectedStudent.id, e);
                  }}
                  className={`flex-1 py-3 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    connectedIds.includes(selectedStudent.id)
                      ? 'bg-slate-100 border border-slate-200 text-slate-400 select-none'
                      : 'bg-indigo-650 hover:bg-slate-900 text-white shadow'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  {connectedIds.includes(selectedStudent.id) ? 'Partnership Requested' : 'Send Sync Partnership Invite'}
                </button>
                
                <button
                  onClick={() => {
                    handleStartChat(selectedStudent);
                    setSelectedStudent(null);
                  }}
                  className="bg-slate-800 text-white hover:bg-slate-900 px-4 py-3 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-700"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
