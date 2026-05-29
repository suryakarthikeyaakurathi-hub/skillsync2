import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Student, Project } from '../types';
import { MOCK_STUDENTS, MOCK_PROJECTS } from '../data';
import { 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Activity, 
  Trophy, 
  Users, 
  Plus, 
  Calendar, 
  Bell,
  Search,
  ChevronDown,
  X,
  RefreshCw,
  Brain,
  MessageSquare,
  Lock,
  ArrowRight,
  Code,
  GraduationCap,
  ExternalLink,
  Zap,
  Flame,
  Layout,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  me: Student;
  onChangeMe: (updated: Student) => void;
}

type DepartmentType = 'all' | 'cs' | 'design' | 'phd';

export default function DashboardView({ me, onChangeMe }: Props) {
  // General State Controls
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [department, setDepartment] = useState<DepartmentType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLookupDropdown, setShowLookupDropdown] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<Project | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Hardcoded updates feed tracking dynamic campus milestones
  const [updates, setUpdates] = useState([
    { id: 'up1', studentName: 'Sarah Jenkins', action: 'updated primary skills', detail: 'Added PyTorch & HuggingFace models', time: '12 min ago', studentId: 's1' },
    { id: 'up2', studentName: 'Jin-Woo Park', action: 'created a new project', detail: 'Aegis: Decentralized Identity', time: '2 hours ago', studentId: 's2' },
    { id: 'up3', studentName: 'Maya Lin', action: 'marked system status as available', detail: 'Seeking mobile development partners', time: '4 hours ago', studentId: 's3' },
    { id: 'up4', studentName: 'Alex Chen', action: 'posted in community forum', detail: 'Recruiting for FinTech challenge', time: '1 day ago', studentId: 's4' }
  ]);

  const [checklist, setChecklist] = useState([
    { id: '1', task: 'Verify student email credentials', completed: true },
    { id: '2', task: 'Complete dynamic bio detailing student goals', completed: true },
    { id: '3', task: 'Select at least 5 technical core competencies', completed: true },
    { id: '4', task: 'Attach university interests & departments', completed: false },
    { id: '5', task: 'Initiate or apply for a collaboration project', completed: false }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'Sarah Jenkins sent a connection invite', time: '10m ago', unread: true },
    { id: 'n2', title: 'Your system match score with Jin-Woo is now 89%', time: '2h ago', unread: true },
    { id: 'n3', title: 'Hackathon Crusaders posted a new announcement', time: '1d ago', unread: false }
  ]);

  const [newEventText, setNewEventText] = useState('');
  const [events, setEvents] = useState([
    { id: 'e1', title: 'Campus AI Pitch Presentation', date: 'June 5, 2026', type: 'Competition' },
    { id: 'e2', title: 'Invention & Hackathon Challenge', date: 'June 18, 2026', type: 'Hackathon' }
  ]);

  // Handle outside click to close dropdown lookahead
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowLookupDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simulate initial load & hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingFeed(false);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  // Re-trigger live sync mock
  const handleFullDatabaseSync = () => {
    setIsLoadingFeed(true);
    setTimeout(() => {
      setIsLoadingFeed(false);
    }, 1200);
  };

  // Toggle checklist completed milestones
  const toggleChecklist = (id: string) => {
    setChecklist(
      checklist.map((item) => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const completionPercent = Math.round((completedCount / checklist.length) * 100);

  // Set your availability
  const toggleAvailability = (status: 'Available' | 'Busy' | 'Part-time') => {
    onChangeMe({ ...me, availability: status });
  };

  // Handle Event submission
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventText.trim()) return;
    setEvents([
      ...events,
      {
        id: Date.now().toString(),
        title: newEventText,
        date: 'June 29, 2026',
        type: 'Team Milestone'
      }
    ]);
    setNewEventText('');
  };

  // Remove skill
  const removeSkill = (skill: string) => {
    onChangeMe({
      ...me,
      skills: me.skills.filter((s) => s !== skill)
    });
  };

  const addSkillToProfile = (skill: string) => {
    if (!me.skills.includes(skill)) {
      onChangeMe({
        ...me,
        skills: [...me.skills, skill]
      });
    }
  };

  // Autocomplete Lookahead Filter logic
  const lookaheadResults = useMemo(() => {
    if (!searchQuery.trim()) return { students: [], projects: [] };

    const q = searchQuery.toLowerCase();

    const filteredStudents = MOCK_STUDENTS.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.major.toLowerCase().includes(q) || 
      s.skills.some(skill => skill.toLowerCase().includes(q))
    );

    const filteredProjects = MOCK_PROJECTS.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) || 
      p.skillsNeeded.some(sku => sku.toLowerCase().includes(q))
    );

    return {
      students: filteredStudents,
      projects: filteredProjects
    };
  }, [searchQuery]);

  // Derived metrics based on Department Filter Hook
  const departmentStats = useMemo(() => {
    switch (department) {
      case 'cs':
        return {
          syncedPeers: '8',
          sharedProjects: '3',
          matchLevel: '94%',
          skills: ['Python', 'Docker', 'NextJS', 'PyTorch', 'TypeScript', 'Express'],
          hotSkill: 'Python',
          hotSkillRatio: '84% adoption'
        };
      case 'design':
        return {
          syncedPeers: '4',
          sharedProjects: '1',
          matchLevel: '89%',
          skills: ['Figma', 'UI Design', 'User Research', 'React Native', 'Aesthetics'],
          hotSkill: 'Figma',
          hotSkillRatio: '91% adoption'
        };
      case 'phd':
        return {
          syncedPeers: '2',
          sharedProjects: '0',
          matchLevel: '78%',
          skills: ['R Studio', 'Machine Learning', 'Data Viz', 'Academic Research'],
          hotSkill: 'Machine Learning',
          hotSkillRatio: '72% adoption'
        };
      case 'all':
      default:
        return {
          syncedPeers: '14',
          sharedProjects: '4',
          matchLevel: '88%',
          skills: ['Figma', 'Python', 'Docker', 'WebRTC', 'Go', 'NextJS'],
          hotSkill: 'React & TS',
          hotSkillRatio: '96% adoption'
        };
    }
  }, [department]);

  return (
    <div className="space-y-6">

      {/* 1. Header Lookahead Search Frame (Horizontal Action Row) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Dynamic Sync Trigger Controls */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layout className="w-5 h-5 text-blue-600" />
              <span>Campus Sync Hub</span>
            </h1>
            <p className="text-xs text-slate-500">Coordinate and bridge skills with verified academic peers.</p>
          </div>
          
          <button 
            type="button"
            onClick={handleFullDatabaseSync}
            disabled={isLoadingFeed}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl border border-slate-100 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
            title="Refresh database feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFeed ? 'animate-spin text-blue-600' : ''}`} />
            <span>Sync</span>
          </button>
        </div>

        {/* Autocomplete Input Anchor */}
        <div ref={searchContainerRef} className="relative w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Look up skills, peers, projects..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowLookupDropdown(true);
              }}
              onFocus={() => setShowLookupDropdown(true)}
              className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 pl-11 pr-10 py-2.5 rounded-xl text-xs font-sans focus:outline-none transition-all placeholder:text-slate-400 font-medium shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* SUGGESTION LOOKAHEAD DROPDOWN BLOCK */}
          <AnimatePresence>
            {showLookupDropdown && searchQuery.trim() && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute inset-x-0 mt-2 bg-white rounded-xl border border-slate-200/90 shadow-2xl z-50 overflow-hidden max-h-96"
              >
                {/* Header label */}
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Match lookup findings</span>
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">Realtime</span>
                </div>

                <div className="overflow-y-auto max-h-80 p-2 space-y-3">
                  
                  {/* Category A: Peers */}
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wide">Campus Peers</span>
                    {lookaheadResults.students.length > 0 ? (
                      <div className="space-y-1 mt-1">
                        {lookaheadResults.students.map(student => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => {
                              setSelectedStudentDetail(student);
                              setShowLookupDropdown(false);
                            }}
                            className="w-full text-left p-2 rounded-lg hover:bg-blue-50/50 transition-colors flex items-center gap-3 cursor-pointer group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                              {student.avatar}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors leading-none mb-1">{student.name}</span>
                              <span className="text-[10px] text-slate-400 truncate block">{student.major} • {student.university}</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                              {student.matchScore || 85}% Matches
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic px-2 block mt-1">No synced peers match lookup</span>
                    )}
                  </div>

                  {/* Category B: Projects */}
                  <div className="pt-2 border-t border-slate-50">
                    <span className="block text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wide">Campus Projects</span>
                    {lookaheadResults.projects.length > 0 ? (
                      <div className="space-y-1 mt-1">
                        {lookaheadResults.projects.map(proj => (
                          <button
                            key={proj.id}
                            type="button"
                            onClick={() => {
                              setSelectedProjectDetail(proj);
                              setShowLookupDropdown(false);
                            }}
                            className="w-full text-left p-2 rounded-lg hover:bg-indigo-50/50 transition-colors flex items-center gap-3 cursor-pointer group animate-fade-in"
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
                              PR
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors leading-none mb-1">{proj.title}</span>
                              <span className="text-[10px] text-slate-400 block truncate">{proj.category} • {proj.membersCount} Synced</span>
                            </div>
                            <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                              {proj.openRolesCount} role(s)
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic px-2 block mt-1">No team projects match query</span>
                    )}
                  </div>

                </div>

                {/* Footer action tip */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 font-medium">Tips: Press ESC or click outside to dismiss result panel</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* 2. Top Welcome Hero Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 md:p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-48 h-48 rounded-full bg-teal-500/10 blur-xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              Active Hub Session
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {me.name}!
            </h1>
            <p className="text-blue-100 text-xs">
              Academic Institute of Technology • {me.major}
            </p>
          </div>

          {/* Quick status controls */}
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10 w-full md:w-auto md:min-w-xs">
            <p className="text-xs text-blue-200 font-semibold mb-2.5 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              Set Your Campus Availability Status:
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Available', 'Part-time', 'Busy'] as const).map((status) => {
                const isActive = me.availability === status;
                const activeColor = 
                  status === 'Available' ? 'bg-emerald-500 text-white font-semibold' :
                  status === 'Part-time' ? 'bg-amber-500 text-white font-semibold' : 
                  'bg-rose-500 text-white font-semibold';

                return (
                  <button
                    key={status}
                    onClick={() => toggleAvailability(status)}
                    className={`px-2.5 py-1.5 text-[11px] rounded-lg transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? `${activeColor} shadow-md` 
                        : 'bg-white/5 hover:bg-white/15 text-white/85'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-blue-200/95 pt-1 border-t border-white/5">
              <span>Status check:</span>
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${
                  me.availability === 'Available' ? 'bg-emerald-400 animate-ping' :
                  me.availability === 'Part-time' ? 'bg-amber-400' : 'bg-rose-400'
                }`}></span>
                <span className="font-bold text-white">{me.availability}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC SKELETON FEED SECTION (Grid Bento-boxes) */}
      <AnimatePresence mode="wait">
        {isLoadingFeed ? (
          <motion.div 
            key="skeleton-frame" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Skeletal Card 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 animate-pulse">
              <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="h-3.5 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-2.5 bg-slate-100 rounded w-4/5"></div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200"></div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5"></div>
              <div className="space-y-3">
                <div className="h-8 bg-slate-100/70 rounded-lg"></div>
                <div className="h-8 bg-slate-100/70 rounded-lg"></div>
                <div className="h-8 bg-slate-100/70 rounded-lg"></div>
              </div>
            </div>

            {/* Skeletal Card 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                <div className="h-3 bg-slate-100 rounded w-5/6"></div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <div className="h-7 w-20 bg-slate-100 rounded-lg"></div>
                <div className="h-7 w-24 bg-slate-100 rounded-lg"></div>
                <div className="h-7 w-16 bg-slate-100 rounded-lg"></div>
                <div className="h-7 w-28 bg-slate-100 rounded-lg"></div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
                <div className="h-10 bg-slate-100 rounded-lg"></div>
                <div className="h-10 bg-slate-100 rounded-lg"></div>
                <div className="h-10 bg-slate-100 rounded-lg"></div>
              </div>
            </div>

            {/* Skeletal Card 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 animate-pulse">
              <div className="flex items-center justify-between pb-2">
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-3 bg-slate-100 rounded w-8"></div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="h-12 bg-slate-100/80 rounded-xl"></div>
                <div className="h-12 bg-slate-100/80 rounded-xl"></div>
                <div className="h-12 bg-slate-100/80 rounded-xl"></div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="real-feed-frame"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            
            {/* BENTO CARD 1: Interactive Profile Strengths Checklist */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Sync Profile Maturity</h2>
                    <p className="text-xs text-slate-400">Maximize match lookup discoveries</p>
                  </div>
                  <span className="text-blue-600 font-extrabold text-2xl font-mono">{completionPercent}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 mb-5 overflow-hidden">
                  <motion.div 
                    className="bg-blue-600 h-2 rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercent}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                {/* Interactive Tasks */}
                <div className="space-y-2.5">
                  {checklist.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => toggleChecklist(item.id)}
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4.5 h-4.5 text-slate-300 group-hover:text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-xs text-slate-600 leading-normal transition-all ${item.completed ? 'line-through text-slate-400 font-light' : 'font-semibold'}`}>
                        {item.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 text-center">
                <span className="text-[10px] text-slate-400 font-medium">
                  💡 Clicking milestones instantly recalibrates profile strength score.
                </span>
              </div>
            </div>

            {/* BENTO CARD 2: Your Skills Showcase & Department Switcher Hook */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Your Showcase Matrix</h2>
                  
                  {/* DEPARTMENT HOOK DROPDOWN */}
                  <div className="relative">
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value as DepartmentType)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 py-1 pl-2 pr-6 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">🌐 All Spheres</option>
                      <option value="cs">💻 Computer Science</option>
                      <option value="design">🎨 UI/UX & Design</option>
                      <option value="phd">🧬 Research / PhD</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-4">Interactive tag selection updates matching indicators dynamically.</p>
                
                {/* My Active Skills Collection */}
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1 pb-1">
                  <AnimatePresence>
                    {me.skills.map((skill) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-100/50"
                      >
                        {skill}
                        <button 
                          onClick={() => removeSkill(skill)}
                          className="hover:bg-blue-100 text-blue-500 hover:text-blue-800 font-bold ml-1 rounded px-0.5 select-none"
                          title="Erase Competency"
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  {me.skills.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">No competencies selected. Click popular below tag!</span>
                  )}
                </div>

                {/* Popular department competencies */}
                <div className="mt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Popular Competencies:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {departmentStats.skills.map((skill) => {
                      const alreadyHas = me.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          onClick={() => addSkillToProfile(skill)}
                          disabled={alreadyHas}
                          className={`text-[10px] font-semibold px-2 py-0.8 rounded-md border transition-all cursor-pointer ${
                            alreadyHas 
                              ? 'bg-slate-50 text-slate-350 border-slate-100 cursor-not-allowed'
                              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200/80 active:scale-95'
                          }`}
                        >
                          + {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Department Statistics Syncing Indicators */}
              <div className="grid grid-cols-3 gap-1.5 pt-4 border-t border-slate-100">
                <div className="text-center p-1.5 rounded-xl bg-slate-50 border border-slate-100/70">
                  <span className="block text-md font-extrabold text-blue-600 font-mono">{departmentStats.syncedPeers}</span>
                  <span className="text-[9px] text-slate-400 font-bold">Peers</span>
                </div>
                <div className="text-center p-1.5 rounded-xl bg-slate-50 border border-slate-100/70">
                  <span className="block text-md font-extrabold text-emerald-600 font-mono">{departmentStats.sharedProjects}</span>
                  <span className="text-[9px] text-slate-400 font-bold">Projects</span>
                </div>
                <div className="text-center p-1.5 rounded-xl bg-slate-50 border border-slate-100/70">
                  <span className="block text-md font-extrabold text-amber-600 font-mono">{departmentStats.matchLevel}</span>
                  <span className="text-[9px] text-slate-400 font-bold">Accuracy</span>
                </div>
              </div>
            </div>

            {/* BENTO CARD 3: Recent Activity & Live Updates Feed */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                    <Clock className="w-4.5 h-4.5 text-blue-600" />
                    Student Activity Feed
                  </h2>
                  <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Recent
                  </span>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {updates.map((up) => (
                    <div 
                      key={up.id}
                      onClick={() => {
                        // Attempt to locate student object in mock data to display details modal
                        const peer = MOCK_STUDENTS.find(s => s.id === up.studentId);
                        if (peer) setSelectedStudentDetail(peer);
                      }}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 text-xs cursor-pointer transition-all flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{up.studentName}</span>
                        <span className="text-[9px] text-slate-400">{up.time}</span>
                      </div>
                      <p className="text-slate-500 font-medium">{up.action}: <span className="text-slate-600 font-semibold">{up.detail}</span></p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-[10px] text-slate-400">
                <span>Updates synchronize live</span>
                <span className="flex items-center gap-1 text-blue-500 font-semibold">
                  <span>Connection status: Offline resilient</span>
                </span>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Trending Metrics Card Widget Row (Hot Stack Bar Meter) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Metric 1: Campus Hot Stack adoption visual indexes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="font-extrabold text-slate-850 text-sm uppercase tracking-wide flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                Technical Adoption Stack index
              </h2>
              <p className="text-xs text-slate-400">Proportion of campus directories containing specified assets</p>
            </div>
            
            <span className="text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-bold">
              {departmentStats.hotSkill}
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>TypeScript & React</span>
                <span>94%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '94%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Python & PyTorch</span>
                <span>81%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '81%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Go & backend microservices</span>
                <span>55%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '55%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2: Live Notifications Alert feed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                <Bell className="w-4.5 h-4.5 text-blue-600" />
                Live Notification Feed
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold text-[10px]">
                {notifications.filter(n => n.unread).length} New
              </span>
            </div>

            <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => {
                    setNotifications(notifications.map(n => n.id === notif.id ? { ...n, unread: false } : n));
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    notif.unread 
                      ? 'bg-blue-50/50 border-blue-100 text-blue-900 font-semibold' 
                      : 'bg-white border-slate-100 text-slate-550 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 justify-between">
                    <span className="line-clamp-1">{notif.title}</span>
                    {notif.unread && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>}
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{notif.time}</span>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setNotifications(notifications.map(n => ({...n, unread: false})))}
            className="w-full text-center text-xs text-indigo-650 hover:text-indigo-800 font-bold cursor-pointer py-1.5 mt-3 hover:bg-indigo-50/30 rounded-lg transition-colors border border-dashed border-indigo-200"
          >
            Mark all notification logs as read
          </button>
        </div>

      </div>

      {/* 5. Bottom Section: Milestones Timeline + Playbook */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Event Timeline creator */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <div>
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                <Calendar className="w-4.5 h-4.5 text-indigo-600" />
                Active Campus Milestones
              </h2>
              <p className="text-xs text-slate-400">Sync with deadlines and student mixers happening this term</p>
            </div>
            
            <form onSubmit={handleAddEvent} className="flex gap-1.5 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Declare a milestone..."
                value={newEventText}
                onChange={(e) => setNewEventText(e.target.value)}
                className="text-xs border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 px-3 py-1.5 rounded-xl w-full sm:w-44 focus:outline-none"
              />
              <button 
                type="submit"
                className="bg-blue-650 hover:bg-blue-700 text-white rounded-xl px-3 py-2 flex items-center justify-center cursor-pointer shadow-sm hover:shadow transition-all text-xs shrink-0 font-bold"
              >
                <Plus className="w-3.5 h-3.5 mr-0.5" /> Add
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {events.map((evt) => (
              <div 
                key={evt.id} 
                className="group relative bg-slate-50/50 hover:bg-white border border-slate-100/70 hover:border-slate-200/90 p-4 rounded-xl transition-all shadow-sm"
              >
                <div className="absolute top-3 right-3 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                  {evt.type}
                </div>
                <div className="mb-1 text-[10px] text-slate-400 font-mono font-medium">
                  {evt.date}
                </div>
                <h3 className="font-bold text-slate-700 text-xs leading-snug group-hover:text-slate-900 transition-colors">
                  {evt.title}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* Playbook Card */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5 text-blue-200">
              <Trophy className="w-4.5 h-4.5 text-amber-400" />
              SkillSync Playbook
            </h2>
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800/80 flex items-center justify-center text-[10px] font-bold text-indigo-300 shrink-0">1</span>
                <p><strong className="text-white">Profile Maturing:</strong> Add complete tech stacks to maximize placement on peer lookup scorecards.</p>
              </div>
              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800/80 flex items-center justify-center text-[10px] font-bold text-indigo-300 shrink-0">2</span>
                <p><strong className="text-white">Live Availability:</strong> Toggle flag status to <span className="text-emerald-400 font-semibold">Available</span> during project sprints.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[10px] text-slate-400">
            Authenticated: <span className="text-blue-300 font-mono select-all">{me.email}</span>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 6. MODALS OVERLAYS FOR SEARCH / ACTIVITY SELECTIONS      */}
      {/* ========================================================= */}
      
      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudentDetail && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 relative overflow-hidden"
            >
              {/* Absolute background accent */}
              <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              
              <button 
                onClick={() => setSelectedStudentDetail(null)}
                className="absolute top-4 right-4 bg-white/25 hover:bg-white/40 text-white rounded-full p-1.5 transition-colors cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative pt-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md mb-3">
                  <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-black text-2xl flex items-center justify-center rounded-xl uppercase">
                    {selectedStudentDetail.avatar}
                  </div>
                </div>

                <h3 className="font-extrabold text-lg text-slate-900 leading-tight mb-1">{selectedStudentDetail.name}</h3>
                <span className="text-xs text-blue-600 font-bold mb-1.5">{selectedStudentDetail.major}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{selectedStudentDetail.university} • {selectedStudentDetail.year}</span>
                
                <div className="my-4 w-full h-px bg-slate-100"></div>

                <div className="w-full text-left space-y-4">
                  {/* Bio */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Peer Bio & Ambition</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedStudentDetail.bio || "No biography specifications declared yet."}</p>
                  </div>

                  {/* Skills tags */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Technical Core Competencies</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedStudentDetail.skills?.map(skill => (
                        <span key={skill} className="px-2 py-0.8 bg-blue-50 text-blue-700 border border-blue-100/50 font-bold text-[10px] rounded-lg">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Interests tags */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Academic Interests</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedStudentDetail.interests?.map(interest => (
                        <span key={interest} className="px-2 py-0.8 bg-emerald-50 text-emerald-700 border border-emerald-100/50 font-bold text-[10px] rounded-lg animate-fade-in">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-500">University Availability:</span>
                    <span className="flex items-center gap-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        selectedStudentDetail.availability === 'Available' ? 'bg-emerald-500 animate-pulse' :
                        selectedStudentDetail.availability === 'Part-time' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      <span className="text-xs font-black text-slate-800">{selectedStudentDetail.availability}</span>
                    </span>
                  </div>

                </div>

                <div className="mt-6 w-full flex gap-3">
                  <button 
                    onClick={() => {
                      alert(`Mock Connection Dispatch: Invite transmitted to ${selectedStudentDetail.email}!`);
                      setSelectedStudentDetail(null);
                    }}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-colors"
                  >
                    Transmit Partner Invite
                  </button>
                  <button 
                    onClick={() => {
                      alert(`Direct messaging is available via the Messages Tab.`);
                      setSelectedStudentDetail(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    Message
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProjectDetail && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 relative"
            >
              <button 
                onClick={() => setSelectedProjectDetail(null)}
                className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full p-1.5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                  <span>{selectedProjectDetail.category}</span>
                </div>

                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 leading-tight">{selectedProjectDetail.title}</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Conceived by: {selectedProjectDetail.creatorName} • Posted {selectedProjectDetail.createdAt}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedProjectDetail.description}
                </p>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Talent Requirements</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedProjectDetail.skillsNeeded?.map(sku => (
                      <span key={sku} className="px-2 py-0.8 bg-indigo-50 text-indigo-700 border border-indigo-100/50 font-bold text-[10px] rounded-lg">
                        {sku}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold text-[9px] uppercase">Synced Members</span>
                    <span className="text-slate-700 font-black">{selectedProjectDetail.membersCount} participants</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[9px] uppercase">Open Roles Vacancy</span>
                    <span className="text-indigo-600 font-black">{selectedProjectDetail.openRolesCount} role(s)</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    onClick={() => {
                      alert(`Success! Your join request has been sent to creator ${selectedProjectDetail.creatorName}.`);
                      setSelectedProjectDetail(null);
                    }}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-colors"
                  >
                    Request to Join Initiative
                  </button>
                  <button 
                    onClick={() => setSelectedProjectDetail(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors text-center"
                  >
                    Dismiss Details
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
