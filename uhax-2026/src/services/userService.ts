import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface UserProfile {
  uid: string;
  email: string;
  points: number;
  createdAt: string;
  studyTime: number; // in minutes
}

export interface UserActivity {
  id?: string;
  uid: string;
  type: 'ai_tutor' | 'pomodoro' | 'assignment' | 'other';
  title: string;
  description: string;
  timestamp: string;
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

export const addUserActivity = async (activity: Omit<UserActivity, 'id'>) => {
  try {
    const activitiesRef = collection(db, 'activities');
    await addDoc(activitiesRef, activity);
  } catch (error) {
    console.error("Error adding activity:", error);
  }
};

export const getUserActivities = async (uid: string, limitCount = 5) => {
  try {
    const activitiesRef = collection(db, 'activities');
    const q = query(
      activitiesRef, 
      where('uid', '==', uid),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserActivity[];
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
};
