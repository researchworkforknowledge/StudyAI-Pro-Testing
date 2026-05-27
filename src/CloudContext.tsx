import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./useAuth";
import { useCloudProfile as useCloudProfileHook } from "./hooks/useCloudProfile";
import { UserProfileSchema } from "./lib/telemetryHandlers";

interface CloudContextType {
  profile: UserProfileSchema | null;
  profileLoading: boolean;
  syncActivity: (increments: { hours?: number; flashcards?: number; quizzesDone?: number }) => Promise<void>;
  recordQuiz: (subject: string, score: number, total: number) => Promise<void>;
}

const CloudContext = createContext<CloudContextType>({
  profile: null,
  profileLoading: true,
  syncActivity: async () => {},
  recordQuiz: async () => {}
});

export const CloudProvider = ({ children }: { children: ReactNode }) => {
  const { profile, profileLoading } = useCloudProfileHook();

  const syncActivity = async (increments: { hours?: number; flashcards?: number }) => {
    if (profile) {
      const { recordTelemetryActivity } = await import("./lib/telemetryHandlers");
      await recordTelemetryActivity(profile.uid, increments);
    }
  };

  const recordQuiz = async (subject: string, score: number, total: number) => {
    if (profile) {
      const { recordSubjectQuizResult } = await import("./lib/telemetryHandlers");
      await recordSubjectQuizResult(profile.uid, subject, score, total, profile);
    }
  };

  return (
    <CloudContext.Provider value={{ profile, profileLoading, syncActivity, recordQuiz }}>
      {children}
    </CloudContext.Provider>
  );
};

export const useCloud = () => useContext(CloudContext);
