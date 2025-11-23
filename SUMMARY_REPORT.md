# CivicServe — Project Summary

This document summarizes the current state of the CivicServe project (frontend + backend), implementation details, how to run the stack locally, current status, known issues, and recommended next steps.

## Project Overview

- Purpose: CivicServe is a civic issue reporting and authority workflow platform. Citizens can raise service requests (reports), request changes, reopen, rate, and interact with an assistant chatbot. Admins can assign, approve, grant editing rights, allocate work, and manage requests.
- Scope: Full-stack TypeScript application with a Next.js frontend and an Express + TypeScript backend backed by MongoDB.

## Frontend Summary

- Location: `frontend/`
- Frameworks & Libraries:
  - Next.js 16 (App Router & Turbopack), React 19, TypeScript
  - Tailwind CSS + shadcn UI components for UI primitives
  - Client-side components for chat, request forms, and auth flows

- Key Pages & Components:
  - `app/signup`, `app/auth/signup`, `app/auth/login`, `app/auth/forgot-password` — auth flows.
  - `app/user/raise-request`, `app/user/review-request`, `app/user/dashboard` — user flows for creating and tracking requests.
  - `app/admin/*` — admin dashboard, allocate work, update status, team management.
  - `components/chatbot.tsx` — floating chatbot UI; sends messages to backend and includes JWT-based user identification.
  - `components/rate-request.tsx`, `components/security-questions-setup.tsx` — helpful utilities for flows.

- API Integration:
  - The frontend communicates with the backend via `NEXT_PUBLIC_API_URL` (set in `frontend/.env.local`, default: `http://localhost:3001`).
  - Calls are performed using `fetch` to REST endpoints like `/api/auth/*`, `/api/requests/*`, `/api/allocations/*`, and the chatbot endpoint.

- Notable Implementation Details:
  - Replaced Supabase usage with direct backend API calls (signup/login, request CRUD, review flows).
  - Removed email OTP flows and moved to backend JWT-based auth; security questions implemented for recovery.
  - Addressed SSR issues: removed server-side calls to `useSearchParams` by using client-side URLSearchParams or wrapping components in client boundaries.

- Running (development):
  - From repository root, start the frontend:
    ```powershell
    cd frontend
    npm.cmd run dev
    ```

## Backend Summary

- Location: `backend/`
- Frameworks & Libraries:
  - Node.js, Express, TypeScript, Mongoose (MongoDB), bcrypt, jsonwebtoken

- Key Modules & Routes:
  - `src/server.ts` — main Express server and CORS setup.
  - `src/db/models.ts` — Mongoose schemas and models (User, ServiceRequest, ChangeRequest, ConversationMessage, etc.).
  - `src/routes/auth.ts` — signup, login, security-questions, seeding endpoint `/api/auth/seed-defaults` (dev only).
  - `src/routes/requests.ts` — create, update, reopen, request-change, review flows.
  - `src/routes/admin.ts` — admin-level operations (list change requests, allocate work, manage team).
  - `src/routes/chatbot.ts` — proxy to Gemini generative endpoint with a strong system prompt, multi-model retry, and fallback demo responses; stores conversation history in MongoDB when `user_id` is provided.

- Database:
  - MongoDB via Mongoose. Models include `User`, `ServiceRequest` (with `editable_by_user` and `status` variants), `ChangeRequest`, and `ConversationMessage`.

- Environment & Secrets:
  - Backend expects environment variables (in `backend/.env`): examples include `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `GEMINI_API_KEY`.

- Running (development):
  - From repository root, start the backend:
    ```powershell
    cd backend
    npm.cmd run dev
    ```
  - Health endpoint: `GET http://localhost:3001/health` returns 200 when running.

## Current Status (as of now)

- Backend: Running and responding on `http://localhost:3001/health` (200). MongoDB connection established in dev runs.
- Frontend: Development server starts and serves pages on `http://localhost:3000/` (200). Production build succeeded after addressing `useSearchParams` SSR issues.
- Chatbot: Backend route implemented to call Gemini (requires valid `GEMINI_API_KEY`); conversation storage implemented.
- Seeders: Dev-only seeder endpoint exists (`/api/auth/seed-defaults`) to populate demo users and admins.

## Known Issues & Caveats

- PowerShell on Windows: invoking `npm` from PowerShell uses `npm.ps1` which can be blocked by Execution Policy. Use `npm.cmd` or run from `cmd.exe` to avoid `ExecutionPolicy` errors.
- Several pages originally used `useSearchParams()` in server components; these were refactored but may still require review if new pages are added.
- Chatbot relies on an external Gemini API key; if not present or invalid, the route falls back to demo responses but will not perform real LLM calls.

## Smoke Tests & Verification

- There are helper smoke scripts in `scripts/` (PowerShell and Node) to exercise key flows (seed, signup/login, raise request, admin actions, chatbot). To run:
  - PowerShell runner (if you run locally with proper ExecutionPolicy):
    ```powershell
    cd scripts
    ./run_smoke.ps1
    ```
  - Node runner (if present):
    ```powershell
    node scripts/smoke_node.js
    ```

## Recommended Next Steps

- Run the smoke tests locally and inspect `logs/` (or terminal output) to validate end-to-end flows.
- Add automated CI steps to run smoke scripts on a test environment and fail early on regressions.
- Harden error handling and logging in `chatbot.ts` for clearer diagnostics when Gemini calls fail.
- Add E2E tests (Playwright or Cypress) for key user journeys: signup/login, raise-request, admin allocate/approve, chatbot conversation.

## Where to Look Next (quick pointers)

- Frontend source: `frontend/app/` and `frontend/components/`
- Backend source: `backend/src/` (routes, db, services)
- Env files: `frontend/.env.local`, `backend/.env` (sensitive keys not committed)
- Startup scripts: `start-backend.bat`, `start-frontend.bat`, `start-servers.js`

If you want, I can:
- Run the full smoke test suite now and attach logs.
- Generate a shorter one-page PDF summary.
- Create CI job definitions to run the smoke tests on push.

---
Generated on: 2025-11-23
