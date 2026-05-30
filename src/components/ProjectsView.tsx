import React, { useState, useMemo, useEffect } from 'react';
import { Project, Student } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { onSnapshot, collection, doc, setDoc } from 'firebase/firestore';
import { 
  Plus, 
  FolderGit2, 
  Users, 
  Layers, 
  Search, 
  Sparkles, 
  ArrowUpRight, 
  Briefcase, 
  ChevronRight, 
  Check, 
  CheckCircle2,
  X,
  Trello,
  Calendar,
  UserCheck,
  AlertCircle,
  Trash2,
  Play,
  PlayCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Inbox,
  UserPlus,
  Compass,
  FileCode,
  Tag,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  me: Student;
  onChangeMe?: (updated: Student) => void;
}

interface OpenRole {
  id: string;
  roleTitle: string;
  badge: 'Expert' | 'Intermediate' | 'Beginner';
  skills: string[];
}

interface ProjectMilestone {
  id: string;
  title: string;
  timeframe: string;
  completed: boolean;
}

interface KanbanTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  column: 'todo' | 'inprogress' | 'review' | 'done';
  assigneeName: string;
  assigneeAvatar: string;
  priority: 'High' | 'Medium' | 'Low';
  checklist: { id: string; text: string; done: boolean }[];
}

interface JoinRequest {
  id: string;
  projectId: string;
  projectTitle: string;
  applicantName: string;
  applicantAvatar: string;
  applicantMajor: string;
  applicantEmail: string;
  roleAsked: string;
  status: 'Pending' | 'Accepted' | 'Declined';
}

export default function ProjectsView({ me }: Props) {
  // Navigation for project system
  const [activeSubTab, setActiveSubTab] = useState<'browse' | 'workspace' | 'requests'>('browse');

  // Multi-tier local state for robust modification & lifecycle indexing
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStage, setSelectedStage] = useState<'All' | 'Idea' | 'In Progress' | 'Completed'>('All');

  useEffect(() => {
    // Connect a real-time web stream listening to Firestore projects collection
    const unsubscribe = onSnapshot(
      collection(db, 'projects'),
      (snapshot) => {
        const list: Project[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Project);
        });
        setProjects(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'projects');
      }
    );
    return () => unsubscribe();
  }, []);

  // Dynamic Open Roles mappings per project
  const [projectRoles, setProjectRoles] = useState<Record<string, OpenRole[]>>(() => {
    const saved = localStorage.getItem('skillsync_project_roles');
    return saved ? JSON.parse(saved) : {};
  });

  // Project milestones
  const [projectMilestones, setProjectMilestones] = useState<Record<string, ProjectMilestone[]>>(() => {
    const saved = localStorage.getItem('skillsync_project_milestones');
    return saved ? JSON.parse(saved) : {};
  });

  // Collaborative Notion/Trello Kanban Board seed data
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>(() => {
    const saved = localStorage.getItem('skillsync_kanban_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  // Handle active Trello selection (Default to first available project id)
  const [selectedWorkspaceProjectId, setSelectedWorkspaceProjectId] = useState<string>('');

  useEffect(() => {
    if (projects.length > 0 && !selectedWorkspaceProjectId) {
      setSelectedWorkspaceProjectId(projects[0].id);
    }
  }, [projects, selectedWorkspaceProjectId]);

  // Peer applications on user projects
  const [incomingRequests, setIncomingRequests] = useState<JoinRequest[]>(() => {
    const saved = localStorage.getItem('skillsync_incoming_requests');
    return saved ? JSON.parse(saved) : [];
  });

  // Outgoing user applications tracking
  const [myApplications, setMyApplications] = useState<JoinRequest[]>(() => {
    const saved = localStorage.getItem('skillsync_my_applications');
    return saved ? JSON.parse(saved) : [];
  });

  // Keep state collections in sync with browser dynamic storage for perfect execution feel
  useEffect(() => {
    localStorage.setItem('skillsync_project_roles', JSON.stringify(projectRoles));
  }, [projectRoles]);

  useEffect(() => {
    localStorage.setItem('skillsync_project_milestones', JSON.stringify(projectMilestones));
  }, [projectMilestones]);

  useEffect(() => {
    localStorage.setItem('skillsync_kanban_tasks', JSON.stringify(kanbanTasks));
  }, [kanbanTasks]);

  useEffect(() => {
    localStorage.setItem('skillsync_incoming_requests', JSON.stringify(incomingRequests));
  }, [incomingRequests]);

  useEffect(() => {
    localStorage.setItem('skillsync_my_applications', JSON.stringify(myApplications));
  }, [myApplications]);

  // Project Creation Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [wizardTitle, setWizardTitle] = useState('');
  const [wizardDesc, setWizardDesc] = useState('');
  const [wizardCategory, setWizardCategory] = useState('Education Tech');
  const [wizardStatus, setWizardStatus] = useState<'Idea' | 'In Progress'>('Idea');
  
  // Wizard roles setup array during project initialization
  const [wizardRoles, setWizardRoles] = useState<string>('Marketing Coordinator, Frontend Engineer, TypeScript Developer');
  // Wizard milestones setup array
  const [wizardMilestones, setWizardMilestones] = useState<string>('Setup workspace portal, Finalize core design mockup guidelines, Run first testing integration');

  // Trigger Notifications / Toast State
  const [notification, setNotification] = useState<string | null>(null);

  // New task builder state for Kanban board
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Suryakarthikeya Akurathi');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  // Filters setup computed variables
  const categories = useMemo(() => {
    const list = new Set<string>();
    projects.forEach(p => list.add(p.category));
    return ['All', ...Array.from(list)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchText = `${p.title} ${p.description} ${p.skillsNeeded.join(' ')}`.toLowerCase();
      if (searchQuery.trim() && !matchText.includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      if (selectedStage !== 'All' && p.status !== selectedStage) {
        return false;
      }
      return true;
    });
  }, [projects, searchQuery, selectedCategory, selectedStage]);

  // Handle application to project roles
  const handleApplyToRole = (projectId: string, role: OpenRole) => {
    const targetProj = projects.find(p => p.id === projectId);
    if (!targetProj) return;

    // Check if already applied
    const alreadyApplied = myApplications.some(app => app.projectId === projectId && app.roleAsked === role.roleTitle);
    if (alreadyApplied) {
      triggerToast(`You have already filed an active application for ${role.roleTitle}!`);
      return;
    }

    const newApp: JoinRequest = {
      id: `app-${Date.now()}`,
      projectId: projectId,
      projectTitle: targetProj.title,
      applicantName: me.name,
      applicantAvatar: me.avatar,
      applicantMajor: me.major,
      applicantEmail: me.email,
      roleAsked: role.roleTitle,
      status: 'Pending'
    };

    setMyApplications([...myApplications, newApp]);
    triggerToast(`Applied successfully for ${role.roleTitle}! Check progress in Requests Hub.`);
  };

  // Helper trigger action
  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Accept incoming request
  const handleAcceptRequest = (requestId: string) => {
    const request = incomingRequests.find(r => r.id === requestId);
    if (!request) return;

    // Update Project state
    setProjects(prev => prev.map(p => {
      if (p.id === request.projectId) {
        return {
          ...p,
          membersCount: p.membersCount + 1,
          openRolesCount: Math.max(0, p.openRolesCount - 1)
        };
      }
      return p;
    }));

    // Mark Request as Accepted
    setIncomingRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return { ...r, status: 'Accepted' };
      }
      return r;
    }));

    // Notify user
    triggerToast(`Congratulations! Accepted ${request.applicantName} into your team.`);
  };

  // Decline incoming request
  const handleDeclineRequest = (requestId: string) => {
    setIncomingRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return { ...r, status: 'Declined' };
      }
      return r;
    }));
    triggerToast(`Request declined gracefully.`);
  };

  // Task modification on Kanban cards
  const handleMoveTaskColumn = (taskId: string, targetCol: 'todo' | 'inprogress' | 'review' | 'done') => {
    setKanbanTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, column: targetCol };
      }
      return t;
    }));
  };

  const toggleTaskChecklist = (taskId: string, checklistItemId: string) => {
    setKanbanTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          checklist: t.checklist.map(item => {
            if (item.id === checklistItemId) {
              return { ...item, done: !item.done };
            }
            return item;
          })
        };
      }
      return t;
    }));
  };

  // Create new task on Scrum Board
  const handleCreateKanbanTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const added: KanbanTask = {
      id: `kt-${Date.now()}`,
      projectId: selectedWorkspaceProjectId,
      title: newTaskTitle,
      description: newTaskDesc || 'No extended task instructions declared.',
      column: 'todo',
      assigneeName: newTaskAssignee,
      assigneeAvatar: newTaskAssignee === me.name ? me.avatar : 'PE',
      priority: newTaskPriority,
      checklist: []
    };

    setKanbanTasks([...kanbanTasks, added]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('Medium');
    setShowNewTaskForm(false);
    triggerToast(`New sprint task mapped to ${added.column.toUpperCase()} column!`);
  };

  const handleDeleteKanbanTask = (taskId: string) => {
    setKanbanTasks(prev => prev.filter(t => t.id !== taskId));
    triggerToast(`Task successfully removed.`);
  };

  // Wizard Complete Trigger
  const handleCompleteWizard = () => {
    if (!wizardTitle.trim() || !wizardDesc.trim()) {
      triggerToast('Please provide a project name and description to complete deployment.');
      return;
    }

    const skills = wizardRoles.split(',').map(s => s.trim().split(' ')[0]).filter(Boolean);
    const projId = `p-${Date.now()}`;

    // 1. Build project object
    const createdProject: Project = {
      id: projId,
      title: wizardTitle,
      description: wizardDesc,
      creatorId: me.id,
      creatorName: me.name,
      creatorAvatar: me.avatar,
      skillsNeeded: skills.length > 0 ? skills : ['React', 'TypeScript'],
      category: wizardCategory,
      status: wizardStatus,
      membersCount: 1,
      openRolesCount: wizardRoles.split(',').length || 2,
      createdAt: 'Today'
    };

    // 2. Add roles
    const configuredRoles: OpenRole[] = wizardRoles.split(',').map((r, i) => ({
      id: `wr-${projId}-${i}`,
      roleTitle: r.trim(),
      badge: i % 2 === 0 ? 'Expert' : 'Intermediate',
      skills: [wizardCategory, 'TypeScript', 'Figma'].slice(0, 2)
    }));

    // 3. Add milestones
    const configuredMilestones: ProjectMilestone[] = wizardMilestones.split(',').map((m, i) => ({
      id: `wm-${projId}-${i}`,
      title: m.trim(),
      timeframe: `Week ${i + 1}`,
      completed: false
    }));

    // Update master lists
    try {
      setDoc(doc(db, 'projects', projId), createdProject);
    } catch (err) {
      console.error("Failed to commit project to cloud database", err);
    }
    setProjectRoles(prev => ({ ...prev, [projId]: configuredRoles }));
    setProjectMilestones(prev => ({ ...prev, [projId]: configuredMilestones }));

    // Reset Wizard
    setWizardTitle('');
    setWizardDesc('');
    setWizardStep(1);
    setShowWizard(false);
    triggerToast(`Successfully launched "${createdProject.title}" workspace across campus!`);
  };

  return (
    <div className="space-y-6 select-none">

      {/* Dynamic inline notification alerts */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ x: '-50%' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-750 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header bar structure */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-6.5 h-6.5 text-blue-600" />
            Project Collaboration Space
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Propose student initiatives via automated creation wizards, request to join open teams, or orchestrate sprints.
          </p>
        </div>

        <button
          onClick={() => {
            setShowWizard(true);
            setWizardStep(1);
          }}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer active:scale-95 transition-all text-center font-sans"
        >
          <Plus className="w-4 h-4" />
          Propose Project Collaboration
        </button>
      </div>

      {/* Sub tabs navigation menu headers */}
      <div className="flex border-b border-slate-150/80 gap-6">
        <button
          onClick={() => setActiveSubTab('browse')}
          className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer ${
            activeSubTab === 'browse' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {activeSubTab === 'browse' && (
            <motion.div layoutId="activeCollabSub" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
          <span className="flex items-center gap-1.5">
            <Compass className="w-4 h-4" />
            Browse Campus Ventures
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('workspace')}
          className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer ${
            activeSubTab === 'workspace' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {activeSubTab === 'workspace' && (
            <motion.div layoutId="activeCollabSub" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
          <span className="flex items-center gap-1.5">
            <Trello className="w-4 h-4 text-emerald-500" />
            Project Scrum Board (Task sync)
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('requests')}
          className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer ${
            activeSubTab === 'requests' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {activeSubTab === 'requests' && (
            <motion.div layoutId="activeCollabSub" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
          <span className="flex items-center gap-1.5">
            <Inbox className="w-4 h-4 text-amber-500 animate-pulse" />
            Requests & Forms Hub
            {incomingRequests.filter(r => r.status === 'Pending').length > 0 && (
              <span className="ml-1 bg-amber-500 text-white font-extrabold font-mono text-[9px] px-1.5 py-0.5 rounded-full">
                {incomingRequests.filter(r => r.status === 'Pending').length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* RENDER TAB CONTENTS */}
      {activeSubTab === 'browse' && (
        <div className="space-y-6">
          
          {/* Filters Bar: Category Selector with Search block */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-150/75 shadow-sm">
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3.5 py-2 font-bold rounded-xl transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-550'
                  }`}
                >
                  {cat === 'All' ? 'All Core Categories' : cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title, description or skills needed..."
                  className="w-full text-xs pl-8.5 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none font-semibold text-slate-700"
                />
              </div>

              {/* Dev Stage selection */}
              <select
                value={selectedStage}
                onChange={e => setSelectedStage(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-xs px-2.5 py-2 rounded-xl focus:outline-none cursor-pointer font-bold text-slate-650"
              >
                <option value="All">All Statuses</option>
                <option value="Idea">Idea Tier</option>
                <option value="In Progress">Active Tier</option>
                <option value="Completed">Completed Tier</option>
              </select>
            </div>
          </div>

          {/* Core Projects grid with details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => {
                const roles = projectRoles[project.id] || [];
                const milestones = projectMilestones[project.id] || [];
                
                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-slate-150/80 p-6 rounded-3xl flex flex-col justify-between hover:shadow-lg hover:border-blue-150 transition-all space-y-5 group relative overflow-hidden"
                  >
                    {/* Top visual strip indicating status */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      project.status === 'Idea' ? 'bg-amber-400' :
                      project.status === 'In Progress' ? 'bg-emerald-400' :
                      'bg-indigo-400'
                    }`} />

                    <div className="space-y-4">
                      
                      {/* Category and publish standing info row */}
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-50 border border-slate-150/40 text-slate-600 block">
                          {project.category}
                        </span>
                        
                        <div className="flex gap-1">
                          {project.creatorId === me.id && (
                            <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                              My Space
                            </span>
                          )}
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                            project.status === 'Idea' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                            project.status === 'In Progress' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                            'bg-indigo-50 border-indigo-150 text-indigo-750'
                          }`}>
                            {project.status === 'In Progress' ? 'Active' : project.status}
                          </span>
                        </div>
                      </div>

                      {/* Project Title and Metadata */}
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-all">
                          {project.title}
                        </h3>
                        <p className="text-[10.5px] text-slate-400 font-bold flex items-center gap-1 leading-none pt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-350" />
                          Created {project.createdAt}
                        </p>
                      </div>

                      {/* Brief description content */}
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        {project.description}
                      </p>

                      {/* Direct display of milestones progress logs if present */}
                      {milestones.length > 0 && (
                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-150/45 space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <span>Sprints Milestones</span>
                            <span>{milestones.filter(m => m.completed).length}/{milestones.length} Done</span>
                          </div>
                          <div className="space-y-1.5">
                            {milestones.slice(0, 2).map(m => (
                              <div key={m.id} className="flex items-center gap-2 text-xs">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.completed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                <span className={`truncate ${m.completed ? 'text-slate-400 line-through' : 'text-slate-600 font-semibold'}`}>{m.title}</span>
                                <span className="text-[9px] font-mono text-slate-400 ml-auto font-medium shrink-0">({m.timeframe})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* OPEN ROLES PORTAL COMPULSORY COMPONENT */}
                      {roles.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-50 select-none">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                            On-Campus Vacancies ({roles.length}):
                          </span>
                          
                          <div className="grid grid-cols-1 gap-2">
                            {roles.map(role => {
                              const alreadyApplied = myApplications.some(app => app.projectId === project.id && app.roleAsked === role.roleTitle);
                              return (
                                <div 
                                  key={role.id}
                                  className="p-3 bg-indigo-50/45 border border-indigo-100/50 rounded-xl flex items-center justify-between gap-3 text-xs"
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <strong className="text-slate-800 font-bold text-[11px]">{role.roleTitle}</strong>
                                      <span className="text-[8.5px] uppercase tracking-wider bg-indigo-100 px-1.5 rounded text-indigo-700 font-black">
                                        {role.badge}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {role.skills.map(sk => (
                                        <span key={sk} className="text-[9px] text-indigo-850 font-bold bg-white/70 px-1.5 rounded border border-indigo-100/30">
                                          {sk}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <button
                                    onClick={() => handleApplyToRole(project.id, role)}
                                    disabled={alreadyApplied}
                                    className={`px-3 py-1.5 font-bold text-[10px] rounded-lg cursor-pointer transition-all shrink-0 ${
                                      alreadyApplied 
                                        ? 'bg-slate-100 text-slate-450 border border-slate-200 cursor-not-allowed text-slate-400'
                                        : 'bg-indigo-600 hover:bg-slate-900 text-white'
                                    }`}
                                  >
                                    {alreadyApplied ? 'Applied' : 'Apply Now'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Team overview strip bottom */}
                    <div className="pt-4.5 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-extrabold text-[11px] flex items-center justify-center select-none shadow">
                          {project.creatorAvatar}
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-800 leading-none">{project.creatorName}</span>
                          <span className="text-[9px] text-slate-400 font-medium">Founder Account</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {project.creatorId === me.id || project.id === 'p1' ? (
                          <button
                            onClick={() => {
                              setSelectedWorkspaceProjectId(project.id);
                              setActiveSubTab('workspace');
                              triggerToast(`Entered workspace for ${project.title}`);
                            }}
                            className="bg-slate-100 hover:bg-slate-250 border border-slate-200 text-slate-700 text-xs px-3.5 py-1.8 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Trello className="w-3.5 h-3.5 text-indigo-500" />
                            Scrum Board
                          </button>
                        ) : null}
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredProjects.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center p-12 bg-white rounded-3xl border border-slate-150">
                <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-extrabold text-slate-800 text-sm mb-1">No Projects Match Selected Filter Sets</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                  Refactor search strings or pick alternate category options above.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedStage('All');
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-650 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Clear Active Filters
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* DETAILED PROJECT KANBAN SCRUM TASK BOARD */}
      {activeSubTab === 'workspace' && (
        <div className="space-y-6">
          
          {/* Controls Bar for Sprint Select */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest leading-none block">Target Workspace Board</label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedWorkspaceProjectId}
                  onChange={e => setSelectedWorkspaceProjectId(e.target.value)}
                  className="bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-xl focus:outline-none cursor-pointer font-bold text-slate-800"
                >
                  {projects.filter(p => p.creatorId === me.id || p.id === 'p1').map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-100">
                  Sprint Workspace Actives
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowNewTaskForm(true)}
              className="bg-slate-900 border border-slate-755 hover:bg-black text-white font-bold text-xs px-4.5 py-2.5 rounded-xl cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4 text-emerald-400" /> Map Sprint Task
            </button>
          </div>

          {/* New task mapping builder overlay inside board context */}
          <AnimatePresence>
            {showNewTaskForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-50 p-5 rounded-2xl border border-slate-200 overflow-hidden"
              >
                <form onSubmit={handleCreateKanbanTask} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Tag className="w-4 h-4 text-indigo-500" /> Configure Scrum Board Task Entry
                    </span>
                    <button type="button" onClick={() => setShowNewTaskForm(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Task Header name</label>
                      <input
                        type="text"
                        required
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        placeholder="e.g. Integrate dynamic WebSockets"
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Risk standing priority</label>
                      <select
                        value={newTaskPriority}
                        onChange={e => setNewTaskPriority(e.target.value as any)}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer text-slate-700 font-semibold"
                      >
                        <option value="High">🚨 High Severity</option>
                        <option value="Medium">⚡ Medium Rating</option>
                        <option value="Low">🌱 Low Rating</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Responsible Delegate</label>
                      <input
                        type="text"
                        value={newTaskAssignee}
                        onChange={e => setNewTaskAssignee(e.target.value)}
                        placeholder="Name of team companion..."
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Subtext & Instructions details</label>
                    <input
                      type="text"
                      value={newTaskDesc}
                      onChange={e => setNewTaskDesc(e.target.value)}
                      placeholder="e.g. Set keepAlive triggers at 30 seconds interval..."
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 border border-slate-700 hover:bg-black text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Commit Task to backlog
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Kanban columns flex list */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 select-none">
            
            {/* COLUMN BUILDER HOOKS */}
            {(['todo', 'inprogress', 'review', 'done'] as const).map(colId => {
              const columnTasks = kanbanTasks.filter(t => t.projectId === selectedWorkspaceProjectId && t.column === colId);
              const colLabel = 
                colId === 'todo' ? 'To Do' :
                colId === 'inprogress' ? 'In Progress' :
                colId === 'review' ? 'In Review' : 'Completed';
              
              const headerColor = 
                colId === 'todo' ? 'border-slate-300 text-slate-650 bg-slate-100' :
                colId === 'inprogress' ? 'border-amber-200 text-amber-800 bg-amber-50' :
                colId === 'review' ? 'border-indigo-200 text-indigo-850 bg-indigo-50' :
                'border-emerald-200 text-emerald-800 bg-emerald-50';

              return (
                <div key={colId} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-4 min-h-[420px]">
                  
                  {/* Column header tag info */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between ${headerColor}`}>
                    <span className="text-xs font-black uppercase tracking-wider">{colLabel}</span>
                    <span className="font-mono font-bold text-[11px] bg-white/60 px-2 rounded-full border border-black/5">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Tasks in column lists */}
                  <div className="space-y-3">
                    {columnTasks.map(task => {
                      const doneChecklistNum = task.checklist.filter(c => c.done).length;
                      const pctChecklist = task.checklist.length > 0 
                        ? Math.round((doneChecklistNum / task.checklist.length) * 100) 
                        : 0;

                      return (
                        <div 
                          key={task.id}
                          className="bg-white border border-slate-150 p-4 rounded-xl shadow-sm hover:shadow transition-all space-y-3 group text-left relative"
                        >
                          <div className="flex items-start justify-between">
                            <span className={`text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              task.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              'bg-slate-50 text-slate-500 border border-slate-150/40'
                            }`}>
                              {task.priority} Priority
                            </span>

                            <button
                              onClick={() => handleDeleteKanbanTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-350 hover:text-rose-600 transition-opacity p-0.5"
                              title="Delete task item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-850 leading-tight">
                              {task.title}
                            </h4>
                            <p className="text-[10.5px] text-slate-400 font-semibold leading-relaxed">
                              {task.description}
                            </p>
                          </div>

                          {/* Render custom sub-checklists inside trello cards */}
                          {task.checklist.length > 0 && (
                            <div className="space-y-1.5 pt-1.5 border-t border-slate-50">
                              <div className="flex items-center justify-between text-[8px] uppercase tracking-wider font-extrabold text-slate-400">
                                <span>Core Milestones checklist:</span>
                                <span>{pctChecklist}% Done</span>
                              </div>
                              <div className="space-y-1 select-none">
                                {task.checklist.map(chk => (
                                  <label 
                                    key={chk.id} 
                                    className="flex items-center gap-1.5 text-[10px] text-slate-600 transition-all font-semibold hover:text-slate-900 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={chk.done}
                                      onChange={() => toggleTaskChecklist(task.id, chk.id)}
                                      className="rounded text-indigo-600 focus:ring-0 w-3 h-3 cursor-pointer"
                                    />
                                    <span className={chk.done ? 'line-through text-slate-400 font-medium' : ''}>{chk.text}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action move column navigators */}
                          <div className="pt-2 border-t border-slate-50 flex items-center justify-between gap-2">
                            {/* Delegate circular initial avatar stamp wrapper */}
                            <div className="flex items-center gap-1 text-[9.5px] text-slate-500 font-bold">
                              <div className="w-5 h-5 rounded-full bg-slate-950 text-white font-extrabold text-[8px] flex items-center justify-center shadow-inner">
                                {task.assigneeAvatar}
                              </div>
                              <span className="truncate max-w-16">{task.assigneeName.split(' ')[0]}</span>
                            </div>

                            <div className="flex gap-0.5 ml-auto">
                              {colId !== 'todo' && (
                                <button
                                  onClick={() => {
                                    const cols: ('todo' | 'inprogress' | 'review' | 'done')[] = ['todo', 'inprogress', 'review', 'done'];
                                    const prevIdx = cols.indexOf(colId) - 1;
                                    handleMoveTaskColumn(task.id, cols[prevIdx]);
                                  }}
                                  className="p-1 hover:bg-slate-55 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 text-[10px] font-black border border-slate-150/40"
                                  title="Move Left Column"
                                >
                                  ←
                                </button>
                              )}
                              {colId !== 'done' && (
                                <button
                                  onClick={() => {
                                    const cols: ('todo' | 'inprogress' | 'review' | 'done')[] = ['todo', 'inprogress', 'review', 'done'];
                                    const nextIdx = cols.indexOf(colId) + 1;
                                    handleMoveTaskColumn(task.id, cols[nextIdx]);
                                  }}
                                  className="p-1 hover:bg-slate-55 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 text-[10px] font-black border border-slate-150/40"
                                  title="Move Right Column"
                                >
                                  →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {columnTasks.length === 0 && (
                      <p className="text-[10px] text-slate-400 italic text-center py-4 bg-white/30 rounded-xl border border-dashed border-slate-200">
                        Column backlog clear.
                      </p>
                    )}
                  </div>

                </div>
              );
            })}

          </div>

        </div>
      )}

      {/* REQUESTS AND APPLICATIONS LISTS */}
      {activeSubTab === 'requests' && (
        <div className="space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* INCOMING APPLICATIONS (My Projects) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150/80 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-1.5">
                  <UserPlus className="w-4.5 h-4.5 text-blue-600 animate-pulse" />
                  Incoming Partnership Requests
                </h3>
                <p className="text-xs text-slate-400">Student aspirants wanting to join NoteSphere or your initiated space.</p>
              </div>

              <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                {incomingRequests.map((req) => (
                  <div 
                    key={req.id}
                    className="p-4 bg-slate-50/50 rounded-xl border border-slate-150/70 text-xs flex flex-col gap-3 text-left relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center shadow">
                          {req.applicantAvatar}
                        </div>
                        <div>
                          <span className="block font-bold text-slate-800 text-[13px]">{req.applicantName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{req.applicantMajor} • {req.applicantEmail}</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        req.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        req.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="text-slate-650 bg-white p-2.5 rounded-lg border border-slate-150/40 text-[11px] font-semibold flex items-center gap-1.5">
                      <strong className="text-indigo-700">Applied Role:</strong>
                      <span className="text-slate-550">{req.roleAsked}</span>
                    </div>

                    {req.status === 'Pending' && (
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          onClick={() => handleDeclineRequest(req.id)}
                          className="px-3.5 py-1.8 bg-slate-200 hover:bg-rose-50 border border-slate-200 hover:border-rose-150 text-slate-700 hover:text-rose-700 font-bold rounded-lg cursor-pointer transition-all"
                        >
                          Decline gracefully
                        </button>
                        <button
                          onClick={() => handleAcceptRequest(req.id)}
                          className="px-4 py-1.8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer shadow-md"
                        >
                          Accept Partner
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {incomingRequests.length === 0 && (
                  <p className="text-slate-400 italic text-xs py-8 text-center bg-slate-50 rounded-xl">No student applications lodged on your projects.</p>
                )}
              </div>
            </div>

            {/* MY OUTGOING APPLICATIONS PROGRESS TRACKER */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150/80 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-1.5">
                  <Briefcase className="w-4.5 h-4.5 text-blue-600" />
                  My Filed Applications Profile
                </h3>
                <p className="text-xs text-slate-400">Monitor status indicators on roles you applied to across campus.</p>
              </div>

              <div className="space-y-3.5">
                {myApplications.map((app) => (
                  <div 
                    key={app.id} 
                    className="p-4 bg-slate-50/50 rounded-xl border border-slate-150 text-xs flex flex-col gap-2.5 text-left"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="block font-bold text-slate-800 text-[12.5px] truncate">{app.projectTitle}</span>
                        <p className="text-[10px] text-slate-400 font-bold">Applied position: <strong className="text-indigo-650">{app.roleAsked}</strong></p>
                      </div>

                      <span className="px-2.5 py-0.5 font-bold uppercase text-[9px] bg-amber-50 text-amber-700 border border-amber-100 rounded-full flex items-center gap-0.5">
                        <Clock className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} /> {app.status}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-150/45 text-[11px] text-slate-500 font-semibold leading-relaxed">
                      We notified the project founder (<strong className="text-slate-700">Student Leader</strong>) to evaluate your catalog. Acceptances trigger immediate DM notification boxes.
                    </div>
                  </div>
                ))}

                {myApplications.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 rounded-xl space-y-1">
                    <p className="text-slate-400 italic text-xs">No outgoing team applications filed yet.</p>
                    <button 
                      onClick={() => setActiveSubTab('browse')}
                      className="text-xs font-bold text-blue-600 hover:underline inline-block pt-1.5"
                    >
                      Browse project cards to apply →
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* THREE-STEP COLLABORATION CREATION WIZARD SPECS */}
      <AnimatePresence>
        {showWizard && (
          <div className="fixed inset-0 bg-black/45 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100"
            >
              <button 
                type="button"
                onClick={() => setShowWizard(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Progress Stepper labels indicators */}
              <div className="flex gap-1.5 justify-center mb-6">
                {[1, 2, 3].map(st => (
                  <div key={st} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                      wizardStep >= st ? 'bg-blue-600' : 'bg-slate-100'
                    }`} />
                    <span className={`text-[8.5px] font-black uppercase tracking-wider ${
                      wizardStep === st ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}>
                      {st === 1 ? '1. Details' : st === 2 ? '2. Roles' : '3. Timeline'}
                    </span>
                  </div>
                ))}
              </div>

              {/* STEP 1: Details */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-905 text-slate-900 mb-1 flex items-center gap-1.5">
                      <FolderGit2 className="w-5 h-5 text-blue-650" />
                      Initialize Proposal: Specs
                    </h2>
                    <p className="text-xs text-slate-400">Assign a core subject domain and category stage to recruit companions.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Project Title</label>
                    <input
                      type="text"
                      required
                      value={wizardTitle}
                      onChange={(e) => setWizardTitle(e.target.value)}
                      placeholder="e.g. Athena Classroom Peer Scraper"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Project Category</label>
                      <select
                        value={wizardCategory}
                        onChange={e => setWizardCategory(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 focus:outline-none cursor-pointer text-slate-700 font-semibold"
                      >
                        <option value="Education Tech">Education Tech</option>
                        <option value="Research & Tech">Research & Tech</option>
                        <option value="Blockchain & Privacy">Blockchain & Privacy</option>
                        <option value="Healthcare & AI">Healthcare & AI</option>
                        <option value="Sustainability">Sustainability</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Interactive Stage</label>
                      <div className="flex gap-1 bg-slate-50 p-2 border border-slate-200 rounded-xl">
                        {(['Idea', 'In Progress'] as const).map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setWizardStatus(st)}
                            className={`flex-1 text-[10px] py-1 font-bold rounded-lg cursor-pointer ${
                              wizardStatus === st 
                                ? 'bg-blue-600 text-white shadow-sm' 
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Product Scope Manifesto</label>
                    <textarea
                      rows={3}
                      value={wizardDesc}
                      onChange={e => setWizardDesc(e.target.value)}
                      placeholder="Outline the core objective, tech tools planned, and why students should join your group efforts..."
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 font-medium resize-none"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowWizard(false)}
                      className="flex-1 py-3 text-xs border border-slate-200 text-slate-600 font-bold rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      disabled={!wizardTitle.trim() || !wizardDesc.trim()}
                      className={`flex-1 py-3 text-xs text-white font-bold rounded-xl border border-blue-600 flex items-center justify-center gap-1 ${
                        (!wizardTitle.trim() || !wizardDesc.trim()) ? 'bg-blue-400 select-none' : 'bg-blue-650 cursor-pointer hover:bg-blue-700 shadow-md'
                      }`}
                    >
                      Step 2: Declare Roles <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Configure Open Roles */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-1.5 animate-pulse">
                      <Users className="w-5 h-5 text-indigo-650" />
                      Configure Open Vacancies
                    </h2>
                    <p className="text-xs text-slate-400">Detail outstanding roles for students to look up and apply directly.</p>
                  </div>

                  <div className="space-y-1 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-xs">
                    <span className="block font-bold text-indigo-700 leading-none">Popular role presets:</span>
                    <p className="text-indigo-600 font-medium pt-1">
                      Separating desired titles with commas instantiates student recruitment slots automatically.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-505 text-slate-500 uppercase">Split roles list (Comma-separated)</label>
                    <input
                      type="text"
                      value={wizardRoles}
                      onChange={e => setWizardRoles(e.target.value)}
                      placeholder="e.g. Lead iOS Architect, TypeScript Developer, Python ML Modeler"
                      className="w-full text-xs bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl px-3 py-2.5 focus:outline-none"
                    />
                    <span className="text-[9.5px] font-mono text-slate-400 block pt-0.5">Note: Each comma item initiates a dedicated application block on the dashboard.</span>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="flex-1 py-3 text-xs border border-slate-200 text-slate-600 font-bold rounded-xl cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="flex-1 py-3 text-xs bg-indigo-650 text-white font-bold rounded-xl cursor-pointer border border-indigo-600 hover:bg-indigo-700 shadow-md flex items-center justify-center gap-1"
                    >
                      Step 3: Map Milestones <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Setup Timeline milestones */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
                      <Layers className="w-5 h-5 text-emerald-650" />
                      Milestone Timeline Setup
                    </h2>
                    <p className="text-xs text-slate-400">Set initial sprint objectives to display direct collaboration maturity.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Subsequent milestones tasks (Comma separated)</label>
                    <textarea
                      rows={3}
                      value={wizardMilestones}
                      onChange={e => setWizardMilestones(e.target.value)}
                      placeholder="Assemble UI blueprints layout, Implement core schema, Write initial unit evaluations specifications"
                      className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2.5 focus:outline-none font-medium resize-none"
                    />
                    <span className="text-[9.5px] font-mono text-slate-500 block leading-normal">Our system automatically populates progress milestones trackers to establish clear accountability timelines!</span>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="flex-1 py-3 text-xs border border-slate-200 text-slate-600 font-bold rounded-xl cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleCompleteWizard}
                      className="flex-1 py-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl border border-emerald-600 cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1"
                    >
                      Deploy to Workspace <Check className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
