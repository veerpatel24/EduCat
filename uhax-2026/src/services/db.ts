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

interface DBData {
  assignments: Assignment[];
  categories: Category[];
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
  private data: DBData = { assignments: [], categories: [] };
  private listeners: Set<() => void> = new Set();
  private userId: string | null = null;
  private unsubscribeSnapshot: (() => void) | null = null;
  
  public assignments: TableWrapper<Assignment>;
  public categories: TableWrapper<Category>;

  constructor() {
    this.assignments = new TableWrapper<Assignment>(this, 'assignments');
    this.categories = new TableWrapper<Category>(this, 'categories');
    
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
    this.data = { assignments: [], categories: [] };
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
          categories: cleanData.categories || []
        };
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
    // Only seed if empty
    if (this.data.categories.length === 0) {
      this.data.categories = [
        { id: crypto.randomUUID(), name: 'Homework', isDefault: true },
        { id: crypto.randomUUID(), name: 'Project', isDefault: true },
        { id: crypto.randomUUID(), name: 'Exam Prep', isDefault: true },
        { id: crypto.randomUUID(), name: 'Extracurricular Learning', isDefault: true },
      ];
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

  public setData(key: keyof DBData, value: any[]) {
    this.data[key] = value as any;
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
  
  async count(): Promise<number> {
    return (this.db.getData()[this.key] as unknown as T[]).length;
  }
  
  subscribe(listener: () => void) {
    return this.db.subscribe(listener);
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
