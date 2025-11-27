import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, Loader2, FileText, X, Volume2, StopCircle, VolumeX, Trash2, Sparkles, BookOpen } from 'lucide-react';
import { Chat } from "@google/genai";
import { createSchoolChat, generateSpeech } from '../services/geminiService';
import { Message, Role } from '../types';

// Helper to read file as base64
const readFileBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Regex to clean text for TTS
const cleanTextForTTS = (text: string): string => {
  let clean = text;
  clean = clean.replace(/[*#_`]/g, '');
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  clean = clean.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '');
  clean = clean.replace(/\s+/g, ' ').trim();
  return clean;
};

// --- LITERARY AVATAR DATA & COMPONENT ---
const LITERARY_QUOTES = [
  { text: "Fatti non foste a viver come bruti, ma per seguir virtute e canoscenza.", author: "Dante Alighieri", context: "Divina Commedia" },
  { text: "L'istruzione è l'arma più potente che puoi utilizzare per cambiare il mondo.", author: "Nelson Mandela", context: "Ispirazione" },
  { text: "Carneade! Chi era costui?", author: "Alessandro Manzoni", context: "I Promessi Sposi" },
  { text: "Il naufragar m'è dolce in questo mare.", author: "Giacomo Leopardi", context: "L'Infinito" },
  { text: "Volere è poco; bisogna volere fortemente.", author: "Vittorio Alfieri", context: "Determinazione" },
  { text: "Libertà va cercando, ch'è sì cara, come sa chi per lei vita rifiuta.", author: "Dante Alighieri", context: "Purgatorio" },
  { text: "La cultura è l'unico bene che diviso tra tutti anziché diminuire aumenta.", author: "Hans Georg Gadamer", context: "Filosofia" }
];

interface LiteraryAvatarProps {
  isDarkMode: boolean;
  isTalking: boolean;
}

const LiteraryAvatar: React.FC<LiteraryAvatarProps> = ({ isDarkMode, isTalking }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % LITERARY_QUOTES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentQuote = LITERARY_QUOTES[quoteIndex];
  const faceColor = isDarkMode ? '#4f46e5' : '#6366f1'; 
  const bodyColor = isDarkMode ? '#312e81' : '#e0e7ff'; 
  const eyeColor = isTalking ? '#ef4444' : (isDarkMode ? '#22d3ee' : '#0ea5e9');

  return (
    <div className={`hidden lg:flex flex-col w-80 ml-6 rounded-[2rem] overflow-hidden transition-all duration-500 shadow-2xl h-[650px] backdrop-blur-xl border ${isDarkMode ? 'bg-slate-900/40 border-slate-700/30' : 'bg-white/40 border-white/50'}`}>
      {/* Avatar Animation Area */}
      <div className="relative flex-[2] w-full flex items-center justify-center overflow-hidden group">
         <div className={`absolute inset-0 opacity-40 transition-colors duration-700 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${isDarkMode ? 'from-indigo-900/50 via-transparent to-transparent' : 'from-indigo-300/50 via-transparent to-transparent'}`}></div>
         
         <div className="relative z-10 transform scale-125 transition-transform duration-500 hover:scale-135 cursor-pointer">
            {/* Robot Head */}
            <div 
              className="relative w-32 h-28 rounded-3xl border-4 border-slate-700/80 shadow-2xl transition-transform duration-300 backdrop-blur-sm"
              style={{ 
                backgroundColor: faceColor,
                transform: isTalking ? 'scale(1.05)' : 'scale(1)',
                animation: isTalking ? 'head-bop 0.5s infinite alternate ease-in-out' : 'float 4s infinite ease-in-out'
              }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-black/20 to-white/20 pointer-events-none"></div>
              
              {/* Antenna */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                 <div className="w-1 h-6 bg-slate-500"></div>
                 <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-colors ${isTalking ? 'bg-red-500 text-red-500 animate-pulse' : 'bg-yellow-400 text-yellow-400'}`}></div>
              </div>

              {/* Ears */}
              <div className="absolute top-8 -left-3 w-3 h-8 bg-slate-600 rounded-l-lg border-l border-t border-b border-slate-800"></div>
              <div className="absolute top-8 -right-3 w-3 h-8 bg-slate-600 rounded-r-lg border-r border-t border-b border-slate-800"></div>

              {/* Face Content */}
              <div className="absolute inset-2 bg-slate-900 rounded-2xl flex flex-col items-center justify-center gap-4 border border-slate-700/50 shadow-inner">
                {/* Eyes Container */}
                <div className="flex gap-6 mt-2">
                   <div className="relative w-8 h-8 bg-black rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-700">
                      <div className="w-full h-full rounded-full animate-[blink_4s_infinite]" style={{ backgroundColor: eyeColor, boxShadow: `0 0 10px ${eyeColor}` }}></div>
                   </div>
                   <div className="relative w-8 h-8 bg-black rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-700">
                      <div className="w-full h-full rounded-full animate-[blink_4s_infinite]" style={{ backgroundColor: eyeColor, boxShadow: `0 0 10px ${eyeColor}`, animationDelay: '0.1s' }}></div>
                   </div>
                </div>
                {/* Mouth */}
                <div className="w-12 h-3 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
                   {isTalking ? (
                     <div className="w-8 bg-white rounded-full animate-[speak-animation_0.2s_infinite_alternate]" style={{ height: '2px' }}></div>
                   ) : (
                     <div className="w-6 h-1 bg-slate-500 rounded-full"></div>
                   )}
                </div>
              </div>
            </div>

            {/* Robot Neck & Body */}
            <div className="w-12 h-6 bg-slate-700 mx-auto -mt-2 border-x-4 border-slate-800 relative z-0"></div>
            <div 
              className="w-40 h-12 rounded-t-[3rem] mx-auto -mt-1 border-t-4 border-slate-700 relative z-0 shadow-lg"
              style={{ backgroundColor: bodyColor }}
            >
                <div className="absolute inset-0 rounded-t-[3rem] bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
            </div>
         </div>
      </div>

      {/* Quote Section */}
      <div className={`flex-1 p-8 flex flex-col justify-center relative backdrop-blur-md ${isDarkMode ? 'bg-slate-950/30' : 'bg-white/60'}`}>
        <div className={`absolute top-0 left-0 w-full h-px ${isDarkMode ? 'bg-gradient-to-r from-transparent via-slate-700 to-transparent' : 'bg-gradient-to-r from-transparent via-indigo-200 to-transparent'}`}></div>
        <Sparkles className={`absolute top-6 left-6 w-5 h-5 opacity-60 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
        
        <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-700" key={quoteIndex}>
          <p className={`font-serif italic text-lg leading-relaxed mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            "{currentQuote.text}"
          </p>
          <div className={`flex flex-col items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
             <span className="font-semibold text-xs uppercase tracking-widest">{currentQuote.author}</span>
             <span className="text-[10px] opacity-70 flex items-center gap-1 bg-indigo-500/10 px-2 py-1 rounded-full">
                <BookOpen size={10} /> {currentQuote.context}
             </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes blink { 0%, 48%, 52%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.1); } }
        @keyframes speak-animation { 0% { height: 2px; width: 60%; opacity: 0.5; } 100% { height: 8px; width: 80%; opacity: 1; background-color: #4ade80; } }
        @keyframes head-bop { 0% { transform: rotate(-2deg) scale(1.05); } 100% { transform: rotate(2deg) scale(1.05); } }
      `}</style>
    </div>
  );
};

// --- MAIN INTERFACE ---

interface ChatInterfaceProps {
  isDarkMode: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ isDarkMode }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      text: "Ciao! 👋 Sono il tuo assistente per l'ISIS G.D. Romagnosi.\n\nVuoi sapere quali indirizzi offriamo, come sono i laboratori o che progetti facciamo? Chiedimi tutto!",
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [chatInstance, setChatInstance] = useState<Chat | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chat = createSchoolChat();
    setChatInstance(chat);
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioContextRef.current = new AudioContextClass();
    }

    return () => {
      stopAudio();
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setAttachedFile(file);
      } else {
        alert("Per favore seleziona un file PDF.");
      }
    }
  };

  const clearFile = () => setAttachedFile(null);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch (e) {}
      audioSourceRef.current = null;
    }
    setPlayingMessageId(null);
    setIsAudioLoading(false);
  };

  const toggleMute = () => {
    stopAudio();
    setIsMuted(!isMuted);
  };

  const clearChat = () => {
    stopAudio();
    setMessages([{
      id: 'welcome',
      role: Role.MODEL,
      text: "Ciao! 👋 Sono il tuo assistente per l'ISIS G.D. Romagnosi.\n\nVuoi sapere quali indirizzi offriamo, come sono i laboratori o che progetti facciamo? Chiedimi tutto!",
      timestamp: Date.now()
    }]);
    setInputValue('');
    setAttachedFile(null);
    const temporaryChatInstance = createSchoolChat();
    setChatInstance(temporaryChatInstance);
  };

  const playMessageAudio = async (messageId: string, rawText: string) => {
    if (playingMessageId === messageId) {
      stopAudio();
      return;
    }
    stopAudio();
    if (!audioContextRef.current) return;
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    setIsAudioLoading(true);
    setPlayingMessageId(messageId);
    try {
      const textToSpeak = cleanTextForTTS(rawText);
      const base64Audio = await generateSpeech(textToSpeak);
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const sampleRate = 24000;
      const numChannels = 1;
      const dataInt16 = new Int16Array(bytes.buffer);
      const frameCount = dataInt16.length;
      const audioBuffer = audioContextRef.current.createBuffer(numChannels, frameCount, sampleRate);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        setPlayingMessageId(null);
        audioSourceRef.current = null;
      };
      audioSourceRef.current = source;
      source.start(0);
    } catch (err) {
      console.error("TTS Error:", err);
      setPlayingMessageId(null);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    let currentChat = chatInstance;
    if (!currentChat) {
        const temporaryChatInstance = createSchoolChat();
        setChatInstance(temporaryChatInstance);
        currentChat = temporaryChatInstance;
    }
    if ((!inputValue.trim() && !attachedFile) || isThinking) return;
    stopAudio();
    const userText = inputValue.trim();
    const tempFile = attachedFile; 
    setInputValue('');
    setAttachedFile(null); 
    const newMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: userText || (tempFile ? `Inviato file: ${tempFile.name}` : ''),
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
    setIsThinking(true);
    try {
      let responseText = "";
      if (tempFile) {
        const base64 = await readFileBase64(tempFile);
        const result = await currentChat.sendMessageStream({
          message: [
            { inlineData: { mimeType: 'application/pdf', data: base64 } },
            { text: userText || "Ecco un documento aggiuntivo sulla scuola. Usalo per rispondere alle mie domande." }
          ]
        });
        for await (const chunk of result) { responseText += chunk.text; }
      } else {
        const result = await currentChat.sendMessageStream({ message: userText });
        for await (const chunk of result) { responseText += chunk.text; }
      }
      const botMessageId = (Date.now() + 1).toString();
      const botMessage: Message = {
        id: botMessageId,
        role: Role.MODEL,
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMessage]);
      if (!isMuted && responseText) {
        playMessageAudio(botMessageId, responseText);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: Role.MODEL,
        text: "Ops! Ho avuto un piccolo problema di connessione.",
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const isAvatarTalking = isThinking || (playingMessageId !== null) || isAudioLoading;

  return (
    <div className="flex h-full gap-6">
      {/* LEFT COLUMN: CHAT INTERFACE (Glassmorphism) */}
      <div className={`flex-1 flex flex-col h-full rounded-[2rem] shadow-xl overflow-hidden backdrop-blur-xl border transition-all duration-300 ${isDarkMode ? 'bg-slate-900/40 border-slate-700/30' : 'bg-white/40 border-white/50'}`}>
        
        {/* Transparent Header */}
        <div className={`p-5 flex items-center justify-between backdrop-blur-md z-20 border-b ${isDarkMode ? 'border-white/5 bg-slate-900/30' : 'border-slate-200/50 bg-white/30'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:rotate-3 ${isDarkMode ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'}`}>
              <Bot size={28} />
            </div>
            <div>
              <h2 className={`font-bold text-lg tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Orientamento Romagnosi</h2>
              <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-indigo-200' : 'text-indigo-600'}`}>Online • AI Powered</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
              <button onClick={toggleMute} className={`p-2.5 rounded-full transition-all ${isDarkMode ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-200/50'}`} title={isMuted ? "Attiva audio" : "Muta audio"}>
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <div className="w-px h-4 bg-current opacity-20"></div>
              <button onClick={clearChat} className={`p-2.5 rounded-full transition-all ${isDarkMode ? 'text-slate-300 hover:text-red-400 hover:bg-white/10' : 'text-slate-600 hover:text-red-500 hover:bg-slate-200/50'}`} title="Nuova chat">
                <Trash2 size={18} />
              </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <img 
              src="https://www.gdromagnosi.edu.it/sites/default/files/logo_new_0.png" 
              alt="Logo Romagnosi"
              className={`w-3/4 max-w-[500px] opacity-[0.03] object-contain transition-all duration-300 ${isDarkMode ? 'invert brightness-150' : 'invert-0'}`}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

          <div className="absolute inset-0 overflow-y-auto p-4 md:p-6 space-y-6 z-10 scroll-smooth">
              {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full group ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] flex flex-col ${msg.role === Role.USER ? 'items-end' : 'items-start'}`}>
                    <div className={`relative px-6 py-4 shadow-md transition-all duration-300 hover:shadow-lg ${
                        msg.role === Role.USER
                        ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-[20px] rounded-br-sm'
                        : (isDarkMode 
                            ? 'bg-slate-800/80 text-slate-100 border border-slate-700/50 rounded-[20px] rounded-bl-sm backdrop-blur-md' 
                            : 'bg-white text-slate-800 border border-slate-100 rounded-[20px] rounded-bl-sm'
                          )
                    } ${msg.isError ? 'bg-red-900/20 text-red-300 border-red-800' : ''}`}>
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-normal">{msg.text}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1.5 px-1">
                      <span className={`text-[10px] font-medium tracking-wide opacity-50 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.role === Role.MODEL && !msg.isError && (
                        <button onClick={() => playMessageAudio(msg.id, msg.text)} disabled={isAudioLoading && playingMessageId !== msg.id} className={`transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-2 py-0.5 rounded-full ${isDarkMode ? 'hover:bg-white/10 text-indigo-300' : 'hover:bg-slate-100 text-indigo-600'}`}>
                          {playingMessageId === msg.id ? <><StopCircle size={12} /><span className="text-[10px]">Stop</span></> : (isAudioLoading && playingMessageId === msg.id ? <Loader2 size={12} className="animate-spin" /> : <Volume2 size={12} />)}
                        </button>
                      )}
                    </div>
                  </div>
              </div>
              ))}
              
              {isThinking && (
              <div className="flex justify-start w-full animate-in fade-in duration-300">
                  <div className={`px-5 py-4 rounded-[20px] rounded-bl-sm shadow-sm border flex items-center gap-1.5 ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-100'}`}>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                  </div>
              </div>
              )}
              <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Input Area */}
        <div className="p-4 md:p-6 z-20">
          <div className={`relative p-2 rounded-3xl border shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-slate-900/90 border-slate-700/50 shadow-black/20' : 'bg-white border-white/60 shadow-indigo-100'}`}>
            {attachedFile && (
              <div className="absolute -top-12 left-4 flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm shadow-lg animate-in slide-in-from-bottom-2">
                <FileText size={16} />
                <span className="font-medium truncate max-w-[200px]">{attachedFile.name}</span>
                <button type="button" onClick={clearFile} className="hover:bg-indigo-700 p-0.5 rounded-full"><X size={14} /></button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
              <label className={`cursor-pointer p-3 rounded-2xl transition-all duration-300 ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-indigo-400' : 'hover:bg-indigo-50 text-slate-400 hover:text-indigo-600'}`}>
                  <input type="file" className="hidden" accept="application/pdf" onChange={handleFileSelect} disabled={isThinking} />
                  <Paperclip size={20} strokeWidth={2.5} />
              </label>
              
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Chiedi qualcosa sulla scuola..."
                className={`flex-1 bg-transparent border-none focus:ring-0 p-2 text-[15px] font-medium ${isDarkMode ? 'text-white placeholder:text-slate-600' : 'text-slate-800 placeholder:text-slate-400'}`}
                disabled={isThinking}
              />
              
              <button
                type="submit"
                disabled={(!inputValue && !attachedFile) || isThinking}
                className={`p-3 rounded-2xl transition-all duration-300 transform active:scale-95 flex items-center justify-center shadow-md ${
                    (!inputValue && !attachedFile) || isThinking
                    ? (isDarkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-300')
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50'
                }`}
              >
                {isThinking ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} strokeWidth={2.5} />}
              </button>
            </form>
          </div>
          <div className="text-center mt-3">
              <p className={`text-[10px] font-medium tracking-wide uppercase opacity-50 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>SchoolBuddy AI • ISIS Romagnosi</p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: LITERARY AVATAR */}
      <LiteraryAvatar isDarkMode={isDarkMode} isTalking={isAvatarTalking} />
    </div>
  );
};