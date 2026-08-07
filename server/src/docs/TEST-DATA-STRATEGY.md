# Seed and Test-Data Strategy

## Development seeders

Development seeders create only controlled example data such as the initial administrator. Credentials must come from environment variables and must not be real production credentials.

## Jest fixtures

Automated suites create their own predictable records with unique emails/slugs and clean them in foreign-key-safe order. Tests must not depend on manually pre-existing rows.

## Isolation rules

- Jest runs with `NODE_ENV=test`.
- `TEST_DB_NAME` must differ from `DB_NAME`.
- Test cleanup targets only records created by the suite, normally through controlled prefixes or captured IDs.
- Do not truncate arbitrary development/production tables.
- Do not call real SMTP or Cloudinary providers during automated tests.

## Production rule

Production seeding is not automatic. Never place real passwords, API secrets, JWT secrets or private tokens in seeders, fixtures, Postman assets or source control.
