import { useState, useMemo } from 'react';
import { Community } from '../types';
import { MOCK_COMMUNITIES } from '../data';
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
  Bell,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CommunitiesView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Enrolled tracking
  const [joinedIds, setJoinedIds] = useState<string[]>(['c2']); // Starts with one joined to show varying states

  // Collect unique categories
  const categories = useMemo(() => {
    const list = new Set<string>();
    MOCK_COMMUNITIES.forEach(c => list.add(c.category));
    return Array.from(list);
  }, []);

  // Filtered communities
  const filteredCommunities = useMemo(() => {
    return MOCK_COMMUNITIES.filter(c => {
      const matchText = `${c.name} ${c.description} ${c.category}`.toLowerCase();
      if (searchQuery.trim() && !matchText.includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedCategory !== 'All' && c.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [searchQuery, selectedCategory]);

  const handleToggleJoin = (id: string) => {
    if (joinedIds.includes(id)) {
      setJoinedIds(joinedIds.filter(x => x !== id));
    } else {
      setJoinedIds([...joinedIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
          Campus Communities Network
        </h1>
        <p className="text-sm text-slate-500">
          Sync with interest groupings, participate in regional student hubs, and share academic insights
        </p>
      </div>

      {/* Hero promo block */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-sm">
        <div className="absolute right-0 bottom-0 -mb-24 -mr-12 w-64 h-64 rounded-full bg-white/10 blur-xl"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-yellow-300" />
            Hackathons & Venture challenges
          </div>
          <h2 className="text-xl md:text-2xl font-black">Sync With Premium Student Guilds</h2>
          <p className="text-emerald-50 text-xs max-w-lg leading-relaxed">
            Gain guidance from high-seniority mentors, exchange verified academic frameworks, and organize regional meetups with thousands of students worldwide.
          </p>
        </div>
      </div>

      {/* Filter / Search segment */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        
        <div className="flex flex-wrap gap-1.5 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`text-xs px-3.5 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
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
            placeholder="Search communities..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          />
        </div>
      </div>

      {/* Dynamic List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCommunities.map((c) => {
            const hasJoined = joinedIds.includes(c.id);
            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3.5">
                  
                  {/* Top Line */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-inner ${
                        c.iconName === 'Trophy' ? 'bg-amber-500' :
                        c.iconName === 'Cpu' ? 'bg-indigo-500' :
                        c.iconName === 'Palette' ? 'bg-teal-500' : 'bg-blue-500'
                      }`}>
                        {c.iconName === 'Trophy' ? <Trophy className="w-5 h-5" /> :
                         c.iconName === 'Cpu' ? <Cpu className="w-5 h-5" /> :
                         c.iconName === 'Palette' ? <Palette className="w-5 h-5" /> :
                         <Rocket className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">
                          {c.name}
                        </h3>
                        <p className="text-[10px] bg-slate-50 inline-block px-2 py-0.5 rounded text-slate-500 font-medium">
                          {c.category}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleJoin(c.id)}
                      className={`text-xs px-3.5 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
                        hasJoined
                          ? 'bg-rose-50 text-rose-600 font-bold border border-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100/60'
                      }`}
                    >
                      {hasJoined ? 'Leave Guild' : 'Join Guild'}
                    </button>
                  </div>

                  {/* Body description */}
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {c.description}
                  </p>

                </div>

                {/* Counter statistics */}
                <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span><strong className="text-slate-700">{c.memberCount}</strong> active members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span><strong className="text-slate-700">{c.postsCount}</strong> shared threads</span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
