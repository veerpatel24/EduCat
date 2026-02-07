import { useState, useEffect } from 'react';
import { Eye, Clock, Folder, Play, Pause, RotateCcw, CheckCircle, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { db, type Assignment, useLiveQuery } from '../services/db';

const PendingAssignments = () => {
  // Database Queries
  const data = useLiveQuery(async () => {
    const [assignments, categories] = await Promise.all([
      db.assignments.toArray(),
      db.categories.toArray()
    ]);
    return { assignments, categories };
  });

  const assignments = data?.assignments || [];
  const categories = data?.categories || [];

  // Group assignments by category
  const assignmentsByCategory = categories.reduce((acc, cat) => {
    acc[cat.name] = assignments
      .filter(a => a.category === cat.name)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return acc;
  }, {} as Record<string, Assignment[]>);

  // Handle "Other" or deleted categories
  const otherAssignments = assignments.filter(a => !categories.some(c => c.name === a.category));
  if (otherAssignments.length > 0) {
    assignmentsByCategory['Uncategorized'] = otherAssignments;
  }

  // Expanded State (default all open)
  // We only track collapsed categories (value === false). 
  // If key is missing, it's considered expanded.
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => ({ 
      ...prev, 
      [name]: prev[name] === false ? true : false 
    }));
  };

  // Timer State (for active assignment)
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  
      return () => clearInterval(interval);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTimerRunning]); // Removed timeLeft dependency

  const handleDeleteAssignment = async (id: string) => {
    try {
      if (activeAssignmentId === id) {
        setActiveAssignmentId(null);
        setIsTimerRunning(false);
      }
      await db.assignments.delete(id);
    } catch (error) {
      console.error('Failed to delete assignment:', error);
    }
  };

  const startAssignment = (assignment: Assignment) => {
    setActiveAssignmentId(assignment.id);
    setTimeLeft(assignment.duration * 60);
    setIsTimerRunning(true);
    if (assignment.focusMode) {
      console.log("Starting eye tracking focus mode...");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activeAssignment = assignments?.find((a: Assignment) => a.id === activeAssignmentId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Pending Assignments</h1>
        <p className="text-gray-500 dark:text-gray-400">Track and complete your tasks.</p>
      </header>

      <div className="space-y-6 max-w-4xl">
        {/* Active Timer Card */}
        {activeAssignment && (
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-xl shadow-lg p-6 border border-blue-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-medium text-blue-200">Current Focus</h3>
                <p className="text-2xl font-bold mt-1">
                  {activeAssignment.name}
                </p>
              </div>
              {activeAssignment.focusMode && (
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
                    setTimeLeft(activeAssignment.duration * 60);
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
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center justify-between">
            <span>Your Assignments</span>
            <span className="text-sm font-normal text-gray-500">{assignments.length} tasks total</span>
          </h2>

          {assignments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-400">
              <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No assignments yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(assignmentsByCategory).map(([categoryName, categoryAssignments]) => {
                // Skip empty categories if desired, or keep them to show structure. 
                // Let's show them if they exist in the DB, but maybe visually indicate empty.
                const isOpen = expandedCategories[categoryName] !== false;
                
                return (
                  <div key={categoryName} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <button 
                      onClick={() => toggleCategory(categoryName)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isOpen ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                        <h3 className="font-semibold text-gray-700 dark:text-gray-200">{categoryName}</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          {categoryAssignments.length}
                        </span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-4 pt-0">
                        {categoryAssignments.length === 0 ? (
                          <div className="text-sm text-gray-400 italic py-2 pl-8">No pending assignments in this category.</div>
                        ) : (
                          <div className="space-y-3 mt-3">
                            {categoryAssignments.map((assignment: Assignment) => (
                              <div 
                                key={assignment.id}
                                className={`p-4 rounded-lg border transition-all hover:shadow-md group relative ${
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
                                  
                                  <div className="flex items-center gap-2">
                                    {!activeAssignmentId && (
                                      <button
                                        onClick={() => startAssignment(assignment)}
                                        className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                        title="Start Focus Session"
                                      >
                                        <Play className="w-5 h-5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteAssignment(assignment.id)}
                                      className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                                      title="Delete Assignment"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingAssignments;
