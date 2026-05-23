export interface QuickTask {
  t: string; // text
  d: boolean; // done status
}

export interface Note {
  title: string;
  content: string;
  date: string;
}

export interface Flashcard {
  f: string; // front (question)
  b: string; // back (answer)
  ts: number; // timestamp
}

export interface Homework {
  t: string; // task text
  d: string; // due date (YYYY-MM-DD or similar)
  pri: "high" | "med" | "low"; // priority
  done: boolean;
}

export interface ChatMessage {
  role: "user" | "ai";
  text: string;
  isThinking?: boolean;
}

export interface AppState {
  board: string;
  cls: string;
  sub: string;
  theme: "dark" | "light";
  timer: {
    sec: number;
    mode: number; // 25, 5, 15, 50, etc.
    running: boolean;
    sessToday: number;
  };
  stats: {
    hours: number;
    quizzes: number;
    hwDone: number;
    streak: number;
    chatHistory?: ChatMessage[];
    aiFormulae?: { [subject: string]: string };
  };
  sessions: { [dateStr: string]: number }; // tracks study seconds or multiplier
  lastDate: string | null;
  notes: Note[];
  hw: Homework[];
  fc: Flashcard[];
  wk: string[]; // weak topics
  qt: QuickTask[]; // quick tasks from dashboard
  fcIdx: number;
  examDate: string | null;
  focusTask: string;
  lofi: boolean;
  vibe: number;
  track: number;
  speechOn?: boolean;
  profileName?: string;
  claimedBoosts?: string[];
  extraXP?: number;
  proceduralSynth?: boolean;
}

export const INITIAL_STATE: AppState = {
  board: "CBSE",
  cls: "10",
  sub: "Mathematics",
  theme: "dark",
  timer: {
    sec: 1500,
    mode: 25,
    running: false,
    sessToday: 0
  },
  stats: {
    hours: 0,
    quizzes: 0,
    hwDone: 0,
    streak: 0,
    chatHistory: [],
    aiFormulae: {}
  },
  sessions: {},
  lastDate: null,
  notes: [],
  hw: [],
  fc: [],
  wk: [],
  qt: [],
  fcIdx: 0,
  examDate: null,
  focusTask: "",
  lofi: false,
  vibe: 0,
  track: 0,
  speechOn: false,
  profileName: "Syllabus Gladiator",
  claimedBoosts: [],
  extraXP: 0,
  proceduralSynth: false
};
