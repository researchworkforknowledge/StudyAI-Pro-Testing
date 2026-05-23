import React, { useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, SkipForward, SkipBack, Music, Coffee, Flame } from "lucide-react";
import { AppState } from "../types";

export const VIBES = [
  {
    name: "Chill Lo-Fi",
    emoji: "☕",
    tracks: [
      { t: "Acoustic Chill Beat", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
      { t: "Morning Reverie", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
      { t: "Cozy Espresso", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
      { t: "Campfire Clouds", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
      { t: "Retro Horizon Breeze", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
      { t: "Suburban Rain Lo-Fi", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" }
    ]
  },
  {
    name: "Rainy Vibes",
    emoji: "🌧️",
    tracks: [
      { t: "Raindrops Synth", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
      { t: "Midnight Mist Keys", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
      { t: "Thunder & Wave Guide", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
      { t: "Waterfront Serenity", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
      { t: "Neon Cafe Raindrops", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
      { t: "Cloudburst Chillout", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" }
    ]
  },
  {
    name: "Synthwave Focus",
    emoji: "⚡",
    tracks: [
      { t: "Retro Quantum Drive", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
      { t: "Neon Grid Runner", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" },
      { t: "Starlight Interceptor", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" },
      { t: "Solar Orbit Horizon", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3" },
      { t: "Grid-City Overdrive", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3" },
      { t: "Cybernetic Horizon", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3" }
    ]
  },
  {
    name: "Cosmic Nature",
    emoji: "🌲",
    tracks: [
      { t: "Forest Canopy Ambient", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3" },
      { t: "Winding Stream Waves", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3" },
      { t: "Ethereal Canyon Echoes", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3" },
      { t: "Celestial Sound Orbit", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3" },
      { t: "Zen Garden Waterfall", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
      { t: "Mountain Peak Chords", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" }
    ]
  },
  {
    name: "Deep Relax",
    emoji: "🧘",
    tracks: [
      { t: "Infinite Zen Calm", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
      { t: "Deep Ocean Breath", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
      { t: "Mantra of Serenity", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" },
      { t: "Cosmic Dust Relaxation", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3" },
      { t: "Aura Clearing Sound Bath", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
      { t: "Solfeggio Resonance", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" }
    ]
  },
  {
    name: "Enjoy & Groove",
    emoji: "🎸",
    tracks: [
      { t: "Electro Dopamine Rush", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
      { t: "Sunset Cruise Funk", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
      { t: "Summer Vibes Horizon", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3" },
      { t: "Weekend Escape Synth", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3" },
      { t: "Neon Beach Club Lounge", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
      { t: "Chilled Champagne Jam", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" }
    ]
  }
];

interface TimerPanelProps {
  state: AppState;
  onSetTimerMode: (min: number) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onToggleMusic: () => void;
  onSetVibe: (vibeIdx: number) => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  isPlayingMusic: boolean;
  activeVibeName: string;
  activeTrackName: string;
  onToggleProceduralSynth?: () => void;
}

export default function TimerPanel({
  state,
  onSetTimerMode,
  onToggleTimer,
  onResetTimer,
  onToggleMusic,
  onSetVibe,
  onNextTrack,
  onPrevTrack,
  isPlayingMusic,
  activeVibeName,
  activeTrackName,
  onToggleProceduralSynth
}: TimerPanelProps) {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
  };

  // Calculate circular stroke offsets for gorgeous visual radial progress
  const totalDuration = state.timer.mode * 60;
  const elapsed = totalDuration - state.timer.sec;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = totalDuration > 0 ? circumference - (elapsed / totalDuration) * circumference : circumference;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Visual Radial Countdown Timer (Takes 3 Cols on Desktop) */}
      <div className="lg:col-span-3 rounded-2xl p-6 md:p-8 bg-[#12122c] border border-indigo-500/10 shadow-xl flex flex-col items-center justify-center space-y-6">
        <div className="text-center">
          <span className="text-xs uppercase tracking-widest text-[#0bb6ae] font-mono font-black">
            {state.timer.mode >= 25 ? "🔥 FOCUS PHASE" : "☕ REST BREAK"}
          </span>
          <h2 className="text-xl font-black text-white mt-1">Pomodoro Cycle Engine</h2>
        </div>

        {/* Circular progress container */}
        <div className="relative w-56 h-56 flex items-center justify-center select-none">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background track circle */}
            <circle
              cx="112"
              cy="112"
              r={radius}
              className="stroke-slate-900 fill-none"
              strokeWidth="8"
            />
            {/* Foreground glowing stroke circle */}
            <circle
              cx="112"
              cy="112"
              r={radius}
              className="stroke-indigo-500 fill-none transition-all duration-300 drop-shadow-[0_0_12px_rgba(124,107,239,0.35)]"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Central digital timer text */}
          <div className="absolute text-center">
            <p className="text-4xl md:text-5xl font-black font-mono tracking-tight text-white">
              {formatTime(state.timer.sec)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest font-mono">
              {state.timer.running ? "ACTIVE" : "PAUSED"}
            </p>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-4">
          <button
            onClick={onResetTimer}
            className="p-3.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={onToggleTimer}
            className={`p-5 rounded-full text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ${
              state.timer.running
                ? "bg-[#e05260] shadow-[#e05260]/30 hover:bg-[#e05260]/90"
                : "bg-indigo-600 shadow-indigo-600/30 hover:bg-indigo-700"
            }`}
          >
            {state.timer.running ? <Pause size={24} /> : <Play size={24} />}
          </button>
        </div>

        {/* Preset modes selector bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-md pt-2">
          <button
            onClick={() => onSetTimerMode(25)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
              state.timer.mode === 25
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/40"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            ⏱️ 25m Focus
          </button>
          <button
            onClick={() => onSetTimerMode(5)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
              state.timer.mode === 5
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/40"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            ☕ 5m Rest
          </button>
          <button
            onClick={() => onSetTimerMode(15)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
              state.timer.mode === 15
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/40"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            🌴 15m Break
          </button>
          <button
            onClick={() => onSetTimerMode(50)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
              state.timer.mode === 50
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/40"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            🔥 50m Deep
          </button>
        </div>

        {/* Sessions indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/40 px-4 py-1.5 rounded-full border border-slate-800/60">
          🎯 Completed focus sessions today: <span className="font-bold text-indigo-400">{state.timer.sessToday}</span>
        </div>
      </div>

      {/* Lo-Fi Royalty-Free Music Platform (Takes 2 columns) */}
      <div className="lg:col-span-2 rounded-2xl p-6 md:p-8 bg-[#12122c] border border-indigo-500/10 shadow-xl flex flex-col justify-between space-y-6">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#00d4cc] font-mono tracking-wider font-bold">ROYALTY FREE • ADS FREE</span>
            <span className="text-[9px] bg-indigo-500/10 text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-indigo-500/15">Station Mode: Endless 🔀</span>
          </div>
          <h2 className="text-xl font-black text-white font-display flex items-center gap-2">
            <Music size={18} className="text-pink-400 animate-pulse" /> Study Infinite Radio
          </h2>
          <p className="text-xs text-slate-400">
            Atmospheric binaural tracks curated to optimize dopamine levels and lock in focus.
          </p>
        </div>

        {/* Continuous AI Procedural Ambient Synthesizer Engager */}
        <div className="p-3 bg-gradient-to-r from-indigo-950/45 via-purple-950/20 to-slate-900/60 border border-indigo-500/20 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌌</span>
              <div className="leading-tight">
                <h4 className="text-[11px] font-black text-white">Quantum Ambient Synth</h4>
                <p className="text-[8.5px] text-[#00d4cc] font-mono font-bold tracking-widest uppercase">ENDLESS BRAINWAVE DAMPENER</p>
              </div>
            </div>
            <button
              onClick={onToggleProceduralSynth}
              className={`px-3 py-1 rounded-full text-[9px] font-bold font-mono tracking-wider transition-all cursor-pointer ${
                state.proceduralSynth
                  ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                  : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              {state.proceduralSynth ? "ACTIVE" : "STANDBY"}
            </button>
          </div>
          <p className="text-[9.5px] text-slate-400 leading-relaxed">
            Synthesizes continuous, pure 432Hz deep-space chord clouds, warm chimes, and soft rain on-the-fly in your browser. {state.proceduralSynth ? "✔️ Normal radio bypass active." : "💡 Bypasses standard radio streams."}
          </p>
        </div>

        {/* Active Track Card Visualizer */}
        {(() => {
          const vIdx = state.vibe;
          const VIBE_CARD_THEMES = [
            { bg: "from-amber-500/10 to-[#12122c] border-amber-500/20", glow: "text-amber-400", eq: ["bg-amber-400", "bg-amber-500", "bg-yellow-400", "bg-amber-300"] }, 
            { bg: "from-cyan-500/10 to-[#12122c] border-cyan-500/20", glow: "text-cyan-400", eq: ["bg-cyan-400", "bg-cyan-300", "bg-teal-400", "bg-indigo-400"] }, 
            { bg: "from-pink-500/10 to-[#12122c] border-pink-500/20", glow: "text-pink-400", eq: ["bg-pink-400", "bg-fuchsia-500", "bg-rose-400", "bg-pink-300"] }, 
            { bg: "from-emerald-500/10 to-[#12122c] border-emerald-500/20", glow: "text-emerald-400", eq: ["bg-emerald-400", "bg-emerald-300", "bg-green-400", "bg-teal-300"] }, 
            { bg: "from-violet-500/10 to-[#12122c] border-violet-500/20", glow: "text-violet-400", eq: ["bg-violet-400", "bg-violet-300", "bg-fuchsia-400", "bg-purple-300"] }, 
            { bg: "from-rose-500/10 to-[#12122c] border-rose-500/20", glow: "text-rose-400", eq: ["bg-rose-400", "bg-rose-300", "bg-red-400", "bg-amber-400"] }
          ];
          const activeCardTheme = state.proceduralSynth 
            ? { bg: "from-indigo-550/10 to-[#0e0e22] border-indigo-500/30", glow: "text-indigo-400", eq: ["bg-indigo-400", "bg-purple-500", "bg-indigo-300", "bg-teal-400"] }
            : VIBE_CARD_THEMES[vIdx] || VIBE_CARD_THEMES[0];
          return (
            <div className={`p-5 rounded-xl bg-gradient-to-tr ${activeCardTheme.bg} border flex flex-col items-center justify-center text-center space-y-3.5 relative overflow-hidden transition-all duration-300`}>
              {isPlayingMusic && (
                <div className="absolute inset-x-0 bottom-0 h-4 flex items-center gap-0.5 justify-center overflow-hidden bg-slate-950/25 py-0.5">
                  <div className={`w-0.5 rounded animate-[bounce_0.8s_infinite_0.1s] ${activeCardTheme.eq[0]}`} style={{ height: '8px' }}></div>
                  <div className={`w-0.5 rounded animate-[bounce_1.2s_infinite_0.3s] ${activeCardTheme.eq[1]}`} style={{ height: '14px' }}></div>
                  <div className={`w-0.5 rounded animate-[bounce_0.6s_infinite_0.5s] ${activeCardTheme.eq[2]}`} style={{ height: '10px' }}></div>
                  <div className={`w-0.5 rounded animate-[bounce_1.0s_infinite_0.2s] ${activeCardTheme.eq[3]}`} style={{ height: '12px' }}></div>
                  <div className={`w-0.5 rounded animate-[bounce_0.7s_infinite_0.4s] ${activeCardTheme.eq[0]}`} style={{ height: '6px' }}></div>
                  <div className={`w-0.5 rounded animate-[bounce_1.4s_infinite_0.1s] ${activeCardTheme.eq[1]}`} style={{ height: '15px' }}></div>
                  <div className={`w-0.5 rounded animate-[bounce_0.9s_infinite_0.6s] ${activeCardTheme.eq[2]}`} style={{ height: '9px' }}></div>
                  <div className={`w-0.5 rounded animate-[bounce_1.1s_infinite_0.3s] ${activeCardTheme.eq[3]}`} style={{ height: '11px' }}></div>
                </div>
              )}
 
              {/* Dynamic Tech / Status Badge Overlays */}
              <div className="absolute top-2 right-2 text-[8px] font-mono tracking-widest uppercase flex items-center gap-1.5 opacity-65">
                <span className={`h-1.5 w-1.5 rounded-full ${state.proceduralSynth ? "bg-[#0bb6ae]" : "bg-emerald-500"} animate-pulse`}></span>
                <span>{state.proceduralSynth ? "PROD-SYNTH 432Hz" : "Stereo 48kHz"}</span>
              </div>
              <div className="absolute top-2 left-2 text-[8px] font-mono tracking-widest uppercase opacity-65">
                <span>{state.proceduralSynth ? "COGNITIVE LOCK" : `Vibe #${state.vibe + 1}`}</span>
              </div>
 
              <div className={`w-14 h-14 rounded-full bg-slate-950/80 ${activeCardTheme.glow} flex items-center justify-center text-2xl border ${activeCardTheme.bg.split(' ')[2]} shadow-lg transition-transform duration-500 hover:rotate-12`}>
                {state.proceduralSynth ? "🌌" : (VIBES[state.vibe]?.emoji || "🎧")}
              </div>
 
              <div className="space-y-1 select-none">
                <h4 className="text-sm font-bold text-white tracking-tight leading-snug px-2 truncate max-w-[280px]">
                  {state.proceduralSynth ? "Continuous 432Hz Cosmic Resonance" : (activeTrackName || "Ready to study")}
                </h4>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">
                    {state.proceduralSynth ? "Web Audio Synthesized Waveform" : (activeVibeName || "Vibe station")}
                  </span>
                  <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-black border ${
                    state.proceduralSynth 
                      ? "bg-indigo-500/20 text-[#0bb6ae] border-indigo-500/30 animate-pulse" 
                      : "bg-[#00d4cc]/10 text-[#00d4cc] border-indigo-500/20"
                  }`}>
                    {state.proceduralSynth ? "SYNTH ACTIVE" : "LIVE RX"}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Selective vibe buttons dropdown list */}
        <div className="space-y-2">
          <p className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-widest pl-1">Choose Station</p>
          <div className="grid grid-cols-2 gap-1.5">
            {VIBES.map((vibe, vIdx) => {
              const VIBE_THEMES = [
                { active: "bg-amber-500/10 text-amber-400 border-l-3 border-amber-400 font-black shadow-[0_0_12px_rgba(245,158,11,0.12)]" },
                { active: "bg-cyan-500/10 text-cyan-400 border-l-3 border-cyan-400 font-black shadow-[0_0_12px_rgba(6,182,212,0.12)]" },
                { active: "bg-pink-500/10 text-pink-400 border-l-3 border-pink-400 font-black shadow-[0_0_12px_rgba(236,72,153,0.12)]" },
                { active: "bg-emerald-500/10 text-emerald-400 border-l-3 border-emerald-400 font-black shadow-[0_0_12px_rgba(16,185,129,0.12)]" },
                { active: "bg-violet-500/10 text-violet-400 border-l-3 border-violet-400 font-black shadow-[0_0_12px_rgba(139,92,246,0.12)]" },
                { active: "bg-rose-500/10 text-rose-400 border-l-3 border-rose-400 font-black shadow-[0_0_12px_rgba(244,63,94,0.12)]" }
              ];
              const activeTheme = VIBE_THEMES[vIdx] || { active: "bg-[#0bb6ae]/15 text-[#00d4cc] border-l-3 border-[#00d4cc] font-black" };
              return (
                <button
                  key={vibe.name}
                  onClick={() => onSetVibe(vIdx)}
                  className={`text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between gap-1 transition-all border border-transparent cursor-pointer hover:scale-[1.02] ${
                    state.vibe === vIdx
                      ? activeTheme.active
                      : "bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 hover:border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>{vibe.emoji}</span>
                    <span className="truncate">{vibe.name}</span>
                  </div>
                  {state.vibe === vIdx && (
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Music timeline button control row */}
        <div className="flex items-center justify-center gap-4 pt-2 border-t border-indigo-500/10">
          <button
            onClick={onPrevTrack}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.03] rounded-lg transition-colors cursor-pointer"
            title="Previous tune"
          >
            <SkipBack size={18} />
          </button>

          <button
            onClick={onToggleMusic}
            className={`p-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              isPlayingMusic
                ? "bg-[#e05260] text-white shadow-[#e05260]/20"
                : "bg-[#00d4cc] text-[#07071a] shadow-[#00d4cc]/25"
            }`}
          >
            {isPlayingMusic ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={onNextTrack}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.03] rounded-lg transition-colors cursor-pointer"
            title="Next tune"
          >
            <SkipForward size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
