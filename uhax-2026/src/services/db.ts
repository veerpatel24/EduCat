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

interface DBData {
  assignments: Assignment[];
  categories: Category[];
}

// Global variable to track if we are in Electron
const isElectron = 'ipcRenderer' in window;

class HybridDB {
  private data: DBData = { assignments: [], categories: [] };
  private listeners: Set<() => void> = new Set();
  private initialized = false;

  public assignments: TableWrapper<Assignment>;
  public categories: TableWrapper<Category>;

  constructor() {
    this.assignments = new TableWrapper<Assignment>(this, 'assignments');
    this.categories = new TableWrapper<Category>(this, 'categories');
    this.init();
  }

  private async init() {
    if (isElectron) {
      try {
        const result = await (window as any).ipcRenderer.invoke('db:read');
        if (result) {
          this.data = result;
        }
      } catch (err) {
        console.error('Failed to load from Electron FS:', err);
      }
    } else {
      // Fallback to LocalStorage
      const stored = localStorage.getItem('eduflow-db');
      if (stored) {
        try {
          this.data = JSON.parse(stored);
        } catch {
          // ignore error
        }
      }
    }

    // Seed defaults if empty
    if (this.data.categories.length === 0) {
      this.data.categories = [
        { id: crypto.randomUUID(), name: 'Homework', isDefault: true },
        { id: crypto.randomUUID(), name: 'Project', isDefault: true },
        { id: crypto.randomUUID(), name: 'Exam Prep', isDefault: true },
        { id: crypto.randomUUID(), name: 'Extracurricular Learning', isDefault: true },
      ];
      this.save();
    }

    this.initialized = true;
    this.notify();
  }

  // Save entire state to persistence layer
  public async save() {
    if (isElectron) {
      try {
        await (window as any).ipcRenderer.invoke('db:write', this.data);
      } catch (err) {
        console.error('Failed to save to Electron FS:', err);
      }
    } else {
      localStorage.setItem('eduflow-db', JSON.stringify(this.data));
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
    return this.db.getData()[this.key] as T[];
  }

  async add(item: T): Promise<string> {
    const current = this.db.getData()[this.key] as T[];
    this.db.setData(this.key, [...current, item]);
    return item.id;
  }

  async bulkAdd(items: T[]): Promise<string> {
    const current = this.db.getData()[this.key] as T[];
    this.db.setData(this.key, [...current, ...items]);
    return items[items.length - 1]?.id;
  }

  async delete(id: string): Promise<void> {
    const current = this.db.getData()[this.key] as T[];
    this.db.setData(this.key, current.filter(item => item.id !== id));
  }
  
  async count(): Promise<number> {
    return (this.db.getData()[this.key] as T[]).length;
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
