# AI Math Tutor - Implementation Plan

## Overview
This document outlines the implementation plan for extending the AI Math Tutor application with role-based access (Student/Professor), data persistence, and a professor dashboard for viewing student submissions.

## Database Schema

```
┌─────────────────────┐
│      STUDENTS       │
├─────────────────────┤
│ id (PK)            │
│ name               │
│ createdAt          │
│ updatedAt          │
└─────────────────────┘
         │
         │ 1
         │
         │ *
┌─────────────────────┐
│      SESSIONS       │
├─────────────────────┤
│ id (PK)            │
│ studentId (FK)     │
│ slideCount         │
│ pdfUrl             │
│ status             │
│ createdAt          │
│ completedAt        │
└─────────────────────┘
         │
         │ 1
         ├─────────┐
         │ *       │ 1
┌─────────────────────┐  ┌─────────────────────┐
│   CONVERSATIONS     │  │      FEEDBACK       │
├─────────────────────┤  ├─────────────────────┤
│ id (PK)            │  │ id (PK)            │
│ sessionId (FK)     │  │ sessionId (FK)     │
│ role               │  │ slideFeedback      │
│ content            │  │ overallFeedback    │
│ timestamp          │  │ presentationScore  │
│ slideNumber        │  │ strengths          │
│ createdAt          │  │ improvements       │
└─────────────────────┘  │ createdAt          │
                         │ viewedByProfessor  │
                         │ viewedAt           │
                         └─────────────────────┘
```

**Relationships:**
- One Student can have many Sessions (1:*)
- One Session has one Feedback (1:1)
- One Session has many Conversation entries (1:*) - stores the entire chat/audio dialogue
- Sessions are linked to Students via `studentId` foreign key
- Feedback is linked to Sessions via `sessionId` foreign key
- Conversations are linked to Sessions via `sessionId` foreign key

**Table Details:**
- **CONVERSATIONS**: Stores each message in the tutoring session (both student audio transcripts and AI responses)
  - `role`: either "student" or "assistant"
  - `content`: the actual text of the message
  - `slideNumber`: which slide was being discussed
  - `timestamp`: when in the session this occurred
- **FEEDBACK**: Stores the final generated feedback summary
  - `viewedByProfessor`: boolean flag if professor has seen it
  - `viewedAt`: timestamp of when professor first viewed it
  - Removed `reviewedBy` since AI generates the feedback

## Phase 1: Foundation

### Database Setup
Set up PostgreSQL with Prisma ORM to manage our data models. We'll need four main tables: students (storing name and session metadata), sessions (tracking each student's attempt with timestamps), conversations (storing the complete dialogue between student and AI), and feedback (storing the generated feedback summary). The schema would include foreign key relationships where each session belongs to a student, and both conversations and feedback entries belong to a session.

**Implementation Steps:**
• Install Prisma and PostgreSQL dependencies in `backend/package.json`
• Create `backend/prisma/schema.prisma` with Student, Session, and Feedback models
• Add fields like studentName, sessionId, slideContent, audioTranscript, generatedFeedback, createdAt
• Set up database migrations using `npx prisma migrate dev`
• Create `backend/src/services/database.service.ts` with functions like createSession(), saveFeedback(), getAllSessions()
• Add connection string to `backend/.env` as DATABASE_URL

**Code Locations:**
- New file: `backend/prisma/schema.prisma`
- New file: `backend/src/services/database.service.ts`
- Modify: `backend/.env` (add DATABASE_URL)
- Modify: `backend/package.json` (add @prisma/client, prisma dependencies)

### Backend API Updates
Modify the existing Express endpoints to integrate with the database instead of using in-memory storage. The current endpoints for slide upload and feedback generation need to persist data immediately upon generation. We'll also need new endpoints for professor-specific operations like fetching all student sessions.

**Implementation Steps:**
• Update `backend/src/index.ts` - modify `/api/upload-slides` endpoint to create a new session in database with student name
• Modify `/api/generate-feedback` endpoint in `backend/src/index.ts` to save feedback to database immediately after AI generation
• Create new `/api/professor/sessions` endpoint in `backend/src/index.ts` to fetch all student sessions with feedback
• Add `/api/professor/session/:id` endpoint for fetching individual session details
• Implement proper error handling and database transaction management in all endpoints
• Update `backend/src/services/slideProcessor.ts` to accept and handle session IDs

**Code Locations:**
- Modify: `backend/src/index.ts` (all API endpoints)
- Modify: `backend/src/services/slideProcessor.ts`
- Modify: `backend/src/services/feedbackGenerator.ts` (to include session context)

## Phase 2: Authentication & Routing

### Landing Page
Create a new entry point component that replaces the current main page. This will be a simple selection screen with two large buttons/cards for "Student" and "Professor" roles. The component will manage navigation state and redirect users to appropriate flows based on their selection.

**Implementation Steps:**
• Create `frontend/src/components/LandingPage.tsx` with role selection UI
• Add state management using useState for tracking selected role
• Implement routing logic to redirect to `/student` or `/professor` paths
• Style with Tailwind classes for a clean, centered layout with clear CTAs
• Add hover effects (hover:scale-105) and proper accessibility attributes (role="button", aria-label)
• Update `frontend/src/App.tsx` to use LandingPage as the default route

**Code Locations:**
- New file: `frontend/src/components/LandingPage.tsx`
- Modify: `frontend/src/App.tsx` (change default route from current main component)
- Modify: `frontend/src/main.tsx` (wrap with BrowserRouter)

### Simple Auth
Implement a basic password verification system for professors without complex authentication infrastructure. The password will be stored as an environment variable (hashed) and checked on the backend. We'll use a simple session token or cookie to maintain professor login state.

**Implementation Steps:**
• Create `/api/auth/professor` endpoint in `backend/src/index.ts` that accepts password and returns success/failure
• Store professor password hash in `backend/.env` as PROFESSOR_PASSWORD_HASH
• Install bcrypt: `npm install bcrypt @types/bcrypt` in backend
• Implement password comparison in new file `backend/src/middleware/auth.ts`
• Set HTTP-only cookie using express-session or return JWT token for session management
• Add auth middleware function to protect professor-only endpoints

**Code Locations:**
- New file: `backend/src/middleware/auth.ts`
- Modify: `backend/src/index.ts` (add auth endpoint and middleware)
- Modify: `backend/.env` (add PROFESSOR_PASSWORD_HASH)
- New file: `frontend/src/components/ProfessorLogin.tsx`
- New file: `frontend/src/contexts/AuthContext.tsx` (for managing auth state)

### Routing Structure
Set up React Router to handle the different user flows and protect professor routes. The routing will ensure students can't access professor dashboard and professors must be authenticated. We'll also handle redirect logic after successful authentication.

**Implementation Steps:**
• Install react-router-dom: `npm install react-router-dom @types/react-router-dom` in frontend
• Create route structure in `frontend/src/App.tsx`: `/`, `/student`, `/professor`, `/professor/dashboard`
• Implement `frontend/src/components/ProtectedRoute.tsx` that checks for professor authentication
• Add route guards that redirect unauthenticated users to `/professor` login page
• Set up proper navigation flow between components using useNavigate hook
• Move current main application to `/student` route

**Code Locations:**
- Modify: `frontend/src/App.tsx` (complete routing restructure)
- New file: `frontend/src/components/ProtectedRoute.tsx`
- Move: Current main component to `frontend/src/components/StudentFlow.tsx`

## Phase 3: Student Experience

### Student Name Input
After selecting "Student" role, users will see a simple form asking for their name before proceeding to the main application. This name will be associated with their session and visible to professors in the dashboard.

**Implementation Steps:**
• Create `frontend/src/components/StudentNameInput.tsx` with controlled input form
• Add validation using useState to ensure name is provided (minimum 2 characters)
• On submit, call backend POST `/api/session/create` with student name
• Store session ID in React Context (`frontend/src/contexts/SessionContext.tsx`)
• Navigate to main application at `/student/slides` after successful submission
• Pass session ID to all subsequent API calls in headers

**Code Locations:**
- New file: `frontend/src/components/StudentNameInput.tsx`
- New file: `frontend/src/contexts/SessionContext.tsx`
- Modify: `frontend/src/components/StudentFlow.tsx` (to check for session)
- Modify: All API calls in `frontend/src/services/api.ts` (include session ID)

### Instructions Modal
Build an overlay component that appears immediately after name input, explaining how to use the application. The modal will have a semi-transparent backdrop that grays out the main content and can be dismissed with an X button or clicking outside.

**Implementation Steps:**
• Create `frontend/src/components/InstructionsModal.tsx` using React Portal (ReactDOM.createPortal)
• Implement backdrop with onClick handler to close modal (stopPropagation on modal content)
• Add step-by-step instructions for using the slide upload and audio features
• Style with fixed positioning, z-index: 50, backdrop blur, and smooth transitions (transition-opacity)
• Store "hasSeenInstructions" in sessionStorage to prevent re-showing on refresh
• Add to `frontend/src/components/StudentFlow.tsx` with useEffect to show on mount

**Code Locations:**
- New file: `frontend/src/components/InstructionsModal.tsx`
- Modify: `frontend/src/components/StudentFlow.tsx` (add modal logic)
- Add to: `frontend/public/index.html` (add div with id="modal-root")

### Feedback Auto-Save
When a student clicks "Generate Feedback", the system immediately persists the feedback to the database before displaying it to the student. This ensures professors always have access to submitted work even if students close their browser.

**Implementation Steps:**
• Modify `frontend/src/components/FeedbackDisplay.tsx` generateFeedback function to include session ID
• Update backend `/api/generate-feedback` in `backend/src/index.ts` to save before returning response
• Include student name, session ID, timestamp in the saved record using Prisma
• Add loading states in frontend: "Generating feedback..." → "Saving feedback..." → Display
• Implement try-catch in `backend/src/services/feedbackGenerator.ts` to ensure feedback is saved even if response fails
• Add database transaction to ensure atomicity of feedback save operation

**Code Locations:**
- Modify: `frontend/src/components/FeedbackDisplay.tsx` (add save indication)
- Modify: `backend/src/index.ts` (update /api/generate-feedback endpoint)
- Modify: `backend/src/services/feedbackGenerator.ts` (add database save)
- Modify: `backend/src/services/database.service.ts` (add saveFeedback method)

## Phase 4: Professor Features

### Professor Dashboard
Create a comprehensive dashboard showing all student submissions in a list format. Each row will display student name, submission timestamp, and an expand/collapse indicator. The dashboard will auto-refresh or use polling to show new submissions.

**Implementation Steps:**
• Create `frontend/src/components/ProfessorDashboard.tsx` with data fetching logic
• Implement useEffect hook with setInterval for polling `/api/professor/sessions` every 30 seconds
• Build table UI using `frontend/src/components/SessionTable.tsx` with student name, timestamp, status columns
• Add sorting functionality using useState for sort field and direction
• Implement pagination using react-paginate or custom pagination (20 items per page)
• Add search/filter functionality by student name using controlled input
• Include refresh button for manual data refresh

**Code Locations:**
- New file: `frontend/src/components/ProfessorDashboard.tsx`
- New file: `frontend/src/components/SessionTable.tsx`
- New file: `frontend/src/components/SessionTableRow.tsx`
- New file: `frontend/src/hooks/usePolling.ts` (custom hook for auto-refresh)

### Feedback Display
Implement expandable rows that show the full feedback details when clicked. Each expanded view will show the complete feedback that was generated for that student, maintaining the same formatting as shown to students.

**Implementation Steps:**
• Create `frontend/src/components/FeedbackRow.tsx` with collapsible state management (useState for isExpanded)
• Add smooth expand/collapse animations using CSS transitions (max-height transition)
• Display full feedback content using the existing `FeedbackDisplay` component in read-only mode
• Include metadata like submission time, number of slides analyzed, audio duration
• Add print functionality using window.print() with print-specific CSS
• Implement export to PDF using jsPDF library for individual feedback entries
• Add "Mark as Reviewed" functionality with database flag

**Code Locations:**
- New file: `frontend/src/components/FeedbackRow.tsx`
- Modify: `frontend/src/components/FeedbackDisplay.tsx` (add read-only prop)
- Add: `frontend/src/styles/print.css` (print-specific styles)
- Modify: `backend/src/index.ts` (add PUT /api/session/:id/reviewed endpoint)

## Phase 5: Deployment

### Environment Setup
Configure production environment with proper database hosting, environment variables, and security settings. This includes setting up a managed PostgreSQL instance and configuring all necessary connection strings and secrets.

**Implementation Steps:**
• Set up PostgreSQL on Railway, Supabase, or Neon (recommend Supabase for free tier)
• Configure production environment variables in hosting platform dashboard
• Set up proper CORS policies in `backend/src/index.ts` with specific origin allowlist
• Configure rate limiting using express-rate-limit in `backend/src/middleware/rateLimiter.ts`
• Add helmet.js for security headers in `backend/src/index.ts`
• Create `.env.production` and `.env.development` files for environment-specific configs
• Set up Prisma connection pooling for production database

**Code Locations:**
- New file: `backend/src/middleware/rateLimiter.ts`
- Modify: `backend/src/index.ts` (add helmet, CORS config)
- New file: `backend/.env.production`
- New file: `frontend/.env.production`

### Deploy
Deploy the full-stack application with the frontend on Vercel and backend on Railway or similar platform. Ensure proper connection between services and test all features in production environment.

**Implementation Steps:**
• Deploy frontend to Vercel with proper build configuration (npm run build)
• Set environment variable VITE_API_URL in Vercel dashboard pointing to backend URL
• Deploy backend to Railway/Render with Node.js buildpack
• Run Prisma migrations on production database using `npx prisma migrate deploy`
• Configure custom domain and SSL certificates (automatic on Vercel/Railway)
• Set up monitoring with Sentry or LogRocket (add to both frontend and backend)
• Implement health check endpoint `/api/health` in backend
• Test full user flow in production: student submission → professor view
• Set up backup strategy for PostgreSQL database

**Code Locations:**
- New file: `vercel.json` (frontend deployment config)
- New file: `railway.json` or `render.yaml` (backend deployment config)
- New file: `backend/src/monitoring/sentry.ts`
- Modify: `backend/src/index.ts` (add /api/health endpoint)

## Risk Mitigation & Considerations

### Security Risks
• **Password Storage**: Never store the professor password in plain text. Always use bcrypt with salt rounds >= 10. Consider implementing rate limiting on login attempts to prevent brute force attacks.
• **SQL Injection**: Use Prisma's parameterized queries exclusively. Never concatenate user input into SQL strings.
• **XSS Attacks**: Sanitize all user inputs, especially student names. React escapes by default, but be careful with dangerouslySetInnerHTML if used.
• **Session Management**: Implement proper session expiration (e.g., 24 hours) for professor logins. Use secure, httpOnly cookies.

### Technical Risks
• **Database Connection Issues**: Implement connection pooling and retry logic. Set up proper timeout handling for database queries (30 second timeout).
• **Large File Uploads**: Current implementation may struggle with large PDF files. Consider implementing file size limits (e.g., 10MB) and chunked upload for larger files.
• **Concurrent Users**: The audio recording and processing may bottleneck with multiple simultaneous users. Consider implementing a queue system (Bull/Redis) for heavy processing.
• **State Management**: As the app grows, consider migrating from Context API to Redux or Zustand for more complex state management needs.

### Performance Risks
• **Dashboard Loading**: With many student submissions, the professor dashboard could become slow. Implement pagination on the backend, not just frontend. Consider virtual scrolling for very large lists.
• **Memory Leaks**: Be careful with event listeners and intervals in React components. Always clean up in useEffect return functions.
• **API Response Times**: The AI feedback generation can take 30+ seconds. Implement proper timeout handling and consider websockets for real-time updates.

### Data Integrity Risks
• **Lost Feedback**: If the database save fails after AI generation, expensive feedback could be lost. Implement a retry mechanism and temporary local storage as backup.
• **Session Tracking**: Without proper authentication, sessions could be hijacked. Consider implementing session tokens with expiration.
• **Data Persistence**: Ensure database backups are configured from day one. Test restore procedures before going to production.

### User Experience Risks
• **Browser Compatibility**: Audio recording APIs may not work in all browsers. Test thoroughly in Chrome, Firefox, Safari, and Edge. Provide fallback options.
• **Mobile Experience**: Current design may not be mobile-optimized. Students might try to use phones - consider responsive design or explicitly state desktop-only.
• **Network Interruptions**: Implement proper error handling for network failures. Consider implementing offline mode with service workers for critical features.

### Deployment Risks
• **Environment Variable Mismatch**: Document all required environment variables. Use a .env.example file. Implement startup checks that verify all required variables are present.
• **Database Migration Failures**: Always test migrations on a staging database first. Keep rollback scripts ready. Use Prisma's migration lock to prevent concurrent migrations.
• **CORS Issues**: Test CORS configuration thoroughly. Localhost works differently than production domains. Have proper error messages for CORS failures.
• **Scaling Issues**: The free tiers of hosting services have limits. Monitor usage and have a plan to upgrade if traffic increases. Consider implementing caching (Redis) early.

### Maintenance Risks
• **Dependency Updates**: Pin your dependency versions in package.json. Test thoroughly when updating, especially major versions.
• **Technical Debt**: The "simple" password auth will need replacement eventually. Document this as technical debt and plan for proper auth implementation.
• **Code Organization**: As features are added quickly, code organization may suffer. Establish clear folder structures and naming conventions early.