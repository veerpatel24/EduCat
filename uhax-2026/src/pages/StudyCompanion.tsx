import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Camera } from 'lucide-react';

const StudyCompanion = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Play a sound here
      if (mode === 'focus') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('focus');
        setTimeLeft(25 * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const handleModeChange = (newMode: 'focus' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Study Companion</h1>
        <p className="text-gray-500 dark:text-gray-400">Stay focused with attention tracking and Pomodoro timer.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pomodoro Timer */}
        <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
          <div className="mb-6">
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <button 
                onClick={() => handleModeChange('focus')}
                className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${mode === 'focus' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500'}`}
              >
                Focus
              </button>
              <button 
                onClick={() => handleModeChange('break')}
                className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${mode === 'break' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500'}`}
              >
                Break
              </button>
            </div>
          </div>

          <div className="text-7xl font-mono font-bold tracking-tighter mb-8 tabular-nums">
            {formatTime(timeLeft)}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={toggleTimer}
              className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            <button 
              onClick={resetTimer}
              className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Attention Tracking Preview */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Attention Monitor</h3>
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Active
            </span>
          </div>
          
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="text-center text-gray-500">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Camera Preview</p>
            </div>
            
            {/* Overlay simulation */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg text-xs text-white">
              Focus Score: 92%
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>Our AI analyzes your facial cues to detect fatigue or distraction. Your video data is processed locally and never stored.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyCompanion;
