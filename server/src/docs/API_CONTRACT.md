# CareerForge Frozen Backend API Contract

**Freeze point:** Phase 14 Stage 5 — Final Handover.

Phases 1–13 form the locked business/API baseline.

Phase 14 production deployment, CI/CD and production smoke verification have been completed.

The CareerForge backend API contract is now frozen for frontend integration.

Do not change routes, controllers, services, models, migrations, statuses, ownership rules, request schemas or response behavior unless a future change is explicitly required, reviewed, tested and documented.

## Contract Sources

- Endpoint list: `ENDPOINT_INVENTORY.md`
- API behavior/security summary: `API.md`
- Frontend integration contract: `FRONTEND_API_HANDOFF.md`
- Models: `MODEL_INVENTORY.md`
- Tests: `TESTING.md` and `PHASE-13-TEST-REPORT.md`
- Route definitions: `src/routes/**`
- Validators/constants: `src/validators/**` and `src/constants/**`

## Base URLs

Local backend:

```text
http://localhost:5000