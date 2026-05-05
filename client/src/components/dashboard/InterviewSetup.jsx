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
        {/* Header - Single Mode */}
        <div className="px-8 pt-8 pb-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" /> 
            Personalized Interview Setup
          </h3>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-8 relative overflow-hidden">
          <div className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Upload Document</span>
              </div>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "relative group/drop border-2 border-dashed rounded-[2.5rem] p-12 transition-all duration-500 cursor-pointer text-center",
                  isDragging ? "border-cyan-500 bg-cyan-500/5" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]",
                  fileName ? "border-green-500/40 bg-green-500/5" : ""
                )}
                onClick={() => !isProcessing && document.getElementById('resume-upload').click()}
              >
                <input id="resume-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
                <div className={cn(
                  "w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 transition-all duration-500",
                  fileName ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/20 group-hover/drop:text-cyan-400"
                )}>
                  {isProcessing ? (
                    <Loader2 className="w-10 h-10 animate-spin" />
                  ) : fileName ? (
                    <CheckCircle2 className="w-10 h-10" />
                  ) : (
                    <Upload className="w-10 h-10" />
                  )}
                </div>
                <p className="text-lg font-black text-white truncate px-4">
                  {isProcessing ? "Analyzing Resume..." : fileName ? fileName : "Upload Resume"}
                </p>
                <p className="text-[10px] text-white/20 mt-2 uppercase tracking-widest font-bold">
                  {fileName ? "Resume successfully analyzed" : "Drop your PDF here or click to browse"}
                </p>
                {fileName && !isProcessing && (
                  <button onClick={(e) => { e.stopPropagation(); setFileName(null); }} className="mt-6 text-[9px] font-black text-red-400/50 hover:text-red-400 transition-colors uppercase tracking-widest bg-red-500/5 px-4 py-2 rounded-full border border-red-500/10">
                    Replace File
                  </button>
                )}
              </div>
            </div>
            
            {/* Context Note */}
            <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
              <p className="text-[11px] text-white/40 leading-relaxed italic text-center">
                Our AI will analyze your resume to generate tailored technical questions and behavioral scenarios specific to your experience.
              </p>
            </div>
          </div>
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
