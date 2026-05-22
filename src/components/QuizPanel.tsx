import React, { useState } from "react";
import { HelpCircle, RefreshCw, Sparkles, Award, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

interface QuizPanelProps {
  onCallAI: (prompt: string, persona: string) => Promise<string | null>;
  onIncrementQuizzes: () => void;
  onPlaySound?: (soundType: 'success' | 'levelUp' | 'correct' | 'wrong' | 'click' | 'powerUp') => void;
  profileName?: string;
}

interface Question {
  q: string; // question text
  opts: string[]; // 4 options
  ans: number; // 0-indexed correct option
  exp: string; // explanation
}

export default function QuizPanel({ onCallAI, onIncrementQuizzes, onPlaySound, profileName }: QuizPanelProps) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    {
      q: "Which of the following describes a quadratic equation having equal roots?",
      opts: ["Discriminant is strictly positive", "Discriminant is equal to zero", "Discriminant is strictly negative", "Discriminant is an imaginary number"],
      ans: 1,
      exp: "Since the roots of quadratic equation ax²+bx+c=0 are given by [-b ± √D]/2a, we have equal roots only when the discriminant D = b² - 4ac is exactly equal to zero."
    },
    {
      q: "In an Arithmetic Progression, if a = 5, d = 3, what is the value of the 10th term (a₁₀)?",
      opts: ["28", "30", "32", "35"],
      ans: 2,
      exp: "The nth term of an AP is calculated as aₙ = a + (n - 1)d. Thus, a₁₀ = 5 + (10 - 1)*3 = 5 + 9*3 = 5 + 27 = 32."
    }
  ]);

  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setQuestions([]);
    setActiveQuestionIdx(0);
    setSelectedOpt(null);
    setScore(0);
    setQuizFinished(false);

    try {
      const response = await onCallAI(
        topic.trim()
          ? `List 5 multiple choice questions with options for subject topic: ${topic.trim()}`
          : "Generate 5 multiple choice board-level questions covering core Mathematics revision syllabus.",
        "quiz"
      );

      if (response) {
        // Strip markdown backticks if any
        let clean = response.replace(/```json|```/g, "").trim();
        const firstBrace = clean.indexOf("[");
        const lastBrace = clean.lastIndexOf("]");
        if (firstBrace !== -1 && lastBrace !== -1) {
          clean = clean.substring(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(parsed);
        }
      }
    } catch (err) {
      console.error("Error parsing quiz JSON:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerClick = (optIdx: number) => {
    if (selectedOpt !== null) return; // Prevent double trigger
    setSelectedOpt(optIdx);

    const isCorrect = optIdx === questions[activeQuestionIdx].ans;
    if (isCorrect) {
      setScore((s) => s + 1);
      if (onPlaySound) onPlaySound('correct');
    } else {
      if (onPlaySound) onPlaySound('wrong');
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    if (activeQuestionIdx + 1 < questions.length) {
      setActiveQuestionIdx((i) => i + 1);
      if (onPlaySound) onPlaySound('click');
    } else {
      setQuizFinished(true);
      onIncrementQuizzes();
      if (onPlaySound) {
        onPlaySound(score >= questions.length / 2 ? 'levelUp' : 'wrong');
      }
    }
  };

  const activeQuestion = questions[activeQuestionIdx];

  return (
    <div className="rounded-2xl p-6 bg-[#12122c] border border-indigo-500/10 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white font-display flex items-center gap-2">
            <HelpCircle size={18} className="text-indigo-400" /> AI Interactive Board-Prep Quiz
          </h2>
          <p className="text-xs text-slate-400">Generate exam-ready multiple-choice checkpoints. Tests are dynamically generated in real-time</p>
        </div>

        <form onSubmit={handleGenerate} className="flex gap-2">
          <input
            type="text"
            placeholder="Search topic or leave blank..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
            className="bg-slate-900 border border-slate-800 rounded-full px-4 py-2 text-xs text-slate-100 outline-none focus:border-indigo-400 w-48 sm:w-56"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            {loading ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
            Generate
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <RefreshCw className="animate-spin text-indigo-400" size={32} />
          <p className="text-xs text-slate-400 font-mono tracking-wider animate-pulse">Drafting questions, formulating options, calculating explanations...</p>
        </div>
      ) : quizFinished ? (
        /* Quiz summary milestone card */
        <div className="p-8 rounded-xl bg-[#0d0d24] border border-[#0ebb6ae]/20 text-center space-y-6 max-w-md mx-auto">
          <div className="inline-flex w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 items-center justify-center border border-indigo-400/25">
            <Award size={32} />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold font-display text-white">Quiz Completed Successfully!</h3>
            <p className="text-xs text-slate-400">Your total metrics have been fully calculated and logged</p>
          </div>

          <div className="bg-black/20 px-6 py-4 rounded-xl border border-slate-900 max-w-[200px] mx-auto text-center">
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest font-bold">Assessment Score</p>
            <p className="text-3xl font-black text-white mt-1">
              <span className="text-indigo-400">{score}</span>/{questions.length}
            </p>
          </div>

          <p className="text-xs text-slate-400 italic">
            {score >= 4
              ? "👑 Brilliant performance! You exhibit extremely solid concepts."
              : score >= 3
              ? "👏 Good job! You possess standard average grasp. Perform other practices to master points."
              : "📖 Keep studying the notes and practice flashcards to close loopholes!"}
          </p>

          <button
            onClick={() => {
              setQuestions([
                {
                  q: "Which of the following describes a quadratic equation having equal roots?",
                  opts: ["Discriminant is strictly positive", "Discriminant is equal to zero", "Discriminant is strictly negative", "Discriminant is an imaginary number"],
                  ans: 1,
                  exp: "Since the roots of quadratic equation ax²+bx+c=0 are given by [-b ± √D]/2a, we have equal roots only when the discriminant D = b² - 4ac is exactly equal to zero."
                }
              ]);
              setActiveQuestionIdx(0);
              setSelectedOpt(null);
              setScore(0);
              setQuizFinished(false);
            }}
            className="w-full py-2.5 rounded-full bg-[#00d4cc] hover:bg-[#00d4cc]/90 text-[#07071a] font-black text-xs transition-colors cursor-pointer"
          >
            Restart Session Practice
          </button>
        </div>
      ) : activeQuestion ? (
        /* Render Active Question Play Arena */
        <div className="space-y-6">
          {/* Progress bar info */}
          <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-400">
            <span>Assessment Question {activeQuestionIdx + 1}/{questions.length}</span>
            <span className="text-indigo-400">Running Score: {score}</span>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-900/80 space-y-3">
            <h3 className="text-sm font-extrabold text-white leading-relaxed">{activeQuestion.q}</h3>
          </div>

          {/* Options listed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeQuestion.opts.map((opt, oIdx) => {
              const char = String.fromCharCode(65 + oIdx);
              const isSelected = selectedOpt === oIdx;
              const isCorrectOpt = oIdx === activeQuestion.ans;

              // Visually determine coloring states
              let borderStyle = "border-slate-800 bg-slate-900/40 text-slate-300";
              let prefixGlow = "bg-slate-800 text-slate-400";

              if (selectedOpt !== null) {
                if (isCorrectOpt) {
                  borderStyle = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 ring-2 ring-emerald-500/10";
                  prefixGlow = "bg-emerald-500 text-white";
                } else if (isSelected) {
                  borderStyle = "border-rose-500/40 bg-rose-500/10 text-rose-300 ring-2 ring-rose-500/10";
                  prefixGlow = "bg-rose-500 text-white";
                } else {
                  borderStyle = "border-slate-800 bg-slate-950/20 text-slate-600 opacity-60";
                  prefixGlow = "bg-slate-950/40 text-slate-600";
                }
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handleAnswerClick(oIdx)}
                  disabled={selectedOpt !== null}
                  className={`text-left p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-3.5 transition-all text-ellipsis overflow-hidden focus:outline-none ${
                    selectedOpt === null ? "hover:border-indigo-500/40 hover:bg-indigo-500/5 cursor-pointer" : ""
                  } ${borderStyle}`}
                >
                  <span className={`w-6 h-6 rounded-lg font-mono font-bold flex items-center justify-center text-xs ${prefixGlow}`}>
                    {char}
                  </span>
                  <span className="truncate">{opt}</span>

                  {selectedOpt !== null && (
                    <span className="ml-auto flex-shrink-0">
                      {isCorrectOpt ? (
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      ) : isSelected ? (
                        <XCircle size={16} className="text-rose-400" />
                      ) : null}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation reveal overlay if choice made */}
          {selectedOpt !== null && (
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-2 animate-[fadeIn_0.3s_ease]">
              <h4 className="text-xs font-bold text-indigo-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
                💡 Scientific Explanation
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {activeQuestion.exp || "No static explanation provided for this question query."}
              </p>

              <div className="flex justify-end pt-3">
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-indigo-500/20"
                >
                  {activeQuestionIdx + 1 === questions.length ? "Complete Review" : "Next Question"}{" "}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-xs text-slate-500">No active questions. Click Generate above to start a live assessment test!</div>
      )}
    </div>
  );
}
