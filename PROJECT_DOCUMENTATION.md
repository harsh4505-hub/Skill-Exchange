# STUDENT SKILL EXCHANGE PLATFORM
### 2nd-Year Information Technology Mini-Project Report & Documentation

---

## 1. ABSTRACT
In modern university environments, students possess diverse skills ranging from programming languages, software development frameworks, and UI/UX design to soft skills like public speaking, technical writing, and media editing. However, peer-to-peer knowledge transfer remains largely unorganized, informal, and limited to immediate social circles. Commercial tutoring portals and e-learning platforms impose prohibitive financial costs and often lack contextualized, flexible peer support. 

This project presents the **Student Skill Exchange Platform**, a decentralized web application tailored for college students to exchange academic, technical, and creative skills under a mutual barter mechanism without financial transaction. Built using **Java Spring Boot**, **Spring Data JPA/Hibernate**, **Spring Security with BCrypt encryption**, and a **MySQL** relational database, the system incorporates an explainable heuristic **Skill Matching Algorithm** based on a five-factor compatibility formula ($40\%$ direct skill compatibility, $20\%$ reverse mutual trade, $15\%$ peer rating, $15\%$ administrative verification, and $10\%$ academic synergy). The platform features student-to-student in-built chat, customizable learning modes (Online, Offline Campus, and Chat), an administrative skill verification audit queue, and post-exchange 5-star peer reviews. The resulting system optimizes campus resource utilization, fosters collaborative learning, and offers an intuitive, responsive user interface styled with Bootstrap 5 and modern aesthetic principles.

---

## 2. INTRODUCTION
Peer-assisted learning is recognized in cognitive psychology as one of the most effective pedagogical strategies. University students often learn more effectively when guided by peers who have recently overcome the same conceptual roadblocks. However, students who want to learn a specialized skill (e.g., Photoshop or Premiere Pro) may not know a peer who is proficient in that area and simultaneously willing to teach in exchange for a skill they possess (e.g., Java or Python).

The **Student Skill Exchange Platform** bridges this communication divide by providing an automated, fair, and secure ecosystem where students can list skills they can teach, declare skills they wish to acquire, and discover compatible barter partners.

---

## 3. PROBLEM STATEMENT
Traditional academic environments suffer from three core deficiencies in peer skill sharing:
1. **Lack of Discovery Mechanism:** Students have no centralized directory to search peers based on specific programming competencies, design expertise, or language fluency across departments and academic years.
2. **One-Way Transaction Burden:** Standard tutoring requires monetary payment, which creates financial friction for university students who already have valuable reciprocal knowledge to offer.
3. **Credibility & Misrepresentation Issues:** Informal campus exchanges frequently suffer from unverified competence claims, leading to wasted time and mismatched expectations.

---

## 4. OBJECTIVES
The principal objectives of this mini project are:
1. To develop a secure, web-based platform with role-based authentication (`ROLE_STUDENT` and `ROLE_ADMIN`) using Spring Security and BCrypt password encryption.
2. To design and implement a transparent, non-black-box **Skill Matching Algorithm** that calculates mutual compatibility between students' teaching and learning profiles.
3. To provide flexible **Learning Modes** allowing students to coordinate through Online video links, campus Offline meetings, or In-built Chat.
4. To establish a **Skill Verification Mechanism** where administrators review certificates or project portfolios to award verified skill badges.
5. To implement a closed-loop **Rating and Review System** preventing duplicate submissions and updating live student trust scores.
6. To implement real-time student messaging and in-app event notifications.

---

## 5. EXISTING SYSTEM VS. PROPOSED SYSTEM

### 5.1 Existing System
* **Methods:** WhatsApp/Telegram college groups, bulletin boards, commercial tutoring portals (Chegg, Superprof).
* **Limitations:**
  * High financial subscription costs.
  * Information is lost in chat noise.
  * No mutual barter or reciprocity algorithm.
  * No skill certification audit or student verification.
  * Lack of accountability and feedback mechanisms.

### 5.2 Proposed System
* **Features:**
  * Free, peer-to-peer reciprocal knowledge barter.
  * Explainable 5-factor matching algorithm ($40/20/15/15/10\%$).
  * Administrative document auditing with **✓ VERIFIED SKILL** badge display.
  * Post-exchange 1–5 star ratings preventing multiple submissions per trade.
  * Responsive, modern Bootstrap 5 UI themed in soft lavender, purple, and subtle pink accents.

---

## 6. LITERATURE REVIEW & RESEARCH GAP

### 6.1 Literature Review
Studies in cooperative learning (Johnson & Johnson, 2009) indicate that peer teaching reinforces foundational knowledge for the tutor while delivering personalized, low-anxiety instruction for the tutee. Digital barter platforms in economics illustrate that double coincidence of wants can be resolved through indexed multi-parameter matching systems (Roth, 2015).

### 6.2 Research Gap
While commercial freelance and tutoring portals exist, they are optimized for monetary transactions. Existing open campus platforms lack verification pipelines and structured barter contracts. The proposed system addresses this gap by combining automated heuristic matching, administrative verification, and flexible delivery modes within a single, lightweight architecture suitable for college deployment.

---

## 7. PROPOSED METHODOLOGY
The system was engineered using the **Agile Iterative Model**:
1. **Requirement Analysis:** Identifying student personas, peer barter rules, and administrative governance.
2. **Database & Entity Design:** Structuring relational schemas in third normal form (3NF) with foreign key constraints.
3. **Backend Service Layer:** Implementing business logic, matching heuristics, and Spring Security filters.
4. **REST API Development:** Creating standardized REST endpoints returning structured `ApiResponse<T>` envelopes.
5. **Frontend Assembly:** Building responsive HTML5/Bootstrap 5 views with asynchronous JavaScript `fetch()` calls.
6. **Testing & Validation:** Verification of edge cases, duplicate restrictions, and role authorizations.

---

## 8. SYSTEM ARCHITECTURE

```mermaid
graph TD
    subgraph Client Tier
        Browser["Web Browser (HTML5 / Bootstrap 5 / JS)"]
    end

    subgraph Presentation Tier
        Controller["Spring MVC REST Controllers<br/>(AuthController, MatchingController, etc.)"]
        SecFilter["Spring Security Filter Chain<br/>(BCrypt / Session / Role Guard)"]
    end

    subgraph Service Tier
        AuthSvc["AuthService"]
        MatchSvc["MatchingService (40/20/15/15/10%)"]
        ExchSvc["ExchangeRequestService"]
        ChatSvc["ChatService"]
        VerifSvc["SkillVerificationService"]
    end

    subgraph Data Access Tier
        JPARepo["Spring Data JPA Repositories<br/>(Hibernate ORM)"]
    end

    subgraph Database Tier
        DB[("MySQL Database<br/>(skill_exchange_db)")]
    end

    Browser -->|HTTP/REST /api/*| SecFilter
    SecFilter --> Controller
    Controller --> AuthSvc
    Controller --> MatchSvc
    Controller --> ExchSvc
    Controller --> ChatSvc
    Controller --> VerifSvc
    AuthSvc --> JPARepo
    MatchSvc --> JPARepo
    ExchSvc --> JPARepo
    ChatSvc --> JPARepo
    VerifSvc --> JPARepo
    JPARepo -->|SQL Queries| DB
```

---

## 9. EXPLAINABLE SKILL MATCHING ALGORITHM (MODULE 4)

The matching score between Student A (requester) and Student B (candidate) is determined using a deterministic weighted formula:

$$\text{Match Score} = S_{\text{direct}} + S_{\text{reverse}} + S_{\text{rating}} + S_{\text{verification}} + S_{\text{synergy}}$$

Where:
1. **Direct Skill Compatibility ($S_{\text{direct}} = 40\%$):**
   * If Student B teaches $\ge 1$ skill that Student A wants to learn: $+40$ points.
2. **Reverse Skill Compatibility ($S_{\text{reverse}} = 20\%$):**
   * If Student A teaches $\ge 1$ skill that Student B wants to learn (two-way mutual exchange): $+20$ points.
3. **Peer Rating Score ($S_{\text{rating}} = 15\%$):**
   * Calculated as: $\left(\frac{\text{Candidate Rating}}{5.0}\right) \times 15$. (New students default to $3.5 \to 10.5$ pts).
4. **Administrative Verification ($S_{\text{verification}} = 15\%$):**
   * If Student B holds an approved verified skill badge: $+15$ points ($+6$ points for standard unverified).
5. **Academic / Campus Synergy ($S_{\text{synergy}} = 10\%$):**
   * Same Department & College: $+10$ points.
   * Same College: $+7$ points. Cross-Campus: $+4$ points.

---

## 10. ENTITY-RELATIONSHIP (ER) DIAGRAM

```mermaid
erDiagram
    USERS ||--o| STUDENT_PROFILES : "has"
    USERS ||--o{ USER_TEACHING_SKILLS : "teaches"
    USERS ||--o{ USER_LEARNING_SKILLS : "wants_to_learn"
    USERS ||--o{ EXCHANGE_REQUESTS : "sends/receives"
    USERS ||--o{ MESSAGES : "sends/receives"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ SKILL_VERIFICATIONS : "submits"
    USERS ||--o{ RATINGS_REVIEWS : "writes/receives"
    USERS ||--o{ REPORTS : "files/reported"
    USERS ||--o{ BLOCKED_USERS : "blocks"

    SKILL_CATEGORIES ||--o{ SKILLS : "categorizes"
    SKILLS ||--o{ USER_TEACHING_SKILLS : "referenced_in"
    SKILLS ||--o{ USER_LEARNING_SKILLS : "referenced_in"
    SKILLS ||--o{ EXCHANGE_REQUESTS : "offered/requested"

    EXCHANGE_REQUESTS ||--o| EXCHANGES : "originates"
    EXCHANGES ||--o{ RATINGS_REVIEWS : "evaluated_by"

    USERS {
        bigint id PK
        varchar email UK
        varchar password
        varchar role
        boolean active
        timestamp created_at
    }

    STUDENT_PROFILES {
        bigint id PK
        bigint user_id FK
        varchar full_name
        varchar college
        varchar department
        varchar year_of_study
        varchar phone
        text bio
        boolean is_verified
        double average_rating
        int completed_exchanges_count
        boolean is_blocked
    }

    SKILL_CATEGORIES {
        bigint id PK
        varchar name UK
        varchar description
        varchar icon
    }

    SKILLS {
        bigint id PK
        varchar name UK
        bigint category_id FK
        varchar description
    }

    EXCHANGE_REQUESTS {
        bigint id PK
        bigint sender_id FK
        bigint receiver_id FK
        bigint skill_offered_id FK
        bigint skill_requested_id FK
        varchar learning_mode
        varchar status
        timestamp created_at
    }

    EXCHANGES {
        bigint id PK
        bigint request_id FK
        bigint student1_id FK
        bigint student2_id FK
        varchar status
        timestamp start_date
        timestamp completion_date
    }

    RATINGS_REVIEWS {
        bigint id PK
        bigint exchange_id FK
        bigint reviewer_id FK
        bigint reviewed_student_id FK
        int rating
        text comment
    }
```

---

## 11. USE CASE DIAGRAM

```mermaid
graph LR
    Student((Student))
    Admin((Administrator))

    subgraph Student Skill Exchange Platform
        UC1[Register & Login]
        UC2[Manage Profile & Bio]
        UC3[Add Teaching & Learning Skills]
        UC4[Search Skills & Browse Catalog]
        UC5[View Recommended Matches]
        UC6[Send & Accept Exchange Proposals]
        UC7[Chat & Coordinate Sessions]
        UC8[Submit Verification Proof Documents]
        UC9[Rate & Review Peer After Exchange]
        UC10[Report Inappropriate Behavior]

        AUC1[Admin Login]
        AUC2[View Platform Statistics]
        AUC3[Audit & Approve Skill Verifications]
        AUC4[Moderate Abuse Reports & Block Users]
        AUC5[Manage Skill Taxonomy & Users]
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5
    Student --> UC6
    Student --> UC7
    Student --> UC8
    Student --> UC9
    Student --> UC10

    Admin --> AUC1
    Admin --> AUC2
    Admin --> AUC3
    Admin --> AUC4
    Admin --> AUC5
```

---

## 12. DATA FLOW DIAGRAMS

### 12.1 DFD Level 0 (Context Diagram)

```mermaid
graph TD
    Student[Student User] -->|Registration & Credentials| System[Student Skill Exchange Platform]
    Student -->|Skills Offered & Requested| System
    Student -->|Exchange Proposals & Messages| System
    System -->|Matched Peer Recommendations| Student
    System -->|Notifications & Ratings| Student

    Admin[System Administrator] -->|Login Credentials| System
    Admin -->|Verification Approvals & Report Resolutions| System
    System -->|Platform Analytics & Audit Queues| Admin
```

### 12.2 DFD Level 1

```mermaid
graph TD
    User([Student / Admin]) --> P1[1.0 Authentication & Session Management]
    P1 --> D1[(Users & Profiles)]

    User --> P2[2.0 Skill Portfolio Management]
    P2 --> D2[(Skills & Categories)]
    P2 --> D3[(User Skills)]

    D3 --> P3[3.0 Compatibility Matching Engine]
    D1 --> P3
    P3 --> User

    User --> P4[4.0 Proposal & Exchange Coordination]
    P4 --> D4[(Exchange Requests & Contracts)]
    P4 --> P5[5.0 In-App Messaging & Alerts]
    P5 --> D5[(Messages & Notifications)]

    User --> P6[6.0 Verification & Peer Rating]
    P6 --> D6[(Verifications & Reviews)]
    D6 --> D1
```

---

## 13. CLASS DIAGRAM

```mermaid
classDiagram
    class User {
        +Long id
        +String email
        +String password
        +String role
        +boolean active
    }

    class StudentProfile {
        +Long id
        +String fullName
        +String college
        +String department
        +String yearOfStudy
        +boolean isVerified
        +Double averageRating
        +Integer completedExchangesCount
    }

    class Skill {
        +Long id
        +String name
        +String description
    }

    class SkillCategory {
        +Long id
        +String name
        +String description
        +String icon
    }

    class ExchangeRequest {
        +Long id
        +String learningMode
        +String status
        +LocalDateTime createdAt
    }

    class Exchange {
        +Long id
        +String status
        +LocalDateTime startDate
        +LocalDateTime completionDate
    }

    class ChatMessage {
        +Long id
        +String messageText
        +LocalDateTime sentAt
        +boolean isRead
    }

    class SkillVerification {
        +Long id
        +String documentName
        +String documentPath
        +String status
        +String adminComment
    }

    class RatingReview {
        +Long id
        +Integer rating
        +String comment
    }

    User "1" <--> "1" StudentProfile
    SkillCategory "1" *-- "many" Skill
    User "1" --> "many" ExchangeRequest
    ExchangeRequest "1" --> "1" Exchange
    Exchange "1" --> "many" RatingReview
    User "1" --> "many" ChatMessage
    User "1" --> "many" SkillVerification
```

---

## 14. HARDWARE & SOFTWARE REQUIREMENTS

### 14.1 Hardware Requirements
* **Processor:** Intel Core i3 / AMD Ryzen 3 or higher
* **RAM:** Minimum 4 GB (8 GB recommended for IDE + Spring Boot + MySQL)
* **Storage:** 500 MB free hard disk space
* **Network:** Standard Local Area Network or Localhost

### 14.2 Software Requirements
* **Operating System:** Windows 10/11, macOS, or Linux
* **Java Development Kit (JDK):** OpenJDK / Oracle JDK 17 (LTS)
* **Database:** MySQL Server 8.0+ (or H2 In-Memory for testing)
* **Build Tool:** Apache Maven 3.8+
* **Web Browser:** Google Chrome, Mozilla Firefox, or Microsoft Edge
* **Development Environment:** IntelliJ IDEA, VS Code, or Eclipse

---

## 15. TESTING & TEST CASES

| Test ID | Test Scenario | Input Data | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Student Registration | Valid academic details, matching password | User and profile saved, session created | **PASS** |
| **TC-02** | Password Confirmation Mismatch | Password: `secret1`, Confirm: `secret2` | 400 Bad Request: "Passwords do not match" | **PASS** |
| **TC-03** | Duplicate Email Check | Existing email: `harsh@college.edu` | 409 Conflict: "Email already exists" | **PASS** |
| **TC-04** | BCrypt Encryption Verification | Plaintext password in DB inspection | Non-reversible hash prefixed `$2a$10$...` | **PASS** |
| **TC-05** | Direct Skill Matching | Harsh wants Photoshop, Sejal teaches it | Direct match detected, +40 points awarded | **PASS** |
| **TC-06** | Mutual Barter Compatibility | Sejal wants Java, Harsh teaches it | Mutual trade identified, +20 points awarded | **PASS** |
| **TC-07** | Duplicate Skill Prevention | Adding 'Java' twice to teaching list | 409 Conflict: "Skill already added" | **PASS** |
| **TC-08** | Self-Exchange Prevention | Request senderId == receiverId | 400 Bad Request: "Cannot request self" | **PASS** |
| **TC-09** | Admin Verification Flow | Admin clicks 'Approve' on proof | Status=VERIFIED, Verified badge awarded | **PASS** |
| **TC-10** | Duplicate Review Prevention | Submitting 2nd review for same exchange | 409 Conflict: "Already reviewed exchange" | **PASS** |
| **TC-11** | Rating Recalculation | 5★ review submitted | Student average rating updated immediately | **PASS** |

---

## 16. FUTURE SCOPE
1. **Video Conferencing Integration:** WebRTC peer-to-peer integrated audio/video directly within the browser.
2. **Automated Skill Quiz Assessments:** Objective MCQ quizzes to auto-verify beginner skills prior to admin audit.
3. **Calendar Integration:** Google Calendar / iCal synchronization for scheduled study sessions.
4. **Mobile Application:** Native Flutter / React Native client for Android and iOS devices.

---

## 17. CONCLUSION
The **Student Skill Exchange Platform** successfully demonstrates how modern web architectures can revitalize campus peer learning. By eliminating monetary barriers, integrating an explainable matching algorithm, and enforcing quality through administrative skill audits and peer feedback loops, the platform empowers college students to teach what they know and master what they desire.
