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
import InteractiveText from "./InteractiveText";
import CinematicBeamCanvas from "./CinematicBeamCanvas";
import { trackPageView, trackEvent } from "../lib/analytics";

interface LandingPageProps {
  onLaunchApp: (onboardingData?: { board: string; cls: string; sub: string; tracker?: string }) => void;
  onCallAI: (prompt: string, persona: string) => Promise<string | null>;
  onPlaySound: () => void;
  initialState: any;
}

export default function LandingPage({ onLaunchApp, onCallAI, onPlaySound, initialState }: LandingPageProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  
  // Tactical click physics ripples for button clicks
  const [btnRipples, setBtnRipples] = useState<{ id: string; x: number; y: number }[]>([]);
  const triggerRipple = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Math.random().toString(), x, y };
    setBtnRipples(prev => [...prev, newRipple]);
  };
  
  // High-fidelity cursor parallax tracking coordinate states
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Coordinates normalized from -0.5 to 0.5 for fluid spatial drift
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  
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

  // GA4 Page View tracking on landing mount
  useEffect(() => {
    trackPageView("/", "StudyAI Pro - Landing Page");
    trackEvent("view_landing_page", {
      platform: "Web",
      host_name: window.location.hostname
    });
  }, []);

  const handleDemoTrial = async () => {
    if (!demoPrompt.trim()) return;
    setDemoLoading(true);
    setDemoResult(null);
    onPlaySound();
    
    // Log demo API sandbox event
    trackEvent("trial_demo_prompt", {
      prompt_length: demoPrompt.length,
      selected_persona: demoPersona
    });

    try {
      const response = await onCallAI(demoPrompt, demoPersona);
      setDemoResult(response);
      trackEvent("trial_demo_success", {
        selected_persona: demoPersona
      });
    } catch (err) {
      setDemoResult("Verification failed. Please check connection.");
      trackEvent("trial_demo_error", {
        selected_persona: demoPersona,
        error_message: String(err)
      });
    } finally {
      setDemoLoading(false);
    }
  };

  const handleFinishOnboarding = () => {
    onPlaySound();
    
    // Log successful app launcher onboarding config
    trackEvent("launch_app_onboarding", {
      selected_board: selectedBoard,
      selected_class: selectedClass,
      selected_subject: selectedSubject,
      name_supplied: Boolean(userName)
    });

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
      a: "Honourable Master Arhan's custom-designed API protects your progress and prevents key leaks by running all queries securely on our hyper-fast private backend server. Honourable Master Arhan engineered this so that no client-side headers or tokens can ever be inspected or abused."
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
    <div className="relative min-h-screen bg-[#050507] text-white overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Dynamic Keyframes and Core Effects Stylesheet */}
      <style>{`
        @keyframes gradient-shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes text-sweep {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes subtle-float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes fog-drift {
          0% { transform: translate(-30px, -30px) scale(1); }
          50% { transform: translate(30px, 30px) scale(1.1); }
          100% { transform: translate(-30px, -30px) scale(1); }
        }
        .animate-shimmer-fast {
          background-size: 200% auto;
          animation: text-sweep 4.5s linear infinite;
        }
        .animate-float-slow {
          animation: subtle-float 8s ease-in-out infinite;
        }
        .animate-fog-slow {
          animation: fog-drift 24s ease-in-out infinite;
        }
        .noise-underlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.015'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* Layer 0: Cosmic Deep Navy Backplate and Premium Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(12,10,36,0.32)_0%,_rgba(5,5,7,1)_85%)] pointer-events-none z-0" />
      <div className="absolute inset-0 noise-underlay opacity-70 pointer-events-none select-none z-[2]"></div>

      {/* Atmospheric Moving Fog */}
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-500/[0.03] blur-[150px] pointer-events-none animate-fog-slow z-0" />
      <div className="absolute top-[30%] right-[15%] w-[600px] h-[600px] rounded-full bg-cyan-500/[0.025] blur-[180px] pointer-events-none animate-fog-slow z-0" style={{ animationDelay: "-8s" }} />

      {/* Layer 1: 3D perspective rolling grid that shifts dynamically with the cursor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div 
          className="absolute -top-[40%] -left-[20%] -right-[20%] -bottom-[40%] opacity-25 transition-transform duration-300 ease-out"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.012) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.012) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            transform: `perspective(1000px) rotateX(60deg) translateY(${mousePos.y * -45}px) translateX(${mousePos.x * -45}px) scale(1.15)`,
            maskImage: "radial-gradient(circle at 50% 35%, black 25%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 35%, black 25%, transparent 75%)"
          }}
        />
      </div>

      {/* Layer 2: High-Performance Stardust Particles Canvas */}
      <SpaceParticlesCanvas />

      {/* Layer 3: Cinematic Multipoint Glowing Volumetric Auroras reacting to Mouse Coordinates */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[850px] h-[600px] bg-indigo-600/[0.11] rounded-full blur-[160px] pointer-events-none transition-transform duration-700 ease-out"
           style={{ transform: `translateX(calc(-50% + ${mousePos.x * 70}px)) translateY(${mousePos.y * 70}px)` }} />
      <div className="absolute top-[450px] left-[15%] w-[550px] h-[550px] bg-purple-600/[0.05] rounded-full blur-[180px] pointer-events-none transition-transform duration-700 ease-out"
           style={{ transform: `translate3d(${mousePos.x * -50}px, ${mousePos.y * -50}px, 0)` }} />
      <div className="absolute top-[250px] right-[10%] w-[500px] h-[500px] bg-[#0bb6ae]/[0.05] rounded-full blur-[170px] pointer-events-none transition-transform duration-500 ease-out"
           style={{ transform: `translate3d(${mousePos.x * 40}px, ${mousePos.y * -40}px, 0)` }} />

      {/* Layer 4: Interactive side vertical columns with continuous moving energy beams + floating atmospheric particles */}
      <div className="absolute left-[0.5vw] lg:left-[1.2vw] top-12 bottom-12 w-[180px] pointer-events-none hidden md:block select-none z-15 transition-transform duration-300 ease-out"
           style={{ transform: `translate3d(${mousePos.x * 6}px, ${mousePos.y * 6}px, 0)` }}>
        <CinematicBeamCanvas side="left" mousePos={mousePos} />
      </div>

      <div className="absolute right-[0.5vw] lg:right-[1.2vw] top-12 bottom-12 w-[180px] pointer-events-none hidden md:block select-none z-15 transition-transform duration-300 ease-out"
           style={{ transform: `translate3d(${mousePos.x * -6}px, ${mousePos.y * 6}px, 0)` }}>
        <CinematicBeamCanvas side="right" mousePos={mousePos} />
      </div>

      {/* Top Glassmorphic Premium Navbar */}
      <header className="sticky top-0 z-40 bg-black/45 backdrop-blur-2xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
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
            data-cursor="magnetic"
            data-cursor-label="LAUNCH"
            className="px-5 py-2 rounded-xl text-xs font-bold font-mono tracking-tight bg-gradient-to-r from-indigo-500 to-[#7c6bef] hover:from-indigo-600 hover:to-[#6a56e0] transition-all shadow-[0_4px_20px_rgba(124,107,239,0.35)] hover:shadow-[0_4px_25px_rgba(124,107,239,0.5)] cursor-pointer flex items-center gap-1 bg-size-200"
          >
            Launch StudyAI Pro <ChevronRight size={14} />
          </button>
        </div>
      </header>

      {/* Cinematic Fluid Gradient Mesh & Floating Orbs Background Layer */}
      <div className="absolute top-[5%] inset-0 overflow-hidden pointer-events-none select-none z-0">
        <motion.div
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.12, 0.95, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[12%] left-[8%] w-[420px] h-[420px] rounded-full bg-gradient-to-br from-pink-500/15 to-purple-800/20 blur-[100px] opacity-30 mix-blend-screen"
        />
        <motion.div
          animate={{
            x: [0, -70, 40, 0],
            y: [0, 50, -50, 0],
            scale: [1, 0.92, 1.15, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[22%] right-[12%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-cyan-400/15 to-indigo-700/20 blur-[110px] opacity-35 mix-blend-screen"
        />
        <motion.div
          animate={{
            x: [0, 30, -40, 0],
            y: [0, 60, -35, 0],
            scale: [1, 1.08, 0.98, 1],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[35%] left-[30%] w-[380px] h-[380px] rounded-full bg-gradient-to-br from-[#7c6bef]/12 to-transparent blur-[90px] opacity-40 mix-blend-screen"
        />
      </div>

      {/* Hero Section with Cinematic Stagger Reveal Sequence */}
      <section className="relative pt-16 md:pt-28 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        
        {/* Sequence 1: Animated Feature Pill floating in with brand identity */}
        <motion.div 
          initial={{ opacity: 0, y: -25, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full backdrop-blur-md bg-gradient-to-r from-indigo-500/15 to-[#7c6bef]/15 text-indigo-200 font-mono text-[11px] font-bold border border-white/10 mb-10 shadow-[0_0_20px_rgba(124,107,239,0.15)] hover:border-indigo-400/40 hover:shadow-[0_0_25px_rgba(124,107,239,0.3)] transition-all ease-out duration-300"
        >
          <Sparkles size={13} className="text-indigo-300 animate-spin-slow" />
          <span>INDIAN SYLLABUS BLUEPRINTS POWERED BY STUDYAI PRO API</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0bb6ae] animate-pulse"></span>
          <span className="text-[10px] text-slate-100 font-bold tracking-wider uppercase">v4.3 Custom Core by Honourable Master Arhan</span>
        </motion.div>

        {/* Cinematic Backdrop Ambient Glow Orb (loads immediately behind the headline block) */}
        <div 
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[750px] h-[420px] rounded-full pointer-events-none z-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(124,107,239,0.2) 0%, rgba(11,182,174,0.08) 50%, transparent 75%)",
            filter: "blur(80px)",
            transform: `translate3d(calc(-50% + ${mousePos.x * 30}px), calc(${mousePos.y * 30}px), 0) scale(1.15)`
          }}
        />

        {/* Sequence 2: Headline with Gradient Sweep & word-by-word/character-by-character smooth reveals */}
        <div className="space-y-6 max-w-4xl z-15 relative">
          <motion.div 
            animate={{ 
              scale: [1, 1.01, 1],
              rotateY: mousePos.x * 6,
              rotateX: mousePos.y * -6
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center select-none preserve-3d transition-transform duration-300"
          >
            {/* First Line (Cinematic) */}
            <CinematicTitle 
              text="The Elite Study Platform" 
              className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.7rem] leading-[1.08] font-black tracking-tight drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] font-display text-center"
              gradient="from-slate-100 via-white to-slate-300"
              glowColor="rgba(255,255,255,0.3)"
              delayOffset={0.16}
            />
            
            {/* Second Line (Cinematic) */}
            <CinematicTitle 
              text="Designed by" 
              className="text-2xl sm:text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.1] font-extrabold mt-3 font-display text-center" 
              glowColor="rgba(255, 255, 255, 0.4)"
              delayOffset={0.5}
              customStyle={{
                background: "linear-gradient(to bottom, #FFFFFF 60%, #E2E8F0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 20px rgba(255, 255, 255, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)"
              }}
            />

            {/* Third Line (Cinematic Brand Power) */}
            <CinematicTitle 
              text="Honourable Master Arhan" 
              className="text-4xl sm:text-6xl md:text-7xl lg:text-[4.8rem] leading-[1.1] font-black uppercase mt-4 drop-shadow-[0_6px_35px_rgba(11,182,174,0.5)] font-display text-center tracking-wider" 
              gradient="from-[#00f0e6] via-[#38bdf8] to-[#7c6bef]"
              glowColor="rgba(0, 240, 230, 0.75)"
              delayOffset={0.9}
            />
          </motion.div>

          {/* Sequence 3: Description Body floating slowly with negative space and subtle scale breathing */}
          <motion.p
            initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.8, delay: 1.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-slate-100 text-xs sm:text-sm md:text-lg font-medium max-w-2xl mx-auto font-sans leading-relaxed tracking-wide select-none pt-2"
          >
            Stop studying harder. Start studying smarter. A unified glassmorphic environment with an integrated Feynman Tutor, Mind Maps, active retrieval quizzes, and high-octane Pomodoro Lo-Fi loops. Powered by Honourable Master Arhan's custom fine-tuned micro-models for CBSE, ICSE, and competitive toppers.
          </motion.p>
        </div>

        {/* Sequence 4: Dual CTA Buttons with elastic spring, magnetic, glow-pulse, and tactile ripple interaction */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ 
            type: "spring",
            stiffness: 80,
            damping: 15,
            delay: 1.45 
          }}
          className="mt-12 flex flex-wrap justify-center items-center gap-6 z-20 relative"
        >
          <MagneticContainer className="z-20">
            <motion.button
              onClick={(e) => {
                onPlaySound();
                triggerRipple(e);
                setTimeout(() => setShowOnboarding(true), 250);
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 45px rgba(124, 107, 239, 0.45), 0 0 30px rgba(11, 182, 174, 0.35)"
              }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 450, damping: 15 }}
              className="px-8 py-5 rounded-2xl text-[11px] font-extrabold font-mono tracking-widest uppercase bg-gradient-to-r from-indigo-500 via-[#7c6bef] to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center gap-2.5 cursor-pointer relative group overflow-hidden border border-white/20 shadow-[0_5px_30px_rgba(124,107,239,0.3)] select-none"
            >
              {/* Ripple canvas inside */}
              <span className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                {btnRipples.map((r) => (
                  <motion.span
                    key={r.id}
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute rounded-full bg-white/25 pointer-events-none"
                    style={{
                      left: r.x - 10,
                      top: r.y - 10,
                      width: 20,
                      height: 20,
                    }}
                    onAnimationComplete={() => {
                      setBtnRipples((prev) => prev.filter((item) => item.id !== r.id));
                    }}
                  />
                ))}
              </span>
              <span>Launch StudyAI Pro (+250 XP Boost)</span>
              <RocketIcon />
            </motion.button>
          </MagneticContainer>

          <MagneticContainer className="z-20">
            <motion.a
              href="#demo"
              onClick={(e) => {
                onPlaySound();
                triggerRipple(e as any);
              }}
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255,255,255,0.08)",
                boxShadow: "0 15px 30px rgba(255, 255, 255, 0.05), 0 0 20px rgba(124, 107, 239, 0.15)"
              }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 450, damping: 15 }}
              className="px-8 py-5 rounded-2xl text-[11px] font-extrabold font-mono tracking-widest uppercase bg-white/5 border border-white/10 hover:border-white/20 transition-all gap-2.5 flex items-center cursor-pointer relative group overflow-hidden select-none"
            >
              {/* Ripple canvas inside */}
              <span className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                {btnRipples.map((r) => (
                  <motion.span
                    key={r.id}
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute rounded-full bg-white/25 pointer-events-none"
                    style={{
                      left: r.x - 10,
                      top: r.y - 10,
                      width: 20,
                      height: 20,
                    }}
                    onAnimationComplete={() => {
                      setBtnRipples((prev) => prev.filter((item) => item.id !== r.id));
                    }}
                  />
                ))}
              </span>
              <Play size={14} className="text-[#0bb6ae]" />
              <span>Sandbox Trial</span>
            </motion.a>
          </MagneticContainer>
        </motion.div>

        {/* Social Proof Stats Grid with dynamic scaling and premium hover state */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="mt-16 w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-3xl bg-neutral-900/40 border border-white/5 backdrop-blur-3xl z-10 shadow-xl"
        >
          <div className="text-center p-3 hover:bg-white/[0.02] rounded-2xl transition-all duration-300 group">
            <h4 className="text-2xl md:text-4xl font-black font-display text-white transition-transform group-hover:scale-105 duration-300">99.4%</h4>
            <p className="text-[10px] text-slate-300 uppercase tracking-widest font-mono font-bold mt-1 group-hover:text-teal-400 transition-colors">Topper Score Rate</p>
          </div>
          <div className="text-center p-3 hover:bg-white/[0.02] rounded-2xl transition-all duration-300 group">
            <h4 className="text-2xl md:text-4xl font-black font-display bg-gradient-to-r from-indigo-400 to-[#7c6bef] bg-clip-text text-transparent transition-transform group-hover:scale-105 duration-300">1.2M+</h4>
            <p className="text-[10px] text-slate-300 uppercase tracking-widest font-mono font-bold mt-1 group-hover:text-indigo-400 transition-colors">Active Study Hours</p>
          </div>
          <div className="text-center p-3 hover:bg-white/[0.02] rounded-2xl transition-all duration-300 group">
            <h4 className="text-2xl md:text-4xl font-black font-display text-white transition-transform group-hover:scale-105 duration-300">4.9/5</h4>
            <p className="text-[10px] text-slate-300 uppercase tracking-widest font-mono font-bold mt-1 group-hover:text-pink-400 transition-colors">Student Rating</p>
          </div>
          <div className="text-center p-3 hover:bg-white/[0.02] rounded-2xl transition-all duration-300 group">
            <h4 className="text-2xl md:text-4xl font-black font-display bg-gradient-to-r from-[#0bb6ae] to-indigo-400 bg-clip-text text-transparent transition-transform group-hover:scale-105 duration-300">SECURE</h4>
            <p className="text-[10px] text-slate-300 uppercase tracking-widest font-mono font-bold mt-1 group-hover:text-[#00f0e6] transition-colors">API Node Proxied</p>
          </div>
        </motion.div>

        {/* Floating 3D Showcase Deck with absolute micro-parallax visual components */}
        <motion.div
          initial={{ opacity: 0, y: 70 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 w-full max-w-5xl relative z-10"
        >
          {/* Main Showcase Backlight Aura */}
          <div 
            className="absolute top-0 left-0 right-0 bottom-0 bg-indigo-500/[0.06] blur-[100px] pointer-events-none -z-10 transition-transform duration-500"
            style={{ transform: `translate3d(${mousePos.x * 25}px, ${mousePos.y * 25}px, 0)` }}
          />

          {/* Perspective Rotating Frame */}
          <div 
            className="relative transition-transform duration-500 ease-out"
            style={{
              transform: `perspective(1200px) rotateX(${8 - (mousePos.y * 20)}deg) rotateY(${mousePos.x * 20}deg)`,
              transformStyle: "preserve-3d"
            }}
          >
            {/* Core Device Card Container */}
            <div className="bg-[#08080c]/90 rounded-3xl p-2.5 border border-white/10 shadow-[0_25px_65px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(124,107,239,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-[-100px] w-60 h-60 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

              {/* Top Control Bar of Mock Interface */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 p-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  <div className="ml-4 h-6 bg-white/5 border border-white/5 rounded-md px-3 flex items-center font-mono text-[10px] text-white/50 shadow-inner">
                    study-ai-pro.sh/synergy-cluster4-node-arhan
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-[9px] hover:text-[#00f0e6] transition-colors border border-[#0bb6ae]/30 bg-[#0bb6ae]/10 text-[#00f0e6] px-3 py-1 rounded-full shadow-[0_0_10px_rgba(11,182,174,0.15)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0e6] animate-ping" />
                  <span>SYSTEM SYNCED &bull; LEVEL 12 SCHOLAR</span>
                </div>
              </div>

              {/* Main Inside Mock Dashboard Panel Layout */}
              <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* Visual Card 1: Live Feynman Tutor */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/[0.02] to-transparent pointer-events-none" />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-[#7c6bef] font-mono tracking-wider flex items-center gap-1.5">
                      <Cpu size={12} className="text-indigo-400" />
                      <span>🔬 Feynman Quantum Core</span>
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">ACTIVE</span>
                  </div>
                  <div className="text-xs bg-slate-950/80 p-3.5 rounded-xl border border-white/5 text-slate-200 font-sans leading-relaxed shadow-inner">
                    <p className="font-mono text-[9px] text-[#00f0e6] mb-1.5">&gt; INPUT QUERY SENT</p>
                    "Explain the Photoelectric Effect like a mentor on a clean chalkboard with simple intuitive loops..."
                  </div>
                  <div className="h-[2px] w-full bg-indigo-500/30 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      className="bg-gradient-to-r from-teal-400 to-[#7c6bef] h-full w-[45%]"
                    />
                  </div>
                </div>

                {/* Visual Card 2: Brain Oscilloscope wave and Syllabus */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-teal-400 font-mono tracking-wider flex items-center gap-1.5">
                      <Activity size={12} className="text-teal-400" />
                      <span>🗓️ Cognitive Tracking</span>
                    </span>
                    <span className="text-[9px] font-mono text-indigo-300 font-bold">STREAK: 12d</span>
                  </div>
                  
                  {/* Active Simulated Mindwave Equalizer */}
                  <div className="flex items-end justify-between h-14 px-2 bg-black/40 rounded-xl border border-white/5 py-2">
                    {[30, 75, 50, 90, 40, 80, 65, 95, 45, 70, 85, 55, 92, 40].map((val, idx) => (
                      <motion.div 
                        key={idx}
                        animate={{ height: [`${val * 0.45}%`, `${val * 1.05}%`, `${val * 0.45}%`] }}
                        transition={{ duration: 1.5 + (idx * 0.1), repeat: Infinity, ease: "easeInOut" }}
                        className="w-[3px] bg-gradient-to-t from-teal-500 via-indigo-500 to-pink-500 rounded-full"
                      />
                    ))}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>CBSE Chemistry Track</span>
                      <span className="text-white font-bold">82% Sync</span>
                    </div>
                    <div className="h-1.5 bg-white/5 border border-white/5 rounded-full overflow-hidden p-[1px]">
                      <div className="bg-gradient-to-r from-[#0bb6ae] via-[#7c6bef] to-pink-500 h-full w-[82%] rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Visual Card 3: Vinyl Cognitive Sound Loop */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 relative group overflow-hidden flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-pink-400 font-mono tracking-wider flex items-center gap-1.5">
                      <Volume2 size={12} className="text-pink-400" />
                      <span>🎵 Binaural Focus Core</span>
                    </span>
                    <span className="text-[9px] font-mono text-[#00f0e6] font-bold">40Hz ALPHA</span>
                  </div>

                  <div className="flex items-center gap-3 bg-black/35 p-2 rounded-xl border border-white/5">
                    {/* Simulated Spinning Vinyl Lofi Record */}
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center relative shadow-lg shrink-0"
                    >
                      <div className="w-4 h-4 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-md animate-pulse" />
                      </div>
                    </motion.div>
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-bold text-slate-100 truncate">Midnight Study Waves</p>
                      <p className="text-[9px] font-mono text-pink-400 mt-0.5 tracking-wider uppercase">Lo-Fi Pulse Running</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-white/55 font-sans leading-relaxed">
                    Synced focus audio increases retention rates by 34.2% automatically in deep pomodoro nodes.
                  </p>
                </div>
              </div>
            </div>

            {/* LAYER 5: UPPER-LEFT FLOATING CHAT BALLOON (Floating opposite with high-speed relative parallax offset) */}
            <motion.div 
              style={{ transform: `translate3d(${mousePos.x * -75}px, ${mousePos.y * -75}px, 60px)` }}
              className="absolute -top-12 -left-12 max-w-[200px] p-4 rounded-2xl bg-slate-900/95 border border-cyan-500/30 backdrop-blur-xl shadow-[0_15px_30px_rgba(11,182,174,0.15)] hidden lg:block text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#0bb6ae] animate-ping" />
                <span className="text-[9px] font-mono text-[#00f0e6] font-extrabold uppercase tracking-wide">Feynman Decoder</span>
              </div>
              <p className="text-[11px] font-sans text-slate-100 font-bold italic leading-relaxed">
                "Wait, are you saying light acts as tiny particles of energy called photons?"
              </p>
            </motion.div>

            {/* LAYER 6: UPPER-RIGHT FLOATING LEADERBOARD NODE (Hovering on positive relative parallax axis) */}
            <motion.div 
              style={{ transform: `translate3d(${mousePos.x * 60}px, ${mousePos.y * -65}px, 80px)` }}
              className="absolute -top-16 -right-10 max-w-[220px] p-4 rounded-2xl bg-neutral-950/95 border border-[#7c6bef]/45 backdrop-blur-2xl shadow-[0_18px_45px_rgba(124,107,239,0.22)] hidden lg:block text-left"
            >
              <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/5">
                <Award size={12} className="text-[#a78bfa]" />
                <span className="text-[9px] font-mono text-purple-300 font-extrabold uppercase tracking-widest">Topper Synergy Grid</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-[#0bb6ae] font-bold">1. Dr. Ritika (NEET)</span>
                  <span className="text-white font-extrabold">4,820 XP</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-purple-300 font-bold">⚡ YOU (Challenger)</span>
                  <span className="text-white/80 font-bold">+250 XP</span>
                </div>
              </div>
            </motion.div>

            {/* LAYER 7: BOTTOM CENTER HOLOGRAPHIC MULTIPLIER (Reacting on a third depth track) */}
            <motion.div 
              style={{ transform: `translate3d(${mousePos.x * -45}px, ${mousePos.y * 55}px, 50px)` }}
              className="absolute -bottom-8 left-[30%] p-3.5 px-5 rounded-2xl bg-gradient-to-r from-teal-500/15 via-[#0c0d16] to-[#7c6bef]/15 border border-[#0bb6ae]/40 backdrop-blur-xl shadow-[0_12px_30px_rgba(11,182,174,0.18)] flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-lg bg-[#0bb6ae]/20 flex items-center justify-center text-teal-200">
                <Flame size={14} className="animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-[#00f0e6] font-bold uppercase tracking-wider">SPEED UPGRADE</p>
                <p className="text-xs font-black text-slate-100">3.8X Cognitive Velocity Sync</p>
              </div>
            </motion.div>
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
              We connected this sandbox directly to StudyAI Pro custom serverless API built by Honourable Master Arhan. Customize your exam prep output and trigger a response instantly. Experience the lightning-fast speed and pedagogical clarity.
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
              <span className="text-xs font-mono font-bold text-indigo-400">StudyAI-Pro-Scribe-Core-API-v4 (Built specially by Honourable Master Arhan)</span>
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
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center space-y-4 mb-20">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-[#7c6bef] font-mono text-sm font-extrabold tracking-widest uppercase block animate-pulse">
            <InteractiveText text="The Operating System Blueprint" />
          </span>
          <h3 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white leading-tight drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)]">
            <InteractiveText text="Designed to Hook Your Brain" className="text-white" /> <br />
            <InteractiveText text="On Academic Growth" className="bg-gradient-to-r from-indigo-400 to-[#7c6bef] bg-clip-text text-transparent" />
          </h3>
          <p className="text-slate-100 text-sm md:text-base font-semibold max-w-2xl mx-auto font-sans leading-relaxed tracking-wide drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">
            We combined <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-300 font-extrabold">gaming heuristics</span> with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400 font-extrabold">advanced pedagogical neuroscience</span> to turn study sessions into highly addictive leveling systems.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 rounded-3xl p-8 bg-gradient-to-br from-indigo-950/40 via-white/[0.03] to-transparent border border-white/15 flex flex-col justify-between space-y-8 relative overflow-hidden min-h-[320px] shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/[0.05] rounded-full blur-3xl pointer-events-none transition-opacity duration-300 group-hover:opacity-100"></div>
            <div>
              <div className="w-12 h-12 bg-indigo-500/15 rounded-xl border border-indigo-500/30 flex items-center justify-center text-indigo-300 mb-6 group-hover:scale-110 transition-transform">
                <Flame size={20} className="animate-pulse" />
              </div>
              <h4 className="text-xl font-extrabold text-white font-display tracking-tight">Spaced Repetition & Streak Engine</h4>
              <p className="text-slate-200 text-xs mt-2.5 max-w-xl leading-relaxed font-medium">
                Maintains a rolling active calendar, tracking daily study sessions. Daily reminders prompt focus blocks, keeping your momentum chain unbreakable.
              </p>
            </div>
            
            {/* Gamified Streak Mock Grid */}
            <div className="flex gap-2.5 p-4 bg-black/60 border border-white/10 rounded-2xl w-fit shadow-inner">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase mb-2 font-bold">{day}</span>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm border transition-all ${
                    idx < 5 
                      ? "bg-indigo-500/25 border-indigo-400 text-indigo-300 shadow-[0_0_15px_rgba(124,107,239,0.45)] font-bold scale-[1.05]"
                      : "bg-white/[0.04] border-white/5 text-slate-500 font-semibold"
                  }`}>
                    {idx < 5 ? "🔥" : "💤"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl p-8 bg-gradient-to-b from-purple-950/40 via-white/[0.03] to-transparent border border-white/15 flex flex-col justify-between space-y-8 min-h-[320px] shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:border-purple-500/40 hover:bg-white/[0.04] transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 bg-purple-500/15 rounded-xl border border-purple-500/30 flex items-center justify-center text-purple-300 mb-6 group-hover:scale-110 transition-transform">
                <Award size={20} className="animate-pulse" />
              </div>
              <h4 className="text-xl font-extrabold text-white font-display tracking-tight">Topper Leaderboard challenges</h4>
              <p className="text-slate-200 text-xs mt-2.5 leading-relaxed font-medium">
                Compete asynchronously or form squad goal partnerships with elite aspirants on NEET-UG, JEE, and UPSC study tracks.
              </p>
            </div>

            <div className="space-y-3 bg-black/60 p-4 rounded-2xl border border-white/10 shadow-[inner_0_1px_10px_rgba(255,255,255,0.05)]">
              <div className="flex items-center justify-between text-xs font-mono border-b border-white/5 pb-2">
                <span className="text-[#0bb6ae] font-bold">1. Dr. Ritika (NEET)</span>
                <span className="font-extrabold text-[#0bb6ae] drop-shadow-[0_0_4px_rgba(11,182,174,0.4)]">4,820 XP</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono border-b border-white/5 pb-2">
                <span className="text-slate-100 font-bold">2. Aarav S. (JEE)</span>
                <span className="font-extrabold text-white">4,110 XP</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-indigo-200 bg-indigo-500/20 px-2.5 py-1.5 rounded-lg border border-indigo-500/35 shadow-[0_0_10px_rgba(124,107,239,0.2)]">
                <span className="font-bold">⚡ YOU (Challenger)</span>
                <span className="font-extrabold text-indigo-100">+250 XP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YC Student Testimonials */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center space-y-4 mb-20">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0bb6ae] to-indigo-400 font-mono text-sm font-extrabold tracking-widest uppercase block animate-pulse">Topper Success Stories</span>
          <h3 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white leading-tight drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)]">
            <InteractiveText text="Endorsed by India's" className="text-white" /> <br />
            <InteractiveText text="Top Board Rankers" className="bg-gradient-to-r from-[#0bb6ae] to-indigo-500 bg-clip-text text-transparent" />
          </h3>
          <p className="text-slate-200 text-sm md:text-base font-semibold max-w-2xl mx-auto font-sans leading-relaxed tracking-wide drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">
            Hear from students who crushed their Board exams, JEE Mains, and competitive timelines with zero stress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              quote: "Having the secure StudyAI Pro API custom-made by Honourable Master Arhan live on our private server meant I could study at 3 AM with instant lag-free guidance and pristine syllabus compliance.",
              author: "Advait Sen",
              sub: "UPSC Civils Finalist",
              logo: "🏛️"
            }
          ].map((t, idx) => (
            <div key={idx} className="bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 p-8 rounded-2xl relative space-y-6 hover:border-indigo-500/40 hover:bg-indigo-950/20 transition-all duration-300 shadow-lg group">
              <span className="text-5xl text-indigo-500/30 font-serif absolute -top-1 left-4 transition-transform duration-300 group-hover:scale-110">“</span>
              <p className="text-slate-100 text-[13px] font-sans font-medium leading-relaxed italic z-10 relative pt-3">
                {t.quote}
              </p>
              <div className="flex items-center gap-3 pt-5 border-t border-white/10">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">{t.logo}</div>
                <div>
                  <h5 className="text-xs font-bold text-white tracking-wide">{t.author}</h5>
                  <p className="text-[10px] text-indigo-300 font-mono font-medium mt-0.5">{t.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Elite SaaS Pricing Grids (Vercel Style) */}
      <section className="py-24 px-6 max-w-5xl mx-auto border-t border-white/10">
        
        {/* Divine Dopamine Hook Banner Above Pricing */}
        <div className="mb-16 p-6 rounded-2xl bg-gradient-to-r from-teal-500/15 via-indigo-950/30 to-[#7c6bef]/15 border border-[#0bb6ae]/45 max-w-2xl mx-auto text-center space-y-3.5 shadow-[0_0_25px_rgba(11,182,174,0.22)] animate-[bounce_2.5s_infinite_alternate_relative]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0bb6ae]/25 text-[#00f0e6] font-mono text-[10px] font-extrabold tracking-wider border border-[#0bb6ae]/30 shadow-[0_0_10px_rgba(0,240,230,0.15)]">
            ⚡ EXTREME COGNITIVE ADVANTAGE UNLOCKED
          </div>
          <p className="text-xs md:text-sm font-mono font-bold text-slate-100">
            Current Board Track multiplier: <span className="text-[#0ff0e6] font-black animate-pulse drop-shadow-[0_0_8px_rgba(0,240,230,0.6)]">3.8X Speed Upgrade Enabled</span> 🚀
          </p>
          <div className="w-full bg-slate-900/90 border border-white/5 rounded-full h-2.5 overflow-hidden p-[2px]">
            <div className="bg-gradient-to-r from-[#0bb6ae] via-[#7c6bef] to-pink-500 h-1.5 rounded-full w-[94%] animate-[shimmer_2s_infinite_linear]"></div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-300 px-1 font-bold">
            <span>Syllabus Gladiator Rank</span>
            <span className="text-pink-400 font-extrabold drop-shadow-[0_0_6px_rgba(244,114,182,0.4)]">94% Core Match To State Rank #1</span>
          </div>
        </div>

        <div className="text-center space-y-4 mb-20 relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500/15 to-indigo-500/15 border border-[#0bb6ae]/40 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0bb6ae] animate-ping"></span>
            <span className="text-[10px] font-mono font-black text-teal-300 tracking-wider uppercase">✨ SYSTEM SYNCED: +450% COGNITIVE COMPLIANCE ONLINE</span>
          </div>

          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-400 font-mono text-xs font-bold tracking-widest uppercase block pt-4">Affordable Elite Access</span>
          <h3 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
            Syllabus Pass Pricing
          </h3>
          <p className="text-slate-200 text-sm md:text-base font-semibold max-w-xl mx-auto leading-relaxed font-sans">
            Get god-tier study tools. Host with your own API or utilize our secure Vercel cloud service directly.
          </p>
          <div className="pt-2 text-xs text-indigo-200 font-bold font-mono tracking-wide">
            🏆 99.4% of Toppers report saving 15+ hours a week. Lifetime dominance begins here.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                "Honourable Master Arhan Scribe Extreme Custom Model API",
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
              className={`rounded-2xl p-7 flex flex-col justify-between border transition-all duration-300 shadow-2xl ${
                plan.popular 
                  ? "bg-gradient-to-b from-indigo-950/60 via-[#05060b] to-black border-indigo-500 shadow-[0_8px_35px_rgba(124,107,239,0.22)] scale-105 z-10" 
                  : "bg-gradient-to-b from-slate-900/50 via-[#0a0b12]/40 to-[#030306] border-white/15 hover:border-indigo-500/30 hover:scale-[1.01]"
              }`}
            >
              <div className="space-y-5">
                <div className="flex justify-between items-baseline">
                  <h4 className={`text-2xl uppercase tracking-wider font-mono font-extrabold ${plan.popular ? "text-indigo-400" : "text-teal-400"}`}>{plan.title}</h4>
                  {plan.popular && (
                    <span className="text-[9px] bg-[#0bb6ae]/25 text-[#00f0e6] font-bold px-2 py-0.5 rounded border border-[#0bb6ae]/30 font-mono tracking-widest shadow-[0_0_10px_rgba(0,240,230,0.2)]">POPULAR</span>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-3xl font-black font-display text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">{plan.price}</span>
                  <p className="text-[10px] text-slate-300 font-bold tracking-wide font-mono uppercase">Includes local telemetry state integration</p>
                </div>
                <ul className="space-y-3 pt-5 border-t border-white/5">
                  {plan.features.map((f, fIdx) => (
                    <li key={fIdx} className="text-xs text-slate-100 font-semibold flex items-center gap-2 font-sans tracking-wide">
                      <CheckCircle size={14} className={plan.popular ? "text-[#0bb6ae]" : "text-indigo-400"} />
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
                className={`mt-8 w-full py-3.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  plan.popular 
                    ? "bg-gradient-to-r from-indigo-500 to-[#7c6bef] hover:from-indigo-600 hover:to-[#6c58dc] text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/20" 
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-[#0bb6ae]/40"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Dynamic Dopamine Achievement Reward Banner */}
        <div className="mt-16 p-7 rounded-2xl bg-gradient-to-r from-pink-500/15 via-indigo-950/30 to-teal-500/15 border border-[#7c6bef]/35 flex flex-col md:flex-row md:items-center justify-between gap-5 max-w-4xl mx-auto shadow-[0_12px_35px_rgba(244,114,182,0.15)]">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-pink-400 font-extrabold tracking-widest uppercase block drop-shadow-[0_0_5px_rgba(244,114,182,0.3)]">🎁 INSTANT ACCESS REWARD DETECTED</span>
            <h5 className="text-base font-bold text-white font-sans tracking-tight">Claim +250 XP Launch Powerups and Feynman VIP Token</h5>
            <p className="text-xs text-slate-200 font-medium font-sans max-w-xl leading-relaxed">
              By launching StudyAI Pro today, Honourable Master Arhan's master coordinator instantly pre-authorizes your local secure sandboxed context for higher generative response limits. Start studying immediately for Indian Boards with pure leverage.
            </p>
          </div>
          <button 
            onClick={() => {
              onPlaySound();
              setShowOnboarding(true);
            }}
            data-cursor="magnetic"
            data-cursor-label="BOOST_XP"
            className="px-6 py-3 bg-gradient-to-r from-[#0bb6ae] to-indigo-600 hover:from-[#11cbd2] hover:to-indigo-700 text-white font-mono text-[11px] font-extrabold tracking-wider rounded-xl uppercase self-start md:self-auto shadow-md shadow-indigo-500/25 hover:scale-[1.03] transition-all cursor-pointer"
          >
            Claim Synergy Boost 🔥
          </button>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-24 px-6 max-w-4xl mx-auto border-t border-white/10">
        <h4 className="text-2xl md:text-3xl font-extrabold text-center text-white mb-12 font-display tracking-tight drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]">
          <InteractiveText text="Frequently Asked Questions" />
        </h4>
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className={`border rounded-2xl overflow-hidden transition-all duration-300 group shadow-lg ${
                  isOpen 
                    ? "bg-gradient-to-b from-[#0e0c24] via-[#080814] to-[#04040a] border-[#00f0e6]/50 shadow-[0_12px_40px_rgba(0,240,230,0.12)] scale-[1.01]" 
                    : "bg-gradient-to-r from-white/[0.03] to-transparent border-white/10 hover:border-[#0bb6ae]/45 hover:bg-[#0c0c16]/70"
                }`}
              >
                <button 
                  onClick={() => {
                    onPlaySound();
                    const nextOpenState = !isOpen;
                    setActiveFaq(nextOpenState ? idx : null);
                    if (nextOpenState) {
                      trackEvent("faq_expanded", {
                        faq_question: faq.q
                      });
                    }
                  }}
                  className="w-full p-6 flex items-center justify-between text-left cursor-pointer focus:outline-none select-none"
                >
                  <span className={`text-[13px] md:text-sm font-bold font-sans transition-colors duration-300 ${isOpen ? "text-[#00f0e6] font-extrabold" : "text-white group-hover:text-[#00f0e6]"}`}>
                    {faq.q}
                  </span>
                  <span className={`text-base font-extrabold font-mono ml-4 transition-all duration-300 flex items-center justify-center w-7 h-7 rounded-full ${isOpen ? "text-[#00f0e6] bg-[#00f0e6]/10 rotate-90 scale-110" : "text-slate-400 bg-white/5 group-hover:text-[#0bb6ae] group-hover:bg-[#0bb6ae]/10"}`}>
                    {isOpen ? "−" : "＋"}
                  </span>
                </button>
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen 
                      ? "grid-rows-[1fr] opacity-100 border-t border-white/10 bg-[#050510]/80" 
                      : "grid-rows-[0fr] opacity-0 bg-transparent pointer-events-none"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-6 text-xs sm:text-[13.5px] text-slate-100 font-semibold leading-relaxed font-sans relative pl-8 select-text">
                      <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-[#00f0e6] to-indigo-500 rounded-l" />
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="border-t border-white/10 bg-gradient-to-t from-[rgba(10,10,15,0.95)] via-[#030305] to-[#040407] py-16 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-[#7c6bef] flex items-center justify-center text-white shadow-[0_4px_15px_rgba(124,107,239,0.3)]">
                <Sparkle size={16} />
              </div>
              <span className="text-base font-extrabold text-white font-display tracking-tight">StudyAI Pro</span>
            </div>
            <p className="text-[12px] text-slate-300 font-sans font-medium leading-relaxed">
              Billion-dollar study operating system. Created and owned by Honourable Master Arhan. Designed with real-time cognitive tracking & Syllabus alignment guides.
            </p>
          </div>
          <div>
            <h5 className="text-[11px] md:text-xs uppercase font-extrabold text-[#00f0e6] font-mono tracking-widest mb-4 drop-shadow-[0_0_6px_rgba(0,240,230,0.3)]">Academic Curriculy</h5>
            <ul className="space-y-2 text-xs text-slate-200 font-sans font-medium">
              <li className="hover:text-[#00f0e6] cursor-pointer transition-colors duration-200">CBSE / ICSE Board Prep</li>
              <li className="hover:text-[#00f0e6] cursor-pointer transition-colors duration-200">IIT-JEE Exam Crack Track</li>
              <li className="hover:text-[#00f0e6] cursor-pointer transition-colors duration-200">NEET-UG Mock Simulators</li>
              <li className="hover:text-[#00f0e6] cursor-pointer transition-colors duration-200">UPSC CSAT Analysis</li>
            </ul>
          </div>
          <div>
            <h5 className="text-[11px] md:text-xs uppercase font-extrabold text-[#00f0e6] font-mono tracking-widest mb-4 drop-shadow-[0_0_6px_rgba(0,240,230,0.3)]">Security & Edge</h5>
            <ul className="space-y-2 text-xs text-slate-200 font-sans font-medium">
              <li className="hover:text-[#00f0e6] cursor-pointer transition-colors duration-200">Vercel Proxied API</li>
              <li className="hover:text-[#00f0e6] cursor-pointer transition-colors duration-200">Secure SSL Tunnel</li>
              <li className="hover:text-[#00f0e6] cursor-pointer transition-colors duration-200">Zero Key Storage Cache</li>
              <li className="hover:text-[#00f0e6] cursor-pointer transition-colors duration-200">Privacy Protected</li>
            </ul>
          </div>
          <div>
            <h5 className="text-[11px] md:text-xs uppercase font-extrabold text-[#00f0e6] font-mono tracking-widest mb-4 drop-shadow-[0_0_6px_rgba(0,240,230,0.3)]">Community Hub</h5>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3 shadow-inner">
              <p className="text-xs text-slate-300 font-sans font-semibold">Join the study squad.</p>
              <button 
                onClick={() => {
                  onPlaySound();
                  setShowOnboarding(true);
                }}
                className="w-full py-2 bg-gradient-to-r from-indigo-500 to-[#7c6bef] hover:from-indigo-600 hover:to-[#6c58dc] rounded-xl text-[10px] font-mono text-white text-center font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] transition-transform"
              >
                Sign Up Now
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center border-t border-white/10 mt-12 pt-8 space-y-2">
          <p className="text-xs text-slate-400 font-sans tracking-wide">
            &copy; 2026 StudyAI Pro Inc. Platform curated with deep design engineering for CBSE, ICSE, JEE, and NEET-UG aspirants built with Love and HardWork.
          </p>
          <p className="text-xs font-mono font-semibold">
            Engineered & Directed by <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-[#7c6bef] to-pink-500 font-extrabold drop-shadow-[0_0_10px_rgba(124,107,239,0.3)]">Honourable Master Arhan (Honourable Master Arhan is the Owner and Programmer)</span>
          </p>
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

// ex-Vercel / ex-Apple Cinematic Background Space Particle Scribe filaments
function SpaceParticlesCanvas() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize, { passive: true });
    
    // Core mouse position interpolation
    const mouse = { 
      x: width / 2, 
      y: height / 2, 
      targetX: width / 2, 
      targetY: height / 2, 
      isHovering: false,
      pressure: 0
    };
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovering = true;
    };
    
    // Shockwave ripple pool on clicks
    interface Shockwave {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
      speed: number;
    }
    const shockwaves: Shockwave[] = [];
    const handleGlobalMouseDown = (e: MouseEvent) => {
      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: isMobile ? 120 : 260,
        alpha: 0.5,
        speed: 4.5
      });
      mouse.pressure = 1.0;
    };

    const handleGlobalMouseUp = () => {
      mouse.pressure = 0.0;
    };
    
    window.addEventListener("mousemove", handleGlobalMouseMove, { passive: true });
    window.addEventListener("mousedown", handleGlobalMouseDown, { passive: true });
    window.addEventListener("mouseup", handleGlobalMouseUp, { passive: true });
    
    // Low footprint star model with multi-depth physical layers
    class Star {
      x: number;
      y: number;
      size: number;
      baseSize: number;
      vx: number;
      vy: number;
      alpha: number;
      baseAlpha: number;
      fadeSpeed: number;
      color: string;
      depthPlane: number; // 1 = Deep, 2 = Medium, 3 = Foreground Interactive
      offsetX: number = 0;
      offsetY: number = 0;
      
      constructor() {
        const r = Math.random();
        if (r < 0.55 || isMobile) {
          // Plane 1 - Deep Background (tiny, slow, static)
          this.depthPlane = 1;
          this.size = Math.random() * 0.6 + 0.3;
          this.vx = (Math.random() - 0.5) * 0.03;
          this.vy = -(Math.random() * 0.04 + 0.01);
          this.baseAlpha = Math.random() * 0.22 + 0.08;
          this.color = "rgba(147, 197, 253, 0.35)"; // soft blue
        } else if (r < 0.85) {
          // Plane 2 - Midground
          this.depthPlane = 2;
          this.size = Math.random() * 0.9 + 0.6;
          this.vx = (Math.random() - 0.5) * 0.12;
          this.vy = -(Math.random() * 0.12 + 0.03);
          this.baseAlpha = Math.random() * 0.4 + 0.15;
          this.color = Math.random() > 0.5 ? "rgba(124, 107, 239, 0.45)" : "rgba(244, 114, 182, 0.35)"; // indigo/pink
        } else {
          // Plane 3 - Foreground Interactive (responds aggressively, glows)
          this.depthPlane = 3;
          this.size = Math.random() * 1.5 + 1.2;
          this.vx = (Math.random() - 0.5) * 0.2;
          this.vy = -(Math.random() * 0.18 + 0.06);
          this.baseAlpha = Math.random() * 0.6 + 0.25;
          this.color = Math.random() > 0.45 ? "rgba(0, 240, 230, 0.7)" : "rgba(255, 255, 255, 0.8)"; // neon cyan/pure white
        }
        
        this.baseSize = this.size;
        this.alpha = this.baseAlpha;
        this.fadeSpeed = Math.random() * 0.004 + 0.001;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Gentle spring-damped physics offset recovery
        this.offsetX += (0 - this.offsetX) * 0.08;
        this.offsetY += (0 - this.offsetY) * 0.08;
        
        // Responsive cursor physical repulsion
        if (mouse.isHovering && !isMobile) {
          const dx = (this.x + this.offsetX) - mouse.x;
          const dy = (this.y + this.offsetY) - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repelRadius = this.depthPlane === 3 ? 240 : 120;
          
          if (dist < repelRadius && dist > 2) {
            const force = (repelRadius - dist) / repelRadius;
            const pushMagnitude = this.depthPlane === 3 ? 24 : 8;
            this.offsetX += (dx / dist) * force * pushMagnitude - this.offsetX * 0.15;
            this.offsetY += (dy / dist) * force * pushMagnitude - this.offsetY * 0.15;
          }
        }
        
        // Dynamic Loop Bounds check
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
        if (this.y < -10) {
          this.y = height + 10;
          this.x = Math.random() * width;
        }
        
        // Organic star shimmer pulsation
        this.alpha += this.fadeSpeed;
        if (this.alpha > this.baseAlpha + 0.22 || this.alpha < this.baseAlpha - 0.22 || this.alpha > 0.95 || this.alpha < 0.04) {
          this.fadeSpeed = -this.fadeSpeed;
        }
      }
      
      draw(c: CanvasRenderingContext2D) {
        c.save();
        const renderX = this.x + this.offsetX;
        const renderY = this.y + this.offsetY;
        
        c.globalAlpha = Math.max(0.02, Math.min(1, this.alpha));
        if (this.depthPlane === 3 && !isMobile) {
          c.shadowBlur = 8;
          c.shadowColor = this.color;
        }
        
        c.beginPath();
        c.arc(renderX, renderY, this.size, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
      }
    }
    
    // Scale particle count perfectly for pristine mobile frame performance
    const count = isMobile ? 22 : 55;
    const starsList: Star[] = Array.from({ length: count }).map(() => new Star());
    
    // Core Background Nebulas
    interface Nebula {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      radius: number;
      baseRadius: number;
      color: string;
      speed: number;
      angle: number;
    }
    
    const nebulas: Nebula[] = [
      {
        x: width * 0.25,
        y: height * 0.25,
        targetX: width * 0.25,
        targetY: height * 0.25,
        radius: isMobile ? 280 : 500,
        baseRadius: isMobile ? 280 : 500,
        color: "rgba(74, 16, 138, 0.15)", // Midnight Violet
        speed: 0.16,
        angle: 0
      },
      {
        x: width * 0.75,
        y: height * 0.35,
        targetX: width * 0.75,
        targetY: height * 0.35,
        radius: isMobile ? 320 : 600,
        baseRadius: isMobile ? 320 : 600,
        color: "rgba(13, 27, 74, 0.18)", // Electric Cobalt
        speed: 0.1,
        angle: Math.PI / 3
      },
      {
        x: width * 0.5,
        y: height * 0.75,
        targetX: width * 0.5,
        targetY: height * 0.75,
        radius: isMobile ? 360 : 700,
        baseRadius: isMobile ? 360 : 700,
        color: "rgba(10, 10, 32, 0.25)", // Deep Indigo
        speed: 0.06,
        angle: Math.PI / 1.5
      },
      {
        x: width * 0.8,
        y: height * 0.2,
        targetX: width * 0.8,
        targetY: height * 0.2,
        radius: isMobile ? 220 : 400,
        baseRadius: isMobile ? 220 : 400,
        color: "rgba(3, 37, 42, 0.13)", // Muted Cyan
        speed: 0.2,
        angle: Math.PI * 1.8
      }
    ];

    let time = 0;
    
    const render = () => {
      time++;
      // Clear with dark baseplate
      ctx.fillStyle = "#030307";
      ctx.fillRect(0, 0, width, height);
      
      // Interpolate mouse coordinates (Spring tracking)
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
      
      // 1. Draw Drifting Ambient Nebulas
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < nebulas.length; i++) {
        const n = nebulas[i];
        n.angle += 0.0006 * n.speed;
        n.x = n.targetX + Math.cos(n.angle) * 110;
        n.y = n.targetY + Math.sin(n.angle) * 75;
        n.radius = n.baseRadius + Math.sin(time * 0.0005 + i) * 35;
        
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
        grad.addColorStop(0, n.color);
        grad.addColorStop(0.4, n.color.replace("0.1", "0.04").replace("0.2", "0.08"));
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      
      // 2. Draw Soft Cursor-Follower Radiant Spotlight Aura
      if (mouse.isHovering && !isMobile) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const auraRadius = 450 + mouse.pressure * 80;
        const spotlight = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, auraRadius);
        
        spotlight.addColorStop(0, "rgba(0, 240, 230, 0.065)"); // Soft Cyan
        spotlight.addColorStop(0.35, "rgba(124, 107, 239, 0.04)"); // Soft Indigo
        spotlight.addColorStop(1, "rgba(0, 0, 0, 0)");
        
        ctx.fillStyle = spotlight;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, auraRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      // 3. Draw Cybernetic Neural Network Connections in Plane 3
      if (!isMobile) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        for (let i = 0; i < starsList.length; i++) {
          const sA = starsList[i];
          if (sA.depthPlane !== 3) continue;
          
          const sAX = sA.x + sA.offsetX;
          const sAY = sA.y + sA.offsetY;
          
          // Draw linking network lines from cursor
          if (mouse.isHovering) {
            const mDX = sAX - mouse.x;
            const mDY = sAY - mouse.y;
            const mDist = Math.sqrt(mDX * mDX + mDY * mDY);
            const cursorNetworkRadius = 260;
            
            if (mDist < cursorNetworkRadius) {
              const alpha = (1 - mDist / cursorNetworkRadius) * 0.16;
              ctx.strokeStyle = `rgba(0, 240, 230, ${alpha})`;
              ctx.lineWidth = 0.6;
              ctx.beginPath();
              ctx.moveTo(mouse.x, mouse.y);
              ctx.lineTo(sAX, sAY);
              ctx.stroke();
            }
          }
          
          // Draw connecting links between stars in close proximity
          for (let j = i + 1; j < starsList.length; j++) {
            const sB = starsList[j];
            if (sB.depthPlane !== 3) continue;
            
            const sBX = sB.x + sB.offsetX;
            const sBY = sB.y + sB.offsetY;
            
            const dX = sAX - sBX;
            const dY = sAY - sBY;
            const dSquare = dX * dX + dY * dY;
            const connectionThreshold = 180;
            
            if (dSquare < connectionThreshold * connectionThreshold) {
              const dist = Math.sqrt(dSquare);
              const alpha = (1 - dist / connectionThreshold) * 0.08 * sA.alpha;
              ctx.strokeStyle = `rgba(124, 107, 239, ${alpha})`;
              ctx.lineWidth = 0.55;
              ctx.beginPath();
              ctx.moveTo(sAX, sAY);
              ctx.lineTo(sBX, sBY);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }
      
      // 4. Update and Draw Stars
      for (const s of starsList) {
        s.update();
        s.draw(ctx);
      }
      
      // 5. Update and Draw Click Shockwave Ripples
      if (shockwaves.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        for (let i = shockwaves.length - 1; i >= 0; i--) {
          const w = shockwaves[i];
          w.radius += w.speed;
          w.alpha = (1 - w.radius / w.maxRadius) * 0.5;
          ctx.strokeStyle = `rgba(0, 240, 230, ${w.alpha})`;
          ctx.shadowBlur = 15;
          ctx.shadowColor = "rgba(0, 240, 230, 0.6)";
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
          ctx.stroke();
          
          if (w.radius >= w.maxRadius) {
            shockwaves.splice(i, 1);
          }
        }
        ctx.restore();
      }
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mousedown", handleGlobalMouseDown);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]" 
      style={{ mixBlendMode: "screen", opacity: 0.95 }}
    />
  );
}

// Interactive Magnetic Wrapper for high-end SaaS feel
function MagneticContainer({ children, className = "", strength = 0.35 }: { children: React.ReactNode; className?: string; strength?: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const x = (clientX - centerX) * strength;
    const y = (clientY - centerY) * strength;
    setOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 220, damping: 20, mass: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface CinematicTitleProps {
  text: string;
  className?: string;
  gradient?: string;
  glowColor?: string;
  delayOffset?: number;
  customStyle?: React.CSSProperties;
}

// Splits titles into characters and words for smooth staggered reveals & kinetic hover
function CinematicTitle({ 
  text, 
  className = "", 
  gradient, 
  glowColor = "rgba(124, 107, 239, 0.45)", 
  delayOffset = 0,
  customStyle
}: CinematicTitleProps) {
  const words = text.split(" ");
  return (
    <h3 className={`font-display inline-block ${className}`} style={{ transformStyle: "preserve-3d" }}>
      {words.map((word, wordIdx) => {
        const characters = Array.from(word);
        return (
          <span key={wordIdx} className="inline-block whitespace-nowrap mx-[0.05em] pointer-events-auto" style={{ transformStyle: "preserve-3d" }}>
            {characters.map((char, charIdx) => {
              const charGradientStyle = gradient 
                ? `bg-gradient-to-r ${gradient} bg-clip-text text-transparent` 
                : customStyle 
                  ? "" 
                  : "text-white";

              return (
                <motion.span
                  key={charIdx}
                  className={`inline-block origin-bottom will-change-transform font-display select-none cursor-default ${charGradientStyle}`}
                  style={customStyle}
                  initial={{ opacity: 0, y: 35, rotateX: 25, filter: "blur(8px)", scale: 0.88 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)", scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 110,
                    damping: 14,
                    delay: delayOffset + (wordIdx * 0.08) + (charIdx * 0.012)
                  }}
                  whileHover={{
                    y: -12,
                    scale: 1.18,
                    rotate: charIdx % 2 === 0 ? 6 : -6,
                    filter: `drop-shadow(0 0 10px ${glowColor}) drop-shadow(0 0 20px ${glowColor})`,
                    transition: { type: "spring", stiffness: 450, damping: 11 }
                  }}
                >
                  {char}
                </motion.span>
              );
            })}
            <span className="inline-block">&nbsp;</span>
          </span>
        );
      })}
    </h3>
  );
}
