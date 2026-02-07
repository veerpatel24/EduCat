import { useState, useEffect } from 'react';
import { Eye, Clock, Folder, Plus, PlusSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db, useLiveQuery, type Category } from '../services/db';

const CreateAssignment = () => {
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [duration, setDuration] = useState(30); // Default 30 mins
  const [category, setCategory] = useState('');
  
  // Categories State
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Database Queries
  const categories = useLiveQuery(
    () => db.categories.toArray()
  );

  // Set initial category when categories load
  useEffect(() => {
    if (categories && categories.length > 0 && !category) {
      // Use setTimeout to avoid synchronous state update warning
      const timer = setTimeout(() => {
        setCategory(categories[0].name);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [categories, category]);

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        await db.categories.add({
          id: crypto.randomUUID(),
          name: newCategory.trim(),
          isDefault: false
        });
        setCategory(newCategory.trim());
        setNewCategory('');
        setIsAddingCategory(false);
      } catch (error) {
        console.error('Failed to add category:', error);
      }
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter an assignment name");
      return;
    }
    try {
      await db.assignments.add({
        id: crypto.randomUUID(),
        name,
        description,
        focusMode,
        duration,
        category,
        status: 'pending',
        createdAt: new Date()
      });
      
      // Navigate to Pending Assignments
      navigate('/pending-assignments');
      
    } catch (error) {
      console.error('Failed to create assignment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Create Assignment</h1>
        <p className="text-gray-500 dark:text-gray-400">Add a new task to your schedule.</p>
      </header>

      <div className="max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <PlusSquare className="w-5 h-5 text-blue-500" />
            New Assignment Details
          </h2>
          
          <form onSubmit={handleCreateAssignment} className="space-y-5">
            {/* Field 1: Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assignment Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g., Calculus Problem Set 3"
              />
            </div>

            {/* Field 2: Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                placeholder="Details about the assignment..."
              />
            </div>

            {/* Field 3: Focus Mode (Eye Tracking) */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${focusMode ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-medium block">Focus Mode</span>
                  <span className="text-xs text-gray-500">Enable eye tracking to stay on task</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={focusMode}
                  onChange={(e) => setFocusMode(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Field 4: Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Focus Duration (Minutes)
              </label>
              <div className="flex flex-wrap gap-3 mb-3">
                {[10, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      duration === mins
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {mins} Minutes
                  </button>
                ))}
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Custom duration"
                />
              </div>
            </div>

            {/* Field 5: Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                  >
                    {categories?.map((cat: Category) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              {isAddingCategory && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="New category name"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCreateAssignment}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02]"
            >
              Create Assignment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignment;
