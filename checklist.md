# QuickDesk Project Checklist

This checklist tracks the requirements from the QuickDesk coding assessment to help us identify exactly what is finished and what still needs to be built.

## Core Scope (Must Build)

### Auth & Roles
- [x] **JWT-based Authentication**: Secure HTTP-only cookies and in-memory client state.
- [x] **Roles**: Employee, Agent (and Admin) roles structured and seeded.
- [x] **Backend Role Enforcement**: Guards and decorators implemented (`@Roles()`, `RolesGuard`).
- [x] **Password Security**: Passwords hashed securely using `bcrypt`.

### Ticket Submission (Employee Side)
- [ ] **Submission Form**: Simple UI with title, description, and optional attachment (filename).
- [ ] **AI Triaging**: On submission, LLM suggests category (IT, HR, Finance, Admin, Other) and priority (Low, Medium, High).
- [ ] **AI Flagging**: Store and display suggestions clearly as "AI-suggested" so agents know.
- [ ] **"My Tickets" View**: Employee dashboard showing their own tickets and current statuses.

### Agent Dashboard
- [ ] **Ticket List View**: Show all tickets with filters (status, category, priority) and a search box for titles.
- [ ] **Ticket Detail View**: Show original ticket, the employee, and AI suggestions.
- [ ] **AI-Drafted Reply (RAG)**: Display a pre-drafted reply generated using the LLM and the knowledge base.
- [ ] **Citations**: Clearly show which knowledge base articles the AI pulled from.
- [ ] **Reply Editor**: Allow the agent to edit the AI draft and click "Send Reply".
- [ ] **Resolution Flow**: Clicking "Send Reply" moves the ticket to "Resolved" and stores the final reply alongside the AI draft.
- [ ] **Override Audit Log**: Log whenever an agent overrides the AI-suggested category or priority (who, when, from, to) and display it on the ticket.

### Real-Time Updates
- [ ] **WebSocket / SSE setup**: Choose and document the real-time tech (Socket.io or SSE).
- [ ] **Agent Notifications**: Agents see new tickets appear on the dashboard without refreshing.
- [ ] **Employee Notifications**: Employees see ticket status flip to "Resolved" without refreshing.

### Knowledge Base & RAG Pipeline
- [ ] **Seed Data**: Create 5-10 short markdown articles (100-300 words each) covering basic IT/HR policies.
- [ ] **Vector Store / Retrieval**: Setup simple in-memory vector store using LangChain.
- [ ] **Grounded Generation**: AI replies must be grounded purely in the articles; no hallucinations.

### Basic Metrics Dashboard (Agent-Only)
- [ ] **Ticket Counts**: Total tickets by status (Open / Resolved).
- [ ] **Category Counts**: Tickets broken down by category.
- [ ] **Median Resolution Time**: Calculate and display median time to resolve.
- [ ] **AI Override %**: How often agents overrode the AI's suggested category.

---

## Deliverables

### Codebase & Setup
- [x] **Tech Stack Setup**: React (Vite), NestJS, Prisma, PostgreSQL.
- [x] **Seed Script**: Currently creates users. Needs updating to load KB articles.
- [x] **Environment Variables**: `.env.example` ready.

### Documentation (README.md)
- [ ] **Project Overview**: What this is.
- [ ] **Run Instructions**: Step-by-step local setup.
- [ ] **Architecture Diagram**: Text or image.
- [ ] **API Endpoints Table**: Method, path, purpose, auth.
- [ ] **Decisions and Tradeoffs**: Detailed answers to the prompt's specific questions (React vs Next, RAG structure, JWT storage, Real-time choice, etc.).
- [ ] **Future Improvements**: What to do with more time / limitations.

### Presentation
- [ ] **Demo Video**: 3-5 minute Loom walking through submission, RAG reply, and architecture.

---

## Stretch Goals (Optional - Pick 1 or 2)
- [ ] Dockerize (`docker-compose.yml`)
- [ ] Mock Email Notifications
- [ ] AI Confidence Score
- [ ] Rate Limiting
- [ ] Automated Tests
