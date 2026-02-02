# Kaz Invest Test Task (Monorepo)

This is a monorepo containing the frontend and backend for the AI Chat application.

## Structure

- **frontend/**: React + Vite application.
- **backend/**: Node.js + Express server (Gemini AI).

## Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```
    This will install dependencies for both root, frontend, and backend.

2.  **Environment Variables:**
    - Create `backend/.env` with your `GEMINI_API_KEY`.
    - (Optional) Create `frontend/.env` if needed.

## Running the App

To run both Frontend and Backend concurrently:

```bash
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:8000](http://localhost:8000)
