import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface UserProfile {
  uid: string;
  email: string;
  points: number;
  createdAt: string;
  studyTime: number; // in minutes
}

export const createUserProfile = async (uid: string, email: string) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const newProfile: UserProfile = {
      uid,
      email,
      points: 0,
      createdAt: new Date().toISOString(),
      studyTime: 0
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  }
  
  return userSnap.data() as UserProfile;
};

export const getUserProfile = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

export const updateUserPoints = async (uid: string, points: number) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { points });
};
