# DATABASE MAP — Student Skill Exchange Platform

---

## 1. Database Architecture Overview

The system incorporates three database/persistence paradigms:
1. **Primary Cloud Relational Database**: **Supabase PostgreSQL** (`supabase_schema.sql`, 18 tables, project: `https://qfokonidfrpkunkuivwo.supabase.co`).
2. **Academic Mini-Project Relational Schema**: **MySQL 8.0+ / H2 In-Memory** (`DATABASE_SETUP.sql`, 14 tables, `skill_exchange_db`, mapped through Hibernate / Spring Data JPA entities).
3. **Active Node.js In-Memory State Cache**: **Runtime JSON Object Engine** (`server.js:state`, 18 core collections synchronized bidirectionally with Supabase via `supabaseService.js`).

---

## 2. Exhaustive Table Specifications (Supabase PostgreSQL / MySQL)

### 1. `users`
- **Purpose**: System credentials, role-based authorization, and account activation state.
- **Columns**:
  - `id` (BIGINT / BIGSERIAL): **Primary Key**, Auto-incrementing unique identifier.
  - `email` (TEXT / VARCHAR(100)): **Unique**, Not Null. Restricts to `@mgmmumbai.ac.in` (except Super Admin exceptions).
  - `password` (TEXT / VARCHAR(255)): Not Null. Encrypted with BCrypt (or random token for Firebase logins).
  - `role` (TEXT / VARCHAR(30)): Not Null. Default `'ROLE_STUDENT'`. Values: `'ROLE_STUDENT'`, `'ROLE_ADMIN'`, `'ROLE_SUPER_ADMIN'`.
  - `active` (BOOLEAN): Not Null. Default `TRUE`. Controls user suspension/ban status.
  - `email_verified` (BOOLEAN): Not Null. Default `TRUE` (in seed) / `FALSE` on registration until 6-digit OTP verification.
  - `has_seen_landing` (BOOLEAN): Default `TRUE`. Tracks whether student has completed landing walkthrough.
  - `created_at` (TIMESTAMPTZ / TIMESTAMP): Default `CURRENT_TIMESTAMP`.
- **Foreign Keys**: None.
- **Referenced By**: `student_profiles.user_id`, `user_teaching_skills.user_id`, `user_learning_skills.user_id`, `projects.student_id`, `experiences.student_id`, `exchange_requests.sender_id/receiver_id`, `exchanges.student1_id/student2_id`, `messages.sender_id/receiver_id`, `notifications.recipient_id`, `skill_verifications.student_id`, `reviews.reviewer_id/reviewed_student_id`, `reports.reporter_id/reported_user_id`, `blocked_users.blocker_id/blocked_id`.
- **RLS Policy**: Enabled. `FOR ALL USING (true) WITH CHECK (true)`.

---

### 2. `student_profiles`
- **Purpose**: Academic persona, college metadata, verified status, and live peer rating.
- **Columns**:
  - `id` (BIGINT / BIGSERIAL): **Primary Key**.
  - `user_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE), **Unique**.
  - `full_name` (TEXT / VARCHAR(100)): Not Null.
  - `email` (TEXT / VARCHAR(100)): Not Null.
  - `college` (TEXT / VARCHAR(150)): Not Null. e.g., `'College of Engineering & Technology'`.
  - `department` (TEXT / VARCHAR(100)): Not Null. e.g., `'Information Technology'`, `'Computer Science'`.
  - `year_of_study` (TEXT / VARCHAR(20)): Not Null. e.g., `'1st Year'`, `'2nd Year'`, `'3rd Year'`, `'Final Year'`.
  - `phone` (TEXT / VARCHAR(20)): Nullable.
  - `bio` (TEXT): Nullable.
  - `avatar_url` (TEXT / VARCHAR(500)): Nullable. Points to DiceBear SVG URL or `uploads/avatars/`.
  - `is_verified` (BOOLEAN): Not Null. Default `FALSE`. Toggled true when skill proof is approved.
  - `average_rating` (NUMERIC(3,2) / DOUBLE): Not Null. Default `0.00` (computed dynamically from `reviews`).
  - `completed_exchanges_count` (INT): Not Null. Default `0`.
  - `is_blocked` (BOOLEAN): Not Null. Default `FALSE`.
- **Relationships**: 1-to-1 with `users`.
- **RLS Policy**: Enabled. `FOR ALL USING (true) WITH CHECK (true)`.

---

### 3. `skill_categories`
- **Purpose**: High-level classification taxonomy for organizing academic and technical skills.
- **Columns**:
  - `id` (BIGINT / BIGSERIAL): **Primary Key**.
  - `name` (TEXT / VARCHAR(80)): **Unique**, Not Null. e.g., `'Programming'`, `'Design'`.
  - `description` (TEXT / VARCHAR(255)): Nullable.
  - `icon` (TEXT / VARCHAR(50)): Nullable. Bootstrap icon CSS class (e.g., `'bi-code-slash'`).
- **Referenced By**: `skills.category_id`.
- **RLS Policy**: Enabled. `FOR ALL USING (true) WITH CHECK (true)`.

---

### 4. `skills`
- **Purpose**: Centralized dictionary of exchangeable skills across campus.
- **Columns**:
  - `id` (BIGINT / BIGSERIAL): **Primary Key**.
  - `name` (TEXT / VARCHAR(100)): **Unique**, Not Null. e.g., `'Java'`, `'Python'`, `'Photoshop'`.
  - `category_id` (BIGINT): **Foreign Key** (`skill_categories.id` ON DELETE CASCADE), Not Null.
  - `category_name` (TEXT): Denormalized category name for efficient rendering.
  - `description` (TEXT / VARCHAR(500)): Nullable.
- **Referenced By**: `user_teaching_skills.skill_id`, `user_learning_skills.skill_id`, `exchange_requests.skill_offered_id/skill_requested_id`, `exchanges.skill1_id/skill2_id`, `skill_verifications.skill_id`.
- **RLS Policy**: Enabled. `FOR ALL USING (true) WITH CHECK (true)`.

---

### 5. `user_teaching_skills`
- **Purpose**: Skills a student is proficient in and willing to barter to peers.
- **Columns**:
  - `id` (BIGINT / BIGSERIAL): **Primary Key**.
  - `user_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE), Not Null.
  - `skill_id` (BIGINT): **Foreign Key** (`skills.id` ON DELETE CASCADE), Not Null.
  - `skill_name` (TEXT): Denormalized skill title.
  - `category_id` (BIGINT): Category reference.
  - `category_name` (TEXT): Category label.
  - `proficiency_level` (TEXT / VARCHAR(30)): Default `'Intermediate'`. Values: `'Beginner'`, `'Intermediate'`, `'Advanced'`, `'Expert'`.
  - `is_verified` (BOOLEAN): Default `FALSE`. True when admin awards badge.
  - `verification_status` (TEXT): Default `'NOT_VERIFIED'`. Values: `'NOT_VERIFIED'`, `'PENDING'`, `'VERIFIED'`, `'NEEDS_RESUBMISSION'`, `'REJECTED'`.
  - `proof_document_url` (TEXT / VARCHAR(500)): Nullable. Filesystem path to certificate.
  - `verification_notes` (TEXT / VARCHAR(500)): Nullable.
- **Constraints**: `UNIQUE (user_id, skill_id)`. Prevents duplicate teaching listings per student.
- **RLS Policy**: Enabled. `FOR ALL USING (true) WITH CHECK (true)`.

---

### 6. `user_learning_skills`
- **Purpose**: Competencies a student is actively seeking to acquire from peers.
- **Columns**:
  - `id` (BIGINT / BIGSERIAL): **Primary Key**.
  - `user_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE), Not Null.
  - `skill_id` (BIGINT): **Foreign Key** (`skills.id` ON DELETE CASCADE), Not Null.
  - `skill_name` (TEXT): Denormalized skill name.
  - `category_id` (BIGINT): Category identifier.
  - `category_name` (TEXT): Category name.
  - `urgency_level` (TEXT / VARCHAR(30)): Default `'Medium'`. Values: `'Low'`, `'Medium'`, `'High'`.
  - `notes` (TEXT / VARCHAR(500)): Nullable.
- **Constraints**: `UNIQUE (user_id, skill_id)`.
- **RLS Policy**: Enabled. `FOR ALL USING (true) WITH CHECK (true)`.

---

### 7. `projects`
- **Purpose**: Showcase of student software, design, or engineering work proving proficiency.
- **Columns**:
  - `id` (BIGINT / BIGSERIAL): **Primary Key**.
  - `student_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE), Not Null.
  - `title` (TEXT): Not Null.
  - `description` (TEXT): Nullable.
  - `technologies` (TEXT): Comma-separated tech stack.
  - `link` (TEXT): GitHub, Behance, or live deployment URL.
  - `proof_url` (TEXT): Uploaded screenshot or architecture diagram.
- **RLS Policy**: Enabled. `FOR ALL USING (true) WITH CHECK (true)`.

---

### 8. `experiences`
- **Purpose**: Chronological timeline of technical clubs, campus mentorship, or teaching assistantships.
- **Columns**:
  - `id` (BIGINT / BIGSERIAL): **Primary Key**.
  - `student_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE), Not Null.
  - `title` (TEXT): Not Null.
  - `organization` (TEXT): Not Null. e.g., `'MGM Coding Club'`.
  - `description` (TEXT): Nullable.
  - `duration` (TEXT): e.g., `'1 Year'`.
  - `start_date` (TEXT): e.g., `'2025-01-10'`.
  - `end_date` (TEXT): e.g., `'Present'`.
  - `is_current` (BOOLEAN): Default `FALSE`.
- **RLS Policy**: Enabled. `FOR ALL USING (true) WITH CHECK (true)`.

---

### 9. `exchange_requests`
- **Purpose**: Formal bilateral skill barter proposals sent between two students.
- **Columns**:
  - `id` (BIGINT / BIGSERIAL): **Primary Key**.
  - `sender_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE), Not Null.
  - `sender_name` (TEXT): Denormalized student full name.
  - `sender_email` (TEXT): Sender college email.
  - `receiver_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE), Not Null.
  - `receiver_name` (TEXT): Receiver name.
  - `skill_offered_id` (BIGINT): **Foreign Key** (`skills.id` ON DELETE CASCADE), Not Null.
  - `skill_offered_name` (TEXT): Title of skill being taught by sender.
  - `skill_requested_id` (BIGINT): **Foreign Key** (`skills.id` ON DELETE CASCADE), Not Null.
  - `skill_requested_name` (TEXT): Title of skill sender wants to learn.
  - `message` (TEXT): Initial proposal note explaining availability and goals.
  - `learning_mode` (TEXT / VARCHAR(30)): Default `'ONLINE'`. Values: `'ONLINE'`, `'OFFLINE'`, `'CHAT'`.
  - `status` (TEXT / VARCHAR(30)): Default `'PENDING'`. Values: `'PENDING'`, `'ACCEPTED'`, `'REJECTED'`, `'COMPLETED'`.
  - `created_at` (TIMESTAMPTZ / TIMESTAMP): Default `NOW()`.
  - `updated_at` (TIMESTAMPTZ / TIMESTAMP): Default `NOW()`.
- **Referenced By**: `exchanges.request_id`.
- **RLS Policy**: Enabled. `FOR ALL USING (true) WITH CHECK (true)`.

---

### 10. `exchanges`
- **Purpose**: Active or finalized binding barter contracts between two students.
- **Columns**:
  - `id` (BIGINT / BIGSERIAL): **Primary Key**.
  - `request_id` (BIGINT): **Foreign Key** (`exchange_requests.id` ON DELETE CASCADE), **Unique**.
  - `student1_id` / `user_a_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE).
  - `student1_name` / `user_a_name` (TEXT): Participant 1 name.
  - `student2_id` / `user_b_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE).
  - `student2_name` / `user_b_name` (TEXT): Participant 2 name.
  - `skill1_id` (BIGINT): Skill offered by Participant 1.
  - `skill1_name` / `skill_offered_title` (TEXT):
  - `skill2_id` (BIGINT): Skill offered by Participant 2.
  - `skill2_name` / `skill_requested_title` (TEXT):
  - `learning_mode` (TEXT / VARCHAR(30)): Not Null. `'ONLINE'`, `'OFFLINE'`, `'CHAT'`.
  - `status` (TEXT / VARCHAR(30)): Default `'ACTIVE'`. Values: `'ACTIVE'`, `'COMPLETED'`, `'CANCELLED'`.
  - `start_date` (TIMESTAMPTZ / TIMESTAMP): Default `NOW()`.
  - `completion_date` (TIMESTAMPTZ / TIMESTAMP): Nullable.
- **Referenced By**: `reviews.exchange_id`.
- **RLS Policy**: Enabled. `FOR ALL USING (true) WITH CHECK (true)`.

---

### 11. `messages`
- **Purpose**: Peer-to-peer chat messages, delivery timestamps, read receipts, and attachments.
- **Columns**:
  - `id` (BIGINT / BIGSERIAL): **Primary Key**.
  - `sender_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE), Not Null.
  - `sender_name` (TEXT):
  - `receiver_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE), Not Null.
  - `receiver_name` (TEXT):
  - `message_text` (TEXT): Not Null.
  - `sent_at` (TIMESTAMPTZ / TIMESTAMP): Default `NOW()`.
  - `delivered_at` (TIMESTAMPTZ): Delivery timestamp.
  - `seen_at` (TIMESTAMPTZ): Read receipt timestamp.
  - `status` (TEXT): `'SENT'`, `'DELIVERED'`, `'SEEN'`.
  - `is_read` (BOOLEAN): Default `FALSE`.
  - `attachment_url` (TEXT): Path in `uploads/chat/`.
  - `attachment_type` (TEXT): `'image'`, `'document'`.
  - `attachment_name` (TEXT): Original file name.
  - `attachment_size` (BIGINT): Size in bytes.
  - `reply_to` (JSONB): Optional quoted parent message object.
- **RLS Policy**: Enabled. `FOR ALL USING (true) WITH CHECK (true)`.

---

### 12. `notifications`
- **Purpose**: Event-driven alerts (proposals, chat messages, badge awards, system announcements).
- **Columns**:
  - `id` (BIGINT / BIGSERIAL): **Primary Key**.
  - `recipient_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE), Not Null.
  - `title` (TEXT / VARCHAR(100)): Not Null.
  - `message` (TEXT / VARCHAR(500)): Not Null.
  - `type` (TEXT / VARCHAR(40)): Values: `'INFO'`, `'EXCHANGE_REQUEST'`, `'NEW_MESSAGE'`, `'SKILL_VERIFICATION_APPROVED'`, `'SKILL_VERIFICATION_REJECTED'`, `'SYSTEM_ANNOUNCEMENT'`.
  - `is_read` (BOOLEAN): Default `FALSE`.
  - `created_at` (TIMESTAMPTZ / TIMESTAMP): Default `NOW()`.
- **RLS Policy**: Enabled. `FOR ALL USING (true) WITH CHECK (true)`.

---

### 13. `skill_verifications`
- **Purpose**: Administrative audit queue for student skill verification documents.
- **Columns**:
  - `id` (BIGINT / BIGSERIAL): **Primary Key**.
  - `student_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE), Not Null.
  - `student_name` (TEXT):
  - `student_email` (TEXT):
  - `skill_id` (BIGINT): **Foreign Key** (`skills.id` ON DELETE CASCADE), Not Null.
  - `skill_name` (TEXT):
  - `certificate_name` (TEXT): Name of certificate (e.g., `'Oracle Certified Java'`).
  - `certificate_url` (TEXT): Path in `uploads/certificates/`.
  - `project_title` (TEXT):
  - `project_description` (TEXT):
  - `project_technologies` (TEXT):
  - `project_link` (TEXT): GitHub / portfolio link.
  - `project_proof_url` (TEXT): Screenshot path in `uploads/proofs/`.
  - `experience_title` (TEXT):
  - `experience_organization` (TEXT):
  - `experience_description` (TEXT):
  - `experience_duration` (TEXT):
  - `experience_start_date` (TEXT):
  - `experience_end_date` (TEXT):
  - `status` (TEXT / VARCHAR(30)): Default `'PENDING'`. Values: `'PENDING'`, `'VERIFIED'`, `'NEEDS_RESUBMISSION'`, `'REJECTED'`.
  - `admin_comment` (TEXT): Review feedback from staff auditor.
  - `submission_date` (TIMESTAMPTZ / TIMESTAMP): Default `NOW()`.
  - `reviewed_date` (TIMESTAMPTZ / TIMESTAMP): Nullable.
- **RLS Policy**: Enabled. `FOR ALL USING (true) WITH CHECK (true)`.

---

### 14. `reviews` (in MySQL: `ratings_reviews`)
- **Purpose**: Post-exchange 1–5 star peer rating and feedback preventing duplicate reviews.
- **Columns**:
  - `id` (BIGINT / BIGSERIAL): **Primary Key**.
  - `exchange_id` (BIGINT): **Foreign Key** (`exchanges.id` ON DELETE CASCADE), Not Null.
  - `reviewer_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE), Not Null.
  - `reviewer_name` (TEXT):
  - `reviewed_student_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE), Not Null.
  - `reviewed_student_name` (TEXT):
  - `rating` (INT): Not Null. Checked `BETWEEN 1 AND 5`.
  - `comment` (TEXT): Detailed written feedback.
  - `created_at` (TIMESTAMPTZ / TIMESTAMP): Default `NOW()`.
- **Constraints**: `UNIQUE (exchange_id, reviewer_id)`. Strictly enforces maximum of ONE review per student per completed trade.
- **RLS Policy**: Enabled. `FOR ALL USING (true) WITH CHECK (true)`.

---

### 15. `reports`
- **Purpose**: Grievance management for reporting misconduct, fake skills, or incomplete barters.
- **Columns**:
  - `id` (BIGINT / BIGSERIAL): **Primary Key**.
  - `reporter_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE), Not Null.
  - `reported_user_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE), Not Null.
  - `reported_entity` (TEXT): `'USER'`, `'SKILL'`, `'REVIEW'`.
  - `reason` (TEXT / VARCHAR(50)): Summary reason.
  - `category` (TEXT): e.g., `'Fake Profile'`, `'Incomplete Barter'`, `'Harassment'`.
  - `description` (TEXT): Detailed statement.
  - `evidence` (TEXT): Screenshot timestamp or excerpt.
  - `status` (TEXT / VARCHAR(30)): Default `'OPEN'`. Values: `'OPEN'`, `'INVESTIGATING'`, `'RESOLVED'`, `'DISMISSED'`.
  - `priority` (TEXT): `'LOW'`, `'MEDIUM'`, `'HIGH'`.
  - `admin_notes` (TEXT): Moderator resolution log.
  - `created_at` (TIMESTAMPTZ / TIMESTAMP): Default `NOW()`.
- **RLS Policy**: Enabled. `FOR ALL USING (true) WITH CHECK (true)`.

---

### 16. `blocked_users`
- **Purpose**: Mutual blocking table preventing harassment, matching, and chat interaction.
- **Columns**:
  - `id` (BIGINT / BIGSERIAL): **Primary Key**.
  - `blocker_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE), Not Null.
  - `blocked_id` (BIGINT): **Foreign Key** (`users.id` ON DELETE CASCADE), Not Null.
  - `blocked_at` (TIMESTAMPTZ / TIMESTAMP): Default `NOW()`.
- **Constraints**: `UNIQUE (blocker_id, blocked_id)`.
- **RLS Policy**: Enabled. `FOR ALL USING (true) WITH CHECK (true)`.

---

### 17. `audit_logs`
- **Purpose**: Immutable security audit trail recording all privileged operations.
- **Columns**:
  - `id` (BIGINT / BIGSERIAL): **Primary Key**.
  - `action` (TEXT): Not Null. Values: `'ROLE_CHANGE'`, `'USER_SUSPENDED'`, `'USER_ACTIVATED'`, `'SKILL_VERIFICATION_APPROVED'`, `'KITAB_LISTING_MODERATED'`, `'SETTINGS_UPDATED'`.
  - `performed_by` (TEXT): Email of acting administrator or user.
  - `target` (TEXT): Target user email or entity ID.
  - `timestamp` (TIMESTAMPTZ / TIMESTAMP): Default `NOW()`.
  - `details` (TEXT): Human-readable justification and delta.
- **RLS Policy**: Enabled. `FOR ALL USING (true) WITH CHECK (true)`.

---

### 18. `otps`
- **Purpose**: Ephemeral store for 6-digit cryptographic registration and password reset tokens.
- **Columns**:
  - `id` (BIGINT / BIGSERIAL): **Primary Key**.
  - `email` (TEXT): Not Null.
  - `otp_hash` (TEXT): SHA-256 hash of the 6-digit PIN.
  - `expires_at` (TIMESTAMPTZ): Timestamp (10 mins for registration, 15 mins for password reset).
  - `purpose` (TEXT): `'VERIFY'`, `'PASSWORD_RESET'`.
  - `created_at` (TIMESTAMPTZ): Default `NOW()`.
- **RLS Policy**: Enabled. `FOR ALL USING (true) WITH CHECK (true)`.

---

## 3. Node.js In-Memory State Collections (Exclusive to `server.js`)

In addition to the tables above, `server.js` maintains the following extended collections in memory:
1. `state.offlineProgress`: Tracks milestones for offline campus learning (location, stage, percentage, overdue indicator).
2. `state.offlineUpdates`: Individual log entries for offline sessions (topics covered, homework, dates).
3. `state.onlineSessions`: Zoom meeting records (meeting ID, join URL, passcode, schedule time, duration).
4. `state.exchangeNotes`: Collaborative notes, study guides, and student doubts shared during an exchange.
5. `state.kitabBhandar`: Textbook and physical notes barter hub inventory (book title, author, condition, barter request, status).
6. `state.announcements`: Campus-wide broadcast messages from administrators.
7. `state.settings`: Platform-wide configurations (allowed college domain `@mgmmumbai.ac.in`, project proof requirements, max concurrent active trades).
8. `state.admins`: Roster of administrative staff with specific permission tiers (`SUPER_ADMIN`, `ADMIN`, `MODERATOR`, `SUPPORT_ADMIN`).
9. `state.profiles[i].membership`: Free trial tracking (30-day countdown, start/end dates) and Pro Scholar annual/monthly subscription metadata.

---

## 4. Entity-Relationship Overview

```
USERS (1)
  ├── (1:1) ── STUDENT_PROFILES
  ├── (1:M) ── USER_TEACHING_SKILLS ── (M:1) ── SKILLS ── (M:1) ── SKILL_CATEGORIES
  ├── (1:M) ── USER_LEARNING_SKILLS ── (M:1) ── SKILLS
  ├── (1:M) ── PROJECTS
  ├── (1:M) ── EXPERIENCES
  ├── (1:M) ── SKILL_VERIFICATIONS ── (M:1) ── SKILLS
  ├── (1:M) ── EXCHANGE_REQUESTS (sender/receiver)
  │              └── (1:1) ── EXCHANGES
  │                             ├── (1:M) ── RATINGS_REVIEWS (evaluated by peers)
  │                             ├── (1:M) ── ONLINE_SESSIONS (Zoom links)
  │                             ├── (1:1) ── OFFLINE_EXCHANGE_PROGRESS
  │                             │              └── (1:M) ── OFFLINE_PROGRESS_UPDATES
  │                             └── (1:M) ── EXCHANGE_NOTES (shared doubts & study notes)
  ├── (1:M) ── MESSAGES (sender/receiver)
  ├── (1:M) ── NOTIFICATIONS (recipient)
  ├── (1:M) ── REPORTS (reporter/reported)
  ├── (1:M) ── BLOCKED_USERS (blocker/blocked)
  └── (1:M) ── KITAB_BHANDAR (book owners)
```

---

## 5. Storage Directory Mapping

| Directory Path | Content Type | Uploading Endpoint | Access Restriction |
| :--- | :--- | :--- | :--- |
| `src/main/resources/static/uploads/avatars/` | JPG, PNG, WEBP, GIF (Profile avatars) | `POST /api/upload`, `POST /api/students/avatar` | **Public** |
| `src/main/resources/static/uploads/chat/` | Images (PNG/JPG), Documents (PDF/DOCX/TXT/ZIP) | `POST /api/messages/attachment`, `POST /api/upload` | **Authenticated Students** |
| `src/main/resources/static/uploads/certificates/` | PDF certificates, diplomas | `POST /api/upload`, `POST /api/verifications` | **Private** (Owner, Exchange Partner, Staff Admin only) |
| `src/main/resources/static/uploads/proofs/` | Project screenshots, code proof | `POST /api/upload`, `POST /api/verifications` | **Private** (Owner, Exchange Partner, Staff Admin only) |
| `src/main/resources/static/uploads/verifications/` | Skill audit proof archives | Spring Boot `app.upload.dir` | **Private** (Admin and Owner only) |
