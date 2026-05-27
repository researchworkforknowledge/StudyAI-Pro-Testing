import React, { useState } from "react";
import { FolderHeart, Sparkles, Shuffle, ChevronLeft, ChevronRight, Trash2, Plus, Zap, AlertTriangle, RefreshCw } from "lucide-react";
import { AppState, Flashcard } from "../types";

interface FlashcardsPanelProps {
  state: AppState;
  onAddFC: (front: string, back: string) => void;
  onDeleteFC: (index: number) => void;
  onShuffleFC: () => void;
  onSetFCIndex: (idx: number) => void;
  onCallAI: (prompt: string, persona: string) => Promise<string | null>;
  onReviewFC?: () => void;
}

export default function FlashcardsPanel({
  state,
  onAddFC,
  onDeleteFC,
  onShuffleFC,
  onSetFCIndex,
  onCallAI,
  onReviewFC
}: FlashcardsPanelProps) {
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [flipped, setFlipped] = useState(false);

  // Gamification tracking to avoid spamming XP on flips
  const [reviewedCards, setReviewedCards] = useState<Set<number>>(new Set());

  // AI Flashcards state
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);
  const [errMessage, setErrMessage] = useState("");

  const handleAIGenerateCards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;

    setAiLoading(true);
    setErrMessage("");
    try {
      const result = await onCallAI(
        `Generate exactly ${aiCount} comprehensive study flashcards for topic: "${aiTopic.trim()}". Return ONLY the JSON object format structure.`,
        "fc_gen"
      );

      if (!result) {
        throw new Error("No response received from expert flashcard builder.");
      }

      // Safe JSON cleaning of markdown code-blocks
      let cleanJson = result.trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.slice(7);
      } else if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.slice(3);
      }
      if (cleanJson.endsWith("```")) {
        cleanJson = cleanJson.slice(0, -3);
      }
      cleanJson = cleanJson.trim();

      const parsedCards = JSON.parse(cleanJson);
      if (Array.isArray(parsedCards)) {
        let addedCount = 0;
        parsedCards.forEach((card: any) => {
          if (card && (card.f || card.front) && (card.b || card.back)) {
            const front = card.f || card.front;
            const back = card.b || card.back;
            onAddFC(front, back);
            addedCount++;
          }
        });
        if (addedCount > 0) {
          setAiTopic("");
          alert(`Successfully generated and added ${addedCount} elite conceptual flashcards to your deck!`);
        } else {
          throw new Error("The returned JSON structure did not match flashcard fields.");
        }
      } else {
        throw new Error("Expected a json array of flashcards, but received different structure.");
      }
    } catch (e: any) {
      console.error("AI Flashcards compile error:", e);
      setErrMessage(e.message || "Synthesizing failed. Check network or try another topic term.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontText.trim() || !backText.trim()) return;
    onAddFC(frontText.trim(), backText.trim());
    setFrontText("");
    setBackText("");
  };

  const handleNext = () => {
    if (state.fc.length === 0) return;
    setFlipped(false);
    setTimeout(() => {
      onSetFCIndex((state.fcIdx + 1) % state.fc.length);
    }, 150);
  };

  const handlePrev = () => {
    if (state.fc.length === 0) return;
    setFlipped(false);
    setTimeout(() => {
      onSetFCIndex((state.fcIdx - 1 + state.fc.length) % state.fc.length);
    }, 150);
  };

  const currentCard: Flashcard | undefined = state.fc[state.fcIdx];

  const handleFlipCard = () => {
    setFlipped(!flipped);
    if (!flipped && !reviewedCards.has(state.fcIdx)) {
      setReviewedCards((prev) => new Set(prev).add(state.fcIdx));
      if (onReviewFC) onReviewFC();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-white font-display flex items-center gap-2">
            <FolderHeart size={18} className="text-indigo-400" /> Active Flashcard Deck
          </h2>
          <p className="text-xs text-slate-400">Boost active recall and test point retention. Generate flashcards automatically via the notes maker!</p>
        </div>

        <button
          onClick={onShuffleFC}
          disabled={state.fc.length < 2}
          className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-850 text-xs font-bold text-[#00d4cc] hover:text-white disabled:opacity-40 disabled:pointer-events-none hover:border-slate-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Shuffle size={13} /> Shuffle Deck
        </button>
      </div>

      {/* Main flippable 3D card layout */}
      {state.fc.length > 0 && currentCard ? (
        <div className="flex flex-col items-center space-y-6">
          {/* 3D Card Stage wrapper */}
          <div
            onClick={handleFlipCard}
            className="w-full max-w-lg h-60 md:h-64 cursor-pointer relative select-none [perspective:1200px]"
          >
            {/* Flippable card item */}
            <div
              className={`w-full h-full relative duration-500 ease-out [transform-style:preserve-3d] ${
                flipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              {/* Front side card */}
              <div className="absolute inset-0 w-full h-full p-6 md:p-8 rounded-2xl bg-gradient-to-tr from-[#151538] to-[#1d1d4f] border border-indigo-500/20 shadow-2xl flex flex-col justify-between items-center text-center [backface-visibility:hidden]">
                <span className="text-[10px] font-mono tracking-widest text-[#0bb6ae] uppercase font-bold">
                  Card {state.fcIdx + 1} of {state.fc.length} • FRONT
                </span>
                <p className="text-sm md:text-md font-bold text-white max-w-sm leading-relaxed whitespace-pre-line">
                  {currentCard.f}
                </p>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">
                  🖱️ Tap Card to Reveal Answer
                </span>
              </div>

              {/* Back side card */}
              <div className="absolute inset-0 w-full h-full p-6 md:p-8 rounded-2xl bg-gradient-to-tr from-[#1a1a45] to-[#25255f] border border-[#00d4cc]/35 shadow-2xl flex flex-col justify-between items-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-bold">
                  Card {state.fcIdx + 1} of {state.fc.length} • REVEALED
                </span>
                <p className="text-sm md:text-md font-bold text-slate-100 max-w-sm leading-relaxed whitespace-pre-line font-mono bg-black/30 p-4 rounded-xl border border-slate-900 w-full overflow-y-auto max-h-[120px]">
                  {currentCard.b}
                </p>
                <div className="flex justify-between items-center w-full text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">
                  <span>🖱️ Tap to flip back</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFC(state.fcIdx);
                    }}
                    className="p-1 px-2 rounded bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-500 transition-colors uppercase tracking-widest"
                  >
                    Remove Card
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick manual browsing controls */}
          <div className="flex items-center gap-6 justify-center">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs font-mono font-bold text-slate-400">
              {state.fcIdx + 1}/{state.fc.length} Cards
            </span>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      ) : (
        /* Empty status box fallback */
        <div className="rounded-xl p-8 bg-slate-950/40 border border-slate-900 text-center space-y-3 max-w-sm mx-auto">
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto">
            <FolderHeart size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-300">Your deck is completely empty</h4>
            <p className="text-[11px] text-slate-500 font-mono">Create custom flashcard pairs manually below or generate them from active Notes Scribe!</p>
          </div>
        </div>
      )}

      {/* Dual Creator Grid: Manual vs AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Custom Card Form */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-900/60 space-y-4 flex flex-col justify-between">
          <h3 className="text-xs font-black text-white font-display uppercase tracking-wider flex items-center gap-1.5">
            <Zap size={13} className="text-[#0bb6ae]" /> Draft a Custom Flashcard
          </h3>

          <form onSubmit={handleAdd} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[9px] text-[#0bb6ae] uppercase tracking-widest font-mono font-bold">Question / Front Terms</label>
              <input
                type="text"
                placeholder="e.g. Formula for Volume of Sphere?"
                value={frontText}
                onChange={(e) => setFrontText(e.target.value)}
                className="w-full bg-[#030308] border border-slate-850 focus:border-indigo-400 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold">Academic Answer / Back details</label>
              <input
                type="text"
                placeholder="e.g. V = (4/3) * pi * r^3"
                value={backText}
                onChange={(e) => setBackText(e.target.value)}
                className="w-full bg-[#030308] border border-slate-850 focus:border-indigo-400 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={!frontText.trim() || !backText.trim()}
              className="w-full py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-45 disabled:scale-100 disabled:pointer-events-none text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-95 transition-all mt-2"
            >
              <Plus size={14} /> Add Card
            </button>
          </form>
        </div>

        {/* AI Auto-Scribe Card Generator */}
        <div className="p-5 rounded-2xl bg-[#0d0a26] border border-indigo-500/15 space-y-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="space-y-1">
            <h3 className="text-xs font-black text-white font-display uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-pink-400 animate-pulse" /> Auto-Synthesize AI Piled Decks
            </h3>
            <p className="text-[10px] text-slate-500">Provide an academic topic to automatically compile flashcards of board-level depth!</p>
          </div>

          <form onSubmit={handleAIGenerateCards} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[9px] text-pink-400 uppercase tracking-widest font-mono font-bold">Study Term / Topic</label>
              <input
                type="text"
                placeholder="e.g. Krebs Cycle, Photosynthesis, Ohm's Law"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="w-full bg-[#030308] border border-slate-850 focus:border-pink-400 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold">Quantity</label>
                <select
                  value={aiCount}
                  onChange={(e) => setAiCount(Number(e.target.value))}
                  className="w-full bg-[#030308] border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none cursor-pointer"
                >
                  <option value={3}>3 Cards (Fast)</option>
                  <option value={5}>5 Cards (Recommended)</option>
                  <option value={8}>8 Cards (Deep Dive)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold">Syllabus Context</label>
                <div className="w-full bg-slate-950/45 text-slate-400 rounded-lg px-3 py-2 text-[10px] font-mono border border-slate-850 truncate select-none">
                  {state.sub} • Class {state.cls}
                </div>
              </div>
            </div>

            {errMessage && (
              <p className="text-[9px] text-rose-400 font-mono italic animate-pulse">{errMessage}</p>
            )}

            <button
              type="submit"
              disabled={aiLoading || !aiTopic.trim()}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 disabled:opacity-45 disabled:scale-100 disabled:pointer-events-none text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-95 transition-all mt-2 select-none shadow-md shadow-indigo-950/30"
            >
              {aiLoading ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  Generating Cards...
                </>
              ) : (
                <>
                  <Sparkles size={12} />
                  Assemble AI Flashcards
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
