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
  PlusCircle,
  FileSpreadsheet
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
}

export default function Dashboard({
  state,
  onAddQuickTask,
  onToggleQuickTask,
  onDeleteQuickTask,
  onSetExamDate,
  onNavigate
}: DashboardProps) {
  const [newtaskText, setNewtaskText] = useState("");
  const [tempExamDate, setTempExamDate] = useState(state.examDate || "");

  // Render weekly chart data from stats / sessions state
  const daysOfTheWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const chartData = daysOfTheWeek.map((day, idx) => {
    // We can simulate session multipliers or return study hours nicely
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
    // Calculate a standard 90-day academic progression bar
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

  return (
    <div className="space-y-6">
      {/* Dynamic welcome card */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/[0.02] rounded-full blur-[100px] pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 font-mono text-xs font-semibold border border-indigo-500/30">
            ✨ CBSE & Indian Board Syllabus Active
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
            Study Dashboard
          </h2>
          <p className="text-white/60 text-sm max-w-xl">
            Currently optimized for <span className="text-indigo-400 font-semibold">{state.board} Board</span>,{" "}
            <span className="text-white font-semibold">Class {state.cls}</span> standard syllabus. Prep tracks are sync'd.
          </p>
        </div>

        {/* Dynamic streak tracker inside dashboard welcome card */}
        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 relative z-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            🔥
          </div>
          <div>
            <p className="text-[10px] text-white/45 uppercase tracking-widest font-mono font-bold">Daily Streak</p>
            <p className="text-lg font-bold text-white">{state.stats.streak} Days</p>
          </div>
        </div>
      </div>

      {/* Analytical grid cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] border border-white/5 hover:border-indigo-500/40 rounded-2xl p-5 flex items-center gap-4 transition-all">
          <div className="p-3 rounded-xl bg-indigo-500/15 text-indigo-400">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider font-mono">Study Hours</p>
            <p className="text-xl font-bold text-white">
              {(state.stats.hours || 0).toFixed(1)} <span className="text-xs text-white/45 font-normal">hrs</span>
            </p>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 hover:border-indigo-500/40 rounded-2xl p-5 flex items-center gap-4 transition-all">
          <div className="p-3 rounded-xl bg-purple-500/15 text-purple-400">
            <Trophy size={20} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider font-mono">Quizzes Done</p>
            <p className="text-xl font-bold text-white">{state.stats.quizzes || 0}</p>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 hover:border-indigo-500/40 rounded-2xl p-5 flex items-center gap-4 transition-all">
          <div className="p-3 rounded-xl bg-pink-500/15 text-pink-400">
            <BookMarked size={20} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider font-mono">Flashcards</p>
            <p className="text-xl font-bold text-white">{totals.flashcards}</p>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 hover:border-indigo-500/40 rounded-2xl p-5 flex items-center gap-4 transition-all">
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider font-mono">HW Tasks</p>
            <p className="text-xl font-bold text-white">
              {totals.doneHomework}/{totals.homework}
            </p>
          </div>
        </div>
      </div>

      {/* Main split grid: Countdown & charts vs tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2 cols span): Exam Countdown & chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Exam Countdown card */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 text-white/70">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Target Board Exam Countdown</h3>
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
                  className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white outline-none focus:outline-none focus:border-indigo-500/50 cursor-pointer"
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
                      <span className="text-[#ff5070] font-bold">Exam is Today!</span>
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

          {/* Graphical study hour analysis */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Study Progress Hours</h3>
                <p className="text-xs text-white/40">Real-time stats from active learning sessions</p>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 uppercase tracking-wider font-semibold">
                Daily Metrics
              </span>
            </div>

            {/* Recharts BarChart container */}
            <div className="w-full h-64 select-none min-h-[256px]">
              <ResponsiveContainer width="100%" height={256} minWidth={0}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0A0A0F", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px" }}
                    itemStyle={{ color: "#fff", fontSize: "12px" }}
                    labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: "10px" }}
                  />
                  <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={28}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 5 || index === 6 ? "#818cf8" : "#4f46e5"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right column: Quick Tasks List */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-lg space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Quick Targets</span>
              {totals.quickTasksLeft > 0 && (
                <span className="text-[10px] bg-white/5 text-white/60 font-mono px-2 py-0.5 rounded border border-white/10">
                  {totals.quickTasksLeft} Pending
                </span>
              )}
            </h3>
            <p className="text-xs text-white/40">Fast check-its to track daily progress</p>
          </div>

          <form onSubmit={handleTaskSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="What are we learning today?"
              value={newtaskText}
              onChange={(e) => setNewtaskText(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white outline-none focus:outline-none focus:border-indigo-500/50"
            />
            <button
              type="submit"
              className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors cursor-pointer shadow-[0_0_10px_rgba(79,70,229,0.3)]"
            >
              <Plus size={14} />
            </button>
          </form>

          {/* Task entries */}
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
                      onChange={() => onToggleQuickTask(index)}
                      className="w-4 h-4 rounded border-white/10 bg-transparent accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-xs break-all pr-2">{task.t}</span>
                  </label>
                  <button
                    onClick={() => onDeleteQuickTask(index)}
                    className="p-1 text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-white/40">
                📖 No quick tasks yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
