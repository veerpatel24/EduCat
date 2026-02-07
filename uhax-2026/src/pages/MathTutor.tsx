import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { generateAIResponse, ChatMessage } from '../services/openai';

// Add type definition for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface UIMessage extends ChatMessage {
  display?: string;
}

const MathTutor = () => {
  const [messages, setMessages] = useState<UIMessage[]>([
    { role: 'assistant', content: "Hi! I'm your AI Tutor powered by ChatGPT. I can help you with your studies. You can also upload class materials or talk to me directly!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice Recognition Logic
  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
      };
      
      recognition.start();
    } else {
      alert("Voice recognition is not supported in this browser.");
    }
  };

  // Text to Speech Logic
  const speakText = (text: string) => {
    if (isSpeakingEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !isLoading) return;

    const userMessage: UIMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const apiMessages = [...messages, userMessage].map(({ role, content }) => ({ role, content }));
    const response = await generateAIResponse(apiMessages);
    
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    speakText(response);
    setIsLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple text file reading
    // For PDFs, we would need a parser, but for now we support text-based files
    if (file.type === 'application/pdf') {
        alert("PDF parsing is not yet supported in the browser directly. Please convert to text or copy-paste content.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const fileMessage = `[User uploaded file: ${file.name}]\n\nContent:\n${text}`;
      
      // Store full content in state but display short message
      const userMessage: UIMessage = { 
          role: 'user', 
          content: fileMessage,
          display: `📄 Uploaded file: ${file.name}`
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      const apiMessages = [...messages, userMessage].map(({ role, content }) => ({ role, content }));
      const response = await generateAIResponse(apiMessages);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      speakText(response);
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      <header className="flex-none flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold">AI Tutor</h1>
            <p className="text-gray-500 dark:text-gray-400">Powered by ChatGPT-4o</p>
        </div>
        <button 
            onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
            className={`p-2 rounded-full transition-colors ${isSpeakingEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
            title={isSpeakingEnabled ? "Mute Voice" : "Enable Voice"}
        >
            {isSpeakingEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </header>

      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 space-y-4">
           {messages.map((msg, idx) => (
             <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${msg.role === 'assistant' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                 {msg.role === 'assistant' ? 'AI' : 'ME'}
               </div>
               <div className={`p-3 rounded-lg text-sm max-w-[80%] shadow-sm ${
                   msg.role === 'assistant' 
                    ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-none' 
                    : 'bg-blue-600 text-white rounded-tr-none'
               }`}>
                 <p className="whitespace-pre-wrap">{msg.display || msg.content}</p>
               </div>
             </div>
           ))}
           {isLoading && (
               <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">AI</div>
                   <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg rounded-tl-none text-sm shadow-sm">
                       <Loader2 className="w-4 h-4 animate-spin" />
                   </div>
               </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex gap-2 items-end">
            <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                accept=".txt,.md,.json,.js,.ts,.tsx,.csv"
                onChange={handleFileUpload}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-400 hover:text-blue-500 transition-colors"
                title="Upload Class Material (Text based)"
            >
                <Paperclip className="w-5 h-5" />
            </button>
            
            <div className="flex-1 relative">
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question..." 
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none max-h-32 min-h-[46px]"
                    rows={1}
                />
                <button 
                    onClick={startListening}
                    className={`absolute right-2 top-2 p-1.5 rounded-lg transition-colors ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'text-gray-400 hover:text-blue-500'}`}
                >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
            </div>

            <button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
              Upload text files for context. Voice supported.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MathTutor;
