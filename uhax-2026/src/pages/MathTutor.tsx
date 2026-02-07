import { Play, FileText, HelpCircle } from 'lucide-react';

const MathTutor = () => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">AI Math Tutor</h1>
        <p className="text-gray-500 dark:text-gray-400">Personalized learning with AI-driven lessons.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Lesson Area */}
          <div className="bg-black aspect-video rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer">
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
             <Play className="w-16 h-16 text-white z-20 opacity-80 group-hover:opacity-100 transition-opacity" />
             <div className="absolute bottom-6 left-6 z-20">
               <h3 className="text-white text-xl font-bold">Introduction to Linear Algebra</h3>
               <p className="text-gray-200">Chapter 1 • 15 min</p>
             </div>
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Chat with AI Tutor</h2>
            <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-4 overflow-y-auto">
               <div className="flex gap-3 mb-4">
                 <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">AI</div>
                 <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg rounded-tl-none text-sm max-w-[80%]">
                   Hi! I'm your AI Tutor. Today we're learning about Matrices. Ready to start?
                 </div>
               </div>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ask a question..." 
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Send</button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Sidebar Materials */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-4">Class Materials</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                <FileText className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Worksheet 1.1</p>
                  <p className="text-xs text-gray-500">Practice Problems</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                <HelpCircle className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-sm">Quiz 1</p>
                  <p className="text-xs text-gray-500">Test your knowledge</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathTutor;
