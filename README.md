# QuickDesk ⚡ (AI-Assisted Corporate Helpdesk)

QuickDesk is an internal corporate ticketing system built to empower support agents and accelerate resolution workflows. By leveraging Retrieval-Augmented Generation (RAG) over a secure, offline company knowledge base and embedding real-time synchronization, QuickDesk doesn't replace human agents — it supercharges them. Employees raise standard IT, HR, or Finance tickets, while the AI performs auto-triage (category and priority) and drafts an inline reply grounded strictly in company policies. Support agents retain final approval, with the ability to override suggests or custom-edit replies in a premium Rich Text canvas before resolving.

---

## Architecture Diagram

```mermaid
graph TD
    subgraph Client Application (React + Vite)
        A[Employee / Agent Browser] -->|REST Requests & JWT| B[Vite Frontend]
        C[Socket.io-Client] <-->|Real-time Events| D[WebSockets Server]
    end

    subgraph API Application (NestJS)
        B -->|HTTP Routes| E[NestJS Backend Controller]
        E -->|Guards / RBAC| F[RolesGuard & AuthGuard]
        F -->|Business Logic| G[Tickets & Users Service]
        G -->|Dynamic Queries| H[Prisma ORM]
        G -->|RAG Pipeline| I[AI Client Service]
        I -->|Offline Embeddings| J[Xenova Transformers Model]
        I -->|Prompt / structured output| K[ChatGoogleGenerativeAI - Gemini]
    end

    subgraph Database Store (PostgreSQL)
        H -->|Relational Tables| L[(PostgreSQL DB)]
        G -->|pgvector Query| M[(Knowledge chunks Table)]
    end
    
    D <-->|Broadcasts| E
```

---

## How to Run it Locally

Follow these step-by-step instructions to get a local development environment running on a fresh clone.

### Prerequisites
- **Node.js** (v18 or v20 recommended)
- **PostgreSQL** database running locally (configured with the `pgvector` extension)

### 1. Database Setup
Ensure your local PostgreSQL instance is running. Create a new database named `quickdesk`:
```sql
CREATE DATABASE quickdesk;
-- Ensure the pgvector extension is available in your Postgres installation
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Configure Environment Variables
Copy the `.env.example` in both directories to `.env`:

**For the Backend (`/quickdesk-api`):**
Create `quickdesk-api/.env` and supply:
```env
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/quickdesk?schema=public"
JWT_SECRET="super-secret-jwt-key-replace-me"
JWT_EXPIRES_IN="1d"
JWT_REFRESH_SECRET="super-secret-refresh-jwt-key"
JWT_REFRESH_EXPIRES_IN="30d"
GEMINI_API_KEY="AIzaSy...YourActualGeminiApiKey"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

**For the Frontend (`/quickdesk-web`):**
Create `quickdesk-web/.env` and supply:
```env
VITE_API_URL="http://localhost:3000/api/v1"
VITE_SOCKET_URL="http://localhost:3000"
```

### 3. Install & Seed Backend
Navigate to the api folder, install dependencies, run migrations, and run the database seeder:
```bash
cd quickdesk-api
npm install

# Run database migrations
npx prisma migrate dev

# Run the seed script (creates admin/agent/employee, and embeds KB articles offline)
npm run seed

# Start NestJS backend
npm run start
```
*Note: On first seed run, `@xenova/transformers` will download the local `all-MiniLM-L6-v2` model. This is done entirely offline and stored locally, ensuring zero cloud database API keys are needed for vectorizing the Knowledge Base.*

### 4. Install & Run Frontend
Open a new terminal window, navigate to the web folder, install dependencies, and start the Vite dev server:
```bash
cd quickdesk-web
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

**Seed Users to Test:**
- **Employee**: `employee@quickdesk.com` / `employee123`
- **Support Agent**: `agent@quickdesk.com` / `agent123`
- **System Admin**: `admin@quickdesk.com` / `admin123`

---

## API Endpoints Table

All API endpoints are prefixed with `/api/v1`.

| Method | Path | Purpose | Role Allowed | Auth Required |
| :--- | :--- | :--- | :--- | :---: |
| **POST** | `/auth/register` | Register a new Employee | Public | No |
| **POST** | `/auth/login` | Login and retrieve tokens | Public | No |
| **POST** | `/auth/refresh` | Exchange refresh token for new access token | Public | No |
| **GET** | `/auth/me` | Fetch authenticated user profile details | Any | Yes |
| **POST** | `/tickets` | Submit a new ticket (with optional attachments) | `EMPLOYEE` | Yes |
| **GET** | `/tickets/mine` | List employee's own tickets (supports search/filter) | `EMPLOYEE` | Yes |
| **GET** | `/tickets` | List all tickets (supports status, category, priority filters) | `AGENT` | Yes |
| **GET** | `/tickets/:id` | Fetch detailed view of a single ticket | `AGENT` | Yes |
| **GET** | `/tickets/:id/draft` | Generate/retrieve AI RAG draft reply and citations | `AGENT` | Yes |
| **PATCH** | `/tickets/:id/override` | Log and override ticket category/priority suggestions | `AGENT` | Yes |
| **POST** | `/tickets/:id/reply` | Send final agent response, log it, and resolve ticket | `AGENT` | Yes |
| **GET** | `/metrics` | Fetch analytics (counts, resolution times, override %) | `AGENT` | Yes |

---

## Decisions and Tradeoffs

### a) Why did you pick this frontend framework (React vs Next.js)?
We selected **React (with Vite)** instead of Next.js. QuickDesk is an internal corporate workspace. It behaves entirely as a Single Page Application (SPA) requiring intensive, highly stateful real-time interactions, Socket.io connections, and rich canvas rendering. Server-Side Rendering (SSR) or SEO optimization (traditional Next.js strengths) provides little value for an internal CRM, while Vite provides blistering fast hot-module reloading and simplified state alignment (without complex server-component vs client-component prop hydration boundaries).

### b) How did you structure the RAG pipeline?
- **Embedding Model**: We chose `Xenova/all-MiniLM-L6-v2` run offline via `@xenova/transformers`. This generates 384-dimensional dense vectors and guarantees vector computation happens entirely locally without third-party cost.
- **Chunk Size**: KB files are split paragraph-by-paragraph (clean boundaries on double newlines) to preserve semantic coherence and isolate clear standalone steps/procedures.
- **Retriever**: Standard cosine similarity similarity retrieval query over PostgreSQL via `pgvector` (`embedding <=> queryVector`). We retrieve the top `k = 3` most similar paragraphs.
- **Prompting & Grounding**: We use a highly structured System Prompt enforcing strict grounding: *"Base your reply ONLY on the provided knowledge base articles. Do not make up information not present in the articles. If no article is relevant, the AI should say so."* If no docs pass the similarity filter, a clear, pre-defined safe response is returned instead of calling the LLM, eradicating hallucinations.

### c) How did you handle the case where the LLM returns a category that does not match your allowed list?
In `AiClientService`, we use LangChain's `StructuredOutputParser` bound to a rigid **Zod Schema**.
```typescript
z.object({
  category: z.enum(['IT', 'HR', 'Finance', 'Admin', 'Other']),
  priority: z.enum(['Low', 'Medium', 'High'])
})
```
By feeding the structured schema instructions directly into the LLM system prompt and piping NestJS's LLM response through the Zod parser, we force the LLM to return valid JSON matching the enums. If the LLM generates a non-conforming category (or parsing fails due to prompt drift), our `catch` block intercepts the exception, logs it, and gracefully returns a safe database fallback (`{ category: 'Other', priority: 'Medium' }`), ensuring the application never crashes.

### d) Where did you store the JWT on the client, and why?
We store the JWT `access_token` in memory (React State) and issue the `refresh_token` as a secure, signed, **HttpOnly, SameSite=Strict Cookie** from the NestJS backend. 
- **Security Justification**: Keeping the primary access token in client state ensures it is completely inaccessible to malicious Cross-Site Scripting (XSS) scripts attempting document readouts. Meanwhile, issuing the refresh token inside a secure, HttpOnly cookie guarantees it cannot be read by Javascript at all, protecting the session from theft, while `SameSite=Strict` mitigates Cross-Site Request Forgery (CSRF) attempts.

### e) How did you enforce role-based access on the backend?
We built a custom NestJS `RolesGuard` powered by a `@Roles()` decorator.
- **Enforcement Mechanics**: When a client issues a request, the guard extracts the validated JWT payload, queries the PostgreSQL database (via Prisma) to resolve the user's active role assignments, and cross-references them against the required roles defined on the controller handler. Guesses or guessed URLs on the frontend are blocked immediately at the API gate, throwing an HTTP `403 Forbidden` response if an unauthorized employee attempts to invoke `/api/v1/metrics` or `/api/v1/tickets/:id/reply`.

### f) Why did you pick Socket.io / WebSockets / SSE for real-time?
We selected **Socket.io** over SSE and native WebSockets.
- **Justification**: Socket.io provides automatic reconnections, robust heartbeat checks, support for isolated rooms (allowing agents to subscribe to an `agents` broadcast room while locking employees to separate `employee:${userId}` private rooms), and clean multiplexing.
- **Failure Mode**: If a client socket disconnects (e.g. during a network drop), the Socket.io client automatically enters a backoff retry loop. We wired React Query's global cache invalidation to run automatically on reconnection, ensuring that once connection is restored, the client queries execute immediately and sync all changes seamlessly.

### g) What is the worst failure mode in your system today, and what would you do to address it?
- **Current Vulnerability**: The `pgvector` offline embedding generator relies on CPU-bound transformer inferences inside Node.js. If a large set of tickets or massive KB directories are processed, Node.js's event loop will block, bottlenecking the entire backend API.
- **Mitigation**: In a production-grade system, vectorization should be offloaded to a background job runner (like BullMQ + Redis) executing worker threads, or delegated to an external, scalable microservice.

### h) Where did AI tools help you most? Where did they hurt or mislead you?
- **Aids**: AI was extremely helpful in building complex SVG icons, structuring clean layouts for the live Display Board tone analysis, and translating nested Markdown blocks into semantic tags.
- **Hurts**: AI occasionally generated boilerplate React-Quill imports without realizing they have dependency conflicts under React 19. It also attempted to access React refs directly during rendering (which triggers ESLint anti-pattern warnings). We resolved these by implementing a pure React `contenteditable` container with hooks-driven state updates.

---

## Known Issues & Limitations

1. **Local Transformers Footprint**: Initial seeder script run takes up to 30-45 seconds while downloading the local model.
2. **Device Scaling**: The RAG response preview mockup in the agent dashboard is designed for high-resolution desktop environments. It may scale down dynamically on smaller mobile viewports.
