# EasyGenerator Technical Assessment — Full Stack Authentication Application

This repository contains the implementation of the EasyGenerator technical assessment: a production-ready **React (Vite + TypeScript) + NestJS (MongoDB)** full-stack authentication application.

Below is a brief video demonstration of the completed application, showcasing user registration validation, JWT authentication, password strength analysis, and dashboard route protection.

[Assesment Video.webm](https://github.com/user-attachments/assets/b384ca86-2c2f-42fd-9353-a29cd952aedb)



## Architecture Overview

```
Full-Stack-Auth/
├── Backend/                   # NestJS Backend Application
│   ├── src/
│   │   ├── auth/              # Auth module (sign-in, sign-up, JWT strategy)
│   │   ├── users/             # Users module (schema, service, controller)
│   │   ├── common/            # Filters, interceptors, logger setup
│   │   └── config/            # App configurations
│   ├── test/                  # E2E test suites
│   ├── Dockerfile             # Production build containerization
│   └── .env.example
│
├── Frontend/                  # React + Vite Frontend Application
│   ├── src/
│   │   ├── api/               # Axios client and API wrappers
│   │   ├── components/        # Reusable UI components & layouts
│   │   ├── context/           # AuthContext (state management, JWT session)
│   │   ├── hooks/             # Custom React hooks (password validator)
│   │   ├── pages/             # Pages (SignIn, SignUp, Dashboard)
│   │   └── styles/            # Custom CSS system and themes
│   └── vitest.config.ts       # Frontend test configuration
│
└── docker-compose.yml         # Dev/Prod multi-container orchestration
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

### Understanding Environment Variables (`.env` Setup)
This project uses `.env` files to configure MongoDB, JWT keys, and ports. Depending on how you choose to run the app, you need to copy the appropriate file:
* **Docker Compose (Option 1):** You only need to copy the root `.env.example` to `.env` in the project root. Docker Compose automatically injects these into the containers.
* **Local Backend Development (Option 2):** You only need to copy `Backend/.env.example` to `Backend/.env`. The backend process reads this directly from its own directory.
* **Local Frontend Development (Option 3):** No `.env` is required by default. It defaults to connecting to the local backend at `http://localhost:3000/api/v1` but can be overridden with a `Frontend/.env` file containing `VITE_API_URL` if needed.

---

### Option 1: Docker Compose (Recommended)

Spins up the NestJS backend and MongoDB database together in an isolated Docker network.

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)

```bash
# 1. Enter the project root
cd Full-Stack-Auth

# 2. Set up the root environment file
cp .env.example .env
# (Optional) Edit the passwords and secrets in .env

# 3. Start everything
docker compose up --build -d

# Check backend container startup logs
docker compose logs -f backend
```

- **API Server:** http://localhost:3000/api/v1
- **Swagger Docs:** http://localhost:3000/api/docs *(development build only)*

---

### Option 2: Local Backend Development (without Docker)

**Prerequisites:** Node.js ≥ 20 and a running MongoDB instance.

```bash
# 1. Navigate to the backend directory
cd Backend

# 2. Set up the backend environment file
cp .env.example .env
# Edit the MONGODB_URI inside .env to point to your local MongoDB server

# 3. Install dependencies
npm install

# 4. Start the server in watch mode
npm run start:dev
```

---

### Option 3: Local Frontend Development

**Prerequisites:** Node.js ≥ 20. The frontend requires a running backend (Option 1 or Option 2).

```bash
# 1. Navigate to the frontend directory
cd Frontend

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

- **Frontend App:** http://localhost:5173
- *API Proxying:* Requests matching `/api` are automatically proxied to the NestJS backend at `http://localhost:3000`.

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

### Backend Testing
Navigate to `Backend/` directory:
```bash
# Unit tests (no external dependencies)
npm run test

# Unit tests with coverage report
npm run test:cov

# E2E tests (uses mongodb-memory-server — no external DB required)
npm run test:e2e
```

**Backend Test Coverage:**
- `AuthService` — sign-up, sign-in, enumeration prevention, profile retrieval
- `UsersService` — create, find by email, find by id, exists check
- `E2E Auth Flow` — sign-up validation, duplicate detection, sign-in, protected endpoint access

### Frontend Testing
Navigate to `Frontend/` directory:
```bash
# Unit/Component tests (Vitest + JSDOM)
npm run test

# Code quality check (Oxlint)
npm run lint
```

**Frontend Test Coverage:**
- `usePasswordStrength` hook — asserts password validation metrics (weak, medium, strong, uppercase/lowercase/numbers checks)
- `client` API module — validates response extraction and standardized error parsing

---

## 🔍 Tester Verification Guide

If you are evaluating this project, follow this step-by-step guide to run automated tests and perform manual verification.

### 1. Running Automated Tests (Backend & Frontend)

#### A. Backend Tests
Navigate to the `Backend` directory:
```bash
cd Backend

# Run unit tests (verifies business logic isolation)
npm run test

# Run E2E integration tests (runs in-memory MongoDB server, checks endpoint routes & validation)
npm run test:e2e

# Run tests and generate coverage report
npm run test:cov
```

#### B. Frontend Tests
Navigate to the `Frontend` directory:
```bash
cd Frontend

# Run unit and component tests (Vitest + JSDOM)
npm run test

# Run Oxlint code quality verification
npm run lint
```

---

### 2. Manual Testing via Frontend UI (End-to-End Application)

The easiest way to test the complete, integrated application is through the React UI.

1. **Start Backend & Database (via Docker Compose):**
   ```bash
   docker compose up --build -d
   ```
2. **Start Frontend Dev Server:**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```
3. **Open Application in Browser:** Navigate to [http://localhost:5173](http://localhost:5173).
4. **Step-by-Step E2E Verification Walkthrough:**
   * **Sign Up Page:**
     * Attempt to sign up with invalid values (e.g., short name, bad email, or weak password). Observe real-time validation feedback.
     * Fill in valid details (e.g., name `John Doe`, email `john@example.com`, password `StrongPass123!`). Click **Sign Up**.
     * Upon success, you are redirected to the Login page.
   * **Sign In Page:**
     * Try signing in with wrong credentials to verify the failure handling.
     * Sign in with your registered account.
   * **Authenticated Dashboard Page:**
     * Once signed in, you are redirected to the protected dashboard (`/dashboard`), which greets you with a secure welcome card and displays the parsed details of your JWT token.
     * Press the **Sign Out** button. You will be redirected back to the Sign-In page, and access to `/dashboard` is blocked (secure client-side routing).

---

### 3. Manual Testing via Swagger UI (Visual API Interactive)

The project includes a built-in Swagger interface for fast visual API verification.

1. **Verify Backend is running:** Ensure the backend is active at `http://localhost:3000`.
2. **Open Swagger UI:** Go to [http://localhost:3000/api/docs](http://localhost:3000/api/docs) in your browser.
3. **Walkthrough:**
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

### 4. Manual Testing via Terminal (cURL)

You can test the backend endpoints directly from your command-line shell:

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
