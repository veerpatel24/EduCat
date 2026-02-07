import { FileText, HelpCircle, Send } from 'lucide-react';

const MathTutor = () => {
  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      <header className="flex-none">
        <h1 className="text-3xl font-bold">AI Math Tutor</h1>
        <p className="text-gray-500 dark:text-gray-400">Personalized learning with AI-driven lessons.</p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <div className="lg:col-span-2 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-semibold">Chat with AI Tutor</h2>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
             <div className="flex gap-3 mb-4">
               <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">AI</div>
               <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg rounded-tl-none text-sm max-w-[80%] shadow-sm">
                 Hi! I'm your AI Tutor. Today we're learning about Matrices. Ready to start?
               </div>
             </div>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ask a question..." 
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <button className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors flex items-center gap-2">
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6 flex flex-col">
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
