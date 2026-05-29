import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { MOCK_STUDENTS } from '../data';
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
  X
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

  // Collect all unique skills for filter list
  const allSkills = useMemo(() => {
    const list = new Set<string>();
    MOCK_STUDENTS.forEach(student => {
      student.skills.forEach(skill => list.add(skill));
    });
    return Array.from(list);
  }, []);

  // Filter students
  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter(student => {
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
      if (student.matchScore && student.matchScore < minMatchScore) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedAvailability, selectedSkill, minMatchScore]);

  const toggleAvailabilityFilter = (status: string) => {
    if (selectedAvailability.includes(status)) {
      setSelectedAvailability(selectedAvailability.filter(s => s !== status));
    } else {
      setSelectedAvailability([...selectedAvailability, status]);
    }
  };

  const handleConnect = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening details
    if (connectedIds.includes(studentId)) return;
    setConnectedIds([...connectedIds, studentId]);
  };

  const handleStartChat = (student: Student) => {
    onOpenMessageThread(student.name);
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
            Campus Skill Discovery Framework
          </h1>
          <p className="text-sm text-slate-500">
            Find peer expertise, view match compatibility, and connect instantly
          </p>
        </div>
        <button
          onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          className="lg:hidden shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer select-none transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter Sheet {selectedAvailability.length > 0 || selectedSkill !== 'All' ? '• Active' : ''}
        </button>
      </div>

      {/* Main Grid Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Desktop Filter Block */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 hidden lg:block sticky top-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              Advanced Filters
            </h3>
            <button
              onClick={() => {
                setSelectedAvailability([]);
                setSelectedSkill('All');
                setMinMatchScore(0);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              Reset All
            </button>
          </div>

          {/* Search box within sidebar */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase">Interactive Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, skills..."
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-600 uppercase">Availability Status</label>
            <div className="space-y-2">
              {['Available', 'Part-time', 'Busy'].map((status) => {
                const checked = selectedAvailability.includes(status);
                return (
                  <label key={status} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAvailabilityFilter(status)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>{status}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Skills dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase">Core Skill Tag</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="All">All Skill Types</option>
              {allSkills.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Match Score Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600 uppercase">Match Compatibility</label>
              <span className="text-xs font-mono font-bold text-indigo-600">≥ {minMatchScore}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1 bg-slate-100 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>0%</span>
              <span>50%</span>
              <span>80%</span>
            </div>
          </div>
        </div>

        {/* Dynamic Mobile Filter Slide-out */}
        <AnimatePresence>
          {showFiltersMobile && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden flex justify-end"
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="w-80 bg-white h-full p-6 space-y-6 overflow-y-auto shadow-2xl flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 text-sm">Filters</h3>
                    <button onClick={() => setShowFiltersMobile(false)}>
                      <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Interactive Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search peers..."
                        className="w-full text-xs pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Availability</label>
                    <div className="space-y-2">
                      {['Available', 'Part-time', 'Busy'].map((status) => (
                        <label key={status} className="flex items-center gap-2 text-xs text-slate-700">
                          <input
                            type="checkbox"
                            checked={selectedAvailability.includes(status)}
                            onChange={() => toggleAvailabilityFilter(status)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          <span>{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Skill Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Core Skill Tag</label>
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="All">All Skill Types</option>
                      {allSkills.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2 pt-6 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedAvailability([]);
                      setSelectedSkill('All');
                      setMinMatchScore(0);
                    }}
                    className="w-full text-xs border border-slate-200 text-slate-600 py-2.5 font-bold rounded-xl"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setShowFiltersMobile(false)}
                    className="w-full text-xs bg-indigo-600 text-white py-2.5 font-bold rounded-xl"
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
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search peers by skill (e.g. Go, Figma, PyTorch)..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-1 focus:ring-indigo-500/20 text-sm shadow-sm"
            />
          </div>

          {/* Results Summary banner */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing <strong className="text-slate-800 font-semibold">{filteredStudents.length}</strong> qualified student partners mapped</span>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-indigo-600 font-bold"
              >
                Clear Search Query
              </button>
            )}
          </div>

          {/* Student representation grid list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredStudents.map((student) => {
                const isConnected = connectedIds.includes(student.id);
                return (
                  <motion.div
                    key={student.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedStudent(student)}
                    className="bg-white border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      {/* Top header row */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {/* Colored dynamic styled initial avatar */}
                          <div className={`w-11 h-11 rounded-full text-white font-bold font-sans text-sm flex items-center justify-center ${
                            student.id === 's1' ? 'bg-indigo-500' :
                            student.id === 's2' ? 'bg-amber-500' :
                            student.id === 's3' ? 'bg-emerald-500' :
                            student.id === 's4' ? 'bg-rose-500' : 'bg-purple-500'
                          }`}>
                            {student.avatar}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                              {student.name}
                            </h3>
                            <p className="text-slate-400 text-[11px] font-medium flex items-center gap-1 leading-none mt-1">
                              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                              {student.university}
                            </p>
                          </div>
                        </div>

                        {/* Recommendation confidence metric */}
                        {student.matchScore && (
                          <div className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100/60 text-right shrink-0">
                            <span className="block text-[8px] text-indigo-400 font-bold uppercase leading-none">Match Rate</span>
                            <span className="text-xs font-extrabold text-indigo-700 font-mono leading-none">{student.matchScore}%</span>
                          </div>
                        )}
                      </div>

                      {/* Major indicator */}
                      <div className="mt-3.5 text-xs font-semibold text-slate-700 bg-slate-50 inline-block px-2.5 py-1 rounded-lg">
                        {student.major} • <span className="text-slate-400 font-normal">{student.year}</span>
                      </div>

                      {/* Brief bio paragraph */}
                      <p className="text-xs text-slate-500 mt-2.5 line-clamp-2">
                        {student.bio}
                      </p>

                      {/* Skills Tags row */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {student.skills.slice(0, 3).map((item) => (
                          <span 
                            key={item} 
                            className="text-[10px] bg-slate-50 border border-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md"
                          >
                            {item}
                          </span>
                        ))}
                        {student.skills.length > 3 && (
                          <span className="text-[10px] text-slate-400 px-1">
                            +{student.skills.length - 3} item
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer strip */}
                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className={`font-semibold ${
                          student.availability === 'Available' ? 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded' :
                          student.availability === 'Part-time' ? 'text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded' :
                          'text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded'
                        }`}>{student.availability}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          id={`connect-btn-${student.id}`}
                          onClick={(e) => handleConnect(student.id, e)}
                          className={`text-xs px-3 py-1.5 font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 ${
                            isConnected 
                              ? 'bg-slate-100 text-slate-400 select-none' 
                              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100/30'
                          }`}
                        >
                          {isConnected ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                          {isConnected ? 'Pending' : 'Connect'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartChat(student);
                          }}
                          className="bg-slate-800 text-white hover:bg-slate-900 border border-slate-700/60 p-2 text-xs rounded-lg transition-colors cursor-pointer"
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
              <div className="col-span-1 md:col-span-2 text-center p-12 bg-white rounded-2xl border border-slate-100">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 mb-1">No Academic Peers Located</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try clearing your search filters or searching for active broad skills such as Go, Python, or Figma.
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedAvailability([]);
                    setSelectedSkill('All');
                    setMinMatchScore(0);
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Reset Active Filters
                </button>
              </div>
            )}
          </div>
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
              onClick={(e) => e.stopPropagation()} // stop close
              className="w-full max-w-md md:max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-6">
                
                {/* Drawer close button + Header section */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Student Profile Deep-Dive</span>
                  <button 
                    onClick={() => setSelectedStudent(null)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Hero profile segment */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/40">
                  <div className={`w-14 h-14 rounded-full text-white font-extrabold text-lg flex items-center justify-center ${
                    selectedStudent.id === 's1' ? 'bg-indigo-500' :
                    selectedStudent.id === 's2' ? 'bg-amber-500' :
                    selectedStudent.id === 's3' ? 'bg-emerald-500' :
                    selectedStudent.id === 's4' ? 'bg-rose-500' : 'bg-purple-500'
                  }`}>
                    {selectedStudent.avatar}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 leading-none">{selectedStudent.name}</h2>
                    <p className="text-xs font-semibold text-indigo-600">{selectedStudent.email}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 pt-0.5">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      {selectedStudent.university}
                    </p>
                  </div>
                </div>

                {/* Academic Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-1">Declared Major</span>
                    <span className="text-xs font-bold text-slate-700">{selectedStudent.major}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-1">Registration Year</span>
                    <span className="text-xs font-bold text-slate-700">{selectedStudent.year}</span>
                  </div>
                </div>

                {/* Bio statement */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Professional Bio</h4>
                  <p className="text-xs leading-relaxed text-slate-600 bg-white p-3.5 rounded-xl border border-slate-100 text-justify">
                    {selectedStudent.bio}
                  </p>
                </div>

                {/* Dynamic matching section */}
                {selectedStudent.matchScore && (
                  <div className="p-4 bg-teal-50 border border-teal-100 text-teal-900 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 text-teal-800">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        AI Compatibility Match Score
                      </span>
                      <span className="text-lg font-black font-mono text-teal-700">{selectedStudent.matchScore}%</span>
                    </div>
                    <p className="text-[11px] text-teal-700 font-medium">
                      High potential fit in <strong>{selectedStudent.skills[0]}</strong> and <strong>{selectedStudent.skills[1]}</strong>. Sarah can help you on frontend interfaces while you provide systems integration layers.
                    </p>
                  </div>
                )}

                {/* Competencies segment */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Specialized Competencies</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.skills.map(s => {
                      const containsMatched = me.skills.includes(s);
                      return (
                        <span 
                          key={s} 
                          className={`text-xs px-3 py-1.5 font-semibold rounded-lg flex items-center gap-1 ${
                            containsMatched 
                              ? 'bg-emerald-50 border border-emerald-150 text-emerald-700' 
                              : 'bg-indigo-50 border border-indigo-150 text-indigo-700'
                          }`}
                        >
                          {containsMatched && <Check className="w-3.5 h-3.5" />}
                          {s}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Interests segment */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Fields of Academic Interest</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.interests.map(i => (
                      <span key={i} className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 font-medium rounded-md">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Backed Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3 mt-6">
                <button
                  id={`drawer-connect-btn-${selectedStudent.id}`}
                  onClick={(e) => {
                    handleConnect(selectedStudent.id, e);
                  }}
                  className={`flex-1 py-3 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    connectedIds.includes(selectedStudent.id)
                      ? 'bg-slate-100 text-slate-400 select-none mb-1'
                      : 'bg-indigo-650 hover:bg-indigo-700 text-white shadow-xl hover:shadow'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  {connectedIds.includes(selectedStudent.id) ? 'Connection Request Sent' : 'Request Partnership'}
                </button>
                <button
                  onClick={() => {
                    handleStartChat(selectedStudent);
                    setSelectedStudent(null);
                  }}
                  className="bg-slate-900 text-white hover:bg-slate-950 px-4 py-3 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
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
