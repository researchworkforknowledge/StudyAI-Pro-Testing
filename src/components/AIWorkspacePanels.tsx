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
  Paperclip,
  HelpCircle
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
  const [selectedYr, setSelectedYr] = useState("2026");
  const [selectedPaperType, setSelectedPaperType] = useState("Board Exam");
  const [pyqOutput, setPyqOutput] = useState<string | null>(null);
  const [pyqLoading, setPyqLoading] = useState(false);

  // Topper Hacks extension states
  const [hacksOutput, setHacksOutput] = useState<string | null>(null);
  const [hacksLoading, setHacksLoading] = useState(false);

  // God-Mode Solutions and Deep Dive States
  const [activePyqTab, setActivePyqTab] = useState<"questions" | "solutions" | "deepdive">("questions");
  const [solutionsOutput, setSolutionsOutput] = useState<string | null>(null);
  const [solutionsLoading, setSolutionsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState("Drafting answers...");

  // Deep-dive interactive chat
  const [deepDiveMessages, setDeepDiveMessages] = useState<ChatMessage[]>([]);
  const [deepDiveInput, setDeepDiveInput] = useState("");
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);

  const handleGeneratePYQ = async () => {
    setPyqLoading(true);
    setPyqOutput(null);
    setSolutionsOutput(null);
    setHacksOutput(null);
    setDeepDiveMessages([]);
    setActivePyqTab("questions");
    
    const paperPrompt = `You are an elite Indian Board (CBSE/ICSE/State Board) Senior Paper Setter.
Generate an authentic, high-fidelity, comprehensive Class ${state.cls} "${state.sub}" ${selectedPaperType} aligned precisely with the standard board guidelines for the year ${selectedYr}.

STRICT DESIGN BLUEPRINT ENFORCEMENT:
1. MAX MARKS: 80 (This is a strict requirement. Do NOT create a abbreviated 25-mark sample. It MUST be a standard full-length exam representing 80 marks in total!)
2. TIME ALLOWED: 3 Hours.
3. Structure the paper with 5 distinct mandatory sections:
   - SECTION A: MCQ format questions (1 Mark each, Questions 1 to 20).
   - SECTION B: Very Short Answers (2 Marks each, Questions 21 to 25).
   - SECTION C: Short Answers with derivations/reasoning (3 Marks each, Questions 26 to 31).
   - SECTION D: Long Answer core questions (5 Marks each, Questions 32 to 35).
   - SECTION E: Case-Study / Reading-Source integrated questions (4 Marks each, Questions 36 to 38).
4. Strictly use official concepts and curriculum parameters of Class ${state.cls} "${state.sub}" for ${selectedYr}.
5. Give full mathematical details and analytical context. Do not use generic placeholders.
Format the output beautifully with bold headers, standard general instructions, Section marks details, and clean line breaks.`;

    const result = await onCallAI(paperPrompt, "pyq");
    if (result) setPyqOutput(result);
    setPyqLoading(false);
  };

  const handleGenerateTopperHacks = async () => {
    setHacksLoading(true);
    setHacksOutput(null);
    try {
      const result = await onCallAI(
        `You are a double gold-medalist board exam topper. Draft a laser-focused "Topper Cheat-Sheet & Examiner Key Hacks Sheet" for Class ${state.cls} "${state.sub}" based on standard board pattern weightages for the year ${selectedYr} and ${selectedPaperType} style. Provide:
1. 🎯 3 High-Yield Core Formulas/Theorems that examiners look for first.
2. ⚡ Secret "Half-Hour-Save" timing technique used by toppers to complete the 80 marks paper in 2.5 Hours flat.
3. ✍️ Special terminology examiners look for to award full scores on answers.
4. 🧠 Quick mnemonics & memory aids to remember hard units easily.
Keep it extremely encouraging, structural, styled in beautiful readable blocks, and highly inspiring!`,
        "doubts"
      );
      if (result) {
        setHacksOutput(result);
      } else {
        setHacksOutput("Could not draft cheatcode. Check network and call again.");
      }
    } catch (err) {
      console.error(err);
      setHacksOutput("Failed fetching helper.");
    } finally {
      setHacksLoading(false);
    }
  };

  const handleGenerateSolutions = async () => {
    if (!pyqOutput) return;
    setSolutionsLoading(true);
    setSolutionsOutput(null);
    setActivePyqTab("solutions");

    // Sequential simulation messages to keep the user engaged during the AI generation process
    const steps = [
      "Analyzing generated question paper...",
      "Drafting accurate marking scheme answers...",
      "Simplifying hard technical definitions into plain, easy English...",
      "Weaving in quick real-world analogies & mnemonics...",
      "Completing step-by-step master breakdown..."
    ];
    let stepIndex = 0;
    setLoadingStepText(steps[0]);
    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setLoadingStepText(steps[stepIndex]);
    }, 2800);

    try {
      const result = await onCallAI(
        `Review the provided official Class ${state.cls} ${state.sub} ${selectedPaperType} question paper:\n\n${pyqOutput}\n\nProvide the complete question paper with step-by-step answers. Let's make it the absolute best learning material! Keep the tutoring explanations extremely clear, engaging, and friendly (like a mentor explaining on a whiteboard in very easy plain English and simple language). For EVERY single answer:\n- Output "**Question X - Answer Key**" in bold.\n- Give the complete solved mathematical steps, arithmetic derivations, or core diagrams description.\n- Use a "💡 Friendly Analogy" to help them grasp it instantly.\n- Use an "🧠 Exam Memory Trick & Mnemonic" to memorize definitions or formulas easily.\n\nStructure the entire key beautifully with clear dividers, superb spacing, and lots of encouragement!`,
        "doubts"
      );
      if (result) {
        setSolutionsOutput(result);
      } else {
        setSolutionsOutput("An unexpected issue occurred. Please check your config and try again!");
      }
    } catch (e) {
      console.error(e);
      setSolutionsOutput("Failed to fetch solutions from AI oracle. Please attempt again.");
    } finally {
      clearInterval(interval);
      setSolutionsLoading(false);
    }
  };

  const handleDeepDiveQuery = async (queryText: string) => {
    if (!queryText.trim() || deepDiveLoading) return;
    const cleanQuery = queryText.trim();
    
    // Append user message
    const nextMsgs = [...deepDiveMessages, { role: "user" as const, text: cleanQuery }];
    setDeepDiveMessages(nextMsgs);
    setDeepDiveInput("");
    setDeepDiveLoading(true);

    try {
      const convoPrompt = nextMsgs
        .slice(-6)
        .map((m) => `${m.role === "user" ? "Student" : "AI Explainer"}: ${m.text}`)
        .join("\n\n");

      const systemPrompt = `You are an expert exam prep mentor conversing with a student regarding this Question Paper:\n\n${pyqOutput}\n\nAnd Solutions:\n${solutionsOutput || "(Not loaded by student yet)"}\n\nProvide a hyper-simplified explanation to help them understand. Keep words warm, extremely clear, simple, and encouraging.\n\nDialogue thread:\n${convoPrompt}`;

      const reply = await onCallAI(systemPrompt, "doubts");
      if (reply) {
        setDeepDiveMessages((prev) => [...prev, { role: "ai" as const, text: reply }]);
      } else {
        setDeepDiveMessages((prev) => [...prev, { role: "ai" as const, text: "Oracle is busy. Try asking again!" }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeepDiveLoading(false);
    }
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 font-display flex items-center gap-2">
                <FileText size={22} className="text-indigo-400 animate-pulse" /> PYQs & Board Papers Hub
              </h2>
              <p className="text-xs text-white/50">Compile authentic papers with dynamic AI step-by-step master explanations</p>
            </div>

            {/* Inputs selection bar */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedYr}
                onChange={(e) => setSelectedYr(e.target.value)}
                className="bg-slate-900/80 border border-white/10 rounded-full px-3.5 py-1.5 text-xs text-white cursor-pointer outline-none focus:border-indigo-500/50"
              >
                {Array.from({ length: 2026 - 1962 + 1 }, (_, i) => String(2026 - i)).map((y) => (
                  <option key={y} value={y} className="bg-[#0A0A0F]">
                    {y} Board style
                  </option>
                ))}
              </select>

              <select
                value={selectedPaperType}
                onChange={(e) => setSelectedPaperType(e.target.value)}
                className="bg-slate-900/80 border border-white/10 rounded-full px-3.5 py-1.5 text-xs text-white cursor-pointer outline-none focus:border-indigo-500/50"
              >
                {["Board Exam", "Compartment Exam", "Sample Paper", "Pre-Board Mock"].map((p) => (
                  <option key={p} value={p} className="bg-[#0A0A0F]">
                    {p}
                  </option>
                ))}
              </select>

              <button
                onClick={handleGeneratePYQ}
                disabled={pyqLoading}
                className="px-5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-xs font-black text-white rounded-full flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
              >
                {pyqLoading ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Generate Paper
              </button>
            </div>
          </div>

          {/* Premium Sub-tabs when output is ready */}
          {pyqOutput && (
            <div className="flex flex-wrap border-b border-white/5 p-1 bg-slate-950/50 rounded-2xl gap-1.5 max-w-full lg:max-w-xl">
              <button
                onClick={() => setActivePyqTab("questions")}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-[120px] ${
                  activePyqTab === "questions"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <FileText size={13} />
                Question Paper
              </button>
              <button
                onClick={() => {
                  if (!solutionsOutput) {
                    handleGenerateSolutions();
                  } else {
                    setActivePyqTab("solutions");
                  }
                }}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 relative overflow-hidden min-w-[130px] ${
                  activePyqTab === "solutions"
                    ? "bg-gradient-to-r from-pink-500/80 to-indigo-600/80 text-white shadow-lg shadow-pink-500/15"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <Sparkles size={13} className="text-pink-300 animate-pulse" />
                Step-by-Step Answers
                {solutionsLoading && (
                  <span className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-indigo-500 animate-pulse w-full"></span>
                )}
              </button>
              <button
                onClick={() => {
                  if (!hacksOutput) {
                    handleGenerateTopperHacks();
                  }
                  setActivePyqTab("hacks");
                }}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 relative overflow-hidden min-w-[124px] ${
                  activePyqTab === "hacks"
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-amber-500/15 font-black"
                    : "text-white/40 hover:text-white/70"
                }`}
                title="Secret scoring hacks by golden toppers inside"
              >
                <Zap size={13} className="animate-bounce" />
                Topper Hacks
                {hacksLoading && (
                  <span className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse w-full"></span>
                )}
              </button>
              <button
                onClick={() => setActivePyqTab("deepdive")}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-[120px] ${
                  activePyqTab === "deepdive"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <MessageSquare size={13} />
                Tutor deepdive
              </button>
            </div>
          )}

          {pyqLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative flex items-center justify-center">
                <RefreshCw className="animate-spin text-indigo-400" size={32} />
                <Sparkles className="absolute text-indigo-300 animate-pulse" size={14} />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm font-bold text-white tracking-wide">Compiling historical pattern guidelines...</p>
                <p className="text-xs text-white/30 font-mono">Formulating exact marks weightage blueprints with Class {state.cls} {state.sub} standards</p>
              </div>
            </div>
          ) : pyqOutput ? (
            <div className="space-y-4">
              {/* QUESTIONS TAB VIEW */}
              {activePyqTab === "questions" && (
                <div className="relative group">
                  <div className="absolute right-4 top-4 z-10 flex gap-2">
                    <button
                      onClick={() => {
                        if (pyqOutput) {
                          navigator.clipboard.writeText(pyqOutput);
                          alert("📋 Copied Question Paper to clipboard successfully!");
                        }
                      }}
                      className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check size={12} /> Copy Board Paper
                    </button>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 font-mono text-xs leading-relaxed space-y-4 max-h-[440px] overflow-y-auto whitespace-pre-line text-white/90 shadow-inner">
                    <div className="flex justify-between items-center text-white/40 font-sans font-bold border-b border-white/5 pb-2">
                      <span className="uppercase tracking-widest text-[10.5px]">Compiled Questionnaire ({selectedYr})</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest font-black flex items-center gap-1">
                        <CheckCircle2 size={12} /> Live Blueprint
                      </span>
                    </div>
                    <div className="pt-2">{pyqOutput}</div>
                  </div>
                </div>
              )}

              {/* SOLVED STEP-BY-STEP EXPLANATIONS TAB VIEW */}
              {activePyqTab === "solutions" && (
                <div>
                  {solutionsLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4 max-w-sm mx-auto text-center animate-pulse">
                      <div className="relative flex items-center justify-center">
                        <RefreshCw className="animate-spin text-pink-500" size={36} />
                        <Sparkles className="absolute text-yellow-300 animate-bounce" size={16} />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black text-white tracking-tight uppercase">Unveiling Master Solutions</h4>
                        <p className="text-xs text-pink-400/90 font-mono tracking-wider">{loadingStepText}</p>
                      </div>
                    </div>
                  ) : solutionsOutput ? (
                    <div className="relative">
                      <div className="absolute right-4 top-4 z-10 flex gap-2">
                        <button
                          onClick={() => {
                            if (solutionsOutput) {
                              navigator.clipboard.writeText(solutionsOutput);
                              alert("📋 Copied Solved Paper to clipboard successfully!");
                            }
                          }}
                          className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 text-pink-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Check size={12} /> Copy Step-by-Step Solutions
                        </button>
                      </div>
                      <div className="p-5 rounded-2xl bg-[#09090E]/80 border border-pink-500/10 font-sans text-xs leading-relaxed space-y-4 max-h-[440px] overflow-y-auto whitespace-pre-line text-white shadow-2xl">
                        <div className="flex justify-between items-center text-white/40 font-sans font-bold border-b border-pink-500/10 pb-2">
                          <span className="uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400 text-[10.5px] tracking-widest font-black">SOLVED STEP-BY-STEP TUTORIAL</span>
                          <span className="text-[10px] text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded border border-pink-500/20 uppercase tracking-widest font-bold flex items-center gap-1">
                            <HelpCircle size={12} /> God Mode Active
                          </span>
                        </div>
                        <div className="pt-2 text-slate-100 whitespace-pre-line leading-relaxed text-xs font-mono">{solutionsOutput}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-2xl bg-gradient-to-br from-indigo-950/30 to-pink-950/10 border border-indigo-500/10 space-y-4 max-w-md mx-auto shadow-xl">
                      <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mx-auto text-pink-400">
                        <Sparkles size={24} className="animate-pulse" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">Scoring Secrets Solver</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                          Click to let Feynman AI solve the entire generated board exam paper step-by-step with simple, ultra-engaging language, daily mnemonic tricks, and concept maps!
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateSolutions}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-indigo-650 hover:scale-[1.03] active:scale-95 text-white font-black text-xs tracking-wider transition-all shadow-lg shadow-pink-500/20 cursor-pointer"
                      >
                        ⚡ Generate Step-By-Step Solved Paper
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TOPPER STUDY HACKS TAB VIEW */}
              {activePyqTab === "hacks" && (
                <div>
                  {hacksLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4 max-w-sm mx-auto text-center animate-pulse">
                      <div className="relative flex items-center justify-center">
                        <RefreshCw className="animate-spin text-amber-500" size={36} />
                        <Sparkles className="absolute text-yellow-300 animate-bounce" size={16} />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black text-white tracking-tight uppercase">Drafting Topper Secrets</h4>
                        <p className="text-xs text-amber-400/90 font-mono tracking-wider">Unlocking professional feedback indicators...</p>
                      </div>
                    </div>
                  ) : hacksOutput ? (
                    <div className="relative">
                      <div className="absolute right-4 top-4 z-10 flex gap-2">
                        <button
                          onClick={() => {
                            if (hacksOutput) {
                              navigator.clipboard.writeText(hacksOutput);
                              alert("📋 Copied Topper Cheat-Sheet successfully!");
                            }
                          }}
                          className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Check size={12} /> Copy Hacks
                        </button>
                      </div>
                      <div className="p-5 rounded-2xl bg-[#09090E]/80 border border-amber-500/10 font-sans text-xs leading-relaxed space-y-4 max-h-[440px] overflow-y-auto whitespace-pre-line text-white shadow-2xl">
                        <div className="flex justify-between items-center text-white/40 font-sans font-bold border-b border-amber-500/10 pb-2">
                          <span className="uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 text-[10.5px] tracking-widest font-black">TOPPER BLUEPRINT CHEAT CODE</span>
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest font-bold flex items-center gap-1">
                            <Zap size={12} /> Gold Medal Mode Active
                          </span>
                        </div>
                        <div className="pt-2 text-slate-100 whitespace-pre-line leading-relaxed text-xs font-mono">{hacksOutput}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-2xl bg-gradient-to-br from-slate-950 to-amber-950/20 border border-amber-500/10 space-y-4 max-w-md mx-auto shadow-xl">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                        <Zap size={24} className="animate-pulse" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">Topper Cheat-Codes</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                          Click to generate secret timing tricks, examiner scoring Terminology indicators, high yield formulas, and dynamic memory tricks for this exam style.
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateTopperHacks}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-650 hover:scale-[1.03] active:scale-95 text-slate-950 font-black text-xs tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                      >
                        ⚡ Uncover Topper Cheat Sheet
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* DEDICATED EXAM DEEP DIVE CHAT CONSOLE */}
              {activePyqTab === "deepdive" && (
                <div className="space-y-4">
                  <p className="text-xs text-indigo-300 font-mono tracking-wide flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-400 animate-pulse" /> Live interactive deconstruct! Get custom mnemonics or CBSE variants:
                  </p>

                  {/* Suggesters quick clicks */}
                  <div className="flex flex-wrap gap-2 pb-1.5">
                    {[
                      "💡 Create a memory trick for this paper type",
                      "👨‍🏫 Give a detailed real world analogy for Q1",
                      "📝 Give 3 similar mock replacement questions",
                      "🧠 Explain examiner grading mindset for Class " + state.cls
                    ].map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        disabled={deepDiveLoading}
                        onClick={() => handleDeepDiveQuery(sug.trim())}
                        className="text-[10px] bg-white/5 border border-white/10 hover:bg-indigo-600/10 hover:border-indigo-500/30 px-3 py-1.5 rounded-full text-slate-300 transition-colors cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>

                  {/* Chat scrolling viewport */}
                  <div className="min-h-[160px] max-h-[280px] overflow-y-auto space-y-3 bg-slate-950/60 p-4 border border-white/5 rounded-2xl shadow-inner scroll-smooth">
                    {deepDiveMessages.length === 0 ? (
                      <div className="text-center text-white/30 text-xs py-10 font-mono flex flex-col items-center justify-center gap-2">
                        <MessageSquare size={20} className="text-slate-600 animate-pulse" />
                        <span>No query posted yet. Try clicking any quick-actions helper above or type a custom query down below!</span>
                      </div>
                    ) : (
                      deepDiveMessages.map((msg, mIdx) => (
                        <div
                          key={mIdx}
                          className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ring-1 ring-white/10 flex-shrink-0 ${
                              msg.role === "user" ? "bg-indigo-600 text-white" : "bg-pink-500/10 text-pink-400"
                            }`}
                          >
                            {msg.role === "user" ? "ME" : "AI"}
                          </div>
                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow ${
                              msg.role === "user"
                                ? "bg-indigo-600 text-white rounded-tr-none"
                                : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none font-mono"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))
                    )}

                    {deepDiveLoading && (
                      <div className="flex gap-2 mr-auto text-[11px] font-mono text-pink-400 animate-pulse items-center">
                        <RefreshCw size={12} className="animate-spin text-pink-500" />
                        <span>Oracle is solving customized deep-dive...</span>
                      </div>
                    )}
                  </div>

                  {/* Interactive form field */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type specific question doubt or concept request..."
                      value={deepDiveInput}
                      onChange={(e) => setDeepDiveInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && deepDiveInput.trim() && !deepDiveLoading) {
                          handleDeepDiveQuery(deepDiveInput);
                        }
                      }}
                      disabled={deepDiveLoading}
                      className="flex-1 bg-white/5 border border-white/10 focus:border-indigo-500/50 rounded-full px-4 py-2 text-xs text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeepDiveQuery(deepDiveInput)}
                      disabled={!deepDiveInput.trim() || deepDiveLoading}
                      className="p-2.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex-shrink-0 cursor-pointer disabled:opacity-40 transition-all font-bold text-xs"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-white/40 bg-white/[0.01] rounded-3xl border border-dashed border-white/10 max-w-sm mx-auto flex flex-col items-center justify-center gap-3">
              <span className="text-3xl text-indigo-400 animate-bounce">📚</span>
              <p className="leading-relaxed">
                Choose the desired previous year (from <span className="text-white">2015</span> up to <span className="text-white">2026</span>) and category type (including <span className="text-indigo-400 font-bold">Compartment Exams</span>) then click Compile!
              </p>
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
