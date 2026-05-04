# Project Report: AI Voice Interviewer Integration

This document outlines the architecture, implementation, and features of the stateful AI Voice Interviewer integrated into the DeepHire platform.

## 1. Core Architecture & Libraries
We transitioned from a basic script to a robust **Server-Client** model:
*   **LangGraph (`@langchain/langgraph`)**: The central engine managing conversation state, persistence (via `MemorySaver`), and the interview logic loop.
*   **Groq (Llama 3.3 70B)**: The LLM engine chosen for its low-latency and high-reasoning capabilities, essential for real-time voice interaction.
*   **Web Speech API**: Browser-native STT (Speech-to-Text) and TTS (Text-to-Speech) integration for cost-effective, real-time communication.
*   **Zod**: Schema validation for structured tool calling (`save_and_evaluate`), ensuring high-quality evaluation data.

## 2. Key Features
*   **Live Evaluation Scorecard**: Real-time dashboard showing candidate scores and question-by-question analysis.
*   **Real-Time Captions**: Glassmorphism text overlays for the agent's responses.
*   **Natural Barge-in (Interrupt)**: A dedicated stop button to cut off the AI's speech instantly.
*   **STT Leniency**: Intelligent phonetic mapping to ignore speech-to-text glitches on technical terms (e.g., "front and" -> "frontend").
*   **Humanized Persona**: Professional but empathetic conversation style with natural filler words and encouraging feedback.

## 3. Implementation Workflow
1.  **Backend Development**:
    *   Implemented `InterviewController.js` using lazy initialization to prevent server crashes on missing environment variables.
    *   Established a memory-resident evaluation tracker to bridge the gap between background tool calls and real-time frontend updates.
2.  **Frontend Pipeline**:
    *   **STT Stability**: Robust auto-restart logic for the Speech Recognition engine.
    *   **Echo Cancellation Logic**: Automatically pausing STT while the AI is speaking to prevent feedback loops.
    *   **Avatar Sync**: Integrated TTS state with the Three.js avatar's lip-sync and expression animations.

## 4. Future Improvements
*   **ElevenLabs TTS**: For studio-quality, emotional AI voices.
*   **Streaming Headers**: To reduce response latency to under 500ms by streaming text-to-speech.
*   **Multimodal Feedback**: Using candidate facial expressions (from MediaPipe) to adjust the interviewer's tone and empathy.
*   **Deepgram STT**: For 100% accuracy on complex technical terminology.

---
**Status: Fully Integrated & Operational**
**Last Updated: 2026-05-04**
