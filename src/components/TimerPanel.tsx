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
      { t: "Campfire Clouds", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" }
    ]
  },
  {
    name: "Rainy Vibes",
    emoji: "🌧️",
    tracks: [
      { t: "Raindrops Synth", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
      { t: "Midnight Mist Keys", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
      { t: "Thunder & Wave Guide", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
      { t: "Waterfront Serenity", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" }
    ]
  },
  {
    name: "Synthwave Focus",
    emoji: "⚡",
    tracks: [
      { t: "Retro Quantum Drive", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
      { t: "Neon Grid Runner", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" },
      { t: "Starlight Interceptor", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" },
      { t: "Solar Orbit Horizon", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3" }
    ]
  },
  {
    name: "Cosmic Nature",
    emoji: "🌲",
    tracks: [
      { t: "Forest Canopy Ambient", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3" },
      { t: "Winding Stream Waves", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3" },
      { t: "Ethereal Canyon Echoes", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3" },
      { t: "Celestial Sound Orbit", s: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3" }
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
  activeTrackName
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
          <span className="text-[10px] text-[#00d4cc] font-mono tracking-wider font-bold">ROYALTY FREE • ADS FREE</span>
          <h2 className="text-xl font-black text-white font-display flex items-center gap-2">
            <Music size={18} className="text-pink-400" /> Study Lo-Fi Player
          </h2>
          <p className="text-xs text-slate-400">Stream ambient lofi beats to retain max focus.</p>
        </div>

        {/* Active Track Card Visualizer */}
        <div className="p-5 rounded-xl bg-gradient-to-tr from-[#0a0a1f] to-[#15153a] border border-slate-800/80 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
          {isPlayingMusic && (
            <div className="absolute inset-x-0 bottom-0 h-1 flex items-center gap-0.5 justify-center overflow-hidden">
              <div className="w-1 bg-[#00d4cc] rounded animate-[bounce_1s_infinite_0.1s]" style={{ height: '10px' }}></div>
              <div className="w-1 bg-indigo-400 rounded animate-[bounce_1.2s_infinite_0.3s]" style={{ height: '18px' }}></div>
              <div className="w-1 bg-pink-400 rounded animate-[bounce_0.8s_infinite_0.5s]" style={{ height: '12px' }}></div>
              <div className="w-1 bg-[#00d4cc] rounded animate-[bounce_1.1s_infinite_0.2s]" style={{ height: '16px' }}></div>
              <div className="w-1 bg-[#7c6bef] rounded animate-[bounce_0.9s_infinite_0.4s]" style={{ height: '8px' }}></div>
            </div>
          )}

          <div className="w-14 h-14 rounded-full bg-indigo-500/10 text-[#00d4cc] flex items-center justify-center text-2xl border border-indigo-500/20">
            {VIBES[state.vibe]?.emoji || "🎧"}
          </div>

          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">{activeTrackName || "Ready to study"}</h4>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">{activeVibeName || "Vibe station"}</p>
          </div>
        </div>

        {/* Selective vibe buttons dropdown list */}
        <div className="space-y-2">
          <p className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-widest pl-1">Choose Station</p>
          <div className="grid grid-cols-2 gap-1.5">
            {VIBES.map((vibe, vIdx) => (
              <button
                key={vibe.name}
                onClick={() => onSetVibe(vIdx)}
                className={`text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  state.vibe === vIdx
                    ? "bg-[#0bb6ae]/15 text-[#00d4cc] border-l-3 border-[#00d4cc] font-black"
                    : "bg-slate-900/50 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>{vibe.emoji}</span>
                <span className="truncate">{vibe.name}</span>
              </button>
            ))}
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
