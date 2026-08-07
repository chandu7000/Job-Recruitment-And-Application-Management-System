# CareerForge Backend

Production-oriented backend API for the CareerForge Job Recruitment and Application Management System.

## Stack
Node.js 20+, Express 5, JavaScript ES modules, MySQL 8, Sequelize, JWT, HTTP-only cookies, bcrypt, Express Validator, Helmet, CORS, Multer, Cloudinary, Nodemailer, Jest, Supertest and ESLint.

## Local setup
1. Install Node.js 20+ and MySQL 8.
2. From `server`, run `npm install`.
3. Copy `.env.example` to `.env` and replace local placeholders.
4. Create the development and test databases named by `DB_NAME` and `TEST_DB_NAME`.
5. Run `npm run db:migrate`.
6. Run `npm run db:migrate:test`.
7. Run `npm run lint`.
8. Run `npm test`.
9. Start development with `npm run dev` or production-style local execution with `npm start`.

Default local base URL: `http://localhost:5000`. Health: `/api/health/`. Readiness: `/api/health/ready`.

## Scripts
- `npm start` - run `src/server.js`.
- `npm run dev` - run with nodemon.
- `npm test` - full Jest suite in-band.
- `npm run test:watch` - Jest watch mode.
- `npm run test:prepare` - migrate test database.
- `npm run test:full` - migrate test DB then run all tests.
- `npm run lint` - ESLint.
- `npm run db:migrate` / `db:migrate:test` - development/test migrations.
- `npm run db:migrate:undo` / `db:migrate:test:undo` - undo last migration.
- `npm run db:seed` / `db:seed:undo` - seed management.
- `npm run jobs:expire` - close expired jobs.

## Documentation
See `src/docs/ARCHITECTURE.md`, `ENVIRONMENT_VARIABLES.md`, `ENDPOINT_INVENTORY.md`, `MODEL_INVENTORY.md`, `API_CONTRACT.md`, `API.md`, `TESTING.md` and `FRONTEND_API_HANDOFF.md`.

Phase 14 does not add frontend code or new backend business features.
