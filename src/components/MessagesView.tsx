import React, { useState, useEffect, useRef } from 'react';
import { ChatThread, Message, Student } from '../types';
import { db } from '../firebase';
import { onSnapshot, collection, doc, setDoc } from 'firebase/firestore';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Image, 
  File, 
  Check, 
  CheckCheck,
  ChevronLeft,
  Sparkles,
  RefreshCw,
  Smile,
  GraduationCap,
  Calendar,
  Layers,
  MapPin,
  ExternalLink,
  Users,
  Shield,
  Clock,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  me: Student;
  activeThreadId: string;
  setActiveThreadId: (id: string | null) => void;
}

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

const AVAILABLE_REACTIONS = ['👍', '🔥', '❤️', '🚀', '🎓'];

export default function MessagesView({ me, activeThreadId, setActiveThreadId }: Props) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [inputText, setInputText] = useState('');
  const [threadSearch, setThreadSearch] = useState('');
  const [activePartnerDetail, setActivePartnerDetail] = useState<'profile' | null>('profile'); // Open by default for high fidelity presentation
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [typingName, setTypingName] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  // Auto scroll reference
  const scrollRef = useRef<HTMLDivElement>(null);

  // 0. Fetch students to resolve detailed communication partners dynamically
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'students'),
      (snapshot) => {
        const list: Student[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Student);
        });
        setStudents(list);
      },
      (error) => {
        console.warn("Firestore access restricted inside MessagesView students:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  // 1. Cloud listener over public chat threads
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'threads'),
      (snapshot) => {
        const list: ChatThread[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as ChatThread);
        });
        setThreads(list);
      },
      (error) => {
         console.warn("Firestore collection subscription restricted inside MessagesView threads:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Cloud sub-collection listener over active conversation chat history
  useEffect(() => {
    if (!activeThreadId) return;

    const unsubscribe = onSnapshot(
      collection(db, 'threads', activeThreadId, 'messages'),
      (snapshot) => {
        const msgs: Message[] = [];
        snapshot.forEach((docSnap) => {
          msgs.push(docSnap.data() as Message);
        });
        
        // Chronological sorting alignment over alphanumeric or sequence indices
        msgs.sort((a, b) => a.id.localeCompare(b.id));

        setAllMessages(prev => ({
          ...prev,
          [activeThreadId]: msgs
        }));
      },
      (error) => {
        console.warn("Firestore subcollection subscription restricted for messages:", error);
      }
    );
    return () => unsubscribe();
  }, [activeThreadId]);

  // Set default active thread if none exists
  useEffect(() => {
    if (!activeThreadId && threads.length > 0) {
      setActiveThreadId(threads[0].id);
    }
  }, [activeThreadId, threads, setActiveThreadId]);

  // Scroll to bottom on new message or typing simulation changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages, activeThreadId, isPartnerTyping]);

  // Read message handler
  useEffect(() => {
    if (activeThreadId) {
      setThreads(prev => 
        prev.map(t => t.id === activeThreadId ? { ...t, unreadCount: 0 } : t)
      );
    }
  }, [activeThreadId]);

  // Active thread contents
  const currentThread = threads.find(t => t.id === activeThreadId);
  const currentMessages = activeThreadId ? (allMessages[activeThreadId] || []) : [];

  // Filter threads based on search
  const filteredThreads = threads.filter(t => 
    t.participantName.toLowerCase().includes(threadSearch.toLowerCase()) ||
    t.participantRole.toLowerCase().includes(threadSearch.toLowerCase())
  );

  // Find the detailed student object of the conversation partner
  const activePartner = students.find(s => s.name === currentThread?.participantName) || {
    id: 'partner',
    name: currentThread?.participantName || 'Teammate',
    avatar: currentThread?.participantAvatar || 'T',
    university: me.university,
    major: currentThread?.participantRole || 'AI Researcher',
    year: 'Senior Year',
    bio: 'Collaborating peer on high-impact study prototypes and development stacks.',
    skills: me.skills,
    interests: me.interests,
    availability: 'Available' as const,
    email: 'peer@skillsync.edu'
  };

  // Reactions click handler
  const handleReactToMessage = (messageId: string, emoji: string) => {
    setAllMessages(prev => {
      const messagesForThread = prev[activeThreadId] || [];
      const updated = messagesForThread.map(msg => {
        if (msg.id !== messageId) return msg;
        const reactions = msg.reactions ? [...msg.reactions] : [];
        const existing = reactions.find(r => r.emoji === emoji);
        if (existing) {
          if (existing.users.includes('me')) {
            existing.users = existing.users.filter(u => u !== 'me');
            existing.count = Math.max(0, existing.count - 1);
          } else {
            existing.users.push('me');
            existing.count += 1;
          }
        } else {
          reactions.push({ emoji, count: 1, users: ['me'] });
        }
        return {
          ...msg,
          reactions: reactions.filter(r => r.count > 0)
        };
      });
      return {
        ...prev,
        [activeThreadId]: updated
      };
    });
  };

  // Handle message send & simulation
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThreadId) return;

    const savedInput = inputText;
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: me.id,
      senderName: me.name,
      senderAvatar: me.avatar,
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      reactions: []
    };

    // Commit message to Firestore database
    try {
      setDoc(doc(db, 'threads', activeThreadId, 'messages', newMessage.id), newMessage);
      if (currentThread) {
        setDoc(doc(db, 'threads', activeThreadId), {
          ...currentThread,
          lastMessage: savedInput,
          lastMessageTime: 'Just now'
        });
      }
    } catch (err) {
      console.error("Failed to persist user chat to cloud database", err);
    }

    setInputText('');

    // Start partner typing simulation after 350ms
    setTimeout(() => {
      setTypingName(currentThread?.participantName || 'Peer');
      setIsPartnerTyping(true);
    }, 400);

    // Turn off typing and deliver automatic response after 1800ms
    setTimeout(async () => {
      setIsPartnerTyping(false);

      const responseText = 
        savedInput.toLowerCase().includes('hello') || savedInput.toLowerCase().includes('hi')
          ? `Hey ${me.name.split(' ')[0]}! Great to hear from you. I was checking out our next milestones. Let me know what to coordinate first!`
          : savedInput.toLowerCase().includes('meeting') || savedInput.toLowerCase().includes('call')
            ? `Sounds solid! Let's schedule a Zoom/Audio meeting via the calendar integration or click the WebRTC icon in the toolbar! 🚀`
            : `I completely agree. Your draft proposal is elegant. Let's make sure we integrate this into our workspace repository right layout!`;

      const tutorResponse: Message = {
        id: `msg-sim-${Date.now()}`,
        senderId: 'partner',
        senderName: currentThread?.participantName || 'Sarah Jenkins',
        senderAvatar: currentThread?.participantAvatar || 'SJ',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        reactions: [{ emoji: '🔥', count: 1, users: ['partner'] }]
      };

      try {
        await setDoc(doc(db, 'threads', activeThreadId, 'messages', tutorResponse.id), tutorResponse);
        if (currentThread) {
          await setDoc(doc(db, 'threads', activeThreadId), {
            ...currentThread,
            lastMessage: responseText,
            lastMessageTime: 'Just now'
          });
        }
      } catch (err) {
        console.error("Failed to commit simulation chat to cloud database", err);
      }
    }, 1800);
  };

  return (
    <div id="discord-style-dm-canvas" className="bg-white border border-slate-100 rounded-2xl shadow-sm h-[calc(100vh-13rem)] flex overflow-hidden">
      
      {/* COLUMN 1: Active Conversations Sidebar (Left - width 80) */}
      <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col justify-between shrink-0 ${
        activeThreadId ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 flex flex-col h-full min-h-0">
          
          {/* Header search controls */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                Partner Inbox
              </h2>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-extrabold">
                {threads.reduce((acc, t) => acc + t.unreadCount, 0)} New
              </span>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={threadSearch}
                onChange={(e) => setThreadSearch(e.target.value)}
                placeholder="Search direct messages..."
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* DM Active List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {filteredThreads.map(thr => {
              const isActive = thr.id === activeThreadId;
              const onlineStatus = thr.participantName.includes('Sarah') ? 'online' : thr.participantName.includes('Maya') ? 'idle' : 'offline';
              return (
                <div
                  key={thr.id}
                  onClick={() => setActiveThreadId(thr.id)}
                  id={`thread-select-${thr.id}`}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all border ${
                    isActive 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10' 
                      : 'hover:bg-slate-50 border-transparent text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    
                    {/* Rounded avatar layout with status indicators */}
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full font-extrabold text-xs flex items-center justify-center text-white ${
                        isActive 
                          ? 'bg-white/20' 
                          : thr.participantAvatar === 'SJ' ? 'bg-indigo-500' :
                            thr.participantAvatar === 'ML' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}>
                        {thr.participantAvatar}
                      </div>
                      
                      {/* Discord Style Presence Dot */}
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        onlineStatus === 'online' ? 'bg-emerald-500' :
                        onlineStatus === 'idle' ? 'bg-amber-500' : 'bg-slate-400'
                      }`} title={onlineStatus.toUpperCase()} />
                    </div>

                    <div className="min-w-0">
                      <span className={`block font-bold text-xs truncate leading-none ${isActive ? 'text-white' : 'text-slate-800'}`}>
                        {thr.participantName}
                      </span>
                      <span className={`text-[10px] block mt-1 truncate ${isActive ? 'text-blue-105' : 'text-slate-400 font-medium'}`}>
                        {thr.participantRole}
                      </span>
                      <p className={`text-[11px] truncate mt-1 leading-none ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                        {thr.lastMessage}
                      </p>
                    </div>
                  </div>

                  {/* Right side last message timestamp */}
                  <div className="text-right shrink-0 ml-1.5 flex flex-col items-end justify-between h-8">
                    <span className={`text-[9px] font-mono ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                      {thr.lastMessageTime}
                    </span>
                    {thr.unreadCount > 0 && !isActive && (
                      <span className="w-4.5 h-4.5 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center leading-none">
                        {thr.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredThreads.length === 0 && (
              <span className="text-xs text-slate-400 text-center block pt-8 italic">No active conversations found</span>
            )}
          </div>
        </div>

        {/* User Presence Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8.5 h-8.5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-inner">
                SA
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-800 leading-none">Suryakarthikeya</span>
              <span className="text-[9px] text-slate-400 font-bold block mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                ACTIVE PEER
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* COLUMN 2: Discord Chat Viewport (Center) */}
      <div className={`flex-1 flex flex-col justify-between h-full bg-slate-50/50 ${
        !activeThreadId ? 'hidden md:flex' : 'flex'
      }`}>
        {currentThread ? (
          <>
            {/* Thread Header Grid */}
            <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between select-none">
              
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => setActiveThreadId(null)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="relative shrink-0">
                  <div className={`w-9.5 h-9.5 rounded-full font-black text-white flex items-center justify-center text-xs ${
                    currentThread.participantAvatar === 'SJ' ? 'bg-indigo-500' :
                    currentThread.participantAvatar === 'ML' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}>
                    {currentThread.participantAvatar}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${
                    currentThread.participantName.includes('Sarah') ? 'bg-emerald-500' :
                    currentThread.participantName.includes('Maya') ? 'bg-amber-500' : 'bg-slate-400'
                  }`} />
                </div>

                <div className="min-w-0">
                  <h3 className="font-extrabold text-slate-900 text-sm leading-none flex items-center gap-1.5">
                    {currentThread.participantName}
                    <span className="text-[9px] font-bold py-0.5 px-1.5 bg-slate-100 text-slate-500 rounded font-mono">STUDENT</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium truncate">{currentThread.participantRole}</p>
                </div>
              </div>

              {/* Utility Tools (Phone, Video Call, Details Toggle) */}
              <div className="flex items-center gap-1">
                <button 
                  className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Direct Voice Call (WebRTC simulation)"
                  onClick={() => alert("Connecting direct WebRTC audio sequence... Permissions check initiated.")}
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button 
                  className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Video Collaborative Session (WebRTC simulation)"
                  onClick={() => alert("Initializing simulated secure peer video bridge.")}
                >
                  <Video className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActivePartnerDetail(activePartnerDetail ? null : 'profile')}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    activePartnerDetail === 'profile' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-400'
                  }`}
                  title="Direct peer layout detail toggle"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Bubble viewport */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              
              {/* Top Welcome Indicator */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl text-center space-y-2.5 max-w-sm mx-auto my-3 shadow-none">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl font-bold">
                  🎓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">This is the start of your Sync history</h4>
                  <p className="text-[11px] text-slate-400 mt-1 select-none leading-normal">
                    Discuss open components, coordinate timelines, and share academic assets safely.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <span className="inline-block text-[10px] bg-slate-150 text-slate-500 font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                  Today
                </span>
              </div>

              {/* Chat Thread Dialogues */}
              {currentMessages.map((msg) => {
                const isMe = msg.isMe;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} group/msg relative`}
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    
                    {/* Message Bubble Column */}
                    <div className={`relative max-w-[75%] rounded-2xl px-4 py-2 text-xs md:text-sm transition-all ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-br-none shadow-sm' 
                        : 'bg-white border border-slate-150 text-slate-800 rounded-bl-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                    }`}>
                      
                      {/* Sender label */}
                      {!isMe && (
                        <span className="block font-black text-[10px] text-indigo-600 mb-1 leading-none uppercase tracking-wide">
                          {msg.senderName}
                        </span>
                      )}

                      <p className="leading-relaxed font-sans break-words whitespace-pre-wrap">{msg.text}</p>
                      
                      {/* Message Footer: Timestamp and status indicator */}
                      <div className="flex items-center justify-end gap-1 mt-1.5 text-right select-none">
                        <span className={`text-[9px] font-mono leading-none ${isMe ? 'text-blue-150' : 'text-slate-400'}`}>
                          {msg.timestamp}
                        </span>
                        {isMe && (
                          <CheckCheck className="w-3 h-3 text-blue-200" />
                        )}
                      </div>

                      {/* Display Selected Reactions below bubble */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {msg.reactions.map((react, rIdx) => {
                            const hasIReacted = react.users.includes('me');
                            return (
                              <button
                                key={rIdx}
                                onClick={() => handleReactToMessage(msg.id, react.emoji)}
                                className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-md border font-bold transition-all ${
                                  hasIReacted 
                                    ? 'bg-blue-50 border-blue-200 text-blue-600' 
                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                }`}
                              >
                                <span>{react.emoji}</span>
                                <span className="text-[10px]">{react.count}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                    </div>

                    {/* Discord Style Hover Emoji Toolbar overlay */}
                    {hoveredMessageId === msg.id && (
                      <div className={`absolute -top-4 z-20 flex bg-white border border-slate-200 shadow-md rounded-xl p-1 gap-1.5 items-center justify-center transition-all ${
                        isMe ? 'right-4' : 'left-4'
                      }`}>
                        {AVAILABLE_REACTIONS.map((emoji) => {
                          const hasReacted = msg.reactions?.find(r => r.emoji === emoji)?.users.includes('me');
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleReactToMessage(msg.id, emoji)}
                              className={`w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-all text-sm active:scale-120 cursor-pointer ${
                                hasReacted ? 'bg-blue-50' : ''
                              }`}
                              title={`React with ${emoji}`}
                            >
                              {emoji}
                            </button>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })}

              {/* Dynamic Live Partner Typing Animation */}
              {isPartnerTyping && (
                <div className="flex justify-start items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 font-extrabold text-[10px] flex items-center justify-center text-slate-600">
                    {currentThread?.participantAvatar}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-150 rounded-2xl rounded-bl-none text-xs text-slate-500">
                    <span className="font-semibold text-slate-600">{typingName} is typing</span>
                    <div className="flex gap-1 ml-0.5 items-center justify-center">
                      <motion.span variants={typingBubbleVariants} initial="initial" animate="animate" className="w-1.5 h-1.5 bg-slate-500 rounded-full" transition={{ delay: 0 }} />
                      <motion.span variants={variants => typingBubbleVariants} initial="initial" animate="animate" className="w-1.5 h-1.5 bg-slate-500 rounded-full" transition={{ delay: 0.15 }} />
                      <motion.span variants={variants => typingBubbleVariants} initial="initial" animate="animate" className="w-1.5 h-1.5 bg-slate-500 rounded-full" transition={{ delay: 0.3 }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={scrollRef}></div>
            </div>

            {/* Bottom Text Form bar */}
            <div className="p-3 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                
                <div className="flex items-center gap-1">
                  <button 
                    type="button" 
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                    title="Mock file attachment"
                    onClick={() => alert("Local Storage limits active. Drag & Drop items or upgrade cloud tiers.")}
                  >
                    <Image className="w-4 h-4" />
                  </button>
                  <button 
                    type="button" 
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                    title="Mock research code upload"
                    onClick={() => alert("GitHub integration linked. Uploading automatically via Git branch hooks.")}
                  >
                    <File className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Send direct layout sync message to ${currentThread.participantName.split(' ')[0]}...`}
                  className="flex-1 text-xs md:text-sm bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:bg-white focus:border-blue-500 px-4 py-2.5 rounded-xl focus:outline-none transition-all"
                />
                
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`rounded-xl p-2.5 shadow-md active:scale-95 transition-all text-xs flex items-center justify-center shrink-0 cursor-pointer ${
                    inputText.trim() 
                      ? 'bg-blue-600 text-white shadow-blue-500/10 hover:bg-blue-700' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
            <RefreshCw className="w-10 h-10 text-slate-300 animate-spin mb-3" />
            <h3 className="font-black text-slate-700">Connecting Direct Chat Thread</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Select or open a user collaboration dialog wrapper from the Discover directories.
            </p>
          </div>
        )}
      </div>

      {/* COLUMN 3: Sliding/Toggleable Profile Drawer (Far Right - Width 72) */}
      <AnimatePresence>
        {activePartnerDetail === 'profile' && currentThread && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="hidden lg:flex flex-col border-l border-slate-100 bg-white h-full overflow-y-auto w-72 shrink-0 select-none pb-4"
          >
            {/* Banner block */}
            <div className="h-20 bg-gradient-to-tr from-indigo-500 to-blue-600 relative overflow-hidden flex-shrink-0">
              <div className="absolute top-2 right-2 flex gap-1.5">
                <span className="text-[9px] font-bold py-0.5 px-2 bg-white/20 text-white rounded-full">
                  TRUST score 98%
                </span>
              </div>
            </div>

            {/* Profile Avatar offset */}
            <div className="px-5 -mt-8 relative mb-4">
              <div className="relative inline-block">
                <div className="w-16 h-16 rounded-2xl border-4 border-white bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                  {activePartner.avatar}
                </div>
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
            </div>

            {/* Profile details structure */}
            <div className="px-5 space-y-4">
              <div>
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                  {activePartner.name}
                </h3>
                <p className="text-[10px] text-emerald-600 font-bold tracking-wide mt-1 uppercase flex items-center gap-1 font-mono">
                  ● ACTIVE NOW
                </p>
              </div>

              {/* Bio card */}
              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider mb-1">
                  Introduction
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed font-sans font-medium">
                  {activePartner.bio}
                </p>
              </div>

              {/* Meta details */}
              <div className="space-y-2.5 text-xs">
                
                <div className="flex items-center gap-2.5 text-slate-500 font-medium">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <div className="min-w-0">
                    <span className="block text-[11px] text-slate-700 font-bold truncate">
                      {activePartner.university}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold block mt-0.5 truncate uppercase">
                      {activePartner.major}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-slate-500 font-medium">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="block text-[11px] text-slate-700 font-bold">
                      {activePartner.year || 'Senior Year'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-slate-500 font-medium font-mono">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-700 font-bold">UTC -8h Timezone</span>
                  </div>
                </div>
              </div>

              {/* Verified academic badges */}
              <div className="pt-2">
                <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider mb-2">
                  Academic Verification
                </span>
                <div className="flex flex-col gap-1.5 text-[10px]">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100/60 font-semibold">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    Verified Email: {activePartner.avatar === 'SJ' ? 'sarah.j@stanford.edu' : activePartner.avatar === 'ML' ? 'm.lin@gatech.edu' : 'jinwoo.park@mit.edu'}
                  </div>
                </div>
              </div>

              {/* Competencies tag list */}
              <div>
                <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider mb-2">
                  Skills Base
                </span>
                <div className="flex flex-wrap gap-1">
                  {activePartner.skills.map((sk: string) => (
                    <span 
                      key={sk}
                      className="text-[10px] font-bold bg-slate-100/80 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded transition-colors"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 space-y-1.5">
                <button 
                  onClick={() => alert(`Redirecting to peer repository portfolio pipeline.`)}
                  className="w-full text-[11px] flex items-center justify-center gap-1.5 bg-slate-900 text-white font-extrabold py-2 rounded-xl hover:bg-black transition-colors shadow-sm cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  View GitHub / Projects
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
