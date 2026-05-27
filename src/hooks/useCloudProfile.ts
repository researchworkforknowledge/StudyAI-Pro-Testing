import { useState, useEffect } from "react";
import { useAuth } from "../useAuth";
import { UserProfileSchema, hydrateUserProfile, validateAndUpdateStreak } from "../lib/telemetryHandlers";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export function useCloudProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfileSchema | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    let unsubscribe: any = null;

    const initialize = async () => {
      try {
        setProfileLoading(true);
        // Hydrate or create instantly
        const initialProfile = await hydrateUserProfile(user);
        
        // Ensure streak rules trigger synchronously on load
        const streakUpdates = await validateAndUpdateStreak(user.uid, initialProfile);
        if (streakUpdates) {
          Object.assign(initialProfile, streakUpdates); // Optimistic apply
        }
        
        setProfile(initialProfile);

        // Listen for live updates
        unsubscribe = onSnapshot(doc(db, "users", user.uid), (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfileSchema);
          }
          setProfileLoading(false);
        });

      } catch (err) {
        console.error("Cloud Profile Hydration failed:", err);
        setProfileLoading(false);
      }
    };

    initialize();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, authLoading]);

  return { profile, profileLoading, user, authLoading };
}
