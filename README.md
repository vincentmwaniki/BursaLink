# BursaLink Setup Guide

## 1. Backend Setup (Node.js/Bun)
1. Install dependencies: `bun install`
2. Configure `.env` file (see `.env.example`)
3. Run the server: `bun run server/index.ts`
4. The API will be available at `http://localhost:3001`

## 2. Frontend Setup (Vite/React)
1. Run the development server: `bun run dev`
2. Open `http://localhost:5173` in your browser

## 3. Database
- For local development, the current server uses an in-memory mock.
- To use PostgreSQL, apply the schema in `database/schema.sql`.

## 4. Features
- **Student App**: Log in with phone, fill profile, upload documents (drag & drop), track status.
- **Admin Dashboard**: Filter by county, review AI-scored applications, approve/reject/flag.
- **Public Portal**: Transparent view of fund distribution and beneficiaries.
- **AI Scoring**: Integrated logic based on income, orphan status, disability, and academics.

## 5. Security
- JWT for all protected routes.
- Role-based access control (RBAC).
- Input validation via Zod.
- Audit logging for critical actions.