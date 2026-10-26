import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  favorites: string[];
  savedPlannersCount: number;
  lastActive: string;
  bestGameScore?: number;
}

export interface GameScoreRecord {
  id?: string;
  playerName: string;
  score: number;
  distance: number;
  coresCollected: number;
  timestamp: string;
  userId?: string;
}

/**
 * Sign in using Google Sign-In via Firebase Auth
 */
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  await syncUserProfile(user);
  return user;
}

/**
 * Sign out current authenticated user
 */
export async function logOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Sync or create user record in Firestore
 */
export async function syncUserProfile(user: User): Promise<UserProfileData> {
  const userDocRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userDocRef);

  if (snap.exists()) {
    const existing = snap.data() as UserProfileData;
    const updated: Partial<UserProfileData> = {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastActive: new Date().toISOString(),
    };
    await updateDoc(userDocRef, updated);
    return { ...existing, ...updated };
  } else {
    const newProfile: UserProfileData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'ToolCrest Explorer',
      photoURL: user.photoURL,
      favorites: ['merge-pdf', 'compress-pdf', 'qr-generator'],
      savedPlannersCount: 0,
      lastActive: new Date().toISOString(),
      bestGameScore: 0,
    };
    await setDoc(userDocRef, newProfile);
    return newProfile;
  }
}

/**
 * Fetch profile data for a user
 */
export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch user profile:', err);
    return null;
  }
}

/**
 * Toggle favorite tool for user
 */
export async function toggleUserFavorite(
  userId: string,
  toolSlug: string,
  currentFavorites: string[]
): Promise<string[]> {
  const isFav = currentFavorites.includes(toolSlug);
  const newFavs = isFav
    ? currentFavorites.filter((s) => s !== toolSlug)
    : [...currentFavorites, toolSlug];

  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { favorites: newFavs });
  } catch (err) {
    console.warn('Could not update user favorites in Firestore:', err);
  }
  return newFavs;
}

/**
 * Save game score to Firestore leaderboard
 */
export async function saveGameScore(scoreData: {
  playerName: string;
  score: number;
  distance: number;
  coresCollected: number;
  userId?: string;
}): Promise<void> {
  try {
    const colRef = collection(db, 'game_leaderboard');
    await addDoc(colRef, {
      ...scoreData,
      timestamp: new Date().toISOString(),
    });

    // Update user personal best if signed in
    if (scoreData.userId) {
      const userRef = doc(db, 'users', scoreData.userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const prevBest = (snap.data() as UserProfileData).bestGameScore || 0;
        if (scoreData.score > prevBest) {
          await updateDoc(userRef, { bestGameScore: scoreData.score });
        }
      }
    }
  } catch (err) {
    console.warn('Could not record game score:', err);
  }
}

/**
 * Fetch top game scores from Firestore
 */
export async function getTopGameScores(limitCount: number = 10): Promise<GameScoreRecord[]> {
  try {
    const colRef = collection(db, 'game_leaderboard');
    const q = query(colRef, orderBy('score', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<GameScoreRecord, 'id'>),
    }));
  } catch (err) {
    console.warn('Could not load leaderboard scores:', err);
    return [
      { id: 'mock1', playerName: 'ApexPilot', score: 2850, distance: 1420, coresCollected: 38, timestamp: new Date().toISOString() },
      { id: 'mock2', playerName: 'GoldHex', score: 2190, distance: 1100, coresCollected: 29, timestamp: new Date().toISOString() },
      { id: 'mock3', playerName: 'CrestRunner', score: 1740, distance: 890, coresCollected: 22, timestamp: new Date().toISOString() },
    ];
  }
}
