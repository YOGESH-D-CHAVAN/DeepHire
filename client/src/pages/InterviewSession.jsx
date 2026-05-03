import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  MessageSquare, BarChart3, Settings,
  AlertCircle, ChevronRight, Bot, User,
  Smile, Frown, Meh, Zap, Eye, Hand
} from 'lucide-react';
import { cn } from '../utils/cn';
import interviewerImg from '../assets/interviewer.png';
import { FilesetResolver, FaceLandmarker, HandLandmarker } from '@mediapipe/tasks-vision';

const InterviewSession = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [timer, setTimer] = useState(0);
  const [expression, setExpression] = useState('Neutral');
  const [eyeStatus, setEyeStatus] = useState('Focused');
  const [handStatus, setHandStatus] = useState('None Detected');
  const [isInterviewerTalking, setIsInterviewerTalking] = useState(true);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const faceLandmarkerRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const requestRef = useRef(null);

  // Initialize MediaPipe
  useEffect(() => {
    const initMediaPipe = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1
      });

      handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
      });

      console.log("MediaPipe Models Loaded Successfully");
    };

    initMediaPipe();
  }, []);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Interviewer Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsInterviewerTalking(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Camera Streaming Logic
  useEffect(() => {
    const enableCamera = async () => {
      try {
        if (!isVideoOff) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720, facingMode: 'user' },
            audio: false
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          stopCamera();
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    enableCamera();
    return () => stopCamera();
  }, [isVideoOff]);

  // Real-time Tracking Loop
  useEffect(() => {
    if (isVideoOff) return;

    const processVideo = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const startTimeMs = performance.now();
        const video = videoRef.current;

        // 1. Face & Eye Analysis
        if (faceLandmarkerRef.current) {
          const result = faceLandmarkerRef.current.detectForVideo(video, startTimeMs);
          if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
            const shapes = result.faceBlendshapes[0].categories;
            
            // Check for eye gaze / squinting
            const eyeLookInL = shapes.find(s => s.categoryName === "eyeLookInLeft")?.score || 0;
            const eyeLookInR = shapes.find(s => s.categoryName === "eyeLookInRight")?.score || 0;
            const eyeLookOutL = shapes.find(s => s.categoryName === "eyeLookOutLeft")?.score || 0;
            const eyeLookOutR = shapes.find(s => s.categoryName === "eyeLookOutRight")?.score || 0;

            if (eyeLookInL > 0.4 || eyeLookInR > 0.4 || eyeLookOutL > 0.4 || eyeLookOutR > 0.4) {
              setEyeStatus("Distracted");
              console.log("[AI Tracker] Eye Movement: Distracted");
            } else {
              setEyeStatus("Focused");
              // Only log focused status occasionally to avoid spamming the console
              if (Math.random() < 0.05) {
                console.log("[AI Tracker] Eye Movement: Focused");
              }
            }
          }
        }

        // 2. Hand Tracking
        if (handLandmarkerRef.current) {
          const handResult = handLandmarkerRef.current.detectForVideo(video, startTimeMs);
          if (handResult.landmarks && handResult.landmarks.length > 0) {
            const count = handResult.landmarks.length;
            setHandStatus(`${count} Hand${count > 1 ? 's' : ''} Detected`);
            console.log(`[AI Tracker] Hand Activity: ${count} hands in frame`);
          } else {
            setHandStatus("None Detected");
          }
        }

        // 3. Expression Analysis (Call backend less frequently to save resources)
        if (Math.random() < 0.1) { // ~10% of frames for backend expression analysis
           analyzeExpression(video);
        }
      }
      requestRef.current = requestAnimationFrame(processVideo);
    };

    const analyzeExpression = async (video) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      canvas.width = 320;
      canvas.height = 240;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.3);

      try {
        const response = await fetch('http://localhost:5000/api/analysis/detect-expression', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image })
        });
        const data = await response.json();
        if (data.success && data.dominantExpression) {
          setExpression(data.dominantExpression.charAt(0).toUpperCase() + data.dominantExpression.slice(1));
        }
      } catch (err) { /* ignore */ }
    };

    requestRef.current = requestAnimationFrame(processVideo);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isVideoOff]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getExpressionIcon = (exp) => {
    switch (exp.toLowerCase()) {
      case 'happy': return <Smile className="w-4 h-4 text-green-400" />;
      case 'sad': return <Frown className="w-4 h-4 text-blue-400" />;
      case 'angry': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Meh className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden font-sans">
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/60">Live Interview</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <span className="text-sm font-medium text-cyan-400">Senior Software Engineer Role</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Duration</span>
            <span className="text-sm font-mono font-bold text-white">{formatTime(timer)}</span>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-white/40" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden p-8 gap-8 relative bg-[#050505]">

        {/* Left: Interviewer Container */}
        <div className="flex-1 bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl group transition-all duration-500 hover:border-cyan-500/20">
          <div className="absolute inset-0">
             <img 
               src={interviewerImg} 
               alt="Interviewer" 
               className="w-full h-full object-cover grayscale-[10%] brightness-[0.8] transition-all duration-700 group-hover:brightness-100 group-hover:grayscale-0"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
          
          {isInterviewerTalking && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-end gap-1 h-8">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [8, 24, 12, 32, 8] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  className="w-1.5 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                />
              ))}
            </div>
          )}

          <div className="absolute top-6 left-6 z-20">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
              <div className={cn("w-1.5 h-1.5 rounded-full", isInterviewerTalking ? "bg-cyan-500 animate-pulse" : "bg-white/20")} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{isInterviewerTalking ? "Speaking..." : "Interviewer"}</span>
            </div>
          </div>
        </div>

        {/* Right: User Camera Container */}
        <div className="flex-1 bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl group transition-all duration-500 hover:border-violet-500/20">
          {!isVideoOff ? (
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover grayscale-[20%] contrast-[1.1]"
              />
              <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-white/20 rounded-tl-lg" />
              <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
              <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-white/20 rounded-bl-lg" />
              <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-white/20 rounded-br-lg" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-[#050505] flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <User className="w-10 h-10 text-white/20" />
              </div>
            </div>
          )}

          <div className="absolute top-6 right-6 z-20 flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Candidate</span>
            </div>
            
            {/* Tracking Status Panel */}
            <div className="flex flex-col gap-2">
              <motion.div className="flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 shadow-xl">
                {getExpressionIcon(expression)}
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-tight">{expression}</span>
              </motion.div>

              <motion.div className="flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 shadow-xl">
                <Eye className={cn("w-4 h-4", eyeStatus === 'Focused' ? "text-green-400" : "text-yellow-400")} />
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-tight">Eyes: {eyeStatus}</span>
              </motion.div>

              <motion.div className="flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 shadow-xl">
                <Hand className={cn("w-4 h-4", handStatus !== 'None Detected' ? "text-violet-400" : "text-white/20")} />
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-tight">Hands: {handStatus}</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <footer className="h-28 bg-[#0a0a0a] border-t border-white/5 px-12 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[9px] text-white/20 uppercase font-black tracking-[0.2em] mb-1">Session Target</span>
            <span className="text-sm font-bold text-white/80">Senior React Engineer</span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border",
              isMuted ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20" : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/20"
            )}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border",
              isVideoOff ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20" : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/20"
            )}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button className="px-10 h-14 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            End Interview
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-3 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default InterviewSession;
