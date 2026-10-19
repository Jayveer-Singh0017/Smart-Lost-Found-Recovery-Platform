# Smart Lost & Found Recovery Platform - Architecture & Design

## 1. System Overview

The **Smart Lost & Found Recovery Platform** is a full-stack enterprise web application engineered to bridge the gap between lost belongings and honest finders. The system combines an explainable matching algorithm, a structured ownership verification claim lifecycle, and role-based administration with audit logging.

```mermaid
graph TD
    User["End User (Browser / Mobile)"]
    Admin["Administrator (Portal)"]
    
    subgraph Frontend["React 18 + Vite Client (Port 3000 / 5173)"]
        UI["Tailwind CSS + Lucide React UI"]
        Router["React Router v6"]
        QueryCache["TanStack React Query Cache"]
        AuthCtx["JWT Auth Context"]
        Recharts["Recharts Analytics Dashboard"]
    end
    
    subgraph Backend["Spring Boot 3.4.x Application (Port 8080)"]
        Sec["Spring Security 6 + Stateless JWT Filter"]
        Controllers["REST Controllers (RFC 7807)"]
        Services["Core Service Layer"]
        MatchEngine["Deterministic Matching Engine"]
        ClaimMachine["Claim Lifecycle State Machine"]
        Flyway["Flyway Database Migration Engine"]
    end
    
    subgraph Storage["Persistence & Media Layer"]
        MySQL[("MySQL 8.0 Relational DB")]
        DiskStorage[("Secure Local File Storage")]
    end

    User -->|HTTPS/REST| UI
    Admin -->|HTTPS/REST| UI
    UI --> Router
    Router --> QueryCache
    QueryCache -->|Bearer JWT| Sec
    Sec --> Controllers
    Controllers --> Services
    Services --> MatchEngine
    Services --> ClaimMachine
    Services --> Flyway
    Services -->|Spring Data JPA| MySQL
    Services -->|NIO Stream| DiskStorage
```

---

## 2. Layered Backend Architecture

The backend follows Clean Architecture and Domain-Driven Design (DDD) principles:

1. **Presentation Layer (`com.smartlostfound.controller`)**:
   - Exposes RESTful endpoints conforming to RFC 7807 problem details.
   - Enforces `@Valid` input constraints via Jakarta Validation.
   - Delegates authorization to Spring Security annotations (`@PreAuthorize`).
   - Standard envelope formatting via `ApiResponse<T>` and `PagedResponse<T>`.

2. **Security & Interception Layer (`com.smartlostfound.security`)**:
   - `JwtAuthenticationFilter`: Extracts and parses `Bearer <token>` from HTTP `Authorization` headers.
   - `JwtTokenProvider`: Issues and cryptographically validates HS256 JWT tokens.
   - `CustomUserDetailsService`: Hydrates `UserPrincipal` with granted authorities (`ROLE_USER`, `ROLE_ADMIN`).
   - `SecurityConfig`: Configures CORS, disabled CSRF for stateless REST, session management, and URL authorization rules.

3. **Service Layer (`com.smartlostfound.service`)**:
   - `MatchingService`: Mathematical multi-factor matching engine with explainability.
   - `ClaimService`: Transactional claim processing, ownership evidence validation, and automatic resolution of competing claims.
   - `ItemReportService`: Search specifications, geospatial/city filtering, and item lifecycle transitions.
   - `FileStorageService`: Strict MIME type checking, extension whitelisting, UUID sanitization, and path traversal defense.
   - `AuditLogService`: Immutable recording of administrative actions.
   - `NotificationService`: In-app event delivery for claims, status updates, and resolutions.
   - `AdminService`: Aggregated metrics and database reporting for operational visibility.

4. **Persistence Layer (`com.smartlostfound.repository`, `entity`)**:
   - 8 Spring Data JPA repositories with `JpaSpecificationExecutor` for dynamic filtering.
   - Hibernate 6 ORM with optimistic locking and indexed foreign keys.
   - Flyway database migration guaranteeing reproducible schema versioning.

---

## 3. Database Schema & Entity Relationships

```mermaid
erDiagram
    USERS ||--o{ ITEM_REPORTS : "reports"
    USERS ||--o{ CLAIMS : "submits"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ AUDIT_LOGS : "performs"
    CATEGORIES ||--o{ ITEM_REPORTS : "categorizes"
    ITEM_REPORTS ||--o{ ITEM_IMAGES : "contains"
    ITEM_REPORTS ||--o{ CLAIMS : "receives"
    ITEM_REPORTS ||--o{ MODERATION_REPORTS : "flags"

    USERS {
        bigint id PK
        varchar email UK
        varchar password
        varchar full_name
        varchar phone
        varchar role
        boolean enabled
        datetime created_at
    }

    CATEGORIES {
        bigint id PK
        varchar name UK
        varchar slug UK
        varchar description
        varchar icon_name
        boolean active
    }

    ITEM_REPORTS {
        bigint id PK
        varchar type "LOST | FOUND"
        varchar title
        text description
        bigint category_id FK
        bigint user_id FK
        varchar status "OPEN | CLAIM_PENDING | RESOLVED | REJECTED | ARCHIVED"
        varchar location_city
        varchar location_address
        varchar location_venue
        decimal latitude
        decimal longitude
        date date_occurred
        varchar brand
        varchar primary_color
        varchar serial_number
        text secret_question
        text secret_answer
        boolean flag_moderated
        datetime created_at
    }

    ITEM_IMAGES {
        bigint id PK
        bigint item_report_id FK
        varchar file_path
        varchar file_name
        varchar mime_type
        bigint file_size
        boolean is_primary
    }

    CLAIMS {
        bigint id PK
        bigint item_report_id FK
        bigint claimant_id FK
        varchar status "PENDING | APPROVED | REJECTED | WITHDRAWN"
        text proof_description
        varchar proof_document_path
        text secret_answer_attempt
        text reviewer_notes
        bigint reviewed_by_id FK
        datetime reviewed_at
    }

    NOTIFICATIONS {
        bigint id PK
        bigint user_id FK
        varchar title
        text message
        varchar type
        varchar link_url
        boolean is_read
        datetime created_at
    }

    MODERATION_REPORTS {
        bigint id PK
        bigint item_report_id FK
        bigint reporter_id FK
        varchar reason
        text details
        varchar status "PENDING | REVIEWED | DISMISSED | ACTIONED"
        bigint reviewed_by_id FK
    }

    AUDIT_LOGS {
        bigint id PK
        bigint user_id FK
        varchar action
        varchar entity_name
        bigint entity_id
        text details
        varchar ip_address
        datetime created_at
    }
```

---

## 4. Deterministic Multi-Factor Matching Algorithm

The `MatchingService` computes a composite compatibility score $S \in [0, 100]$ between a target item $A$ and candidate opposite-type items $B$ ($\text{LOST} \leftrightarrow \text{FOUND}$).

$$S = S_{\text{category}} \times (W_t S_{\text{text}} + W_d S_{\text{date}} + W_l S_{\text{location}} + W_a S_{\text{attributes}})$$

### Factor Breakdown:

1. **Category Compatibility ($S_{\text{category}}$)**:
   - Must match strictly: if $Category(A) \neq Category(B)$, score is penalized or filtered out ($S_{\text{category}} = 0.0$ or severe penalty). Matching categories yield $1.0$.

2. **Textual Similarity ($S_{\text{text}}$, Weight = 35%)**:
   - Normalized Jaccard similarity across title, description, and brand tokens:
     $$J(A, B) = \frac{|Tokens(A) \cap Tokens(B)|}{|Tokens(A) \cup Tokens(B)|}$$
   - Includes stop-word stripping, case folding, and sub-string token inclusion.

3. **Date Proximity ($S_{\text{date}}$, Weight = 25%)**:
   - Measures temporal gap $\Delta t = |Date(A) - Date(B)|$ in days:
     - $\Delta t \le 1$ day: $1.0$ (100%)
     - $\Delta t \le 3$ days: $0.85$ (85%)
     - $\Delta t \le 7$ days: $0.70$ (70%)
     - $\Delta t \le 14$ days: $0.50$ (50%)
     - $\Delta t \le 30$ days: $0.25$ (25%)
     - $\Delta t > 30$ days: $0.05$ (5%)

4. **Location Proximity ($S_{\text{location}}$, Weight = 25%)**:
   - City exact match: $0.60$ baseline.
   - Address/Venue token overlap: Adds up to $0.40$.
   - Same city and venue match: $1.0$ (100%).
   - Different cities: $0.10$ (10%).

5. **Attributes Alignment ($S_{\text{attributes}}$, Weight = 15%)**:
   - Color match: $+50\%$ of attribute weight.
   - Brand match: $+50\%$ of attribute weight.

### Explainability Matrix:
Each match returned by the API includes a structured `MatchExplanationDto` breaking down the individual percentage scores and human-readable justification badges (e.g., *"Same city (San Francisco) and matching electronics brand 'Apple'"*).

---

## 5. Claim Verification State Machine

```mermaid
stateDiagram-v2
    [*] --> OPEN : Item Created
    OPEN --> CLAIM_PENDING : User Submits Claim
    CLAIM_PENDING --> OPEN : Claim Rejected (No other pending claims)
    CLAIM_PENDING --> CLAIM_PENDING : Additional Competing Claim Submitted
    CLAIM_PENDING --> RESOLVED : Finder / Admin Approves Claim
    RESOLVED --> [*] : Competing Claims Auto-Rejected

    note right of RESOLVED
        When a claim is approved:
        - Target item status -> RESOLVED
        - Approved claim -> APPROVED
        - All other pending claims for this item -> REJECTED
        - Notification sent to winner & rejected claimants
    end note
```

---

## 6. Frontend Architecture & State Management

- **Modular UI Design**: Built with Tailwind CSS, Lucide React icons, and accessible modal dialogs.
- **Client Cache**: TanStack React Query manages remote server state, query invalidation, caching, and optimistic UI updates.
- **Authentication**: `AuthContext` provides global session state, automatic token persistence in `localStorage`, and reactive logout on 401 response interceptor.
- **Route Guards**:
  - `ProtectedRoute`: Ensures user is authenticated; redirects unauthenticated visitors to `/login?redirect=...`.
  - `AdminRoute`: Verifies `user.role === 'ROLE_ADMIN'`; displays `ForbiddenPage` (403) to non-admin users.
