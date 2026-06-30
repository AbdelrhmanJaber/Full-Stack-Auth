# EasyGenerator Technical Assessment — Full Stack Authentication API

A production-ready **NestJS + MongoDB** authentication backend with full JWT auth, structured logging, rate limiting, Swagger API docs, unit + E2E tests, and a GitHub Actions CI/CD pipeline.

---

## Architecture Overview

```
Backend/
├── src/
│   ├── auth/                  # Authentication module
│   │   ├── dto/               # Request/response DTOs
│   │   ├── guards/            # JWT auth guard
│   │   ├── strategies/        # Passport JWT strategy
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   └── auth.service.spec.ts
│   ├── users/                 # Users module
│   │   ├── dto/               # User DTOs
│   │   ├── schemas/           # Mongoose User schema
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── users.service.spec.ts
│   ├── health/                # Health check endpoint
│   ├── common/
│   │   ├── filters/           # Global HTTP exception filter
│   │   └── interceptors/      # Logging + transform interceptors
│   ├── config/                # Typed app configuration
│   ├── app.module.ts
│   └── main.ts
├── test/
│   ├── auth.e2e-spec.ts       # Full E2E test suite (mongodb-memory-server)
│   └── jest-e2e.json
├── Dockerfile                 # Multi-stage production Docker build
└── .env.example
```

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/sign-up` | ❌ | Register a new user |
| `POST` | `/api/v1/auth/sign-in` | ❌ | Sign in and receive a JWT |
| `GET` | `/api/v1/auth/me` | ✅ JWT | Get current user profile |
| `GET` | `/api/v1/users/me` | ✅ JWT | Get current user profile (users module) |
| `GET` | `/api/v1/health` | ❌ | Application + DB health check |

Full interactive documentation available at **`/api/docs`** (development mode only).

---

## How to Run

### Option 1: Docker Compose (Recommended)

Spins up the NestJS backend and MongoDB together in an isolated Docker network.

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)

```bash
# 1. Clone and enter the project root
git clone <repo-url>
cd "EasyGenerator assesment"

# 2. Set up environment variables
cp .env.example .env
# Optionally edit passwords in .env

# 3. Start everything
docker compose up --build -d

# Check logs
docker compose logs -f backend
```

- **API Server:** http://localhost:3000/api/v1
- **Swagger Docs:** http://localhost:3000/api/docs *(development build only)*

---

### Option 2: Local Development (without Docker)

**Prerequisites:** Node.js ≥ 20 and a running MongoDB instance.

```bash
# 1. Go to the backend directory
cd "EasyGenerator assesment/Backend"

# 2. Set up environment
cp .env.example .env
# Edit .env with your local MongoDB URI

# 3. Install dependencies
npm install

# 4. Start in watch mode
npm run start:dev
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Runtime environment (`development`/`production`/`test`) | `development` |
| `PORT` | HTTP port | `3000` |
| `MONGODB_URI` | Full MongoDB connection string | — |
| `JWT_SECRET` | Secret for signing JWT tokens | — |
| `JWT_EXPIRES_IN` | JWT token lifetime (e.g. `7d`, `24h`) | `7d` |
| `CORS_ORIGIN` | Allowed CORS origin | `*` |

---

## Validation Rules

### Sign-Up Field Requirements

| Field | Rule |
|---|---|
| `name` | String, minimum **3** characters |
| `email` | Valid email format |
| `password` | Min **8** chars, ≥1 letter, ≥1 number, ≥1 special character |

---

## Testing

```bash
# Unit tests (no external dependencies)
npm run test

# Unit tests with coverage report
npm run test:cov

# E2E tests (uses mongodb-memory-server — no external DB required)
npm run test:e2e
```

**Test Coverage:**
- `AuthService` — sign-up, sign-in, enumeration prevention, profile retrieval
- `UsersService` — create, find by email, find by id, exists check
- `E2E Auth Flow` — sign-up validation, duplicate detection, sign-in, protected endpoint access

---

## 🔍 Tester & Examiner Verification Guide

If you are evaluating this project, follow this step-by-step guide to run automated tests and perform manual API tests.

### 1. Running Automated Tests (Unit & Integration)
Navigate to the `Backend` directory and execute the following:

```bash
cd Backend

# Run unit tests (verifies business logic isolation)
npm run test

# Run E2E integration tests (runs in-memory MongoDB server, checks endpoint routes & validation)
npm run test:e2e

# Run tests and generate coverage report
npm run test:cov
```

---

### 2. Manual Testing via Swagger UI (Visual & Interactive)
The project includes a built-in Swagger interface for fast visual verification.

1. **Spin up the application:**
   ```bash
   docker compose up --build -d
   ```
2. **Open Swagger UI:** Go to [http://localhost:3000/api/docs](http://localhost:3000/api/docs) in your browser.
3. **Step-by-step Authentication Walkthrough:**
   - Find the **`POST /api/v1/auth/sign-up`** endpoint, click **"Try it out"**, fill in a payload containing:
     - `name`: Must be at least 3 characters.
     - `email`: A valid email format.
     - `password`: Must contain at least 8 chars, 1 letter, 1 number, 1 special character (e.g., `SecurePass123!`).
     - Click **Execute** and confirm you receive a `201 Created` response containing the JWT `accessToken`.
   - Copy the returned `accessToken`.
   - Click the **"Authorize"** button at the top right of the page.
   - Paste the token into the value input field (no `Bearer` prefix is needed, Swagger handles it automatically) and click **Authorize**.
   - Scroll down to the **`GET /api/v1/auth/me`** endpoint, click **"Try it out"**, then **"Execute"**. You should receive a `200 OK` return with your user profile details.

---

### 3. Manual Testing via Terminal (cURL)
You can test the endpoints directly from your command-line shell:

#### A. Sign Up a User (Must pass validation)
```bash
curl -X POST http://localhost:3000/api/v1/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Tester",
    "email": "jane.tester@example.com",
    "password": "Password123!"
  }'
```

#### B. Sign In to receive a JWT Token
```bash
curl -X POST http://localhost:3000/api/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.tester@example.com",
    "password": "Password123!"
  }'
```
*Copy the `accessToken` from the JSON response object to verify the next step.*

#### C. Fetch Protected Profile (using the JWT Token)
Replace `<YOUR_TOKEN_HERE>` with the token returned in the sign-in step:
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```


---

## CI/CD (GitHub Actions)

Located at `.github/workflows/ci.yml`.

The pipeline runs automatically on every **push** or **pull request** to `main` or `develop`:

```
Push / PR
  └── Job 1: Unit Tests (lint + jest:cov + upload coverage artifact)
        └── Job 2: E2E Tests (mongodb-memory-server, no external DB)
              └── Job 3: Docker Build (validates Dockerfile compiles cleanly)
```

---

## Production Security Features

- **Rate Limiting** — via `@nestjs/throttler`: 10 req/s, 30/10s, 100/min per IP. Auth endpoints have stricter overrides.
- **Password Hashing** — bcrypt with 12 salt rounds.
- **User Enumeration Prevention** — sign-in returns the same error message whether the email exists or the password is wrong.
- **JWT Guard** — protected routes require a valid, non-expired bearer token.
- **Input Validation** — `ValidationPipe` with `whitelist: true` strips unknown fields.
- **Non-root Docker user** — the production container runs as the `node` user.

---

## Useful DevOps Commands

```bash
# Check running containers
docker compose ps

# Stream backend logs
docker compose logs -f backend

# Stop all services (keep DB volume)
docker compose down

# Full wipe including DB data
docker compose down -v
```
