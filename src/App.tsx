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
import { AppState, INITIAL_STATE, Note, Flashcard, Homework, QuickTask } from "./types";
import { X, RefreshCw, Sparkle, Sparkles, LogIn, LogOut, Check, CheckCircle, Award, Compass, Globe, HelpCircle, BookOpen, ShieldCheck } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, isDummyConfig, signInWithGoogle, logOutFromFirebase, fetchStateFromFirestore, syncStateToFirestore } from "./lib/firebase";
import { AnimatePresence, motion } from "motion/react";

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

  // Auth & Cloud synchronisation states
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Local Google sign-in simulator portal variables
  const [simEmail, setSimEmail] = useState("");
  const [simName, setSimName] = useState("");
  const [simAvatar, setSimAvatar] = useState("🚀");
  const [authStep, setAuthStep] = useState(0); // 0=Form, 1=Animation Loader

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

  // Sync state mutations to Cloud Firestore if signed in (Debounced 1s)
  useEffect(() => {
    if (user && !authLoading) {
      const delay = setTimeout(async () => {
        setIsSyncing(true);
        try {
          await syncStateToFirestore(user.uid, state);
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
    if (isDummyConfig) {
      // Save original offline context before login if no active user is signed in
      if (!user) {
        localStorage.setItem("sap_v4_offline", JSON.stringify(state));
      }
      setShowAuthModal(true);
      return;
    }
    try {
      await signInWithGoogle();
    } catch (e: any) {
      if (e.message === "PROVISION_REQUIRED") {
        triggerToast("🔐 Firebase terms in AI Studio must be accepted first!");
      } else {
        triggerToast("Login failed. Check internet coordinates.");
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
      // Automatically advance to a randomized different track in the same vibe so they never get bored!
      setState((prev) => {
        const currentVibe = VIBES[prev.vibe] || VIBES[0];
        const numTracks = currentVibe.tracks.length;
        let randomTrackIdx = prev.track;
        if (numTracks > 1) {
          while (randomTrackIdx === prev.track) {
            randomTrackIdx = Math.floor(Math.random() * numTracks);
          }
        } else {
          randomTrackIdx = 0;
        }
        return {
          ...prev,
          track: randomTrackIdx,
          lofi: true
        };
      });
    };

    audio.addEventListener("ended", handleTrackEnded);

    try {
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
    } catch (e) {
      console.error("Lofi player sync problem:", e);
    }

    return () => {
      audio.removeEventListener("ended", handleTrackEnded);
    };
  }, [state.vibe, state.track, state.lofi]);

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
        const errorData = await response.json();
        triggerToast(errorData.error || "Server error occurred");
        return null;
      }

      const data = await response.json();
      return data.reply;
    } catch (err) {
      console.error(err);
      triggerToast("AI offline. Check internet connection.");
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
  const activeTrackName = currentVibe.tracks[state.track % currentVibe.tracks.length]?.t || "Lo-Fi Beats";

  const currentThemeClass = state.theme === "light" ? "light" : "dark";

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
                    const currentVibe = VIBES[prev.vibe] || VIBES[0];
                    const numTracks = currentVibe.tracks.length;
                    let targetTrack = prev.track;
                    if (numTracks > 1) {
                      while (targetTrack === prev.track) {
                        targetTrack = Math.floor(Math.random() * numTracks);
                      }
                    } else {
                      targetTrack = 0;
                    }
                    return { ...prev, track: targetTrack, lofi: true };
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
                  {/* Option 1: Quick predesigned elite student profiles */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs uppercase font-mono text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                      <Award size={13} className="text-amber-400" /> Option A: Instantly Switch Elite Student Accounts
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
                    <span>OR CONNECT CUSTOM STUDENT GOOGLE ACCOUNT</span>
                    <span className="flex-1 h-px bg-white/5"></span>
                  </div>

                  {/* Option 2: Custom details Google credentials emulator */}
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
    </div>
  );
}
