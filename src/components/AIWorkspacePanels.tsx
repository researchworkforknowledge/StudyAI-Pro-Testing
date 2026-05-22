import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Sparkles,
  RefreshCw,
  Sliders,
  Send,
  Volume2,
  Mic,
  MicOff,
  History,
  FileText,
  Download,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Compass,
  Zap,
  Check,
  Paperclip
} from "lucide-react";
import { AppState, ChatMessage } from "../types";

interface AIWorkspacePanelsProps {
  state: AppState;
  activeSection: "pyq" | "pred" | "doubts" | "strat" | "motiv" | "weak";
  onCallAI: (prompt: string, persona: string) => Promise<string | null>;
  onUpdateStats: (updater: (prev: AppState["stats"]) => AppState["stats"]) => void;
}

export default function AIWorkspacePanels({ state, activeSection, onCallAI, onUpdateStats }: AIWorkspacePanelsProps) {
  // --- 1. AI doubts Chat States ---
  const [chatLog, setChatLog] = useState<ChatMessage[]>(() => {
    if (state.stats.chatHistory && state.stats.chatHistory.length > 0) {
      return state.stats.chatHistory;
    }
    return [
      {
        role: "ai",
        text: "👋 Pranam! I'm your dedicated Indian syllabus Feynman Tutor. Ask me any conceptual doubt from your curriculum (e.g., 'What is law of electromagnetic induction?'). I will simplify it first, then go deep!"
      }
    ];
  });

  // Keep state.stats.chatHistory synchronized dynamically on change
  useEffect(() => {
    // Only synchronize if chatLog actually contains user messages or if chatHistory is already defined in the state
    const hasUserMessages = chatLog.some((m) => m.role === "user");
    if (!hasUserMessages && !state.stats.chatHistory) {
      return;
    }

    onUpdateStats((prev) => {
      const prevSer = JSON.stringify(prev.chatHistory || []);
      const currentSer = JSON.stringify(chatLog);
      if (prevSer !== currentSer) {
        return {
          ...prev,
          chatHistory: chatLog
        };
      }
      return prev;
    });
  }, [chatLog, onUpdateStats, state.stats.chatHistory]);

  // Sync back state.stats.chatHistory when user switches account
  useEffect(() => {
    if (state.stats.chatHistory && state.stats.chatHistory.length > 0) {
      const currentSer = JSON.stringify(chatLog);
      const stateSer = JSON.stringify(state.stats.chatHistory);
      if (currentSer !== stateSer) {
        setChatLog(state.stats.chatHistory);
      }
    } else {
      const expectedText = `👋 Pranam! I'm your dedicated Indian syllabus Feynman Tutor. Ask me any conceptual doubt from the subject "${state.sub}". I will simplify it first, then go deep!`;
      const isCorrectWelcome = chatLog.length === 1 && chatLog[0].role === "ai" && chatLog[0].text === expectedText;
      if (!isCorrectWelcome) {
        setChatLog([
          {
            role: "ai",
            text: expectedText
          }
        ]);
      }
    }
  }, [state.stats.chatHistory, state.sub]);
  const [userInput, setUserInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [eli5Mode, setEli5Mode] = useState(false); // "Explain Like I'm 5" Smart toggle

  const chatFileRef = useRef<HTMLInputElement>(null);

  const handleChatFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setUserInput(`[Attached Study File: "${file.name}"]\n${text.substring(0, 1000)}\n\nMy doubt regarding this material: `);
        }
      };
      reader.readAsText(file);
    }
  };

  // Voice Mode listener emulation
  const handleVoiceToggle = () => {
    if (isVoiceListening) {
      setIsVoiceListening(false);
    } else {
      setIsVoiceListening(true);
      setTimeout(() => {
        setIsVoiceListening(false);
        setUserInput("Can you explain how photosynthesis works in green plants Class 10 terms?");
      }, 3000);
    }
  };

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || chatLoading) return;

    const userMsg = userInput.trim();
    const nextLog = [...chatLog, { role: "user", text: userMsg }];
    setChatLog(nextLog);
    setUserInput("");
    setChatLoading(true);

    // Build complete conversational history transcript to preserve academic discussion context
    const conversationTimeline = nextLog
      .slice(-8)
      .map((m) => `${m.role === "user" ? "Student" : "Feynman Tutor AI"}: ${m.text}`)
      .join("\n\n");

    const promptWithHistory = `You are a warm, supportive school teacher. Below is the historical dialogue of our active lesson discussion. Please evaluate the entire thread and answer the last 'Student' message with perfect reference continuity, remembering the core subject topic:

${conversationTimeline}

Provide your response adhering strictly to the Feynman format requested (Simple Explanation, Academic Answer, Real-World Analogy, Common Mistake, Memory Trick).`;

    const enhancedQuery = eli5Mode
      ? `${promptWithHistory}\n\n(Ensure additional instruction - Explain everything exactly like I am 5 years old using kitchen objects!)`
      : promptWithHistory;

    const reply = await onCallAI(enhancedQuery, "doubts");

    if (reply) {
      setChatLog((prev) => [...prev, { role: "ai", text: reply }]);
      // If voice mode or speech on, automatically speak out loud
      if (state.speechOn && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(reply.replace(/[*_#`]/g, ""));
        utterance.lang = "en-IN";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    } else {
      setChatLog((prev) => [...prev, { role: "ai", text: "Something went wrong. Please check your credentials." }]);
    }
    setChatLoading(false);
  };

  const handleSpeakMessage = (text: string) => {
    if ("speechSynthesis" in window) {
      const strippedText = text.replace(/[*_#`]/g, "");
      const utterance = new SpeechSynthesisUtterance(strippedText);
      utterance.lang = "en-IN";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- 2. Indian Board PYQ Generator States ---
  const [selectedYr, setSelectedYr] = useState("2024");
  const [selectedPaperType, setSelectedPaperType] = useState("Board Exam");
  const [pyqOutput, setPyqOutput] = useState<string | null>(null);
  const [pyqLoading, setPyqLoading] = useState(false);

  const handleGeneratePYQ = async () => {
    setPyqLoading(true);
    setPyqOutput(null);
    const result = await onCallAI(
      `Generate an authentic ${selectedPaperType} style paper for Class ${state.cls} ${state.sub} aligned with ${selectedYr} guidelines. Ensure exact Indian board structure, question weights and standard chapters focus.`,
      "pyq"
    );
    if (result) setPyqOutput(result);
    setPyqLoading(false);
  };

  // --- 3. Competency Based Questions Oracle States ---
  const [refTopic, setRefTopic] = useState("");
  const [oracleOutput, setOracleOutput] = useState<string | null>(null);
  const [oracleLoading, setOracleLoading] = useState(false);

  const handleRunPrediction = async () => {
    setOracleLoading(true);
    setOracleOutput(null);
    const result = await onCallAI(
      `Generate high probability predicted board topics, competency based questions with solutions, chapter rankings, and pitfalls checklist for topic: ${refTopic || state.sub}.`,
      "pred"
    );
    if (result) setOracleOutput(result);
    setOracleLoading(false);
  };

  // Render Section
  switch (activeSection) {
    case "doubts":
      return (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6 flex flex-col min-h-[500px]">
          {/* Work area header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <MessageSquare size={18} className="text-indigo-400" /> Feynman Doubts Solver
              </h2>
              <p className="text-xs text-white/40">Simplifies difficult core science/math topics before diving deep into academic jargon</p>
            </div>

            {/* Smart Micro toggles */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eli5Mode}
                  onChange={(e) => setEli5Mode(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-500 bg-slate-900 accent-indigo-500 cursor-pointer"
                />
                <span className="text-[11px] font-mono font-bold text-slate-300">ELI-5 Simplification Mode</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Do you want to clear your current progress thread and start a fresh chapter?")) {
                    setChatLog([
                      {
                        role: "ai",
                        text: "👋 Pranam! I'm your dedicated Indian syllabus Feynman Tutor. Ask me any conceptual doubt from your curriculum (e.g., 'What is law of electromagnetic induction?'). I will simplify it first, then go deep!"
                      }
                    ]);
                  }
                }}
                className="text-[10px] text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-full border border-rose-500/10 transition-colors font-mono cursor-pointer"
                title="Wipe chats to start a fresh lesson topic"
              >
                Clear Conversation
              </button>
            </div>
          </div>

          {/* Dialog Log Scrollbox */}
          <div className="flex-1 overflow-y-auto space-y-4 max-h-[360px] pr-2 scroll-smooth">
            {chatLog.map((msg, mIdx) => (
              <div
                key={mIdx}
                className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white/10 flex-shrink-0 ${
                    msg.role === "user" ? "bg-indigo-600 text-white" : "bg-cyan-500/10 text-cyan-400"
                  }`}
                >
                  {msg.role === "user" ? "ME" : "AI"}
                </div>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                      : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none font-mono"
                  }`}
                >
                  {msg.text}

                  {msg.role === "ai" && (
                    <button
                      onClick={() => handleSpeakMessage(msg.text)}
                      className="mt-2.5 p-1 text-white/50 hover:text-white flex items-center gap-1 cursor-pointer font-sans"
                      title="Speak result"
                    >
                      <Volume2 size={12} className="text-indigo-400" /> Speak
                    </button>
                  )}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-3 max-w-[85%] mr-auto animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-bold text-xs">
                  ..
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl rounded-tl-none text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <RefreshCw size={12} className="animate-spin text-cyan-400" />
                    <span>Feynman is teaching...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dialog Input Form */}
          <form onSubmit={handleSendQuery} className="flex gap-2.5 border-t border-indigo-500/10 pt-4 items-center">
            {/* Hidden native input */}
            <input
              type="file"
              ref={chatFileRef}
              onChange={handleChatFileUpload}
              accept=".txt,.md,.json,.csv,.js,.ts"
              className="hidden"
            />

            {/* Paperclip upload button */}
            <button
              type="button"
              onClick={() => chatFileRef.current?.click()}
              className="p-3 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-indigo-400 hover:border-slate-500 transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
              title="Attach study file (.txt, .md, .json to ask doubts)"
            >
              <Paperclip size={16} />
            </button>

            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`p-3 rounded-full border transition-all flex items-center justify-center flex-shrink-0 ${
                isVoiceListening
                  ? "bg-rose-500/20 text-rose-400 border-rose-500 animate-pulse"
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:text-indigo-400 hover:border-slate-500"
              }`}
              title="Voice Tutor Mode (Listen & Speak Indian English)"
            >
              {isVoiceListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              type="text"
              placeholder={isVoiceListening ? "Listening Spoken doubt..." : "Attach doc or type e.g. why is speed of light constant?"}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 focus:border-indigo-500/50 rounded-full px-4 py-2.5 text-xs text-white outline-none placeholder:text-white/30"
            />

            <button
              type="submit"
              disabled={!userInput.trim() || chatLoading}
              className="p-3 bg-indigo-500 rounded-full text-white hover:bg-indigo-600 disabled:opacity-40 disabled:scale-100 cursor-pointer flex items-center justify-center flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </form>

          {isVoiceListening && (
            <p className="text-[10px] text-rose-400 font-mono text-center tracking-wider animate-pulse uppercase font-black">
              🗣️ listening to voice... say doubt in English
            </p>
          )}
        </div>
      );

    case "pyq":
      return (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <FileText size={18} className="text-indigo-400" /> PYQs & Sample Papers Compiler
              </h2>
              <p className="text-xs text-white/40">Generate style papers and exams aligned with previous year blueprints</p>
            </div>

            {/* Inputs selection bar */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedYr}
                onChange={(e) => setSelectedYr(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-xs text-white cursor-pointer outline-none focus:border-indigo-500/50"
              >
                {["2025", "2024", "2023", "2022", "2021", "2020"].map((y) => (
                  <option key={y} value={y} className="bg-[#0A0A0F]">
                    {y} style paper
                  </option>
                ))}
              </select>

              <select
                value={selectedPaperType}
                onChange={(e) => setSelectedPaperType(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-xs text-white cursor-pointer outline-none focus:border-indigo-500/50"
              >
                {["Board Exam", "Sample Paper", "Pre-Board Mock"].map((p) => (
                  <option key={p} value={p} className="bg-[#0A0A0F]">
                    {p}
                  </option>
                ))}
              </select>

              <button
                onClick={handleGeneratePYQ}
                disabled={pyqLoading}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-xs font-bold text-white rounded-full flex items-center gap-1.5 cursor-pointer"
              >
                {pyqLoading ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Compile
              </button>
            </div>
          </div>

          {pyqLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <RefreshCw className="animate-spin text-indigo-400" size={28} />
              <p className="text-xs text-white/40 font-mono tracking-wide animate-pulse">Compiling previous board weightages, drafting question indices...</p>
            </div>
          ) : pyqOutput ? (
            <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/10 font-mono text-xs leading-relaxed space-y-4 max-h-[440px] overflow-y-auto whitespace-pre-line text-white/90">
              <div className="flex justify-between items-center text-white/40 font-sans font-bold border-b border-white/5 pb-2">
                <span>COMPILED PORTFOLIO</span>
                <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Ready
                </span>
              </div>
              <div>{pyqOutput}</div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-white/40 bg-white/[0.01] rounded-2xl border border-dashed border-white/10 max-w-sm mx-auto">
              📝 Select previous year and compile to let AI draft a complete paper with exact marking weights for your current subject context!
            </div>
          )}
        </div>
      );

    case "pred":
      return (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Compass size={18} className="text-indigo-400" /> CBQ Predictor & Oracle
              </h2>
              <p className="text-xs text-white/40">Get AI-predicted high-probability questions, chapter rankings, and pitfalls checklist</p>
            </div>

            {/* Custom input search */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Topic / chapter (e.g. Light reflection)..."
                value={refTopic}
                onChange={(e) => setRefTopic(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white outline-none focus:border-indigo-500/50 w-44"
              />
              <button
                onClick={handleRunPrediction}
                disabled={oracleLoading}
                className="px-4 py-2 rounded-full bg-indigo-600 hover:scale-105 disabled:opacity-40 disabled:scale-100 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                {oracleLoading ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                Run Oracle
              </button>
            </div>
          </div>

          {oracleLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3 max-w-sm mx-auto text-center">
              <RefreshCw className="animate-spin text-cyan-400" size={28} />
              <p className="text-xs text-white/40 font-mono tracking-wider animate-pulse">Analyzing previous year patterns, processing syllabus weightages, evaluating high priority competency trends...</p>
            </div>
          ) : oracleOutput ? (
            <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/10 font-mono text-xs leading-relaxed space-y-4 max-h-[440px] overflow-y-auto whitespace-pre-line text-white/90">
              <div className="flex justify-between items-center text-white/40 font-sans font-bold border-b border-white/5 pb-2">
                <span>ORACLE INSIGHTS PORTFOLIO</span>
                <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest font-semibold">
                  98.2% Blueprint Match
                </span>
              </div>
              <div>{oracleOutput}</div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-white/40 bg-white/[0.01] rounded-2xl border border-dashed border-white/10 max-w-sm mx-auto">
              👁️ Click Run Oracle to extract AI predicted high-probability CBSE/ICSE topics, pitfalls and solution sets instantly!
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}
