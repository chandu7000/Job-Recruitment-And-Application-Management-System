# CareerForge Frozen Backend API Contract

**Freeze point:** Phase 14 Stage 1.

Phases 1-13 form the locked business/API baseline. Stage 1 does not change routes, controllers, services, models, migrations, statuses or ownership rules. The contract is frozen for frontend integration unless a later deployment blocker requires an explicitly reviewed correction.

## Contract sources

- Endpoint list: `ENDPOINT_INVENTORY.md`
- API behavior/security summary: `API.md`
- Models: `MODEL_INVENTORY.md`
- Tests: `TESTING.md` and `PHASE-13-TEST-REPORT.md`
- Route definitions: `src/routes/**`
- Validators/constants: `src/validators/**` and `src/constants/**`

## Shared protocol

Local base URL: `http://localhost:5000`. API paths are under `/api`. Access tokens are supplied as Bearer tokens. Refresh authentication uses the HTTP-only `refreshToken` cookie scoped to `/api/auth`; production cookie behavior is secure and cross-site compatible (`SameSite=None`) as implemented in cookie configuration.

The production base URL is intentionally pending Stage 4 deployment.
