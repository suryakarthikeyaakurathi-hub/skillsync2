import React, { useState, useMemo, useEffect } from 'react';
import { Student, Project, PortfolioItem } from '../types';
import { db } from '../firebase';
import { onSnapshot, collection } from 'firebase/firestore';
import { 
  User, 
  Github, 
  Linkedin, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Star, 
  GitFork, 
  ChevronRight, 
  Sparkles, 
  Award, 
  Activity, 
  CheckCircle2, 
  Code, 
  BookOpen, 
  Briefcase,
  Layers,
  Heart,
  TrendingUp,
  Globe,
  Settings,
  PenTool,
  Save,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  me: Student;
  onChangeMe: (updated: Student) => void;
}

export default function ProfileView({ me, onChangeMe }: Props) {
  // Bio counter and edit controls
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState(me.bio);
  const [editedMajor, setEditedMajor] = useState(me.major);
  const [editedYear, setEditedYear] = useState(me.year);

  // Skill proficiency state - map skills to proficiency (Expert, Intermediate, Beginner)
  const [skillsProficiency, setSkillsProficiency] = useState<Record<string, 'Expert' | 'Intermediate' | 'Beginner'>>(() => {
    if (me.skillsProficiency) return me.skillsProficiency;
    const initial: Record<string, 'Expert' | 'Intermediate' | 'Beginner'> = {};
    if (me.skills) {
      me.skills.forEach(skill => {
        initial[skill] = 'Intermediate';
      });
    }
    return initial;
  });

  // Track state of mock project showcase portfolio items
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(() => {
    if (me.portfolio) return me.portfolio;
    if (me.id === 'me') {
      return [
        {
          id: 'pft1',
          title: 'academic-peer-sync',
          description: 'A modern PWA mapping system using React and responsive algorithms to sync student skills.',
          stars: 12,
          forks: 3,
          language: 'TypeScript',
          langColor: '#3178c6',
          link: 'https://github.com/student/academic-peer-sync'
        },
        {
          id: 'pft2',
          title: 'decentralized-auth-service',
          description: 'Interactive OAuth authorization wrapper using public APIs for university authentication servers.',
          stars: 8,
          forks: 1,
          language: 'Go',
          langColor: '#00ADD8',
          link: 'https://github.com/student/decentralized-auth-service'
        },
        {
          id: 'pft3',
          title: 'campus-housing-scaper',
          description: 'A python web crawler parsing and analyzing pricing configurations around campuses.',
          stars: 4,
          forks: 0,
          language: 'Python',
          langColor: '#3572A5',
          link: 'https://github.com/student/campus-housing-scraper'
        }
      ];
    }
    return [];
  });

  // Showcase item creation state
  const [showAddShowcase, setShowAddShowcase] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLang, setNewLang] = useState('TypeScript');
  const [newStars, setNewStars] = useState(0);

  // Interactive skill search / add input
  const [skillSearch, setSkillSearch] = useState('');
  const [suggestedSkills] = useState(['NextJS', 'Express', 'TailwindCSS', 'GraphQL', 'MongoDB', 'PyTorch', 'Rust']);

  // Character thresholds for bio analysis
  const maxBioChar = 300;
  const bioCharCount = editedBio.length;

  const bioStatus = useMemo(() => {
    if (bioCharCount === 0) {
      return { rating: 'Empty profile description', color: 'text-rose-500', bg: 'bg-rose-50 border-rose-100', ratingClass: 'danger' };
    }
    if (bioCharCount < 60) {
      return { rating: 'Very brief - Add more keywords to boost matches', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', ratingClass: 'warning' };
    }
    if (bioCharCount <= 220) {
      return { rating: 'Excellent length & keyword index', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-150', ratingClass: 'success' };
    }
    return { rating: 'Getting detailed! Keep it highly scannable', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-150', ratingClass: 'info' };
  }, [bioCharCount]);

  // Handle profile save
  const handleSaveAcademicSummary = () => {
    onChangeMe({
      ...me,
      bio: editedBio,
      major: editedMajor,
      year: editedYear
    });
    setIsEditingBio(false);
  };

  // Add a portfolio item
  const handleAddPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const colors: Record<string, string> = {
      'TypeScript': '#3178c6',
      'JavaScript': '#f1e05a',
      'Python': '#3572A5',
      'Go': '#00ADD8',
      'HTML/CSS': '#e34c26',
      'Other': '#8b5cf6'
    };

    const newItem: PortfolioItem = {
      id: 'new_pft_' + Date.now(),
      title: newTitle.toLowerCase().replace(/\s+/g, '-'),
      description: newDesc || 'No repository details provided.',
      stars: newStars || 0,
      forks: 0,
      language: newLang,
      langColor: colors[newLang] || '#6b7280',
      link: `https://github.com/${me.name.split(' ')[0].toLowerCase()}/${newTitle.toLowerCase().replace(/\s+/g, '-')}`
    };

    const updatedPortfolio = [newItem, ...portfolioItems];
    setPortfolioItems(updatedPortfolio);
    onChangeMe({
      ...me,
      portfolio: updatedPortfolio
    });

    setNewTitle('');
    setNewDesc('');
    setNewLang('TypeScript');
    setNewStars(0);
    setShowAddShowcase(false);
  };

  const handleDeletePortfolio = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedPortfolio = portfolioItems.filter(item => item.id !== id);
    setPortfolioItems(updatedPortfolio);
    onChangeMe({
      ...me,
      portfolio: updatedPortfolio
    });
  };

  // Handle adding skill
  const handleAddSkill = (skillName: string) => {
    const clean = skillName.trim();
    if (clean && !me.skills.includes(clean)) {
      const updatedSkills = [...me.skills, clean];
      const updatedProficiency = {
        ...skillsProficiency,
        [clean]: 'Intermediate' as const
      };
      setSkillsProficiency(updatedProficiency);
      onChangeMe({
        ...me,
        skills: updatedSkills,
        skillsProficiency: updatedProficiency
      });
    }
    setSkillSearch('');
  };

  const handleRemoveSkill = (skill: string) => {
    const updatedSkills = me.skills.filter(s => s !== skill);
    const updatedProficiency = { ...skillsProficiency };
    delete updatedProficiency[skill];
    setSkillsProficiency(updatedProficiency);
    onChangeMe({
      ...me,
      skills: updatedSkills,
      skillsProficiency: updatedProficiency
    });
  };

  const toggleProficiency = (skill: string) => {
    const ranks: ('Expert' | 'Intermediate' | 'Beginner')[] = ['Expert', 'Intermediate', 'Beginner'];
    const current = skillsProficiency[skill] || 'Intermediate';
    const nextIndex = (ranks.indexOf(current) + 1) % ranks.length;
    const updatedProficiency = {
      ...skillsProficiency,
      [skill]: ranks[nextIndex]
    };
    setSkillsProficiency(updatedProficiency);
    onChangeMe({
      ...me,
      skillsProficiency: updatedProficiency
    });
  };

  // Dynamic Projects Loaded from the cloud database
  const [projectsList, setProjectsList] = useState<Project[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'projects'), (snap) => {
      const list: Project[] = [];
      snap.forEach(docSnap => list.push(docSnap.data() as Project));
      setProjectsList(list);
    }, (err) => {
      console.warn("Firestore restricted inside ProfileView projects lookup", err);
    });
    return () => unsubscribe();
  }, []);

  // Match percentage calculation algorithm with campus projects
  const topProjectMatches = useMemo(() => {
    return projectsList.map(proj => {
      // Find intersection of skills needed and student skills
      const matchedSkills = proj.skillsNeeded.filter(sku => 
        me.skills.some(my => my.toLowerCase() === sku.toLowerCase())
      );
      
      const countMatch = matchedSkills.length;
      let score = 0;
      if (proj.skillsNeeded.length > 0) {
        score = Math.round((countMatch / proj.skillsNeeded.length) * 100);
      }
      
      // Additional minor score booster for profile availability
      if (me.availability === 'Available') {
        score = Math.min(100, score + 10);
      } else if (me.availability === 'Busy') {
        score = Math.max(0, score - 15);
      }

      return {
        project: proj,
        score,
        matchedSkills,
        missingSkills: proj.skillsNeeded.filter(sku => 
          !me.skills.some(my => my.toLowerCase() === sku.toLowerCase())
        )
      };
    }).sort((a,b) => b.score - a.score);
  }, [me.skills, me.availability]);

  // Contributor activity map matrix setup (GitHub contribute graph parody)
  const contributionSquares = useMemo(() => {
    const totalDays = 140; // 20 weeks x 7 days
    const squares = [];
    for (let i = 0; i < totalDays; i++) {
      // generate pseudo density (0-4)
      const rand = Math.random();
      let density = 0;
      if (rand > 0.85) density = 4; // dark green
      else if (rand > 0.7) density = 3; // medium green
      else if (rand > 0.5) density = 2; // light green
      else if (rand > 0.3) density = 1; // lightest green
      squares.push(density);
    }
    return squares;
  }, []);

  return (
    <div className="space-y-6">
      
      {/* 1. Header Card with LinkedIn style Premium Banner */}
      <div className="bg-white rounded-3xl border border-slate-150/85 overflow-hidden shadow-sm">
        
        {/* LinkedIn Header cover backdrop */}
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-650 to-blue-850 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute right-4 bottom-4 flex gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold text-white backdrop-blur-md">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              Direct Sync Connected
            </span>
          </div>
        </div>

        {/* User identification info wrapper */}
        <div className="px-6 pb-6 relative">
          
          {/* Circular avatar overlapping cover banner */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 mb-4 gap-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 text-white font-black text-3xl flex items-center justify-center rounded-xl uppercase tracking-wider shadow-inner">
                  {me.avatar}
                </div>
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 leading-none">{me.name}</h1>
                  <span className="bg-blue-50 text-blue-700 text-[10px] border border-blue-100 font-extrabold px-2 py-0.5 rounded">
                    Verified Student
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1.5 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  {me.university}
                </p>
              </div>
            </div>

            {/* Social handles buttons */}
            <div className="flex items-center gap-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                referrerPolicy="no-referrer"
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                title="Mock Github Connect"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                referrerPolicy="no-referrer"
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                title="Mock LinkedIn Connect"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              {!isEditingBio ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingBio(true);
                    setEditedBio(me.bio);
                    setEditedMajor(me.major);
                    setEditedYear(me.year);
                  }}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Edit Profile Summary
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveAcademicSummary}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Editable Content or Display Mode */}
          {!isEditingBio ? (
            <div className="space-y-3.5 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-50/55 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
                  <ScrollIcon className="w-5 h-5 text-indigo-600" />
                  <div>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase leading-none mb-1">Academic Year</span>
                    <span className="text-xs font-bold text-slate-700">{me.year}</span>
                  </div>
                </div>
                
                <div className="bg-slate-50/55 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  <div>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase leading-none mb-1">Declared Program</span>
                    <span className="text-xs font-bold text-slate-700">{me.major}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 ${
                  me.availability === 'Available' ? 'bg-emerald-50/50 border-emerald-100' :
                  me.availability === 'Part-time' ? 'bg-amber-50/50 border-amber-100' : 'bg-rose-50/50 border-rose-100'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Activity className={`w-5 h-5 ${
                      me.availability === 'Available' ? 'text-emerald-500' :
                      me.availability === 'Part-time' ? 'text-amber-500' : 'text-rose-500'
                    }`} />
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase leading-none mb-1">Current Sync Availability</span>
                      <span className="text-xs font-black text-slate-700">{me.availability}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Statement */}
              <div className="mt-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Campus Bio summary:</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-3xl bg-slate-50/30 p-3.5 rounded-xl border border-slate-100/50">
                  {me.bio || "No custom biography declaration provided yet."}
                </p>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Declared Program</label>
                  <input 
                    type="text" 
                    value={editedMajor} 
                    onChange={e => setEditedMajor(e.target.value)} 
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Academic Year</label>
                  <select 
                    value={editedYear} 
                    onChange={e => setEditedYear(e.target.value)} 
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Freshman Year">Freshman Year</option>
                    <option value="Sophomore Year">Sophomore Year</option>
                    <option value="Junior Year">Junior Year</option>
                    <option value="Senior Year">Senior Year</option>
                    <option value="Research Scholar / PhD">Research Scholar / PhD</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 uppercase">Student Showcase Biography</label>
                  <span className={`text-xs font-mono font-bold ${
                    bioCharCount > maxBioChar ? 'text-rose-500' : 'text-slate-400'
                  }`}>
                    {bioCharCount} / {maxBioChar}
                  </span>
                </div>
                <textarea 
                  rows={3} 
                  maxLength={maxBioChar}
                  value={editedBio}
                  onChange={e => setEditedBio(e.target.value)}
                  placeholder="Tell students about your core skills, recent research interests, and what collaborations you are excited about..."
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none resize-none font-medium"
                />

                {/* Counter status label alert */}
                <div className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs leading-tight font-semibold ${bioStatus.bg}`}>
                  <AlertCircle className={`w-4 h-4 shrink-0 ${bioStatus.color}`} />
                  <span className={bioStatus.color}>{bioStatus.rating}</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button 
                  type="button"
                  onClick={() => setIsEditingBio(false)}
                  className="px-3.5 py-1.8 bg-slate-200 hover:bg-slate-350 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Discard
                </button>
                <button 
                  type="button"
                  onClick={handleSaveAcademicSummary}
                  className="px-4 py-1.8 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow"
                >
                  Update Profile Summary
                </button>
              </div>
            </motion.div>
          )}

        </div>

      </div>

      {/* 2. Portfolio Showcase Block (Classic GitHub Repository Style) & Contribution activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 cols: Portfolios & Contribution Tracker */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* GitHub Contributions Graph Simulation */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-850 text-sm uppercase tracking-wide flex items-center gap-1.5 text-slate-850">
                  <Activity className="w-4.5 h-4.5 text-emerald-600" />
                  Academic Sync Contributions
                </h3>
                <p className="text-xs text-slate-400">Mocking peer code commits, project milestones, and platform studies</p>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                184 Sync Points
              </span>
            </div>

            {/* Matrix box */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 overflow-x-auto">
              <div className="flex flex-col gap-1.5 min-w-[460px]">
                {/* 7 rows representing days of week */}
                <div className="grid grid-flow-col gap-1 auto-cols-max">
                  {contributionSquares.map((density, idx) => {
                    const color = 
                      density === 0 ? 'bg-slate-100' :
                      density === 1 ? 'bg-emerald-100' :
                      density === 2 ? 'bg-emerald-300' :
                      density === 3 ? 'bg-emerald-500' :
                      'bg-emerald-700';
                    return (
                      <div 
                        key={idx} 
                        className={`w-2.5 h-2.5 rounded-sm ${color} transition-colors duration-300 hover:ring-2 hover:ring-indigo-300 cursor-pointer`}
                        title={`Contribution point intensity: ${density}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mt-2">
                  <span>Less Active</span>
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 rounded-sm bg-slate-100"></div>
                    <div className="w-2 h-2 rounded-sm bg-emerald-100"></div>
                    <div className="w-2 h-2 rounded-sm bg-emerald-300"></div>
                    <div className="w-2 h-2 rounded-sm bg-emerald-500"></div>
                    <div className="w-2 h-2 rounded-sm bg-emerald-700"></div>
                  </div>
                  <span>More Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* GitHub Repos Style Portfolio Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-50">
              <div className="space-y-0.5">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                  <Github className="w-4.5 h-4.5 text-slate-800" />
                  Portfolio Showcase Repo (Pinned)
                </h3>
                <p className="text-xs text-slate-400">Showcase your campus apps, scripts, or thesis packages</p>
              </div>

              <button
                onClick={() => setShowAddShowcase(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-[11px] font-bold text-slate-700 hover:text-indigo-700 rounded-xl cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Configure repo
              </button>
            </div>

            {/* Configure input showcase modal */}
            <AnimatePresence>
              {showAddShowcase && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 overflow-hidden"
                >
                  <form onSubmit={handleAddPortfolio} className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                        Configure repository pinning
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setShowAddShowcase(false)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Repository Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. distributed-caching-proxy"
                          value={newTitle}
                          onChange={e => setNewTitle(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.8 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Primary Language Asset</label>
                        <select 
                          value={newLang}
                          onChange={e => setNewLang(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="TypeScript">TypeScript</option>
                          <option value="JavaScript">JavaScript</option>
                          <option value="Python">Python</option>
                          <option value="Go">Go</option>
                          <option value="HTML/CSS">HTML/CSS</option>
                          <option value="Other">Other Category</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Short description of project</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Interactive canvas model constructed using React and D3 algorithms"
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.8 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button 
                        type="submit"
                        className="px-3.5 py-1.8 bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
                      >
                        Pin to Portfolio
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Repos Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolioItems.map(item => (
                <div 
                  key={item.id}
                  className="bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-slate-200 p-4.5 rounded-xl transition-all shadow-sm flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-xs font-mono select-all flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                        <Code className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {item.title}
                      </h4>
                      <button 
                        onClick={(e) => handleDeletePortfolio(item.id, e)}
                        className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                        title="Delete showcase"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.langColor }}></span>
                        {item.language}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-500" />
                        {item.stars}
                      </span>
                    </div>
                    <a 
                      href={item.link} 
                      target="_blank" 
                      referrerPolicy="no-referrer"
                      className="text-blue-500 font-bold hover:underline flex items-center gap-0.5"
                    >
                      Repo <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right side: Interactive Proficiency Tag Systems & Match Percentage Indicators */}
        <div className="space-y-6">
          
          {/* INTERACTIVE PROFICIENCY TAG SYSTEM */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                <Layers className="w-4.5 h-4.5 text-indigo-600" />
                Interactions Competency System
              </h3>
              <p className="text-xs text-slate-400">Click a tag to shift proficiency metrics recursively.</p>
            </div>

            {/* Quick Skill searchable adder */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Enter skill or tap suggestions..."
                value={skillSearch}
                onChange={e => setSkillSearch(e.target.value)}
                className="w-full text-xs pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg focus:outline-none"
              />
              <button 
                type="button"
                onClick={() => handleAddSkill(skillSearch)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-200 hover:bg-slate-300 p-1 rounded font-bold text-xs text-slate-650"
              >
                +
              </button>
            </div>

            {/* Add Suggested triggers */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Popular Skills:</span>
              <div className="flex flex-wrap gap-1">
                {suggestedSkills.map(sk => {
                  const alreadyHas = me.skills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      disabled={alreadyHas}
                      onClick={() => handleAddSkill(sk)}
                      className={`text-[9px] font-bold px-2 py-0.5 border rounded ${
                        alreadyHas 
                          ? 'border-slate-100 text-slate-350 bg-slate-50 cursor-not-allowed'
                          : 'border-slate-200/80 text-slate-550 hover:bg-slate-50'
                      }`}
                    >
                      {sk}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Active User Matrix with proficiency toggles */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">My Technical Tiers:</span>
              <div className="flex flex-wrap gap-1.5">
                {me.skills.map(sk => {
                  const prof = skillsProficiency[sk] || 'Intermediate';
                  const badgeColor = 
                    prof === 'Expert' ? 'bg-indigo-50 border-indigo-150 text-indigo-700' :
                    prof === 'Intermediate' ? 'bg-emerald-50 border-emerald-150 text-emerald-700' :
                    'bg-slate-50 border-slate-150 text-slate-600';

                  return (
                    <div 
                      key={sk}
                      onClick={() => toggleProficiency(sk)}
                      className={`group transition-all inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 border rounded-lg cursor-pointer ${badgeColor} select-none`}
                    >
                      <span className="text-[10px] font-bold">{sk}</span>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold px-1 rounded bg-black/5">
                        {prof}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSkill(sk);
                        }}
                        className="hover:text-red-600 ml-1 font-bold shrink-0 text-[10px] cursor-pointer"
                        title="Delete skill"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
                {me.skills.length === 0 && (
                  <span className="text-[11px] text-slate-400 italic">No competencies declared. Run configure suggestion panel above.</span>
                )}
              </div>
            </div>
          </div>

          {/* CHIP PROJECTS MATCHING VISUAL INDICATORS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
                Project Match Scorecards
              </h3>
              <p className="text-xs text-slate-400">Match score indexing dynamically calculated against key projects on campus</p>
            </div>

            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
              {topProjectMatches.slice(0, 3).map((match, idx) => {
                const colorWheel = 
                  match.score >= 80 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                  match.score >= 50 ? 'text-indigo-600 bg-indigo-50 border-indigo-100' :
                  'text-amber-600 bg-amber-50 border-amber-100';

                return (
                  <div 
                    key={match.project.id}
                    className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/80 text-xs flex flex-col gap-2 relative overflow-hidden"
                  >
                    {/* Index position stamp decorative badge */}
                    <div className="absolute right-2 top-2 bg-slate-200/50 px-1.5 py-0.5 rounded text-[8px] font-mono text-slate-550">
                      Rank #{idx + 1}
                    </div>

                    <div className="space-y-0.5 text-left pr-10">
                      <span className="block font-bold text-slate-850 truncate">{match.project.title}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{match.project.category} • {match.project.creatorName}</span>
                    </div>

                    {/* Progress with exact visual percentage layout block */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="min-w-10">
                        <span className="block font-black text-indigo-700 font-mono text-base">{match.score}%</span>
                        <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold leading-none">Fitness</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                          <motion.div 
                            className="bg-indigo-600 h-full rounded-full" 
                            initial={{ width: 0 }}
                            animate={{ width: `${match.score}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        {match.missingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1 select-none">
                            <span className="text-[8px] text-slate-400 mt-0.5 font-bold">Needs:</span>
                            {match.missingSkills.slice(0,2).map(ms => (
                              <span key={ms} className="text-[8.5px] bg-indigo-55 bg-indigo-50 text-indigo-850 px-1 rounded border border-indigo-100 font-medium">
                                + {ms}
                              </span>
                            ))}
                            {match.missingSkills.length > 2 && (
                              <span className="text-[8px] text-slate-400 mt-0.5">+{match.missingSkills.length - 2} more</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[8.5px] text-emerald-600 font-bold flex items-center gap-0.5 leading-none mt-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Full proficiency compatibility matching!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// Decorative Scroll helper icon inside profile summary elements
function ScrollIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
