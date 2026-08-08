# CareerForge Backend

Production-oriented backend API for the CareerForge Job Recruitment and Application Management System.

## Stack

Node.js 20+, Express 5, JavaScript ES modules, MySQL 8, Sequelize, JWT, HTTP-only cookies, bcrypt, Express Validator, Helmet, CORS, Multer, Cloudinary, Brevo Transactional Email API, Jest, Supertest and ESLint.

## Local Setup

1. Install Node.js 20+ and MySQL 8.
2. From `server`, run `npm install`.
3. Copy `.env.example` to `.env` and replace local placeholders.
4. Create the development and test databases named by `DB_NAME` and `TEST_DB_NAME`.
5. Run `npm run db:migrate`.
6. Run `npm run db:migrate:test`.
7. Run `npm run lint`.
8. Run `npm test`.
9. Start development with `npm run dev` or production-style local execution with `npm start`.

Default local base URL:

```text
http://localhost:5000