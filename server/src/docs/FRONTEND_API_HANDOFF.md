# CareerForge Frontend API Handoff

## Overview

This document is the frontend integration reference for the frozen CareerForge backend API.

The backend implementation, automated testing, production deployment and production verification are complete.

Frontend development should integrate with the existing backend contract without unnecessarily changing established backend routes, request formats, response formats, authorization rules or business workflows.

---

## Base URLs

### Local Development

`http://localhost:5000`

### Production

`https://job-recruitment-and-application.onrender.com`

All application API routes are mounted under:

`/api`

---

## Authentication

CareerForge authentication uses:

- JWT access tokens
- HTTP-only refresh-token cookies
- Refresh-token rotation
- Email verification
- Session management
- Role-based authorization
- Server-side ownership validation

Protected requests must send the access token using:

`Authorization: Bearer <accessToken>`

The refresh token is maintained by the backend using an HTTP-only cookie named:

`refreshToken`

Frontend JavaScript must not attempt to read the refresh-token cookie.

Requests requiring the refresh cookie must include credentials.

Fetch example:

```js
fetch(url, {
  credentials: "include"
});