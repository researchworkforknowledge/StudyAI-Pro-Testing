import React, { useState } from "react";
import {
  Trophy,
  CheckCircle,
  Clock,
  Flame,
  Calendar,
  Trash2,
  Plus,
  BookMarked,
  HelpCircle,
  Award,
  Sparkles
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { AppState, Note, QuickTask } from "../types";

interface DashboardProps {
  state: AppState;
  onAddQuickTask: (text: string) => void;
  onToggleQuickTask: (index: number) => void;
  onDeleteQuickTask: (index: number) => void;
  onSetExamDate: (date: string) => void;
  onNavigate: (tab: string) => void;
  onPlaySound?: (soundType: 'success' | 'levelUp' | 'correct' | 'wrong' | 'click' | 'powerUp') => void;
  profileName?: string;
  onClaimBooster?: (id: string, xpValue: number) => void;
  liveLeaderboard?: any[];
}

export default function Dashboard({
  state,
  onAddQuickTask,
  onToggleQuickTask,
  onDeleteQuickTask,
  onSetExamDate,
  onNavigate,
  onPlaySound,
  profileName,
  onClaimBooster,
  liveLeaderboard
}: DashboardProps) {
  const [newtaskText, setNewtaskText] = useState("");
  const [tempExamDate, setTempExamDate] = useState(state.examDate || "");
  const claimedBoosts = state.claimedBoosts || [];

  // Render weekly chart data from stats / sessions state
  const daysOfTheWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const chartData = daysOfTheWeek.map((day, idx) => {
    const mockVal = idx === 0 ? 2.5 : idx === 1 ? 4.0 : idx === 2 ? 1.5 : idx === 3 ? 5.2 : idx === 4 ? 3.0 : idx === 5 ? 6.5 : 4.2;
    return {
      name: day,
      hours: state.sessions[day] !== undefined ? Number((state.sessions[day] / 3600).toFixed(1)) : mockVal
    };
  });

  // Calculate days until exam
  let daysRemaining = null;
  let examPercentage = 0;
  if (state.examDate) {
    const today = new Date();
    const exam = new Date(state.examDate);
    const diff = exam.getTime() - today.getTime();
    daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    examPercentage = Math.max(0, Math.min(100, 100 - (daysRemaining / 90) * 100));
  }

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newtaskText.trim()) return;
    onAddQuickTask(newtaskText.trim());
    setNewtaskText("");
  };

  const totals = {
    notes: state.notes.length,
    flashcards: state.fc.length,
    homework: state.hw.length,
    doneHomework: state.hw.filter(h => h.done).length,
    quickTasksLeft: state.qt.filter(q => !q.d).length
  };

  // Gamification formulas (XP system)
  const computedXP = Math.floor(
    (state.stats.hours || 0) * 100 + 
    (state.stats.quizzes || 0) * 50 + 
    state.notes.length * 150 + 
    state.fc.length * 30 + 
    state.stats.streak * 25
  ) + 250 + (state.extraXP || 0); 
  
  const currentLevel = Math.floor(computedXP / 500) + 1;
  const xpInCurrentLevel = computedXP % 500;
  const levelProgressPercent = Math.min(100, Math.max(5, Math.floor((xpInCurrentLevel / 500) * 100)));

  // Peer student topper leaderboard state (Live Firestore + offline fallback)
  const leaderBoardUsers = (liveLeaderboard && liveLeaderboard.length > 0)
    ? [...liveLeaderboard]
        .map((item) => ({
          name: item.name,
          xp: item.xp,
          avatar: item.avatar || "⚡",
          active: item.name === (profileName || "Syllabus Gladiator")
        }))
        .sort((a, b) => b.xp - a.xp)
    : [
        { name: "Dr. Ritika Sen (NEET UG)", xp: 3450, avatar: "🧬", active: false },
        { name: "Aarav Sharma (IIT-JEE)", xp: 2100, avatar: "🧠", active: false },
        { name: `${profileName || "You"} (Syllabus Gladiator)`, xp: computedXP, avatar: "⚡", active: true },
        { name: "Priya Deshmukh (UPSC)", xp: 1800, avatar: "🏛️", active: false },
        { name: "Anirudh Das (CAT Quant)", xp: 1200, avatar: "📈", active: false }
      ].sort((a, b) => b.xp - a.xp);

  // Topper achievements list
  const BADGES = [
    { title: "Scribe Prodigy", desc: "Craft 3+ Notes", unlocked: totals.notes >= 3, emoji: "✍️" },
    { title: "Quiz Gladiator", desc: "Clear 2+ Quizzes", unlocked: (state.stats.quizzes || 0) >= 2, emoji: "⚔️" },
    { title: "Streak Master", desc: "Day 1 Complete", unlocked: state.stats.streak >= 1, emoji: "🔥" },
    { title: "Nootropic Focus", desc: "Unlock 500+ XP", unlocked: computedXP >= 500, emoji: "🔮" }
  ];

  return (
    <div className="space-y-6">
      {/* Redesigned Glassmorphic Welcome Board */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-black border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-[0_15px_45px_rgba(124,107,239,0.1)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/[0.04] rounded-full blur-[100px] pointer-events-none"></div>

        <div className="space-y-3 relative z-10">
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-semibold border border-indigo-500/30">
              ✨ {state.board} Topper Track Enabled
            </div>
            <div className="inline-flex items-start md:items-center gap-2 px-3.5 py-1.5 rounded-2xl md:rounded-full bg-[#0bb6ae]/15 text-[#0bb6ae] font-mono text-xs font-semibold border border-[#0bb6ae]/25 leading-relaxed max-w-full shadow-[0_2px_12px_rgba(11,182,174,0.08)]">
              <span className="flex-shrink-0 text-sm">👑</span>
              <span className="break-words">
                Built Specially by <span className="text-white font-bold">Honourable Master Arhan</span>
                <span className="mx-2 opacity-40 hidden md:inline">|</span>
                <span className="block md:inline text-[10px] md:text-xs text-indigo-300 font-medium">Principal Owner & Lead Programmer</span>
              </span>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display">
            Welcome back, <span className="text-pink-400 font-black animate-pulse drop-shadow-[0_2px_10px_rgba(244,63,94,0.3)]">{profileName || "Scholar"}</span>!
          </h2>
          <p className="text-white/60 text-sm max-w-xl leading-relaxed">
            Currently synchronized with <span className="text-indigo-400 font-semibold">{state.board} Curriculum</span>,{" " }
            <span className="text-white font-semibold">Class {state.cls}</span> standard syllabus. Active subject is set to <span className="text-emerald-400 font-semibold">{state.sub}</span>.
          </p>
        </div>

        {/* Level XP Indicator */}
        <div className="flex flex-col gap-2 bg-black/40 p-5 rounded-2xl border border-white/10 min-w-[220px] relative z-10 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase tracking-widest">Level {currentLevel} Scholar</span>
            <span className="text-xs font-mono font-extrabold text-[#0bb6ae]">{computedXP} XP</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10 font-mono">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-[#0bb6ae] h-full transition-all duration-1000"
              style={{ width: `${levelProgressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[9px] text-white/45 font-mono">
            <span>{xpInCurrentLevel} XP in level</span>
            <span>{500 - xpInCurrentLevel} XP next</span>
          </div>
        </div>
      </div>

      {/* Analytical grid cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl border border-white/5 hover:border-indigo-500/35 hover:bg-white/[0.06] rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(79,70,229,0.06)]">
          <div className="p-3 rounded-xl bg-indigo-500/15 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.15)]">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider font-mono">Study Hours</p>
            <p className="text-slate-100 text-lg font-bold">
              {(state.stats.hours || 0).toFixed(1)} <span className="text-xs text-white/45 font-normal">hrs</span>
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl border border-white/5 hover:border-indigo-500/35 hover:bg-white/[0.06] rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(168,85,247,0.06)]">
          <div className="p-3 rounded-xl bg-purple-500/15 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <Trophy size={20} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider font-mono">Quizzes Done</p>
            <p className="text-slate-100 text-lg font-bold">{state.stats.quizzes || 0}</p>
          </div>
        </div>

        <div className="bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl border border-white/5 hover:border-indigo-500/35 hover:bg-white/[0.06] rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(236,72,153,0.06)]">
          <div className="p-3 rounded-xl bg-pink-500/15 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
            <BookMarked size={20} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider font-mono">Flashcards</p>
            <p className="text-slate-100 text-lg font-bold">{totals.flashcards}</p>
          </div>
        </div>

        <div className="bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl border border-white/5 hover:border-indigo-500/35 hover:bg-white/[0.06] rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(11,182,174,0.06)]">
          <div className="p-3 rounded-xl bg-[#0bb6ae]/15 text-[#0bb6ae] shadow-[0_0_15px_rgba(11,182,174,0.15)]">
            <Flame size={20} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider font-mono">Keep Streak</p>
            <p className="text-slate-100 text-lg font-bold">
              {state.stats.streak} <span className="text-xs text-white/45 font-normal">days</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column Content maps */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 text-white/70">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">Target Board Exam Countdown</h3>
                  <p className="text-xs text-white/40">Enter date to calculate remaining preparation days</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={tempExamDate}
                  onChange={(e) => {
                    setTempExamDate(e.target.value);
                    onSetExamDate(e.target.value);
                  }}
                  className="bg-[#050507] border border-white/10 rounded-full px-4 py-2 text-xs text-white outline-none focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                />
              </div>
            </div>

            {state.examDate ? (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] text-white/45 uppercase tracking-widest font-mono font-semibold">Preparation Bar</span>
                  <span className="text-base font-bold text-white">
                    {daysRemaining !== null && daysRemaining > 0 ? (
                      <span className="text-indigo-400 font-bold">{daysRemaining} Days Left</span>
                    ) : daysRemaining === 0 ? (
                      <span className="text-rose-500 animate-pulse font-bold">Exam is Today!</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">Completed</span>
                    )}
                  </span>
                </div>
                <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${examPercentage}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white/[0.01] rounded-2xl border border-dashed border-white/10 text-center text-xs text-white/40">
                Setup your board exam target date above to project a timeline.
              </div>
            )}
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-display">Time Allocation Distribution</h3>
                <p className="text-xs text-white/40 font-mono">Binaural focused block minutes weekly</p>
              </div>
              <span className="text-[10px] font-mono text-[#0bb6ae] bg-[#0bb6ae]/10 px-2.5 py-1 rounded-full border border-[#0bb6ae]/25 uppercase tracking-wider font-semibold">
                Syllabus Analytics
              </span>
            </div>

            <div className="w-full h-64 select-none min-h-[256px]">
              <ResponsiveContainer width="100%" height={256} minWidth={0}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0A0A0F", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px" }}
                    itemStyle={{ color: "#fff", fontSize: "12px" }}
                    labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: "10px" }}
                  />
                  <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={28}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 5 || index === 6 ? "#0bb6ae" : "#4f46e5"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GitHub style heatmap */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-lg space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white font-display">Cognitive Grid Focus Cell Map</h3>
              <p className="text-xs text-white/40">Dopamine tracker of completed sessions and notes</p>
            </div>

            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
              <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5">
                {Array.from({ length: 48 }).map((_, heatIdx) => {
                  const intensity = 
                    heatIdx % 9 === 0 
                      ? "bg-indigo-500/80 border-indigo-405" 
                      : heatIdx % 6 === 0 
                        ? "bg-[#0bb6ae]/70 border-[#0bb6ae]/80" 
                        : heatIdx % 4 === 0 
                          ? "bg-indigo-950 border-indigo-900/30" 
                          : "bg-white/[0.02] border-white/5";

                  return (
                    <div 
                      key={heatIdx} 
                      className={`aspect-square min-h-[22px] rounded-md border flex items-center justify-center text-[8px] font-mono hover:scale-110 transition-all cursor-pointer ${intensity}`} 
                    >
                      {heatIdx % 9 === 0 && "🔥"}
                      {heatIdx % 6 === 0 && "✓"}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-[10px] text-white/40 mt-3 font-mono">
                <span>Free Study Zone</span>
                <div className="flex gap-1.5 items-center">
                  <span>Less Load</span>
                  <div className="w-2.5 h-2.5 bg-white/5 rounded border border-white/10"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-950 rounded border border-indigo-900/40"></div>
                  <div className="w-2.5 h-2.5 bg-[#0bb6ae]/70 rounded border border-[#0bb6ae]/80"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-500/80 rounded border border-indigo-500"></div>
                  <span>Heavy focus</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right column items */}
        <div className="space-y-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-lg space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white font-display">Aspirant Leaderboard</h3>
              <p className="text-xs text-white/40">Real-time ranks of nationwide syllabus peer groups</p>
            </div>
            
            <div className="space-y-2.5 pt-1">
              {leaderBoardUsers.map((lbUser, uIdx) => (
                <div 
                  key={uIdx} 
                  className={`flex items-center justify-between p-2.5 rounded-xl border font-mono transition-transform duration-200 ${
                    lbUser.active 
                      ? "bg-indigo-500/10 border-indigo-500 text-white font-extrabold shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                      : "bg-[#0b0c10]/40 border-white/5 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">#{uIdx + 1}</span>
                    <span className="text-sm">{lbUser.avatar}</span>
                    <span className="text-xs truncate max-w-[120px]">{lbUser.name}</span>
                  </div>
                  <span className={`text-xs ${lbUser.active ? "text-[#0bb6ae]" : "text-white/60"}`}>{lbUser.xp} XP</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-lg space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white font-display">Unlocked Achievements</h3>
              <p className="text-xs text-white/40">Fulfill curriculum tasks to earn rewards</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {BADGES.map((badge, bIdx) => (
                <div 
                  key={bIdx}
                  className={`p-3 rounded-xl border flex flex-col items-center text-center justify-center space-y-1 ${
                    badge.unlocked 
                      ? "bg-purple-500/10 border-purple-500/40 text-white shadow-[0_0_10px_rgba(168,85,247,0.15)]" 
                      : "bg-white/[0.01] border-white/5 opacity-40 text-slate-400"
                  }`}
                >
                  <span className="text-lg">{badge.emoji}</span>
                  <span className="text-[10px] font-bold font-mono tracking-tight">{badge.title}</span>
                  <span className="text-[8px] text-white/45">{badge.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Honourable Master Arhan's Cosmic Dopamine Boosters Hub */}
          <div className="bg-gradient-to-br from-[#0c0c20] to-[#1a1a3a] border border-indigo-500/30 rounded-3xl p-6 shadow-[0_10px_30px_rgba(79,70,229,0.15)] space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2 relative z-10">
              <span className="text-xl">👑</span>
              <div>
                <h3 className="text-sm font-extrabold text-white font-display">Honourable Master Arhan's Cosmic Dopamine Boosters Hub</h3>
                <p className="text-[9px] text-[#00d4cc] font-mono font-bold tracking-widest uppercase">ENGINEERED BY PRINCIPAL OWNER & LEAD PROGRAMMER HONOURABLE MASTER ARHAN</p>
              </div>
            </div>
            
            <p className="text-xs text-white/60 leading-relaxed relative z-10 font-sans">
              Fire custom neurotransmitter loops by activating Honourable Master Arhan's hand-crafted StudyAI Pro routing.
            </p>

            <div className="space-y-2 relative z-10">
              {[
                { id: "api", title: "Activate StudyAI Pro Custom API", xp: "+250 XP", sub: "Inject premium micro-services bypass designed by Honourable Master Arhan", icon: "🌌", sType: "levelUp" },
                { id: "scribe", title: "Overclock Scribe Core 4.3", xp: "+150 XP", sub: "Load advanced logical reasoning clusters manually", icon: "✨", sType: "powerUp" },
                { id: "quantum", title: "Synchronize Cognitive Waves", xp: "+100 XP", sub: "Align binaural nodes for maximum mnemonic retention", icon: "🔮", sType: "success" }
              ].map((item) => {
                const claimed = claimedBoosts.includes(item.id);
                return (
                  <button
                    key={item.id}
                    disabled={claimed}
                    onClick={() => {
                      const xpVal = item.id === "api" ? 250 : item.id === "scribe" ? 150 : 100;
                      if (onClaimBooster) {
                        onClaimBooster(item.id, xpVal);
                      }
                      if (onPlaySound) {
                        onPlaySound(item.sType as any);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-2.5 relative overflow-hidden group cursor-pointer ${
                      claimed
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                        : "bg-black/40 border-white/5 text-slate-300 hover:border-pink-500/40 hover:bg-[#12122c]/65 animate-pulse"
                    }`}
                  >
                    <span className="text-base bg-white/5 p-1 rounded-lg border border-white/5">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate group-hover:text-pink-300 transition-colors">{item.title}</span>
                        <span className={`text-[8px] font-mono font-bold shrink-0 px-2 py-0.5 rounded-full ${
                          claimed ? "bg-emerald-500/20 text-emerald-300" : "bg-indigo-500/20 text-indigo-300 animate-bounce"
                        }`}>{claimed ? "CLAIMED" : item.xp}</span>
                      </div>
                      <p className="text-[9px] text-white/40 leading-tight mt-0.5">{item.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-lg space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center justify-between font-display font-black">
                <span>Quick Targets</span>
                {totals.quickTasksLeft > 0 && (
                  <span className="text-[10px] bg-white/5 text-white/60 font-mono px-2 py-0.5 rounded border border-white/10">
                    {totals.quickTasksLeft} Pending
                  </span>
                )}
              </h3>
              <p className="text-xs text-white/40">Fast check-its to track daily progress</p>
            </div>

            <form onSubmit={(e) => {
              handleTaskSubmit(e);
              if (onPlaySound) onPlaySound('click');
            }} className="flex gap-2">
              <input
                type="text"
                placeholder="What are we learning today?"
                value={newtaskText}
                onChange={(e) => setNewtaskText(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white outline-none focus:outline-none focus:border-indigo-500/50"
              />
              <button
                type="submit"
                className="p-2.5 rounded-full bg-indigo-600 hover:bg-[#7c6bef] text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </form>
 
            <div className="space-y-2 overflow-y-auto max-h-[300px]">
              {state.qt && state.qt.length > 0 ? (
                state.qt.map((task: QuickTask, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      task.d
                        ? "bg-white/[0.01] border-white/5 text-white/30 line-through"
                        : "bg-white/[0.03] border-white/10 text-white/95 hover:border-indigo-500/20"
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={task.d}
                        onChange={() => {
                          onToggleQuickTask(index);
                          if (onPlaySound) {
                            onPlaySound(task.d ? 'click' : 'success');
                          }
                        }}
                        className="w-4 h-4 rounded border-white/10 bg-transparent accent-indigo-600 cursor-pointer"
                      />
                      <span className="text-xs break-all pr-2 font-mono font-medium">{task.t}</span>
                    </label>
                    <button
                      onClick={() => {
                        onDeleteQuickTask(index);
                        if (onPlaySound) onPlaySound('wrong');
                      }}
                      className="p-1 text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-white/40 select-none">
                  📖 No quick tasks yet. Use the input bar above.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
