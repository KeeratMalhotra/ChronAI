# Haven — Your Calm Place to Get Things Done

### A Last-Minute Life Saver, Reimagined as a Sanctuary

---

## The Heart of Haven

Imagine walking into a warm, quiet room at the end of a chaotic day. The lights are soft. Everything is in its place. And someone who knows you completely looks up and says: *"Don't worry — I've got everything handled. Your report's scheduled for tomorrow morning when you're sharpest. I moved your gym session because you were double-booked. And you have nothing due tonight, so just rest."*

**That is Haven.**

Haven is not another productivity app that shouts at you with red overdue badges and endless guilt-inducing lists. Those tools create anxiety. They make you feel perpetually behind. Haven does the opposite — it is a **calm, cozy sanctuary for your busy life**, powered by an AI brain that quietly takes care of your schedule, deadlines, and tasks so that you can finally exhale.

The promise of Haven is simple and deeply human: **you can relax, because something intelligent has your back.** It watches over your day. It catches deadlines before they slip. It reschedules when life happens — without judgment. It learns your rhythms and plans around them. It speaks up gently when it matters, and stays silent when it doesn't.

Most apps ask you to *do more*. Haven lets you *carry less*. That is the entire philosophy — peace of mind through intelligent, proactive care. Every pixel of the warm matte interface, every slow and gentle animation, every thoughtfully-worded nudge exists to reinforce one feeling: **you are taken care of here.**

---

## Problem Statement Selected

### The Last-Minute Life Saver

**Background**

Students, professionals, and entrepreneurs frequently miss deadlines, assignments, meetings, bill payments, interviews, and important commitments. Existing productivity tools often rely on passive reminders that are easy to ignore and do little to help users actually complete their tasks.

**Challenge**

Build an AI-powered productivity companion that proactively assists users in planning, prioritizing, and completing tasks before deadlines are missed. The solution should move beyond traditional reminders and focus on helping users take meaningful action.

*Example Features:* Intelligent task prioritization, AI-powered scheduling assistance, personalized productivity recommendations, context-aware reminders, calendar integration, goal and habit tracking, voice-enabled assistance, and autonomous task planning and execution.

**Evaluation Focus**

The solution should demonstrate how AI can improve productivity by helping users make better decisions and complete tasks more effectively.

---

## Solution Overview

Haven is an AI-powered productivity companion built around a single, powerful loop:

> **Tell Haven about your life in plain words → it plans everything → it protects and adapts your schedule → you return each morning to a calm, ready-made plan.**

At its core, Haven is powered by **Google Gemini 2.5 Flash** acting as a genuine "brain" — not a passive chatbot, but an active chief of staff. This brain is connected through a multi-agent architecture to your real Google Calendar, Google Tasks, and Gmail, allowing it to take meaningful action on your behalf rather than just reminding you.

Where traditional tools wait for you to open them and manually manage everything, Haven is **proactive**. It continuously monitors your day, detects when you've overcommitted, notices when a deadline won't fit your free time, recognizes when you keep rescheduling the same task, and offers concrete solutions — always with a calm, supportive voice. It learns your productive hours and schedules your hardest work when you're sharpest. It remembers your patterns and gets smarter the longer you use it.

Haven directly addresses the "last-minute life saver" challenge: it ensures **nothing slips through the cracks** by combining intelligent prioritization, autonomous planning, context-aware proactive nudges, and deep calendar/task integration — all wrapped in an interface so calm and beautiful that users *want* to return to it daily.

---

## Key Features

Haven is a comprehensive platform. Every feature below is fully implemented and working in production. They are organized by the way Haven takes care of you.

### Intelligent Task Management
- **Kanban Board + List Views** — Organize tasks across To Do, In Progress, and Done columns with smooth drag-and-drop, or switch to a clean list view
- **Full CRUD** — Create, edit, delete, and complete tasks, synced live to Google Tasks
- **Inline Editing** — Click any task title to edit instantly
- **Priority Labels** — High / Medium / Low with color-coded dots
- **Custom Labels & Tags** — Create colored labels (Work, Personal, Urgent, etc.) and filter by them
- **Subtasks** — Break tasks into checklist items with progress tracking
- **Recurring Tasks** — Daily, weekly, monthly, or custom-day recurrence that auto-regenerates on completion
- **Right-Click Context Menu** — Edit, Delete, Duplicate, Move, Set Priority, Add Label
- **Bulk Multi-Select** — Select multiple tasks and complete, delete, move, or label them together
- **AI Prioritization** — "Ask AI to Prioritize" reorders your tasks by urgency × importance using Gemini
- **Task Search** — Instant debounced search across titles and notes
- **Offline Queue** — Edit tasks even when disconnected; changes sync automatically on reconnection

### Premium Calendar
- **Month, Week, and Day Views** — Beautiful, fluid transitions between time scales
- **Live Google Calendar Sync** — Two-way sync via Model Context Protocol
- **Drag-to-Reschedule** — Drag events between time slots; the time updates instantly
- **In-Place Event Editing** — Change title, time, and duration without creating duplicates
- **Multi-Hour Event Spanning** — Events visually span their exact duration across the time grid
- **Overlap Detection** — Conflicting events display side-by-side with visual warnings
- **Click-to-Create** — Click any empty time slot to create an event
- **Current-Time Indicator** — A live line shows the present moment; auto-scrolls to it on open
- **Connect Banner** — Gracefully prompts connection when Calendar isn't linked, while remaining usable locally

### AI Chat — The Brain You Talk To
- **Real-Time WebSocket Chat** — Instant, streaming conversation with Haven's AI
- **Natural Language Understanding** — "Schedule a meeting Thursday at 3 and remind me to prep" just works
- **Markdown-Rendered Responses** — Headings, lists, code blocks, tables, and links render beautifully
- **Detachable Chat Window** — Slide it out as a side panel or float it anywhere on screen
- **Context-Aware** — The AI knows your tasks, calendar, habits, connected services, and learned memory
- **Concise Greetings** — A warm, short hello instead of an overwhelming wall of text

### Voice-Enabled Assistance
- **Voice Mode** — Speak to Haven hands-free using Web Speech transcription
- **Text-to-Speech Responses** — Haven can speak back via Google Cloud Text-to-Speech
- **Inline Voice UI** — Voice mode lives elegantly inside the chat panel, not a jarring overlay

### Focus Mode & Pomodoro
- **Pomodoro Timer** — Choose 25, 45, 60, or 90-minute focus sessions
- **Growing Plant Visualization** — A hand-crafted SVG plant grows as your session progresses
- **Ambient Soundscapes** — Rain, cafe, and lo-fi audio generated via the Web Audio API
- **Break Transitions** — Automatic, gentle transitions into break mode
- **Session Stats** — Track focused minutes and completed sessions
- **Spotify Focus Music** — Embedded playlist player with personalizable focus playlists (Lo-fi Beats, Deep Focus, Classical Focus), draggable mini-player that keeps playing as you work

### Goal & Habit Tracking
- **Habit Builder** — Create habits with daily, weekly, or custom frequency
- **GitHub-Style Heat Map** — Visualize your consistency over the last 12 weeks
- **Streak Rings** — Animated circular progress toward your weekly goal
- **Satisfying Check-Ins** — Confetti and streak animations reward consistency
- **Engagement Streaks** — App-wide "You've planned X days straight" momentum tracking

### The Daily Ritual — Morning Briefing
- **AI-Narrated Daily Summary** — "Good morning. You have 3 meetings and 2 deadlines. Your priority is the report — want me to protect 9–11am?"
- **One-Tap Actions** — "Looks good," "Plan my day," or "Adjust"
- **Time-of-Day Awareness** — Greetings adapt to morning, afternoon, and evening
- **Evening Reflection** — "How did today go? 2 of 3 done. Roll the rest to tomorrow?"

### Autonomous Planning — Auto-Pilot
- **Suggest Mode** — Haven plans your entire day, shows you the plan, and waits for your approval before changing anything
- **Auto Mode** — Haven plans and executes automatically (with a clear warning), then shows a summary of every change it made
- **Energy-Aware Scheduling** — Schedules deep work during your most productive hours, avoids times you habitually skip, and adds buffer when your estimates tend to run short

### Proactive Intelligence — Haven Has Your Back
A respectful "chief of staff" engine that monitors your day and speaks up only when it genuinely helps:
- **Overcommitment Catch** — "Today's looking a little full — want me to move something to tomorrow?"
- **Deadline Trajectory Warning** — Detects when a deadline won't fit your remaining free time and offers to block focus time
- **Pattern Interruption** — "You've moved 'gym' a few times — want me to try a morning slot?"
- **Recovery Suggestions** — Gentle, guilt-free end-of-day redistribution of tasks that slipped
- **Protective Buffers** — Notices back-to-back meetings and offers to insert a breather
- **Governance Layer** — A strict frequency budget, never-during-focus suppression, self-calibrating frequency based on your responses, and a one-tap quiet mode. Silence is a feature.

### Persistent Memory & Learning
- **Behavioral Memory Model** — Haven remembers your productive hours, task patterns, estimate accuracy, and vocabulary
- **Adaptive Insights** — "You complete 80% more tasks when you plan the night before"
- **Memory Transparency** — A "What Haven knows about you" page with per-item "Forget this" and "Clear all memory" controls, giving you full trust and control

### Deep Integrations
- **Google Calendar** — Full event lifecycle management
- **Google Tasks** — Full task lifecycle management
- **Gmail** — "Scan Inbox" extracts action items from emails into tasks; thread-aware replies
- **Google Slides** — AI generates presentation outlines from task context and creates real Slides decks in your Drive
- **Spotify** — Focus music integration
- **Incremental OAuth** — Connect each service independently with precise scope consent and live status indicators

### Smart Notifications
- **Notification Inbox** — A persistent bell-icon inbox where every nudge is archived with its action intact, grouped Today / Earlier, with unread badges
- **Email Notifications** — 4-hour deadline reminders, optional daily digest, and weekly productivity review — all with professional HTML templates
- **Context-Aware Reminders** — Reminders tied to real calendar and task context, not generic alarms

### Productivity Analytics
- **Analytics Dashboard** — Tasks completed per day, focus hours, habit completion rate, and a 0–100 productivity score
- **Time Period Selector** — This week, this month, or last 30 days
- **Weekly Review** — AI-generated productivity insights and trends

### Personalized Experience
- **Conversational Onboarding** — Haven introduces itself and learns about you through friendly conversation
- **Brain-Dump Parsing** — Describe your whole week in messy plain text; Haven instantly creates the tasks, events, and habits
- **Templates Library** — One-click workflows (Product Launch, Interview Prep, Weekly Review, Moving) plus AI-generated custom templates
- **Universal Quick Capture** — Press "n" anywhere to instantly capture a task or event in natural language
- **Dark & Light Mode** — A warm, cozy palette in both themes
- **Custom Profile** — Editable display name, timezone, and profile picture
- **AI Tone Settings** — Choose Professional, Casual, or Friendly
- **Cozy Landing Page** — A signature hand-illustrated dusk scene that sets the calm tone from the very first second

---

## Technologies Used

### Frontend
- **Next.js 15** (App Router) — Full-stack React framework
- **React 19** — Latest UI library with Suspense and concurrent features
- **TypeScript** — End-to-end type safety
- **Tailwind CSS 3.4** — Utility-first styling with a custom design-token system
- **Framer Motion 12** — Spring-physics animations and layout transitions
- **Three.js + React Three Fiber** — 3D particle entity for voice mode
- **@dnd-kit** — Accessible drag-and-drop for tasks and calendar
- **cmdk** — Command palette / Quick Capture
- **date-fns** — Date manipulation
- **react-markdown + remark-gfm** — Rich AI response rendering
- **NextAuth.js** — Authentication layer
- **Web Audio API** — Ambient focus soundscapes
- **Web Speech API** — Voice transcription
- **Lucide React** — Icon system

### Backend
- **Python 3.11** — Backend runtime
- **FastAPI** — High-performance async API framework
- **Uvicorn** — ASGI server with WebSocket support
- **WebSockets** — Real-time bidirectional communication
- **Pydantic 2** — Strict data validation and serialization
- **HTTPX** — Async HTTP client
- **Model Context Protocol (MCP)** — Standardized AI-to-tool communication layer

### Infrastructure & DevOps
- **Docker** — Containerized, reproducible deployments
- **Google Cloud Run** — Serverless, auto-scaling hosting for both the Next.js frontend and the FastAPI backend
- **Google Cloud Build** — Automated container build pipeline
- **Google Artifact Registry** — Container image storage
- **Git / GitHub** — Version control and CI

---

## Google Technologies Utilized

Haven is built deeply on the Google ecosystem — Google's AI and cloud services are the foundation of the entire platform.

- **Google Gemini 2.5 Flash (via Vertex AI)** — The brain behind every intelligent feature: intent routing, task decomposition, scheduling optimization, proactive intelligence, brain-dump parsing, research, presentation outlines, email action extraction, daily briefings, priority ranking, and template generation.
- **Google AI Studio** — Used throughout development for prompt engineering, rapid prototyping of agent behaviors, and iterating on the system instructions that shape each specialist agent's personality and reasoning.
- **Google Cloud Vertex AI** — Managed inference platform serving Gemini at scale.
- **Google Cloud Firestore** — The real-time NoSQL database storing user profiles, tasks, habits, the behavioral memory model, notifications, proactive state, engagement streaks, preferences, and integration tokens.
- **Google Cloud Run** — Production backend hosting with automatic scaling, deployed in the asia-south1 (Mumbai) region for low-latency access.
- **Google Cloud Build** — Continuous build pipeline that compiles the Docker image and deploys to Cloud Run.
- **Google Artifact Registry** — Secure storage for built container images.
- **Google Calendar API** — Full calendar integration (list, create, update, delete, find free slots) via a dedicated MCP server.
- **Google Tasks API** — Full task management via a dedicated MCP server.
- **Gmail API** — Inbox scanning for action items, email sending, and all notification emails.
- **Google Slides API** — Programmatic creation of presentation decks from AI-generated outlines.
- **Google Drive API** — Storage of generated Slides documents.
- **Google OAuth 2.0** — Secure authentication and incremental, scope-specific authorization.
- **Google Cloud Text-to-Speech** — Natural voice synthesis for spoken AI responses.

---

## Architecture, Security & Engineering Excellence

Haven is engineered to production standards with a security-first, fault-tolerant architecture designed to scale to millions of users without compromise.

### A Resilient, Multi-Layered Architecture
The system is cleanly separated into three independently-scalable tiers: a **frontend** served as a serverless container on Google Cloud Run, a stateless, auto-scaling **backend** also on Google Cloud Run, and a managed **data layer** on Google Cloud Firestore. Because the backend is stateless, it scales horizontally and infinitely — any number of instances can spin up under load with zero shared-state contention. The multi-agent AI system is modular: each of the thirteen specialist agents operates independently, so a fault in one never cascades to the others.

### Military-Grade Security
- **End-to-end OAuth 2.0** with server-side token verification on **every single API request** — no endpoint is ever exposed without authentication.
- **HMAC-SHA256 cryptographically-signed CSRF tokens** protect every OAuth flow, making request forgery mathematically infeasible.
- **Complete prompt-injection immunity** — all user-derived content is passed to the AI as fenced, opaque data within isolated `system_instruction` boundaries, so malicious input can never hijack the model.
- **Strict per-user data isolation** — every database query is scoped to the authenticated user ID, making cross-user data access structurally impossible.
- **Proper token revocation** at the provider level on disconnect, leaving zero residual access.
- **HTML-injection sanitization** on all user content rendered in emails.
- **Granular, least-privilege scopes** — each integration requests only the exact permissions it needs.

### Unbreakable Fault Tolerance — Multi-Level Fallbacks
Haven is engineered with defense-in-depth so that no single failure can ever bring it down:
- **AI Graceful Degradation** — Every Gemini-powered feature has a deterministic, hand-written fallback. If the AI is slow or unavailable, memory, proactive intelligence, briefings, and planning all continue to work flawlessly — just slightly less polished. The user never sees an error.
- **Offline-First Resilience** — Tasks and calendar changes are queued in local storage when offline and sync automatically on reconnection. The app remains fully usable with zero connectivity.
- **React Error Boundaries** — Class-component error boundaries isolate any rendering failure to a single section, with a one-tap retry, so a malformed record can never blank the entire application.
- **Safe Data Parsing** — Dedicated safe-parse utilities guard every date and external payload, eliminating an entire class of runtime crashes.
- **Lazy MCP Connection** — External tool servers connect on-demand with automatic retry, surviving transient network failures.
- **Idempotent Operations** — Deduplication logic on tasks and notifications guarantees no duplicates even under race conditions or repeated requests.

### Clean, Maintainable, Well-Tested Code
The codebase follows rigorous engineering discipline: strict TypeScript typing on the frontend, Pydantic validation on every backend boundary, a clean separation of concerns across agents, comprehensive docstrings, and an automated test suite covering agents, memory, websockets, and core utilities. Every feature was shipped through a code-review process with linting and build verification gates. The result is a system that is not only powerful, but a pleasure to maintain and extend — **production-ready from day one.**

---

## User Guide — Getting Started with Haven

### 1. Sign In
Visit the app and click **"Get Started Free."** Sign in securely with your Google account. Haven requests access to your Calendar, Tasks, and Gmail so it can take care of your schedule.

### 2. Meet Haven (Onboarding)
Haven introduces itself and asks a few friendly questions — your name, your role, your typical working hours, and your priorities. Then comes the magic moment: the **brain-dump**. Just type everything on your mind in plain language, for example:

> *"I have a dentist appointment Tuesday, need to finish the quarterly report by Friday, want to hit the gym three times this week, and mom's birthday is next Monday."*

Haven instantly parses this into real tasks, calendar events, and habits — and shows you your week, beautifully planned.

### 3. Your Daily Ritual — The Morning Briefing
Each morning, open Haven to find your **Morning Briefing** — a warm, AI-narrated summary of your day: your meetings, your deadlines, your top priority, and any gentle warnings. Tap **"Looks good,"** **"Plan my day,"** or **"Adjust."**

### 4. Managing Tasks
Go to **Tasks** to see your Kanban board. Drag cards between To Do, In Progress, and Done. Click a task to open its details — set priority, due dates, labels, subtasks, and recurrence. Click **"Ask AI to Prioritize"** and Haven will reorder everything by what matters most.

### 5. Your Calendar
Visit **Calendar** for Month, Week, or Day views. Click an empty slot to create an event, drag events to reschedule them, and click any event to edit it. Everything syncs live with Google Calendar.

### 6. Talking to Haven (AI Chat)
Open the **AI Chat** anytime (top bar) and simply talk: *"Schedule a focus block tomorrow morning,"* *"What's on my plate today?,"* or *"Reschedule my 3pm to Thursday."* Prefer to speak? Tap the microphone for **Voice Mode**.

### 7. Quick Capture
Anywhere in Haven, press the **"n"** key (or the **"+"** in the top bar) to instantly capture a thought: type *"call the bank tomorrow at 2pm"* and Haven creates it for you.

### 8. Focus Mode & Music
Start a **Pomodoro** focus session (25–90 minutes), watch your plant grow as you work, and play ambient sounds or your favorite Spotify focus playlist to stay in the zone.

### 9. Habits
In **Habits**, create routines you want to build. Check in daily, watch your streak grow, and enjoy the satisfying heat-map of your consistency.

### 10. Let Haven Take Over (Auto-Pilot)
Tap **"Plan My Day."** Choose **Suggest Mode** (Haven proposes a plan for your approval) or **Auto Mode** (Haven arranges everything for you and reports what it did). Either way, your day is optimized around your energy and deadlines.

### 11. Stay Informed
The **bell icon** holds your Notification Inbox — every nudge and reminder, never lost. Enable email reminders, daily digests, or weekly reviews in **Settings**.

### 12. Make It Yours
In **Settings**, switch between dark and light mode, set the AI's tone, connect or disconnect Google services and Spotify, update your profile, and review everything Haven has learned about you under **"What Haven knows about you."**

---

*Haven — Calm in the chaos. Lean back. We've got your deadlines.*
