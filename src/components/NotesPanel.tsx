import React, { useState } from "react";
import { Edit3, Play, Trash2, Check, Sparkles, Send, RefreshCw, Volume2, Plus, Download, Brain, Sparkle } from "lucide-react";
import { Note, AppState } from "../types";

interface NotesPanelProps {
  state: AppState;
  onSaveNote: (title: string, content: string) => void;
  onDeleteNote: (index: number) => void;
  onExtractFlashcards: (noteContent: string) => Promise<void>;
  isLoadingAI: boolean;
  onCallAI: (prompt: string, persona: string) => Promise<string | null>;
}

export default function NotesPanel({
  state,
  onSaveNote,
  onDeleteNote,
  onExtractFlashcards,
  isLoadingAI,
  onCallAI
}: NotesPanelProps) {
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "ai-topic" | "browse">("ai-topic");
  const [aiWorking, setAiWorking] = useState(false);
  const [extractingFC, setExtractingFC] = useState(false);

  // AI Topic-to-Notes Scribe Generator States
  const [aiTopicInput, setAiTopicInput] = useState("");
  const [generatedTopicNotes, setGeneratedTopicNotes] = useState<string | null>(null);
  const [generatedTopicTitle, setGeneratedTopicTitle] = useState("");
  const [aiTopicLoading, setAiTopicLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("");

  const phases = [
    "Analyzing board curriculum framework...",
    "Drafting core comprehensive theory & proofs...",
    "Injecting smart mnemonics & memory analogies...",
    "Formulating topper shortcuts & speed tactics...",
    "Aligning official marks distribution..."
  ];

  const getSuggestionPills = () => {
    const sub = state.sub.toLowerCase();
    if (sub.includes("scie") || sub.includes("phys") || sub.includes("chem") || sub.includes("biol")) {
      return ["Photosynthesis & Light Reactions", "Refraction vs Reflection Laws", "Periodic Table Periodicity", "Electromagnetic Induction", "Mitosis vs Meiosis Phases", "Acid, Base & Salt Reactions"];
    }
    if (sub.includes("math") || sub.includes("arith") || sub.includes("geom") || sub.includes("trig")) {
      return ["Quadratic Equation Proofs", "Trigonometric Identities Matrix", "Pythagoras Theorem Derivation", "Arithmetic Progression Sum Formula", "Probability Combinostics", "Surface Area & Section Geometry"];
    }
    if (sub.includes("social") || sub.includes("hist") || sub.includes("geog") || sub.includes("civic")) {
      return ["French Revolution Milestones", "Indian Freedom Movement Timeline", "Greenhouse Effect Layers", "Continental Drift Theory", "Federalism Core Features & System"];
    }
    if (sub.includes("engl") || sub.includes("gramm") || sub.includes("lang")) {
      return ["Active vs Passive Voice", "Tense Agreement Rules", "Letter Writing Guidelines", "Metaphor & Poetic Devices", "Subject-Verb Concord Model"];
    }
    return ["Core Core Theory & Principles", "Exemplar Practical Concepts", "Fundamental Definitions & Graphs", "Formula sheet derivation guide"];
  };

  const handleGenerateTopicNotes = async () => {
    if (!aiTopicInput.trim()) return;
    setAiTopicLoading(true);
    setGeneratedTopicNotes(null);
    setLoadingPhase(phases[0]);
    
    let phaseIdx = 0;
    const interval = setInterval(() => {
      phaseIdx = (phaseIdx + 1) % phases.length;
      setLoadingPhase(phases[phaseIdx]);
    }, 2500);

    try {
      const prompt = `You are an elite, double gold-medalist Senior Board Examination Paper Marker and Curriculum Designer for ${state.board} Class ${state.cls}.
Draft comprehensive, high-fidelity ultimate study notes for the topic: "${aiTopicInput.trim()}".
The subject context is Class ${state.cls} "${state.sub}".

Your output must be structured as the "Godly-Level Master Notes" that covers EVERYTHING, formatted in clean, professional Markdown-like spacing with the following sections:

# Topic: ${aiTopicInput.trim()} - Class ${state.cls} ${state.board} Ultimate Study Sheet

## 🌟 1. CORE SYLLABUS OVERVIEW
Provide an absolute crystal clear, highly intuitive theoretical breakdown of the topic and all definitions.

## 🔬 2. THE CRITICAL CORE & FORMULAS (Detailed)
Exhaustive details of everything they need to know. No summaries or shortcuts here-give all proofs, core derivations, chemical equations, milestones, or grammatical structures.

## 🧠 3. SMART MEMORY TRICKS & MNEMONICS
Out of the box, extremely easy-to-learn memory hooks, acronyms, step-by-step triggers, or funny analogies that make memorization instant and easy.

## ⚡ 4. UNBEATABLE TOPPERS SPEED SHORTS & TRICKS
Pro level hacks to solve numericals, avoid common examiner traps, timing techniques, and marks distribution.

## ✍️ 5. EXAMINER VALUE TERMINOLOGY GLOSSARY
A glossary of exact technical words/phrases the examiner looks for to award full 100% scores.

Make it encouraging, highly explanatory, and comprehensive! Write in a vibrant mentoring style.`;

      const result = await onCallAI(prompt, "notes");
      if (result) {
        setGeneratedTopicNotes(result);
        setGeneratedTopicTitle(`${aiTopicInput.trim()} Master Note`);
      } else {
        setGeneratedTopicNotes("Could not draft the content. Please try another query.");
      }
    } catch (err) {
      console.error(err);
      setGeneratedTopicNotes("Error generating notes. Make sure Gemini is online.");
    } finally {
      clearInterval(interval);
      setAiTopicLoading(false);
    }
  };

  // Drag and drop study documents states
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const titleWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
        setNoteTitle(titleWithoutExtension);
        setNoteContent(text);
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    onSaveNote(noteTitle.trim(), noteContent.trim());
    setNoteTitle("");
    setNoteContent("");
    setActiveTab("browse");
  };

  const handleAIEnhance = async () => {
    if (!noteContent.trim()) return;
    setAiWorking(true);
    const feedback = await onCallAI(
      `Fleshen and enhance the following study topic content into premium bullet headers and summaries:\n${noteContent}`,
      "notes"
    );
    if (feedback) {
      setNoteContent(feedback);
    }
    setAiWorking(false);
  };

  const handleSpeech = (text: string) => {
    if (!text.trim()) return;
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN";
      utterance.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported on this browser.");
    }
  };

  const handleAutoFlashcards = async (content: string) => {
    if (!content.trim()) return;
    setExtractingFC(true);
    await onExtractFlashcards(content);
    setExtractingFC(false);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Tab Selector */}
      <div className="flex bg-slate-900/85 p-1 rounded-full max-w-lg border border-slate-800 gap-1">
        <button
          onClick={() => setActiveTab("ai-topic")}
          className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "ai-topic" 
              ? "bg-[#0bb6ae] text-slate-950 shadow shadow-cyan-400/20" 
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Sparkles size={13} className="text-amber-400 animate-pulse" />
          AI Topic Notes Maker
        </button>
        <button
          onClick={() => setActiveTab("write")}
          className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === "write" ? "bg-indigo-500 text-white shadow animate-none" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          ✍️ Custom Scribe
        </button>
        <button
          onClick={() => setActiveTab("browse")}
          className={`flex-1 py-1.5 rounded-full text-xs font-bold relative transition-all cursor-pointer ${
            activeTab === "browse" ? "bg-indigo-500 text-white shadow" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          📚 Browse Deck ({state.notes.length})
        </button>
      </div>

      {activeTab === "ai-topic" ? (
        <div className="rounded-2xl p-6 bg-[#0E0E1B] border border-[#0bb6ae]/25 shadow-xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-md font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400 font-display flex items-center gap-2">
              <Sparkles size={18} className="text-[#0bb6ae]" /> AI Study Notes Generator
            </h3>
            <p className="text-xs text-slate-400">
              Enter any topic below to build a godly-level exhaustive note card loaded with derivations, mnemonic memory keys, topper tips and terminologies.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative flex items-center bg-[#06060F] border border-[#0bb6ae]/20 focus-within:border-[#0bb6ae]/60 rounded-xl px-4 py-2 transition-all">
              <input
                type="text"
                placeholder="What topic do you want to learn? (e.g. Newton's Third Law, Mitosis phases, Quadratic equations)"
                value={aiTopicInput}
                onChange={(e) => setAiTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !aiTopicLoading && aiTopicInput.trim()) {
                    handleGenerateTopicNotes();
                  }
                }}
                className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600 pr-10 py-1"
              />
              <button
                onClick={handleGenerateTopicNotes}
                disabled={aiTopicLoading || !aiTopicInput.trim()}
                className="absolute right-3 p-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                title="Generate notes"
              >
                <Send size={14} />
              </button>
            </div>

            {/* Smart exploration pills */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase tracking-widest">Suggested High-Yield Topics:</span>
              <div className="flex flex-wrap gap-1.5">
                {getSuggestionPills().map((pill) => (
                  <button
                    key={pill}
                    onClick={() => setAiTopicInput(pill)}
                    className="text-[10.5px] px-2.5 py-1 rounded-lg bg-slate-950 text-slate-400 border border-slate-800 hover:border-[#0bb6ae]/50 hover:text-white hover:bg-[#0bb6ae]/5 transition-all text-left cursor-pointer"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading Indicator */}
            {aiTopicLoading && (
              <div className="rounded-xl border border-[#0bb6ae]/20 p-8 bg-black/60 flex flex-col items-center justify-center space-y-4 animate-pulse">
                <RefreshCw className="animate-spin text-teal-400" size={30} />
                <div className="text-center space-y-1">
                  <span className="text-xs font-black uppercase text-white tracking-widest">GENESIS WRITER ACTIVE</span>
                  <p className="text-[11px] font-mono text-teal-400">{loadingPhase}</p>
                </div>
              </div>
            )}

            {/* Results Presentation Area */}
            {generatedTopicNotes && !aiTopicLoading && (
              <div className="space-y-3 pt-2 border-t border-slate-800 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-[#06060F] border border-slate-900 px-4 py-2 rounded-xl">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{generatedTopicTitle}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onSaveNote(generatedTopicTitle, generatedTopicNotes || "");
                        setGeneratedTopicNotes(null);
                        setAiTopicInput("");
                        setActiveTab("browse");
                      }}
                      className="px-3 py-1 rounded bg-[#00d4cc] hover:bg-[#00d4cc]/90 text-[#07071a] text-[10.5px] font-bold flex items-center gap-1 cursor-pointer hover:scale-103 transition-transform"
                    >
                      <Check size={11} /> Save & File
                    </button>
                    <button
                      onClick={() => {
                        setNoteTitle(generatedTopicTitle);
                        setNoteContent(generatedTopicNotes || "");
                        setActiveTab("write");
                      }}
                      className="px-3 py-1 rounded bg-indigo-500 hover:bg-indigo-400 text-white text-[10.5px] font-bold flex items-center gap-1 cursor-pointer hover:scale-103 transition-transform"
                    >
                      <Edit3 size={11} /> Open in Editor
                    </button>
                    <button
                      onClick={() => handleSpeech(generatedTopicNotes || "")}
                      className="p-1 px-2 rounded border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-[10.5px]"
                      title="Read aloud notes context"
                    >
                      <Volume2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-black/40 border border-slate-900 max-h-[420px] overflow-y-auto leading-relaxed text-xs text-slate-200 font-mono whitespace-pre-wrap select-text scrollbar-thin">
                  {generatedTopicNotes}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === "write" ? (
        <div className="rounded-2xl p-6 bg-[#12122c] border border-indigo-500/10 shadow-xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-md font-extrabold text-white font-display">Notes Scribe Workspace</h3>
            <p className="text-xs text-slate-400">Write text and let our AI structure it instantly into pristine Board revision points</p>
          </div>

          {/* Drag & Drop uploader card */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer transition-all duration-300 rounded-2xl border-2 border-dashed p-4 text-center flex flex-col items-center justify-center gap-2 ${
              dragActive
                ? "border-indigo-400 bg-indigo-500/10 shadow-[0_0_15px_rgba(79,70,229,0.2)] font-mono"
                : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-[#0a0a1f]/80"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,.md,.json,.csv,.js,.ts"
              className="hidden"
            />
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-400/20">
              <Download size={15} className="animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Drag & drop your study document or notes files here</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Supports .txt, .md, .json to auto-extract scribe details</p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Study Title (e.g. Newton's laws of motion class 10)"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full bg-[#0a0a1f] border border-slate-800 focus:border-indigo-400 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600"
            />

            <textarea
              placeholder="Paste or write raw study material here. Try describing a concept poorly and let the AI fix it perfectly..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={8}
              className="w-full bg-[#0a0a1f] border border-slate-800 focus:border-indigo-400 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 font-sans leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-indigo-500/10">
            {/* AI helpers */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAIEnhance}
                disabled={aiWorking || !noteContent.trim()}
                className="px-4 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 text-indigo-300 border border-indigo-400/25 hover:border-indigo-300 disabled:opacity-40 disabled:pointer-events-none hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {aiWorking ? (
                  <RefreshCw className="animate-spin" size={13} />
                ) : (
                  <Sparkles size={13} className="text-indigo-400" />
                )}
                AI Scribe Polish ✨
              </button>

              <button
                onClick={() => handleSpeech(noteContent)}
                disabled={!noteContent.trim()}
                className="px-4 py-2 text-xs font-bold rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white disabled:opacity-40 hover:scale-105 active:scale-95 transition-all text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 size={13} className="text-cyan-400" /> Read Aloud
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={!noteContent.trim() || !noteTitle.trim()}
              className="px-6 py-2 text-xs font-extrabold rounded-full bg-[#00d4cc] hover:bg-[#00d4cc]/90 text-[#07071a] disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 hover:scale-105 transition-all cursor-pointer shadow-lg shadow-[#00d4cc]/20"
            >
              <Plus size={14} /> Keep Note
            </button>
          </div>
        </div>
      ) : (
        /* Saved items catalog */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.notes && state.notes.length > 0 ? (
            state.notes.map((note, index) => (
              <div key={index} className="rounded-xl p-5 bg-[#12122c] border border-indigo-500/10 hover:border-indigo-500/20 shadow-lg flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono tracking-wider font-bold">SAVED • {note.date}</span>
                    <button
                      onClick={() => onDeleteNote(index)}
                      className="p-1.5 rounded text-slate-500 hover:bg-rose-500/15 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <h4 className="text-sm font-black text-white font-display uppercase tracking-tight">{note.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-4 leading-relaxed whitespace-pre-line font-mono bg-black/20 p-3.5 rounded-lg border border-slate-900">
                    {note.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900 gap-2">
                  <button
                    onClick={() => handleSpeech(note.content)}
                    className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 size={12} className="text-indigo-400" /> Read
                  </button>

                  <button
                    onClick={() => handleAutoFlashcards(note.content)}
                    disabled={extractingFC}
                    className="text-[11px] font-bold text-[#0bb6ae] hover:text-[#00d4cc] flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {extractingFC ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <Brain size={12} className="text-[#0bb6ae]" />
                    )}
                    Generate Cards 🚀
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-xl bg-slate-900/40 border border-slate-800/60 p-12 text-center text-xs text-slate-500 max-w-sm mx-auto">
              📚 No written notes yet. Shift back to the **Scribe Workspace** tab on top to write your first Indian board exam note card!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
