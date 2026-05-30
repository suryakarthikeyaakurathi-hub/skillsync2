import React, { useState } from 'react';
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { Student } from '../types';
import { ME_PROFILE } from '../data';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  GraduationCap, 
  UploadCloud, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Info,
  Calendar,
  Compass,
  ArrowRight,
  Chrome
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthViewProps {
  onAuthSuccess: (student: Student) => void;
}

type ScreenType = 'login' | 'register' | 'forgot-password' | 'onboarding';

export default function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [screen, setScreen] = useState<ScreenType>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password Validation
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);

  // Onboarding (Multi-step metadata collection)
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('Academic Institute of Technology');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('Freshman Year');
  const [bio, setBio] = useState('');
  const [availability, setAvailability] = useState<'Available' | 'Busy' | 'Part-time'>('Available');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [avatar, setAvatar] = useState('');
  
  // Custom Drag & Drop Cover Support
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{name: string, size: string} | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Preset university list
  const universities = [
    'Academic Institute of Technology',
    'Stanford University',
    'MIT',
    'Georgia Tech',
    'UC Berkeley',
    'University of Oxford',
    'Carnegie Mellon University'
  ];

  const years = [
    'Freshman Year',
    'Sophomore Year',
    'Junior Year',
    'Senior Year',
    'Graduate Student',
    'PhD Candidate'
  ];

  const popularSkills = [
    'TypeScript', 'React', 'Tailwind CSS', 'Vite', 'Express', 'Firebase', 
    'Python', 'PyTorch', 'Data Analysis', 'Docker', 'Go', 'Rust', 'Figma'
  ];

  const popularInterests = [
    'Artificial Intelligence', 'PWA Development', 'Hackathons', 
    'Product Management', 'Blockchain', 'UI Design', 'Sustainability'
  ];

  // Password strength check
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score; // 0-4
  };

  const getStrengthLabelAndColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return { label: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { label: 'Good', color: 'bg-blue-500' };
      case 4:
        return { label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { label: 'Weak', color: 'bg-rose-500' };
    }
  };

  const validateEmail = (input: string) => {
    setEmail(input);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(regex.test(input) || input === '');
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      simulateFileUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      simulateFileUpload(file);
    }
  };

  const simulateFileUpload = (file: File) => {
    setUploadedFile({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB'
    });
    setUploadProgress(0);
    // Use initials from name if uploaded
    if (fullName) {
      setAvatar(fullName.split(/[\s-]+/).map(chunk => chunk[0]).join('').substring(0, 2).toUpperCase());
    } else {
      setAvatar(file.name.substring(0, 2).toUpperCase());
    }

    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setUploadProgress(p);
      if (p >= 100) {
        clearInterval(interval);
      }
    }, 150);
  };

  // Auth Functions
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Try loading Firestore profile document if exists, else trigger onboarding
      const userDocRef = doc(db, 'students', user.uid);
      let profileSnap;
      try {
        profileSnap = await getDoc(userDocRef);
      } catch (err) {
        console.warn("Could not query Firestore directly, fallback to register layout.", err);
      }

      if (profileSnap && profileSnap.exists()) {
        const studentProfile = profileSnap.data() as Student;
        onAuthSuccess(studentProfile);
      } else {
        // First-time registration setup needed from Google Info
        setFullName(user.displayName || user.email?.split('@')[0] || 'Peer Builder');
        setEmail(user.email || '');
        setScreen('onboarding');
        setOnboardingStep(1);
      }
    } catch (err: any) {
      console.error("Firebase Google Sign-In Error", err);
      let desc = err.message || 'Google Login rejected.';
      if (err.code === 'auth/popup-closed-by-user') {
        desc = 'Sign-in window was closed before completion.';
      } else if (err.code === 'auth/network-request-failed') {
        desc = 'Network error. Please make sure you are online.';
      }
      setErrorMsg(`[Google Sign-In] ${desc}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please supply a valid email and password.');
      return;
    }

    setIsLoading(true);
    try {
      // Attempt Firebase signing
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Try loading Firestore profile document if exists, else trigger onboarding
      const userDocRef = doc(db, 'students', user.uid);
      let profileSnap;
      try {
        profileSnap = await getDoc(userDocRef);
      } catch (err) {
        // Fallback for security/quota rules
        console.warn("Could not query Firestore directly, fallback to mock user setup.", err);
      }

      if (profileSnap && profileSnap.exists()) {
        const studentProfile = profileSnap.data() as Student;
        onAuthSuccess(studentProfile);
      } else {
        // First-time registration setup needed
        setFullName(user.email?.split('@')[0] || 'Peer Builder');
        setScreen('onboarding');
        setOnboardingStep(1);
      }
    } catch (err: any) {
      console.error("Firebase Login Error", err);
      let desc = err.message || 'Verification rejected. Please review login credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        desc = 'Invalid combination of email or password.';
      } else if (err.code === 'auth/network-request-failed') {
        desc = 'Network error. Please make sure you are online.';
      }
      setErrorMsg(`[Firebase Authentication] ${desc}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please specify a secure email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Auto fill nickname from email to proceed
      setFullName(user.email?.split('@')[0] || 'Academic Sync');
      setScreen('onboarding');
      setOnboardingStep(1);
    } catch (err: any) {
      console.error("Firebase SignUp Error", err);
      let desc = err.message || 'Onboarding error. Please review password strength.';
      if (err.code === 'auth/email-already-in-use') {
        desc = 'This email address is already registered.';
      }
      setErrorMsg(`[Firebase Authentication] ${desc}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email) {
      setErrorMsg('Please provide your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg('A digital credentials recovery link has been dispatched to your email.');
    } catch (err: any) {
      console.error("Reset Password Error", err);
      setErrorMsg(`[Firebase Error] ${err.message || 'Could not send recovery dispatch.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    
    const currentUid = auth.currentUser?.uid || 'guest-sync';
    
    // Auto-calculate initials logic for Avatar if not overridden
    const computedAvatar = fullName ? 
      fullName.split(/[\s-]+/).map(c => c[0]).join('').substring(0, 2).toUpperCase() : 
      'PS';

    const finalizedProfile: Student = {
      id: currentUid,
      name: fullName || 'New Sync User',
      avatar: computedAvatar,
      email: auth.currentUser?.email || email || 'student@skillsync.edu',
      university,
      major,
      year,
      bio,
      skills: selectedSkills,
      interests: selectedInterests,
      availability
    };

    try {
      // Save profile to Firestore
      const userDocRef = doc(db, 'students', currentUid);
      await setDoc(userDocRef, finalizedProfile);
      
      onAuthSuccess(finalizedProfile);
    } catch (err: any) {
      console.warn("Firestore error during saving, proceeding with local profile cache.", err);
      // Even with firestore issues, we let the user pass to allow normal application preview!
      onAuthSuccess(finalizedProfile);
    } finally {
      setIsLoading(false);
    }
  };

  // Skip / Demo Mode Auth Bypass (Essential design pattern for fast inspection)
  const handleGuestDemoBypass = () => {
    setSuccessMsg('Initializing sandbox environment...');
    setTimeout(() => {
      onAuthSuccess(ME_PROFILE);
    }, 500);
  };

  return (
    <div id="auth-container-viewport" className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div 
        id="auth-card-frame" 
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-150/40 p-6 sm:p-8"
      >
        {/* Hub branding header */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/25">
            S²
          </div>
          <div>
            <h1 className="font-sans font-black text-slate-900 tracking-tight text-xl leading-none">SkillSync</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Academic Partnership Framework</p>
          </div>
        </div>

        {/* Global info alerts for error/success */}
        {errorMsg && (
          <div id="auth-danger-alert" className="mb-6 p-4 bg-rose-50 border border-rose-100/50 rounded-xl flex gap-3 text-xs text-rose-700 font-medium leading-relaxed">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Transaction Declined</span>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div id="auth-success-alert" className="mb-6 p-4 bg-emerald-50 border border-emerald-100/50 rounded-xl flex gap-3 text-xs text-emerald-700 font-medium leading-relaxed">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Dispacthed Successfully</span>
              <p>{successMsg}</p>
            </div>
          </div>
        )}

        {/* Screen: Login */}
        {screen === 'login' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-1 mb-6 text-center sm:text-left">
              <h2 className="text-lg font-extrabold text-slate-900">Academic Entrance</h2>
              <p className="text-xs text-slate-500">Sign in to coordinate collaboration across your academic sphere.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => validateEmail(e.target.value)}
                    placeholder="your.name@gmail.com"
                    className={`w-full bg-slate-50/50 border ${isEmailValid ? 'border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-105/10' : 'border-rose-400 text-rose-900 focus:ring-rose-550/10'} rounded-xl py-3 pl-11 pr-4 text-sm font-sans focus:outline-none transition-all`}
                  />
                </div>
                {!isEmailValid && (
                  <span className="text-[10px] text-rose-600 font-medium mt-1 block">Please supply a complete, valid email format.</span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Secure Password</label>
                  <button 
                    type="button" 
                    onClick={() => setScreen('forgot-password')}
                    className="text-[10px] text-blue-600 font-bold hover:underline transition-all"
                  >
                    Forgot Credentials?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your security credentials"
                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-105/10 rounded-xl py-3 pl-11 pr-11 text-sm font-sans focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 text-white font-bold text-sm rounded-xl cursor-pointer hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/15"
              >
                {isLoading ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  <>
                    <span>Authenticate Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            <div className="relative my-6 text-center">
              <span className="absolute inset-x-0 top-1/2 h-px bg-slate-200/50 -translate-y-1/2"></span>
              <span className="relative bg-white px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Alternative Channels</span>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-11 bg-white hover:bg-slate-50 text-slate-705 border border-slate-200 font-bold text-sm rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                ) : (
                  <>
                    <Chrome className="w-4 h-4 text-rose-500" />
                    <span>Sign In with Google</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setScreen('register');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="w-full h-11 bg-slate-50 text-slate-700 border border-slate-200/60 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center"
              >
                Create Hub Profile
              </button>

              <button
                type="button"
                onClick={handleGuestDemoBypass}
                className="w-full py-2.5 bg-blue-50/40 hover:bg-blue-50 text-blue-700 border border-blue-100/60 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Bypass / Sandbox Demo Mode</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Screen: Register */}
        {screen === 'register' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-1 mb-6 text-center sm:text-left">
              <h2 className="text-lg font-extrabold text-slate-900">Create Hub Account</h2>
              <p className="text-xs text-slate-500">Sign up and sync skills with fellow students on campus.</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => validateEmail(e.target.value)}
                    placeholder="your.name@gmail.com"
                    className={`w-full bg-slate-50/50 border ${isEmailValid ? 'border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-105/10' : 'border-rose-400 text-rose-900 focus:ring-rose-550/10'} rounded-xl py-3 pl-11 pr-4 text-sm font-sans focus:outline-none transition-all`}
                  />
                </div>
                {!isEmailValid && (
                  <span className="text-[10px] text-rose-600 font-medium mt-1 block">Please enter a complete, valid email format.</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Define Security Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onFocus={() => setPasswordFocus(true)}
                    onBlur={() => setPasswordFocus(false)}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters, mixed case"
                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-105/10 rounded-xl py-3 pl-11 pr-11 text-sm font-sans focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength visual feedback helper */}
                {(passwordFocus || password.length > 0) && (
                  <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-500 uppercase tracking-wide">Strength Metrics:</span>
                      <span className={
                        getPasswordStrength() <= 1 ? 'text-rose-600' :
                        getPasswordStrength() === 2 ? 'text-amber-600' :
                        getPasswordStrength() === 3 ? 'text-blue-600' : 'text-emerald-600'
                      }>
                        {getStrengthLabelAndColor(getPasswordStrength()).label}
                      </span>
                    </div>
                    {/* Visual meter bar */}
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex gap-0.5">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-full flex-1 transition-all duration-300 ${
                            i < getPasswordStrength() 
                              ? getStrengthLabelAndColor(getPasswordStrength()).color 
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] text-slate-500 leading-none pt-1">
                      <li className="flex items-center gap-1">
                        <span className={`w-1 h-1 rounded-full ${password.length >= 6 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        <span>Length min 6 chars</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <span className={`w-1 h-1 rounded-full ${/[A-Z]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        <span>Contains uppercase</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <span className={`w-1 h-1 rounded-full ${/[0-9]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        <span>Contains numbers</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <span className={`w-1 h-1 rounded-full ${/[^A-Za-z0-9]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        <span>Special character</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 text-white font-bold text-sm rounded-xl cursor-pointer hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/15"
              >
                {isLoading ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <hr className="border-slate-100 my-5" />

            <button
              onClick={() => {
                setScreen('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
            >
              Already verified? Sign in here
            </button>
          </motion.div>
        )}

        {/* Screen: Forgot Password */}
        {screen === 'forgot-password' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-1 mb-6">
              <button 
                onClick={() => {
                  setScreen('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-all mb-2 cursor-pointer uppercase tracking-wider"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Return to entrance</span>
              </button>
              <h2 className="text-lg font-extrabold text-slate-900 font-sans">Credentials Recovery</h2>
              <p className="text-xs text-slate-500">Provide your registered email to transmit reset instructions.</p>
            </div>

            <form onSubmit={handleOnboardingComplete} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => validateEmail(e.target.value)}
                    placeholder="your.name@gmail.com"
                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-105/10 rounded-xl py-3 pl-11 pr-4 text-sm font-sans focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 text-white font-bold text-sm rounded-xl cursor-pointer hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                {isLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <span>Dispatch Recovery Pass</span>}
              </button>
            </form>
          </motion.div>
        )}

        {/* Onboarding Screen: Multi-step registration metadata collection */}
        {screen === 'onboarding' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* Steps tracker progress bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-blue-600 font-black uppercase tracking-wider">
                  Profile Assembly - Step {onboardingStep} of 4
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {onboardingStep === 1 && 'Academic Identity'}
                  {onboardingStep === 2 && 'About You'}
                  {onboardingStep === 3 && 'Talent Matrix'}
                  {onboardingStep === 4 && 'Avatar & Assets'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full flex overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${(onboardingStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* STEP 1: Academic metadata */}
            {onboardingStep === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100/30 flex gap-2.5 items-start">
                  <Sparkles className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-600 leading-normal">
                    Let’s anchor your peer profile. Enter your full name and select your current academic location.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Graduate / Student Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. S. Karthikeya"
                      required
                      className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-105/10 rounded-xl py-3 pl-11 pr-4 text-sm font-sans focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Affiliated University</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <select
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-105/10 rounded-xl py-3 pl-11 pr-4 text-sm font-sans focus:outline-none cursor-pointer appearance-none"
                    >
                      {universities.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Academic Field / Major</label>
                    <input 
                      type="text"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="e.g. AI Engineering"
                      className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-105/10 rounded-xl py-3 px-4 text-sm font-sans focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Degree Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-105/10 rounded-xl py-3 px-3 text-sm font-sans focus:outline-none cursor-pointer"
                    >
                      {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Bio & Availability */}
            {onboardingStep === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Student Biography & Vision</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    maxLength={200}
                    placeholder="Tell peers what you love building, your favorite tech stacks, or what hackathons you want to complete..."
                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-105/10 rounded-xl p-4 text-sm font-sans focus:outline-none transition-all resize-none"
                  />
                  <div className="flex justify-end">
                    <span className="text-[10px] text-slate-400 font-medium">{bio.length}/200 characters</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Collaboration Bandwidth</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Available', 'Part-time', 'Busy'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setAvailability(status)}
                        className={`py-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col justify-center items-center gap-1.5 cursor-pointer ${
                          availability === status 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                            : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${
                          status === 'Available' ? 'bg-emerald-400 animate-pulse' :
                          status === 'Part-time' ? 'bg-amber-400' : 'bg-rose-400'
                        }`} />
                        <span>{status === 'Part-time' ? 'Part-Time' : status}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 italic text-center">
                    This badge updates live on the global discover portal to let researchers know your availability.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Skills & Interests Tag Selecting */}
            {onboardingStep === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div>
                  <span className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Skills Matrix ({selectedSkills.length} selected)
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                    {popularSkills.map(skill => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                            isSelected 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                              : 'bg-white text-slate-600 border-slate-200/50 hover:bg-slate-100'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Areas of Interest ({selectedInterests.length} selected)
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                    {popularInterests.map(interest => {
                      const isSelected = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                            isSelected 
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                              : 'bg-white text-slate-600 border-slate-200/50 hover:bg-slate-100'
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Beautiful Drag & Drop profile picture placeholder */}
            {onboardingStep === 4 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                
                {/* Visual live preview profile card mockup */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150/60 shadow-inner flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-2xl font-black flex items-center justify-center shadow-lg uppercase">
                    {avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span id="onboarding-preview-name" className="block text-sm font-black text-slate-900 leading-none mb-1.5">{fullName || 'Karthikeya'}</span>
                    <span className="text-xs text-slate-500 font-bold block truncate">{major}</span>
                    <span className="text-[10px] text-blue-600 font-bold block truncate mt-1">{university}</span>
                  </div>
                </div>

                {/* Upload drag-n-drop zone */}
                <div>
                  <span className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Upload Profile Avatar</span>
                  <div 
                    id="profile-dropzone"
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all relative overflow-hidden ${
                      dragActive ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200 hover:border-blue-450 hover:bg-slate-50/40'
                    }`}
                  >
                    <input 
                      type="file" 
                      id="onboarding-file-picker"
                      onChange={handleFileChange}
                      className="hidden" 
                      accept="image/*"
                    />
                    
                    <label 
                      htmlFor="onboarding-file-picker" 
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2.5 h-full w-full"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <UploadCloud className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-800">Drag & drop your student photo or click to browse</span>
                        <span className="text-[10px] text-slate-400 block mt-1">Supports JPEG, PNG up to 5MB</span>
                      </div>
                    </label>

                    {/* Progress tracking indicator */}
                    {uploadedFile && (
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm p-4 flex flex-col justify-center items-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Check className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-900 truncate max-w-xs">{uploadedFile.name}</span>
                          <span className="text-[10px] text-slate-400 block">{uploadedFile.size}</span>
                        </div>
                        {uploadProgress !== null && (
                          <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFile(null);
                            setUploadProgress(null);
                            setAvatar(fullName.substring(0, 2).toUpperCase());
                          }}
                          className="text-[10px] text-rose-500 font-bold hover:underline"
                        >
                          Clear custom image
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Micro-profile quick avatar customize switcher */}
                <div>
                  <span className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Or select custom initials / emoji:</span>
                  <div className="grid grid-cols-5 gap-2">
                    {['⚡', '💻', '🎨', '🚀', '🔬'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setAvatar(emoji)}
                        className={`h-11 rounded-xl border text-base flex items-center justify-center transition-all cursor-pointer ${
                          avatar === emoji 
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/10' 
                            : 'bg-white border-slate-200/60 hover:bg-slate-50'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation buttons for multi-step */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {onboardingStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setOnboardingStep(onboardingStep - 1)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Step</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    // Sign out Firebase Auth, cancel setup
                    signOut(auth);
                    setScreen('login');
                  }}
                  className="px-4 py-2 text-xs font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                >
                  Cancel Registration
                </button>
              )}

              {onboardingStep < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    // Quick validation helper per step
                    if (onboardingStep === 1 && !fullName.trim()) {
                      setErrorMsg('Please specify your full name.');
                      return;
                    }
                    setErrorMsg(null);
                    setOnboardingStep(onboardingStep + 1);
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOnboardingComplete}
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Complete & Launch App</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}
