import React from "react";
import { Sun, Moon, Volume2, VolumeX, Eye, EyeOff, LogIn, LogOut, Cloud, CloudLightning, ShieldAlert, Sparkles, Key } from "lucide-react";
import { AppState } from "../types";

interface HeaderProps {
  state: AppState;
  onChangeContext: (key: "board" | "cls" | "sub", value: string) => void;
  onToggleTheme: () => void;
  onToggleZen: () => void;
  onToggleMusic: () => void;
  isZen: boolean;
  isPlayingMusic: boolean;
  activeTrackName: string;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  isSyncing: boolean;
  isDummyConfig: boolean;
  onConfigureApiKey?: () => void;
}

export default function Header({
  state,
  onChangeContext,
  onToggleTheme,
  onToggleZen,
  onToggleMusic,
  isZen,
  isPlayingMusic,
  activeTrackName,
  user,
  onLogin,
  onLogout,
  isSyncing,
  isDummyConfig,
  onConfigureApiKey
}: HeaderProps) {
  const defaultBoards = [
    "CBSE",
    "ICSE / ISC",
    "NIOS (National)",
    "IB (International)",
    "IGCSE (Cambridge)",
    "Maharashtra State Board",
    "UP State Board",
    "Tamil Nadu Board",
    "Karnataka Board",
    "Bihar Board",
    "West Bengal Board",
    "Andhra / Telangana Board",
    "Kerala State Board"
  ];

  const defaultClasses = [
    "9",
    "10",
    "11",
    "12",
    "IIT-JEE Prep",
    "NEET UG Prep",
    "UPSC Civil Services",
    "CAT MBA Prep",
    "SAT / ACT Prep",
    "GRE / GMAT Prep",
    "Other Exam Aspirant"
  ];

  const defaultSubjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History & Civics",
    "Geography & Economics",
    "Indian Polity",
    "English / Verbal",
    "Quantitative Aptitude",
    "Logical Reasoning",
    "General Studies",
    "Computer Science"
  ];

  // Dynamically insert custom values if configured in workspace state
  const boards = defaultBoards.includes(state.board) ? defaultBoards : [state.board, ...defaultBoards];
  const classes = defaultClasses.includes(state.cls) ? defaultClasses : [state.cls, ...defaultClasses];
  const subjects = defaultSubjects.includes(state.sub) ? defaultSubjects : [state.sub, ...defaultSubjects];

  const handleSelectChange = (key: "board" | "cls" | "sub", value: string) => {
    if (value === "custom_prompt") {
      const customVal = window.prompt(`Enter your custom ${key === "board" ? "Board" : key === "cls" ? "Class / Goal" : "Subject Name"}:`);
      if (customVal && customVal.trim()) {
        onChangeContext(key, customVal.trim());
      }
    } else {
      onChangeContext(key, value);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-300 bg-[#050507]/90 border-white/10 px-4 md:px-8 py-3 flex items-center justify-between gap-4 h-20">
      {/* Brand Logo & V2 badges */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative group cursor-pointer flex items-center gap-3">
          {/* Glowing Mortarboard Circuit Emblem (Godly Level Custom Logo) */}
          <div className="relative w-10 h-10 bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-transform group-hover:scale-105">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
              <circle cx="12" cy="10" r="1.5" className="fill-white animate-pulse" />
            </svg>
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-cyan-400 to-indigo-400 rounded-xl opacity-20 blur group-hover:opacity-40 transition duration-1000"></div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">
              StudyAI <span className="text-indigo-400">Pro</span>
            </h1>
            <p className="text-[10px] text-white/40 font-mono tracking-wider mt-1">SECURE STUDY CONTEXT</p>
          </div>
        </div>
      </div>

      {/* Selectors and Control utilities */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        {/* Responsive, scrollable context selector bar */}
        <div className="flex items-center gap-1 bg-white/5 p-1 md:p-1.5 rounded-full border border-white/10 max-w-[150px] xs:max-w-[240px] sm:max-w-none overflow-x-auto sm:overflow-visible scrollbar-none whitespace-nowrap">
          <select
            value={state.board}
            onChange={(e) => handleSelectChange("board", e.target.value)}
            className="bg-transparent text-[10px] md:text-xs text-white/90 font-medium px-2 md:px-3 py-1 outline-none cursor-pointer focus:text-indigo-400"
          >
            {boards.map((b) => (
              <option key={b} value={b} className="bg-[#0A0A0F] text-white">
                {b}
              </option>
            ))}
            <option value="custom_prompt" className="bg-[#0A0A0F] text-indigo-400 font-extrabold">
              ✏️ Enter Custom Board...
            </option>
          </select>

          <select
            value={state.cls}
            onChange={(e) => handleSelectChange("cls", e.target.value)}
            className="bg-transparent text-[10px] md:text-xs text-white/90 font-medium px-2 md:px-3 py-1 outline-none border-l border-white/10 cursor-pointer focus:text-indigo-400"
          >
            {classes.map((c) => (
              <option key={c} value={c} className="bg-[#0A0A0F] text-white">
                {isNaN(Number(c)) ? c : `Class ${c}`}
              </option>
            ))}
            <option value="custom_prompt" className="bg-[#0A0A0F] text-indigo-400 font-extrabold">
              ✏️ Enter Custom Class...
            </option>
          </select>

          <select
            value={state.sub}
            onChange={(e) => handleSelectChange("sub", e.target.value)}
            className="bg-transparent text-[10px] md:text-xs text-white/90 font-medium px-2 md:px-3 py-1 outline-none border-l border-white/10 cursor-pointer focus:text-indigo-400"
          >
            {subjects.map((s) => (
              <option key={s} value={s} className="bg-[#0A0A0F] text-white">
                {s}
              </option>
            ))}
            <option value="custom_prompt" className="bg-[#0A0A0F] text-indigo-400 font-extrabold">
              ✏️ Enter Custom Subject...
            </option>
          </select>
        </div>

        {/* Action icons row */}
        <div className="flex items-center gap-2">
          {/* Zen Focus Toggle */}
          <button
            onClick={onToggleZen}
            title="Zen Mode Focus (All distractions hidden)"
            className={`p-2.5 rounded-full border transition-all duration-300 cursor-pointer ${
              isZen
                ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {isZen ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>

          {/* Lo-Fi quick control */}
          <button
            onClick={onToggleMusic}
            title={isPlayingMusic ? `Mute Lo-Fi: ${activeTrackName}` : "Play Lo-Fi Music"}
            className={`p-2.5 rounded-full border transition-all duration-300 hidden md:inline-flex cursor-pointer ${
              isPlayingMusic
                ? "bg-indigo-600 text-white border-indigo-500/50"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {isPlayingMusic ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            title={`Switch to ${state.theme === "dark" ? "Light" : "Dark"} Mode`}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-indigo-400 hover:text-white transition-all cursor-pointer"
          >
            {state.theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Gemini API Key dynamic configuration */}
          {onConfigureApiKey && (
            <button
              onClick={onConfigureApiKey}
              title="Configure Client-Side Gemini API Key"
              className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-pink-500/10 hover:border-pink-500/40 hover:text-white transition-all cursor-pointer"
            >
              <Key size={16} className="text-pink-400" />
            </button>
          )}

          {/* Google Sign-In Dynamic Auth and cloud synchronization widget */}
          {user ? (
            <div className="flex items-center gap-2 bg-indigo-500/5 hover:bg-indigo-500/10 p-1 md:py-1 md:pl-1 md:pr-3 rounded-full border border-indigo-500/20 transition-all select-none group">
              <div className="relative">
                {user.avatarEmoji ? (
                  <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-sm shadow-[0_0_10px_rgba(99,102,241,0.25)]">
                    {user.avatarEmoji}
                  </div>
                ) : user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="w-7 h-7 rounded-full object-cover border border-indigo-500/30" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {user.email?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {/* Visual cloud sync indicator */}
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#050507] ${isSyncing ? "bg-amber-400 animate-spin" : "bg-teal-400"}`} title={isSyncing ? "Syncing data to cloud..." : "All changes protected in cloud!"}></span>
              </div>
              <div className="hidden sm:flex flex-col items-start leading-none ml-1">
                <span className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors">{user.displayName || "Student"}</span>
                <span className="text-[8px] font-mono text-indigo-400/80 uppercase tracking-widest mt-0.5">Cloud Protect</span>
              </div>
              <button
                onClick={onLogout}
                title="Log out from devices"
                className="p-1 px-2 rounded-full text-white/40 hover:text-red-400 hover:bg-rose-500/10 transition-all text-xs cursor-pointer ml-1 sm:ml-2"
              >
                <LogOut size={12} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {isDummyConfig && (
                <span className="hidden xl:inline-block text-[10px] font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/15 px-2.5 py-1 rounded-full mr-1.5 uppercase tracking-wide">
                  Local Mode Active
                </span>
              )}
              <button
                onClick={onLogin}
                className="h-9 px-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.03] active:scale-95"
                title={isDummyConfig ? "Firebase integration in setup. Sync is running local-only." : "Log in securely using Google Account"}
              >
                <LogIn size={13} />
                <span className="hidden sm:inline">Google Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
