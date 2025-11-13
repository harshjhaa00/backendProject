# Backend Project

An opinionated, production-ready Node.js backend demonstrating secure authentication, MongoDB persistence, and modern developer tooling. The included `index.html` provides a lightweight front-end to exercise the APIs.

## Features

- Node.js + Express 4 with ES Modules.
- MongoDB via Mongoose, plus graceful shutdown hooks.
- JWT authentication with short-lived access tokens and refresh tokens stored in HTTP-only cookies.
- Structured logging (Pino in production, Morgan in development).
- Security hardening: Helmet, CORS, rate limiting, input validation, and sanitization.
- Jest + Supertest test suite for core auth flows.
- Dockerized development environment with MongoDB.

## Project Structure

```
.
├── Dockerfile
├── docker-compose.yml
├── index.html
├── package.json
├── README.md
├── tests
│   └── auth.test.js
└── src
    ├── config
    │   ├── db.js
    │   └── env.js
    ├── controllers
    │   ├── authController.js
    │   ├── messageController.js
    │   └── userController.js
    ├── middleware
    │   ├── auth.middleware.js
    │   ├── error.middleware.js
    │   ├── logger.middleware.js
    │   ├── rateLimiter.middleware.js
    │   └── validate.middleware.js
    ├── models
    │   └── User.js
    ├── routes
    │   ├── api.routes.js
    │   ├── auth.routes.js
    │   └── user.routes.js
    ├── utils
    │   ├── hash.util.js
    │   └── token.util.js
    └── server.js
```

## Requirements

- Node.js v18.18 or newer.
- MongoDB 6+ (local or via Docker).
- npm.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and update secrets:
   ```bash
   cp .env.example .env
   ```
3. Start MongoDB locally or use Docker compose (see below).

## Running

- Development (auto-restart via Nodemon):
  ```bash
  npm run dev
  ```
- Production build equivalent:
  ```bash
  npm start
  ```
- Tests (Jest + Supertest):
  ```bash
  npm test
  ```
- ESLint:
  ```bash
  npm run lint
  ```

## Docker

The included configuration starts both the Node.js app and MongoDB.

```bash
docker-compose up --build
```

Services:

- `app`: Express server, hot-reloaded in development mode.
- `mongo`: MongoDB instance with a persistent Docker volume (`mongo_data`).

Environment variables can be overridden with `export VAR=value` before running compose, or by editing `.env`.

## JWT Flow Overview

1. **Register/Login**: Client submits credentials. The server hashes the password, issues a short-lived access token (returned in the JSON response), and sets a long-lived refresh token in an HTTP-only cookie.
2. **Authenticated requests**: Client stores the access token (e.g., in memory/localStorage) and attaches it as `Authorization: Bearer <token>`.
3. **Token refresh**: When the access token expires, the client calls `/api/auth/refresh`. The server validates the refresh token cookie, rotates it, and returns a new access token.
4. **Logout**: Client calls `/api/auth/logout`. The server clears the cookie and bumps a `tokenVersion` field so previously issued refresh tokens become invalid.

## API Highlights

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/message`
- `POST /api/submit`
- `GET /api/user/profile`

See `index.html` and tests for exact request/response shapes.

## Example cURL

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Ada Lovelace", "email": "ada@example.com", "password": "Str0ngPass!"}' \
  -c cookies.txt

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ada@example.com", "password": "Str0ngPass!"}' \
  -c cookies.txt -b cookies.txt

# Access protected route using returned access token
curl http://localhost:4000/api/user/profile \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -b cookies.txt

# Refresh tokens
curl -X POST http://localhost:4000/api/auth/refresh \
  -b cookies.txt -c cookies.txt
```

## Security Notes

- Always serve production traffic over HTTPS so that HTTP-only cookies remain secure.
- Set `CORS_ORIGIN` to trusted origins only.
- Rotate `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` periodically.
- Increase rate-limit strictness and enable monitoring/alerting for suspicious activity.
- Consider persistent storage for refresh token identifiers if you need full revocation history.

## Contributing

1. Fork & clone.
2. Install dependencies (`npm install`).
3. Run tests (`npm test`) and lint (`npm run lint`) before submitting changes.

---

Happy shipping! 🚀

