import React, { useState, useEffect, useRef } from 'react';
import { ChatThread, Message, Student } from '../types';
import { MOCK_THREADS, MOCK_MESSAGES } from '../data';
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
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  me: Student;
  activeThreadId: string;
  setActiveThreadId: (id: string | null) => void;
}

export default function MessagesView({ me, activeThreadId, setActiveThreadId }: Props) {
  const [threads, setThreads] = useState<ChatThread[]>(MOCK_THREADS);
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [threadSearch, setThreadSearch] = useState('');
  const [activePartnerDetail, setActivePartnerDetail] = useState<'profile' | null>(null);

  // Auto scroll reference
  const scrollRef = useRef<HTMLDivElement>(null);

  // Set default active thread if none exists
  useEffect(() => {
    if (!activeThreadId && threads.length > 0) {
      setActiveThreadId(threads[0].id);
    }
  }, [activeThreadId, threads, setActiveThreadId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages, activeThreadId]);

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

  // Filter threads
  const filteredThreads = threads.filter(t => 
    t.participantName.toLowerCase().includes(threadSearch.toLowerCase()) ||
    t.participantRole.toLowerCase().includes(threadSearch.toLowerCase())
  );

  // Handle message send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThreadId) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: me.id,
      senderName: me.name,
      senderAvatar: me.avatar,
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    // Update messages map
    const updatedMessages = {
      ...allMessages,
      [activeThreadId]: [...currentMessages, newMessage]
    };
    setAllMessages(updatedMessages);

    // Update threads list preview
    setThreads(prev => 
      prev.map(t => 
        t.id === activeThreadId 
          ? { ...t, lastMessage: inputText, lastMessageTime: '3:20 PM' } 
          : t
      )
    );

    const savedInput = inputText;
    setInputText('');

    // Simulate AI / Student automatic responder
    setTimeout(() => {
      const autoResponseText = 
        savedInput.toLowerCase().includes('hello') || savedInput.toLowerCase().includes('hi')
          ? `Hey ${me.name.split(' ')[0]}! Great to connect with you. What aspect of our student collaboration should we coordinate first?`
          : `That sounds like an incredibly elegant framework. I'm reviewing the files now and we can certainly align our next milestone accordingly.`;

      const tutorResponse: Message = {
        id: `msg-sim-${Date.now()}`,
        senderId: 'partner',
        senderName: currentThread?.participantName || 'Sarah Jenkins',
        senderAvatar: currentThread?.participantAvatar || 'SJ',
        text: autoResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      };

      setAllMessages(prev => ({
        ...prev,
        [activeThreadId]: [...(prev[activeThreadId] || []), tutorResponse]
      }));

      // Update last message
      setThreads(prev => 
        prev.map(t => 
          t.id === activeThreadId 
            ? { ...t, lastMessage: autoResponseText, lastMessageTime: 'Just now' } 
            : t
        )
      );
    }, 1500);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm h-[calc(100vh-13rem)] flex overflow-hidden">
      
      {/* Column 1: Conversations Threads List Sidebar (Left) */}
      <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col justify-between shrink-0 ${
        activeThreadId ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 space-y-4">
          
          {/* Header search controls */}
          <div className="space-y-2">
            <h2 className="font-extrabold text-slate-950 text-base md:text-lg">Partner Chat Inbox</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={threadSearch}
                onChange={(e) => setThreadSearch(e.target.value)}
                placeholder="Search active chat threads..."
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Active List */}
          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-23rem)] pr-1">
            {filteredThreads.map(thr => {
              const isActive = thr.id === activeThreadId;
              return (
                <div
                  key={thr.id}
                  onClick={() => setActiveThreadId(thr.id)}
                  id={`thread-select-${thr.id}`}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors relative group ${
                    isActive 
                      ? 'bg-blue-50/70 border border-blue-100/50' 
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    
                    {/* Circle initials styled avatar */}
                    <div className={`w-10 h-10 rounded-full text-white font-extrabold text-xs flex items-center justify-center shrink-0 ${
                      thr.participantAvatar === 'SJ' ? 'bg-indigo-500' :
                      thr.participantAvatar === 'ML' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}>
                      {thr.participantAvatar}
                    </div>

                    <div className="min-w-0">
                      <span className="block font-bold text-slate-800 text-xs truncate leading-none">
                        {thr.participantName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-1 truncate">
                        {thr.participantRole}
                      </span>
                      <p className="text-[11px] text-slate-500 truncate mt-1 leading-none font-sans">
                        {thr.lastMessage}
                      </p>
                    </div>
                  </div>

                  {/* Right hand unread stats */}
                  <div className="text-right shrink-0 ml-1.5 flex flex-col items-end gap-1.5">
                    <span className="text-[9px] text-slate-400 font-mono">{thr.lastMessageTime}</span>
                    {thr.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-extrabold text-[9px] flex items-center justify-center leading-none">
                        {thr.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredThreads.length === 0 && (
              <span className="text-xs text-slate-400 text-center block pt-8 italic">No peers match filters</span>
            )}
          </div>
        </div>

        {/* User Identity bottom strip */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              SA
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-800 leading-none">{me.name.split(' ')[0]}</span>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-0.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                ONLINE
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Column 2: Active Chat Viewport (Right / Center) */}
      <div className={`flex-1 flex flex-col justify-between h-full bg-slate-50/50 ${
        !activeThreadId ? 'hidden md:flex' : 'flex'
      }`}>
        {currentThread ? (
          <>
            {/* Top Partner Utility Bar */}
            <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
              
              <div className="flex items-center gap-3 min-w-0">
                {/* Back button for mobile view switcher */}
                <button 
                  onClick={() => setActiveThreadId(null)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className={`w-9.5 h-9.5 rounded-full text-white font-extrabold text-xs flex items-center justify-center shrink-0 ${
                  currentThread.participantAvatar === 'SJ' ? 'bg-indigo-500' :
                  currentThread.participantAvatar === 'ML' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}>
                  {currentThread.participantAvatar}
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-xs md:text-sm text-slate-800 leading-none truncate">{currentThread.participantName}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">{currentThread.participantRole}</p>
                </div>
              </div>

              {/* Call tools */}
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-lg cursor-pointer" title="Direct Voice Call (WebRTC mock)">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-lg cursor-pointer" title="Video Meeting (WebRTC mock)">
                  <Video className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActivePartnerDetail(activePartnerDetail ? null : 'profile')}
                  className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-lg"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Middle: Bubbles Viewport */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Context Helper notification */}
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50/70 border border-blue-100 text-blue-700 rounded-full text-[10px] uppercase font-bold tracking-wider font-sans">
                  <Sparkles className="w-3.5 h-3.5" />
                  Encrypted Peer Session
                </div>
              </div>

              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs md:text-sm shadow-sm ${
                    msg.isMe 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white border border-slate-150 text-slate-800 rounded-bl-none'
                  }`}>
                    {!msg.isMe && (
                      <span className="block font-bold text-[10px] text-indigo-600 mb-1 leading-none">
                        {msg.senderName}
                      </span>
                    )}
                    <p className="leading-normal font-sans break-words whitespace-pre-wrap">{msg.text}</p>
                    <span className={`block text-[9px] text-right mt-1 font-mono ${msg.isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                      {msg.timestamp} {msg.isMe && '✓✓'}
                    </span>
                  </div>
                </div>
              ))}
              
              <div ref={scrollRef}></div>
            </div>

            {/* Bottom: Text Editor bar */}
            <div className="p-3 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Type a secure message to ${currentThread.participantName.split(' ')[0]}...`}
                  className="flex-1 text-xs md:text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-550 px-4 py-3 rounded-xl focus:outline-none"
                />
                
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-3 shadow-lg shadow-blue-500/15 cursor-pointer hover:shadow-xl active:scale-95 transition-all text-xs flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <RefreshCw className="w-10 h-10 text-slate-300 animate-spin mb-3" />
            <h3 className="font-bold text-slate-700">Loading Convergent Chat Thread</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Select or open a user collaboration dialogue from the Discovery directory.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
