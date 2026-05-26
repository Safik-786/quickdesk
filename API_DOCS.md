# QuickDesk API Documentation

This document provides detailed information about the REST API endpoints available in the QuickDesk application. The API is built using NestJS and is prefixed with `/api/v1`.

## Authentication

All protected endpoints require a JWT token passed in the `Authorization` header as a Bearer token.
Example: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...`

---

## 1. Auth Endpoints

### Register a new Employee
- **Method:** `POST`
- **Path:** `/api/v1/auth/register`
- **Auth Required:** No
- **Payload:**
  ```json
  {
    "email": "employee@example.com",
    "password": "securepassword",
    "name": "John Doe"
  }
  ```

### Login
- **Method:** `POST`
- **Path:** `/api/v1/auth/login`
- **Auth Required:** No
- **Payload:**
  ```json
  {
    "email": "employee@example.com",
    "password": "securepassword"
  }
  ```
- **Response:** Returns the user object and sets HttpOnly cookies containing the access and refresh tokens.

### Get Current User Profile
- **Method:** `GET`
- **Path:** `/api/v1/auth/me`
- **Auth Required:** Yes
- **Response:**
  ```json
  {
    "id": "user-uuid",
    "email": "employee@example.com",
    "name": "John Doe",
    "roles": [{"code": "EMPLOYEE"}]
  }
  ```

---

## 2. Ticket Endpoints

### Submit a New Ticket
- **Method:** `POST`
- **Path:** `/api/v1/tickets`
- **Auth Required:** Yes (Role: `EMPLOYEE`)
- **Content-Type:** `multipart/form-data` (Supports optional file attachments)
- **Payload:**
  - `title` (string): The subject of the ticket
  - `description` (string): Detailed description of the issue
  - `screenshots` (file array): Optional file attachments

### Get Employee's Tickets (My Tickets)
- **Method:** `GET`
- **Path:** `/api/v1/tickets/mine`
- **Auth Required:** Yes (Role: `EMPLOYEE`)
- **Query Params:** `status`, `search`
- **Response:** Array of ticket objects belonging to the authenticated employee.

### List All Tickets (Agent Dashboard)
- **Method:** `GET`
- **Path:** `/api/v1/tickets`
- **Auth Required:** Yes (Role: `AGENT` or `ADMIN`)
- **Query Params:** `status` (open, resolved, closed), `category`, `priority`, `search`
- **Response:** Paginated array of all system tickets.

### Get Ticket Details
- **Method:** `GET`
- **Path:** `/api/v1/tickets/:id`
- **Auth Required:** Yes (Role: `AGENT`, `ADMIN`, or the `EMPLOYEE` who created it)
- **Response:** Detailed ticket object including replies, AI suggestions, and audit logs.

### Generate AI RAG Draft Reply
- **Method:** `GET`
- **Path:** `/api/v1/tickets/:id/draft`
- **Auth Required:** Yes (Role: `AGENT` or `ADMIN`)
- **Response:**
  ```json
  {
    "draft": "Hello! Based on the IT policies, here is how you can resolve this...",
    "citations": [
      { "title": "VPN Setup Guide", "content": "..." }
    ]
  }
  ```

### Override Ticket AI Suggestions
- **Method:** `PATCH`
- **Path:** `/api/v1/tickets/:id/override`
- **Auth Required:** Yes (Role: `AGENT` or `ADMIN`)
- **Payload:**
  ```json
  {
    "category": "IT",
    "priority": "High"
  }
  ```
- **Description:** Updates the ticket category/priority and automatically logs the change in the Audit Log.

### Send Final Agent Reply & Resolve
- **Method:** `POST`
- **Path:** `/api/v1/tickets/:id/reply`
- **Auth Required:** Yes (Role: `AGENT` or `ADMIN`)
- **Payload:**
  ```json
  {
    "message": "Here is the final resolution for your issue..."
  }
  ```
- **Description:** Adds the reply to the thread, stores the final resolution, and flips the ticket status to `resolved`. Triggers a Socket.io event to update the employee's screen in real-time.

---

## 3. Metrics Endpoints

### Fetch Agent Analytics
- **Method:** `GET`
- **Path:** `/api/v1/metrics`
- **Auth Required:** Yes (Role: `AGENT` or `ADMIN`)
- **Response:**
  ```json
  {
    "totalTickets": 150,
    "openCount": 45,
    "resolvedCount": 105,
    "medianResolutionMinutes": 120,
    "categoryOverrideRate": 15.5,
    "priorityOverrideRate": 5.2,
    "byCategory": {
      "IT": 60,
      "HR": 40
    }
  }
  ```
