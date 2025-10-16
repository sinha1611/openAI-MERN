# OpenAI-MERN
# Prompt Manager — Architecture, Design, Setup & Usage


## Project Summary

A responsive full‑stack web app that lets authenticated users create, save, version, tag, preview, search, filter, export, and import AI prompts/snippets. Built with **React.js** (frontend), **Express.js** (API backend), **Node.js**, and **MongoDB**.

---

## High-level Architecture

[Browser / Mobile]  <--HTTPS-->  [React.js Frontend (pages/app)]
                                      |
                                      | REST / JSON
                                      |
                                [Express.js API Server]
                                      |
                                      | Mongoose
                                      |
                                  [MongoDB Cluster]
                                      |
                                [Gemini API] (external)


<img width="282" height="600" alt="ChatGPT Image Oct 16, 2025, 11_49_23 AM" src="https://github.com/user-attachments/assets/100f5355-1a3e-4ff8-9666-d3b18c6e97bc" />



**Components**

* **Frontend (React.js)**

  * Server-side rendering for initial pages and CSR for app interactions
  * Auth UI (signup/login), prompt CRUD UI, preview pane, search/filter, version history modal, import/export UI
  * Uses Tailwind CSS for a clean responsive UI

* **Backend (Express.js)**

  * RESTful API endpoints for auth, prompts, versions, tags, import/export
  * Business logic for versioning, permissions, and Gemini preview requests
  * Rate‑limit and input validation middleware

* **Database (MongoDB)**

  * Stores users, prompts, prompt versions, tags
  * Used MongoDB Atlas for hosted DB

* **Gemini API**

  * Used for previewing prompts (test runs) and optional AI features

---

## Data Model (simplified)

### User

```json
{
  "_id": "ObjectId",
  "email": "string",
  "password": "string",
  "firstname": "string",
  "lastname": "string",
  "createdAt": "Date"
}
```

### Prompt

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "role": "string",
  "content": "string",
  "uniqueId": "ObjectId",
  "createdAt": "Date",
  "__v": "string"
}
```
---
```
## Key Flows & Design Decisions

### Authentication

* JWT based access tokens (short lived) + refresh tokens (httpOnly cookie).
* Passwords hashed using bcrypt.
* Protect API routes with an auth middleware that validates the token and loads the user.

### Prompt Preview

* Frontend sends preview requests to backend with prompt content + optional runtime metadata.
* Backend validates inputs and calls Gemini API (server-side) — returns the model output to frontend.
* Limit preview size (tokens) and rate‑limit per user to control cost.

### Search & Filter

* Index `title`, `tags`, and `description` fields in MongoDB. Use text index for full text search.
* Support filters: tags (AND/OR), ownership (mine/all), public/private, date ranges.

### Export / Import (JSON)

* **Export**: Endpoint returns a JSON file containing Prompt + all PromptVersions + tags + metadata.
* **Import**: Upload a JSON file; server validates structure, maps owner to current user, optionally deduplicates tags, and creates Prompts+Versions.
* Provide a preview modal before import showing number of prompts/versions.

### Frontend UX Notes

* Clean list view for prompts with search bar and tag chips.
* Editor pane with markdown support or plain textarea; split view for previewing model output.
* Version history accessible from a prompt details page; show diffs between versions (use a lightweight diff lib).
* Export/Import buttons in the prompt list or settings area.
* Responsive layout with mobile-first consideration.

---

## API Endpoints (examples)

**Auth**

* `POST /api/v1/user/signup` — create account
* `POST /api/v1/user/login` — returns access token (Bearer)
* `GET /api/v1/user/logout`

**Prompts**

* `POST /api/v1/geminiai/promt` — create prompt + initial version
* `POST /api/v1/geminiai/getpromt` — get prompt + current version
* `POST /api/v1/geminiai/deletepromt` — delete prompt
* `POST /api/v1/geminiai/createdpromt` — fetch the old prompt

**Descriptions**
- POST /api/v1/geminiai/promt
  - body: { userId }
  - headers: Authorization: Bearer <token>
  - returns: { promts: [...] }
- POST /api/v1/geminiai/getpromt
  - body: { userId }
  - headers: Authorization: Bearer <token>
  - returns: { promts: [...] }
- POST /api/v1/geminiai/deletepromt
  - body: { userId, promt_id }
  - headers: Authorization: Bearer <token>
  - returns: { promts: [...] }
- POST /api/v1/geminiai/createdPromt
  - body: { uniqueId }
  - headers: Authorization: Bearer <token>
  - returns: { promts: [...] }
- GET /api/v1/user/logout
  - clears server session/cookies

---

### Prerequisites

* Node.js (18+)
* npm or yarn
* MongoDB (local or Atlas)
* Gemini API key

### Environment Variables (.env)

```
MONGO_URI=
PORT=4002
JWT_SECRET=
Gemini_API_KEY=
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Backend (Express)

```bash
# from /server
npm install
cp .env.example .env  # fill env values
npm run dev            # or `nodemon src/index.js`

## Environment & storage keys Frontend
- localStorage keys used by the app:
  - `user` — JSON string with user data (e.g., { _id, firstName, ... })
  - `token` — JWT access token
  - `promtHistory_{user._id}` — cached prompt history for the user
```

### Frontend (React.js)

```bash
# from /web
npm install
cp .env.local.example .env.local  # set NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev
```

### Example Local Workflow

1. Start MongoDB or connect to Atlas.
2. Start backend `npm run dev` (port 4002).
3. Start frontend `npm run dev` (port 5173).
4. Open `http://localhost:5173` and sign up.
<img width="282" height="600" alt="image" src="https://github.com/user-attachments/assets/020b324e-d4b6-4a28-959c-a63ef7741355" />
<img width="440" height="333" alt="Screenshot 2025-10-16 084202" src="https://github.com/user-attachments/assets/6f98e3af-4c46-4dbb-8d51-0c3d4bdf788c" />


---

## Usage Guide (short)

* Sign up / log in.
* <img width="282" height="600" alt="image" src="https://github.com/user-attachments/assets/8d83c27e-a9fa-4fad-ac40-acd7892dd2fb" />
  <img width="440" height="333" alt="image" src="https://github.com/user-attachments/assets/71762365-1194-4cf9-9653-e791d971dfdd" />
* Create a new prompt: give it a title, tags, and content.
* <img width="282" height="600" alt="image" src="https://github.com/user-attachments/assets/b9aab016-38d7-4393-a8b6-6975417ebb7d" />
  <img width="440" height="333" alt="image" src="https://github.com/user-attachments/assets/7c21e543-cecf-47da-9e53-0c7865eb114f" />

* Click **Preview** or presss **Enter Key** to run the prompt against Gemini (server will forward to Gemini API).
* <img width="282" height="600" alt="image" src="https://github.com/user-attachments/assets/475e3b5c-a839-4d8c-8f38-17c9faba88ff" />
  <img width="440" height="333" alt="image" src="https://github.com/user-attachments/assets/fee5af00-4c69-43c4-88d0-ec903813fbc8" />

* Check the previous prompts and its response.
* <img width="282" height="600" alt="image" src="https://github.com/user-attachments/assets/3dbe1517-e0bc-41f0-a78b-d9ae653e86d1" />
  <img width="440" height="333" alt="image" src="https://github.com/user-attachments/assets/2c511c9a-5d8f-4d9d-93da-06d50e60899b" />

  
* Search for the prompt.
* <img width="282" height="600" alt="Screenshot 2025-10-16 112515" src="https://github.com/user-attachments/assets/49703b1c-4af0-4d9f-9f9b-364874d40dd8" />
  <img width="440" height="333" alt="image" src="https://github.com/user-attachments/assets/09dd9150-6b27-4dcc-a28f-ea2cbaeb36c2" />




---

## Security & Cost Controls

* Never call Gemini from the client — always from the server.
* Store Gemini key only on server (env var).
* Rate-limit preview endpoint per user and enforce token limits.
* Use https in production and httpOnly cookies for refresh tokens.

---


