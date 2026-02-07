import { useState, useEffect } from 'react';

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

// Simple LocalStorage Wrapper mimicking a DB Table
class JSONTable<T extends { id: string }> {
  private key: string;
  private listeners: Set<() => void>;

  constructor(key: string) {
    this.key = key;
    this.listeners = new Set();
    
    // Initialize if empty
    if (!localStorage.getItem(this.key)) {
      localStorage.setItem(this.key, JSON.stringify([]));
    }
  }

  // Get current data
  private get data(): T[] {
    try {
      return JSON.parse(localStorage.getItem(this.key) || '[]');
    } catch {
      return [];
    }
  }

  // Save data and notify
  private set data(val: T[]) {
    localStorage.setItem(this.key, JSON.stringify(val));
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // API mimicking Dexie for compatibility where possible
  async toArray(): Promise<T[]> {
    return this.data;
  }

  async add(item: T): Promise<string> {
    const current = this.data;
    this.data = [...current, item];
    return item.id;
  }

  async bulkAdd(items: T[]): Promise<string> {
    const current = this.data;
    this.data = [...current, ...items];
    return items[items.length - 1]?.id; // return last id
  }

  async delete(id: string): Promise<void> {
    const current = this.data;
    this.data = current.filter(item => item.id !== id);
  }
  
  // Helper to check if empty (for seeding)
  async count(): Promise<number> {
    return this.data.length;
  }
}

// Database Instance
class LocalDB {
  assignments: JSONTable<Assignment>;
  categories: JSONTable<Category>;

  constructor() {
    this.assignments = new JSONTable<Assignment>('assignments');
    this.categories = new JSONTable<Category>('categories');
    
    this.seed();
  }

  private async seed() {
    const count = await this.categories.count();
    if (count === 0) {
      await this.categories.bulkAdd([
        { id: crypto.randomUUID(), name: 'Homework', isDefault: true },
        { id: crypto.randomUUID(), name: 'Project', isDefault: true },
        { id: crypto.randomUUID(), name: 'Exam Prep', isDefault: true },
        { id: crypto.randomUUID(), name: 'Extracurricular Learning', isDefault: true },
      ]);
    }
  }
}

export const db = new LocalDB();

// Custom Hook to mimic useLiveQuery
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

    // Subscribe to both tables to trigger re-runs on any change
    const unsubAssignments = db.assignments.subscribe(runQuery);
    const unsubCategories = db.categories.subscribe(runQuery);

    return () => {
      isMounted = false;
      unsubAssignments();
      unsubCategories();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
}
