import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

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
        <h1 className="text-3xl font-bold">Pomodoro Clock</h1>
        <p className="text-gray-500 dark:text-gray-400">Stay focused with our built-in Pomodoro timer.</p>
      </header>

      <div className="max-w-2xl mx-auto">
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
      </div>
    </div>
  );
};

export default StudyCompanion;
