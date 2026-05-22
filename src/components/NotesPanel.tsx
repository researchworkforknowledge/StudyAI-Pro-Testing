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
  const [activeTab, setActiveTab] = useState<"write" | "browse">("write");
  const [aiWorking, setAiWorking] = useState(false);
  const [extractingFC, setExtractingFC] = useState(false);

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
      {/* Tab toggle */}
      <div className="flex bg-slate-900/85 p-1 rounded-full max-w-sm border border-slate-800">
        <button
          onClick={() => setActiveTab("write")}
          className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === "write" ? "bg-indigo-500 text-white shadow" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          ✍️ Create Notes
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

      {activeTab === "write" ? (
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
