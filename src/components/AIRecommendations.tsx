import React, { useState, useEffect, useMemo } from 'react';
import { Student, Project, Community } from '../types';
import { db } from '../firebase';
import { onSnapshot, collection, doc, setDoc } from 'firebase/firestore';
import { 
  Sparkles, 
  Brain, 
  Flame, 
  TrendingUp, 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Users, 
  Briefcase, 
  Search, 
  Plus, 
  AlertCircle, 
  BookOpen,
  CornerDownRight,
  MessageSquare,
  Bot,
  RefreshCw,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  me: Student;
  onChangeMe: (updated: Student) => void;
  onOpenMessageThread?: (participantName: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export default function AIRecommendations({ me, onChangeMe, onOpenMessageThread, onNavigateToTab }: Props) {
  // Sync Firestore datasets
  const [projects, setProjects] = useState<Project[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  // Recommendation view active tabs: 'projects' | 'peers' | 'skills'
  const [recSubTab, setRecSubTab] = useState<'projects' | 'peers' | 'skills'>('projects');
  
  // Custom interactive AI Matchmaker advice chat states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    { 
      sender: 'ai', 
      text: `Hello ${me.name}! I am your SkillSync AI Matchmaker. I've analyzed your academic profile, competencies in ${me.skills.slice(0, 3).join(', ')}, and interests in ${me.interests.slice(0, 2).join(', ')}. Ask me anything about how to optimize your portfolio, recruit partners, or transition into high-impact projects!`, 
      time: 'Just now' 
    }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Interactive path feedback state
  const [addedSkillFeedback, setAddedSkillFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to projects, students, communities in parallel for genuine client computations
    const unsubProjects = onSnapshot(collection(db, 'projects'), (snap) => {
      const list: Project[] = [];
      snap.forEach(d => list.push(d.data() as Project));
      setProjects(list);
    }, () => {});

    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      const list: Student[] = [];
      snap.forEach(d => list.push(d.data() as Student));
      setStudents(list);
    }, () => {});

    const unsubCommunities = onSnapshot(collection(db, 'communities'), (snap) => {
      const list: Community[] = [];
      snap.forEach(d => list.push(d.data() as Community));
      setCommunities(list);
    }, () => {});

    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => {
      unsubProjects();
      unsubStudents();
      unsubCommunities();
      clearTimeout(timer);
    };
  }, []);

  // 1. PROJECT MATCHING ALGORITHM
  // Computes precise overlap mathematics between student skills and project demands
  const projectRecommendations = useMemo(() => {
    return projects
      .map(proj => {
        // Exclude projects user created
        if (proj.creatorId === me.id) return null;

        const neededLower = proj.skillsNeeded.map(s => s.toLowerCase());
        const myLower = me.skills.map(s => s.toLowerCase());

        // Intersection of tech skills
        const matchingSkills = proj.skillsNeeded.filter(skill =>
          myLower.includes(skill.toLowerCase())
        );

        const missingSkills = proj.skillsNeeded.filter(skill =>
          !myLower.includes(skill.toLowerCase())
        );

        // Core score ratios
        const skillRatio = proj.skillsNeeded.length > 0 
          ? (matchingSkills.length / proj.skillsNeeded.length) 
          : 0.5;

        // Interest overlap bonus (matches category to major or bio keywords)
        let interestBonus = 0;
        const majorKeywords = me.major.toLowerCase().split(' ');
        const bioLower = me.bio.toLowerCase();
        const categoryLower = proj.category.toLowerCase();
        
        const hasCategoryLink = majorKeywords.some(kw => kw.length > 3 && categoryLower.includes(kw)) ||
                                me.interests.some(interest => categoryLower.includes(interest.toLowerCase()));

        if (hasCategoryLink) interestBonus += 0.15;
        if (bioLower.includes(proj.category.toLowerCase().split(' ')[0])) interestBonus += 0.08;

        // Final percentage alignment calculation
        const baseScore = (skillRatio * 0.7) + (interestBonus * 0.3);
        const finalScore = Math.min(99, Math.max(35, Math.round(baseScore * 100)));

        // Generate tailored academic advice
        let strategy = '';
        if (missingSkills.length === 0) {
          strategy = "Perfect technical fit! You possess 100% of the active stack required to hit the ground running. Send an immediate request to join.";
        } else if (missingSkills.length === 1) {
          strategy = `Excellent fit. Accelerate your match status by acquiring '${missingSkills[0]}' quickly, or reach out to assist with your core competencies now.`;
        } else {
          strategy = `Good match. Highlight your strengths in ${matchingSkills.slice(0, 2).join(', ')} while offerring to collaborate as you learn ${missingSkills[0]}.`;
        }

        return {
          ...proj,
          score: finalScore,
          matchingSkills,
          missingSkills,
          strategy
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => b.score - a.score); // Highest alignment first
  }, [projects, me]);

  // 2. PEER MATCHING ALGORITHM
  // Evaluates shared competencies and complementary technical stacks
  const peerRecommendations = useMemo(() => {
    return students
      .map(student => {
        // Exclude user self
        if (student.id === me.id) return null;

        const mySkillsLower = me.skills.map(s => s.toLowerCase());
        const peerSkillsLower = student.skills.map(s => s.toLowerCase());

        // 1. Shared skills (synchronicity)
        const sharedSkills = student.skills.filter(s => 
          mySkillsLower.includes(s.toLowerCase())
        );

        // 2. Complementary skills (skills they have that I don't, encouraging collaboration)
        const complementarySkills = student.skills.filter(s =>
          !mySkillsLower.includes(s.toLowerCase())
        );

        // 3. Shared interests
        const sharedInterests = student.interests.filter(int =>
          me.interests.map(i => i.toLowerCase()).includes(int.toLowerCase())
        );

        // Compute alignment scoring weights
        const sharedWeight = sharedSkills.length * 8;
        const compWeight = Math.min(3, complementarySkills.length) * 12; // cap value of complementary skills
        const interestWeight = sharedInterests.length * 10;

        let baseMatch = 40 + sharedWeight + compWeight + interestWeight;
        
        // Minor academic synergy checks
        if (student.university === me.university) baseMatch += 10;
        if (student.major === me.major) baseMatch += 5;

        const finalScore = Math.min(98, Math.max(30, baseMatch));

        return {
          ...student,
          score: finalScore,
          sharedSkills,
          complementarySkills,
          sharedInterests
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null)
      .sort((a, b) => b.score - a.score);
  }, [students, me]);

  // 3. SKILL DEVELOPMENT PATHWAY RECOMMENDATIONS
  // Quantifies campus stack scarcity & tells the user exactly which skill unlock triggers optimal matches
  const skillDevelopmentRecommendations = useMemo(() => {
    const demandCount: Record<string, { count: number; projectTitles: string[]; category: string }> = {};

    // Map skills demanded across projects that the user currently lacks
    projects.forEach(proj => {
      proj.skillsNeeded.forEach(skill => {
        const alreadyHas = me.skills.some(my => my.toLowerCase() === skill.toLowerCase());
        if (!alreadyHas) {
          const key = skill.trim();
          if (!demandCount[key]) {
            demandCount[key] = { count: 0, projectTitles: [], category: proj.category };
          }
          demandCount[key].count += 1;
          if (demandCount[key].projectTitles.length < 2) {
            demandCount[key].projectTitles.push(proj.title.split(':')[0]);
          }
        }
      });
    });

    return Object.entries(demandCount)
      .map(([skillName, data]) => {
        // Calculate estimated score boost from acquiring this skill
        const matchedProjectsCount = data.count;
        const estBoost = Math.max(5, Math.min(18, matchedProjectsCount * 5));

        return {
          name: skillName,
          demandCount: data.count,
          examples: data.projectTitles,
          estimatedBoost: estBoost,
          category: data.category
        };
      })
      .sort((a, b) => b.demandCount - a.demandCount)
      .slice(0, 5); // top 5 most scarcity-impactful skills
  }, [projects, me]);

  // Handle adding skill directly into profile
  const handleAcquireSkill = async (skillName: string) => {
    if (me.skills.includes(skillName)) return;
    
    const updated = {
      ...me,
      skills: [...me.skills, skillName]
    };

    setAddedSkillFeedback(skillName);
    onChangeMe(updated);

    setTimeout(() => {
      setAddedSkillFeedback(null);
    }, 4000);
  };

  // Submit dynamic AI advice queries
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time: 'Just now' }]);
    setIsAiTyping(true);

    // Simulate specialized NLP model reasoning response mapping based on key themes
    setTimeout(() => {
      const query = userMsg.toLowerCase();
      let responseText = '';

      if (query.includes('hire') || query.includes('recruit') || query.includes('find co-founder')) {
        const topPeers = peerRecommendations.slice(0, 2);
        responseText = `To recruit peer co-founders, your best campus candidates based on complementary skill mappings are **${topPeers[0]?.name || 'Sarah Jenkins'}** (major compatibility in engineering/AI) and **${topPeers[1]?.name || 'Maya Lin'}** (complements your strengths with UI Design & Figma). Consider starting a focused conversation highlighting how your background in ${me.skills[0]} matches their specific research interests.`;
      } else if (query.includes('project') || query.includes('blockchain') || query.includes('aegis')) {
        const bestProj = projectRecommendations[0];
        responseText = bestProj 
          ? `Based on your technical stack, your highest matching campus project is **"${bestProj.title}"** at **${bestProj.score}% match accuracy**. They need expertise in skills where you hold senior positions. A solid approach: click over to the projects list, examine the specific workspace milestones, and send a custom proposal detailing your readiness to join.`
          : `I recommend checking out the 'Decentralized Identity' blockchain project which aligns perfectly with your skills in TypeScript and Fullstack development.`;
      } else if (query.includes('resume') || query.includes('profile') || query.includes('optimize')) {
        responseText = `To maximize your visibility to recruiters and student peers, I suggest updating your availability to **"Available"** and acquiring **${skillDevelopmentRecommendations[0]?.name || 'Go'}** next in your skill pathways. This single skill unlock will immediately boost your structural project readiness scores across the campus directory by **+${skillDevelopmentRecommendations[0]?.estimatedBoost || 12}%**.`;
      } else if (query.includes('hello') || query.includes('hi') || query.includes('who are you')) {
        responseText = `Hello! I'm your interactive Matchmaker Advisor. I monitor the technical profiles and project registries of AIT in real-time. Feel free to ask: "Which projects should I apply to?", "How do I optimize my portfolio?", or "Which peers complement my technical expertise?"`;
      } else {
        responseText = `That's a great question! Looking closely at your profile, you hold strong foundations in **${me.skills.slice(0, 3).join(', ')}**. For student collaborations at ${me.university}, you can immediately pair with developers on the Projects tab. I recommend acquiring ${skillDevelopmentRecommendations[0]?.name || 'React Native'} or ${skillDevelopmentRecommendations[1]?.name || 'Docker'} to unlock the remaining restricted roles!`;
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: responseText, time: 'Just now' }]);
      setIsAiTyping(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Recommendation Header Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute left-1/3 bottom-0 -mb-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold tracking-wider uppercase border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              Intelligence Layer (Phase 9)
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">AI Matching & Recommendations Engine</h1>
            <p className="text-blue-100 text-xs">
              Contextual structural matrix matching user core competencies, scarce skills, and guild categories.
            </p>
          </div>

          <div className="bg-black/20 p-3 rounded-xl border border-white/10 text-center font-mono min-w-[140px]">
            <span className="text-[10px] text-blue-200 block uppercase font-bold tracking-widest">General Score</span>
            <span className="text-2xl font-black text-amber-300 text-shadow-sm">94.8%</span>
            <span className="text-[9px] text-slate-300 block">Campus Alignment Rank</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Recommendation lists (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Sub Navigation */}
          <div className="bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex gap-1 flex-1">
              {(['projects', 'peers', 'skills'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setRecSubTab(tab)}
                  className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    recSubTab === tab
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab === 'projects' && 'Project Matches'}
                  {tab === 'peers' && 'Complementary Peers'}
                  {tab === 'skills' && 'Skill Pathways'}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-1 px-3 text-[10px] font-bold text-slate-400 font-mono">
              <Bot className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>ALGORITHMIC MATRIX MATCHING</span>
            </div>
          </div>

          {/* Dynamic tabs display panel */}
          <AnimatePresence mode="wait">
            {recSubTab === 'projects' && (
              <motion.div
                key="projects-recommendations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center px-1">
                  <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    Recommended Team Partnerships
                  </h2>
                  <span className="text-[10px] text-slate-500 font-medium">Sorted by highest skill alignment score</span>
                </div>

                <div className="space-y-3">
                  {projectRecommendations.map(proj => (
                    <div 
                      key={proj.id}
                      className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-600`}>
                            {proj.category}
                          </span>
                          <span className="text-xs text-slate-400">• Created by {proj.creatorName}</span>
                        </div>

                        <h3 className="font-bold text-slate-850 text-sm">{proj.title}</h3>
                        <p className="text-slate-500 text-xs line-clamp-2 md:line-clamp-1">{proj.description}</p>
                        
                        {/* Interactive advice snippet */}
                        <div className="flex items-start gap-1.5 p-2 rounded-lg bg-indigo-50/50 border border-indigo-100/30 text-[11px] text-indigo-800">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span><strong className="font-bold">Match Strategy:</strong> {proj.strategy}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px]">
                          <div className="flex flex-wrap items-center gap-1 text-slate-600">
                            <span className="font-bold text-slate-400">Overlapping stack:</span>
                            {proj.matchingSkills.map(s => (
                              <span key={s} className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-100/50 font-medium">{s}</span>
                            ))}
                          </div>

                          {proj.missingSkills.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 text-slate-600">
                              <span className="font-bold text-slate-400">Missing:</span>
                              {proj.missingSkills.map(s => (
                                <span key={s} className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-100/50 font-medium">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Score metrics column */}
                      <div className="flex md:flex-col justify-between md:justify-center items-center gap-4 w-full md:w-auto shrink-0 md:pl-4 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0">
                        <div className="text-center">
                          <div className="relative inline-flex items-center justify-center">
                            {/* Score circle */}
                            <svg className="w-12 h-12 transform -rotate-90">
                              <circle cx="24" cy="24" r="21" stroke="#f1f5f9" strokeWidth="3" fill="transparent" />
                              <circle cx="24" cy="24" r="21" stroke="#3b82f6" strokeWidth="3" fill="transparent" 
                                strokeDasharray={2 * Math.PI * 21}
                                strokeDashoffset={2 * Math.PI * 21 * (1 - proj.score / 100)}
                              />
                            </svg>
                            <span className="absolute text-[11px] font-black text-slate-950 font-mono">{proj.score}%</span>
                          </div>
                          <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Match Index</span>
                        </div>

                        {onNavigateToTab && (
                          <button 
                            onClick={() => onNavigateToTab('projects')}
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1 transition-all active:scale-95"
                          >
                            Join Team
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {recSubTab === 'peers' && (
              <motion.div
                key="peers-recommendations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center px-1">
                  <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    Complementary Student Peers
                  </h2>
                  <span className="text-[10px] text-slate-500 font-medium">Calculated synergy matrix mappings</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {peerRecommendations.map(peer => (
                    <div 
                      key={peer.id}
                      className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs shrink-0 shadow-sm">
                              {peer.avatar}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                                {peer.name}
                              </h3>
                              <p className="text-[11px] text-slate-400 font-medium">{peer.major} • {peer.year}</p>
                            </div>
                          </div>

                          <div className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                            {peer.score}% Synergy
                          </div>
                        </div>

                        <p className="text-slate-500 text-xs line-clamp-2 md:line-clamp-3">{peer.bio}</p>

                        <div className="border-t border-slate-50/80 pt-3 space-y-2">
                          <div className="flex flex-wrap items-center gap-1 text-[10px]">
                            <span className="font-bold text-slate-400">Mutual Interests:</span>
                            {peer.sharedInterests.length > 0 ? (
                              peer.sharedInterests.map(i => (
                                <span key={i} className="px-1.5 py-0.2 rounded-md bg-slate-50 text-slate-600 border border-slate-100">{i}</span>
                              ))
                            ) : (
                              <span className="text-slate-400 italic">None yet, complementary profiles</span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1 text-[10px]">
                            <span className="font-bold text-slate-400">Collaboration stack:</span>
                            {peer.complementarySkills.length > 0 ? (
                              peer.complementarySkills.slice(0, 3).map(s => (
                                <span key={s} className="px-1.5 py-0.2 rounded-md bg-blue-50/70 text-blue-800 font-semibold">{s}</span>
                              ))
                            ) : (
                              <span className="text-slate-400 italic">Identical active profiles</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400">{peer.university}</span>
                        {onOpenMessageThread && (
                          <button
                            onClick={() => onOpenMessageThread(peer.name)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {recSubTab === 'skills' && (
              <motion.div
                key="skills-recommendations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center px-1">
                  <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    Personalized Skill Development Pathways
                  </h2>
                  <span className="text-[10px] text-slate-500 font-medium">Urgent campus developer stack vacancies</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-800">Scarcity matching alignment guide</h3>
                    <p className="text-[11px] text-slate-500">
                      These technical skills represent active gaps across your registered campus projects. Recruiting leads are hunting for these. Acquiring them adds them dynamically to your custom profile!
                    </p>
                  </div>
                </div>

                {addedSkillFeedback && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-100/60 flex items-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Skill <strong className="font-black">"{addedSkillFeedback}"</strong> added successfully to your profile index! Project matchmaking statistics are recalculating...</span>
                  </motion.div>
                )}

                <div className="space-y-3">
                  {skillDevelopmentRecommendations.length > 0 ? (
                    skillDevelopmentRecommendations.map(skill => (
                      <div 
                        key={skill.name}
                        className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm transition-all flex justify-between items-center gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-slate-850 text-sm font-mono">{skill.name}</h3>
                            <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider">
                              Category: {skill.category || 'Engineering'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-amber-600">
                              <Flame className="w-4 h-4" />
                              Required by {skill.demandCount} campus teams
                            </span>
                            <span>• Including: <span className="font-semibold text-slate-700">{skill.examples.join(', ')}</span></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <span className="text-[11px] text-emerald-600 font-bold block">+ {skill.estimatedBoost}% match score boost</span>
                            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Estimated Alignment</span>
                          </div>

                          <button
                            onClick={() => handleAcquireSkill(skill.name)}
                            disabled={me.skills.includes(skill.name)}
                            className={`px-3 py-1.8 rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-95 flex items-center gap-1 ${
                              me.skills.includes(skill.name)
                                ? 'bg-slate-50 text-slate-350 border border-slate-100 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Acquire
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-8 rounded-2xl text-center border border-slate-150 border-dashed">
                      <span className="text-slate-400 text-xs italic">Wow! You hold all the scarce technical skills actively searched across the directory.</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Col: AI Matchmaker Chat Companion */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-150 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold relative shadow-md">
                  <Bot className="w-4 h-4" />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-white animate-ping"></span>
                </div>
                <div>
                  <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">AI Co-Founder Assistant</h2>
                  <p className="text-[9px] text-slate-400 font-mono">CONNECTED TO CAMPUS DICTIONARY</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[9px] font-bold">
                Online
              </div>
            </div>

            {/* Conversation list */}
            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i}
                  className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[9px] text-slate-400 font-bold px-1 uppercase tracking-widest">{msg.sender === 'ai' ? '🤖 Matchmaker Bot' : '👨‍🎓 You'}</span>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[90%] font-medium ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-slate-350 px-1 font-mono">{msg.time}</span>
                </div>
              ))}

              {isAiTyping && (
                <div className="flex flex-col gap-1 items-start">
                  <span className="text-[9px] text-slate-400 font-bold px-1 uppercase tracking-widest">🤖 Matchmaker Bot</span>
                  <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 rounded-tl-none border border-slate-100 text-xs flex items-center gap-1.5 font-bold uppercase tracking-wider font-mono">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    Analyzing peer algorithms...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form input */}
          <form onSubmit={handleChatSubmit} className="pt-4 border-t border-slate-150 mt-4 flex gap-2">
            <input 
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask: 'Which project should I apply to?'"
              className="flex-1 bg-slate-50 outline-none border border-slate-200/80 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all font-semibold"
            />
            <button 
              type="submit"
              disabled={!chatInput.trim() || isAiTyping}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-xl p-2.5 transition-all max-h-10 cursor-pointer active:scale-95 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/10"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
