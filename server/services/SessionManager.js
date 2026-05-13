/**
 * SessionManager handles the storage of active interview session states.
 * Currently uses an in-memory Map, but can be easily swapped for Redis
 * for horizontal scaling and persistence.
 */
class SessionManager {
  constructor() {
    this.evaluations = new Map();
    this.states = new Map();
    this.resumeData = new Map();
    this.initializedThreads = new Set();
  }

  // Evaluations
  getEvaluations(threadId) {
    return this.evaluations.get(threadId) || [];
  }

  addEvaluation(threadId, evaluation) {
    if (!this.evaluations.has(threadId)) {
      this.evaluations.set(threadId, []);
    }
    this.evaluations.get(threadId).push(evaluation);
  }

  // States
  getState(threadId, defaultValueCallback) {
    if (!this.states.has(threadId)) {
      this.states.set(threadId, defaultValueCallback());
    }
    return this.states.get(threadId);
  }

  setState(threadId, state) {
    this.states.set(threadId, state);
  }

  // Resume Data
  getResumeData(threadId) {
    return this.resumeData.get(threadId);
  }

  setResumeData(threadId, data) {
    this.resumeData.set(threadId, data);
  }

  hasResumeData(threadId) {
    return this.resumeData.has(threadId);
  }

  // Initialization
  isInitialized(threadId) {
    return this.initializedThreads.has(threadId);
  }

  setInitialized(threadId) {
    this.initializedThreads.add(threadId);
  }

  // Cleanup (Optional but good for memory management)
  clearSession(threadId) {
    this.evaluations.delete(threadId);
    this.states.delete(threadId);
    this.resumeData.delete(threadId);
    this.initializedThreads.delete(threadId);
  }
}

export const sessionManager = new SessionManager();
