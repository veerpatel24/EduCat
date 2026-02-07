import Dexie, { type EntityTable } from 'dexie';

interface Assignment {
  id: string;
  name: string;
  description: string;
  focusMode: boolean;
  duration: number; // in minutes
  category: string;
  status: 'pending' | 'completed';
  createdAt: Date;
}

interface Category {
  id: string;
  name: string;
  isDefault: boolean;
}

const db = new Dexie('EduFlowDatabase') as Dexie & {
  assignments: EntityTable<Assignment, 'id'>;
  categories: EntityTable<Category, 'id'>;
};

// Schema declaration:
db.version(1).stores({
  assignments: 'id, category, status, createdAt', // Primary key and indexed props
  categories: 'id, name'
});

// Seed default categories if not present
db.on('populate', () => {
  db.categories.bulkAdd([
    { id: crypto.randomUUID(), name: 'Homework', isDefault: true },
    { id: crypto.randomUUID(), name: 'Project', isDefault: true },
    { id: crypto.randomUUID(), name: 'Exam Prep', isDefault: true },
    { id: crypto.randomUUID(), name: 'Extracurricular Learning', isDefault: true },
  ]);
});

export type { Assignment, Category };
export { db };
