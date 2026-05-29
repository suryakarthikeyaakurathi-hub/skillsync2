import React, { useState, useMemo } from 'react';
import { Project, Student } from '../types';
import { MOCK_PROJECTS } from '../data';
import { 
  Plus, 
  FolderGit2, 
  Users, 
  Layers, 
  Search, 
  Sparkles, 
  ArrowUpRight, 
  Briefcase, 
  ChevronsRight, 
  Check, 
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  me: Student;
}

export default function ProjectsView({ me }: Props) {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Create project form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Research & Tech');
  const [newSkillsNeededStr, setNewSkillsNeededStr] = useState('');
  const [newStatus, setNewStatus] = useState<'Idea' | 'In Progress' | 'Completed'>('Idea');

  // Join requested project IDs
  const [joinRequestedIds, setJoinRequestedIds] = useState<string[]>([]);

  // Unique categories for filtering
  const categories = useMemo(() => {
    const list = new Set<string>();
    projects.forEach(p => list.add(p.category));
    return Array.from(list);
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchText = `${p.title} ${p.description} ${p.skillsNeeded.join(' ')}`.toLowerCase();
      if (searchQuery.trim() && !matchText.includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [projects, searchQuery, selectedCategory]);

  // Handle join team request
  const handleJoinRequest = (projectId: string) => {
    if (joinRequestedIds.includes(projectId)) return;
    setJoinRequestedIds([...joinRequestedIds, projectId]);
  };

  // Submit and create new project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const skills = newSkillsNeededStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const newlyCreated: Project = {
      id: `p-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      creatorId: me.id,
      creatorName: me.name,
      creatorAvatar: me.avatar,
      skillsNeeded: skills.length > 0 ? skills : ['React', 'TypeScript'],
      category: newCategory,
      status: newStatus,
      membersCount: 1,
      openRolesCount: 3,
      createdAt: 'Just now'
    };

    setProjects([newlyCreated, ...projects]);
    
    // Reset form & close
    setNewTitle('');
    setNewDesc('');
    setNewCategory('Research & Tech');
    setNewSkillsNeededStr('');
    setNewStatus('Idea');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Search and creation portal header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-6.5 h-6.5 text-blue-600" />
            Project Collaboration Ecosystem
          </h1>
          <p className="text-sm text-slate-500">
            Discover student projects with open roles or initialize your own idea portal to recruit academic peers
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          id="trigger-create-project"
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 hover:shadow-xl transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Propose Project Collaboration
        </button>
      </div>

      {/* Categories Horizontal scrolling & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        
        <div className="flex flex-wrap gap-1.5 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`text-xs px-3.5 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Categories
          </button>
          
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3.5 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active project details..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-250 hover:border-slate-350 focus:border-blue-500 rounded-xl focus:outline-none"
          />
        </div>
      </div>

      {/* Grid: Projects list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => {
            const hasRequested = joinRequestedIds.includes(project.id);
            return (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md hover:border-slate-200/60 transition-all space-y-4 group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-50 text-blue-700">
                      {project.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      project.status === 'Idea' ? 'bg-amber-50 text-amber-600' :
                      project.status === 'In Progress' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-indigo-50 text-indigo-600'
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-[10px] text-slate-400">Published {project.createdAt}</p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Requested Expertise:</span>
                    <div className="flex flex-wrap gap-1">
                      {project.skillsNeeded.map(skill => (
                        <span key={skill} className="text-[10px] bg-slate-50 border border-slate-150/55 font-semibold text-slate-600 px-2.5 py-1 rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Creator block & Request Action */}
                <div className="pt-4 border-t border-slate-55 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center">
                      {project.creatorAvatar}
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-800 leading-none">{project.creatorName}</span>
                      <span className="text-[10px] text-slate-400">Founder Account</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinRequest(project.id)}
                    className={`text-xs px-3.5 py-2 font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
                      hasRequested
                        ? 'bg-emerald-50 border border-emerald-150 text-emerald-700 select-none'
                        : 'bg-slate-900 border border-slate-750 text-white hover:bg-black active:scale-95'
                    }`}
                  >
                    {hasRequested ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {hasRequested ? 'Request Sent' : 'Join Team'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center p-12 bg-white rounded-2xl border border-slate-100">
            <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 mb-1 font-sans">No Collaboration Matching Filters</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Be the very first on campus! Propose your team idea and start syncing peers instantly.
            </p>
          </div>
        )}
      </div>

      {/* Dynamic Creation Portal Sheet (Modal Popup) */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100"
            >
              <button 
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <FolderGit2 className="w-5 h-5 text-blue-600" />
                Initialize Collaboration Space
              </h2>
              <p className="text-xs text-slate-400 mb-5">
                Enter details to broadcast your project across campus networks
              </p>

              <form onSubmit={handleCreateProject} className="space-y-4">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Project Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Aegis Unified Student Registry"
                    className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>

                {/* Categories & State */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase font-sans">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 focus:outline-none cursor-pointer"
                    >
                      <option value="Research & Tech">Research & Tech</option>
                      <option value="Blockchain & Privacy">Blockchain & Privacy</option>
                      <option value="Healthcare & AI">Healthcare & AI</option>
                      <option value="Sustainability">Sustainability</option>
                      <option value="Education Tech">Education Tech</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1 flex flex-col justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase">Development Stage</label>
                    <div className="flex gap-1 bg-slate-50 p-0.5 rounded-xl border border-slate-200">
                      {(['Idea', 'In Progress'] as const).map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setNewStatus(st)}
                          className={`flex-1 text-[10px] py-1.5 font-bold rounded-lg cursor-pointer ${
                            newStatus === st 
                              ? 'bg-blue-600 text-white shadow-sm' 
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {st === 'In Progress' ? 'Active' : 'Concept'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Skills split comma string */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Required Competencies (Comma split)</label>
                  <input
                    type="text"
                    value={newSkillsNeededStr}
                    onChange={(e) => setNewSkillsNeededStr(e.target.value)}
                    placeholder="React, PyTorch, Go, Figma, Node"
                    className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400 block">Separated by commas for target lookups</span>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Vessel Outline & Goal</label>
                  <textarea
                    required
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Provide a high-impact overview of what you are aiming to build..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 focus:outline-none resize-none"
                  ></textarea>
                </div>

                {/* Actions bottom */}
                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 text-xs border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel Action
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer"
                  >
                    Publish to Campus
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
