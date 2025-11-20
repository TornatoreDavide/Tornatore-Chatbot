
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, User, Loader2, FileText, X, Volume2, StopCircle, VolumeX, Trash2 } from 'lucide-react';
import { Chat } from "@google/genai";
import { createSchoolChat, generateSpeech } from '../services/geminiService';
import { Message, Role } from '../types';

// Helper to read file as base64
const readFileBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Regex to clean text for TTS: remove markdown symbols (*, #, _), links, and emojis
const cleanTextForTTS = (text: string): string => {
  let clean = text;
  // Remove Markdown bold/italic symbols
  clean = clean.replace(/[*#_`]/g, '');
  // Remove links [text](url) - keep only text
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove emojis (Broad unicode ranges for emojis and pictographs)
  clean = clean.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '');
  // Remove excess whitespace
  clean = clean.replace(/\s+/g, ' ').trim();
  return clean;
};

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
  
  // Context file state
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  // Audio state
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Auto-play toggle
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat
  useEffect(() => {
    const chat = createSchoolChat();
    setChatInstance(chat);
    
    // Init AudioContext
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

  // Auto-scroll
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

  const clearFile = () => {
    setAttachedFile(null);
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Ignore error if already stopped
      }
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
    // 1. Stop Audio immediately
    stopAudio();
    
    // 2. Reset UI State
    setMessages([{
      id: 'welcome',
      role: Role.MODEL,
      text: "Ciao! 👋 Sono il tuo assistente per l'ISIS G.D. Romagnosi.\n\nVuoi sapere quali indirizzi offriamo, come sono i laboratori o che progetti facciamo? Chiedimi tutto!",
      timestamp: Date.now()
    }]);
    setInputValue('');
    setAttachedFile(null);
    
    // 3. Reset LLM Context (Create new session)
    const temporaryChatInstance = createSchoolChat();
    setChatInstance(temporaryChatInstance);
  };

  const playMessageAudio = async (messageId: string, rawText: string) => {
    // If clicking the same message that is playing, stop it
    if (playingMessageId === messageId) {
      stopAudio();
      return;
    }

    // Stop any currently playing audio
    stopAudio();

    if (!audioContextRef.current) return;

    // Ensure context is running (browsers may suspend it)
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    setIsAudioLoading(true);
    setPlayingMessageId(messageId);

    try {
      const textToSpeak = cleanTextForTTS(rawText);
      
      // Generate audio using Gemini TTS model
      const base64Audio = await generateSpeech(textToSpeak);
      
      // Decode base64 string to byte array
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Manual PCM Decoding
      const sampleRate = 24000;
      const numChannels = 1;
      
      // Create Int16 view of the buffer
      const dataInt16 = new Int16Array(bytes.buffer);
      
      const frameCount = dataInt16.length;
      const audioBuffer = audioContextRef.current.createBuffer(numChannels, frameCount, sampleRate);
      
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < frameCount; i++) {
        // Normalize 16-bit integer (-32768 to 32767) to float (-1.0 to 1.0)
        channelData[i] = dataInt16[i] / 32768.0;
      }
      
      // Play
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
        
        for await (const chunk of result) {
            responseText += chunk.text;
        }

      } else {
        const result = await currentChat.sendMessageStream({
           message: userText 
        });

        for await (const chunk of result) {
            responseText += chunk.text;
        }
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
        text: "Ops! Ho avuto un piccolo problema di connessione. Puoi ripetere la domanda?",
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className={`flex flex-col h-full rounded-2xl shadow-sm overflow-hidden border transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      {/* Header */}
      <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-indigo-50">Orientamento Romagnosi</h2>
            <p className="text-xs text-indigo-200 opacity-90">Online • Chiedi pure!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={toggleMute}
              className="p-2 hover:bg-indigo-500 rounded-full transition-colors"
              title={isMuted ? "Attiva lettura automatica" : "Disattiva lettura automatica"}
            >
              {isMuted ? <VolumeX size={20} className="opacity-70" /> : <Volume2 size={20} />}
            </button>
            <button 
              type="button"
              onClick={clearChat}
              className="p-2 hover:bg-indigo-500 rounded-full transition-colors text-indigo-100 hover:text-white"
              title="Cancella cronologia chat"
            >
              <Trash2 size={20} />
            </button>
        </div>
      </div>

      {/* Messages Area with Background Logo */}
      <div className={`flex-1 relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        {/* Watermark Layer */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <img 
            src="https://www.gdromagnosi.edu.it/sites/default/files/logo_new_0.png" 
            alt="Logo Romagnosi"
            className={`w-3/4 max-w-[500px] opacity-5 object-contain transition-all duration-300 ${isDarkMode ? 'invert' : 'invert-0'}`}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Scrollable Content */}
        <div className="absolute inset-0 overflow-y-auto p-4 space-y-4 z-10">
            {messages.map((msg) => (
            <div
                key={msg.id}
                className={`flex w-full ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}
            >
                <div className={`max-w-[80%] flex flex-col ${msg.role === Role.USER ? 'items-end' : 'items-start'}`}>
                  <div
                  className={`p-4 rounded-2xl shadow-sm ${
                      msg.role === Role.USER
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : (isDarkMode 
                          ? 'bg-slate-800/95 text-slate-200 border border-slate-700' 
                          : 'bg-white text-slate-800 border border-slate-200'
                        ) + ' rounded-bl-none backdrop-blur-sm'
                  } ${msg.isError ? 'bg-red-900/20 text-red-300 border-red-800' : ''}`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] opacity-60 ${
                        msg.role === Role.USER 
                            ? 'text-indigo-800' // Darker in user bubble context? No, user bubble is always indigo-600
                            : (isDarkMode ? 'text-slate-400' : 'text-slate-500')
                    }`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    
                    {msg.role === Role.MODEL && !msg.isError && (
                      <button 
                        type="button"
                        onClick={() => playMessageAudio(msg.id, msg.text)}
                        disabled={isAudioLoading && playingMessageId !== msg.id}
                        className={`p-1 rounded-full transition-colors flex items-center gap-1 ${
                          playingMessageId === msg.id 
                            ? 'text-indigo-500 bg-indigo-100 hover:bg-indigo-200' 
                            : (isDarkMode ? 'text-slate-500 hover:text-indigo-400 hover:bg-slate-800' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100')
                        }`}
                        title="Ascolta risposta"
                      >
                        {playingMessageId === msg.id ? (
                          <>
                            <StopCircle size={14} />
                            <span className="text-[10px] font-medium">Stop</span>
                          </>
                        ) : (
                          isAudioLoading && playingMessageId === msg.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Volume2 size={14} />
                          )
                        )}
                      </button>
                    )}
                  </div>
                </div>
            </div>
            ))}
            
            {isThinking && (
            <div className="flex justify-start w-full">
                <div className={`p-4 rounded-2xl rounded-bl-none shadow-sm border flex items-center gap-2 ${
                    isDarkMode 
                    ? 'bg-slate-800/95 border-slate-700 backdrop-blur-sm' 
                    : 'bg-white border-slate-200'
                }`}>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
            </div>
            )}
            <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t relative z-20 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        
        {attachedFile && (
          <div className="mb-3 flex items-center gap-2 bg-indigo-900/50 text-indigo-300 px-3 py-2 rounded-lg text-sm w-fit animate-in fade-in slide-in-from-bottom-2 border border-indigo-800">
            <FileText size={16} />
            <span className="font-medium truncate max-w-[200px]">{attachedFile.name}</span>
            <button type="button" onClick={clearFile} className="hover:bg-indigo-800 p-1 rounded-full transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
          <div className="relative flex-1">
             <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Chiedi degli indirizzi, sport o carica un documento..."
              className={`w-full p-3 pr-12 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:bg-slate-800' 
                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white'
              }`}
              disabled={isThinking}
            />
            <div className="absolute right-2 bottom-2">
              <label className={`cursor-pointer p-2 rounded-full transition-colors flex items-center justify-center ${
                  isDarkMode 
                  ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200' 
                  : 'hover:bg-slate-200 text-slate-500 hover:text-slate-700'
              }`}>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="application/pdf" 
                  onChange={handleFileSelect} 
                  disabled={isThinking}
                />
                <Paperclip size={20} />
              </label>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={(!inputValue && !attachedFile) || isThinking}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center"
          >
            {isThinking ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
          </button>
        </form>
        <div className="text-center mt-2">
             <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Carica brochure PDF per analizzarle insieme!</span>
        </div>
      </div>
    </div>
  );
};
