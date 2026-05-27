import { db, auth, OperationType, handleFirestoreError } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

interface SubjectPerformance {
  correct: number;
  attempted: number;
  accuracy: number;
  weightedScore: number;
}

export interface UserProfileSchema {
  uid: string;
  name: string;
  email: string;
  photoURL: string;

  createdAt: string;
  updatedAt: string;

  targetExamDate: string | null;

  studyHours: number;
  quizzesDone: number;
  flashcardsCompleted: number;

  streakCount: number;
  lastActiveDate: string;

  totalPoints: number;

  weakAreas: {
    physics: number;
    chemistry: number;
    mathematics: number;
    biology: number;
  };

  subjectPerformanceIndex: {
    physics: SubjectPerformance;
    chemistry: SubjectPerformance;
    mathematics: SubjectPerformance;
    biology: SubjectPerformance;
  };
}

const DEFAULT_SUBJECT_PERF = {
  correct: 0,
  attempted: 0,
  accuracy: 0,
  weightedScore: 0
};

export const INITIAL_FIRESTORE_PROFILE: UserProfileSchema = {
  uid: "",
  name: "",
  email: "",
  photoURL: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  targetExamDate: null,
  studyHours: 0,
  quizzesDone: 0,
  flashcardsCompleted: 0,
  streakCount: 0,
  lastActiveDate: new Date().toISOString().split("T")[0],
  totalPoints: 0,
  weakAreas: { physics: 100, chemistry: 100, mathematics: 100, biology: 100 },
  subjectPerformanceIndex: {
    physics: { ...DEFAULT_SUBJECT_PERF },
    chemistry: { ...DEFAULT_SUBJECT_PERF },
    mathematics: { ...DEFAULT_SUBJECT_PERF },
    biology: { ...DEFAULT_SUBJECT_PERF }
  }
};

/**
 * Hydrates or creates the user profile dynamically
 */
export async function hydrateUserProfile(user: any): Promise<UserProfileSchema> {
  const docRef = doc(db, "users", user.uid);
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfileSchema;
    } else {
      const newProfile = {
        ...INITIAL_FIRESTORE_PROFILE,
        uid: user.uid,
        name: user.displayName || "Scholar",
        email: user.email || "",
        photoURL: user.photoURL || ""
      };
      await setDoc(docRef, newProfile);
      return newProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    throw error;
  }
}

/**
 * Validates and updates the streak engine instantly.
 */
export async function validateAndUpdateStreak(uid: string, profile: UserProfileSchema): Promise<Partial<UserProfileSchema> | null> {
  const currentDate = new Date().toISOString().split("T")[0];
  const lastActive = profile.lastActiveDate;
  
  if (currentDate === lastActive) {
    // Current day already rewarded
    return null;
  }

  const current = new Date(currentDate);
  const last = new Date(lastActive);
  const diffTime = Math.abs(current.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let newStreak = profile.streakCount;
  let pointsEarned = 0;

  if (diffDays === 1) {
    // Perfect streak maintenance
    newStreak += 1;
    pointsEarned = 10;
    
    // 10-DAY BONUS Check
    if (newStreak % 10 === 0 && newStreak > 0) {
      pointsEarned = 20; // Replaces the +10
    }
  } else if (diffDays > 1) {
    // Streak broken
    newStreak = 1; 
    pointsEarned = 10;
  } else {
    return null;
  }

  const updates = {
    streakCount: newStreak,
    lastActiveDate: currentDate,
    totalPoints: profile.totalPoints + pointsEarned,
    updatedAt: new Date().toISOString()
  };

  try {
    await updateDoc(doc(db, "users", uid), updates);
    return updates;
  } catch (error) {
    console.error("Streak sync failed:", error);
    return null;
  }
}

/**
 * Live Subject Performance Calculator
 * Updates subject metrics when a quiz is submitted.
 */
export async function recordSubjectQuizResult(
  uid: string, 
  subject: "physics" | "chemistry" | "mathematics" | "biology" | string, 
  score: number, 
  total: number,
  currentProfile: UserProfileSchema
) {
  const targetSub = subject.toLowerCase();
  // We only track the core 4 for the radar safely
  if (!["physics", "chemistry", "mathematics", "biology"].includes(targetSub)) {
    return; // Don't crash on standard updates
  }

  const perfObj = currentProfile.subjectPerformanceIndex[targetSub as keyof typeof currentProfile.subjectPerformanceIndex] || { ...DEFAULT_SUBJECT_PERF };
  
  const newAttempted = perfObj.attempted + total;
  const newCorrect = perfObj.correct + score;
  const newAccuracy = newAttempted > 0 ? Number((newCorrect / newAttempted).toFixed(2)) : 0;
  
  // Custom formula incorporating study consistency proxy
  const consistencyMultiplier = Math.min(1.5, 1 + (currentProfile.streakCount * 0.01));
  const newWeightedScore = Math.floor((newAccuracy * 100) * consistencyMultiplier);

  // We automatically calculate weak areas inverse proportion (100 - weightedScore)
  const newWeakAreaValue = Math.max(10, 100 - newWeightedScore);

  const updates = {
    [`subjectPerformanceIndex.${targetSub}`]: {
      correct: newCorrect,
      attempted: newAttempted,
      accuracy: newAccuracy,
      weightedScore: newWeightedScore
    },
    [`weakAreas.${targetSub}`]: newWeakAreaValue,
    quizzesDone: increment(1),
    totalPoints: increment(score * 5), // Reward 5 points per correct quiz answer
    updatedAt: new Date().toISOString()
  };

  try {
    await updateDoc(doc(db, "users", uid), updates);
  } catch (e) {
    console.error("Quiz record sync failed:", e);
  }
}

/**
 * Persists basic study session telemetry (hours watched, flashcards)
 */
export async function recordTelemetryActivity(uid: string, increments: { hours?: number, flashcards?: number }) {
  try {
    const updates: any = { updatedAt: new Date().toISOString() };
    if (increments.hours) updates.studyHours = increment(increments.hours);
    if (increments.flashcards) updates.flashcardsCompleted = increment(increments.flashcards);
    
    await updateDoc(doc(db, "users", uid), updates);
  } catch (e) {
    console.error("Telemetry sync failed", e);
  }
}
