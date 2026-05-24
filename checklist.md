# QuickDesk Project Checklist

This checklist tracks the requirements from the QuickDesk coding assessment. All core requirements and deliverables are fully implemented, verified, and complete.

## Core Scope (Must Build)

### Auth & Roles
- [x] **JWT-based Authentication**: Secure HTTP-only cookies and in-memory client state.
- [x] **Roles**: Employee, Agent (and Admin) roles structured and seeded.
- [x] **Backend Role Enforcement**: Guards and decorators implemented (`@Roles()`, `RolesGuard`).
- [x] **Password Security**: Passwords hashed securely using `bcrypt`.

### Ticket Submission (Employee Side)
- [x] **Submission Form**: Simple UI with title, description, and optional attachment (filename).
- [x] **AI Triaging**: On submission, LLM suggests category (IT, HR, Finance, Admin, Other) and priority (Low, Medium, High).
- [x] **AI Flagging**: Store and display suggestions clearly as "AI-suggested" so agents know.
- [x] **"My Tickets" View**: Employee dashboard showing their own tickets and current statuses.

### Agent Dashboard
- [x] **Ticket List View**: Show all tickets with filters (status, category, priority) and a search box for titles.
- [x] **Ticket Detail View**: Show original ticket, the employee, and AI suggestions.
- [x] **AI-Drafted Reply (RAG)**: Display a pre-drafted reply generated using the LLM and the knowledge base.
- [x] **Citations**: Clearly show which knowledge base articles the AI pulled from next to the AI suggest card.
- [x] **Reply Editor**: Allow the agent to edit the AI draft and click "Send Reply" in a premium rich text canvas.
- [x] **Resolution Flow**: Clicking "Send Reply" moves the ticket to "Resolved" and stores the final reply alongside the AI draft.
- [x] **Override Audit Log**: Log whenever an agent overrides the AI-suggested category or priority (who, when, from, to) and display it on the ticket.

### Real-Time Updates
- [x] **WebSocket setup**: Real-time communication using Socket.io (documented in README).
- [x] **Agent Notifications**: Agents see new tickets appear on the dashboard without refreshing (via query client invalidation).
- [x] **Employee Notifications**: Employees see ticket status flip to "Resolved" without refreshing (via query client invalidation).

### Knowledge Base & RAG Pipeline
- [x] **Seed Data**: seeded with 10 detailed markdown articles covering VPN, password, HR policies, laptop guidelines, etc.
- [x] **Vector Store / Retrieval**: Similarity search using `pgvector` and `Xenova/all-MiniLM-L6-v2` offline embedding pipeline.
- [x] **Grounded Generation**: AI replies are strictly grounded; returns fallback message rather than hallucinations.

### Basic Metrics Dashboard (Agent-Only)
- [x] **Ticket Counts**: Total tickets by status (Open / Resolved).
- [x] **Category Counts**: Tickets broken down by category.
- [x] **Median Resolution Time**: Calculate and display median time to resolve in minutes.
- [x] **AI Override %**: How often agents overrode the AI's suggested category.

---

## Deliverables

### Codebase & Setup
- [x] **Tech Stack Setup**: React (Vite), NestJS, Prisma, PostgreSQL.
- [x] **Seed Script**: Seeder loads mock data, hashes passwords, downloads the transformer model, and embeds KB articles.
- [x] **Environment Variables**: `.env.example` prepared in both modules.

### Documentation (README.md)
- [x] **Project Overview**: Completed.
- [x] **Run Instructions**: Step-by-step local setup.
- [x] **Architecture Diagram**: Mermaid diagram showing RAG, DB, and Websocket layout.
- [x] **API Endpoints Table**: Detailed endpoints table.
- [x] **Decisions and Tradeoffs**: In-depth answers answering questions a through h.
- [x] **Future Improvements**: Documented.

---

## Stretch Goals (Implemented)
- [x] **Dockerize (`docker-compose.yml`)**: Multi-container setup included for postgres, backend, and frontend.




















<!-- 

# QuickDesk Project Checklist

This checklist tracks the requirements from the QuickDesk coding assessment. All core requirements and deliverables are fully implemented, verified, and complete.

## Core Scope (Must Build)

### Auth & Roles
- [x] **JWT-based Authentication**: Secure HTTP-only cookies and in-memory client state.
- [x] **Roles**: Employee, Agent (and Admin) roles structured and seeded.
- [x] **Backend Role Enforcement**: Guards and decorators implemented (`@Roles()`, `RolesGuard`).
- [x] **Password Security**: Passwords hashed securely using `bcrypt`.

### Ticket Submission (Employee Side)
- [x] **Submission Form**: Simple UI with title, description, and optional attachment (filename).
- [x] **AI Triaging**: On submission, LLM suggests category (IT, HR, Finance, Admin, Other) and priority (Low, Medium, High).
- [x] **AI Flagging**: Store and display suggestions clearly as "AI-suggested" so agents know.
- [x] **"My Tickets" View**: Employee dashboard showing their own tickets and current statuses.

### Agent Dashboard
- [x] **Ticket List View**: Show all tickets with filters (status, category, priority) and a search box for titles.
- [x] **Ticket Detail View**: Show original ticket, the employee, and AI suggestions.
- [x] **AI-Drafted Reply (RAG)**: Display a pre-drafted reply generated using the LLM and the knowledge base.
- [x] **Citations**: Clearly show which knowledge base articles the AI pulled from next to the AI suggest card.
- [x] **Reply Editor**: Allow the agent to edit the AI draft and click "Send Reply" in a premium rich text canvas.
- [x] **Resolution Flow**: Clicking "Send Reply" moves the ticket to "Resolved" and stores the final reply alongside the AI draft.
- [x] **Override Audit Log**: Log whenever an agent overrides the AI-suggested category or priority (who, when, from, to) and display it on the ticket.

### Real-Time Updates
- [x] **WebSocket setup**: Real-time communication using Socket.io (documented in README).
- [x] **Agent Notifications**: Agents see new tickets appear on the dashboard without refreshing (via query client invalidation).
- [x] **Employee Notifications**: Employees see ticket status flip to "Resolved" without refreshing (via query client invalidation).

### Knowledge Base & RAG Pipeline
- [x] **Seed Data**: seeded with 10 detailed markdown articles covering VPN, password, HR policies, laptop guidelines, etc.
- [x] **Vector Store / Retrieval**: Similarity search using `pgvector` and `Xenova/all-MiniLM-L6-v2` offline embedding pipeline.
- [x] **Grounded Generation**: AI replies are strictly grounded; returns fallback message rather than hallucinations.

### Basic Metrics Dashboard (Agent-Only)
- [x] **Ticket Counts**: Total tickets by status (Open / Resolved).
- [x] **Category Counts**: Tickets broken down by category.
- [x] **Median Resolution Time**: Calculate and display median time to resolve in minutes.
- [x] **AI Override %**: How often agents overrode the AI's suggested category.

---

## Deliverables

### Codebase & Setup
- [x] **Tech Stack Setup**: React (Vite), NestJS, Prisma, PostgreSQL.
- [x] **Seed Script**: Seeder loads mock data, hashes passwords, downloads the transformer model, and embeds KB articles.
- [x] **Environment Variables**: `.env.example` prepared in both modules.

### Documentation (README.md)
- [x] **Project Overview**: Completed.
- [x] **Run Instructions**: Step-by-step local setup.
- [x] **Architecture Diagram**: Mermaid diagram showing RAG, DB, and Websocket layout.
- [x] **API Endpoints Table**: Detailed endpoints table.
- [x] **Decisions and Tradeoffs**: In-depth answers answering questions a through h.
- [x] **Future Improvements**: Documented.

---

## Stretch Goals (Implemented)
- [x] **Dockerize (`docker-compose.yml`)**: Multi-container setup included for postgres, backend, and frontend.
- [x] **Rate Limiting**: Custom zero-dependency, in-memory sliding-window rate limiting guard implemented for ticket submission restricting submissions to 5 per hour per employee. -->
