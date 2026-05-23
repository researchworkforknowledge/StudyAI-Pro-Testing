import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, getDocFromServer, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Dynamic checker to verify if current configuration represents a real provisioned project
const isDummyConfig = 
  !firebaseConfig || 
  firebaseConfig.projectId.includes("dummy") || 
  firebaseConfig.apiKey.includes("FakeKey");

let app;
let auth: any = null;
let db: any = null;
let googleProvider: any = null;

if (!isDummyConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = (firebaseConfig as any).firestoreDatabaseId 
      ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId) 
      : getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });

    // Validate connection is online and active
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error: any) {
        if (error instanceof Error && error.message.includes("the client is offline")) {
          console.warn("Firebase client offline warning status indexed.");
        }
      }
    };
    testConnection();
  } catch (err) {
    console.error("Firebase initialisation critical failure:", err);
  }
} else {
  console.log("📝 Running in Local Storage database mode. Complete Firebase terms inside AI Studio UI to sync data cloud-wide across multiple devices.");
}

export { auth, db, googleProvider, isDummyConfig };

/**
 * Custom ABAC operation types mapping
 */
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Structured security policy exception interceptor
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Policy Violation Encountered: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Sync AppState to Firestore under user document
 */
export async function syncStateToFirestore(userId: string, state: any) {
  if (isDummyConfig || !db) return;
  const pathStr = `users/${userId}`;
  try {
    const payload = {
      userId,
      email: auth?.currentUser?.email || "",
      board: state.board,
      cls: state.cls,
      sub: state.sub,
      theme: state.theme,
      notes: state.notes || [],
      hw: state.hw || [],
      fc: state.fc || [],
      qt: state.qt || [],
      stats: state.stats || {},
      lastUpdated: new Date().toISOString()
    };
    await setDoc(doc(db, "users", userId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pathStr);
  }
}

/**
 * Load sync state from Firestore
 */
export async function fetchStateFromFirestore(userId: string): Promise<any | null> {
  if (isDummyConfig || !db) return null;
  const pathStr = `users/${userId}`;
  try {
    const docRef = doc(db, "users", userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, pathStr);
    return null;
  }
}

/**
 * Update the shared high-score leaderboard database document
 */
export async function syncUserXPToLeaderboard(userId: string, displayName: string, xp: number, avatar: string = "⚡") {
  if (isDummyConfig || !db) return;
  const pathStr = `leaderboard/${userId}`;
  try {
    const payload = {
      userId,
      name: displayName,
      xp: xp,
      avatar: avatar,
      lastActive: new Date().toISOString()
    };
    await setDoc(doc(db, "leaderboard", userId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pathStr);
  }
}

/**
 * Retrieve the top performers across all users in active database cloud
 */
export async function fetchLeaderboardFromFirestore(): Promise<any[]> {
  if (isDummyConfig || !db) return [];
  try {
    const q = query(collection(db, "leaderboard"), orderBy("xp", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    const results: any[] = [];
    querySnapshot.forEach((doc) => {
      results.push(doc.data());
    });
    return results;
  } catch (err) {
    console.error("Failed fetching live leaderboard:", err);
    return [];
  }
}

/**
 * Google Sign-in action popup trigger
 */
export async function signInWithGoogle() {
  if (isDummyConfig || !auth || !googleProvider) {
    throw new Error("PROVISION_REQUIRED");
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    if (err && (err.code === "auth/popup-closed-by-user" || err.message?.includes("popup-closed-by-user") || err.message?.includes("auth/popup-closed-by-user"))) {
      console.warn("Google authentication warning: popup was closed by the user or blocked by the browser.");
    } else {
      console.error("Google authentication error status: ", err);
    }
    throw err;
  }
}

/**
 * Log out current session
 */
export async function logOutFromFirebase() {
  if (isDummyConfig || !auth) return;
  await signOut(auth);
}
