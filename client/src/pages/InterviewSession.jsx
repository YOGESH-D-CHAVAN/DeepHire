import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff,
  Settings, AlertCircle, Bot, User,
  Smile, Frown, Meh, Eye, Hand, Type,
  Trophy, Target, ZapOff, CheckCircle2, X
} from 'lucide-react';
import { cn } from '../utils/cn';
import { Canvas } from '@react-three/fiber';
import Avatar from '../components/interview/Avatar';
import { FilesetResolver, FaceLandmarker, HandLandmarker } from '@mediapipe/tasks-vision';

const InterviewSession = () => {

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isInterviewerTalking, setIsInterviewerTalking] = useState(false);

  const [fullTranscript, setFullTranscript] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [threadId] = useState(`INT-${Date.now()}`);
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [agentText, setAgentText] = useState("");

  const [expression, setExpression] = useState('Neutral');
  const [eyeStatus, setEyeStatus] = useState('Focused');
  const [handStatus, setHandStatus] = useState('None Detected');
  const [transcript, setTranscript] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);

  // ================= VOICE SYSTEM =================

  const speakText = (text) => {
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onstart = () => setIsInterviewerTalking(true);
    utterance.onend = () => setIsInterviewerTalking(false);
    utterance.onerror = () => setIsInterviewerTalking(false);

    const voices = window.speechSynthesis.getVoices();

    const femaleKeywords = [
      'female','zira','samantha','salli','joanna',
      'ivy','kendra','kimberly','victoria',
      'hazel','serena','moira'
    ];

    let selectedVoice =
      voices.find(v =>
        v.lang.startsWith('en') &&
        femaleKeywords.some(k => v.name.toLowerCase().includes(k))
      ) ||
      voices.find(v => v.name.includes('Natural')) ||
      voices.find(v => v.name.includes('Google US English')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0];

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.pitch = 1.1;
      utterance.rate = 0.95;
    }

    window.speechSynthesis.speak(utterance);
  };

  const stopAgentSpeech = () => {
    window.speechSynthesis.cancel();
    setIsInterviewerTalking(false);
  };

  // preload voices
  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // ================= AGENT =================

  const handleAgentMessage = async (message) => {
    if (!message || message.trim().length < 2) return;

    const res = await fetch('http://localhost:4000/api/interview/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, threadId })
    });

    const data = await res.json();
    if (data.success) {
      setAgentText(data.response);
      speakText(data.response);
    }
  };

  // ================= SPEECH RECOGNITION =================

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      if (isInterviewerTalking) {
        recognitionRef.current.stop();
        return;
      }
      setIsRecognitionActive(true);
    };

    recognitionRef.current.onresult = (event) => {
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const text = event.results[i][0].transcript;

          setFullTranscript(prev => [...prev, text]);
          handleAgentMessage(text);
          setTranscript('');
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      setTranscript(interim);
    };

    recognitionRef.current.onend = () => {
      setIsRecognitionActive(false);
      if (!isMuted && !isInterviewerTalking) {
        setTimeout(() => {
          try { recognitionRef.current.start(); } catch {}
        }, 300);
      }
    };

    if (!isMuted && !isInterviewerTalking) {
      try { recognitionRef.current.start(); } catch {}
    }

    return () => recognitionRef.current?.stop();

  }, [isMuted, isInterviewerTalking]);

  // ================= TIMER =================

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // ================= CAMERA =================

  useEffect(() => {
    const enableCamera = async () => {
      if (isVideoOff) return;

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
    };

    enableCamera();

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [isVideoOff]);

  // ================= UI =================

  return (
    <div className="h-screen bg-black text-white flex flex-col">

      <header className="h-16 flex justify-between px-6 items-center border-b border-white/10">
        <span>Interview Session</span>
        <span>{Math.floor(timer / 60)}:{timer % 60}</span>
      </header>

      <div className="flex flex-1">

        {/* AI Panel */}
        <div className="flex-1 flex flex-col items-center justify-center relative">

          <Canvas>
            <Avatar expression={expression} isTalking={isInterviewerTalking} />
          </Canvas>

          {agentText && (
            <div className="absolute bottom-10 bg-black/60 p-4 rounded-xl">
              {agentText}
              {isInterviewerTalking && (
                <button onClick={stopAgentSpeech}>Stop</button>
              )}
            </div>
          )}
        </div>

        {/* User Panel */}
        <div className="flex-1 relative">
          {!isVideoOff && <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />}

          {transcript && (
            <div className="absolute bottom-10 bg-black/60 p-3 rounded-xl">
              {transcript}
            </div>
          )}
        </div>

      </div>

      <footer className="h-20 flex justify-center gap-6 items-center border-t border-white/10">

        <button onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <MicOff /> : <Mic />}
        </button>

        <button onClick={() => setIsVideoOff(!isVideoOff)}>
          {isVideoOff ? <VideoOff /> : <Video />}
        </button>

        <button onClick={() => handleAgentMessage("End interview")}>
          End
        </button>

      </footer>

    </div>
  );
};

export default InterviewSession;