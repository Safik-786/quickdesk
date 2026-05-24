# QuickDesk AI Integration Documentation

This document outlines everything related to how Artificial Intelligence (AI) is integrated into the QuickDesk Helpdesk application, including the models used, their specific purposes, workflows, and the associated API endpoints.

---

## 1. The Models & Their Purpose

QuickDesk uses a **hybrid AI approach**, combining a local Machine Learning model with a powerful cloud-based Large Language Model (LLM).

### A. The "Brain": Google Gemini (`gemini-flash-latest`)
* **Location:** Cloud API (via `@langchain/google-genai`).
* **Purpose:** Complex reasoning, decision making, and natural language generation.
* **What it does:**
  1. **Auto-Classification:** Reads raw ticket text and decides which department (e.g., IT, HR) it belongs to and its urgency (Low, Medium, High).
  2. **Draft Generation:** Acts as a virtual support agent. It reads the user's problem, reads the facts retrieved from the Knowledge Base, and writes a professional, context-aware reply to the user.

### B. The "Librarian": Xenova Transformers (`all-MiniLM-L6-v2`)
* **Location:** Runs locally in the Node.js process (via `@xenova/transformers`).
* **Purpose:** Semantic Search and Vector Embeddings.
* **What it does:** It does not "understand" text. Instead, it converts text (like Knowledge Base `.md` files and user questions) into arrays of numbers (vectors). It uses mathematical cosine similarity to instantly find the 3 most relevant paragraphs in your Knowledge Base that match a user's ticket.

---

## 2. AI Workflows & Features

### Feature 1: Ticket Auto-Classification
When a user submits a ticket, the API intercepts it before saving it to the database. It asks Gemini to parse the `title` and `description` using a strict Zod schema. 
- **Result:** The ticket is immediately saved with an `aiCategory` and `aiPriority`.

### Feature 2: RAG (Retrieval-Augmented Generation) Knowledge Base
When the server starts, it reads all Markdown (`.md`) files in `quickdesk-ai/kb`. 
- **Result:** The local Xenova model splits these files into paragraphs, calculates their vector embeddings, and stores them in RAM.

### Feature 3: AI Draft Replies
When an agent views a ticket, they can request an AI draft. 
1. The Xenova model searches the local RAM embeddings to find the most relevant Knowledge Base paragraphs.
2. The API sends the ticket details + the found paragraphs to Gemini.
3. Gemini writes a response based *strictly* on those paragraphs.
- **Result:** The draft is saved to the database alongside `citations` (which files were used to generate the answer).

---

## 4. API Endpoints

The AI functionality is exposed through the standard Tickets API.

#### `POST /tickets`
* **Role:** Employee
* **Action:** Submits a new ticket.
* **AI Trigger:** Calls `aiClient.classify()`. Automatically assigns the AI category and priority before returning the created ticket.

#### `GET /tickets/:id/draft`
* **Role:** Support Agent
* **Action:** Generates a draft reply for a specific ticket.
* **AI Trigger:** Calls `ragService.retrieveRelevantDocs()` to find local context, then calls `aiClient.draftReply()` to hit the Gemini API. Saves the result to `aiDraft` on the ticket.

#### `PATCH /tickets/:id/override`
* **Role:** Support Agent
* **Action:** Overrides the AI's auto-classification.
* **AI Trigger:** Because AI isn't perfect, this endpoint allows a human agent to fix the `category` or `priority`. It logs the change in the `AuditLog` so you can track how often the AI is wrong.
