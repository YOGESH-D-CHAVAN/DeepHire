import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Sparkles, CheckCircle2, X, Loader2, User, Briefcase, Code2, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config/api';

const InterviewSetup = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const processFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setUploadError('Please upload a valid PDF file.');
      return;
    }

    setFileName(file.name);
    setSelectedFile(file);
    setUploadError(null);
    setResumeData(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch(`${API_BASE_URL}/api/resume/extract`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResumeData(data.resumeData);
        console.log('%c[Resume] Extracted Successfully:', 'color: #10b981; font-weight: bold;', data.resumeData);
      } else {
        setUploadError(data.error || 'Failed to extract resume data.');
        setFileName(null);
        setSelectedFile(null);
      }
    } catch (err) {
      console.error('[Resume] Upload Error:', err);
      setUploadError('Network error. Please ensure the server is running.');
      setFileName(null);
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) await processFile(files[0]);
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files.length > 0) await processFile(files[0]);
  };

  const handleClearResume = (e) => {
    e.stopPropagation();
    setFileName(null);
    setResumeData(null);
    setSelectedFile(null);
    setUploadError(null);
  };

  const handleStartInterview = () => {
    // Navigate to interview page, passing resumeData if available
    navigate('/interview', {
      state: {
        resumeData: resumeData || null,
        hasResume: !!resumeData,
      },
    });
  };

  const topSkills = resumeData
    ? [...(resumeData.technicalSkills || []), ...(resumeData.skills || [])].slice(0, 5)
    : [];

  return (
    <div className="relative group overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all duration-700" />

      <div className="relative flex flex-col h-[520px] bg-[#0d0d0d]/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Personalized Interview Setup
          </h3>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-8 relative overflow-hidden overflow-y-auto custom-scrollbar">
          <div className="space-y-4 mt-2 pb-2">

            {/* Upload Zone */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Upload Resume</span>
                <span className="text-[9px] text-white/20 ml-auto uppercase tracking-wider">Optional · PDF only</span>
              </div>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "relative group/drop border-2 border-dashed rounded-[2rem] p-8 transition-all duration-500 cursor-pointer text-center",
                  isDragging ? "border-cyan-500 bg-cyan-500/5" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]",
                  resumeData ? "border-green-500/40 bg-green-500/5" : "",
                  uploadError ? "border-red-500/40 bg-red-500/5" : ""
                )}
                onClick={() => !isProcessing && document.getElementById('resume-upload').click()}
              >
                <input id="resume-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
                <div className={cn(
                  "w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-all duration-500",
                  resumeData ? "bg-green-500/20 text-green-400" : 
                  uploadError ? "bg-red-500/20 text-red-400" :
                  "bg-white/5 text-white/20 group-hover/drop:text-cyan-400"
                )}>
                  {isProcessing ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : resumeData ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : uploadError ? (
                    <AlertCircle className="w-7 h-7" />
                  ) : (
                    <Upload className="w-7 h-7" />
                  )}
                </div>

                <p className="text-sm font-black text-white truncate px-4">
                  {isProcessing ? "Analyzing Resume..." : resumeData ? fileName : uploadError ? "Upload Failed" : "Upload Resume"}
                </p>
                <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest font-bold">
                  {isProcessing ? "Extracting your skills and experience..." :
                   resumeData ? "Resume analyzed · Interview will be personalized" :
                   uploadError ? uploadError :
                   "Drop your PDF here or click to browse"}
                </p>
                {(resumeData || uploadError) && !isProcessing && (
                  <button
                    onClick={handleClearResume}
                    className="mt-4 text-[9px] font-black text-red-400/50 hover:text-red-400 transition-colors uppercase tracking-widest bg-red-500/5 px-4 py-2 rounded-full border border-red-500/10"
                  >
                    {uploadError ? 'Try Again' : 'Replace File'}
                  </button>
                )}
              </div>
            </div>

            {/* Resume Preview Card */}
            <AnimatePresence>
              {resumeData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-5 rounded-[1.5rem] bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-white/10 space-y-3"
                >
                  {/* Name + Role */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-white truncate">{resumeData.name || 'Candidate'}</p>
                      <p className="text-[10px] text-cyan-400/80 truncate">{resumeData.currentRole || 'Role not specified'}</p>
                    </div>
                    {resumeData.totalExperience && (
                      <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/20">
                        <Briefcase className="w-3 h-3 text-violet-400" />
                        <span className="text-[10px] font-bold text-violet-300 whitespace-nowrap">{resumeData.totalExperience}</span>
                      </div>
                    )}
                  </div>

                  {/* Top Skills */}
                  {topSkills.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Code2 className="w-3 h-3 text-white/30" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Top Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {topSkills.map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/60">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mode Badge */}
                  <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[10px] text-white/40 font-medium">
                      Interview will start directly with behavioral questions — no setup needed
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* No Resume Note */}
            {!resumeData && !uploadError && (
              <div className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5">
                <p className="text-[11px] text-white/30 leading-relaxed italic text-center">
                  Without a resume, the AI will ask for your domain and number of questions before starting.
                  Upload a resume above for a fully personalized, structured interview.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Start Button */}
        <div className="p-8 mt-auto bg-white/[0.02] border-t border-white/5">
          <button
            disabled={isProcessing}
            onClick={handleStartInterview}
            id="start-interview-btn"
            className={cn(
              "group/btn relative w-full h-14 rounded-[1.5rem] bg-white text-black font-black text-xs uppercase tracking-[0.2em] overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all duration-500",
              isProcessing ? "opacity-50 cursor-not-allowed" : ""
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-violet-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-center justify-center gap-2 group-hover/btn:text-white transition-colors">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isProcessing ? "Processing..." : resumeData ? "Start Personalized Interview" : "Start AI Interview"}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;
