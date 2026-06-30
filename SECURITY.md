# Security Architecture & Verification Audit

This document outlines the security architecture, threat model mitigations, and validation measures implemented in the application to ensure it is production-ready.

---

## 1. Authentication & Session Security

### Cryptographic Password Hashing
* **Implementation:** Passwords are hashed using the industry-standard `bcrypt` algorithm.
* **Work Factor:** A salt factor of **12 rounds** is enforced, providing a balanced trade-off between hashing latency and resistance to GPU-based brute-force cracking.
* **Storage Exclusion:** The `password` field in the Mongoose User schema is configured with `select: false`. This ensures passwords are never accidentally queried, written to logger files, or returned in standard JSON responses, unless explicitly requested during authentication verification.

### JSON Web Tokens (JWT)
* **Strategy:** Stateless authentication via signed JWTs using the RS232 / HS256 standard.
* **Token Transport:** Tokens are passed strictly in the standard HTTP `Authorization: Bearer <token>` header.
* **Token Lifespan:** Configured to expire in **7 days** (configurable via `JWT_EXPIRES_IN`).
* **Environment Isolation:** JWT secrets are loaded strictly from the system environment (`JWT_SECRET`) and are never hardcoded.

---

## 2. API Abuse & DDoS Prevention

### Tiered Rate Limiting (Throttler)
To protect endpoints from brute-force login attempts and denial-of-service (DoS) attacks, the NestJS backend employs `@nestjs/throttler` with tiered limit rules:

1. **Global Throttle Rule:**
   - **Short-term:** 10 requests per 1 second (per IP) to absorb spikes.
   - **Medium-term:** 30 requests per 10 seconds (per IP).
   - **Long-term:** 100 requests per 1 minute (per IP).

2. **Specialized Auth Overrides:**
   - **`/auth/sign-up`:** Stricter throttle limit of **3 requests per 1 minute** (per IP) to block automated spam account registration.
   - **`/auth/sign-in`:** Stricter throttle limit of **5 requests per 1 minute** (per IP) to prevent credential stuffing.

---

## 3. Data Integrity & Input Sanitization

### Global Validation Pipes
* **Validation Engine:** Enforced globally via NestJS `ValidationPipe` leveraging `class-validator` and `class-transformer`.
* **Payload Whitelisting:** Configured with `whitelist: true`, which automatically strips any properties from the request body that are not explicitly defined in the corresponding DTO, preventing parameter pollution/mass-assignment vulnerabilities.
* **Complexity Validation (DTO):**
  - **Email:** Validated via `@IsEmail()` to enforce proper format.
  - **Name:** Minimum of 3 characters enforced via `@MinLength(3)`.
  - **Password:** Validated using regular expressions ensuring:
    - Minimum length of 8 characters.
    - At least one letter.
    - At least one number.
    - At least one special character.

---

## 4. Information Disclosure Mitigation

### Prevention of User Enumeration
Attackers often query authentication endpoints to discover valid email addresses based on varying server responses (e.g., "User not found" vs "Wrong password").
* **Mitigation:** The `AuthService` handles authentication failures uniformly:
  ```typescript
  if (!user) {
    throw new UnauthorizedException("Invalid email or password");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedException("Invalid email or password");
  }
  ```
  Both paths log distinct warnings internally (for auditing/intrusion detection) but respond with the identical message to the client.

### Stack Trace Exposure & Response Standardization
* **Mitigation:** A global `HttpExceptionFilter` intercepts all unhandled errors.
* In **production mode**, database error stack traces are suppressed, logging the detail internally via Winston but returning a sanitized `500 Internal Server Error` message to the client.

---

## 5. Deployment Security

### Non-Root Docker Execution
Running Docker containers as `root` is a security risk. If a container escape occurs, the attacker has host-root privileges.
* **Mitigation:** The backend `Dockerfile` utilizes a multi-stage build. In the final execution stage, it switches to the built-in non-privileged `node` user:
  ```dockerfile
  USER node
  CMD ["node", "dist/main.js"]
  ```

---

## 6. Security Testing & Verification

Automated E2E test suites in `test/auth.e2e-spec.ts` actively verify these security configurations:
* **Validation Bounds:** Ensures invalid emails, weak passwords, and short names are rejected with `400 Bad Request`.
* **Incorrect Credentials:** Asserts that invalid passwords and non-existent emails return `401 Unauthorized` with identical messaging.
* **Protected Routes:** Verifies that requesting `/api/v1/auth/me` without a valid JWT bearer token fails with `401 Unauthorized`.
