import { useState } from 'react';
import { Eye, Clock, Folder, Plus, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';

interface Assignment {
  id: string;
  name: string;
  description: string;
  focusMode: boolean;
  duration: number; // in minutes
  category: string;
  status: 'pending' | 'completed';
}

const Assignments = () => {
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [duration, setDuration] = useState(30); // Default 30 mins
  const [category, setCategory] = useState('Homework');
  
  // Categories State
  const [categories, setCategories] = useState(['Homework', 'Project', 'Exam Prep', 'Extracurricular Learning']);
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Assignments List State (Mocking local storage/folder behavior)
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Timer State (for active assignment)
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setCategory(newCategory.trim());
      setNewCategory('');
      setIsAddingCategory(false);
    }
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const newAssignment: Assignment = {
      id: crypto.randomUUID(),
      name,
      description,
      focusMode,
      duration,
      category,
      status: 'pending',
    };
    setAssignments([newAssignment, ...assignments]);
    
    // Reset form
    setName('');
    setDescription('');
    setFocusMode(false);
    setDuration(30);
  };

  const startAssignment = (assignment: Assignment) => {
    setActiveAssignmentId(assignment.id);
    setTimeLeft(assignment.duration * 60);
    setIsTimerRunning(true);
    // In a real implementation, this would trigger the eye-tracking service
    if (assignment.focusMode) {
      console.log("Starting eye tracking focus mode...");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your tasks and stay focused.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Assignment Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            New Assignment
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
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
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
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02]"
            >
              Create Assignment
            </button>
          </form>
        </div>

        {/* Assignments List & Active Timer */}
        <div className="space-y-6">
          {/* Active Timer Card */}
          {activeAssignmentId && (
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-xl shadow-lg p-6 border border-blue-800">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-medium text-blue-200">Current Focus</h3>
                  <p className="text-2xl font-bold mt-1">
                    {assignments.find(a => a.id === activeAssignmentId)?.name}
                  </p>
                </div>
                {assignments.find(a => a.id === activeAssignmentId)?.focusMode && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
                    <Eye className="w-4 h-4 animate-pulse" />
                    <span className="text-xs font-medium">Tracking Active</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center justify-center py-4">
                <div className="text-6xl font-mono font-bold tracking-wider mb-8">
                  {formatTime(timeLeft)}
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="p-4 rounded-full bg-blue-500 hover:bg-blue-400 text-white transition-colors shadow-lg shadow-blue-900/50"
                  >
                    {isTimerRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 pl-1" />}
                  </button>
                  <button
                    onClick={() => {
                      const duration = assignments.find(a => a.id === activeAssignmentId)?.duration || 0;
                      setTimeLeft(duration * 60);
                      setIsTimerRunning(false);
                    }}
                    className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                  >
                    <RotateCcw className="w-8 h-8" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveAssignmentId(null);
                      setIsTimerRunning(false);
                    }}
                    className="p-4 rounded-full bg-green-600 hover:bg-green-500 text-white transition-colors"
                  >
                    <CheckCircle className="w-8 h-8" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Assignments List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 min-h-[400px]">
            <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
              <span>Your Assignments</span>
              <span className="text-sm font-normal text-gray-500">{assignments.length} tasks</span>
            </h2>

            {assignments.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No assignments yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div 
                    key={assignment.id}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      activeAssignmentId === assignment.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{assignment.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{assignment.description}</p>
                        <div className="flex gap-2 mt-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            {assignment.category}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                            <Clock className="w-3 h-3" />
                            {assignment.duration}m
                          </span>
                          {assignment.focusMode && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                              <Eye className="w-3 h-3" />
                              Focus
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {!activeAssignmentId && (
                        <button
                          onClick={() => startAssignment(assignment)}
                          className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          title="Start Focus Session"
                        >
                          <Play className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assignments;
