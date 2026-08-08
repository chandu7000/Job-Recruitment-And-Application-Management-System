# CareerForge Environment Variables

Use `server/.env.example` as the secret-free environment template.

Real credentials and production secrets must exist only in:

- Local `.env` files that are excluded from Git
- Deployment-platform environment/secret storage such as Render

Never commit real credentials to Git.

---

# Required Environment Variable Groups

## Application

- `NODE_ENV`
- `PORT`

Production:

```text
NODE_ENV=production