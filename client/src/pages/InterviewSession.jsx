import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  BarChart3,
  Settings,
  AlertCircle,
  ChevronRight,
  Bot,
  User,
  Smile,
  Frown,
  Meh,
  Zap,
  Eye,
  Hand,
  Type,
  Trophy,
  Target,
  ZapOff,
  CheckCircle2,
  X,
} from "lucide-react";
import { cn } from "../utils/cn";
import AIVisualizer from "../components/interview/AIVisualizer";
import {
  FilesetResolver,
  FaceLandmarker,
  HandLandmarker,
} from "@mediapipe/tasks-vision";
import { useUser } from "@clerk/clerk-react";
import API_BASE_URL from "../config/api";

const InterviewSession = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Resume data passed from InterviewSetup (optional)
  const resumeData = location.state?.resumeData || null;
  const hasResume = !!resumeData;

  const [sessionStartTime] = useState(new Date());
  const [hasStarted, setHasStarted] = useState(false);

  // Suppress noisy MediaPipe/WASM logs
  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalInfo = console.info;
    const originalError = console.error;

    const isNoise = (args) => {
      const msg = args.join(" ");
      return (
        msg.includes("xnnpack") ||
        msg.includes("vision_wasm") ||
        msg.includes("gl_context") ||
        msg.includes("landmark_projection") ||
        msg.includes("OpenGL") ||
        msg.includes("Graph successfully started") ||
        msg.includes("NORM_RECT") ||
        msg.includes("no-speech")
      );
    };

    console.log = (...args) => {
      if (!isNoise(args)) originalLog(...args);
    };
    console.warn = (...args) => {
      if (!isNoise(args)) originalWarn(...args);
    };
    console.info = (...args) => {
      if (!isNoise(args)) originalInfo(...args);
    };
    console.error = (...args) => {
      // Keep actual session errors, only filter MP noise
      if (!isNoise(args)) originalError(...args);
    };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.info = originalInfo;
      console.error = originalError;
    };
  }, []);

  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const [timer, setTimer] = useState(0);
  const [isInterviewerTalking, setIsInterviewerTalking] = useState(false);

  // Accumulators for Analysis
  const [fullTranscript, setFullTranscript] = useState([]);
  const [behavioralLogs, setBehavioralLogs] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [threadId] = useState(`INT-${Date.now()}`);
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [agentText, setAgentText] = useState("");
  const [evaluations, setEvaluations] = useState([]);
  const [sessionInsights, setSessionInsights] = useState(null);

  const [hasSentResume, setHasSentResume] = useState(false);

  const handleAgentMessage = async (message, overrideResumeData) => {
    if (!message || message.trim().length < 2) return;
    try {
      const payload = {
        message,
        threadId,
        resumeData: !hasSentResume
          ? overrideResumeData !== undefined
            ? overrideResumeData
            : resumeData
          : undefined,
      };

      if (payload.resumeData) {
        setHasSentResume(true);
      }

      const response = await fetch(`${API_BASE_URL}/api/interview/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setAgentText(data.response);
        if (data.evaluations) setEvaluations(data.evaluations);
        if (data.sessionInsights) setSessionInsights(data.sessionInsights);
        speakText(data.response);
      } else if (data.isRateLimit) {
        setAgentText(
          "I'm temporarily unavailable due to high demand. Please wait a moment and try again.",
        );
        speakText(
          "I'm temporarily unavailable due to high demand. Please wait a moment and try again.",
        );
      }
    } catch (err) {
      console.error("Agent Message Error:", err);
    }
  };

  const speakText = (text) => {
    if (!text) return;

    const synth = window.speechSynthesis;
    synth.cancel(); // Stop any current speech

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onstart = () => setIsInterviewerTalking(true);
    utterance.onend = () => setIsInterviewerTalking(false);
    utterance.onerror = (event) => {
      console.error("[Speech API] Utterance Error:", event.error);
      setIsInterviewerTalking(false);
    };

    const loadVoicesAndSpeak = () => {
      const voices = synth.getVoices();
      if (voices.length === 0) {
        // Fallback: wait a bit and try again if no voices
        setTimeout(loadVoicesAndSpeak, 100);
        return;
      }

      // Prioritize "Natural" or "Google" voices
      const preferredVoice =
        voices.find(
          (v) => v.name.includes("Natural") && v.lang.startsWith("en"),
        ) ||
        voices.find((v) => v.name.includes("Google US English")) ||
        voices.find((v) => v.name.includes("English (United States)")) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.pitch = 1.05;
        utterance.rate = 0.95;
      }

      synth.speak(utterance);
    };

    loadVoicesAndSpeak();
  };

  const stopAgentSpeech = () => {
    window.speechSynthesis.cancel();
    setIsInterviewerTalking(false);
    console.log("[Speech API] Agent interrupted by user");
  };

  const [expression, setExpression] = useState("Neutral");
  const [eyeStatus, setEyeStatus] = useState("Focused");
  const [handStatus, setHandStatus] = useState("None Detected");
  const [transcript, setTranscript] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const requestRef = useRef(null);
  const recognitionRef = useRef(null);

  const isMutedRef = useRef(isMuted);
  const isInterviewerTalkingRef = useRef(isInterviewerTalking);
  const hasStartedRef = useRef(hasStarted);

  // Keep refs in sync with state
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);
  useEffect(() => {
    isInterviewerTalkingRef.current = isInterviewerTalking;
  }, [isInterviewerTalking]);
  useEffect(() => {
    hasStartedRef.current = hasStarted;
  }, [hasStarted]);

  // Initialize MediaPipe
  useEffect(() => {
    const initMediaPipe = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
      );
      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU",
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1,
        },
      );
      handLandmarkerRef.current = await HandLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
        },
      );
    };
    initMediaPipe();
  }, []);

  // Initialize Web Speech API
  useEffect(() => {
    if (!hasStarted) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition API not supported in this browser.");
      return;
    }

    const initRecognition = () => {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecognitionActive(true);
        console.log("[Speech API] Listening...");
      };

      recognition.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const text = event.results[i][0].transcript;
            setFullTranscript((prev) => [
              ...prev,
              { text, timestamp: new Date().toISOString() },
            ]);
            console.log(`[Speech API] Final: ${text}`);
            handleAgentMessage(text);
            setTranscript("");
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (interimTranscript) setTranscript(interimTranscript);
      };

      recognition.onend = () => {
        setIsRecognitionActive(false);

        // Auto-restart logic
        if (
          !isMutedRef.current &&
          !isInterviewerTalkingRef.current &&
          hasStartedRef.current
        ) {
          // Use a slightly longer timeout if it was a quick closure to avoid tight loops
          setTimeout(() => {
            try {
              if (recognitionRef.current === recognition) {
                recognition.start();
              }
            } catch (err) {
              // Silently handle start errors (usually already started)
            }
          }, 1000); // 1s delay is more stable than 300ms
        } else {
          console.log("[Speech API] Connection closed");
        }
      };

      recognition.onerror = (event) => {
        if (event.error === "no-speech") {
          // Silent for no-speech, as it's a normal part of the cycle
          return;
        }

        console.error("[Speech API] Error:", event.error);
        if (event.error === "not-allowed") {
          setIsMuted(true);
        }
        if (event.error === "aborted") {
          // Aborted is usually intentional (e.g. stop() called)
          return;
        }
      };

      return recognition;
    };

    recognitionRef.current = initRecognition();

    // Start recognition if initial state allows
    if (!isMuted && !isInterviewerTalking) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("[Speech API] Initial start failed:", err);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        try {
          recognitionRef.current.stop();
        } catch (err) {}
        recognitionRef.current = null;
      }
    };
  }, [hasStarted, isMuted, isInterviewerTalking]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Initial Agent Greeting
  useEffect(() => {
    if (hasStarted) {
      if (hasResume) {
        // Resume mode: greet and start immediately — agent knows the candidate already
        handleAgentMessage("Hello, please begin the interview.");
      } else {
        // Manual mode: agent asks for domain and number of questions
        handleAgentMessage("Begin interview setup.");
      }
    }
  }, [hasStarted]);

  // Camera Streaming Logic
  useEffect(() => {
    const enableCamera = async () => {
      if (!hasStarted) return;
      try {
        if (!isVideoOff) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720, facingMode: "user" },
            audio: true,
          });
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        } else {
          stopCamera();
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };
    enableCamera();
    return () => stopCamera();
  }, [isVideoOff, hasStarted]);

  // Real-time Tracking Loop
  useEffect(() => {
    if (isVideoOff) return;
    const processVideo = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const startTimeMs = performance.now();
        const video = videoRef.current;
        let currentEye = "Focused";
        let currentHand = "None Detected";
        let currentExpression = "Neutral";

        if (faceLandmarkerRef.current) {
          const result = faceLandmarkerRef.current.detectForVideo(
            video,
            startTimeMs,
          );
          if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
            const shapes = result.faceBlendshapes[0].categories;

            // 1. Eye Tracking (Improved)
            const eyeLookInL =
              shapes.find((s) => s.categoryName === "eyeLookInLeft")?.score ||
              0;
            const eyeLookInR =
              shapes.find((s) => s.categoryName === "eyeLookInRight")?.score ||
              0;
            const eyeLookOutL =
              shapes.find((s) => s.categoryName === "eyeLookOutLeft")?.score ||
              0;
            const eyeLookOutR =
              shapes.find((s) => s.categoryName === "eyeLookOutRight")?.score ||
              0;
            if (
              eyeLookInL > 0.4 ||
              eyeLookInR > 0.4 ||
              eyeLookOutL > 0.4 ||
              eyeLookOutR > 0.4
            )
              currentEye = "Distracted";
            setEyeStatus(currentEye);

            // 2. High-Efficiency Emotion Mapping
            const smileL =
              shapes.find((s) => s.categoryName === "mouthSmileLeft")?.score ||
              0;
            const smileR =
              shapes.find((s) => s.categoryName === "mouthSmileRight")?.score ||
              0;
            const frownL =
              shapes.find((s) => s.categoryName === "mouthFrownLeft")?.score ||
              0;
            const frownR =
              shapes.find((s) => s.categoryName === "mouthFrownRight")?.score ||
              0;
            const browUp =
              shapes.find((s) => s.categoryName === "browInnerUp")?.score || 0;
            const browDownL =
              shapes.find((s) => s.categoryName === "browDownLeft")?.score || 0;
            const browDownR =
              shapes.find((s) => s.categoryName === "browDownRight")?.score ||
              0;
            const jawOpen =
              shapes.find((s) => s.categoryName === "jawOpen")?.score || 0;

            if (smileL > 0.4 && smileR > 0.4) currentExpression = "Happy";
            else if (frownL > 0.3 || frownR > 0.3) currentExpression = "Sad";
            else if (browDownL > 0.4 || browDownR > 0.4)
              currentExpression = "Angry";
            else if (browUp > 0.5 && jawOpen > 0.2)
              currentExpression = "Surprised";
            else if (jawOpen > 0.4) currentExpression = "Focused";

            setExpression(currentExpression);
          }
        }

        if (handLandmarkerRef.current) {
          const handResult = handLandmarkerRef.current.detectForVideo(
            video,
            startTimeMs,
          );
          if (handResult.landmarks && handResult.landmarks.length > 0)
            currentHand = `${handResult.landmarks.length} Hand(s) Detected`;
          setHandStatus(currentHand);
        }

        // Precise behavioral logging
        if (
          Math.floor(performance.now() / 2000) % 1 === 0 &&
          Math.random() < 0.1
        ) {
          setBehavioralLogs((prev) => [
            ...prev,
            {
              expression: currentExpression,
              eyeStatus: currentEye,
              handStatus: currentHand,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      }
      requestRef.current = requestAnimationFrame(processVideo);
    };

    requestRef.current = requestAnimationFrame(processVideo);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isVideoOff, expression]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  const getExpressionIcon = (exp) => {
    switch (exp.toLowerCase()) {
      case "happy":
        return <Smile className="w-4 h-4 text-green-400" />;
      case "sad":
        return <Frown className="w-4 h-4 text-blue-400" />;
      case "angry":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Meh className="w-4 h-4 text-cyan-400" />;
    }
  };

  const handleEndInterview = async () => {
    setIsAnalyzing(true);

    // Stop all active services
    stopCamera();
    stopAgentSpeech();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Error stopping recognition:", err);
      }
    }
    setHasStarted(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/analysis/analyze-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            transcript: fullTranscript,
            behavioralLogs,
            evaluations,
            sessionInsights,
            startTime: sessionStartTime,
            endTime: new Date(),
          }),
        },
      );
      const data = await response.json();
      if (data.success) {
        // Navigate to the dedicated analysis page with the data
        navigate(`/analysis/${data.sessionId}`, {
          state: { analysis: data.analysis },
        });
      }
    } catch (err) {
      console.error("End Interview Error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden font-sans">
      <canvas ref={canvasRef} className="hidden" />

      {/* Start Interview Overlay */}
      <AnimatePresence>
        {!hasStarted && !analysisResult && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full p-8 md:p-12 bg-[#0a0a0a] border border-white/10 rounded-[2rem] md:rounded-[3rem] text-center shadow-2xl"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-cyan-500/20 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 border border-cyan-500/20">
                <Bot className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-4 tracking-tight">
                Ready to Start?
              </h2>
              <p className="text-white/40 mb-8 md:mb-10 text-xs md:text-sm leading-relaxed">
                Your camera and microphone will only be activated once you click
                the button below. Ensure you are in a quiet, well-lit
                environment.
              </p>
              <button
                onClick={() => setHasStarted(true)}
                className="w-full py-4 md:py-5 rounded-2xl bg-cyan-500 text-[#0a0a0a] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-95"
              >
                Start Mock Interview
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Modal */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] md:rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
              <button
                onClick={() => setAnalysisResult(null)}
                className="absolute top-4 right-4 md:top-8 md:right-8 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-white/40" />
              </button>

              <div className="p-6 md:p-12 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 md:mb-12">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/20 shrink-0">
                    <Trophy className="w-10 h-10 md:w-12 md:h-12 text-cyan-400" />
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
                      Performance Analysis
                    </h2>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <div className="px-3 py-1 bg-cyan-500 rounded-full text-[10px] font-black uppercase text-[#0a0a0a]">
                        DeepHire AI Score
                      </div>
                      <span className="text-2xl md:text-3xl font-mono font-black text-cyan-400">
                        {analysisResult.score}/100
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
                  <div className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                      <Target className="w-5 h-5 text-green-400" />
                      <h3 className="font-bold uppercase tracking-widest text-white/40 text-[10px]">
                        Core Strengths
                      </h3>
                    </div>
                    <ul className="space-y-4">
                      {analysisResult.strengths.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-xs md:text-sm text-white/80 font-medium"
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                      <ZapOff className="w-5 h-5 text-red-400" />
                      <h3 className="font-bold uppercase tracking-widest text-white/40 text-[10px]">
                        Areas to Improve
                      </h3>
                    </div>
                    <ul className="space-y-4">
                      {analysisResult.weaknesses.map((w, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-xs md:text-sm text-white/80 font-medium"
                        >
                          <div className="w-4 h-4 rounded-full border border-red-500/30 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                          </div>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Behavioral Analysis Section */}
                {analysisResult.behavioralAnalysis && (
                  <div className="mb-8 md:mb-12">
                    <h3 className="font-bold mb-6 uppercase tracking-widest text-white/40 text-[10px] flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" /> Behavioral
                      Insights
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center">
                        <span className="text-[10px] uppercase font-bold text-white/20 mb-2">
                          Eye Contact
                        </span>
                        <span className="text-xl md:text-2xl font-mono font-black text-cyan-400">
                          {analysisResult.behavioralAnalysis.eyeContactScore}%
                        </span>
                        <p className="text-[10px] text-white/40 mt-1">
                          {analysisResult.behavioralAnalysis.engagementLevel}
                        </p>
                      </div>
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center">
                        <span className="text-[10px] uppercase font-bold text-white/20 mb-2">
                          Overall Sentiment
                        </span>
                        <span className="text-lg md:text-xl font-bold text-violet-400">
                          {analysisResult.behavioralAnalysis.sentiment}
                        </span>
                        <p className="text-[10px] text-white/40 mt-1">
                          Tone & Expression
                        </p>
                      </div>
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center sm:col-span-2 md:col-span-1">
                        <span className="text-[10px] uppercase font-bold text-white/20 mb-2">
                          Body Language
                        </span>
                        <span className="text-[10px] font-medium text-white/80">
                          {analysisResult.behavioralAnalysis.bodyLanguageNotes}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/10 mb-8 md:mb-12">
                  <h3 className="font-bold mb-4 uppercase tracking-widest text-white/40 text-[10px]">
                    AI Interviewer Feedback
                  </h3>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed font-medium italic">
                    "{analysisResult.feedback}"
                  </p>
                </div>

                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full py-4 md:py-5 rounded-2xl bg-white text-black font-black text-xs md:text-sm uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3"
                >
                  <BarChart3 className="w-4 h-4" />
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Loading Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl">
            <div className="relative mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full border-2 border-dashed border-cyan-500/20"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border-t-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              />
            </div>
            <h3 className="text-xl font-black uppercase tracking-[0.3em] text-white">
              Analyzing Session
            </h3>
            <p className="text-white/40 text-sm mt-2 font-medium">
              Groq Intelligence is evaluating your performance...
            </p>
          </div>
        )}
      </AnimatePresence>

      <header className="h-14 md:h-16 px-4 md:px-6 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
              Live
            </span>
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          {hasResume ? (
            <div className="flex items-center gap-2 max-w-[150px] md:max-w-none">
              <div className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/20 hidden sm:block">
                <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">
                  Resume
                </span>
              </div>
              <span className="text-[11px] md:text-sm font-medium text-white/60 truncate">
                {resumeData?.name || "Candidate"}
              </span>
            </div>
          ) : (
            <span className="text-[11px] md:text-sm font-medium text-cyan-400">
              AI Session
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[8px] md:text-[10px] text-white/40 uppercase font-bold tracking-tighter">
              Duration
            </span>
            <span className="text-xs md:text-sm font-mono font-bold text-white">
              {formatTime(timer)}
            </span>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Settings className="w-4 h-4 md:w-5 md:h-5 text-white/40" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 md:p-8 gap-4 md:gap-8 relative bg-[#050505]">
        <div className="flex-1 min-h-[300px] lg:min-h-0 bg-[#0a0a0a] rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl group transition-all duration-500 hover:border-cyan-500/20">
          <div className="absolute inset-0 z-10">
            <AIVisualizer
              isTalking={isInterviewerTalking}
              expression={expression}
            />

            {/* Agent Captions */}
            <AnimatePresence>
              {agentText && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] max-w-xl z-20 group/caption"
                >
                  <div className="bg-black/60 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-white/10 shadow-2xl relative">
                    <p className="text-white font-medium text-center text-xs md:text-sm leading-relaxed tracking-wide">
                      {agentText}
                    </p>

                    {isInterviewerTalking && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={stopAgentSpeech}
                        className="absolute -top-3 -right-3 p-1.5 md:p-2 bg-red-500 rounded-full shadow-lg border-2 border-white/20 hover:bg-red-600 transition-colors group"
                        title="Stop Agent Speaking"
                      >
                        <X className="w-3 h-3 text-white" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

          {isInterviewerTalking && (
            <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-end gap-1 h-6 md:h-8">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [6, 18, 10, 24, 6] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className="w-1 md:w-1.5 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                />
              ))}
            </div>
          )}
          <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
            <div className="flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-black/40 backdrop-blur-md rounded-lg md:rounded-xl border border-white/10">
              <div
                className={cn(
                  "w-1 h-1 md:w-1.5 md:h-1.5 rounded-full",
                  isInterviewerTalking
                    ? "bg-cyan-500 animate-pulse"
                    : "bg-white/20",
                )}
              />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/60">
                {isInterviewerTalking ? "Speaking..." : "Interviewer"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-[300px] lg:min-h-0 bg-[#0a0a0a] rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl group transition-all duration-500 hover:border-violet-500/20">
          {!isVideoOff ? (
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover grayscale-[20%] contrast-[1.1]"
              />
              <div className="absolute top-4 left-4 md:top-8 md:left-8 w-4 h-4 md:w-6 md:h-6 border-t-2 border-l-2 border-white/20 rounded-tl-lg" />
              <div className="absolute top-4 right-4 md:top-8 md:right-8 w-4 h-4 md:w-6 md:h-6 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 w-4 h-4 md:w-6 md:h-6 border-b-2 border-l-2 border-white/20 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-4 h-4 md:w-6 md:h-6 border-b-2 border-r-2 border-white/20 rounded-br-lg" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-[#050505] flex items-center justify-center">
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <User className="w-8 h-8 md:w-10 md:h-10 text-white/20" />
              </div>
            </div>
          )}
          <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex flex-col items-end gap-2 md:gap-3">
            <div className="flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-black/40 backdrop-blur-md rounded-lg md:rounded-xl border border-white/10">
              <div
                className={cn(
                  "w-1 h-1 md:w-1.5 md:h-1.5 rounded-full",
                  isRecognitionActive
                    ? "bg-green-500 animate-pulse"
                    : "bg-white/20",
                )}
              />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/60">
                {isRecognitionActive ? "Listening..." : "Mic Off"}
              </span>
            </div>
            {/* Performance Scorecard - Hidden on very small screens */}
            <AnimatePresence>
              {evaluations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden sm:flex flex-col gap-2 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 w-40 md:w-48 shadow-xl"
                >
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400/60 mb-1">
                    Live Evaluation
                  </span>
                  {evaluations
                    .slice(-3)
                    .reverse()
                    .map((ev, i) => (
                      <div
                        key={i}
                        className="flex flex-col gap-1 pb-2 border-b border-white/5 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] md:text-[10px] text-white/40 truncate w-20 md:w-24">
                            {ev.question}
                          </span>
                          <span
                            className={cn(
                              "text-[8px] md:text-[10px] font-bold",
                              ev.score > 7
                                ? "text-green-400"
                                : "text-yellow-400",
                            )}
                          >
                            {ev.score}/10
                          </span>
                        </div>
                      </div>
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex flex-col gap-1.5 md:gap-2">
              <motion.div className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-black/60 backdrop-blur-md rounded-lg md:rounded-xl border border-white/10 shadow-xl">
                {getExpressionIcon(expression)}
                <span className="text-[8px] md:text-[10px] font-bold text-white/80 uppercase tracking-tight">
                  {expression}
                </span>
              </motion.div>
              <motion.div className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-black/60 backdrop-blur-md rounded-lg md:rounded-xl border border-white/10 shadow-xl">
                <Eye
                  className={cn(
                    "w-3 h-3 md:w-4 md:h-4",
                    eyeStatus === "Focused"
                      ? "text-green-400"
                      : "text-yellow-400",
                  )}
                />
                <span className="text-[8px] md:text-[10px] font-bold text-white/80 uppercase tracking-tight">
                  {eyeStatus}
                </span>
              </motion.div>
            </div>
          </div>
          <AnimatePresence>
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 md:bottom-12 left-4 right-4 md:left-8 md:right-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-2xl z-30"
              >
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="mt-1 w-4 h-4 md:w-5 md:h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Type className="w-2.5 h-2.5 md:w-3 md:h-3 text-cyan-500" />
                  </div>
                  <p className="text-[10px] md:text-sm font-medium text-white/90 leading-relaxed italic line-clamp-2 md:line-clamp-none">
                    "{transcript}"
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <footer className="h-auto md:h-28 bg-[#0a0a0a] border-t border-white/5 px-4 md:px-12 py-6 md:py-0 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
        <div className="flex items-center gap-8 hidden md:flex">
          <div className="flex flex-col">
            <span className="text-[9px] text-white/20 uppercase font-black tracking-[0.2em] mb-1">
              Session Target
            </span>
            <span className="text-sm font-bold text-white/80">
              {hasResume
                ? resumeData?.currentRole || "Personalized Interview"
                : "AI-Guided Interview"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-5">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 border",
              isMuted
                ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20"
                : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/20",
            )}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={cn(
              "w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 border",
              isVideoOff
                ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20"
                : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/20",
            )}
          >
            {isVideoOff ? (
              <VideoOff className="w-5 h-5" />
            ) : (
              <Video className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={handleEndInterview}
            className="px-6 md:px-10 h-12 md:h-14 rounded-xl md:rounded-2xl bg-white text-black font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            End Interview
          </button>
        </div>
        <div className="flex items-center gap-4 md:hidden w-full">
           <div className="flex-1 h-[1px] bg-white/5" />
           <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Controls</span>
           <div className="flex-1 h-[1px] bg-white/5" />
        </div>
        <div className="flex items-center gap-4 hidden md:flex">
          <button className="p-3 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default InterviewSession;
