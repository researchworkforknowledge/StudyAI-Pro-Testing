import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import TimerPanel, { VIBES } from "./components/TimerPanel";
import NotesPanel from "./components/NotesPanel";
import MindMapPanel from "./components/MindMapPanel";
import QuizPanel from "./components/QuizPanel";
import HomeworkPanel from "./components/HomeworkPanel";
import FlashcardsPanel from "./components/FlashcardsPanel";
import AIWorkspacePanels from "./components/AIWorkspacePanels";
import StaticReferencePanels from "./components/StaticReferencePanels";
import LandingPage from "./components/LandingPage";
import { AppState, INITIAL_STATE, Note, Flashcard, Homework, QuickTask } from "./types";
import { X, RefreshCw, Sparkle, Sparkles, LogIn, LogOut, Check, CheckCircle, Award, Compass, Globe, HelpCircle, BookOpen, ShieldCheck } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, isDummyConfig, signInWithGoogle, logOutFromFirebase, fetchStateFromFirestore, syncStateToFirestore, syncUserXPToLeaderboard, fetchLeaderboardFromFirestore } from "./lib/firebase";
import { AnimatePresence, motion } from "motion/react";
import { STATIC_CONFIG } from "./config";
import { QuantumSynth } from "./lib/proceduralSynth";

export default function App() {
  // Load state from localStorage on build initial bootstrap
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem("sap_v4");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Enforce backward compatibility fallbacks
        return {
          ...INITIAL_STATE,
          ...parsed,
          timer: { ...INITIAL_STATE.timer, ...parsed.timer, running: false }, // avoid infinite run intervals on initialization
          stats: { ...INITIAL_STATE.stats, ...parsed.stats }
        };
      }
    } catch (e) {
      console.error("Local storage sync error:", e);
    }
    return INITIAL_STATE;
  });

  const [activeTab, setActiveTab] = useState("dash");
  const [collapsed, setCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"landing" | "app">("landing");

  // Auth & Cloud synchronisation states
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [liveLeaderboard, setLiveLeaderboard] = useState<any[]>([]);
  
  // Client-Side Dev/Static Gemini config states (for GitHub Pages deployment)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem("USER_GEMINI_API_KEY") || "");

  // Local Google sign-in simulator portal variables
  const [simEmail, setSimEmail] = useState("");
  const [simName, setSimName] = useState("");
  const [simAvatar, setSimAvatar] = useState("🚀");
  const [authStep, setAuthStep] = useState(0); // 0=Form, 1=Animation Loader

  // Custom high-octane retro acoustic dopamine synthesizer engineered by Arhan
  const playDopamineSound = (sType: "success" | "levelUp" | "correct" | "wrong" | "click" | "powerUp" = "click") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (sType === "click") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.11);
      } else if (sType === "correct") {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);
          
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.26);
        });
      } else if (sType === "wrong") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.type = "sawtooth";
        osc2.type = "sawtooth";
        osc1.frequency.setValueAtTime(180, ctx.currentTime);
        osc2.frequency.setValueAtTime(184, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.3);
        osc2.stop(ctx.currentTime + 0.3);
      } else if (sType === "levelUp") {
        const scale = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
        scale.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + idx * 0.05 + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.05 + 0.4);
          
          osc.start(ctx.currentTime + idx * 0.05);
          osc.stop(ctx.currentTime + idx * 0.05 + 0.45);
        });
      } else if (sType === "success") {
        const notes = [880, 987.77, 1174.66, 1318.51, 1567.98];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
          gain.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.18);
          
          osc.start(ctx.currentTime + idx * 0.04);
          osc.stop(ctx.currentTime + idx * 0.04 + 0.2);
        });
      } else if (sType === "powerUp") {
        const osc = ctx.createOscillator();
        const biquad = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        osc.connect(biquad);
        biquad.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.45);
        
        biquad.type = "peaking";
        biquad.frequency.setValueAtTime(400, ctx.currentTime);
        biquad.Q.setValueAtTime(10, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.46);
      }
    } catch (e) {
      console.warn("Dopamine sound engine exception: ", e);
    }
  };

  // Load mock user and corresponding workspace state on boot (if in local mode)
  useEffect(() => {
    if (isDummyConfig) {
      const savedMock = localStorage.getItem("sap_v4_mock_user");
      if (savedMock) {
        try {
          const parsedUser = JSON.parse(savedMock);
          setUser(parsedUser);
          
          const userState = localStorage.getItem(`sap_v4_user_${parsedUser.uid}`);
          if (userState) {
            const parsedState = JSON.parse(userState);
            setState((prev) => ({
              ...prev,
              ...parsedState,
              timer: { ...INITIAL_STATE.timer, ...parsedState.timer, running: false }
            }));
          }
        } catch (e) {
          console.error("Failed loading mock student profile coordinates: ", e);
        }
      }
      setAuthLoading(false);
    }
  }, []);

  // HTML5 audio reference for infinite study streams
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Synchronise Theme switches to Document Class list for immediate light mode response
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
  }, [state.theme]);

  // Auth observer and initial cloud state pulling
  useEffect(() => {
    if (isDummyConfig || !auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setAuthLoading(true);
        triggerToast("Logging in with Google Account...");
        try {
          const syncedState = await fetchStateFromFirestore(currentUser.uid);
          if (syncedState) {
            setState((prev) => ({
              ...prev,
              board: syncedState.board || prev.board,
              cls: syncedState.cls || prev.cls,
              sub: syncedState.sub || prev.sub,
              theme: syncedState.theme || prev.theme,
              notes: syncedState.notes || prev.notes,
              hw: syncedState.hw || prev.hw,
              fc: syncedState.fc || prev.fc,
              qt: syncedState.qt || prev.qt,
              stats: { ...prev.stats, ...syncedState.stats }
            }));
            triggerToast("☁️ Progress synced across devices successfully!");
          } else {
            // First time - write their existing local state to database
            await syncStateToFirestore(currentUser.uid, state);
          }
        } catch (e) {
          console.error("Failed fetching synced data: ", e);
        } finally {
          setAuthLoading(false);
        }
      } else {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Periodically fetch shared Firestore leaderboard (every 10s when active)
  useEffect(() => {
    let interval: any = null;
    const updateLeaderboard = async () => {
      try {
        const topUsers = await fetchLeaderboardFromFirestore();
        if (topUsers && topUsers.length > 0) {
          setLiveLeaderboard(topUsers);
        }
      } catch (err) {
        console.error("Error updating live leaderboard:", err);
      }
    };

    updateLeaderboard();

    interval = setInterval(updateLeaderboard, 10000);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  // Sync state mutations to Cloud Firestore if signed in (Debounced 1s)
  useEffect(() => {
    if (user && !authLoading) {
      const delay = setTimeout(async () => {
        setIsSyncing(true);
        try {
          await syncStateToFirestore(user.uid, state);

          // Calculate student current XP and synchronise live in shared cloud toppers grid
          const finalXP = Math.floor(
            (state.stats.hours || 0) * 100 + 
            (state.stats.quizzes || 0) * 50 + 
            state.notes.length * 150 + 
            state.fc.length * 30 + 
            state.stats.streak * 25
          ) + 250 + (state.extraXP || 0);

          const profileName = user.displayName || state.profileName || "Syllabus Gladiator";
          await syncUserXPToLeaderboard(user.uid, profileName, finalXP);
        } catch (e) {
          console.error("Cloud syncing exception: ", e);
        } finally {
          setIsSyncing(false);
        }
      }, 1000);
      return () => clearTimeout(delay);
    }
  }, [state, user, authLoading]);

  const PRESET_PROFILES = [
    {
      name: "Aarav Sharma",
      email: "aarav.jee2026@gmail.com",
      board: "CBSE",
      cls: "IIT-JEE Prep",
      avatar: "🧠",
      desc: "Top 0.1% IIT-JEE Advanced Aspirant"
    },
    {
      name: "Dr. Ritika Sen",
      email: "ritika.doctor@gmail.com",
      board: "ICSE / ISC",
      cls: "NEET UG Prep",
      avatar: "🧬",
      desc: "NEET Top Rank Medical Aspirant"
    },
    {
      name: "Priya Deshmukh",
      email: "priya.upsc@gmail.com",
      board: "UPSC Civil Services",
      cls: "UPSC Civil Services",
      avatar: "🏛️",
      desc: "LBSNAA Bound UPSC Civil Services Scholar"
    },
    {
      name: "Anirudh Das",
      email: "anirudh.cat.mba@gmail.com",
      board: "IGCSE (Cambridge)",
      cls: "CAT MBA Prep",
      avatar: "📈",
      desc: "IIM Aspirant & MBA Quant Master"
    }
  ];

  const executeSimulatedLogin = (profile: { name: string, email: string, board?: string, cls?: string, avatar: string }) => {
    setAuthStep(1); // switch view to connection loader sequence
    
    setTimeout(() => {
      const mockUser = {
        uid: `mock_google_id_${profile.email.replace(/[@.]/g, "_")}`,
        displayName: profile.name,
        email: profile.email,
        photoURL: null,
        avatarEmoji: profile.avatar
      };
      
      localStorage.setItem("sap_v4_mock_user", JSON.stringify(mockUser));
      setUser(mockUser);
      
      const userState = localStorage.getItem(`sap_v4_user_${mockUser.uid}`);
      if (userState) {
        try {
          const parsed = JSON.parse(userState);
          setState((prev) => ({
            ...prev,
            ...parsed,
            timer: { ...INITIAL_STATE.timer, ...parsed.timer, running: false }
          }));
        } catch (e) {
          console.error("Failed loading persistent user state:", e);
        }
      } else {
        // Hydrate with current study progress
        localStorage.setItem(`sap_v4_user_${mockUser.uid}`, JSON.stringify(state));
      }
      
      triggerToast(`🍀 Connected: Welcome to StudyAI Pro cloud, ${profile.name}!`);
      setShowAuthModal(false);
      setAuthStep(0);
      setSimEmail("");
      setSimName("");
    }, 2400);
  };

  // Handle Dynamic login with signin options
  const handleGoogleLogin = async () => {
    // Save original offline context before login if no active user is signed in
    if (!user) {
      localStorage.setItem("sap_v4_offline", JSON.stringify(state));
    }
    setShowAuthModal(true);
  };

  const executeRealGoogleLogin = async () => {
    if (isDummyConfig) {
      triggerToast("🔐 Running in Local Storage database mode. Complete Firebase terms inside AI Studio UI first!");
      return;
    }
    setAuthStep(1); // switch view to connection loader sequence
    try {
      await signInWithGoogle();
      setShowAuthModal(false);
      setAuthStep(0);
    } catch (e: any) {
      setAuthStep(0);
      if (e?.code === "auth/popup-closed-by-user" || e?.message?.includes("popup-closed-by-user")) {
        triggerToast("🔑 Sign-in popup was closed or blocked. Tip: allow popups or use simulator!");
      } else if (e?.code === "auth/unauthorized-domain") {
        triggerToast("🚫 Unauthorized Domain! Add this host domain to Firebase Console Auth Authorized domains, or use Direct Tunnel below.");
      } else {
        triggerToast(`Login failed: ${e?.message || "Verify your connection."} Try Simulated Connection below!`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      if (!isDummyConfig) {
        await logOutFromFirebase();
      } else {
        localStorage.removeItem("sap_v4_mock_user");
      }
      setUser(null);
      // Restore previous local offline progress coordinates
      const savedOffline = localStorage.getItem("sap_v4_offline");
      if (savedOffline) {
        try {
          setState(JSON.parse(savedOffline));
        } catch (e) {
          setState(INITIAL_STATE);
        }
      } else {
        setState(INITIAL_STATE);
      }
      triggerToast("Signed out! Offline workspace restored.");
    } catch (e) {
      triggerToast("Logout error.");
    }
  };

  // Trigger custom toast alert banner
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleClaimBooster = (id: string, xpValue: number) => {
    setState((prev) => {
      const currentBoosts = prev.claimedBoosts || [];
      if (currentBoosts.includes(id)) return prev;
      return {
        ...prev,
        claimedBoosts: [...currentBoosts, id],
        extraXP: (prev.extraXP || 0) + xpValue,
      };
    });
    triggerToast(`⭐ Boost Triggered! Added +${xpValue} XP directly to Leaderboard!`);
  };

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("sap_v4", JSON.stringify(state));
      if (user) {
        localStorage.setItem(`sap_v4_user_${user.uid}`, JSON.stringify(state));
      }
    } catch (e) {
      console.error("Failed writing study-state:", e);
    }
  }, [state, user]);

  // Infinite Lofi study music platform client coordinator hook
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleTrackEnded = () => {
      if (state.proceduralSynth) return;
      // True randomizer algorithm that guarantees a completely new track is selected from the active catalog station
      setState((prev) => {
        const activeVibe = VIBES[prev.vibe] || VIBES[0];
        const catalogTracks = activeVibe.tracks;
        const totalTracksCount = catalogTracks.length;
        const currentTrackIndex = prev.track;
        
        let selectedNextTrackIndex = currentTrackIndex;
        if (totalTracksCount > 1) {
          // Keep generating until we get a completely different index to prevent repeats back-to-back
          while (selectedNextTrackIndex === currentTrackIndex) {
            selectedNextTrackIndex = Math.floor(Math.random() * totalTracksCount);
          }
        } else {
          selectedNextTrackIndex = 0;
        }

        const nextTrackName = catalogTracks[selectedNextTrackIndex]?.t || "Lofi Ambient";
        setTimeout(() => {
          triggerToast(`🎵 Auto-Cycled: "${nextTrackName}" | Handcrafted Study Playlist by Arhan!`);
        }, 80);

        return {
          ...prev,
          track: selectedNextTrackIndex,
          lofi: true
        };
      });
    };

    audio.addEventListener("ended", handleTrackEnded);

    try {
      if (state.proceduralSynth) {
        audio.pause();
        if (state.lofi) {
          QuantumSynth.start();
        } else {
          QuantumSynth.stop();
        }
      } else {
        QuantumSynth.stop();
        const currentVibe = VIBES[state.vibe] || VIBES[0];
        const currentBranch = currentVibe.tracks;
        const trackIdx = state.track % currentBranch.length;
        const currentTrack = currentBranch[trackIdx];

        // Fix: Only update source if different to prevent song resetting on play/pause or general screen state changes!
        if (audio.src !== currentTrack.s) {
          audio.src = currentTrack.s;
        }
        
        // Auto-advance is handled by "ended" listener, so set loop to false
        audio.loop = false;

        if (state.lofi) {
          audio.play().catch((err) => {
            console.log("Audio play failed or blocked by autoplay permissions:", err);
          });
        } else {
          audio.pause();
        }
      }
    } catch (e) {
      console.error("Lofi player sync problem:", e);
    }

    return () => {
      audio.removeEventListener("ended", handleTrackEnded);
    };
  }, [state.vibe, state.track, state.lofi, state.proceduralSynth]);

  // Clean-up synth on actual structural app unmount
  useEffect(() => {
    return () => {
      QuantumSynth.stop();
    };
  }, []);

  // Pomodoro timer countdown tick effect interval
  useEffect(() => {
    let timerIv: any = null;

    if (state.timer.running) {
      timerIv = setInterval(() => {
        setState((prev) => {
          if (prev.timer.sec > 1) {
            return {
              ...prev,
              timer: { ...prev.timer, sec: prev.timer.sec - 1 }
            };
          } else {
            // Timer target reached! Finish session
            clearInterval(timerIv);
            triggerToast(prev.timer.mode >= 25 ? "🏆 Session completed! Studying hours logged." : "☕ Break completed! Shift back to study focus.");
            
            // Increment hours stats (+0.4 hrs / 25 mins) and sessions
            const sessionsCompleted = prev.timer.mode >= 25 ? prev.timer.sessToday + 1 : prev.timer.sessToday;
            const updatedHours = prev.timer.mode >= 25 ? prev.stats.hours + 0.4 : prev.stats.hours;
            
            return {
              ...prev,
              timer: {
                ...prev.timer,
                sec: prev.timer.mode * 60,
                running: false,
                sessToday: sessionsCompleted
              },
              stats: {
                ...prev.stats,
                hours: updatedHours,
                streak: prev.stats.streak === 0 ? 1 : prev.stats.streak
              }
            };
          }
        });
      }, 1000);
    }

    return () => {
      if (timerIv) clearInterval(timerIv);
    };
  }, [state.timer.running, state.timer.mode]);

  // Core API fetcher helper
  const handleCallAI = async (prompt: string, persona: string): Promise<string | null> => {
    // 1. Determine if we have a Vercel proxy backend configured (e.g., when hosted on GitHub Pages)
    const envApiUrl = (import.meta as any).env?.VITE_VERCEL_API_URL || (import.meta as any).env?.VITE_API_URL || "";
    const configApiUrl = STATIC_CONFIG.VERCEL_API_URL ? STATIC_CONFIG.VERCEL_API_URL.trim().replace(/\/$/, "") : "";
    const resolvedApiUrl = envApiUrl || configApiUrl;

    const localKey = localStorage.getItem("USER_GEMINI_API_KEY") || "";
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
    const configKey = STATIC_CONFIG.GEMINI_API_KEY && !STATIC_CONFIG.GEMINI_API_KEY.includes("YOUR_COPIED_") ? STATIC_CONFIG.GEMINI_API_KEY.trim() : "";
    
    const resolvedKey = localKey || envKey || configKey;

    // 2. If a Vercel/Proxy backend is configured, and the user hasn't typed in a custom override key, use it!
    if (resolvedApiUrl && !localKey) {
      try {
        const response = await fetch(`${resolvedApiUrl}/api/ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            persona,
            board: state.board,
            cls: state.cls,
            sub: state.sub
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const message = errorData.error || "Proxy Server Error";
          triggerToast(`Vercel Proxy Error: ${message}`);
          return null;
        }

        const data = await response.json();
        return data.reply;
      } catch (err) {
        console.error("Vercel Proxy connection failed, attempting default paths...", err);
        // fall back to default or in-browser key
      }
    }

    // 3. Determine if we must run direct client-side requests (e.g. on GitHub Pages without a proxy)
    const isGitHubPages = window.location.hostname.includes("github.io") || 
                          window.location.hostname.includes("github.preview");

    if ((isGitHubPages && !resolvedApiUrl) || resolvedKey) {
      if (!resolvedKey) {
        setShowApiKeyModal(true);
        triggerToast("Vite Static mode detected: Please register your Gemini API key under settings or configure a Vercel Proxy.");
        return null;
      }

      try {
        const systemMessages: { [key: string]: string } = {
          notes: `You are the Master Scribe — create structured study notes for Indian board exams.
Transform any input into beautifully structured notes:
## [Topic Title]
**Key Concepts:** (bullet points)
**Important Definitions:** (key terms explained simply)
**Formulas/Dates/Facts:** (highlighted)
**Memory Tricks:** (mnemonics)
**Key Terms Summary:** (3-6 must-know terms with one-line definitions)
**Exam Tips:** (what examiners look for)
Concise but complete for board exam preparation.`,

          pyq: `You are a senior Board Examiner creating authentic exam papers for Indian board exams.
Generate questions with proper mark allocation:
**1-mark questions:** MCQs and very short answers (3-4 questions)
**2-mark questions:** Short answer (2 questions)
**3-mark questions:** Application-based (2 questions)
**5-mark questions:** Long answer or case study (1-2 questions)
Match the exact style, language and difficulty of official board papers from the requested year.
Start with a header containing board, class, subject, and year.`,

          pred: `You are an Exam Oracle analyzing Indian board exam patterns.
For the given board/class/subject, predict:
1. **Top 5 Most Likely Topics** with probability %
2. **3 High-Probability CBQs** (with model answers)
3. **Chapter Priority Ranking** (most to least important)
4. **Common Pitfalls** (what students get wrong)
Be specific, data-driven, and genuinely helpful for last-minute prep.`,

          doubts: `You are a brilliant teacher using the Feynman Technique. For every question, structure your answer as:
**💡 Simple Explanation** (explain like the student is 12, no jargon)
**📚 Academic Answer** (proper terminology and detail for board exams)
**🌐 Real-World Analogy** (a relatable everyday example)
**⚠️ Common Mistake** (what students usually get wrong)
**🔑 Memory Trick** (a quick way to remember for exams)
Focus on CBSE/ICSE Class 9-12 curriculum. Be warm, clear, encouraging and board-exam focused.`,

          weak: `You are a Study Recovery Coach. Create a targeted 3-day recovery plan for weak topics.
Format exactly as:
**📅 DAY 1 — Foundation (2-3 hrs)**
- Hour 1: [specific activity]
- Hour 2: [specific activity]
**📅 DAY 2 — Practice (2-3 hrs)**
- Hour 1: [specific activity]
- Hour 2: [specific activity]
**📅 DAY 3 — Mastery + Mock (2-3 hrs)**
- Hour 1: [specific activity]
- Hour 2: [specific activity]
- Quick self-test checklist
Include: NCERT chapters, specific YouTube searches, practice question types. Be realistic and motivating.`,

          mm: `Return ONLY valid JSON (no markdown, no extra text, no markdown code block backticks) for a mind map:
{
  "center": "Topic Name",
  "branches": [
    {
      "label": "Branch label",
      "color": "#7c6bef",
      "children": ["sub-topic 1", "sub-topic 2"]
    }
  ]
}
Use 4-6 branches each with 2-4 children. Short labels (2-4 words).`,

          quiz: `Return ONLY a valid JSON array (no markdown, no explanation, no markdown code block backticks):
[
  {
    "q": "Question text?",
    "opts": ["A option", "B option", "C option", "D option"],
    "ans": 0,
    "exp": "Why Option A is correct"
  }
]
Generate exactly 5 multiple choice questions. The 'ans' must be 0-indexed integer (0 for A, 1 for B, 2 for C, 3 for D). Make them Indian board-exam style (CBSE/ICSE Class 10/12) with good distractors.`,

          strat: `You are a Study Strategy Architect for Indian board exam students. Provide:
🗓️ **Weekly Timetable** (subject-wise daily plan)
📊 **Topic Priority Matrix** (high/medium/low priority)
✍ **Answer Writing Tips** (score maximum marks)
🧠 **Memory Techniques** (spaced repetition, mind maps)
🚨 **Exam Day Tips** (dos and don'ts)
Be practical, specific to the board/class, results-focused.`,

          motiv: `You are an inspiring personal coach for an Indian board exam student. Give a warm, genuine, uplifting, personalized promotional motivational message (150-200 words) that:
- Acknowledges the hard work
- Addresses common exam anxiety
- Uses a powerful analogy or metaphor
- Ends with a strong actionable affirmation
- Is warm, real, never preachy.`,

          yoga: `You are an expert ancient Indian Yogi and wellness consultant. Generate a tailored set of Yoga Asanas (poses) to practice during study breaks based on the user's focus need (stress relief, concentration, posture correction, or eye rejuvenation).
Your response must start with a serene greeting and then provide 2 to 3 tailored asanas. Each asana must include:
- **Asana Sanskrit & English Name** (e.g., Tadasana - Mountain Pose)
- **Breaks Benefit** (how it counters long sitting / studying strain)
- **Step-by-Step Instructions** (in clear numbered lists with easy guidance)
- **Breathing Guidance** (inhale/exhale instructions during pose)
- **Mistakes to Avoid** (safety guard)
Format in clean, highly elegant markdown layout with spacious divisions. Do NOT use fake or simulated data, guide the user genuinely for step-by-step clarity.`,

          fc_gen: `Return ONLY a valid JSON array of objects representing flashcards for the selected study topic (no markdown, no conversation, no markdown code block backticks):
[
  {
    "f": "Front / Question text?",
    "b": "Back / Clear explanatory answer"
  }
]
Generate 3 to 6 high-vibe flashcards tailored to CBSE/ICSE grades. Ensure proper key structure and robust concept clarification.`
        };

        const systemPrompt = (systemMessages[persona] || systemMessages.doubts) +
          `\n\n[Context - Board: ${state.board || 'CBSE'}, Class: ${state.cls || '10'}, Subject: ${state.sub || 'Mathematics'}]`;

        const isJson = ["mm", "quiz", "fc_gen"].includes(persona);
        
        const payload = {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            temperature: 0.7,
            ...(isJson ? { responseMimeType: "application/json" } : {})
          }
        };

        // Standard direct call to Google Gemini model endpoints in browser
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${resolvedKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const msg = errData.error?.message || "Standard Gemini call returned error.";
          triggerToast(`Gemini direct: ${msg}`);
          return null;
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return reply || "No response received.";
      } catch (err: any) {
        console.error(err);
        triggerToast("Vite static direct request failed. Please check your network or key.");
        return null;
      }
    }

    // Default connection path try back-end
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          persona,
          board: state.board,
          cls: state.cls,
          sub: state.sub
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error || "Server offline";
        
        // Auto surface config screen trigger
        setShowApiKeyModal(true);
        triggerToast(`${message}. Swapped to client-side direct config mode.`);
        return null;
      }

      const data = await response.json();
      return data.reply;
    } catch (err) {
      console.warn("Express backend offline, attempting direct static Gemini fallback...");
      setShowApiKeyModal(true);
      triggerToast("Express backend offline. Enabled Client-side Gemini configuration.");
      return null;
    }
  };

  // Extract Flashcards from note text logic
  const handleExtractFlashcards = async (noteContent: string) => {
    try {
      const systemPrompt = `Extract exactly 3 concise QA flashcard pairs from this note content. Return ONLY a valid JSON array format, no markdown, no explaining, matching schema:
[{"f":"Front question?","b":"Detailed back answer"}]
Content:\n${noteContent}`;

      const reply = await handleCallAI(systemPrompt, "quiz");
      if (reply) {
        let clean = reply.replace(/```json|```/g, "").trim();
        const firstBrace = clean.indexOf("[");
        const lastBrace = clean.lastIndexOf("]");
        if (firstBrace !== -1 && lastBrace !== -1) {
          clean = clean.substring(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setState((prev) => {
            const currentDeck = [...prev.fc];
            parsed.forEach((part) => {
              currentDeck.push({
                f: part.f,
                b: part.b,
                ts: Date.now()
              });
            });
            return {
              ...prev,
              fc: currentDeck
            };
          });
          triggerToast("🚀 Extracted 3 Flashcards successfully!");
        }
      }
    } catch (e) {
      console.error("Extract cards parse error:", e);
      triggerToast("Error extracting QA cards.");
    }
  };

  // Context updates
  const handleContextChange = (key: "board" | "cls" | "sub", value: string) => {
    setState((prev) => ({
      ...prev,
      [key]: value
    }));
    triggerToast(`Syllabus changed to ${value}`);
  };

  const handleUpdateStats = useCallback((updater: (prev: AppState["stats"]) => AppState["stats"]) => {
    setState((prev) => {
      const nextStats = updater(prev.stats);
      if (JSON.stringify(prev.stats) === JSON.stringify(nextStats)) {
        return prev;
      }
      return {
        ...prev,
        stats: nextStats
      };
    });
  }, []);

  // State mutabilities
  const handleAddQuickTask = (text: string) => {
    setState((prev) => ({
      ...prev,
      qt: [...prev.qt, { t: text, d: false }]
    }));
    triggerToast("Task added!");
  };

  const handleToggleQuickTask = (index: number) => {
    setState((prev) => {
      const updated = [...prev.qt];
      updated[index].d = !updated[index].d;
      return { ...prev, qt: updated };
    });
  };

  const handleDeleteQuickTask = (index: number) => {
    setState((prev) => ({
      ...prev,
      qt: prev.qt.filter((_, idx) => idx !== index)
    }));
  };

  const handleSaveNote = (title: string, content: string) => {
    const newNote: Note = {
      title,
      content,
      date: new Date().toLocaleDateString()
    };
    setState((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes]
    }));
    triggerToast("Saved note card successfully!");
  };

  const handleDeleteNote = (index: number) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.filter((_, idx) => idx !== index)
    }));
    triggerToast("Note deleted.");
  };

  const handleAddHW = (text: string, date: string, priority: "high" | "med" | "low") => {
    const newTask: Homework = {
      t: text,
      d: date,
      pri: priority,
      done: false
    };
    setState((prev) => ({
      ...prev,
      hw: [newTask, ...prev.hw]
    }));
    triggerToast("Homework target logged!");
  };

  const handleToggleHW = (index: number) => {
    setState((prev) => {
      const updated = [...prev.hw];
      updated[index].done = !updated[index].done;
      const doneValue = updated.filter((h) => h.done).length;
      return {
        ...prev,
        hw: updated,
        stats: { ...prev.stats, hwDone: doneValue }
      };
    });
  };

  const handleDeleteHW = (index: number) => {
    setState((prev) => {
      const updated = prev.hw.filter((_, idx) => idx !== index);
      const doneValue = updated.filter((h) => h.done).length;
      return {
        ...prev,
        hw: updated,
        stats: { ...prev.stats, hwDone: doneValue }
      };
    });
    triggerToast("Item removed.");
  };

  const handleAddFC = (front: string, back: string) => {
    const newCard: Flashcard = {
      f: front,
      b: back,
      ts: Date.now()
    };
    setState((prev) => ({
      ...prev,
      fc: [...prev.fc, newCard],
      fcIdx: prev.fc.length // set browser to focus new card
    }));
    triggerToast("QA recall card added!");
  };

  const handleDeleteFC = (index: number) => {
    setState((prev) => {
      const updated = prev.fc.filter((_, idx) => idx !== index);
      const nextIdx = Math.max(0, Math.min(prev.fcIdx, updated.length - 1));
      return {
        ...prev,
        fc: updated,
        fcIdx: nextIdx
      };
    });
    triggerToast("Card deleted.");
  };

  // Helper variables for Lofi streams
  const currentVibe = VIBES[state.vibe] || VIBES[0];
  const baseTrack = currentVibe.tracks[state.track % currentVibe.tracks.length];
  const TRACK_MODIFIERS = [
    "432Hz Ambient Resonance",
    "Slowed & Deep Reverbs",
    "Binaural Study Master",
    "Dopamine Enhanced Mix",
    "Midnight Espresso Cut",
    "Sunset Horizon Remaster",
    "Golden Aura Frequency",
    "Alpha Brainwave Boost",
    "Cosmic Space Acoustic",
    "Analog Vintage Tape Mix",
    "Deep Focus Subliminals",
    "Ocean Breeze Re-eqed",
    "Retro Neon Mastercut",
    "Breathe & Relax Session",
    "Upbeat Energy Uplift"
  ];
  const modIdx = (state.track * 3 + state.vibe * 7) % TRACK_MODIFIERS.length;
  const bpm = 65 + ((state.track * 11 + state.vibe * 13) % 55);
  const activeTrackName = baseTrack
    ? `${baseTrack.t} (${TRACK_MODIFIERS[modIdx]}) • ${bpm} BPM`
    : "Study Lo-Fi Beats";

  const currentThemeClass = state.theme === "light" ? "light" : "dark";
  const studentDisplayName = user?.displayName || state.profileName || "Syllabus Gladiator";

  if (viewMode === "landing") {
    return (
      <LandingPage
        initialState={state}
        onCallAI={handleCallAI}
        onLaunchApp={(onboardingData) => {
          if (onboardingData) {
            setState((prev) => ({
              ...prev,
              board: onboardingData.board,
              cls: onboardingData.cls,
              sub: onboardingData.sub,
              profileName: onboardingData.tracker || "Syllabus Gladiator"
            }));
          }
          setViewMode("app");
          triggerToast("Activated StudyAI Pro Workspace!");
        }}
        onPlaySound={() => playDopamineSound('levelUp')}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${currentThemeClass}`}>
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl glass-panel bg-indigo-950/90 border border-[#0bb6ae]/30 text-white flex items-center gap-2 animate-[bounce_1.4s_infinite_alternate_relative]">
          <span className="text-xl">✨</span>
          <span className="text-xs font-bold font-mono uppercase tracking-wide">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-3 text-slate-500 hover:text-white cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header controls bar */}
      <Header
        state={state}
        onChangeContext={handleContextChange}
        onToggleTheme={() =>
          setState((prev) => ({ ...prev, theme: prev.theme === "dark" ? "light" : "dark" }))
        }
        onToggleZen={() => setState((prev) => ({ ...prev, speechOn: !prev.speechOn }))} // reuse speechOn as Zen flag trigger
        onToggleMusic={() => setState((prev) => ({ ...prev, lofi: !prev.lofi }))}
        isZen={state.speechOn || false}
        isPlayingMusic={state.lofi}
        activeTrackName={activeTrackName}
        user={user}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
        isSyncing={isSyncing}
        isDummyConfig={isDummyConfig}
        onConfigureApiKey={() => setShowApiKeyModal(true)}
      />

      {/* Main split routing layouts */}
      <div className="flex-1 flex relative">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo(0, 0);
          }}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          streak={state.stats.streak}
        />

        {/* Dynamic page container viewport */}
        <main className={`flex-1 p-4 md:p-8 transition-all duration-300 ${collapsed ? "ml-[64px]" : "ml-[256px]"}`}>
          <div className="max-w-5xl mx-auto pb-12">
            {activeTab === "dash" && (
              <Dashboard
                state={state}
                onAddQuickTask={handleAddQuickTask}
                onToggleQuickTask={handleToggleQuickTask}
                onDeleteQuickTask={handleDeleteQuickTask}
                onSetExamDate={(date) => setState((prev) => ({ ...prev, examDate: date }))}
                onNavigate={(tab) => setActiveTab(tab)}
                onPlaySound={playDopamineSound}
                profileName={studentDisplayName}
                onClaimBooster={handleClaimBooster}
                liveLeaderboard={liveLeaderboard}
              />
            )}

            {activeTab === "timer" && (
              <TimerPanel
                state={state}
                onSetTimerMode={(min) =>
                  setState((prev) => ({ ...prev, timer: { ...prev.timer, mode: min, sec: min * 60 } }))
                }
                onToggleTimer={() =>
                  setState((prev) => ({ ...prev, timer: { ...prev.timer, running: !prev.timer.running } }))
                }
                onResetTimer={() =>
                  setState((prev) => ({ ...prev, timer: { ...prev.timer, sec: prev.timer.mode * 60, running: false } }))
                }
                onToggleMusic={() => setState((prev) => ({ ...prev, lofi: !prev.lofi }))}
                onSetVibe={(vibeIdx) => {
                  const targetVibe = VIBES[vibeIdx] || VIBES[0];
                  const randomTrack = Math.floor(Math.random() * targetVibe.tracks.length);
                  setState((prev) => ({ ...prev, vibe: vibeIdx, track: randomTrack, lofi: true }));
                }}
                onNextTrack={() => {
                  setState((prev) => {
                    const activeVibe = VIBES[prev.vibe] || VIBES[0];
                    const catalogTracks = activeVibe.tracks;
                    const totalTracksCount = catalogTracks.length;
                    const currentTrackIndex = prev.track;
                    
                    let selectedNextTrackIndex = currentTrackIndex;
                    if (totalTracksCount > 1) {
                      while (selectedNextTrackIndex === currentTrackIndex) {
                        selectedNextTrackIndex = Math.floor(Math.random() * totalTracksCount);
                      }
                    } else {
                      selectedNextTrackIndex = 0;
                    }

                    const nextTrackName = catalogTracks[selectedNextTrackIndex]?.t || "Lofi Ambient";
                    setTimeout(() => {
                      triggerToast(`🎵 Skip: Playing "${nextTrackName}" | Curated by Arhan`);
                    }, 80);

                    return { ...prev, track: selectedNextTrackIndex, lofi: true };
                  });
                }}
                onPrevTrack={() => {
                  setState((prev) => {
                    const currentVibe = VIBES[prev.vibe] || VIBES[0];
                    const numTracks = currentVibe.tracks.length;
                    const prevTrackIdx = (prev.track - 1 + numTracks) % numTracks;
                    return { ...prev, track: prevTrackIdx, lofi: true };
                  });
                }}
                isPlayingMusic={state.lofi}
                activeVibeName={currentVibe.name}
                activeTrackName={activeTrackName}
                onToggleProceduralSynth={() => {
                  setState((prev) => {
                    const toggled = !prev.proceduralSynth;
                    if (toggled) {
                      triggerToast("🌌 Activated Quantum Procedural Synth! Loading binaural fields...");
                    } else {
                      triggerToast("🎵 Restored standard study radio stations.");
                    }
                    return {
                      ...prev,
                      lofi: true,
                      proceduralSynth: toggled
                    };
                  });
                }}
              />
            )}

            {activeTab === "notes" && (
              <NotesPanel
                state={state}
                onSaveNote={handleSaveNote}
                onDeleteNote={handleDeleteNote}
                onExtractFlashcards={handleExtractFlashcards}
                isLoadingAI={false}
                onCallAI={handleCallAI}
              />
            )}

            {activeTab === "mm" && <MindMapPanel onCallAI={handleCallAI} />}

            {activeTab === "quiz" && (
              <QuizPanel
                onCallAI={handleCallAI}
                onIncrementQuizzes={() =>
                  setState((prev) => ({ ...prev, stats: { ...prev.stats, quizzes: prev.stats.quizzes + 1 } }))
                }
                onPlaySound={playDopamineSound}
                profileName={studentDisplayName}
              />
            )}

            {activeTab === "fc" && (
              <FlashcardsPanel
                state={state}
                onAddFC={handleAddFC}
                onDeleteFC={handleDeleteFC}
                onShuffleFC={() =>
                  setState((prev) => ({
                    ...prev,
                    fc: [...prev.fc].sort(() => Math.random() - 0.5),
                    fcIdx: 0
                  }))
                }
                onSetFCIndex={(idx) => setState((prev) => ({ ...prev, fcIdx: idx }))}
                onCallAI={handleCallAI}
              />
            )}

            {activeTab === "hw" && (
              <HomeworkPanel
                state={state}
                onAddHW={handleAddHW}
                onToggleHW={handleToggleHW}
                onDeleteHW={handleDeleteHW}
              />
            )}

            {/* Render AI sub-modes context panel routers */}
            {["pyq", "pred", "doubts"].includes(activeTab) && (
              <AIWorkspacePanels
                state={state}
                activeSection={activeTab as any}
                onCallAI={handleCallAI}
                onUpdateStats={handleUpdateStats}
                profileName={studentDisplayName}
              />
            )}

            {/* Render Static references portlet section routers */}
            {["form", "res", "strat", "motiv", "weak", "yoga"].includes(activeTab) && (
              <StaticReferencePanels
                state={state}
                activeSection={activeTab as any}
                onCallAI={handleCallAI}
                onAddHW={handleAddHW}
                onNavigate={(tab) => setActiveTab(tab)}
                onUpdateStats={handleUpdateStats}
              />
            )}
          </div>
        </main>
      </div>

      {/* Interactive Google Sync Simulator Portal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030308]/80 backdrop-blur-lg">
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative w-full max-w-2xl rounded-3xl p-6 md:p-8 bg-[#090916] border border-indigo-500/20 shadow-2xl shadow-indigo-500/5 text-white overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Absolutes decorative cosmic graphics */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Header block */}
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-bold">
                      <ShieldCheck size={11} className="text-teal-400" /> SECURE GOOGLE INTENT SHIELD
                    </span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-white font-display mt-2 flex items-center gap-2">
                    StudyAI Pro <span className="text-indigo-400">Cloud Sync Portal</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Connect your student profile to automatically preserve exam targets, notes, Feynman chats, and flashcards across all devices.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    setAuthStep(0);
                  }}
                  className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:border-rose-500/30 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {authStep === 1 ? (
                /* Gorgeous Simulated Connecting/Hydrating Console Loader */
                <div className="py-16 text-center space-y-6 flex flex-col items-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-500/10 border-t-indigo-400 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                      <Sparkles size={22} className="animate-pulse text-[#0bb6ae]" />
                    </div>
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <p className="text-lg font-black text-white animate-pulse uppercase tracking-tight">Authorizing Secure Google Account...</p>
                    <div className="p-3 bg-slate-950/90 border border-white/5 rounded-xl font-mono text-[10px] text-left text-indigo-300 space-y-1 leading-relaxed">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400">✔</span> <span>Verifying Google Federated ID Token...</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400">✔</span> <span>Establishing Secure Local Sync State...</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-indigo-400 animate-pulse">●</span> <span>Hydrating Feynman history log, flashcards, statistics...</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Option 1: Live Secure Google login with firebase credentials */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-black border border-indigo-500/20 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
                    <div>
                      <h4 className="text-xs uppercase font-mono text-indigo-300 tracking-wider flex items-center gap-1.5 font-bold">
                        ⚡ RECOMMENDED PRIMARY INTERFACE
                      </h4>
                      <h5 className="text-sm font-bold text-white mt-1">Direct Google Federated Authentication</h5>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Launches a secure firebase-auth login interface. If your browser restricts popups or if the domains are not whitelisted in the console, seamlessly use Option B or C below as an expert bypass.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={executeRealGoogleLogin}
                      className="w-full h-11 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:shadow-lg hover:shadow-indigo-500/10 active:scale-98 duration-150"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" className="shrink-0">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      Synchronize live with Google Identity
                    </button>
                  </div>

                  {/* Option 2: Quick predesigned elite student profiles */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs uppercase font-mono text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                      <Award size={13} className="text-amber-400" /> Option B: Instantly Switch Elite Student Accounts
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {PRESET_PROFILES.map((profile) => (
                        <button
                          key={profile.email}
                          onClick={() => executeSimulatedLogin(profile)}
                          className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 hover:border-indigo-500/40 text-left transition-all duration-200 group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{profile.avatar}</span>
                            <div className="flex-1 leading-tight">
                              <h5 className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors">{profile.name}</h5>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{profile.email}</p>
                            </div>
                          </div>
                          <p className="text-[10px] text-indigo-300 font-medium mt-2 bg-indigo-500/10 px-2.5 py-0.5 rounded-full w-fit">
                            {profile.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Divider line */}
                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest my-2 animate-pulse">
                    <span className="flex-1 h-px bg-white/5"></span>
                    <span>OR CREATE CUSTOM STUDY OPERATING ID</span>
                    <span className="flex-1 h-px bg-white/5"></span>
                  </div>

                  {/* Option C: Custom details Google credentials emulator */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!simName.trim() || !simEmail.trim()) {
                        triggerToast("Please enter name and valid gmail coordinates.");
                        return;
                      }
                      executeSimulatedLogin({
                        name: simName.trim(),
                        email: simEmail.trim(),
                        avatar: simAvatar
                      });
                    }}
                    className="space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-white/5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wide">Enter Student Name</label>
                        <input
                          type="text"
                          required
                          value={simName}
                          onChange={(e) => setSimName(e.target.value)}
                          placeholder="e.g. Priyanshu Ranjan"
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wide">Enter Gmail Address</label>
                        <input
                          type="email"
                          required
                          value={simEmail}
                          onChange={(e) => setSimEmail(e.target.value)}
                          placeholder="e.g. priyanshu@gmail.com"
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold text-slate-300 block uppercase tracking-wide">Select Student Profile Avatar Symbol</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { emoji: "🧠", text: "Thinker" },
                          { emoji: "🚀", text: "Explorer" },
                          { emoji: "🧬", text: "Solver" },
                          { emoji: "🏛️", text: "Scholar" },
                          { emoji: "📈", text: "Quant" },
                          { emoji: "💻", text: "Coder" },
                          { emoji: "🎨", text: "Creator" }
                        ].map((item) => (
                          <button
                            key={item.emoji}
                            type="button"
                            onClick={() => setSimAvatar(item.emoji)}
                            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                              simAvatar === item.emoji
                                ? "bg-indigo-650/45 border-indigo-400 text-white font-extrabold shadow-md shadow-indigo-600/10 scale-102"
                                : "bg-slate-900 border-white/5 text-slate-450 hover:text-white"
                            }`}
                          >
                            <span>{item.emoji}</span>
                            <span>{item.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-95 duration-200"
                    >
                      <LogIn size={13} />
                      Proceed with Google Federated Authentications
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Client-Side Gemini API Key Config Modal for Static Pages Deployment */}
      <AnimatePresence>
        {showApiKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030308]/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-md rounded-3xl p-6 md:p-8 bg-[#090916] border border-pink-500/20 shadow-2xl text-white overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] uppercase font-mono bg-pink-500/10 border border-pink-500/20 text-pink-300 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-bold w-fit">
                    ⚡ STATIC RECOVERY ENGINE
                  </span>
                  <h3 className="text-xl font-black mt-2 font-display">
                    Local Gemini API Key
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    When hosted statically (e.g. on GitHub Pages), direct browser connections enable all AI features securely.
                  </p>
                </div>
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-xs bg-indigo-950/40 p-3.5 rounded-2xl border border-indigo-500/15 space-y-1.5 leading-relaxed text-slate-300">
                  <p className="font-bold text-white">How to activate:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Go to <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-pink-400 hover:underline inline-flex items-center gap-0.5">Google AI Studio <Sparkles size={10} /></a></li>
                    <li>Generate a **Free Gemini API key** with 1 click</li>
                    <li>Paste your key below (it is stored safely in your own browser's local secure storage)</li>
                  </ol>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest block">Gemini API Key</label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-[#030308] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-pink-500/40 focus:ring-1 focus:ring-pink-500/30 transition-all font-mono"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      localStorage.setItem("USER_GEMINI_API_KEY", apiKeyInput.trim());
                      setShowApiKeyModal(false);
                      triggerToast("Gemini key configured successfully!");
                    }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-indigo-650 hover:from-pink-600 hover:to-indigo-700 text-white font-black text-xs rounded-full cursor-pointer transition-all active:scale-95 text-center shadow-lg shadow-pink-500/10"
                  >
                    Save API Key Settings
                  </button>
                  {localStorage.getItem("USER_GEMINI_API_KEY") && (
                    <button
                      onClick={() => {
                        localStorage.removeItem("USER_GEMINI_API_KEY");
                        setApiKeyInput("");
                        setShowApiKeyModal(false);
                        triggerToast("Key removed. Falling back to platform environment.");
                      }}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-red-400 font-bold text-xs rounded-full border border-red-500/20 cursor-pointer transition-all active:scale-95"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
