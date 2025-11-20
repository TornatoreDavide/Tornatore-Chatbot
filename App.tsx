
import React, { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { VeoAnimator } from './components/VeoAnimator';
import { MessageSquare, Video, Sun, Moon } from 'lucide-react';

enum Tab {
  CHAT = 'chat',
  VEO = 'veo'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CHAT);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`h-screen w-screen flex flex-col md:flex-row overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* Sidebar Navigation */}
      <div className={`w-full md:w-64 border-r flex flex-col flex-shrink-0 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className={`p-6 flex items-center gap-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <img 
            src="https://media.licdn.com/dms/image/v2/D4E0BAQGUnalrju41_g/company-logo_200_200/company-logo_200_200/0/1719256847576?e=2147483647&v=beta&t=tBNpr_BYPpj2lshydYEX5XqZsq8X9nwkqK8sedVHgWQ" 
            alt="ISIS Romagnosi Logo" 
            className={`h-12 w-auto object-contain transition-all duration-300 ${isDarkMode ? 'invert' : 'invert-0'}`}
          />
          <h1 className={`font-bold text-lg leading-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>SchoolBuddy<br/><span className="text-rose-500 font-normal text-sm">& Veo Studio</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab(Tab.CHAT)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
              activeTab === Tab.CHAT
                ? (isDarkMode ? 'bg-indigo-900/30 text-indigo-300 shadow-sm ring-1 ring-indigo-800' : 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200')
                : (isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700')
            }`}
          >
            <MessageSquare size={18} />
            School Assistant
          </button>
          
          <button
            onClick={() => setActiveTab(Tab.VEO)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
              activeTab === Tab.VEO
                ? (isDarkMode ? 'bg-rose-900/30 text-rose-300 shadow-sm ring-1 ring-rose-800' : 'bg-rose-50 text-rose-700 shadow-sm ring-1 ring-rose-200')
                : (isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700')
            }`}
          >
            <Video size={18} />
            Veo Animator
          </button>
        </nav>

        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          
          <button
            onClick={toggleTheme}
            className={`w-full mb-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
               isDarkMode 
               ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
               : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isDarkMode ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
          </button>

          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-xs mb-1 font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>System Status</p>
            <div className="flex items-center gap-2 text-xs text-green-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Gemini 3 Pro: Active
            </div>
            <div className="flex items-center gap-2 text-xs text-green-500 font-medium mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Veo 3.1: Active
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 h-full relative overflow-hidden p-4 md:p-6">
        <div className="max-w-5xl mx-auto h-full">
          {activeTab === Tab.CHAT ? (
            <ChatInterface isDarkMode={isDarkMode} />
          ) : (
            <VeoAnimator isDarkMode={isDarkMode} />
          )}
        </div>
      </main>
      
    </div>
  );
};

export default App;
