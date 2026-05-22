import React, { useState } from "react";
import { Plus, Trash2, Calendar, AlertCircle, Inbox, CheckCircle2 } from "lucide-react";
import { Homework, AppState } from "../types";

interface HomeworkPanelProps {
  state: AppState;
  onAddHW: (text: string, date: string, priority: "high" | "med" | "low") => void;
  onToggleHW: (index: number) => void;
  onDeleteHW: (index: number) => void;
}

export default function HomeworkPanel({
  state,
  onAddHW,
  onToggleHW,
  onDeleteHW
}: HomeworkPanelProps) {
  const [hwText, setHwText] = useState("");
  const [hwDate, setHwDate] = useState("");
  const [hwPriority, setHwPriority] = useState<"high" | "med" | "low">("med");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwText.trim()) return;
    const fallbackDate = hwDate || new Date().toISOString().split("T")[0];
    onAddHW(hwText.trim(), fallbackDate, hwPriority);
    setHwText("");
    setHwDate("");
    setHwPriority("med");
  };

  const totals = {
    total: state.hw.length,
    done: state.hw.filter((h) => h.done).length,
    pending: state.hw.filter((h) => !h.done).length
  };

  return (
    <div className="rounded-2xl p-6 bg-[#12122c] border border-indigo-500/10 shadow-xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-black text-white font-display flex items-center gap-2">
          <CheckCircle2 size={18} className="text-indigo-400" /> Homework & Target Tracker
        </h2>
        <p className="text-xs text-slate-400">Map out your homework, target topics, and chapter schedules to maintain consistency</p>
      </div>

      {/* Input row form */}
      <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-slate-900/60 border border-slate-900/80 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Task Name</label>
          <input
            type="text"
            placeholder="Solve NCERT Exercise 5.2 (AP)"
            value={hwText}
            onChange={(e) => setHwText(e.target.value)}
            className="w-full bg-[#07071a] border border-slate-800 focus:border-indigo-400 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Target Date</label>
          <input
            type="date"
            value={hwDate}
            onChange={(e) => setHwDate(e.target.value)}
            className="w-full bg-[#07071a] border border-slate-800 focus:border-indigo-400 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none cursor-pointer"
          />
        </div>

        <div className="space-y-1 flex flex-col justify-between">
          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Priority Status</label>
          <div className="flex gap-2">
            <select
              value={hwPriority}
              onChange={(e) => setHwPriority(e.target.value as any)}
              className="flex-1 bg-[#07071a] border border-slate-800 focus:border-indigo-400 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none cursor-pointer"
            >
              <option value="high" className="bg-[#0c0c24] text-rose-400 font-bold">🔥 High Priority</option>
              <option value="med" className="bg-[#0c0c24] text-yellow-400">⚡ Medium Priority</option>
              <option value="low" className="bg-[#0c0c24] text-cyan-400">🌱 Low Priority</option>
            </select>

            <button
              type="submit"
              disabled={!hwText.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:scale-100 text-white font-bold text-xs flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </form>

      {/* Stats counter bar */}
      <div className="flex justify-between items-center bg-black/20 px-4 py-2.5 rounded-lg border border-slate-900 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>📚 Total targets: <span className="font-extrabold text-white">{totals.total}</span></span>
          <span className="text-[#0bb6ae]">✅ Executed: <span className="font-extrabold">{totals.done}</span></span>
          <span className="text-yellow-400">⏳ Pending: <span className="font-extrabold">{totals.pending}</span></span>
        </div>
      </div>

      {/* Task list container */}
      <div className="space-y-2 overflow-y-auto max-h-[350px]">
        {state.hw && state.hw.length > 0 ? (
          state.hw.map((item: Homework, index: number) => {
            const priorityColors = {
              high: "text-rose-400 bg-rose-500/10 border-rose-500/25",
              med: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
              low: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
            };

            return (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  item.done
                    ? "bg-slate-900/30 border-slate-800 text-slate-600 line-through"
                    : "bg-slate-900/50 border-slate-800/40 text-slate-200 hover:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 pr-4">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => onToggleHW(index)}
                    className="w-5 h-5 rounded-lg border-slate-700 bg-slate-900 accent-indigo-500 cursor-pointer flex-shrink-0"
                  />
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold break-all">{item.t}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} className="text-slate-500" /> Deadline: {item.d}
                      </span>
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-mono uppercase tracking-wider font-bold ${priorityColors[item.pri]}`}>
                        {item.pri}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteHW(index)}
                  className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                  title="Remove target"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <Inbox size={20} />
            </div>
            <p className="text-xs text-slate-500 font-mono">No target homework chapters mapped. Input details above to configure trackings!</p>
          </div>
        )}
      </div>
    </div>
  );
}
