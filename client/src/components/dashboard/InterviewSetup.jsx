import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Sparkles, PlusCircle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker using a Vite-compatible URL
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const InterviewSetup = () => {
  const [activeTab, setActiveTab] = useState('topic'); // 'topic' or 'resume'
  const [topic, setTopic] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState(null);

  const extractTextFromPDF = async (file) => {
    try {
      setIsProcessing(true);
      console.log(`%c[PDF Processor] Starting extraction for: ${file.name}`, 'color: #06b6d4; font-weight: bold;');
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str);
        fullText += strings.join(' ') + '\n';
      }
      
      console.log('%c[PDF Processor] Extraction Successful! Content:', 'color: #10b981; font-weight: bold;');
      console.log(fullText);
      return fullText;
    } catch (error) {
      console.error('[PDF Processor] Error extracting text:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      if (file.type === 'application/pdf') {
        await extractTextFromPDF(file);
      } else {
        console.warn('[PDF Processor] Not a PDF file. Text extraction skipped.');
      }
    }
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      if (file.type === 'application/pdf') {
        await extractTextFromPDF(file);
      } else {
        console.warn('[PDF Processor] Not a PDF file. Text extraction skipped.');
      }
    }
  };

  return (
    <div className="relative group overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all duration-700" />

      <div className="relative flex flex-col h-[520px] bg-[#0d0d0d]/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        {/* Tab Switcher */}
        <div className="p-2 m-6 bg-white/5 rounded-2xl border border-white/10 flex relative">
          <motion.div 
            className="absolute top-2 bottom-2 left-2 w-[calc(50%-8px)] bg-white rounded-xl shadow-lg"
            animate={{ x: activeTab === 'topic' ? 0 : '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button 
            onClick={() => setActiveTab('topic')}
            className={cn(
              "flex-1 py-3 text-xs font-black uppercase tracking-widest relative z-10 transition-colors duration-300",
              activeTab === 'topic' ? "text-black" : "text-white/40 hover:text-white"
            )}
          >
            By Topic
          </button>
          <button 
            onClick={() => setActiveTab('resume')}
            className={cn(
              "flex-1 py-3 text-xs font-black uppercase tracking-widest relative z-10 transition-colors duration-300",
              activeTab === 'resume' ? "text-black" : "text-white/40 hover:text-white"
            )}
          >
            By Resume
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-8 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'topic' ? (
              <motion.div
                key="topic-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Focus Area</span>
                  </div>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. JavaScript Closures..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-6 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/40 transition-all"
                  />
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Node.js', 'System Design', 'UI/UX'].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => setTopic(tag)}
                        className={cn(
                          "text-[10px] font-bold px-4 py-2 rounded-xl border transition-all",
                          topic === tag 
                            ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-lg shadow-cyan-500/10" 
                            : "border-white/5 bg-white/5 text-white/40 hover:text-white"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="resume-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-violet-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Personalized</span>
                  </div>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "relative group/drop border-2 border-dashed rounded-[2.5rem] p-10 transition-all duration-500 cursor-pointer text-center",
                      isDragging ? "border-cyan-500 bg-cyan-500/5" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]",
                      fileName ? "border-green-500/40 bg-green-500/5" : ""
                    )}
                    onClick={() => !isProcessing && document.getElementById('resume-upload').click()}
                  >
                    <input id="resume-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
                    <div className={cn(
                      "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-all duration-500",
                      fileName ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/20 group-hover/drop:text-cyan-400"
                    )}>
                      {isProcessing ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : fileName ? (
                        <CheckCircle2 className="w-8 h-8" />
                      ) : (
                        <Upload className="w-8 h-8" />
                      )}
                    </div>
                    <p className="text-sm font-bold text-white truncate px-4">
                      {isProcessing ? "Processing PDF..." : fileName ? fileName : "Drop Resume (PDF)"}
                    </p>
                    <p className="text-[10px] text-white/20 mt-1 uppercase tracking-tighter">
                      {fileName ? "Ready to analyze" : "Click to browse files"}
                    </p>
                    {fileName && !isProcessing && (
                      <button onClick={(e) => { e.stopPropagation(); setFileName(null); }} className="mt-4 text-[9px] font-black text-red-400/50 hover:text-red-400 transition-colors uppercase tracking-widest">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Start Button */}
        <div className="p-8 mt-auto bg-white/[0.02] border-t border-white/5">
          <button 
            disabled={isProcessing}
            className={cn(
              "group/btn relative w-full h-16 rounded-[1.5rem] bg-white text-black font-black text-xs uppercase tracking-[0.2em] overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all duration-500",
              isProcessing ? "opacity-50 cursor-not-allowed" : ""
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-violet-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-center justify-center gap-2 group-hover/btn:text-white transition-colors">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isProcessing ? "Processing..." : "Start AI Interview"}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;
