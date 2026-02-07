import { useState, useEffect } from 'react';
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  Timestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db as firestore, auth } from '../firebase';

// Interfaces
export interface Assignment {
  id: string;
  name: string;
  description: string;
  focusMode: boolean;
  duration: number; // in minutes
  category: string;
  status: 'pending' | 'completed';
  createdAt: Date | string; // JSON stores dates as strings
}

export interface Category {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface UserStats {
  coins: number;
  streak: number;
  lastLogin: string; // ISO Date string
  unlockedMonsters: string[]; // List of image filenames
}

interface DBData {
  assignments: Assignment[];
  categories: Category[];
  stats: UserStats;
}

// Global variable to track if we are in Electron
const isElectron = 'ipcRenderer' in window;

// Helper to convert Firestore Timestamps to ISO strings
const convertTimestamps = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Timestamp) return obj.toDate().toISOString();
  if (Array.isArray(obj)) return obj.map(convertTimestamps);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = convertTimestamps(obj[key]);
    }
    return result;
  }
  return obj;
};

class HybridDB {
  private data: DBData = { 
    assignments: [], 
    categories: [],
    stats: { coins: 0, streak: 0, lastLogin: new Date().toISOString(), unlockedMonsters: [] }
  };
  private listeners: Set<() => void> = new Set();
  private userId: string | null = null;
  private unsubscribeSnapshot: (() => void) | null = null;
  
  public assignments: TableWrapper<Assignment>;
  public categories: TableWrapper<Category>;
  public stats: StatsWrapper;

  constructor() {
    this.assignments = new TableWrapper<Assignment>(this, 'assignments');
    this.categories = new TableWrapper<Category>(this, 'categories');
    this.stats = new StatsWrapper(this);
    
    // Listen for auth changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.userId = user.uid;
        this.connectFirestore();
      } else {
        this.cleanup();
      }
    });
  }

  private cleanup() {
    this.userId = null;
    this.data = { 
      assignments: [], 
      categories: [],
      stats: { coins: 0, streak: 0, lastLogin: new Date().toISOString(), unlockedMonsters: [] }
    };
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null;
    }
    this.notify();
  }

  private connectFirestore() {
    if (!this.userId) return;

    const userDocRef = doc(firestore, 'users', this.userId);

    // Subscribe to real-time updates
    this.unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const rawData = docSnap.data();
        const cleanData = convertTimestamps(rawData) as DBData;
        
        // Ensure structure matches
        this.data = {
          assignments: cleanData.assignments || [],
          categories: cleanData.categories || [],
          stats: cleanData.stats || { coins: 0, streak: 0, lastLogin: new Date().toISOString(), unlockedMonsters: [] }
        };
        
        // Ensure Monster 001 is always unlocked
        if (!this.data.stats.unlockedMonsters.includes('monster-001')) {
          this.data.stats.unlockedMonsters.push('monster-001');
          this.save();
        }

        this.checkStreak();
      } else {
        // Document doesn't exist.
        // Seed defaults if no data exists
        this.seedDefaults();
      }
      this.notify();
    }, (error) => {
      console.error("Firestore subscription error:", error);
    });
  }

  private seedDefaults() {
    const now = new Date().toISOString();
    // Only seed if empty
    if (this.data.categories.length === 0) {
      this.data.categories = [
        { id: crypto.randomUUID(), name: 'Homework', isDefault: true },
        { id: crypto.randomUUID(), name: 'Project', isDefault: true },
        { id: crypto.randomUUID(), name: 'Exam Prep', isDefault: true },
        { id: crypto.randomUUID(), name: 'Extracurricular Learning', isDefault: true },
      ];
      this.data.stats = {
        coins: 0,
        streak: 1, // Start with 1 day streak
        lastLogin: now,
        unlockedMonsters: []
      };
      this.save();
    }
  }

  private checkStreak() {
    const now = new Date();
    const lastLogin = new Date(this.data.stats.lastLogin);
    
    // Calculate difference in days (ignoring time)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const lastDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()).getTime();
    
    const diffTime = Math.abs(today - lastDay);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    let needsSave = false;

    if (diffDays === 1) {
      // Streak continued
      this.data.stats.streak += 1;
      this.data.stats.lastLogin = now.toISOString();
      // Award points for streak
      const reward = 10 * this.data.stats.streak;
      this.data.stats.coins += reward;
      needsSave = true;
      console.log(`Streak incremented! Awarded ${reward} coins.`);
    } else if (diffDays > 1) {
      // Streak broken
      this.data.stats.streak = 1;
      this.data.stats.lastLogin = now.toISOString();
      needsSave = true;
      console.log('Streak broken. Reset to 1.');
    } else if (diffDays === 0) {
        // Same day, just update last login time if it's been a while (optional, but good for accuracy)
        // We won't update strictly to avoid constant writes, but if we wanted to track exact last active time we could.
    }

    if (needsSave) {
      this.save();
    }
  }

  // Save entire state to persistence layer (Firestore)
  public async save() {
    if (this.userId) {
      try {
        await setDoc(doc(firestore, 'users', this.userId), this.data);
      } catch (err) {
        console.error('Failed to save to Firestore:', err);
      }
    } else {
      console.warn("Cannot save: No user logged in");
    }
    this.notify();
  }

  public getData() {
    return this.data;
  }

  public setData(key: keyof DBData, value: any) {
    this.data[key] = value;
    this.save();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

// Wrapper to mimic a specific table
class TableWrapper<T extends { id: string }> {
  private db: HybridDB;
  private key: keyof DBData;

  constructor(db: HybridDB, key: keyof DBData) {
    this.db = db;
    this.key = key;
  }

  async toArray(): Promise<T[]> {
    return this.db.getData()[this.key] as unknown as T[];
  }

  async add(item: T): Promise<string> {
    const current = this.db.getData()[this.key] as unknown as T[];
    this.db.setData(this.key, [...current, item]);
    return item.id;
  }

  async bulkAdd(items: T[]): Promise<string> {
    const current = this.db.getData()[this.key] as unknown as T[];
    this.db.setData(this.key, [...current, ...items]);
    return items[items.length - 1]?.id;
  }

  async delete(id: string): Promise<void> {
    const current = this.db.getData()[this.key] as unknown as T[];
    this.db.setData(this.key, current.filter(item => item.id !== id));
  }

  async update(id: string, updates: Partial<T>): Promise<void> {
    const current = this.db.getData()[this.key] as unknown as T[];
    const index = current.findIndex(item => item.id === id);
    if (index !== -1) {
      const updatedItem = { ...current[index], ...updates };
      const newArray = [...current];
      newArray[index] = updatedItem;
      this.db.setData(this.key, newArray);
    }
  }
  
  async count(): Promise<number> {
    return (this.db.getData()[this.key] as unknown as T[]).length;
  }
  
  subscribe(listener: () => void) {
    return this.db.subscribe(listener);
  }
}

// Wrapper for Stats
class StatsWrapper {
  private db: HybridDB;

  constructor(db: HybridDB) {
    this.db = db;
  }

  async get(): Promise<UserStats> {
    return this.db.getData().stats;
  }

  async update(updates: Partial<UserStats>): Promise<void> {
    const current = this.db.getData().stats;
    this.db.setData('stats', { ...current, ...updates });
  }

  async unlockMonster(monsterId: string, cost: number): Promise<boolean> {
    const current = this.db.getData().stats;
    if (current.coins >= cost && !current.unlockedMonsters.includes(monsterId)) {
      this.db.setData('stats', {
        ...current,
        coins: current.coins - cost,
        unlockedMonsters: [...current.unlockedMonsters, monsterId]
      });
      return true;
    }
    return false;
  }
}

export const db = new HybridDB();

// Hook remains largely the same, but simplified
export function useLiveQuery<T>(
  querier: () => Promise<T> | T, 
  deps: any[] = []
): T | undefined {
  const [value, setValue] = useState<T>();

  useEffect(() => {
    let isMounted = true;
    
    const runQuery = async () => {
      try {
        const result = await querier();
        if (isMounted) {
          setValue(result);
        }
      } catch (err) {
        console.error("Query failed", err);
      }
    };

    runQuery();

    // Subscribe to DB changes
    const unsub = db.subscribe(runQuery);

    return () => {
      isMounted = false;
      unsub();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
}
