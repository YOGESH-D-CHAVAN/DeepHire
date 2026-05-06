# System Architecture - DeepHire

## 1. Architecture Overview

DeepHire uses a modern **microservices-ready monolithic architecture** optimized for behavioral interview simulation and real-time competency analysis, with clear separation of concerns between frontend and backend designed for authenticity and scalability.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├──────────────────────────────────────────────────────────────────┤
│  React 19 + Vite  │  Three.js 3D  │  MediaPipe CV │ TailwindCSS │
│                  (Interview UI)      (Avatar)        (Analysis)   │
└────────────┬──────────────────────────────────────────────────┬──┘
             │                                                   │
             │  HTTPS / WebSocket                                │
             ▼                                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│                   Express.js Middleware                          │
├──────────────────────────────────────────────────────────────────┤
│  Auth  │  CORS  │  Rate Limit  │  Error Handler  │  Logger      │
└────┬───────────────────────────────────────────────┬────────────┘
     │                                               │
     ▼                                               ▼
┌──────────────────────────┐        ┌────────────────────────────────┐
│   Interview Service      │        │    Analysis Service            │
├──────────────────────────┤        ├────────────────────────────────┤
│ • Session Management     │        │ • Emotion Detection            │
│ • Question Generation    │        │ • Performance Analysis         │
│ • Video Recording Handler│        │ • Feedback Generation          │
│ • Transcript Creation    │        │ • Report Generation            │
└──────┬───────────────────┘        └────────┬─────────────────────┘
       │                                      │
       ├──────────────────────┬───────────────┤
       │                      │               │
       ▼                      ▼               ▼
┌──────────────────┐  ┌──────────────┐  ┌────────────────────┐
│  Auth Service    │  │  User Service│  │  Database Layer    │
├──────────────────┤  ├──────────────┤  ├────────────────────┤
│ • JWT Tokens     │  │ • Profile    │  │  MongoDB           │
│ • Clerk OAuth    │  │ • Settings   │  │  Collections:      │
│ • Session Mgmt   │  │ • Billing    │  │  • Users           │
│ • Verification   │  │ • Stats      │  │  • Interviews      │
└──────┬───────────┘  └──────┬───────┘  │  • Subscriptions   │
       │                     │          │  • Analytics       │
       ▼                     ▼          └────────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│                    External Services                              │
├──────────────────────────────────────────────────────────────────┤
│  Groq API    │  LangChain    │  Clerk Auth    │  AWS S3          │
│  (LLM)       │  (Orchestration) (OAuth)        │  (Video Storage) │
└──────────────────────────────────────────────────────────────────┘
```

## 2. Technology Stack

### Frontend Stack

| Component   | Technology    | Version | Purpose                            |
| ----------- | ------------- | ------- | ---------------------------------- |
| Framework   | React         | 19.2.5  | UI Component Framework             |
| Build Tool  | Vite          | 8.0.10  | Fast bundler and dev server        |
| 3D Graphics | Three.js      | 0.184.0 | 3D avatar rendering                |
| Vision      | MediaPipe     | 0.10.35 | Facial expression & pose detection |
| Styling     | TailwindCSS   | 4.2.4   | Utility-first CSS                  |
| Animation   | Framer Motion | 12.38.0 | Smooth animations                  |
| Routing     | React Router  | 7.14.2  | Client-side routing                |
| Auth        | Clerk         | 5.61.6  | OAuth & session management         |
| PDF Viewer  | PDF.js        | 5.7.284 | Resume/document display            |
| Charts      | Recharts      | 3.8.1   | Performance analytics charts       |

### Backend Stack

| Component     | Technology  | Version | Purpose                   |
| ------------- | ----------- | ------- | ------------------------- |
| Runtime       | Node.js     | 16+     | JavaScript runtime        |
| Framework     | Express.js  | 5.2.1   | Web server framework      |
| Database      | MongoDB     | 9.6+    | NoSQL document store      |
| ODM           | Mongoose    | 9.6.1   | MongoDB object modeling   |
| AI/LLM        | Groq SDK    | 1.1.2   | LLM API integration       |
| Orchestration | LangChain   | 1.2.9   | AI workflow orchestration |
| Face Analysis | face-api.js | 0.22.2  | Facial recognition        |
| Validation    | Zod         | 4.4.3   | Schema validation         |
| Environment   | dotenv      | 17.4.2  | Config management         |
| Dev Tool      | Nodemon     | 3.1.14  | Auto-reload during dev    |

### Infrastructure & Services

| Service       | Provider         | Purpose                          |
| ------------- | ---------------- | -------------------------------- |
| Auth          | Clerk            | OAuth, session management        |
| LLM API       | Groq             | AI model access (Mixtral, LLaMA) |
| Video Storage | AWS S3           | Interview video recordings       |
| Database      | MongoDB Atlas    | Cloud MongoDB hosting            |
| Deployment    | Docker           | Containerization                 |
| Cache         | Redis (optional) | Session/response caching         |

## 3. Detailed Component Architecture

### 3.1 Frontend Architecture

#### Component Structure

```
src/
├── pages/
│   ├── LandingPage.jsx          # Public landing page
│   ├── SignInPage.jsx           # Login
│   ├── SignUpPage.jsx           # Registration
│   ├── Dashboard.jsx            # Competency dashboard (protected)
│   ├── BehavioralInterview.jsx  # Active behavioral interview
│   ├── InterviewAnalysis.jsx    # Competency & STAR analysis
│   ├── InterviewsHistory.jsx    # Interview history with filtering
│   ├── CompanyLibrary.jsx       # Browse company-specific interviews
│   ├── ProPage.jsx              # Pricing/upgrade
│   ├── AccountPage.jsx          # User account settings
│   └── HelpCenter.jsx           # Help & STAR method guide
├── components/
│   ├── interview/
│   │   ├── BehavioralAvatar.jsx      # HR interviewer avatar with realistic behavior
│   │   ├── STARIndicator.jsx          # Real-time STAR structure display
│   │   ├── CompetencyVisualizer.jsx   # Real-time competency tracking
│   │   ├── StressIndicator.jsx        # Stress/confidence visualization
│   │   └── VideoRecorder.jsx          # Video capture for behavioral analysis
│   ├── dashboard/
│   │   ├── CompetencyRadar.jsx        # Competency heatmap
│   │   ├── STARComplianceTracker.jsx  # STAR method progress
│   │   ├── BenchmarkComparison.jsx    # Peer comparison charts
│   │   └── CompanyPerformance.jsx     # Performance by company
│   ├── analysis/
│   │   ├── CompetencyReport.jsx       # Detailed competency breakdown
│   │   ├── STARAnalysis.jsx           # STAR compliance analysis
│   │   ├── RecommendationEngine.jsx   # Actionable recommendations
│   │   └── VideoClips.jsx             # Tagged competency clips
│   ├── layout/
│   │   ├── Navbar.jsx           # App header
│   │   ├── LandingNavbar.jsx     # Landing page header
│   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   └── Footer.jsx           # App footer
│   └── shared/
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Modal.jsx
│       └── CompetencyBadge.jsx
├── utils/
│   ├── cn.js                    # Class name utility
│   ├── api.js                   # API client (axios)
│   ├── auth.js                  # Auth helpers
│   ├── starAnalyzer.js          # STAR method detection
│   └── competencyFramework.js   # Competency mappings
├── hooks/
│   ├── useAuth.js               # Auth context hook
│   ├── useBehavioralInterview.js # Interview state management
│   ├── useSTARAnalysis.js       # STAR detection hook
│   ├── useCompetencyTracking.js # Real-time competency scoring
│   └── useAnalytics.js          # Analytics tracking
├── context/
│   ├── AuthContext.jsx          # Global auth state
│   ├── InterviewContext.jsx     # Interview state
│   └── CompetencyContext.jsx    # Competency framework state
├── App.jsx                      # Root component
└── main.jsx                     # Entry point
```

**Key Behavioral Interview Components**:

1. **Behavioral Avatar System** - Realistic HR interviewer with:
   - Natural speech patterns and pauses
   - Facial expressions and hand gestures
   - Active listening cues
   - Follow-up questioning patterns
   - Stress interview mode (aggressive questioning)
   - Regional accent variety

2. **STAR Method Real-time Detection** - Analyzes responses for:
   - Situation identification
   - Task clarity
   - Action specificity
   - Result quantification
   - Missing components alerts

3. **Competency Visualization** - Tracks:
   - Leadership indicators
   - Teamwork patterns
   - Problem-solving approach
   - Communication effectiveness
   - Real-time scoring display

4. **Stress Response Tracking** - Monitors:
   - Confidence consistency
   - Nervous behaviors
   - Voice tone changes
   - Eye contact patterns
   - Composure under pressure

#### Key Frontend Subsystems

**1. Interview System**

- Handles interview UI, video capture, and real-time visualization
- Integrates MediaPipe for facial analysis
- Manages WebSocket connection for real-time updates

**2. 3D Avatar System**

- Three.js rendering engine
- Avatar model loading and animation
- Lip-sync with audio from LLM responses
- Gesture animation based on conversation context

**3. Computer Vision System**

- MediaPipe facial landmarks detection
- Emotion detection using face-api.js
- Real-time confidence scoring
- Gesture and posture analysis

**4. Authentication System**

- Clerk OAuth integration
- Token-based session management
- Protected route handling with React Router

### 3.2 Backend Architecture

#### Project Structure

```
server/
├── index.js                     # Express app entry point
├── config/
│   ├── db.js                    # MongoDB connection
│   ├── env.js                   # Environment config
│   └── constants.js             # App constants
├── models/
│   ├── User.js                  # User schema
│   ├── BehavioralInterview.js   # Behavioral interview sessions
│   ├── CompetencyScore.js       # Competency assessments
│   ├── STARAnalysis.js          # STAR method analysis
│   └── Subscription.js          # Billing/subscription
├── controllers/
│   ├── BehavioralInterviewController.js  # Interview logic
│   ├── CompetencyController.js           # Competency analysis
│   ├── STARAnalysisController.js         # STAR detection & scoring
│   ├── AuthController.js                 # Authentication
│   ├── UserController.js                 # User management
│   └── BillingController.js              # Subscription handling
├── routes/
│   ├── interviewRoutes.js       # Interview endpoints
│   ├── competencyRoutes.js      # Competency endpoints
│   ├── authRoutes.js            # Auth endpoints
│   ├── userRoutes.js            # User endpoints
│   └── billingRoutes.js         # Billing endpoints
├── middleware/
│   ├── auth.js                  # JWT verification
│   ├── errorHandler.js          # Error handling
│   ├── validation.js            # Request validation
│   ├── rateLimit.js             # Rate limiting
│   └── logger.js                # Request logging
├── services/
│   ├── BehavioralInterviewService.js  # Interview orchestration
│   ├── AIInterviewService.js    # Groq + LangChain AI
│   ├── CompetencyService.js     # Competency framework & scoring
│   ├── STARDetectionService.js  # STAR method NLP analysis
│   ├── BehavioralAnalysisService.js   # Behavioral scoring
│   ├── VideoService.js          # Video upload to S3
│   ├── TranscriptService.js     # Interview transcription
│   └── NotificationService.js   # Email notifications
├── utils/
│   ├── validators.js            # Schema validation (Zod)
│   ├── jwt.js                   # JWT token handling
│   ├── s3.js                    # AWS S3 client
│   ├── logger.js                # Logging utility
│   ├── starAnalyzer.js          # STAR NLP detection
│   ├── competencyMapper.js      # Map responses to competencies
│   └── helpers.js               # Utility functions
└── jobs/
    ├── analysisQueue.js         # Background competency analysis jobs
    └── emailQueue.js            # Email sending jobs
```

**Key Behavioral Interview Services**:

1. **BehavioralInterviewService** - Orchestrates:
   - Interview session lifecycle management
   - Question selection from competency framework
   - Response collection and storage
   - Flow control (when to ask follow-ups, when to move to next question)

2. **AIInterviewService** - Manages:
   - Groq LLM for realistic HR behavior simulation
   - LangChain orchestration for multi-step reasoning
   - Follow-up question generation based on response quality
   - Stress level adjustment in real-time
   - Company-specific question routing

3. **CompetencyService** - Provides:
   - SHRM competency framework management
   - Competency scoring algorithms
   - Benchmark data and percentile ranking
   - Competency-question mappings

4. **STARDetectionService** - Performs:
   - Natural Language Processing for STAR component detection
   - Situation identification and scoring
   - Task clarity evaluation
   - Action specificity analysis
   - Result quantification detection
   - Missing component alerts

5. **BehavioralAnalysisService** - Analyzes:
   - Response quality metrics
   - Authenticity scoring
   - Stress response indicators
   - Communication effectiveness
   - Leadership indicators
   - Team dynamics signals

#### Key Backend Services

**1. Interview Service**

```javascript
// Key responsibilities:
- Create interview sessions
- Manage conversation flow
- Store interview data in MongoDB
- Handle video upload to S3
```

**2. AI Service (LangChain + Groq Integration)**

```javascript
// Architecture:
GraphState {
  messages: [Message],
  context: string,
  nextAction: string
}

Flow:
1. User response captured
2. Send to LangChain orchestrator
3. Groq LLM generates contextual question
4. Response goes back to frontend
5. Feedback stored in database
```

**3. Analysis Service**

```javascript
// Components:
- Emotion Detection (MediaPipe + face-api.js)
- Performance Scoring Algorithm
- Feedback Generation (LLM-powered)
- Report Generation
```

**4. Authentication Service**

```javascript
// Uses Clerk for:
- OAuth providers (Google, GitHub, LinkedIn)
- Session management
- JWT token generation
- User verification
```

## 4. Data Flow Architecture

### 4.1 Interview Session Flow

```
1. User initiates interview
   ↓
2. Frontend requests /api/interviews/create
   ↓
3. Backend:
   - Validates user subscription
   - Creates InterviewSession record
   - Generates interview questions via Groq
   - Returns session details
   ↓
4. Frontend:
   - Renders 3D avatar
   - Starts video/audio capture
   - Initializes MediaPipe
   ↓
5. Interview loop:
   - AI reads first question (text-to-speech)
   - User responds (video/audio captured)
   - Frontend captures facial expressions in real-time
   - Audio sent to backend for transcription
   - LangChain evaluates response
   - Groq generates next question
   - Cycle repeats
   ↓
6. Interview ends
   ↓
7. Backend:
   - Stops video recording
   - Uploads to S3
   - Transcribes interview
   - Runs analysis (AI + emotion detection)
   - Generates performance report
   ↓
8. Frontend shows results
```

### 4.2 Analysis Pipeline

```
Interview Data
    ↓
┌───────────────────────────────────────┐
│   Data Extraction & Preprocessing     │
├───────────────────────────────────────┤
│ • Parse transcript                    │
│ • Extract emotion data                │
│ • Frame facial expressions            │
│ • Segment by question                 │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│   AI-Powered Analysis                 │
├───────────────────────────────────────┤
│ • Technical accuracy (LLM)            │
│ • Communication quality (LLM)         │
│ • Behavioral fit (ML model)           │
│ • Confidence trends (CV analysis)     │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│   Feedback Generation                 │
├───────────────────────────────────────┤
│ • Personalized recommendations        │
│ • Strength highlights                 │
│ • Improvement areas                   │
│ • Comparison to benchmarks            │
└───────────────────────────────────────┘
    ↓
Generated Report
    ↓
Store in MongoDB + Cache
    ↓
Display to User
```

## 5. API Architecture

### 5.1 RESTful Endpoint Design

**Base URL**: `/api/v1`

**Interview Endpoints**:

```
POST   /interviews              Create new interview
GET    /interviews/:id          Get interview details
POST   /interviews/:id/submit   Submit response
GET    /interviews/:id/analysis Get analysis results
DELETE /interviews/:id          Delete interview
```

**User Endpoints**:

```
GET    /users/profile          Get user profile
PUT    /users/profile          Update profile
GET    /users/stats            Get user statistics
GET    /users/subscription     Get subscription status
```

**Analysis Endpoints**:

```
GET    /analysis/:id           Get analysis details
GET    /analysis/:id/report    Get PDF report
POST   /analysis/:id/feedback  Submit feedback
```

**Auth Endpoints**:

```
POST   /auth/register          Register new user
POST   /auth/login             Login
POST   /auth/logout            Logout
POST   /auth/refresh           Refresh token
```

### 5.2 Authentication & Security

**JWT Token Structure**:

```javascript
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "user_id",
  "email": "user@example.com",
  "tier": "pro",
  "iat": 1234567890,
  "exp": 1234571490
}

Secret: Environment variable (never exposed)
```

**Security Measures**:

- HTTPS-only communication
- CORS configured for allowed origins
- Rate limiting (50 req/min per IP)
- SQL injection prevention via Mongoose
- XSS protection via React escaping
- CSRF tokens on state-changing operations

## 6. Database Architecture

### 6.1 MongoDB Schema Design

**Collections**:

1. **users**
   - Indexed on: `email`, `clerkId`
   - Partitioned by: `tier` (for analytics)

2. **interviewSessions**
   - Indexed on: `userId`, `createdAt`
   - TTL index on raw videos (30 days)

3. **analysisResults**
   - Indexed on: `interviewId`, `userId`
   - Cached in Redis for frequent access

4. **subscriptions**
   - Indexed on: `userId`, `endDate`
   - Used for renewal reminders

### 6.2 Scalability Strategy

**Sharding**:

- Shard key: `userId` (for interviews and analyses)
- Allows horizontal scaling as user base grows

**Replication**:

- MongoDB replica set (3 nodes)
- Automatic failover
- Read preference: secondary for analytics

**Indexing**:

- Compound indexes for common queries
- Regular index analysis and optimization

## 7. Deployment Architecture

### 7.1 Containerization

**Docker Setup**:

```dockerfile
# Frontend
FROM node:18-alpine
WORKDIR /app/client
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Backend
FROM node:18-alpine
WORKDIR /app/server
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]
```

### 7.2 Infrastructure Stack

```
┌─────────────────────────────────────────┐
│    Docker Container Orchestration       │
│    (Kubernetes / Docker Compose)        │
├─────────────────────────────────────────┤
│                                         │
│  Frontend Pods (React)                  │
│  Backend Pods (Node.js/Express)         │
│  Worker Pods (Background Jobs)          │
│  Cache Layer (Redis)                    │
│                                         │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴─────────┐
        ▼                ▼
    MongoDB Atlas     AWS S3
    (Database)     (Video Storage)
```

## 8. Performance Optimization

### 8.1 Frontend Optimization

- Code splitting with dynamic imports
- Image lazy loading
- Service worker caching
- Memoization for heavy computations
- WebAssembly for emotion detection (future)

### 8.2 Backend Optimization

- Connection pooling (MongoDB)
- Redis caching for frequent queries
- Async job processing (Bull/BullMQ)
- Batch processing for analyses
- CDN for static assets

### 8.3 Database Optimization

- Query optimization and indexing
- Aggregation pipeline for analytics
- Partitioning by user for scale
- Regular vacuum and maintenance

## 9. Monitoring & Observability

### 9.1 Metrics Collection

- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Custom metrics for business KPIs
- Database query performance

### 9.2 Logging Strategy

- Centralized logging (ELK Stack / CloudWatch)
- Log levels: debug, info, warn, error
- Correlation IDs for request tracing
- Audit logs for compliance

### 9.3 Alerting

- Server downtime alerts
- High error rate alerts
- Database performance degradation
- Subscription billing issues

## 10. Disaster Recovery

### 10.1 Backup Strategy

- Daily database backups (MongoDB)
- 30-day retention policy
- Point-in-time recovery capability
- Off-site backup storage

### 10.2 High Availability

- Multi-region deployment (future)
- Active-passive failover
- Database replication
- Load balancing across servers

### 10.3 Incident Response

- On-call rotation for critical issues
- Runbook documentation
- RCA process for post-mortems
- Regular disaster recovery drills

## 11. Scalability Roadmap

### Current (MVP)

- Single backend instance
- Single MongoDB instance
- Manual scaling

### Year 1

- Load balancing for backend
- Database replication
- Redis caching layer
- CDN for static content

### Year 2+

- Microservices separation
- Database sharding
- Kubernetes orchestration
- Multi-region deployment

---

**Document Version**: 1.0
**Last Updated**: 2026-05-05
**Architecture Diagram Tool**: Mermaid/ASCII
