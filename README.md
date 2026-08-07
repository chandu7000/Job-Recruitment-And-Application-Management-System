# CareerForge

CareerForge is a backend-first Job Recruitment and Application Management System. Backend Phases 1-13 are the locked functional baseline; Phase 14 finalizes deployment, CI/CD and handover without adding business features.

## Repository layout
- `server/` - complete Node.js/Express/MySQL backend.
- `PHASE-*-PLAN.md` - historical phase planning documents.

## Start here
From the repository root, enter `server/` and follow `server/README.md`. The secret-free environment template is `server/.env.example`.

## Backend verification
From `server/`: `npm install`, configure `.env`, migrate development/test databases, run `npm run lint`, then `npm test`.

## API handoff
The Stage 1 frozen API contract and inventories are under `server/src/docs/`. Production deployment information is completed in later Phase 14 stages.
