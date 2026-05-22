import React from "react";
import {
  LayoutDashboard,
  Timer,
  FileCheck,
  Zap,
  BookOpen,
  Network,
  HelpCircle,
  FolderHeart,
  Sigma,
  CheckSquare,
  MessageSquare,
  AlertTriangle,
  Globe,
  TrendingUp,
  Heart,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
  User,
  ShieldCheck
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  streak: number;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  streak
}: SidebarProps) {
  const menuItems = [
    { id: "dash", label: "Dashboard", icon: LayoutDashboard },
    { id: "timer", label: "Focus Timer", icon: Timer, badge: "Lo-Fi" },
    { id: "yoga", label: "Yoga Breaks", icon: Heart, badge: "Zen", isNew: true },
    { id: "pyq", label: "PYQs & Papers", icon: FileCheck },
    { id: "pred", label: "CBQ Oracle", icon: Zap, isNew: true },
    { id: "notes", label: "Notes Scribe", icon: BookOpen },
    { id: "mm", label: "Mind Maps", icon: Network },
    { id: "quiz", label: "AI Quizzes", icon: HelpCircle },
    { id: "fc", label: "Flash Cards", icon: FolderHeart },
    { id: "form", label: "Formula Sheet", icon: Sigma },
    { id: "hw", label: "Homework", icon: CheckSquare },
    { id: "doubts", label: "Feynman Chat", icon: MessageSquare, badge: "Voice" },
    { id: "weak", label: "Weak Areas", icon: AlertTriangle },
    { id: "res", label: "Official Portal", icon: Globe },
    { id: "strat", label: "Study Tactics", icon: TrendingUp },
    { id: "motiv", label: "Coach Uplift", icon: HeartHandshake }
  ];

  return (
    <aside
      className={`fixed top-[61px] left-0 bottom-0 z-30 flex flex-col bg-[#0A0A0F] border-r border-white/10 shadow-2xl transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Quick Streak Progress */}
      {!collapsed && (
        <div className="p-4 mx-3 my-4 bg-indigo-950/20 rounded-xl border border-indigo-500/20">
          <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-semibold font-mono">Study Streak</p>
          <p className="text-base font-bold mt-1 text-white">
            {streak} Days <span className="text-xs font-normal opacity-50">Active</span>
          </p>
          <div className="w-full bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (streak / 7) * 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative duration-150 cursor-pointer ${
                isActive
                  ? "bg-white/5 border-l-2 border-indigo-500 rounded-r-lg text-white"
                  : "text-white/60 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <Icon
                size={16}
                className={`flex-shrink-0 transition-transform ${
                  isActive ? "text-indigo-400" : "text-white/40 group-hover:text-white group-hover:scale-105"
                }`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}

              {/* Indicator Badges */}
              {!collapsed && item.badge && (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 scale-90">
                  {item.badge}
                </span>
              )}
              {!collapsed && item.isNew && (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 scale-90">
                  NEW
                </span>
              )}

              {/* Tooltip on Collapsed state */}
              {collapsed && (
                <span className="absolute left-16 bg-[#0A0A0F] text-white text-[11px] font-bold px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-white/10 pointer-events-none z-50">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile / Sync mock status */}
      <div className="p-3 border-t border-white/5 flex items-center justify-between bg-[#050507]">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-indigo-500/20 flex-shrink-0">
            AR
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Arhan M.</p>
              <p className="text-[10px] text-indigo-400 font-mono font-medium flex items-center gap-1">
                <ShieldCheck size={10} /> Active Learner
              </p>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded bg-white/[0.04] text-slate-400 hover:text-white hover:bg-[#7c6bef]/10 cursor-pointer hidden md:block"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </aside>
  );
}
