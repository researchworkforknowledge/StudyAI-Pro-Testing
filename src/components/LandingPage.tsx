import React, { useState, useEffect } from "react";
import { 
  Sparkle, 
  Sparkles, 
  Play, 
  Compass, 
  Zap, 
  BookOpen, 
  Award, 
  Cpu, 
  Activity, 
  GraduationCap, 
  ChevronRight, 
  CheckCircle, 
  Plus, 
  MessageSquare, 
  Volume2, 
  MousePointer, 
  ShieldCheck, 
  TrendingUp, 
  Flame, 
  Code,
  Users,
  Terminal,
  Clock,
  ArrowRight,
  HelpCircle,
  HelpCircle as QuestionIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LandingPageProps {
  onLaunchApp: (onboardingData?: { board: string; cls: string; sub: string; tracker?: string }) => void;
  onCallAI: (prompt: string, persona: string) => Promise<string | null>;
  onPlaySound: () => void;
  initialState: any;
}

export default function LandingPage({ onLaunchApp, onCallAI, onPlaySound, initialState }: LandingPageProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  
  // Onboarding Selection State
  const [selectedBoard, setSelectedBoard] = useState("CBSE");
  const [selectedClass, setSelectedClass] = useState("12");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [selectedPersona, setSelectedPersona] = useState("doubts"); // Feynman
  const [userName, setUserName] = useState("");

  // Sandbox trial preview state
  const [demoPrompt, setDemoPrompt] = useState("Explain laws of thermodynamics");
  const [demoPersona, setDemoPersona] = useState("notes");
  const [demoResult, setDemoResult] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  // Active visitor stats counter (growth loop simulation)
  const [activeUsers, setActiveUsers] = useState(1420);
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDemoTrial = async () => {
    if (!demoPrompt.trim()) return;
    setDemoLoading(true);
    setDemoResult(null);
    onPlaySound();
    try {
      const response = await onCallAI(demoPrompt, demoPersona);
      setDemoResult(response);
    } catch (err) {
      setDemoResult("Verification failed. Please check connection.");
    } finally {
      setDemoLoading(false);
    }
  };

  const handleFinishOnboarding = () => {
    onPlaySound();
    onLaunchApp({
      board: selectedBoard,
      cls: selectedClass,
      sub: selectedSubject,
      tracker: userName || "Scholar"
    });
  };

  const FAQS = [
    {
      q: "Does StudyAI Pro follow the official NCERT and CBSE/ICSE syllabus?",
      a: "Yes! StudyAI Pro's AI core is fine-tuned on recent Indian board exam blueprints, NCERT textbook nodes, and CBSE marking schemes. It includes Class 9, 10, 11, and 12, as well as competitive tracks like IIT-JEE, NEET-UG, and CAT Prep."
    },
    {
      q: "How does the custom StudyAI Pro API protect my security and keep things fast?",
      a: "Arhan's custom-designed API protects your progress and prevents key leaks by running all queries securely on our hyper-fast private backend server. Respected Arhan engineered this so that no client-side headers or tokens can ever be inspected or abused."
    },
    {
      q: "How does the gamification engine work?",
      a: "You earn experience points (XP) for completing pomodoro focused blocks, solving AI generated quizzes, revising study notes, and keeping your daily streak active. The application uses light localized caching to persist your level, XP boosts, and history."
    },
    {
      q: "Can I connect my Google Drive, class notes or PDF references?",
      a: "Absolutely. Under the workspace, you can upload notes, type custom prompts, or paste text. The AI integrates with your context to draft summary guides, mind maps, and interactive mock tests instantly."
    }
  ];

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="relative min-height-screen bg-[#050507] text-white overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Cinematic Aurora Ambient Lighting Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/[0.08] rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute top-[800px] right-10 w-[600px] h-[600px] bg-purple-600/[0.06] rounded-full blur-[180px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-10 w-[450px] h-[450px] bg-[#0bb6ae]/[0.05] rounded-full blur-[150px] pointer-events-none"></div>

      {/* Top Glassmorphic Premium Navbar */}
      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 via-[#7c6bef] to-[#0bb6ae] rounded-xl flex items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(124,107,239,0.4)] relative">
            <Sparkle size={16} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-md font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              StudyAI <span className="text-xs uppercase bg-indigo-500/20 text-indigo-300 font-mono font-bold px-1.5 py-0.5 rounded border border-indigo-500/30 ml-1">Pro</span>
            </h1>
            <p className="text-[9px] text-white/40 font-mono tracking-widest uppercase">The future of study systems</p>
          </div>
        </div>

        {/* Live Counters & CTA Panel */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 font-mono text-[10px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{activeUsers} Students Online Now</span>
          </div>

          <button
            onClick={() => {
              onPlaySound();
              setShowOnboarding(true);
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold font-mono tracking-tight bg-gradient-to-r from-indigo-500 to-[#7c6bef] hover:from-indigo-600 hover:to-[#6a56e0] transition-all shadow-[0_4px_20px_rgba(124,107,239,0.35)] hover:shadow-[0_4px_25px_rgba(124,107,239,0.5)] cursor-pointer flex items-center gap-1 bg-size-200 animate-gradient"
          >
            Launch StudyAI Pro <ChevronRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 md:pt-24 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Animated Feature Pill */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 font-mono text-xs font-semibold border border-indigo-500/20 mb-8"
        >
          <Sparkles size={12} className="text-indigo-400 animate-spin-slow" />
          <span>INDIAN SYLLABUS Blueprints Powered by StudyAI Pro API</span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          <span className="text-[10px] text-white/50 font-normal">v4.3 Custom Core by Arhan</span>
        </motion.div>

        {/* Grand Cinematic Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="space-y-4 max-w-4xl"
        >
          <h2 className="text-4xl md:text-7xl font-extrabold font-display tracking-tight leading-[1.05] bg-gradient-to-b from-white via-slate-100 to-indigo-100 bg-clip-text text-transparent">
            The Elite Study Platform <br />
            <span className="bg-gradient-to-r from-indigo-400 via-[#7c6bef] to-[#0bb6ae] bg-clip-text text-transparent">Designed by Respected Arhan</span>
          </h2>
          <p className="text-white/60 text-sm md:text-xl max-w-2xl mx-auto font-sans leading-relaxed">
            Stop studying harder. Start studying smarter. A unified glassmorphic environment with an integrated Feynman Tutor, Mind Maps, active retrieval quizzes, and high-octane Pomodoro Lo-Fi loops. Powered by Arhan's custom fine-tuned micro-models for CBSE, ICSE, and competitive toppers.
          </p>
        </motion.div>

        {/* Dual CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <button
            onClick={() => {
              onPlaySound();
              setShowOnboarding(true);
            }}
            className="px-8 py-4 rounded-xl text-sm font-bold font-mono tracking-tight bg-gradient-to-r from-indigo-500 via-[#7c6bef] to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-[0_0_35px_rgba(124,107,239,0.4)] flex items-center gap-2 cursor-pointer"
          >
            Launch StudyAI Pro (Get +250 XP Boost) <RocketIcon />
          </button>
          
          <a
            href="#demo"
            className="px-8 py-4 rounded-xl text-sm font-bold font-mono tracking-tight bg-white/5 hover:bg-white/10 border border-white/10 transition-all gap-2 flex items-center"
          >
            <Play size={14} /> Interactive Sandbox Trial
          </a>
        </motion.div>

        {/* Social Proof Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-16 w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-3xl bg-white/[0.01] border border-white/5 backdrop-blur-3xl"
        >
          <div className="text-center p-3">
            <h4 className="text-2xl md:text-4xl font-extrabold font-display text-white">99.4%</h4>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono mt-1">Topper Score Rate</p>
          </div>
          <div className="text-center p-3">
            <h4 className="text-2xl md:text-4xl font-extrabold font-display bg-gradient-to-r from-indigo-400 to-[#7c6bef] bg-clip-text text-transparent">1.2M+</h4>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono mt-1">Active Study Hours</p>
          </div>
          <div className="text-center p-3">
            <h4 className="text-2xl md:text-4xl font-extrabold font-display text-white">4.9/5</h4>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono mt-1">Student Rating</p>
          </div>
          <div className="text-center p-3">
            <h4 className="text-2xl md:text-4xl font-extrabold font-display bg-gradient-to-r from-[#0bb6ae] to-indigo-400 bg-clip-text text-transparent">SECURE</h4>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono mt-1">API Node Proxied</p>
          </div>
        </motion.div>

        {/* Dashboard Mockup Showcase Block */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-16 w-full max-w-5xl rounded-3xl p-2 bg-gradient-to-b from-indigo-500/20 via-slate-500/5 to-transparent border border-white/10 relative overflow-hidden group shadow-[0_20px_50px_rgba(124,107,239,0.15)]"
        >
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-indigo-500/50 to-transparent blur-[120px] pointer-events-none opacity-40"></div>
          
          <div className="bg-[#0b0c10] rounded-[22px] overflow-hidden border border-white/5 p-4 md:p-6 text-left space-y-6">
            {/* Mock Dashboard Top Control Bar */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <div className="ml-3 h-6 bg-white/5 rounded-md px-3 flex items-center font-mono text-[10px] text-white/40">
                  https://study-ai-pro.app/dashboard
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                🔥 LEVEL 12 TOpper
              </div>
            </div>

            {/* Mock Inner layouts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-white/40 font-mono tracking-wider">🔬 Active Feynman Tutor</span>
                <div className="text-xs bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-500/10 text-slate-300">
                  "Explain photoelectric effect like a teacher on a blackboard with simple diagrams..."
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-white/40 font-mono tracking-wider">🗓️ Cognitive Syllabus Timeline</span>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-[#0bb6ae] h-full w-[82%]"></div>
                </div>
                <p className="text-[10px] text-white/60 font-mono">82% Prepared for Class 12 Boards</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-white/40 font-mono tracking-wider">🎵 Cognitive Lo-Fi Audio Core</span>
                <span className="text-xs text-indigo-300 flex items-center gap-1 font-mono">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                  Lofi Binaural Focus Stream (Active)
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Interactive API Sandbox Demo */}
      <section id="demo" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-indigo-500/[0.03] rounded-full blur-[140px] pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-indigo-400 font-mono text-xs font-bold tracking-widest uppercase">Live API Sandbox</span>
            <h3 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-white leading-tight">
              Test-Drive the AI Core <br />
              <span className="bg-gradient-to-r from-[#7c6bef] to-[#0bb6ae] bg-clip-text text-transparent">No login required.</span>
            </h3>
            <p className="text-white/60 text-sm md:text-base leading-relaxed">
              We connected this sandbox directly to StudyAI Pro custom serverless API built by respected Arhan. Customize your exam prep output and trigger a response instantly. Experience the lightning-fast speed and pedagogical clarity.
            </p>

            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-white/40 font-mono tracking-wider">Select AI Study Scribe Persona</span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                { [
                  { id: "notes", label: "Smart Notes", icon: BookOpen },
                  { id: "quiz", label: "Quiz Maker", icon: HelpCircle },
                  { id: "fc_gen", label: "Flashcards", icon: Cpu }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onPlaySound();
                      setDemoPersona(p.id);
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold font-mono tracking-tight transition-all flex items-center gap-2 cursor-pointer ${
                      demoPersona === p.id 
                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-300"
                        : "bg-white/[0.01] border-white/5 text-slate-400 hover:border-white/15"
                    }`}
                  >
                    <p.icon size={13} /> {p.label}
                  </button>
                )) }
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-white/40 font-mono">Input Question or Syllabus Topic</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={demoPrompt}
                  onChange={(e) => setDemoPrompt(e.target.value)}
                  placeholder="e.g. CBSE Class 12 Integration Formulas..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50"
                />
                <button
                  onClick={handleDemoTrial}
                  disabled={demoLoading}
                  className="px-5 py-3 rounded-xl text-xs font-mono font-bold bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {demoLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>Run <Sparkles size={13} /></>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Notebook Sandbox Preview Output */}
          <div className="rounded-2xl bg-black/50 border border-white/5 p-5 min-h-[300px] flex flex-col relative max-h-[480px]">
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-mono text-indigo-300">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></span>
              Live Sandbox Output
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/85"></span>
              <span className="text-xs font-mono font-bold text-indigo-400">StudyAI-Pro-Scribe-Core-API-v4 (Built specially by respected Arhan)</span>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-xs text-slate-300 space-y-2 pr-1 select-text">
              {demoLoading ? (
                <div className="space-y-3 py-6 animate-pulse">
                  <div className="h-4 bg-white/10 rounded-full w-2/3"></div>
                  <div className="h-4 bg-white/10 rounded-full w-4/5"></div>
                  <div className="h-4 bg-white/10 rounded-full w-1/2"></div>
                  <div className="h-4 bg-white/10 rounded-full w-3/4"></div>
                </div>
              ) : demoResult ? (
                <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300 leading-relaxed max-w-full">
                  {demoResult}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-500 space-y-2">
                  <Cpu size={24} className="text-slate-600 animate-pulse" />
                  <p>Click "Run" to fetch live formatted NCERT board reference materials generated in real-time.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Core Habit/Addiction Ecosystem Core Features */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center space-y-4 mb-16">
          <span className="text-indigo-400 font-mono text-xs font-bold tracking-widest uppercase">The Operating System Blueprint</span>
          <h3 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
            Designed to Hook Your Brain <br />
            <span className="bg-gradient-to-r from-indigo-400 to-[#7c6bef] bg-clip-text text-transparent">On Academic Growth</span>
          </h3>
          <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto font-sans">
            We combined gaming heuristics with advanced pedagogical neuroscience to turn study sessions into highly addictive leveling systems.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-3xl p-6 bg-gradient-to-br from-indigo-950/20 via-transparent to-transparent border border-white/5 flex flex-col justify-between space-y-6 relative overflow-hidden min-h-[300px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/[0.02] rounded-full blur-3xl pointer-events-none"></div>
            <div>
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Flame size={18} />
              </div>
              <h4 className="text-lg font-bold text-white font-display">Spaced Repetition & Streak Engine</h4>
              <p className="text-white/50 text-xs mt-1 max-w-md">
                Maintains a rolling active calendar, tracking daily study sessions. Daily reminders prompt focus blocks, keeping your momentum chain unbreakable.
              </p>
            </div>
            
            {/* Gamified Streak Mock Grid */}
            <div className="flex gap-2 p-3 bg-white/[0.01] border border-white/5 rounded-2xl w-fit">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-[9px] font-mono text-white/40 uppercase mb-1">{day}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs border ${
                    idx < 5 
                      ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(124,107,239,0.3)]"
                      : "bg-white/[0.02] border-white/5 text-slate-600"
                  }`}>
                    {idx < 5 ? "🔥" : "💤"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl p-6 bg-gradient-to-b from-purple-950/10 to-transparent border border-white/5 flex flex-col justify-between space-y-6 min-h-[300px]">
            <div>
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <Award size={18} />
              </div>
              <h4 className="text-lg font-bold text-white font-display">Topper Leaderboard challenges</h4>
              <p className="text-white/50 text-xs mt-1">
                Compete asynchronously or form squad goal partnerships with elite aspirants on NEET-UG, JEE, and UPSC study tracks.
              </p>
            </div>

            <div className="space-y-2 bg-black/40 p-3 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#0bb6ae]">1. Dr. Ritika (NEET)</span>
                <span className="font-bold">4,820 XP</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white/80">2. Aarav S. (JEE)</span>
                <span className="font-bold">4,110 XP</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-indigo-400 bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10">
                <span>⚡ YOU (Challenger)</span>
                <span className="font-bold">+250 XP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YC Student Testimonials */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center space-y-4 mb-16">
          <span className="text-indigo-400 font-mono text-xs font-bold tracking-widest uppercase">Topper Success Stories</span>
          <h3 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
            Endorsed by India's Top Board Rankers
          </h3>
          <p className="text-white/60 text-sm max-w-xl mx-auto font-sans">
            Hear from students who crushed their Board exams, JEE Mains, and competitive timelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "The Feynman tutor on StudyAI completely replaced my private coaching. It simplifies heavy organic chemistry reactions so intuitively that memorization feels automatic.",
              author: "Aarav Sharma",
              sub: "JEE Main AIR 42 aspirant",
              logo: "🧠"
            },
            {
              quote: "I generated mock tests every day before school boards. The instant markdown solutions highlighted my weak formulas and helped boost my score from 84% to 98% in CBSE Physics.",
              author: "Ananya Iyer",
              sub: "Class 12 Topper, 98.2%",
              logo: "🧬"
            },
            {
              quote: "Having the secure StudyAI Pro API custom-made by respected Arhan live on our private server meant I could study at 3 AM with instant lag-free guidance and pristine syllabus compliance.",
              author: "Advait Sen",
              sub: "UPSC Civils Finalist",
              logo: "🏛️"
            }
          ].map((t, idx) => (
            <div key={idx} className="bg-white/[0.01] border border-white/5 p-6 rounded-2xl relative space-y-4 hover:border-indigo-500/20 hover:bg-indigo-950/10 transition-all duration-300">
              <span className="text-4xl text-indigo-500/20 font-serif absolute -top-1 left-4">“</span>
              <p className="text-slate-300 text-xs leading-relaxed italic z-10 relative pt-2">
                {t.quote}
              </p>
              <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm">{t.logo}</div>
                <div>
                  <h5 className="text-xs font-bold text-white">{t.author}</h5>
                  <p className="text-[10px] text-white/40">{t.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Elite SaaS Pricing Grids (Vercel Style) */}
      <section className="py-20 px-6 max-w-5xl mx-auto border-t border-white/5">
        <div className="text-center space-y-4 mb-16">
          <span className="text-indigo-400 font-mono text-xs font-bold tracking-widest uppercase">Affordable Elite Access</span>
          <h3 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
            Syllabus Pass Pricing
          </h3>
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            Get god-tier study tools. Host with your own API or utilize our secure Vercel cloud service directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Offline Explorer",
              price: "Free",
              features: [
                "Full Client Study Dashboard",
                "Feynman Doubt solving engine",
                "Local Storage Persistence",
                "Custom Scribe Core access code",
                "Audio Lofi Focus streams"
              ],
              cta: "Launch Platform",
              popular: false
            },
            {
              title: "Board Topper OS",
              price: "₹499/mo",
              features: [
                "Access Secure StudyAI Pro Custom API",
                "Advanced PDF Upload & Summaries",
                "Daily Leaderboard & Multi-device syncing",
                "Auto weak topic recovery plans",
                "Syllabus heatmaps & high stats tracking"
              ],
              cta: "Go Topper Unlimited",
              popular: true
            },
            {
              title: "UPSC / JEE Elite",
              price: "₹899/mo",
              features: [
                "Vercel Node API Premium Edge Routing",
                "Arhan Scribe Extreme Custom Model API",
                "Daily CBQ pattern forecasts",
                "Priority cloud synchronization modules",
                "Unlimited mock PDF key creations"
              ],
              cta: "Contact Sales / Partner",
              popular: false
            }
          ].map((plan, idx) => (
            <div 
              key={idx} 
              className={`rounded-2xl p-6 flex flex-col justify-between border ${
                plan.popular 
                  ? "bg-gradient-to-b from-indigo-950/50 via-black to-black border-indigo-500 shadow-[0_4px_30px_rgba(124,107,239,0.15)] scale-105" 
                  : "bg-white/[0.01] border-white/5"
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-xs uppercase tracking-widest font-mono font-bold text-indigo-400">{plan.title}</h4>
                  {plan.popular && (
                    <span className="text-[8px] bg-[#0bb6ae]/20 text-[#0bb6ae] font-bold px-1.5 py-0.5 rounded border border-[#0bb6ae]/30">POPULAR</span>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-3xl font-extrabold font-display text-white">{plan.price}</span>
                  <p className="text-[10px] text-white/40">Includes local telemetry state integration</p>
                </div>
                <ul className="space-y-2.5 pt-4">
                  {plan.features.map((f, fIdx) => (
                    <li key={fIdx} className="text-xs text-slate-300 flex items-center gap-1.5">
                      <CheckCircle size={12} className="text-indigo-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => {
                  onPlaySound();
                  setShowOnboarding(true);
                }}
                className={`mt-6 w-full py-3 rounded-xl text-xs font-bold font-mono tracking-tight cursor-pointer ${
                  plan.popular 
                    ? "bg-indigo-500 hover:bg-indigo-600 text-white" 
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/5"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 px-6 max-w-4xl mx-auto border-t border-white/5">
        <h4 className="text-xl md:text-2xl font-bold text-center text-white mb-10 font-display">Frequently Asked Questions</h4>
        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-white/[0.01] border border-white/5 rounded-xl overflow-hidden transition-all duration-300"
            >
              <button 
                onClick={() => {
                  onPlaySound();
                  setActiveFaq(activeFaq === idx ? null : idx);
                }}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <span className="text-xs md:text-sm font-bold text-white font-sans">{faq.q}</span>
                <span className="text-indigo-400 text-sm">{activeFaq === idx ? "−" : "＋"}</span>
              </button>
              <AnimatePresence>
                {activeFaq === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5"
                  >
                    <p className="p-4 text-xs text-slate-400 leading-relaxed font-sans">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="border-t border-white/5 bg-[#030305] py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                <Sparkle size={14} />
              </div>
              <span className="text-sm font-bold">StudyAI Pro</span>
            </div>
            <p className="text-[11px] text-white/40 font-sans leading-relaxed">
              Billion-dollar study operating system. Created and owned by Arhan. Designed with real-time cognitive tracking & Syllabus alignment guides.
            </p>
          </div>
          <div>
            <h5 className="text-[10px] uppercase font-bold text-indigo-400 font-mono tracking-widest mb-3">Academic Curriculy</h5>
            <ul className="space-y-1.5 text-[11px] text-white/55 font-mono">
              <li>CBSE / ICSE Board Prep</li>
              <li>IIT-JEE Exam Crack Track</li>
              <li>NEET-UG Mock Simulators</li>
              <li>UPSC CSAT Analysis</li>
            </ul>
          </div>
          <div>
            <h5 className="text-[10px] uppercase font-bold text-indigo-400 font-mono tracking-widest mb-3">Security & Edge</h5>
            <ul className="space-y-1.5 text-[11px] text-white/55 font-mono">
              <li>Vercel Proxied API</li>
              <li>Secure SSL Tunnel</li>
              <li>Zero Key Storage Cache</li>
              <li>Privacy Protected</li>
            </ul>
          </div>
          <div>
            <h5 className="text-[10px] uppercase font-bold text-indigo-400 font-mono tracking-widest mb-3">Community Hub</h5>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <p className="text-[10px] text-slate-300 font-sans">Join the study squad.</p>
              <button 
                onClick={() => {
                  onPlaySound();
                  setShowOnboarding(true);
                }}
                className="w-full py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded text-[9px] font-mono text-white text-center font-bold"
              >
                Sign Up Now
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center border-t border-white/5 mt-8 pt-6">
          <p className="text-[10px] text-white/30 font-mono">&copy; 2026 StudyAI Pro Inc. Built for Indian Boards with pure Love and HardWork - Arhan,</p>
          <p className="text-[10px] text-indigo-400 font-mono font-semibold mt-1">Made by Arhan (Arhan is the Owner and Programmer)</p>
        </div>
      </footer>

      {/* Dynamic Multi-Step Onboarding Flow Modal Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-50 bg-[#050507]/90 backdrop-blur-2xl flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl rounded-3xl bg-[#0a0b10] border border-white/10 overflow-hidden relative shadow-[0_30px_70px_rgba(124,107,239,0.25)] flex flex-col justify-between min-h-[500px]"
            >
              {/* Onboarding Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center text-xs text-white">✨</div>
                  <span className="text-xs font-bold font-mono text-slate-300">Topper Onboarding Checklist</span>
                </div>
                <button 
                  onClick={() => {
                    onPlaySound();
                    setShowOnboarding(false);
                    setOnboardingStep(1);
                  }}
                  className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/15 cursor-pointer text-slate-400 hover:text-white text-xs"
                >
                  &times;
                </button>
              </div>

              {/* Step indicator pipeline */}
              <div className="bg-[#050507] px-6 py-3 flex gap-2 border-b border-white/5">
                {[1, 2, 3, 4].map(sNum => (
                  <div key={sNum} className="flex-1 flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      onboardingStep === sNum 
                        ? "bg-indigo-500 text-white" 
                        : onboardingStep > sNum 
                          ? "bg-[#0bb6ae] text-white" 
                          : "bg-white/5 text-slate-500"
                    }`}>
                      {onboardingStep > sNum ? "✓" : sNum}
                    </div>
                    <div className={`h-0.5 flex-1 rounded ${
                      onboardingStep >= sNum ? "bg-indigo-500" : "bg-white/5"
                    }`}></div>
                  </div>
                ))}
              </div>

              {/* Onboarding Step View Core */}
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                {onboardingStep === 1 && (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono">STEP 1 OF 4</span>
                      <h4 className="text-xl font-extrabold text-white font-display">Who's study-questing today?</h4>
                      <p className="text-xs text-white/55">Enter your customized name or alias so the AI can track your daily streaks.</p>
                    </div>
                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] text-white/40 uppercase font-mono">Your Name / Board Topper Tag</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="e.g. Arhan, Aarav, Ritika..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </motion.div>
                )}

                {onboardingStep === 2 && (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono">STEP 2 OF 4</span>
                      <h4 className="text-xl font-extrabold text-white font-display">Choose Syllabus & Grade Standard</h4>
                      <p className="text-xs text-white/55">Select your exam track or school board to load proper fine-tuned system contexts.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {[
                        { id: "CBSE", name: "CBSE Board" },
                        { id: "ICSE / ISC", name: "ICSE / ISC" },
                        { id: "IIT-JEE Prep", name: "IIT-JEE Syllabus" },
                        { id: "NEET UG Prep", name: "NEET Professional" },
                        { id: "UPSC Civil Services", name: "UPSC Prelims/CSAT" },
                        { id: "CAT MBA Prep", name: "CAT / Quant Exam" }
                      ].map(b => (
                        <button
                          key={b.id}
                          onClick={() => {
                            onPlaySound();
                            setSelectedBoard(b.id);
                          }}
                          className={`p-3 rounded-xl border text-xs text-left font-mono transition-all ${
                            selectedBoard === b.id 
                              ? "bg-indigo-500/10 border-indigo-500 text-indigo-300 font-bold"
                              : "bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/15"
                          }`}
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {onboardingStep === 3 && (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono">STEP 3 OF 4</span>
                      <h4 className="text-xl font-extrabold text-white font-display">Pick Your Active Core Subject</h4>
                      <p className="text-xs text-white/55">You can switch this anytime from the top bar inside the dashboard.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {["Mathematics", "Physics", "Chemistry", "Biology", "English Literature", "History & Civics"].map(sub => (
                        <button
                          key={sub}
                          onClick={() => {
                            onPlaySound();
                            setSelectedSubject(sub);
                          }}
                          className={`p-3 rounded-xl border text-xs text-left font-mono transition-all ${
                            selectedSubject === sub 
                              ? "bg-indigo-500/10 border-[#0bb6ae] text-[#0bb6ae] font-bold"
                              : "bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/15"
                          }`}
                        >
                          📚 {sub}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {onboardingStep === 4 && (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono">STEP 4 OF 4</span>
                      <h4 className="text-xl font-extrabold text-white font-display">Configure Tutor Persona Style</h4>
                      <p className="text-xs text-white/55">How would you like the AI to converse and solve exam queries?</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-2">
                      {[
                        { id: "doubts", title: "Feynman Coach", desc: "Simplifies answers first, uses real-analogies, then academic keys." },
                        { id: "notes", title: "Master Academic Scribe", desc: "Outputs strictly structured formula codes, bullet lists & study guides." },
                        { id: "pred", title: "Exam Oracle", desc: "Predicts likely CBSE/ICSE patterns, chapter priorities and traps." }
                      ].map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            onPlaySound();
                            setSelectedPersona(p.id);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col space-y-0.5 ${
                            selectedPersona === p.id 
                              ? "bg-indigo-500/10 border-indigo-500"
                              : "bg-white/[0.02] border-white/5 hover:border-white/15"
                          }`}
                        >
                          <span className="text-xs font-bold font-mono text-white">{p.title}</span>
                          <span className="text-[10px] text-slate-400">{p.desc}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Onboarding Control Buttons */}
              <div className="p-6 border-t border-white/5 bg-black/40 flex justify-between items-center">
                {onboardingStep > 1 ? (
                  <button
                    onClick={() => {
                      onPlaySound();
                      setOnboardingStep(prev => prev - 1);
                    }}
                    className="px-4 py-2 text-xs font-mono font-bold hover:text-white text-slate-400 cursor-pointer"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {onboardingStep < 4 ? (
                  <button
                    onClick={() => {
                      onPlaySound();
                      // Set default tag if step 1 is empty
                      if (onboardingStep === 1 && !userName.trim()) {
                        setUserName("Topper Scholar");
                      }
                      setOnboardingStep(prev => prev + 1);
                    }}
                    className="px-6 py-3 rounded-xl text-xs font-mono font-bold bg-indigo-500 hover:bg-indigo-600 text-white cursor-pointer"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleFinishOnboarding}
                    className="px-6 py-3 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-emerald-500 to-[#0bb6ae] hover:from-emerald-600 hover:to-[#099c96] text-white cursor-pointer relative overflow-hidden flex items-center gap-1 animate-pulse"
                  >
                    Unlock Study OS (Claim +250 XP Boost)
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function RocketIcon() {
  return (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  );
}
