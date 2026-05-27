import React, { useState, useMemo } from "react";
import { useCloudProfile } from "../hooks/useCloudProfile";
import {
  Sigma,
  Copy,
  Download,
  Check,
  Globe,
  Youtube,
  Cpu,
  BookOpen,
  ListTodo,
  ExternalLink,
  Flame,
  Award,
  Sparkle,
  Sparkles,
  RefreshCw,
  Clock,
  AlertCircle,
  Plus,
  Compass,
  Heart,
  Eye,
  Activity,
  Flame as BurnIcon
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import { AppState } from "../types";

interface StaticReferencePanelsProps {
  state: AppState;
  activeSection: "form" | "res" | "strat" | "motiv" | "weak" | "yoga";
  onCallAI: (prompt: string, persona: string) => Promise<string | null>;
  onAddHW: (text: string, date: string, priority: "high" | "med" | "low") => void;
  onNavigate: (tab: string) => void;
  onUpdateStats: (updater: (prev: AppState["stats"]) => AppState["stats"]) => void;
}

export default function StaticReferencePanels({
  state,
  activeSection,
  onCallAI,
  onAddHW,
  onNavigate,
  onUpdateStats
}: StaticReferencePanelsProps) {
  // --- 1. Formula Sheet States ---
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [aiFormulaLoading, setAiFormulaLoading] = useState(false);
  const formulaSyllabus: { [key: string]: string } = {
    Mathematics: `━━ ALGEBRA formulas ━━
• Quadratic Formula: x = (-b ± √(b² - 4ac)) / 2a
• AP nth term: an = a + (n-1)d
• AP Sum: Sn = n/2 * [2a + (n-1)d]
• GP nth term: an = ar^(n-1)
• GP Sum: Sn = a(r^n - 1) / (r - 1)

━━ TRIGONOMETRY ━━
• Identities:
  sin²θ + cos²θ = 1
  1 + tan²θ = sec²θ
  1 + cot²θ = cosec²θ
• Values:
  sin30° = 1/2, cos30° = √3/2, tan30° = 1/√3
  sin45° = 1/√2, cos45° = 1/√2, tan45° = 1
  sin60° = √3/2, cos60° = 1/2, tan60° = √3

━━ COORDINATE GEOMETRY ━━
• Distance formula: d = √((x₂ - x₁)² + (y₂ - y₁)²)
• Midpoint formula: M = ((x1 + x2)/2 , (y1 + y2)/2)
• Section formula: P = ((mx2 + nx1)/(m+n) , (my2 + ny1)/(m+n))

━━ MENSURATION ━━
• Circle Area: A = πr², Perimeter: C = 2πr
• Sphere Surface Area: SA = 4πr², Volume: V = (4/3)πr³
• Cylinder volume: V = πr²h, Curved Surface Area: CSA = 2πrh`,

    Physics: `━━ CLASS 10 MOTION & LAWS ━━
• Equations of Motion:
  1. v = u + at
  2. s = ut + (1/2)at²
  3. v² = u² + 2as
  4. s = [(u + v)/2] * t
• Newton's Second Law: F = ma
• Linear momentum: p = mv

━━ ELECTRICITY formulas ━━
• Ohm's Law: V = IR (V = Volts, I = Current, R = Resistance)
• Power Formulas: P = VI = I²R = V²/R
• Electrical Energy: E = P * t = V * I * t
• Resistances in Series: R_total = R₁ + R₂ + R₃
• Resistances in Parallel: 1/R_total = 1/R₁ + 1/R₂ + 1/R₃

━━ LIGHT & OPTICS ━━
• Mirror Formula: 1/f = 1/v + 1/u (f = focal length, v = image distance, u = object distance)
• Lens Formula: 1/f = 1/v - 1/u
• Magnification: m = v/u = h'/h
• Snell's Law: n₁ * sin(θ₁) = n₂ * sin(θ₂)`,

    Chemistry: `━━ BASIC REACTION PATHWAYS ━━
• Photosynthesis: 6CO₂ + 6H₂O + sunlight → C₆H₁₂O₆ + 6O₂
• Aerobic Respiration: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 38 ATP
• Neutralisation Reaction: Acid + Base → Salt + Water

━━ ACID-BASE BLUEPRINT ━━
• pH scale limits: 0-6 Acidic | 7 Neutral | 8-14 Basic
• Strong acid: Hydrochloric acid (HCl), Sulphuric acid (H₂SO₄)
• Strong base: Sodium hydroxide (NaOH), Potassium hydroxide (KOH)

━━ MOLE CALCULATIONS ━━
• Moles number: n = mass (g) / molar mass (g/mol)
• Avogadro Constant: N_A = 6.022 * 10²³ molecules/mole
• Molarity index: M = moles / volume of solution (L)`
  };

  const handleCopyFormulas = () => {
    const textToCopy = state.stats.aiFormulae?.[state.sub] || formulaSyllabus[state.sub] || formulaSyllabus.Mathematics;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleGenerateAIFormula = async () => {
    setAiFormulaLoading(true);
    const result = await onCallAI(
      `Act as an elite textbook compiler and academic dean. Compose a highly comprehensive, incredibly beautiful, formatted formula guide and summary cheat-sheet for Board/System: ${state.board}, Class/Grade: ${state.cls}, Subject: ${state.sub}. Provide clear physical constants, key theorems, chemical kinetics, physical dimension tables, core equations, memory mnemonics, and typical examiner tips. Output directly the final guide in clean, high-contrast text layout with section dividers.`,
      "form"
    );
    if (result) {
      onUpdateStats((prev) => ({
        ...prev,
        aiFormulae: {
          ...(prev.aiFormulae || {}),
          [state.sub]: result
        }
      }));
    }
    setAiFormulaLoading(false);
  };

  // --- 2. Resources Tab States ---
  const [selectedEmbedUrl, setSelectedEmbedUrl] = useState("https://ncert.nic.in");
  const recommendedChannels = [
    { name: "CBSE Class 10/12 Guru", desc: "Expert animations of Physics and Chemistry pathways.", url: "https://www.youtube.com" },
    { name: "Khan Academy India", desc: "World-class step-by-step calculus and science classes.", url: "https://www.youtube.com" },
    { name: "Doubtnut Portal", desc: "Instant doubt solving and whiteboard video classes.", url: "https://www.youtube.com" },
    { name: "Physics Wallah", desc: "Affordable high-fidelity interactive Indian board courses.", url: "https://www.youtube.com" }
  ];

  // --- 3. Motivation Workspace States ---
  const [motivateOutput, setMotivateOutput] = useState<string | null>(null);
  const [motivateLoading, setMotivateLoading] = useState(false);

  const handleAIUplift = async () => {
    setMotivateLoading(true);
    const result = await onCallAI(
      "Draft an incredibly empathetic, personalized 150-word motivational speech addressing standard cbse students exam anxiety and telling them they are fully capable of heroic legendary focus.",
      "motiv"
    );
    if (result) setMotivateOutput(result);
    setMotivateLoading(false);
  };

  // --- 4. Weak Area Recovery Coach states ---
  const [chosenWeakSub, setChosenWeakSub] = useState("Trigonometric Identities");
  const [recoveryOutput, setRecoveryOutput] = useState<string | null>(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // New sub-tabs inside Weak Areas section
  const [weakSubTab, setWeakSubTab] = useState<"academic" | "yoga">("academic");

  // Yoga break states
  const [breakNeed, setBreakNeed] = useState("stress"); // stress, eyes, posture, energy
  const [customYogaNeed, setCustomYogaNeed] = useState("");
  const [aiYogaOutput, setAiYogaOutput] = useState<string | null>(null);
  const [aiYogaLoading, setAiYogaLoading] = useState(false);

  const handleGenYogaBreak = async () => {
    setAiYogaLoading(true);
    setAiYogaOutput(null);
    let needText = "Mental Fatigue & Exam Stress Relief";
    if (breakNeed === "eyes") needText = "Eye-strain and Screen Rejuvenation";
    if (breakNeed === "posture") needText = "Lower back stiffness and sitting posture correction";
    if (breakNeed === "energy") needText = "Low energy slump & fast blood-circulation recharge";
    
    let combinedNeed = needText;
    if (customYogaNeed.trim()) {
      combinedNeed = `${needText} coupled with: "${customYogaNeed.trim()}"`;
    }
    
    const result = await onCallAI(
      `Deliver a wholesome, highly tailored physical study break yogic tutorial plan specifically designed to treat: "${combinedNeed}". Provide exact step by step guidelines, simple Sanskrit pose name (Siddha Yoga equivalent), mental/physical concentration areas, and breathing triggers. Insert a short 'Siddha Wisdom Accent' bullet point with yogic insights. Keep the tone calm, soothing, and fully instructional.`,
      "yoga"
    );
    if (result) setAiYogaOutput(result);
    setAiYogaLoading(false);
  };

  const { profile } = useCloudProfile();

  // Dynamic calculated subject proficiency metrics for the Recharts Radar Chart
  const subjectProficiencyData = useMemo(() => {
    if (profile && profile.subjectPerformanceIndex) {
      // Use live firebase datastore mapped correctly
      return [
        { 
          subject: "Physics", 
          fullName: "Physics", 
          Proficiency: Math.max(10, profile.subjectPerformanceIndex.physics?.weightedScore || 45), 
          Target: Math.min(100, Math.max(10, profile.subjectPerformanceIndex.physics?.weightedScore || 45) + 15), 
          fullMark: 100 
        },
        { 
          subject: "Chemistry", 
          fullName: "Chemistry", 
          Proficiency: Math.max(10, profile.subjectPerformanceIndex.chemistry?.weightedScore || 50), 
          Target: Math.min(100, Math.max(10, profile.subjectPerformanceIndex.chemistry?.weightedScore || 50) + 15), 
          fullMark: 100 
        },
        { 
          subject: "Maths", 
          fullName: "Mathematics", 
          Proficiency: Math.max(10, profile.subjectPerformanceIndex.mathematics?.weightedScore || 60), 
          Target: Math.min(100, Math.max(10, profile.subjectPerformanceIndex.mathematics?.weightedScore || 60) + 15), 
          fullMark: 100 
        },
        { 
          subject: "Biology", 
          fullName: "Biology", 
          Proficiency: Math.max(10, profile.subjectPerformanceIndex.biology?.weightedScore || 55), 
          Target: Math.min(100, Math.max(10, profile.subjectPerformanceIndex.biology?.weightedScore || 55) + 15), 
          fullMark: 100 
        }
      ];
    }
    
    // Legacy fallback
    const quizzes = state.stats.quizzes || 0;
    const streak = state.stats.streak || 0;
    const hours = state.stats.hours || 0;

    const baselineSubjects = [
      { name: "Maths", label: "Mathematics", base: 64, multiplier: 3.5 },
      { name: "Physics", label: "Physics", base: 60, multiplier: 3.0 },
      { name: "Chemistry", label: "Chemistry", base: 68, multiplier: 3.0 },
      { name: "Biology", label: "Biology", base: 55, multiplier: 2.5 }
    ];

    return baselineSubjects.map((sub) => {
      // Check if current active subject matches this item
      const isActive = state.sub.toLowerCase().includes(sub.name.toLowerCase()) || 
                       state.sub.toLowerCase().includes(sub.label.toLowerCase());
      const subjectBoost = isActive ? 10 : 0;

      // Base formula: baseline + quizzes completed * multiplier + streak * 1.5 + hours studied * 0.8 + active subject boost
      const score = Math.round(
        Math.min(
          100,
          Math.max(
            35,
            sub.base + (quizzes * sub.multiplier) + (streak * 1.5) + (hours * 0.8) + subjectBoost
          )
        )
      );

      // Study target is always slightly higher to represent a student's high potential goal
      const target = Math.round(Math.min(100, score + 12));

      return {
        subject: sub.name,
        fullName: sub.label,
        Proficiency: score,
        Target: target,
        fullMark: 100
      };
    });
  }, [state.stats.quizzes, state.stats.streak, state.stats.hours, state.sub, profile]);

  const handleGenRecovery = async () => {
    setRecoveryLoading(true);
    setRecoveryOutput(null);
    const result = await onCallAI(
      `Formulate a tailored day-by-day 3-day recovery plan to master my weak subject topic: "${chosenWeakSub}". Enforce specific realistic hour targets and lists of self-assessment milestones.`,
      "weak"
    );
    if (result) setRecoveryOutput(result);
    setRecoveryLoading(false);
  };

  // Render Panel Sections
  switch (activeSection) {
    case "form":
      const customAiSheet = state.stats.aiFormulae?.[state.sub];
      return (
        <div className="rounded-2xl p-6 bg-[#0c0c24] border border-indigo-500/15 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle background cosmic glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-650/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-500/10 pb-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full">
                  {state.board} • {state.cls === "9" || state.cls === "10" || state.cls === "11" || state.cls === "12" ? `Class ${state.cls}` : state.cls}
                </span>
                {customAiSheet && (
                  <span className="text-[10px] uppercase font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <Sparkles size={10} /> AI Powered
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-white font-display flex items-center gap-2 mt-1">
                <Sigma size={18} className="text-[#0bb6ae]" /> Formula & Cheat Sheets
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Active core equations, pathway constants, and theorems for <span className="text-indigo-400 font-bold">{state.sub}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <button
                onClick={handleGenerateAIFormula}
                disabled={aiFormulaLoading}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-slate-800 disabled:to-slate-800 text-xs font-black text-white rounded-full flex items-center gap-1.5 transition-all select-none cursor-pointer shadow-lg shadow-indigo-500/10 hover:scale-[1.03] active:scale-95 duration-200"
              >
                {aiFormulaLoading ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {customAiSheet ? "Re-Generate with AI" : "Generate with AI"}
              </button>

              <button
                onClick={handleCopyFormulas}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-350 hover:text-white rounded-full flex items-center gap-1.5 transition-all select-none hover:border-slate-650 cursor-pointer"
              >
                {copiedSubject ? <Check size={14} className="text-emerald-400" /> : <Copy size={13} />}
                {copiedSubject ? "Copied!" : "Quick Copy"}
              </button>
            </div>
          </div>

          {aiFormulaLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                  <Sigma size={16} className="animate-pulse" />
                </div>
              </div>
              <div className="space-y-1 text-center bg-slate-900/40 p-4 rounded-xl max-w-md mx-auto">
                <p className="text-sm font-semibold text-white animate-pulse">Assembling Godly Formula Sheet...</p>
                <p className="text-[11px] text-slate-500 font-mono">Consulting school examiners, compiling physical constants, structuring mnemonics...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {customAiSheet ? (
                <div className="p-5 rounded-2xl bg-slate-950/95 border-2 border-indigo-500/20 font-mono text-xs leading-relaxed space-y-4 max-h-[460px] overflow-y-auto whitespace-pre-line text-[#d4effc] uppercase tracking-normal select-text shadow-inner">
                  <div className="flex justify-between items-center text-slate-500 font-sans font-bold border-b border-white/5 pb-2.5 mb-2 text-[10px] tracking-wider uppercase">
                    <span>⚡ Dynamic AI-Synthesized Knowledge Grid</span>
                    <span className="text-indigo-400">STATUS: VERIFIED BY STUDYAI PRO</span>
                  </div>
                  <div>{customAiSheet}</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[11px] text-slate-300 leading-relaxed font-sans flex items-start gap-3">
                    <span className="text-indigo-400 text-base">💡</span>
                    <div>
                      <span className="font-extrabold text-white">Unlock Godly Study Guides:</span> Hit the <span className="text-indigo-300 font-black">"Generate with AI"</span> button above to dynamically assemble an industry-beating reference catalog of high-scoring topics, standard chemical equations, units, derivations, and memorization tips calibrated on modern exam formats!
                    </div>
                  </div>
                  <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-900/60 font-mono text-xs leading-relaxed max-h-[440px] overflow-y-auto whitespace-pre-line text-[#00d4cc] uppercase tracking-normal">
                    {formulaSyllabus[state.sub] || formulaSyllabus.Mathematics}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );

    case "res":
      return (
        <div className="space-y-6">
          <div className="rounded-2xl p-6 bg-[#12122c] border border-indigo-500/10 shadow-xl space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white font-display flex items-center gap-2">
                <img src="/favicon.svg" alt="StudyAI Logo" className="w-[18px] h-[18px] object-contain filter drop-shadow-[0_0_4px_rgba(56,189,248,0.5)]" /> Stay-On-Site Portal
              </h2>
              <p className="text-xs text-slate-400">Open authentic NCERT textbooks and syllabus models right inside your StudyAI workspace</p>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedEmbedUrl}
                onChange={(e) => setSelectedEmbedUrl(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-4 py-2 text-xs text-slate-100 outline-none cursor-pointer focus:border-indigo-400"
              >
                <option value="https://ncert.nic.in" className="bg-[#0c0c24]">NCERT Official Catalog Portal</option>
                <option value="https://cbseacademic.nic.in" className="bg-[#0c0c24]">CBSE Academic Portals</option>
                <option value="https://diksha.gov.in" className="bg-[#0c0c24]">DIKSHA Digital Classroom</option>
              </select>
              <a
                href={selectedEmbedUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-full text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer select-none"
              >
                External <ExternalLink size={12} />
              </a>
            </div>

            {/* Simulated Stay-On-Site view container */}
            <div className="w-full h-80 rounded-xl bg-slate-950 border border-slate-900 overflow-hidden flex flex-col justify-center items-center p-6 text-center space-y-4 relative">
              <div className="absolute inset-x-0 top-0 bg-slate-900 px-3 py-1.5 border-b border-slate-950 text-[10px] font-mono text-slate-500 text-left">
                Browsing: {selectedEmbedUrl}
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 text-lg">
                ⚠️
              </div>
              <div className="space-y-1 max-w-sm">
                <p className="text-xs font-extrabold text-[#00d4cc]">Refused Iframe Connection Header</p>
                <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                  Official boards (CBSE/NCERT) prohibit rendering inside iframe containers to defend against click jacking! Click the **External** button top right to launch portal securely in new tab.
                </p>
              </div>
            </div>
          </div>

          {/* YouTube channels list */}
          <div className="rounded-2xl p-6 bg-[#12122c] border border-indigo-500/10 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white font-display uppercase tracking-tight flex items-center gap-2">
              <Youtube size={16} className="text-rose-500" /> Class 9-12 Recommended Channels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedChannels.map((ch, idx) => (
                <a
                  key={idx}
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-indigo-500/20 text-xs hover:bg-[#7c6bef]/5 transition-all block space-y-1 group"
                >
                  <div className="flex justify-between items-center text-[#00d4cc] font-bold group-hover:text-white transition-colors">
                    <span>{ch.name}</span>
                    <ExternalLink size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-slate-500 text-[11px] font-sans font-medium">{ch.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      );

    case "strat":
      return (
        <div className="space-y-6">
          {/* Tactic schedule summary */}
          <div className="rounded-2xl p-6 bg-[#12122c] border border-indigo-500/10 shadow-xl space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white font-display flex items-center gap-2">
                <Cpu size={18} className="text-indigo-400" /> Tactics & Tutors schedulers
              </h2>
              <p className="text-xs text-slate-400">Generates study blueprints customized exactly to CBSE class 9-12 guidelines</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-slate-900 space-y-1">
                <h4 className="text-xs font-black text-indigo-400 uppercase font-mono">📅 Timetable schedule</h4>
                <p className="text-[11px] text-slate-400">Auto-organizes weekly modules. Ensures ample downtime balance</p>
              </div>
              <div className="p-4 rounded-xl bg-[#0ebb6ae]/5 border border-slate-900 space-y-1">
                <h4 className="text-xs font-black text-[#0bb6ae] uppercase font-mono">📊 priority mapping</h4>
                <p className="text-[11px] text-slate-400">Identifies high scoring, frequently recurring chapter topics</p>
              </div>
              <div className="p-4 rounded-xl bg-pink-500/5 border border-slate-900 space-y-1">
                <h4 className="text-xs font-black text-pink-400 uppercase font-mono">🧠 recalling methods</h4>
                <p className="text-[11px] text-slate-400">Integrates active testing (MCQ testing) and visual mapping revision</p>
              </div>
            </div>

            <div className="pt-4 text-center">
              <button
                onClick={() => onNavigate("dash")}
                className="px-6 py-2.5 rounded-full bg-[#00d4cc] hover:bg-[#00d4cc]/90 text-[#07071a] font-extrabold text-xs transition-transform hover:scale-105"
              >
                Assemble Timetable schedules
              </button>
            </div>
          </div>
        </div>
      );

    case "weak":
      return (
        <div className="rounded-2xl p-4 md:p-6 bg-[#0c0c24] border border-indigo-500/15 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Section title & control header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white font-display flex items-center gap-2">
                <AlertCircle className="text-rose-400" size={18} /> Mind-Body Synergy & Weakness Patch
              </h2>
              <p className="text-xs text-slate-400">
                Visualize active subject proficiency, repair weak topics with AI schemas, or take high-vibe yogic breaks
              </p>
            </div>

            {/* Sub-tab segment buttons */}
            <div className="flex bg-slate-950/80 p-0.5 rounded-full border border-slate-900 self-start md:self-auto select-none">
              <button
                onClick={() => setWeakSubTab("academic")}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  weakSubTab === "academic"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/10"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🎯 Academic Radar
              </button>
              <button
                onClick={() => setWeakSubTab("yoga")}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  weakSubTab === "yoga"
                    ? "bg-gradient-to-r from-[#7c6bef] to-[#d94d96] text-white shadow-md shadow-pink-500/10"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🧘‍♀️ Yogic Study Breaks
              </button>
            </div>
          </div>

          {weakSubTab === "academic" ? (
            <div className="space-y-6">
              {/* Radar Chart Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Recharts container panel */}
                <div className="lg:col-span-3 p-5 rounded-2xl bg-slate-950/60 border border-slate-900/60 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold uppercase text-indigo-400 tracking-widest">
                      Visual Competency Mapping
                    </span>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5 font-display">
                      <Activity size={14} className="text-[#0bb6ae]" /> Subject Proficiency Web
                    </h3>
                  </div>

                  {/* Recharts responsive stage */}
                  <div className="w-full h-72 md:h-80 flex items-center justify-center font-sans min-h-[288px]">
                    <ResponsiveContainer width="100%" height={288} minWidth={0}>
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={subjectProficiencyData}>
                        <PolarGrid stroke="#1e1b4b" strokeWidth={1} />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                        />
                        <PolarRadiusAxis 
                          angle={30} 
                          domain={[0, 100]} 
                          tick={{ fill: '#475569', fontSize: 8 }}
                          stroke="#1e293b"
                        />
                        <Radar
                          name="Current Proficiency"
                          dataKey="Proficiency"
                          stroke="#6366f1"
                          fill="#6366f1"
                          fillOpacity={0.25}
                        />
                        <Radar
                          name="Study Target Goal"
                          dataKey="Target"
                          stroke="#14b8a6"
                          fill="#14b8a6"
                          fillOpacity={0.06}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#030308',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#e2e8f0',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px', marginTop: '10px', color: '#94a3b8' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1.5 border-t border-white/5 pt-3.5">
                    <span>💡 Dynamic index: Completed: {state.stats.quizzes || 0} quizzes • Active streak: {state.stats.streak || 0} days</span>
                  </div>
                </div>

                {/* Subject numeric detail cards */}
                <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-950/60 border border-slate-900/60 flex flex-col justify-between">
                  <div className="space-y-1 mb-4">
                    <span className="text-[9px] font-mono font-bold uppercase text-rose-400 tracking-widest">
                      Quantitative Scores
                    </span>
                    <h3 className="text-sm font-black text-white font-display">
                      Subject Performance Index
                    </h3>
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto max-h-[290px] pr-1 scrollbar-thin">
                    {subjectProficiencyData.map((item, idx) => {
                      const isActiveSub = state.sub.toLowerCase().includes(item.subject.toLowerCase()) || 
                                          state.sub.toLowerCase().includes(item.fullName.toLowerCase());
                      return (
                        <div key={idx} className={`p-3 rounded-xl border transition-all ${
                          isActiveSub 
                            ? "bg-indigo-500/5 border-indigo-500/35 shadow-[0_0_15px_rgba(99,102,241,0.06)]" 
                            : "bg-slate-900/30 border-slate-900"
                        }`}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              {isActiveSub && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block"></span>}
                              {item.fullName}
                            </span>
                            <span className={`text-xs font-mono font-bold ${
                              item.Proficiency >= 80 ? "text-emerald-400" : item.Proficiency >= 65 ? "text-indigo-300" : "text-amber-400"
                            }`}>
                              {item.Proficiency}%
                            </span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                item.Proficiency >= 80 
                                  ? "bg-gradient-to-r from-teal-500 to-emerald-400" 
                                  : item.Proficiency >= 65 
                                    ? "bg-gradient-to-r from-indigo-500 to-indigo-400" 
                                    : "bg-gradient-to-r from-amber-500 to-rose-400"
                              }`}
                              style={{ width: `${item.Proficiency}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-1">
                            <span>Base Target: {item.Target}%</span>
                            <span>{isActiveSub ? "Active Focus" : "Subject Track"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors p-3.5 rounded-xl border border-indigo-500/10 text-[10px] text-slate-300 font-sans mt-4 leading-relaxed">
                     ⚡ <span className="font-bold text-white">How to boost proficiency:</span> Completing chapter quizzes, multiplying daily learning streak trackers, and accumulating dashboard study sessions immediately raises your visual proficiency coordinates!
                  </div>
                </div>
              </div>

              {/* Recovery Coach input row */}
              <div className="p-4 md:p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white font-display flex items-center gap-1.5">
                      <BurnIcon className="text-rose-400" size={14} /> AI Study Recovery Coach
                    </h3>
                    <p className="text-xs text-slate-400">
                      Construct immediate conceptual recovery plans for weak subjects before formal board tests
                    </p>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Topic text (e.g. Electric potential)..."
                      value={chosenWeakSub}
                      onChange={(e) => setChosenWeakSub(e.target.value)}
                      className="flex-1 sm:flex-none bg-slate-950 border border-slate-850 rounded-full px-4 py-2 text-xs text-slate-100 outline-none focus:border-indigo-400 w-full sm:w-56"
                    />
                    <button
                      onClick={handleGenRecovery}
                      disabled={recoveryLoading || !chosenWeakSub.trim()}
                      className="px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:scale-100 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all select-none duration-150 shrink-0"
                    >
                      {recoveryLoading ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
                      Repair Topic
                    </button>
                  </div>
                </div>

                {recoveryLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-slate-950/40 rounded-xl border border-slate-900 border-dashed">
                    <RefreshCw className="animate-spin text-[#00d4cc]" size={28} />
                    <p className="text-xs text-slate-500 font-mono tracking-wide animate-pulse">Formulating custom schedules, mapping references, assigning foundation hours...</p>
                  </div>
                ) : recoveryOutput ? (
                  <div className="space-y-4">
                    <div className="p-5 rounded-xl bg-slate-950 border border-slate-900 font-mono text-xs leading-relaxed space-y-4 max-h-[380px] overflow-y-auto whitespace-pre-line text-slate-200">
                      <div className="flex justify-between items-center text-slate-500 font-sans font-bold border-b border-white/5 pb-2.5">
                        <span>3-DAY RECOVERY ROADMAP</span>
                        <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-400/25 uppercase tracking-widest font-black">
                          High intensity
                        </span>
                      </div>
                      <div>{recoveryOutput}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-400">
                      <span>📅 Keep this recovery roadmap tracked on your homework checklists?</span>
                      <button
                        onClick={() => {
                          onAddHW(`Practice roadmap: ${chosenWeakSub}`, new Date().toISOString().split("T")[0], "high");
                          alert("Added 3-day recovery roadmap target as a High Priority Homework checkpoint!");
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold tracking-tight text-[11px] transition-colors cursor-pointer w-full sm:w-auto text-center"
                      >
                        Sync to Checklist
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-xs text-slate-500 bg-slate-950/20 rounded-xl border border-slate-900/60 max-w-sm mx-auto">
                    ⏳ Type a topic name and hit **Repair Topic** to generate an immediate day-by-day coaching blueprint mapped to NCERT chapters!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Yoga / Asanas Study Break interface */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Left controls: choose fatigue type & generate AI breaks */}
                <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-950/60 border border-slate-900/60 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-bold uppercase text-pink-400 tracking-widest">
                      Mind-Body Healing Portals
                    </span>
                    <h3 className="text-md font-black text-white font-display flex items-center gap-1.5">
                      <Compass size={16} className="text-pink-400" /> Siddha Yogic break AI Coach
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Counter study exhaustions! Spending 5-10 minutes stretching with specific breathing focus points completely resets your hemispheric neurons.
                    </p>
                  </div>

                  <div className="space-y-4 py-2">
                    {/* Discomfort selection label */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Select Active Fatigue Symptoms</label>
                      <select
                        value={breakNeed}
                        onChange={(e) => setBreakNeed(e.target.value)}
                        className="w-full bg-[#0a0a22] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-pink-500 cursor-pointer"
                      >
                        <option value="stress">🧘‍♀️ Mental Strain & Exam Anxiety Relief</option>
                        <option value="eyes">👁️ Eye Pain & Multi-hour Screen Fatigue</option>
                        <option value="posture">🪑 Stiff Back & Slouched Posture stretch</option>
                        <option value="energy">⚡ Drowsiness & Mid-day Study Slump booster</option>
                      </select>
                    </div>

                    <button
                      onClick={handleGenYogaBreak}
                      disabled={aiYogaLoading}
                      className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#7c6bef] to-[#d94d96] text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-pink-500/20 active:scale-95 hover:scale-[1.02] duration-200 select-none"
                    >
                      {aiYogaLoading ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                      Synthesize Fluid Yoga Ritual
                    </button>
                  </div>

                  <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 text-[9px] text-slate-400 leading-relaxed font-mono">
                    ⚠️ <span className="font-bold text-rose-300">Safety Guard:</span> Never hold breath to discomfort. Perform stretches slowly with stable support.
                  </div>
                </div>

                {/* Right outcome display: generated/tutorial guides */}
                <div className="lg:col-span-3 p-5 rounded-2xl bg-slate-950/60 border border-slate-900/60 flex flex-col justify-between min-h-[360px]">
                  {aiYogaLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 space-y-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-pink-500/20 border-t-pink-500 animate-spin"></div>
                        <span className="absolute inset-0 flex items-center justify-center text-pink-400 text-sm">🧘‍♀️</span>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-xs font-bold text-white animate-pulse">Structuring ancient yogic pathways...</p>
                        <p className="text-[10px] text-slate-500 font-mono">Channeling breathing frequencies, pacing transition tutorials, compiling safety checklines...</p>
                      </div>
                    </div>
                  ) : aiYogaOutput ? (
                    <div className="flex-1 space-y-4 flex flex-col justify-between">
                      <div className="p-4 rounded-xl bg-slate-950 font-sans text-xs leading-relaxed space-y-3 max-h-[290px] overflow-y-auto whitespace-pre-line text-slate-200 select-text scrollbar-thin">
                        <div className="flex justify-between items-center text-slate-400 font-sans font-bold border-b border-white/5 pb-2 mb-2 text-[10px] tracking-wider">
                          <span>🔮 TAXI-SYNTHeSIZED YOGA FLUIDITY</span>
                          <span className="text-pink-400 font-black">ACTIVE STUDY BREAK</span>
                        </div>
                        <div>{aiYogaOutput}</div>
                      </div>
                      <button
                        onClick={() => setAiYogaOutput(null)}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Reset Guide
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold uppercase text-emerald-400 tracking-widest">
                          Siddha Offline Manual
                        </span>
                        <h3 className="text-sm font-black text-white font-display">
                          Classic Break Postures
                        </h3>
                      </div>

                      {/* Offline direct posture list cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                        <div className="p-3.5 rounded-xl bg-[#0a0a20] border border-slate-900 space-y-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">🪑</span>
                            <span className="text-xs font-black text-white">Trikonasana</span>
                          </div>
                          <span className="text-[8px] uppercase tracking-wider bg-indigo-500/10 text-indigo-300 font-bold px-1.5 py-0.5 rounded">Triangle Pose</span>
                          <p className="text-[10px] text-slate-400 font-sans leading-snug">
                            **Steps**: Standard stance, slide right hand down right leg, raise left hand high towards roof. Watch left palm.
                          </p>
                          <span className="text-[9px] text-[#00d4cc] block font-mono">Focus: Spine stretch & deep respiration</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#0a0a20] border border-slate-900 space-y-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">🧠</span>
                            <span className="text-xs font-black text-white">Anulom Vilom</span>
                          </div>
                          <span className="text-[8px] uppercase tracking-wider bg-rose-500/10 text-rose-300 font-bold px-1.5 py-0.5 rounded">Alternate Breathing</span>
                          <p className="text-[10px] text-slate-400 font-sans leading-snug">
                            **Steps**: Sit cross-legged. Use thumb to close right nostril, inhale left. Close left with ring finger, exhale right. Run 2 minutes.
                          </p>
                          <span className="text-[9px] text-[#00d4cc] block font-mono">Focus: Oxygen multiplier & focus balance</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#0a0a20] border border-slate-900 space-y-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">🧘‍♀️</span>
                            <span className="text-xs font-black text-white">Balasana</span>
                          </div>
                          <span className="text-[8px] uppercase tracking-wider bg-[#0bb6ae]/15 text-[#00d4cc] font-bold px-1.5 py-0.5 rounded">Child's Pose</span>
                          <p className="text-[10px] text-slate-400 font-sans leading-snug">
                            **Steps**: Kneel down, sit on heels, bend head forward to touch ground. Stretch arms straight/laid back. Stay for 5 deep breaths.
                          </p>
                          <span className="text-[9px] text-[#0bb6ae] block font-mono">Focus: Nervous soothing & stress grounding</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#0a0a20] border border-slate-900 space-y-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">👁️</span>
                            <span className="text-xs font-black text-white">Netranjali Eye Yoga</span>
                          </div>
                          <span className="text-[8px] uppercase tracking-wider bg-amber-500/10 text-amber-300 font-bold px-1.5 py-0.5 rounded">Palming Stretches</span>
                          <p className="text-[10px] text-slate-400 font-sans leading-snug">
                            **Steps**: Rub hands briskly until hot, cover closed eyelids. Blink, roll eyeballs slowly clockwise/anticlockwise.
                          </p>
                          <span className="text-[9px] text-amber-400 block font-mono">Focus: Straining relief & ciliary relax</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case "yoga":
      return (
        <div className="rounded-2xl p-4 md:p-6 bg-[#0c0c24] border border-pink-500/15 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle Pink/Purple gradient aura */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          {/* Header */}
          <div className="border-b border-white/5 pb-4 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧘‍♀️</span>
              <h2 className="text-xl font-black text-white font-display">
                Siddha Yogic Breaks <span className="text-xs bg-gradient-to-r from-pink-500 to-indigo-500 text-white px-2.5 py-0.5 rounded-full font-black ml-2 uppercase animate-pulse">Zen Active</span>
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Counter hours of screen-sitting. Revitalize your spine, refresh screen-weary eyes, and reboot neuronal focus.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Box (5 cols): AI Generator form & Interactive Breath circles */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Interactive Breathing Synchronizer */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-900/80 text-center space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-pink-400 font-bold tracking-widest font-mono uppercase">Interactive Breath Ring</span>
                  <h3 className="text-xs font-black text-slate-300">Deep Respiration Synchronizer</h3>
                </div>

                <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                  {/* Expanding animated breathing circle */}
                  <div className="absolute w-28 h-28 rounded-full border border-pink-500/20 bg-pink-500/5 animate-pulse scale-105"></div>
                  <div className="absolute w-20 h-20 rounded-full border border-indigo-500/40 bg-indigo-500/5 flex items-center justify-center text-center animate-wiggle">
                    <span className="text-[11px] font-black text-white font-mono animate-bounce">EXHALE</span>
                  </div>
                </div>

                <div className="bg-[#0e0a2b] py-2 px-3.5 rounded-xl border border-indigo-500/10 text-xs font-mono text-slate-300">
                  ⚡ Breath: <span className="text-indigo-300 font-bold font-sans">Inhale (4s) • Hold (4s) • Exhale (4s)</span>
                </div>
              </div>

              {/* AI Tailoring request */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-900 overflow-hidden space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-xs font-black text-white font-display flex items-center gap-1.5">
                    <Sparkles className="text-pink-400 animate-pulse" size={13} />
                    Synthesize Custom Yogic Flow
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans">Specify your present fatigue or discomfort. The Siddha AI will construct structured postures.</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-[#7c6bef] font-mono font-bold uppercase tracking-wider">Select Discomfort Trigger</label>
                    <select
                      value={breakNeed}
                      onChange={(e) => setBreakNeed(e.target.value)}
                      className="w-full bg-[#030308] border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none"
                    >
                      <option value="stress">🧘‍♀️ Mental Strain & Exam Anxiety Relief</option>
                      <option value="eyes">👁️ Eye Pain & Multi-hour Screen Fatigue</option>
                      <option value="posture">🪑 Stiff Back & Slouched Posture stretch</option>
                      <option value="energy">⚡ Drowsiness & Mid-day Study Slump booster</option>
                    </select>
                  </div>

                  {/* Custom specific complaint input field */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-pink-400 font-mono font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>Specific Target Pain / Symptoms (Optional)</span>
                      <span className="text-[8px] text-slate-500 font-normal capitalize">type custom problems</span>
                    </label>
                    <textarea
                      value={customYogaNeed}
                      onChange={(e) => setCustomYogaNeed(e.target.value)}
                      placeholder="e.g. sharp right shoulder spasm, left wrist cramp from typing math proofs, heavy behind-the-eyes migraine..."
                      rows={2}
                      className="w-full bg-[#030308] border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none placeholder-slate-600 focus:border-pink-500/40 resize-none transition-all duration-200 font-sans"
                    />
                  </div>

                  <button
                    onClick={handleGenYogaBreak}
                    disabled={aiYogaLoading}
                    className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#7c6bef] to-[#d94d96] text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-pink-500/15 transition-all active:scale-95 select-none"
                  >
                    {aiYogaLoading ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {customYogaNeed.trim() ? "Synthesize Custom Solution" : "Acquire Siddha Poses"}
                  </button>
                </div>
              </div>

            </div>

            {/* Right Box (7 cols): AI output display or custom catalog */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-950/40 border border-slate-900/60 min-h-[400px]">
              {aiYogaLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <RefreshCw className="animate-spin text-pink-400" size={32} />
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-white">Channelling ancient asanas & deep guides...</p>
                    <p className="text-[10px] text-[#7c6bef] font-mono">Formulating sequential steps, breath coordination, safety boundaries...</p>
                  </div>
                </div>
              ) : aiYogaOutput ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                    <span className="text-[10px] font-mono font-bold text-pink-400 tracking-wider">YOUR EXPERT YOGA FLOW</span>
                    <button
                      onClick={() => setAiYogaOutput(null)}
                      className="text-[10px] text-slate-500 hover:text-white font-bold"
                    >
                      CLEAR GUIDE
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 font-sans text-xs leading-relaxed space-y-4 max-h-[380px] overflow-y-auto whitespace-pre-line text-slate-100 select-text scrollbar-thin">
                    {aiYogaOutput}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="border-b border-white/5 pb-2">
                    <h3 className="text-xs font-black text-white font-display">
                      Classic Offline Asanas Catalog
                    </h3>
                    <p className="text-[10px] text-slate-500">Pick any of these immediate break postures or trigger an AI generation above!</p>
                  </div>

                  {/* 4 Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Trikonasana */}
                    <div className="p-4 rounded-xl bg-[#03030b] border border-slate-900 space-y-2">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-xs font-bold text-white">Trikonasana</span>
                        <span className="text-[9px] font-mono text-indigo-400">Triangle Pose</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        Stand wide. Stretch arms sideways. Extend body rightward, bring right hand down to right shin or floor, look up at raised left palm.
                      </p>
                      <div className="text-[9px] font-mono text-emerald-400">
                        💨 Goal: Back stiffness relief & thoracic stretch
                      </div>
                    </div>

                    {/* Anulom Vilom */}
                    <div className="p-4 rounded-xl bg-[#03030b] border border-slate-900 space-y-2">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-xs font-bold text-white">Anulom Vilom</span>
                        <span className="text-[9px] font-mono text-pink-400">Alternate Breath</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        Sit tall. Close right nostril using right thumb. Inhale deep left. Close left, exhale right. Then inhale right, exhale left. Cycle 3 minutes.
                      </p>
                      <div className="text-[9px] font-mono text-emerald-400">
                        💨 Goal: Neuronal calming & oxygen rush
                      </div>
                    </div>

                    {/* Balasana */}
                    <div className="p-4 rounded-xl bg-[#03030b] border border-slate-900 space-y-2">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-xs font-bold text-white">Balasana</span>
                        <span className="text-[9px] font-mono text-emerald-400">Child's Pose</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        Kneel, sit back on your heels. Lower forehead down to meet floor, extend hands completely straight forward. Breathe calmly.
                      </p>
                      <div className="text-[9px] font-mono text-emerald-400">
                        💨 Goal: Counter mental strain & quiet mind
                      </div>
                    </div>

                    {/* Eye Yoga */}
                    <div className="p-4 rounded-xl bg-[#03030b] border border-slate-900 space-y-2">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-xs font-bold text-white">Netranjali Yoga</span>
                        <span className="text-[9px] font-mono text-amber-400">Eye Palming</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        Rub hands rapidly to warm palms, cap them gently over closed sockets. Breathe. Keeping head still, look up, down, left, right.
                      </p>
                      <div className="text-[9px] font-mono text-emerald-400">
                        💨 Goal: Tear duct refresh & screen fatigue cure
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      );

    case "motiv":
      return (
        <div className="rounded-2xl p-6 bg-[#12122c] border border-indigo-500/10 shadow-xl space-y-6">
          <div className="space-y-4 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto text-3xl border border-indigo-500/15">
              👑
            </div>

            <div className="space-y-1">
              <h3 className="text-md font-extrabold text-white font-display">"Your only competition is who you were yesterday."</h3>
              <p className="text-xs text-slate-400 font-mono">— Anonymous Indian Proverb</p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleAIUplift}
                disabled={motivateLoading}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#7c6bef] to-[#d94d96] text-white font-extrabold text-xs flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer select-none"
              >
                {motivateLoading ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                AI Motivate Me
              </button>
            </div>
          </div>

          {motivateLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <RefreshCw className="animate-spin text-pink-400" size={28} />
              <p className="text-xs text-slate-500 font-mono tracking-wide animate-pulse">Drafting warm pep-talk, evaluating stress relief triggers, assembling metaphors...</p>
            </div>
          ) : motivateOutput ? (
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-900/60 font-mono text-xs leading-relaxed space-y-4 max-h-[300px] overflow-y-auto whitespace-pre-line text-[#00d4cc] text-center border-dashed">
              <div className="text-xs font-bold text-slate-500 font-sans border-b border-slate-900 pb-2">
                PERSONAL COACH PEP-TALK
              </div>
              <p className="italic text-slate-300 font-mono">{motivateOutput}</p>
            </div>
          ) : null}
        </div>
      );

    default:
      return null;
  }
}
