# AI.md — AI Assistance Disclosure

This document outlines how AI assistance (specifically the Antigravity assistant, powered by Gemini 3.1 Pro) was utilized during the development, auditing, and refactoring of this Full-Stack Authentication project, adhering to a structured and deliberate methodology.

## My AI Workflow Methodology

### 1. Planning and System Design (Divide and Conquer)
My approach starts entirely outside of the AI prompt window. For any given feature, I first focus on planning and system design. I use a "divide and conquer" technique to break down a large feature into smaller, manageable sub-tasks. I define the requirements for each specific task before I engage the AI. By doing this, I ensure the AI is solving a well-defined problem rather than guessing at high-level architecture. Once the task is defined, I write a well-engineered, structured prompt to get a highly accurate AI response.

**Project Example:** When building the backend authentication, I didn't ask the AI to "build an auth system." Instead, I broke it down: first designing the User Mongoose schema, then planning the JWT strategy, and finally mapping out the controller endpoints. Only then did I prompt the AI for specific modules.

### 2. Handling New or Complex Implementations
If a part of the feature involves a concept or technology that is new to me or particularly complex, I prioritize learning over generation. I attempt to implement the logic manually first. Once I have a working draft or a solid conceptual grasp, I use the AI as a peer reviewer. I ask it to review my code for edge cases, security vulnerabilities, or performance improvements.

**Project Example:** For the backend security measures, I manually implemented the user enumeration prevention logic and the Passport JWT strategy to ensure I fully understood the core authentication flow. Afterward, I used the AI to review my implementation. The AI helped identify missing edge cases in the error handling and suggested optimal configurations for the rate-limiting guards to prevent brute-force attacks.

### 3. Automating Repeated Tasks
For tasks that are repetitive or highly boilerplate-heavy, I leverage AI to accelerate development. However, this is always done *after* the planning and design phase is complete. I never blindly accept generated code; I thoroughly review the AI's output to ensure it fits seamlessly into the project's architecture and coding standards.

**Project Example:** Scaffolding the basic NestJS controller/service classes and generating DTOs with `class-validator` decorators (like `CreateUserDto`). The AI generated the boilerplate quickly, and I reviewed and tweaked the specific validation rules to meet the assessment requirements.

### 4. Security, Verification, and AI Fallibility
Given this is an authentication project, **AI-generated code touching credentials, tokens, or session handling was never merged without manual security review**. Authentication is exactly where blind AI trust is most dangerous.
Additionally, while AI was used to generate Jest test suites, I did not use it as a verification gate (i.e., letting the AI blindly validate its own code). I manually reviewed the test coverage and the assertions themselves for correctness—ensuring they asserted meaningful behavior rather than just testing for presence.
Lastly, the AI was not perfect. For instance, it hallucinated an outdated Mongoose method for finding users and initially misconfigured the rate-limiting TTL format. I caught and corrected these issues during my manual review and testing phase, which reinforced the necessity of developer judgment under realistic conditions.

---

## Structured Prompts Used

To get the best results, I use well-engineered, structured prompts based on the specific context of the project. Here are some brief examples of the types of prompts I used during this assessment:

- **Feature Generation:** 
  > "Act as a Senior Backend Developer. Implement a NestJS `AuthService` method for user login. 
  > **Requirements:**
  > 1. Validate the password using bcrypt.
  > 2. Prevent user enumeration by returning a generic 'Invalid credentials' error for both wrong email and wrong password.
  > 3. Return a signed JWT payload containing userId and email."

- **Code Review:** 
  > "Review the following React component `AuthLayout.tsx`. 
  > **Review Requirements:**
  > - Check for accessibility (a11y) best practices.
  > - Ensure responsive design for mobile and tablet.
  > - Verify proper and efficient use of CSS utility classes. Suggest improvements without rewriting the core logic."

- **Security Logic Peer Review (matches Section 2):** 
  > "I have manually implemented the user enumeration prevention and Passport JWT strategy for my NestJS app below. 
  > **Review Requirements:**
  > 1. Identify any missing edge cases in the error handling.
  > 2. Suggest optimal configurations for `ThrottlerGuard` to prevent brute-force attacks.
  > 3. Do not rewrite the core logic; only point out security vulnerabilities."

- **Boilerplate Generation (matches Section 3):** 
  > "Generate a NestJS `CreateUserDto` class.
  > **Requirements:**
  > 1. Include fields for `name`, `email`, and `password`.
  > 2. Decorate fields with standard `class-validator` decorators (e.g., `@IsEmail()`, `@IsString()`).
  > 3. I will manually refine the specific password regex rules later, so just provide the standard boilerplate structure."

- **Testing & QA:** 
  > "Write a Jest E2E test suite for the NestJS `/auth/signup` endpoint using `mongodb-memory-server`. 
  > **Test Case Requirements:**
  > 1. Successful registration (201 Created).
  > 2. Duplicate email conflicts (409 Conflict).
  > 3. Invalid password formatting (400 Bad Request)."

- **Debugging:** 
  > "I am getting a TypeScript error `TS2339: Property 'password' does not exist on type 'Document<any, any, any>'` in my Mongoose `toJSON` transform. 
  > **Requirement:** Provide a solution to strictly type the `ret` parameter without using `any` or disabling ESLint rules."

By following this workflow, I ensure that the AI acts as an assistant and an accelerator, while I remain the primary architect and decision-maker for the codebase.
