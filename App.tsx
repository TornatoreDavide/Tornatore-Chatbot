import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { VeoAnimator } from './components/VeoAnimator';
import { MessageSquare, Video, Sun, Moon, BookOpen, GraduationCap, Sparkles } from 'lucide-react';

enum Tab {
  CHAT = 'chat',
  VEO = 'veo'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CHAT);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Intro State
  const [showIntro, setShowIntro] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleEnterApp = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowIntro(false);
    }, 800);
  };

  return (
    <div className={`h-screen w-screen flex flex-col md:flex-row overflow-hidden transition-all duration-500 relative font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* AMBIENT BACKGROUND GRADIENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob ${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-200'}`}></div>
        <div className={`absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000 ${isDarkMode ? 'bg-purple-900' : 'bg-rose-200'}`}></div>
        <div className={`absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000 ${isDarkMode ? 'bg-slate-800' : 'bg-blue-200'}`}></div>
      </div>

      {/* INTRO ANIMATION OVERLAY */}
      {showIntro && (
        <div 
          onClick={handleEnterApp}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isExiting ? 'opacity-0 scale-110 pointer-events-none blur-xl' : 'opacity-100'
          } ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}
        >
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
             <BookOpen className="absolute top-10 left-10 w-32 h-32 text-slate-900 animate-pulse" />
             <GraduationCap className="absolute bottom-10 right-10 w-32 h-32 text-slate-900 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>

          <div className="relative flex flex-col items-center gap-8 z-10 animate-in fade-in zoom-in duration-1000">
            {/* Logo Image with Glow */}
            <div className="relative group">
                <div className={`absolute -inset-4 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition duration-500 ${isDarkMode ? 'bg-indigo-500' : 'bg-indigo-300'}`}></div>
                <img 
                src="https://media.licdn.com/dms/image/v2/D4E0BAQGUnalrju41_g/company-logo_200_200/company-logo_200_200/0/1719256847576?e=2147483647&v=beta&t=tBNpr_BYPpj2lshydYEX5XqZsq8X9nwkqK8sedVHgWQ" 
                alt="ISIS Romagnosi" 
                className="relative w-36 h-36 object-contain mb-4 animate-[bounce_3s_infinite]"
                />
            </div>

            {/* School Logo Colors Bars Animation */}
            <div className="flex items-end gap-3 h-16">
              <div className="w-3 bg-[#009640] rounded-full animate-[bounce_1s_infinite] shadow-[0_0_15px_rgba(0,150,64,0.5)]" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 bg-[#E30613] rounded-full animate-[bounce_1s_infinite] shadow-[0_0_15px_rgba(227,6,19,0.5)]" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 bg-[#FFF200] rounded-full animate-[bounce_1s_infinite] shadow-[0_0_15px_rgba(255,242,0,0.5)]" style={{ animationDelay: '300ms' }}></div>
              <div className="w-3 bg-[#1D1D1B] rounded-full animate-[bounce_1s_infinite] shadow-[0_0_15px_rgba(29,29,27,0.5)]" style={{ animationDelay: '450ms' }}></div>
            </div>

            <div className="text-center space-y-3 mt-4">
              <h1 className={`text-4xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                ISIS G.D. ROMAGNOSI
              </h1>
              <p className={`font-medium tracking-[0.3em] text-sm uppercase ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                Orientamento & Futuro
              </p>
            </div>

            <div className="mt-12">
              <span className={`px-8 py-3 rounded-full border border-dashed animate-pulse text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  isDarkMode 
                  ? 'border-slate-700 text-slate-400 hover:text-white hover:border-white hover:bg-white/10' 
                  : 'border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-900 hover:bg-slate-100'
              }`}>
                Clicca per entrare
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation (Glassmorphism) */}
      <div className={`w-full md:w-72 flex-shrink-0 flex flex-col backdrop-blur-xl border-r z-20 transition-all duration-300 ${
        isDarkMode 
        ? 'bg-slate-900/60 border-slate-800/50' 
        : 'bg-white/60 border-slate-200/50'
      }`}>
        <div className="p-8 flex items-center gap-4">
          <div className={`p-2 rounded-2xl shadow-lg ${isDarkMode ? 'bg-white' : 'bg-white'}`}>
             <img 
                src="https://media.licdn.com/dms/image/v2/D4E0BAQGUnalrju41_g/company-logo_200_200/company-logo_200_200/0/1719256847576?e=2147483647&v=beta&t=tBNpr_BYPpj2lshydYEX5XqZsq8X9nwkqK8sedVHgWQ" 
                alt="ISIS Romagnosi Logo" 
                className="h-10 w-10 object-contain" 
            />
          </div>
          <div>
             <h1 className={`font-bold text-xl leading-none tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>SchoolBuddy</h1>
             <span className="text-rose-500 font-medium text-xs tracking-wide">Veo Studio AI</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-3">
          <button
            onClick={() => setActiveTab(Tab.CHAT)}
            className={`w-full group relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-medium text-sm overflow-hidden ${
              activeTab === Tab.CHAT
                ? (isDarkMode ? 'text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'text-indigo-900 shadow-[0_0_20px_rgba(79,70,229,0.15)]')
                : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50')
            }`}
          >
            {activeTab === Tab.CHAT && (
                <div className={`absolute inset-0 opacity-100 transition-opacity ${isDarkMode ? 'bg-gradient-to-r from-indigo-600 to-violet-600' : 'bg-gradient-to-r from-indigo-100 to-violet-100'}`}></div>
            )}
            <div className="relative z-10 flex items-center gap-4">
                 <div className={`p-2 rounded-lg transition-colors ${activeTab === Tab.CHAT ? (isDarkMode ? 'bg-white/20' : 'bg-indigo-200') : 'bg-transparent'}`}>
                     <MessageSquare size={18} />
                 </div>
                 <span>School Assistant</span>
            </div>
            {activeTab === Tab.CHAT && <div className="absolute right-4 w-2 h-2 rounded-full bg-indigo-400 animate-pulse z-10"></div>}
          </button>
          
          <button
            onClick={() => setActiveTab(Tab.VEO)}
            className={`w-full group relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-medium text-sm overflow-hidden ${
              activeTab === Tab.VEO
                ? (isDarkMode ? 'text-white shadow-[0_0_20px_rgba(225,29,72,0.3)]' : 'text-rose-900 shadow-[0_0_20px_rgba(225,29,72,0.15)]')
                : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50')
            }`}
          >
             {activeTab === Tab.VEO && (
                <div className={`absolute inset-0 opacity-100 transition-opacity ${isDarkMode ? 'bg-gradient-to-r from-rose-600 to-pink-600' : 'bg-gradient-to-r from-rose-100 to-pink-100'}`}></div>
            )}
            <div className="relative z-10 flex items-center gap-4">
                <div className={`p-2 rounded-lg transition-colors ${activeTab === Tab.VEO ? (isDarkMode ? 'bg-white/20' : 'bg-rose-200') : 'bg-transparent'}`}>
                    <Video size={18} />
                </div>
                <span>Veo Animator</span>
            </div>
            {activeTab === Tab.VEO && <div className="absolute right-4 w-2 h-2 rounded-full bg-rose-400 animate-pulse z-10"></div>}
          </button>
            
          <div className="mt-8 px-4">
             <div className={`h-px w-full ${isDarkMode ? 'bg-gradient-to-r from-transparent via-slate-700 to-transparent' : 'bg-gradient-to-r from-transparent via-slate-200 to-transparent'}`}></div>
             <p 
                style={{ fontFamily: "Verdana, Arial, Helvetica, sans-serif" }}
                className={`mt-6 text-[11px] leading-relaxed text-center opacity-60 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
             >
                I tuoi dati non verranno salvati e diffusi su internet ma verranno cancellati alla fine della conversazione 
             </p>
          </div>

        </nav>

        <div className="p-6">
          <button
            onClick={toggleTheme}
            className={`w-full group mb-4 flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-all duration-300 border ${
               isDarkMode 
               ? 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600' 
               : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
                {isDarkMode ? <Moon size={14} className="text-indigo-400" /> : <Sun size={14} className="text-amber-500" />}
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-300 ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
          </button>

          <div className={`p-4 rounded-xl backdrop-blur-sm border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/60 border-slate-200/50'}`}>
            <div className="flex items-center gap-2 text-[10px] text-green-500 font-bold tracking-wider uppercase mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Systems Online
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Gemini 2.5 Flash <span className="opacity-30 mx-1">|</span> Veo 3.1
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 h-full relative overflow-hidden p-4 md:p-8 z-10">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          {activeTab === Tab.CHAT ? (
            <ChatInterface isDarkMode={isDarkMode} />
          ) : (
            <VeoAnimator isDarkMode={isDarkMode} />
          )}
        </div>
      </main>
      
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default App;