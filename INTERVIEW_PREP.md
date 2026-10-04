# WhistleDrop — Technical Interview Preparation Guide

This document contains concise, technically sound answers to the key architecture and design questions for the **WhistleDrop Confidential Reporting Platform** recruitment evaluation.

---

## 1. 60-Second Project Explanation

> **WhistleDrop** is a full-stack confidential reporting platform engineered to solve the trust deficit in organizational whistleblowing. 
>
> Traditional reporting channels deter whistleblowers by requiring logins, user accounts, or email confirmations. WhistleDrop eliminates reporter identity entirely from the data model. When an anonymous reporter submits a concern across categories like Security, Corruption, or Harassment, the backend generates an unpredictable, cryptographically random tracking key (e.g. `WD-K7M4P9X2`).
>
> The whistleblower saves this code to track real-time investigation progress on a live timeline. Moderators log into a protected management dashboard via Spring Security and JWT authentication to review reports, filter and search cases, and update report statuses with explanatory audit notes. The system ensures privacy by design, end-to-end input validation, and strict state transition safety.

---

## 2. Architecture Explanation

WhistleDrop follows a clean **N-Tier Layered Architecture** with strict separation of concerns and Data Transfer Object (DTO) decoupling:

```
[ Frontend (React + TypeScript + Tailwind CSS) ]
                   │  HTTP REST / JSON (JWT in Authorization Header)
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Spring Boot Application Layer               │
│                                                         │
│  [ Web & Security Filter Chain ] (JwtAuthenticationFilter)
│                          │                              │
│  [ Controllers ]         ├── Validation (Bean Validation)
│  (REST API Endpoints)    └── Global Exception Handler   │
│                          │                              │
│  [ Service Layer ]       ├── Business Logic & State Rules
│                          └── Secure Case Code Generator │
│                          │                              │
│  [ Data Access Layer ]   ├── Spring Data JPA            │
│  (Repositories)          └── Specifications (Filtering) │
└──────────────────────────┬──────────────────────────────┘
                           │ JDBC / Hibernate ORM
                           ▼
                 [ Persistent Database ]
            (MySQL / In-Memory H2 for Tests)
```

1. **Presentation Layer (Frontend):** Built with React, TypeScript, and Tailwind CSS. Manages multi-step reporting, client-side validation, dark/light theme state, and public/moderator routing.
2. **Security & Controller Layer:** Intercepts requests, validates JWT tokens for protected `/api/moderator/**` endpoints, performs Bean Validation (`@Valid`), and routes to appropriate service methods.
3. **Business Logic Layer (Services):** Orchestrates transactions (`@Transactional`), enforces allowed status transitions, coordinates case-code generation, and maps between internal entities and external DTOs.
4. **Data Access Layer (Repositories):** Uses Spring Data JPA repositories with `JpaSpecificationExecutor` for dynamic, type-safe filtering and database persistence.
5. **Cross-Cutting Concerns:** Centralized exception handling (`@RestControllerAdvice`), standard response envelope (`ApiResponse<T>`), and OpenAPI documentation.

---

## 3. Database Explanation

The relational database uses two normalized core tables connected by a foreign key relationship:

```
┌──────────────────────────────────────────────────────────┐
│                         reports                          │
├─────────────────┬──────────────────┬─────────────────────┤
│ id              │ BIGINT           │ PRIMARY KEY (AUTO)  │
│ case_code       │ VARCHAR(16)      │ UNIQUE, NOT NULL    │
│ category        │ VARCHAR(32)      │ NOT NULL            │
│ description     │ TEXT             │ NOT NULL            │
│ evidence_url    │ VARCHAR(2048)    │ NULLABLE            │
│ status          │ VARCHAR(32)      │ NOT NULL            │
│ created_at      │ TIMESTAMP        │ NOT NULL            │
│ updated_at      │ TIMESTAMP        │ NOT NULL            │
└─────────────────┴────────┬─────────┴─────────────────────┘
                           │ 1
                           │
                           │ Has Many (1:N)
                           │
                           ▼ N
┌──────────────────────────────────────────────────────────┐
│                      status_updates                      │
├─────────────────┬──────────────────┬─────────────────────┤
│ id              │ BIGINT           │ PRIMARY KEY (AUTO)  │
│ report_id       │ BIGINT           │ FK -> reports(id)   │
│ status          │ VARCHAR(32)      │ NOT NULL            │
│ message         │ TEXT             │ NOT NULL            │
│ created_at      │ TIMESTAMP        │ NOT NULL            │
└─────────────────┴──────────────────┴─────────────────────┘
```

- **`reports` table:** Represents the primary concern submitted by the whistleblower. The `case_code` column has a unique database index (`idx_reports_case_code`) to ensure rapid lookup and zero duplicates.
- **`status_updates` table:** Represents the chronological timeline of updates. Linked to `reports.id` with `ON DELETE CASCADE` and an indexed foreign key (`idx_status_updates_report_id`).
- **`moderators` table:** Stores authorized moderator usernames, BCrypt-hashed password strings, and assigned roles.

---

## 4. Why Spring Boot?

1. **Enterprise Robustness:** Spring Boot provides production-ready features out of the box (Tomcat container, transaction management, dependency injection, and health monitoring).
2. **Ecosystem Integration:** First-class support for Spring Security, Spring Data JPA, and Bean Validation reduces boilerplate while enforcing industry best practices.
3. **Type Safety & Testability:** Spring Boot combined with Java gives compile-time guarantees and seamless integration with JUnit 5 and Mockito for automated testing.

---

## 5. Why REST?

1. **Stateless & Scalable:** RESTful design treats reports and status updates as resource entities (`/api/reports`, `/api/moderator/reports/{caseCode}/status`). Statelessness simplifies horizontal scaling and load balancing.
2. **Standard HTTP Semantics:** Utilizes correct HTTP methods (`POST` for submission, `GET` for retrieval, `PATCH` for partial status modification) and proper status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`).
3. **Decoupled Frontend:** Any client (React web app, mobile app, CLI) can consume the same JSON API without coupling to backend internals.

---

## 6. Why MySQL?

1. **ACID Compliance:** Whistleblower reports and audit histories require strict consistency and transactional integrity (e.g. creating a report and its initial status history in a single atomic transaction).
2. **Relational Constraints:** Foreign keys with cascade deletion and unique indexes on `case_code` guarantee data integrity directly at the database engine level.
3. **Industry Standard:** MySQL is universally supported across cloud providers (AWS RDS, Google Cloud SQL, Azure Database) and containerized environments.

---

## 7. Why JPA (Java Persistence API) / Hibernate?

1. **Object-Relational Mapping (ORM):** Eliminates repetitive handwritten SQL queries and maps Java entity classes directly to database tables.
2. **Dynamic Querying via Specifications:** Using `JpaSpecificationExecutor<Report>`, we implement clean, composable, type-safe filtering (category, status, search keyword) without SQL injection vulnerabilities.
3. **Database Portability:** JPA abstraction allows seamless execution of unit/integration tests against an in-memory H2 database while running production against MySQL with identical repository code.

---

## 8. Why DTOs (Data Transfer Objects)?

1. **Security & Information Hiding:** Database entities contain internal fields like database auto-increment `id` or cascade metadata. DTOs ensure only intentional, safe attributes (`caseCode`, `category`, `statusHistory`) are exposed to API consumers.
2. **API Stability & Decoupling:** Changes to database schema (e.g. renaming a column or splitting tables) do not break the public API contract.
3. **Dedicated Validation Target:** Validation annotations (`@NotBlank`, `@Size`, `@Pattern`) are placed directly on request DTOs (`CreateReportRequest`, `StatusUpdateRequest`) before business logic is touched.

---

## 9. How is Anonymity Maintained?

1. **Schema-Level Exclusion:** Fields like `reporterName`, `reporterEmail`, `reporterIp`, `phoneNumber`, or user profiles **do not exist** in any entity, DTO, or database table.
2. **No Session / Cookie Tracking for Reporters:** Anonymous endpoints do not set session cookies or require account registration.
3. **Zero Identifiers in Moderator View:** When moderators view reports, they see only the category, description, evidence link, timestamps, and status history.
4. **Honest Privacy Transparency:** The platform makes no false claims of Tor-level network anonymization, but guarantees application-level zero-knowledge storage of reporter identity.

---

## 10. How are Case Codes Generated?

Case codes are generated using `java.security.SecureRandom` via the [CaseCodeGenerator](file:///c:/Users/Nishant/Desktop/GDG/backend/src/main/java/com/whistledrop/util/CaseCodeGenerator.java) utility:

1. **Unpredictable Entropy:** `SecureRandom` utilizes OS cryptographic entropy sources (e.g. `/dev/urandom` or Windows CryptoAPI) rather than predictable pseudorandom seeds.
2. **Unambiguous Character Set:** A 30-character alphabet (`ABCDEFGHJKMNPQRSTUVWXYZ23456789`) is used, deliberately excluding visually ambiguous characters (`0`, `O`, `1`, `I`, `L`).
3. **Standard Format:** An 8-character string prefixed with `WD-` (e.g. `WD-K7M4P9X2`), yielding $30^8 \approx 6.56 \times 10^{11}$ possible combinations.

---

## 11. How is Moderator Authentication Implemented?

1. **Spring Security Filter Chain:** Configured with `SessionCreationPolicy.STATELESS`.
2. **Password Hashing:** Passwords are encrypted using BCrypt (`BCryptPasswordEncoder` with strength 12).
3. **JWT Token Generation:** Upon successful `/api/auth/login`, the backend signs a JSON Web Token (using HMAC-SHA512 and a secure 512-bit secret key) containing subject, roles, issued timestamp, and 24-hour expiration.
4. **Per-Request Authorization:** [JwtAuthenticationFilter](file:///c:/Users/Nishant/Desktop/GDG/backend/src/main/java/com/whistledrop/security/JwtAuthenticationFilter.java) extracts the token from the `Authorization: Bearer <token>` header on every request, validates signature and expiration, and sets the Spring Security `Authentication` context.

---

## 12. How are APIs Protected?

1. **Route-Level Rules:**
   - Public: `POST /api/reports`, `GET /api/reports/{caseCode}`, `POST /api/auth/login`, `/swagger-ui/**`, `/v3/api-docs/**` -> `.permitAll()`
   - Protected: `/api/moderator/**` -> `.hasRole("MODERATOR")`
2. **Standard Authentication Entry Point:** Unauthenticated requests to protected endpoints return `401 Unauthorized` with standard JSON payload.
3. **Access Denied Handler:** Authenticated users lacking required permissions receive `403 Forbidden`.
4. **CORS Policy:** Configured via [WebCorsConfig](file:///c:/Users/Nishant/Desktop/GDG/backend/src/main/java/com/whistledrop/config/WebCorsConfig.java) with parameterized allowed origins.

---

## 13. How are Invalid Requests Handled?

1. **Bean Validation (`@Valid`):** DTO fields are validated before reaching controller methods.
2. **Centralized Exception Handler (`@RestControllerAdvice`):** [GlobalExceptionHandler](file:///c:/Users/Nishant/Desktop/GDG/backend/src/main/java/com/whistledrop/exception/GlobalExceptionHandler.java) intercepts all exceptions:
   - `MethodArgumentNotValidException` -> Returns `400 Bad Request` with field-level validation errors.
   - `ResourceNotFoundException` -> Returns `404 Not Found` with a safe, descriptive message.
   - `InvalidStatusTransitionException` -> Returns `400 Bad Request` explaining valid transition paths.
   - `BadCredentialsException` -> Returns `401 Unauthorized`.
   - `Exception` (fallback) -> Returns `500 Internal Server Error` with masked error details.
3. **Zero Stack Trace Exposure:** Java stack traces and SQL syntax errors are logged server-side and never leaked in HTTP responses.

---

## 14. How are Status Transitions Handled?

WhistleDrop enforces a deterministic **Finite State Machine (FSM)** in the service layer:

```
[ SUBMITTED ] ────┬───► [ UNDER_REVIEW ] ────┬───► [ RESOLVED ]
                  │                          │
                  └───► [ DISMISSED ] ◄──────┘
```

- **Allowed Transitions:**
  - `SUBMITTED` $\rightarrow$ `UNDER_REVIEW`, `DISMISSED`
  - `UNDER_REVIEW` $\rightarrow$ `RESOLVED`, `DISMISSED`, `UNDER_REVIEW` (to add ongoing notes)
  - `RESOLVED` $\rightarrow$ `UNDER_REVIEW` (reopening case upon new evidence)
  - `DISMISSED` $\rightarrow$ `UNDER_REVIEW` (reconsidering dismissed report)
- **Forbidden Transitions:** Transitioning from `RESOLVED` or `UNDER_REVIEW` back to `SUBMITTED` is rejected with `InvalidStatusTransitionException` (`400 Bad Request`).

---

## 15. Why Separate `status_updates` from `reports`?

1. **Immutable Audit Trail:** Overwriting the `status` column in `reports` destroys the timeline. Having a separate `status_updates` table preserves a permanent, append-only history of every review stage.
2. **Reporter Transparency:** Whistleblowers can see when each update was posted along with specific moderator notes explaining what action was taken.
3. **Accountability & Compliance:** Organizations can audit turnaround times between `SUBMITTED`, `UNDER_REVIEW`, and `RESOLVED`.

---

## 16. What Happens if Two Case Codes Collide?

The system implements a **multi-layer collision defense**:

1. **Application-Layer Check:** `CaseCodeGenerator` queries `reportRepository.existsByCaseCode(code)`. If a collision occurs, it regenerates a new random code (up to 10 retry attempts).
2. **Database-Layer Guarantee:** The `case_code` column has a `UNIQUE` constraint in MySQL. If a concurrent race condition ever occurred, MySQL throws a `DataIntegrityViolationException`, which the transaction rolls back safely.
3. **Statistical Improbability:** With over 656 billion possible codes and random distribution, the collision probability in normal operation is infinitesimal.

---

## 17. What Would You Improve in Production?

1. **End-to-End Encrypted Messaging (PGP / Signal Protocol):** Allow 2-way anonymous dialogue between reporter and moderator where messages are encrypted using public keys so even the database administrator cannot read them.
2. **Rate Limiting & Anti-Abuse (Bucket4j / Redis):** Implement IP-masked token-bucket rate limiting and Proof-of-Work / CAPTCHA on the submission endpoint to prevent DDoS and spam flooding without storing reporter IP addresses.
3. **Encrypted Evidence Storage (S3 + SSE-KMS):** Implement secure file attachments (images, PDFs) with malware scanning and client-side encryption.
4. **Tor Onion Service & Header Stripping:** Host an `.onion` mirror and strip all reverse proxy headers (`X-Forwarded-For`, `User-Agent`) at the Nginx edge.
5. **Multi-Moderator RBAC & Audit Logging:** Introduce granular roles (Lead Investigator, Reviewer, Auditor) and immutable moderator action logs.
