import React, { useState } from 'react';
import { Film, Upload, Loader, Play, AlertCircle, Settings } from 'lucide-react';
import { generateVeoVideo } from '../services/geminiService';
import { AspectRatio } from '../types';

interface VeoAnimatorProps {
  isDarkMode: boolean;
}

export const VeoAnimator: React.FC<VeoAnimatorProps> = ({ isDarkMode }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.LANDSCAPE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file.');
        return;
      }
      setImageFile(file);
      setResultVideo(null);
      setError(null);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!imageFile) return;
    setIsGenerating(true);
    setError(null);
    setResultVideo(null);
    setProgressMessage('Initializing Veo...');
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
      const base64 = await base64Promise;
      setProgressMessage('Checking permissions...');
      setTimeout(() => setProgressMessage('Animating... this takes about 1-2 mins...'), 2000);
      const videoUrl = await generateVeoVideo(base64, prompt, aspectRatio);
      setResultVideo(videoUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate video.");
    } finally {
      setIsGenerating(false);
      setProgressMessage('');
    }
  };

  const handleApiKeyConfig = async () => {
      try { if (window.aistudio) await window.aistudio.openSelectKey(); } catch (e) { console.error(e); }
  }

  return (
    <div className={`rounded-[2rem] shadow-2xl h-full overflow-y-auto p-8 backdrop-blur-xl border transition-all duration-500 ${isDarkMode ? 'bg-slate-900/40 border-slate-700/30 text-slate-100' : 'bg-white/40 border-white/50 text-slate-800'}`}>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl shadow-lg transform rotate-3 ${isDarkMode ? 'bg-gradient-to-br from-rose-600 to-pink-600 text-white' : 'bg-white text-rose-500'}`}>
             <Film size={24} />
          </div>
          <div>
              <h2 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Veo Animator</h2>
              <p className={`text-sm ${isDarkMode ? 'text-rose-200' : 'text-rose-500'}`}>Bring images to life with AI</p>
          </div>
        </div>
        <button 
            onClick={handleApiKeyConfig}
            className={`text-xs flex items-center gap-2 border px-4 py-2 rounded-full transition-all duration-300 font-medium ${
                isDarkMode 
                ? 'text-slate-300 border-slate-700 hover:bg-white/10' 
                : 'text-slate-600 border-slate-300 hover:bg-white hover:shadow-sm'
            }`}
        >
            <Settings size={14} /> Configure API Key
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Input Section */}
        <div className="space-y-8">
          
          {/* Image Dropzone */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>1. Source Image</label>
            <div className={`relative group border-2 border-dashed rounded-3xl p-1 transition-all duration-300 ${imagePreview ? 'border-rose-500' : (isDarkMode ? 'border-slate-700 hover:border-slate-500 hover:bg-white/5' : 'border-slate-300 hover:border-rose-300 hover:bg-rose-50/50')}`}>
              <div className={`rounded-[20px] overflow-hidden ${isDarkMode ? 'bg-slate-900/50' : 'bg-white/50'}`}>
                {imagePreview ? (
                  <div className="relative h-56 flex items-center justify-center">
                    <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                       <span className="text-white font-medium flex items-center gap-2"><Upload size={18} /> Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-56 flex flex-col items-center justify-center text-slate-500 gap-4">
                    <div className={`p-4 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>
                        <Upload size={32} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold">Click to upload</p>
                        <p className="text-xs opacity-70">PNG or JPG</p>
                    </div>
                  </div>
                )}
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleImageUpload} accept="image/*" disabled={isGenerating} />
              </div>
            </div>
          </div>

          {/* Prompt */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>2. Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              placeholder="Describe the movement..."
              className={`w-full p-4 border rounded-3xl focus:ring-2 focus:ring-rose-500 focus:border-transparent min-h-[120px] text-sm resize-none transition-all outline-none ${
                  isDarkMode 
                  ? 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-800' 
                  : 'bg-white/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white'
              }`}
            />
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>3. Format</label>
            <div className="grid grid-cols-2 gap-4">
              {[AspectRatio.LANDSCAPE, AspectRatio.PORTRAIT].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`p-4 rounded-2xl border text-sm font-medium transition-all flex items-center justify-center gap-3 ${
                    aspectRatio === ratio
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-transparent shadow-lg shadow-rose-500/30'
                      : (isDarkMode 
                          ? 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-700' 
                          : 'bg-white/50 text-slate-500 border-slate-200 hover:bg-white')
                  }`}
                  disabled={isGenerating}
                >
                  <div className={`border-2 border-current rounded-sm ${ratio === AspectRatio.LANDSCAPE ? 'w-6 h-4' : 'w-4 h-6'}`}></div>
                  {ratio === AspectRatio.LANDSCAPE ? 'Landscape' : 'Portrait'}
                </button>
              ))}
            </div>
          </div>

          {/* Action */}
          <button
            onClick={handleGenerate}
            disabled={!imageFile || isGenerating}
            className={`w-full p-5 rounded-2xl font-bold shadow-xl transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-3 ${
                !imageFile || isGenerating
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:via-pink-500 hover:to-purple-500 text-white shadow-rose-500/25'
            }`}
          >
            {isGenerating ? <Loader size={24} className="animate-spin" /> : <Film size={24} />}
            <span>{isGenerating ? 'Creating Magic...' : 'Generate Video'}</span>
          </button>
          
          {isGenerating && <p className="text-center text-xs text-rose-400 animate-pulse font-medium">{progressMessage}</p>}
          
          {error && (
            <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl flex items-start gap-3 text-sm border border-red-500/20">
              <AlertCircle size={18} className="shrink-0 mt-0.5" /> <p>{error}</p>
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className={`rounded-3xl p-1.5 flex items-center justify-center min-h-[400px] relative overflow-hidden shadow-inner ${isDarkMode ? 'bg-slate-950/50' : 'bg-slate-100/80'}`}>
          <div className={`absolute inset-0 opacity-10 ${isDarkMode ? 'bg-[radial-gradient(#ffffff_1px,transparent_1px)]' : 'bg-[radial-gradient(#000000_1px,transparent_1px)]'} [background-size:16px_16px]`}></div>
          
          {resultVideo ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4 z-10">
              <video src={resultVideo} controls autoPlay loop className="w-full rounded-2xl shadow-2xl ring-1 ring-white/10" />
              <a href={resultVideo} download className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors backdrop-blur-md" target="_blank" rel="noreferrer">
                Open Fullscreen
              </a>
            </div>
          ) : (
            <div className="text-center p-10 relative z-10">
              <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
                 <Play size={40} className={`ml-2 opacity-50 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
              </div>
              <p className={`font-medium text-lg ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Your masterpiece awaits</p>
            </div>
          )}
        </div>
      </div>
      
      <div className={`mt-10 pt-6 border-t text-center ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
         <p className="text-[10px] tracking-wide uppercase">Powered by Google Veo • AI Studio</p>
      </div>
    </div>
  );
};