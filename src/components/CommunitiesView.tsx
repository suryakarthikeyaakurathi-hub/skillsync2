import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Community } from '../types';
import { db } from '../firebase';
import { onSnapshot, collection } from 'firebase/firestore';
import { 
  Trophy, 
  Cpu, 
  Palette, 
  Rocket, 
  Search, 
  Users, 
  MessageSquare, 
  Plus, 
  Sparkles, 
  ArrowLeft,
  ArrowRight,
  Hash,
  Volume2,
  ArrowUp,
  MessageCircle,
  FileText,
  X,
  Crown,
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  Info,
  Lock,
  PlusCircle,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Structuring nested interfaces for the Communities workspace
interface ForumComment {
  id: string;
  authorName: string;
  authorMajor: string;
  text: string;
  timestamp: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  creatorName: string;
  creatorMajor: string;
  creatorAvatar: string;
  tags: string[];
  upvotes: number;
  hasUpvoted: boolean;
  comments: ForumComment[];
  createdAt: string;
}

interface CommunityChannelMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

// Bouncy typing bubble configuration
const typingBubbleVariants = {
  initial: { y: 0 },
  animate: {
    y: [-3, 3, -3],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function CommunitiesView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Multi-tier Firestore synced guilds state
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    // Maintain a subscription to the public campus guilds
    const unsubscribe = onSnapshot(
      collection(db, 'communities'),
      (snapshot) => {
        const list: Community[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Community);
        });
        setCommunities(list);
      },
      (error) => {
        console.warn("Firestore access restricted inside CommunitiesView:", error);
      }
    );
    return () => unsubscribe();
  }, []);
  
  // Track which guilds are joined
  const [joinedIds, setJoinedIds] = useState<string[]>(['c2', 'c4']); // Pre-joined two guilds for vibrant discovery
  
  // Track workspace entry
  const [activeCommunityId, setActiveCommunityId] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string>('#-general-chat');

  // Input states inside channels
  const [channelInput, setChannelInput] = useState('');
  const [forumSearch, setForumSearch] = useState('');
  const [selectedForumTag, setSelectedForumTag] = useState('All');

  // Forum creation wizard states
  const [showCreateForumModal, setShowCreateForumModal] = useState(false);
  const [newForumTitle, setNewForumTitle] = useState('');
  const [newForumTag, setNewForumTag] = useState('Help Wanted');
  const [newForumContent, setNewForumContent] = useState('');

  // Active Forum Post detail overlay
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [newCommentInput, setNewCommentInput] = useState('');

  // Simulated peer actions
  const [isClassmateTyping, setIsClassmateTyping] = useState(false);
  const [classmateTypingName, setClassmateTypingName] = useState('');

  // Chat scroll anchor
  const communityChatScrollAnchor = useRef<HTMLDivElement>(null);

  // PRE-BAKED COMPACT COMMUNITY FORUM POSTS (State-managed for interactivity)
  const [forumPostsByCommunity, setForumPostsByCommunity] = useState<Record<string, ForumPost[]>>({
    'c1': [
      {
        id: 'fp-1',
        title: 'Pitching NoteSphere at Stanford Hackathon! Seeking PyTorch & Swift developers',
        content: 'Hey everyone! NoteSphere is an educational workspace linking Markdown documents via an interactive graphical tree (modeled using D3). We are polishing up our core client scripts but we need a specialist who understands PyTorch to bundle semantic embeddings, plus a Swift/SwiftUI engineer for native mobile layout compilation. Looking for active students to join the team, we have 4 roles open!',
        creatorName: 'Jin-Woo Park',
        creatorMajor: 'Full-Stack Developer @ MIT',
        creatorAvatar: 'JP',
        tags: ['Idea Pitch', 'Help Wanted'],
        upvotes: 24,
        hasUpvoted: false,
        createdAt: '4 hours ago',
        comments: [
          {
            id: 'c-1',
            authorName: 'Sarah Jenkins',
            authorMajor: 'AI Researcher @ Stanford',
            text: 'This sounds remarkably compatible with standard vector databases! I have some pre-built huggingface semantic parsers in FastAPI we can easily deploy. Let’s coordinate in the Direct Messages view!',
            timestamp: '2 hours ago'
          }
        ]
      },
      {
        id: 'fp-2',
        title: 'Need a code critique on our secure decentralized auth contract system',
        content: 'We drafted a secure student identity validation scheme inside Go/Solidity but the gas metrics are spiking during credential hashing routines. Is anyone available to do a peer critique or guide us on gas optimization? We want our code to be completely professional prior to submission.',
        creatorName: 'Alex Chen',
        creatorMajor: 'Data Science @ Berkeley',
        creatorAvatar: 'AC',
        tags: ['Code Critique'],
        upvotes: 12,
        hasUpvoted: false,
        createdAt: 'Yesterday',
        comments: []
      }
    ],
    'c2': [
      {
        id: 'fp-3',
        title: 'Reviewing the DeepSeek-V3 Mixture of Experts (MoE) Architecture Paper',
        content: 'I compiled a set of study guidelines explaining how Multi-head Latent Attention and MoE configurations lower inference bottlenecks. Let’s do a study group session in voice room "AI Paper Club" tomorrow evening to discuss local vector token optimizations. I will upload my Markdown slides into the resource room!',
        creatorName: 'Sarah Jenkins',
        creatorMajor: 'AI Researcher @ Stanford',
        creatorAvatar: 'SJ',
        tags: ['Research Insights', 'Study Notes'],
        upvotes: 42,
        hasUpvoted: false,
        createdAt: '2 hours ago',
        comments: [
          {
            id: 'c-3_1',
            authorName: 'Emily Watson',
            authorMajor: 'Computational Bio @ Oxford',
            text: 'I parsed the paper’s segment on dynamic routing balances, exceptionally interesting read! Count me in for the Study Group session tomorrow.',
            timestamp: '1 hour ago'
          }
        ]
      },
      {
        id: 'fp-4',
        title: 'Local LangChain embeddings: index crashing with 10M vectors',
        content: 'Working on structural indexing of medical logs for a medical scribe prototype, but standard FAISS indices are choking on memory thresholds. Should we migrate the database layout to ChromaDB/HNSW indexes or does anyone have a memory pooling routine that is tested and reliable?',
        creatorName: 'Jin-Woo Park',
        creatorMajor: 'Backend Dev @ MIT',
        creatorAvatar: 'JP',
        tags: ['Help Wanted', 'Code Critique'],
        upvotes: 18,
        hasUpvoted: false,
        createdAt: '3 days ago',
        comments: []
      }
    ],
    'c3': [
      {
        id: 'fp-5',
        title: 'Design Review: Does Tailwind bright blue (#3B82F6) pass AAA accessibility contrast?',
        content: 'We are prototyping a gorgeous mobile landing page for student teams. When styled on off-white backgrounds, is the default blue text readable enough to satisfy AAA metrics, or should we shade it darker (e.g., `#1D4ED8`) to protect visually impaired users? I would love feedback from active typography enthusiasts.',
        creatorName: 'Maya Lin',
        creatorMajor: 'HCI UX Designer @ GT',
        creatorAvatar: 'ML',
        tags: ['Design Review', 'UX Research'],
        upvotes: 31,
        hasUpvoted: false,
        createdAt: '1 day ago',
        comments: []
      }
    ],
    'c4': [
      {
        id: 'fp-6',
        title: 'My student chrome extension generated $230 last week! Growth breakdown',
        content: 'An educational toolkit helper facilitating Markdown table rendering on Canvas/LMS portals. I pushed the build live with simple Stripe subscription tiers. Here is a breakdown of how I drove organic traffic via institutional reddit groups and academic Twitter networks without spending an dollar on marketing.',
        creatorName: 'Suryakarthikeya Akurathi',
        creatorMajor: 'CS & AI @ AIT',
        creatorAvatar: 'SA',
        tags: ['Case Study', 'Resources'],
        upvotes: 55,
        hasUpvoted: false,
        createdAt: '5 days ago',
        comments: [
          {
            id: 'c-6_1',
            authorName: 'Alex Chen',
            authorMajor: 'Fintech Entrepreneur @ Berkeley',
            text: 'This is brilliant monetization! Did you encounter any licensing limitations in standard University API payloads?',
            timestamp: '4 days ago'
          }
        ]
      }
    ]
  });

  // PRE-BAKED DISCORD CHANNEL CHAT LOGS (separate arrays per channel)
  const [channelChats, setChannelChats] = useState<Record<string, Record<string, CommunityChannelMessage[]>>>({
    'c1': {
      '#-welcome': [
        { id: 'm1', senderName: 'Maya Lin', senderAvatar: 'ML', senderRole: 'Co-Host', text: 'Welcome to Hackathon Crusaders! 🏆 This server brings student developers and startup pitchers together. Join the forum and look for teammates!', timestamp: 'Wednesday, 2:30 PM', isMe: false }
      ],
      '#-general-chat': [
        { id: 'm2', senderName: 'Alex Chen', senderAvatar: 'AC', senderRole: 'Hacker', text: 'Hey Crusaders! Has anybody reviewed the registration requirements for the upcoming Global CleanTech Venture? Signups close next Friday.', timestamp: '3:45 PM', isMe: false },
        { id: 'm3', senderName: 'Jin-Woo Park', senderAvatar: 'JP', senderRole: 'Full-Stack', text: 'I checked it, we need a complete 2-page slide layout explaining the structural framework. Pitching NoteSphere there could be huge.', timestamp: '3:47 PM', isMe: false }
      ],
      '#-resource-sharing': [
        { id: 'm4', senderName: 'Sarah Jenkins', senderAvatar: 'SJ', senderRole: 'Mentor', text: 'I uploaded my complete PDF handbook "Winning Student Hackathons: From Idea to Interactive Prototype" to the Google Drive shared link. Check it out guys!', timestamp: 'Yesterday, 1:12 PM', isMe: false }
      ]
    },
    'c2': {
      '#-welcome': [
        { id: 'm5', senderName: 'Sarah Jenkins', senderAvatar: 'SJ', senderRole: 'Lab Lead', text: 'Welcome to the AI & Generative Agents Laboratory! 🧠 This space is dedicated to academic research discussions, prompt defense, and GPU clusters alignment.', timestamp: 'Monday', isMe: false }
      ],
      '#-general-chat': [
        { id: 'm6', senderName: 'Emily Watson', senderAvatar: 'EW', senderRole: 'Computational Bio', text: 'Has anyone gotten an API pipeline connected for the model interaction workspace? The latency metrics look quite good.', timestamp: 'Yesterday', isMe: false }
      ],
      '#-resource-sharing': [
        { id: 'm7', senderName: 'Sarah Jenkins', senderAvatar: 'SJ', senderRole: 'Lab Lead', text: 'Sharing my notebook containing safe GPU hyperparameter tuning guidelines. Extremely helpful for large medical datasets.', timestamp: 'May 28', isMe: false }
      ]
    },
    'c3': {
      '#-welcome': [
        { id: 'm8', senderName: 'Maya Lin', senderAvatar: 'ML', senderRole: 'Guild Lead', text: 'Welcome to Creative Product UI Guild! 🎨 We celebrate typographic rhythm, Figma layouts, accessibility compliance, and micro-animations.', timestamp: 'Tuesday', isMe: false }
      ],
      '#-general-chat': [
        { id: 'm9', senderName: 'Maya Lin', senderAvatar: 'ML', senderRole: 'Guild Lead', text: 'Let’s share links for Figma layouts we admire! I’m currently looking at Linear’s smooth dark UI transitions.', timestamp: '12:05 PM', isMe: false }
      ],
      '#-resource-sharing': [
        { id: 'm10', senderName: 'Maya Lin', senderAvatar: 'ML', senderRole: 'Guild Lead', text: 'Here is an accessibility analyzer package to quickly test compliance with web standards. Absolute must-have!', timestamp: 'May 24', isMe: false }
      ]
    },
    'c4': {
      '#-welcome': [
        { id: 'm11', senderName: 'Jin-Woo Park', senderAvatar: 'JP', senderRole: 'Builder', text: 'Welcome to SaaS Builder Collective! 🚀 Best place to build, monetize, and launch side projects during semesters.', timestamp: 'Sunday', isMe: false }
      ],
      '#-general-chat': [
        { id: 'm12', senderName: 'Alex Chen', senderAvatar: 'AC', senderRole: 'Hacker', text: 'Are people launching primarily as PWAs or focusing on Native stores? Native iOS has a high bar but premium user retention.', timestamp: 'Wednesday', isMe: false }
      ],
      '#-resource-sharing': [
        { id: 'm13', senderName: 'Jin-Woo Park', senderAvatar: 'JP', senderRole: 'Builder', text: 'Pushed a complete Express boilerplate with pre-installed Stripe webhooks and SQLite database triggers into GitHub. Check it out!', timestamp: 'Yesterday', isMe: false }
      ]
    }
  });

  // Unique categories extraction
  const categories = useMemo(() => {
    const list = new Set<string>();
    communities.forEach(c => list.add(c.category));
    return Array.from(list);
  }, [communities]);

  // Filtered communities directory
  const filteredCommunities = useMemo(() => {
    return communities.filter(c => {
      const matchText = `${c.name} ${c.description} ${c.category}`.toLowerCase();
      if (searchQuery.trim() && !matchText.includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedCategory !== 'All' && c.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [communities, searchQuery, selectedCategory]);

  const handleToggleJoin = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Avoid navigating into guild when clicking the join button
    if (joinedIds.includes(id)) {
      setJoinedIds(joinedIds.filter(x => x !== id));
    } else {
      setJoinedIds([...joinedIds, id]);
    }
  };

  // Scroll active chat screen on message receipt
  useEffect(() => {
    if (communityChatScrollAnchor.current) {
      communityChatScrollAnchor.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [channelChats, activeChannelId, activeCommunityId]);

  const activeCommunity = communities.find(c => c.id === activeCommunityId);

  // Active Forum Threads list
  const activeForumPosts = useMemo(() => {
    if (!activeCommunityId) return [];
    const posts = forumPostsByCommunity[activeCommunityId] || [];
    return posts.filter(p => {
      const matchSearch = (p.title + p.content + p.tags.join(' ')).toLowerCase().includes(forumSearch.toLowerCase());
      const matchTag = selectedForumTag === 'All' || p.tags.includes(selectedForumTag);
      return matchSearch && matchTag;
    });
  }, [forumPostsByCommunity, activeCommunityId, forumSearch, selectedForumTag]);

  // Handle joining a guild inside the workspace (authorized)
  const joinCurrentGuild = () => {
    if (activeCommunityId && !joinedIds.includes(activeCommunityId)) {
      setJoinedIds([...joinedIds, activeCommunityId]);
    }
  };

  // Handle upvoting
  const handleToggleUpvote = (postId: string) => {
    if (!activeCommunityId) return;

    // Check Guest Mode restriction
    if (!joinedIds.includes(activeCommunityId)) {
      alert("You are in Guest Mode! Join the Guild to interact with academic threads.");
      return;
    }

    setForumPostsByCommunity(prev => {
      const posts = prev[activeCommunityId] || [];
      const updated = posts.map(p => {
        if (p.id !== postId) return p;
        const newHasUpvoted = !p.hasUpvoted;
        return {
          ...p,
          upvotes: newHasUpvoted ? p.upvotes + 1 : p.upvotes - 1,
          hasUpvoted: newHasUpvoted
        };
      });
      return {
        ...prev,
        [activeCommunityId]: updated
      };
    });
  };

  // Handle publishing a new Forum Post
  const handleCreateForumPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommunityId || !newForumTitle.trim() || !newForumContent.trim()) return;

    const newPost: ForumPost = {
      id: `fp-${Date.now()}`,
      title: newForumTitle,
      content: newForumContent,
      creatorName: 'Suryakarthikeya Akurathi',
      creatorMajor: 'CS & AI @ AIT',
      creatorAvatar: 'SA',
      tags: [newForumTag],
      upvotes: 1,
      hasUpvoted: true,
      createdAt: 'Just now',
      comments: []
    };

    setForumPostsByCommunity(prev => ({
      ...prev,
      [activeCommunityId]: [newPost, ...(prev[activeCommunityId] || [])]
    }));

    setNewForumTitle('');
    setNewForumContent('');
    setShowCreateForumModal(false);
  };

  // Handle adding comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommunityId || !selectedPostId || !newCommentInput.trim()) return;

    if (!joinedIds.includes(activeCommunityId)) {
      alert("Please join the Guild to add nested replies.");
      return;
    }

    const newComment: ForumComment = {
      id: `c-${Date.now()}`,
      authorName: 'Suryakarthikeya Akurathi',
      authorMajor: 'CS & AI @ AIT',
      text: newCommentInput,
      timestamp: 'Just now'
    };

    setForumPostsByCommunity(prev => {
      const posts = prev[activeCommunityId] || [];
      const updated = posts.map(p => {
        if (p.id !== selectedPostId) return p;
        return {
          ...p,
          comments: [...p.comments, newComment]
        };
      });
      return {
        ...prev,
        [activeCommunityId]: updated
      };
    });

    setNewCommentInput('');
  };

  // Handle messaging
  const handleSendChannelMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommunityId || !channelInput.trim()) return;

    const typedText = channelInput;
    const newMessage: CommunityChannelMessage = {
      id: `msg-comm-${Date.now()}`,
      senderName: 'Suryakarthikeya Akurathi',
      senderAvatar: 'SA',
      senderRole: 'Student Builder',
      text: typedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    // Update state lists
    setChannelChats(prev => {
      const communityChats = prev[activeCommunityId] || {};
      const currentChChats = communityChats[activeChannelId] || [];
      return {
        ...prev,
        [activeCommunityId]: {
          ...communityChats,
          [activeChannelId]: [...currentChChats, newMessage]
        }
      };
    });

    setChannelInput('');

    // Trigger mentor/peer response simulation after 500ms
    setTimeout(() => {
      const respondsFrom = 
        activeCommunityId === 'c1' ? 'Sarah Jenkins' :
        activeCommunityId === 'c2' ? 'Emily Watson' :
        activeCommunityId === 'c3' ? 'Maya Lin' : 'Jin-Woo Park';

      const respondsFromRole = 
        activeCommunityId === 'c1' ? 'Mentor' :
        activeCommunityId === 'c2' ? 'AI Researcher' :
        activeCommunityId === 'c3' ? 'Guild Lead' : 'Builder Co-Host';

      const respondsAvatar = 
        respondsFrom === 'Sarah Jenkins' ? 'SJ' :
        respondsFrom === 'Emily Watson' ? 'EW' :
        respondsFrom === 'Maya Lin' ? 'ML' : 'JP';

      setIsClassmateTyping(true);
      setClassmateTypingName(respondsFrom);
    }, 450);

    // Stop typing and push final comment
    setTimeout(() => {
      setIsClassmateTyping(false);

      const tutorResponseText = 
        typedText.toLowerCase().includes('github') || typedText.toLowerCase().includes('code')
          ? "Awesome link! Let's clone this into our shared repository and deploy a local Docker layout."
          : typedText.toLowerCase().includes('hello') || typedText.toLowerCase().includes('hi')
            ? "Hello! Great to see new students syncing with our community chat. What are you building?"
            : "That fits our framework perfectly. Let's make sure we review this during our weekly study group meeting!";

      const tutorMessage: CommunityChannelMessage = {
        id: `msg-sim-comm-${Date.now()}`,
        senderName: activeCommunityId === 'c1' ? 'Sarah Jenkins' : activeCommunityId === 'c2' ? 'Emily Watson' : activeCommunityId === 'c3' ? 'Maya Lin' : 'Jin-Woo Park',
        senderAvatar: activeCommunityId === 'c1' ? 'SJ' : activeCommunityId === 'c2' ? 'EW' : activeCommunityId === 'c3' ? 'ML' : 'JP',
        senderRole: activeCommunityId === 'c1' ? 'Mentor' : activeCommunityId === 'c2' ? 'AI Researcher' : activeCommunityId === 'c3' ? 'Guild Lead' : 'Builder Co-Host',
        text: tutorResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      };

      setChannelChats(prev => {
        const communityChats = prev[activeCommunityId] || {};
        const currentChChats = communityChats[activeChannelId] || [];
        return {
          ...prev,
          [activeCommunityId]: {
            ...communityChats,
            [activeChannelId]: [...currentChChats, tutorMessage]
          }
        };
      });
    }, 1800);
  };

  // Safe layout extraction of active text messages
  const activeMessageHistory = useMemo(() => {
    if (!activeCommunityId) return [];
    const communityChats = channelChats[activeCommunityId] || {};
    return communityChats[activeChannelId] || [];
  }, [channelChats, activeCommunityId, activeChannelId]);

  return (
    <div className="space-y-6">
      
      {/* 1. MAIN COMMUNITIES SEARCH & DIRECTORY VIEW (If activeCommunityId is NULL) */}
      <AnimatePresence mode="wait">
        {!activeCommunityId ? (
          <motion.div
            key="directory"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
                  Campus Communities Guild
                </h1>
                <p className="text-sm text-slate-500">
                  Sync with technical interest networks, upvote academic forum boards, and coordinate in real-time
                </p>
              </div>
            </div>

            {/* Banner Block */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-sm">
              <div className="absolute right-0 bottom-0 -mb-24 -mr-12 w-64 h-64 rounded-full bg-white/10 blur-xl"></div>
              <div className="relative z-10 space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wide">
                  <Trophy className="w-3.5 h-3.5 text-yellow-300" />
                  Academic Forums & Discord Chat Sync
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight">Sync With Regional Student Guilds</h2>
                <p className="text-emerald-50 text-xs max-w-lg leading-relaxed font-sans">
                  Gain senior mentoring feedback, pitch hackathon prototypes, join active study rooms, and review local peer code structures inside immersive chat environments.
                </p>
              </div>
            </div>

            {/* Quick search and filter block */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm-light">
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`text-xs px-3.5 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
                    selectedCategory === 'All'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-150 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  All Hubs
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-3.5 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-150 hover:bg-slate-200 text-slate-600'
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
                  placeholder="Filter communities..."
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Communities Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
              {filteredCommunities.map((c) => {
                const hasJoined = joinedIds.includes(c.id);
                return (
                  <motion.div
                    key={c.id}
                    layout
                    whileHover={{ y: -2 }}
                    className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
                    onClick={() => {
                      setActiveCommunityId(c.id);
                      // Default to general chat channel
                      setActiveChannelId('#-general-chat');
                    }}
                  >
                    <div className="space-y-3.5">
                      {/* Brand Logo & Name */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl text-white flex items-center justify-center shadow-inner ${
                            c.iconName === 'Trophy' ? 'bg-amber-500' :
                            c.iconName === 'Cpu' ? 'bg-indigo-500' :
                            c.iconName === 'Palette' ? 'bg-teal-500' : 'bg-blue-500'
                          }`}>
                            {c.iconName === 'Trophy' ? <Trophy className="w-5.5 h-5.5" /> :
                             c.iconName === 'Cpu' ? <Cpu className="w-5.5 h-5.5" /> :
                             c.iconName === 'Palette' ? <Palette className="w-5.5 h-5.5" /> :
                             <Rocket className="w-5.5 h-5.5" />}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-sm md:text-base group-hover:text-emerald-600 transition-all flex items-center gap-1.5">
                              {c.name}
                            </h3>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono font-bold uppercase mt-1 inline-block">
                              {c.category}
                            </span>
                          </div>
                        </div>

                        {/* Leave or Join */}
                        <button
                          onClick={(e) => handleToggleJoin(c.id, e)}
                          className={`text-xs px-3 py-1.5 font-extrabold rounded-lg transition-colors cursor-pointer ${
                            hasJoined
                              ? 'bg-rose-50 text-rose-600 border border-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
                          }`}
                        >
                          {hasJoined ? 'Leave' : 'Join'}
                        </button>
                      </div>

                      {/* Detail description */}
                      <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
                        {c.description}
                      </p>
                    </div>

                    <div className="pt-3.5 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400 select-none">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span><strong className="text-slate-700 font-extrabold">{c.memberCount}</strong> active peers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-emerald-600 font-extrabold">Open Discord Space →</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredCommunities.length === 0 && (
              <div className="text-center p-12 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                <Users className="w-12 h-12 text-slate-300 mb-3" />
                <h3 className="font-extrabold text-slate-800 text-sm mb-1">No Communities Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                  Be the first to join or create communities on campus! Or check back later.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          
          /* 2. DISCORD COMMUNITY WORKSPACE SCREEN (If activeCommunityId is NOT NULL) */
          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-slate-100 rounded-2xl shadow-sm h-[calc(100vh-13rem)] flex overflow-hidden relative"
          >
            {/* WORKSPACE COLUMN A: Discord Text Channels Navigation Sidebar (Left side, width 60) */}
            <div className="w-56 md:w-60 bg-slate-900 flex flex-col justify-between shrink-0 text-white select-none relative z-20">
              
              <div className="space-y-4">
                
                {/* Header title */}
                <div className="p-3 bg-slate-950 border-b border-white/5 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="block font-black text-xs md:text-sm text-white leading-none truncate tracking-tight pr-1">
                      {activeCommunity?.name}
                    </span>
                    <span className="text-[9px] text-zinc-400 block mt-1.5 font-bold uppercase tracking-wider">
                      ● Discord Sync
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 cursor-pointer hover:text-white" />
                </div>

                {/* Back button link to main Directory */}
                <div className="px-3">
                  <button 
                    onClick={() => setActiveCommunityId(null)}
                    className="w-full text-left text-[11px] font-bold bg-white/5 hover:bg-white/10 px-2.5 py-2 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Hub Directory
                  </button>
                </div>

                {/* Channels Directory List */}
                <div className="px-2 space-y-3.5 overflow-y-auto max-h-[calc(100vh-27rem)] pr-1 scrollbar-thin">
                  
                  {/* Category Section: Text Channels */}
                  <div className="space-y-0.5">
                    <span className="block text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider pl-1.5 mb-1.5">
                      Text Channels
                    </span>
                    
                    {['#-welcome', '#-general-chat', '#-resource-sharing'].map(chId => {
                      const isActive = activeChannelId === chId;
                      return (
                        <button
                          key={chId}
                          onClick={() => setActiveChannelId(chId)}
                          className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                            isActive 
                              ? 'bg-zinc-800 text-white font-bold' 
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 font-medium'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <Hash className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                            {chId.replace('#-', '')}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Category Section: Forums */}
                  <div className="space-y-0.5">
                    <span className="block text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider pl-1.5 mb-1.5">
                      Community Boards
                    </span>
                    <button
                      onClick={() => setActiveChannelId('#-forum-board')}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        activeChannelId === '#-forum-board'
                          ? 'bg-zinc-800 text-white font-bold' 
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 font-medium'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate text-emerald-400">
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        🏛️-forum-board
                      </span>
                    </button>
                  </div>

                  {/* Category Section: Voice Spaces */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between pl-1.5 mb-1.5 select-none">
                      <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider">
                        Live Voice Rooms
                      </span>
                    </div>

                    <button
                      onClick={() => alert(`Connecting securely to voice room broadcast channel. Microphone state requested.`)}
                      className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-805 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 truncate text-indigo-350">
                        <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                        🔊 Academic Lounge
                      </span>
                    </button>
                    <button
                      onClick={() => alert(`Joining voice prep sequence...`)}
                      className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-805 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 truncate text-indigo-350">
                        <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                        🔊 Hackathon Prep
                      </span>
                    </button>
                  </div>

                </div>
              </div>

              {/* Bottom profile marker in DM sidebar background */}
              <div className="p-3 bg-slate-950/60 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                    SA
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-black truncate text-slate-105">Suryakarthikeya</span>
                    <span className="text-[8px] text-zinc-500 font-bold block leading-none">STUDENT</span>
                  </div>
                </div>
              </div>

            </div>

            {/* WORKSPACE COLUMN B: Primary Chat Viewport & Forum Canvas (Center space) */}
            <div className="flex-1 flex flex-col justify-between h-full bg-slate-50/50 relative z-10 min-w-0">
              
              {/* TOP HUB CONTEXT BAR */}
              <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between relative z-10 select-none">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-slate-500 font-bold text-xs">{activeChannelId === '#-forum-board' ? '🏛️' : '#'}</span>
                  <span className="font-extrabold text-slate-900 text-xs md:text-sm truncate">
                    {activeChannelId.replace('#-', '')}
                  </span>
                  <span className="text-slate-200">|</span>
                  <p className="text-[10px] text-slate-400 font-medium truncate hidden md:block">
                    {activeChannelId === '#-forum-board' 
                      ? 'Academic discussion cards, matching metrics, and active project requests' 
                      : 'Real-time collaborative text loop with instant mentor feed'
                    }
                  </p>
                </div>

                {/* Status of Guest vs Joined */}
                <div className="flex items-center gap-2">
                  {!joinedIds.includes(activeCommunityId!) ? (
                    <span className="bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded-md border border-amber-100 font-extrabold flex items-center gap-1 animate-pulse">
                      <Lock className="w-3 h-3 text-amber-500" />
                      Guest Mode
                    </span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-0.5 rounded-md border border-emerald-100 font-extrabold">
                      ✓ Joined Member
                    </span>
                  )}
                </div>
              </div>

              {/* GUEST BANNER ALIGNMENT BAR */}
              {!joinedIds.includes(activeCommunityId!) && (
                <div className="bg-amber-500 text-white text-[11px] px-4 py-2 flex items-center justify-between font-bold shadow-inner flex-shrink-0 animate-fade-in z-10">
                  <span className="flex items-center gap-1.5">
                    <Info className="w-4 h-4" />
                    You are viewing in Guest Mode. Join the Guild to post messages, add replies, and upvote academic threads!
                  </span>
                  <button 
                    onClick={joinCurrentGuild}
                    className="bg-white text-amber-700 px-3 py-1 rounded-lg text-[10px] hover:bg-slate-100 transition-colors font-black cursor-pointer"
                  >
                    Join Guild Now
                  </button>
                </div>
              )}

              {/* CORE RENDERING AREA (Text Chat or Forum Board) */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-slate-50/30">
                
                {/* CASE 1: Forum Board active */}
                {activeChannelId === '#-forum-board' ? (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col h-full scrollbar-thin">
                    
                    {/* Welcome banner */}
                    <div className="bg-emerald-50/55 border border-emerald-100 rounded-xl p-4 flex items-start gap-3 flex-shrink-0 select-none">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold font-sans text-lg">
                        💡
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-emerald-950 font-extrabold text-xs">Community Forum Bounty Board</h4>
                        <p className="text-[11px] text-emerald-800 mt-0.5 leading-normal font-sans">
                          A structural bulletin board where student teams recruit collaborators, request feedback, and share technical documentation. Upvote the best insights!
                        </p>
                      </div>
                    </div>

                    {/* Filter controls */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm-light flex-shrink-0">
                      
                      <div className="flex flex-wrap gap-1 font-mono">
                        {['All', 'Help Wanted', 'Idea Pitch', 'Code Critique', 'Research Insights'].map(tag => (
                          <button
                            key={tag}
                            onClick={() => setSelectedForumTag(tag)}
                            className={`text-[10px] px-2.5 py-1 rounded-md border transition-all cursor-pointer font-bold ${
                              selectedForumTag === tag
                                ? 'bg-emerald-600 text-white border-emerald-600 font-extrabold shadow-sm'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2 items-center">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={forumSearch}
                            onChange={(e) => setForumSearch(e.target.value)}
                            placeholder="Filter discussions..."
                            className="text-xs pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <button
                          onClick={() => {
                            if (!joinedIds.includes(activeCommunityId!)) {
                              alert("Please join this Guild to publish forum threads!");
                              return;
                            }
                            setShowCreateForumModal(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-black transition-colors flex items-center gap-1 cursor-pointer select-none"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          New Thread
                        </button>
                      </div>

                    </div>

                    {/* Posts Listings */}
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {activeForumPosts.length === 0 ? (
                        <div className="text-center py-12 select-none">
                          <p className="text-slate-450 italic text-xs">No active forum threads match your selection</p>
                        </div>
                      ) : (
                        activeForumPosts.map(post => (
                          <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-slate-150 p-4 rounded-xl shadow-none flex gap-4 hover:border-emerald-500/40 transition-colors cursor-pointer group"
                            onClick={() => setSelectedPostId(post.id)}
                          >
                            {/* Upvote side block */}
                            <div className="flex flex-col items-center justify-start shrink-0 select-none">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Avoid triggering full post detail popup
                                  handleToggleUpvote(post.id);
                                }}
                                className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                  post.hasUpvoted 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold' 
                                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500'
                                }`}
                                title="Upvote structural comment"
                              >
                                <ArrowUp className={`w-4.5 h-4.5 ${post.hasUpvoted ? 'stroke-[2.5]' : ''}`} />
                                <span className="text-[10px] mt-0.5">{post.upvotes}</span>
                              </button>
                            </div>

                            {/* Middle main block */}
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex flex-wrap gap-1.5 items-center">
                                {post.tags.map(t => (
                                  <span 
                                    key={t} 
                                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded font-mono ${
                                      t === 'Help Wanted' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                      t === 'Idea Pitch' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                      t === 'Code Critique' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                      'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    }`}
                                  >
                                    {t}
                                  </span>
                                ))}
                                <span className="text-[10px] text-slate-400 font-bold">• posted by <strong className="text-zinc-600 font-extrabold">{post.creatorName}</strong></span>
                                <span className="text-[10px] text-slate-400">({post.createdAt})</span>
                              </div>

                              <h3 className="font-extrabold text-sm md:text-base text-slate-800 leading-snug group-hover:text-emerald-600 transition-colors">
                                {post.title}
                              </h3>

                              <p className="text-xs text-slate-500 leading-normal line-clamp-2 pr-2 font-sans font-medium">
                                {post.content}
                              </p>

                              <div className="flex items-center gap-1 text-[11px] text-slate-450 pt-1 font-bold">
                                <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                                <span>{post.comments.length} student replies</span>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>

                  </div>
                ) : (
                  
                  /* CASE 2: Text Channel is active */
                  <div className="flex-1 flex flex-col justify-between h-full min-h-0">
                    
                    {/* Flowing dialogue loop */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
                      
                      {/* Welcome message wrapper */}
                      <div className="bg-indigo-50/40 border border-indigo-100/50 p-4 rounded-xl text-center max-w-md mx-auto space-y-2 mb-4 select-none">
                        <span className="text-indigo-600 font-extrabold text-xs">COMMUNITY BROADCAST SECURE CHANNEL</span>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
                          You loaded channel <strong>{activeChannelId}</strong>. Maintain professional, constructive academic speech guidelines.
                        </p>
                      </div>

                      {activeMessageHistory.map((msg) => (
                        <div 
                          key={msg.id}
                          className={`flex items-start gap-2.5 ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`w-8 h-8 rounded-full text-white font-extrabold text-[10px] shrink-0 flex items-center justify-center ${
                            msg.senderAvatar === 'SA' ? 'bg-indigo-600' : 'bg-zinc-600'
                          }`}>
                            {msg.senderAvatar}
                          </div>
                          
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 select-none">
                              <span className="text-[10px] font-black text-slate-700">{msg.senderName}</span>
                              <span className="text-[8px] bg-slate-100 text-slate-550 px-1 py-0.2 rounded font-mono font-bold uppercase">{msg.senderRole}</span>
                              <span className="text-[8px] text-slate-400 font-mono">{msg.timestamp}</span>
                            </div>
                            
                            <div className={`max-w-md rounded-xl p-3 text-xs md:text-sm leading-relaxed ${
                              msg.isMe 
                                ? 'bg-emerald-600 text-white rounded-tr-none shadow-sm' 
                                : 'bg-white border border-slate-150 text-slate-800 rounded-tl-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                            }`}>
                              <p className="break-words font-sans font-medium">{msg.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Instructor / Classmate simulated typing status */}
                      {isClassmateTyping && (
                        <div className="flex justify-start items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-200 font-extrabold text-[10px] flex items-center justify-center text-slate-600">
                            P
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-150 rounded-2xl rounded-bl-none text-xs text-slate-500">
                            <span className="font-semibold text-slate-600">{classmateTypingName} is typing</span>
                            <div className="flex gap-1 ml-0.5 items-center justify-center">
                              <motion.span variants={typingBubbleVariants} initial="initial" animate="animate" className="w-1.5 h-1.5 bg-slate-500 rounded-full" transition={{ delay: 0 }} />
                              <motion.span variants={variants => typingBubbleVariants} initial="initial" animate="animate" className="w-1.5 h-1.5 bg-slate-500 rounded-full" transition={{ delay: 0.15 }} />
                              <motion.span variants={variants => typingBubbleVariants} initial="initial" animate="animate" className="w-1.5 h-1.5 bg-slate-500 rounded-full" transition={{ delay: 0.3 }} />
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={communityChatScrollAnchor} />
                    </div>

                    {/* Bottom Chat Input Form */}
                    <div className="p-3 bg-white border-t border-slate-100 flex-shrink-0">
                      <form onSubmit={handleSendChannelMessage} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={channelInput}
                          onChange={(e) => setChannelInput(e.target.value)}
                          placeholder={joinedIds.includes(activeCommunityId!) ? `Type message in channel ${activeChannelId}...` : 'You must join this guild to participate in chat...'}
                          disabled={!joinedIds.includes(activeCommunityId!)}
                          className="flex-1 text-xs md:text-sm bg-slate-50 border border-slate-250 hover:bg-slate-100/50 disabled:bg-slate-100 disabled:cursor-not-allowed px-4 py-2.5 rounded-xl focus:outline-none focus:border-emerald-600 transition-all font-sans"
                        />
                        <button
                          type="submit"
                          disabled={!channelInput.trim() || !joinedIds.includes(activeCommunityId!)}
                          className={`rounded-xl p-2.5 shadow-md active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                            channelInput.trim() && joinedIds.includes(activeCommunityId!)
                              ? 'bg-emerald-600 text-white shadow-emerald-505 hover:bg-emerald-700' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                          }`}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* WORKSPACE COLUMN C: Live Guild Members panel (Right side - Desktop visible only) */}
            <div className="hidden xl:flex flex-col w-56 border-l border-slate-100 bg-white justify-between text-slate-800 select-none pb-4">
              
              <div className="p-4 space-y-5">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Guild Directory
                </span>

                {/* Section: Mentors */}
                <div className="space-y-3">
                  <span className="block text-[8px] font-black text-slate-450 uppercase tracking-wider">
                    Online — Mentors (1)
                  </span>
                  
                  <div className="flex items-center gap-2 relative">
                    <div className="relative shrink-0">
                      <div className="w-7 h-7 rounded-full bg-indigo-500 font-extrabold text-[10px] flex items-center justify-center text-white">
                        SJ
                      </div>
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-800 leading-none flex items-center gap-1">
                        Sarah Jenkins
                        <Crown className="w-3 h-3 text-amber-500" />
                      </span>
                      <span className="text-[9px] text-slate-400 block mt-0.5 font-medium truncate">Stanford AI Lead</span>
                    </div>
                  </div>
                </div>

                {/* Section: Active peers */}
                <div className="space-y-3">
                  <span className="block text-[8px] font-black text-slate-450 uppercase tracking-wider">
                    Online — Academic Peers (2)
                  </span>

                  <div className="flex items-center gap-2 relative cursor-pointer" onClick={() => alert("Connecting direct layout conversation...")}>
                    <div className="relative shrink-0">
                      <div className="w-7 h-7 rounded-full bg-teal-500 font-extrabold text-[10px] flex items-center justify-center text-white">
                        ML
                      </div>
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-800 leading-none">Maya Lin</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5 font-medium truncate">Figma UI Lead @ GT</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 relative">
                    <div className="relative shrink-0">
                      <div className="w-7 h-7 rounded-full bg-amber-500 font-extrabold text-[10px] shrink-0 flex items-center justify-center text-white">
                        JP
                      </div>
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-amber-400 rounded-full border border-white font-sans" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-800 leading-none truncate">Jin-Woo Park</span>
                      <span className="text-[9px] text-slate-450 block mt-0.5 font-medium truncate">Rust & Go Dev</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* FLOATING CREATION MODAL FOR NEW DISCUSSION THREADS */}
            <AnimatePresence>
              {showCreateForumModal && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                  onClick={() => setShowCreateForumModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 15 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl shadow-xl border border-slate-150 w-full max-w-lg overflow-hidden flex flex-col"
                  >
                    
                    {/* Header */}
                    <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-extrabold text-sm md:text-base text-slate-900 leading-none">Publish New discussion Thread</h3>
                      </div>
                      <button 
                        onClick={() => setShowCreateForumModal(false)}
                        className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Form bodies */}
                    <form onSubmit={handleCreateForumPost} className="p-5 space-y-4 text-xs font-sans">
                      
                      <div className="space-y-1.5">
                        <label className="block text-slate-600 font-bold">Discussion Title</label>
                        <input
                          type="text"
                          required
                          value={newForumTitle}
                          onChange={(e) => setNewForumTitle(e.target.value)}
                          placeholder="e.g. Pitching NoteSphere: looking for skilled compilers & designers..."
                          className="w-full text-xs md:text-sm px-3 py-2.5 bg-slate-50 border border-slate-250 focus:bg-white focus:border-emerald-600 focus:outline-none rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-slate-600 font-bold">Category Flag / Tag Selection</label>
                        <select
                          value={newForumTag}
                          onChange={(e) => setNewForumTag(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-250 focus:bg-white focus:border-emerald-600 focus:outline-none rounded-xl font-bold cursor-pointer"
                        >
                          <option value="Help Wanted">Help Wanted (Recruitment)</option>
                          <option value="Idea Pitch">Idea Pitch (Product Pitch)</option>
                          <option value="Code Critique">Code Critique (Technical Review)</option>
                          <option value="Research Insights">Research Insights (Study notes)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-slate-600 font-bold">Thread Body Narrative</label>
                        <textarea
                          required
                          rows={4}
                          value={newForumContent}
                          onChange={(e) => setNewForumContent(e.target.value)}
                          placeholder="Provide details about structural goals, technology stacks, timelines, or areas requested..."
                          className="w-full text-xs md:text-sm px-3 py-2.5 bg-slate-50 border border-slate-250 focus:bg-white focus:border-emerald-600 focus:outline-none rounded-xl resize-none font-medium leading-relaxed"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-3 select-none">
                        <button
                          type="button"
                          onClick={() => setShowCreateForumModal(false)}
                          className="px-4 py-2 hover:bg-slate-100 text-slate-500 rounded-lg font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black transition-colors"
                        >
                          Publish Thread
                        </button>
                      </div>

                    </form>

                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FORUM THREAD DETAIL DIALOG DRAWER (Click to open full posts and reply) */}
            <AnimatePresence>
              {selectedPostId && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/40 z-50 flex items-center justify-end"
                  onClick={() => setSelectedPostId(null)}
                >
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white h-full w-full max-w-xl shadow-2xl flex flex-col justify-between overflow-hidden relative z-50"
                  >
                    
                    {/* Header bar area */}
                    <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between select-none shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-mono font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-100">
                          Academic Thread Detail
                        </span>
                      </div>
                      <button 
                        onClick={() => setSelectedPostId(null)}
                        className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-650 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Detailed Content scroll zone */}
                    {activeCommunityId && (
                      <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans">
                        {(() => {
                          const posts = forumPostsByCommunity[activeCommunityId] || [];
                          const post = posts.find(p => p.id === selectedPostId);
                          if (!post) return <p className="text-xs text-slate-450 italic">Error: Thread deleted or unavailable.</p>;

                          return (
                            <>
                              {/* Original author details card */}
                              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 select-none">
                                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-extrabold flex items-center justify-center shadow-inner text-sm">
                                  {post.creatorAvatar}
                                </div>
                                <div className="min-w-0">
                                  <span className="block font-black text-slate-900 text-xs md:text-sm">{post.creatorName}</span>
                                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5 underline uppercase tracking-wide">{post.creatorMajor}</span>
                                </div>
                              </div>

                              {/* Title and details body */}
                              <div className="space-y-3">
                                <h2 className="font-extrabold text-slate-900 text-base md:text-lg leading-snug">
                                  {post.title}
                                </h2>
                                <p className="text-slate-650 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                  {post.content}
                                </p>
                              </div>

                              <div className="flex items-center justify-between bg-slate-50/50 p-2.5 rounded-lg text-[11px] text-slate-400 select-none font-bold">
                                <span>Published: <strong className="text-slate-700">{post.createdAt}</strong></span>
                                <span className="text-emerald-700 font-bold">♥ Upvotes: {post.upvotes}</span>
                              </div>

                              <hr className="border-slate-100" />

                              {/* Nested replies segment */}
                              <div className="space-y-4">
                                <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                  Community Replies ({post.comments.length})
                                </span>

                                {post.comments.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic py-3 select-none">No student replies added yet. Be the first to coordinate!</p>
                                ) : (
                                  <div className="space-y-3">
                                    {post.comments.map(c => (
                                      <div key={c.id} className="bg-slate-50/40 border border-slate-150 p-3 rounded-xl space-y-1.5 shadow-none transition-shadow hover:shadow-sm">
                                        <div className="flex items-center justify-between select-none">
                                          <span className="font-extrabold text-xs text-indigo-700">{c.authorName}</span>
                                          <span className="text-[9px] text-slate-400 font-mono">{c.timestamp}</span>
                                        </div>
                                        <span className="text-[9px] text-slate-400 font-medium block leading-none">{c.authorMajor}</span>
                                        <p className="text-xs text-slate-600 leading-normal font-medium">{c.text}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {/* Bottom comment box wizard */}
                    <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                      <form onSubmit={handleAddComment} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newCommentInput}
                          onChange={(e) => setNewCommentInput(e.target.value)}
                          placeholder={joinedIds.includes(activeCommunityId!) ? "Post helpful comment / guidance reply..." : "Join Guild to post comment..."}
                          disabled={!joinedIds.includes(activeCommunityId!)}
                          className="flex-1 text-xs md:text-sm bg-slate-50 disabled:bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 transition-all font-sans"
                        />
                        <button
                          type="submit"
                          disabled={!newCommentInput.trim() || !joinedIds.includes(activeCommunityId!)}
                          className={`rounded-xl px-4 py-2.5 text-xs font-black select-none cursor-pointer active:scale-95 transition-all ${
                            newCommentInput.trim() && joinedIds.includes(activeCommunityId!)
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                          }`}
                        >
                          Submit
                        </button>
                      </form>
                    </div>

                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
