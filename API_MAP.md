# API INVENTORY & REST CONTRACT MAP — Student Skill Exchange Platform

---

## 1. Authentication & Account Security APIs

| Method | Endpoint | Purpose | Auth Required | Role Required | Request Payload | Response Data | Backend Handler | Database / State Entity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/auth/current-user` | Returns active authenticated session details | Optional (returns null if unauthenticated) | Any | None | `{ success: true, data: { authenticated, userId, email, role, fullName, avatarUrl, hasSeenLanding } }` | `server.js:L1573` / `AuthController.java:getCurrentUser` | `state.currentUser`, `state.profiles`, `state.users` |
| `POST` | `/api/auth/seen-landing` | Marks landing page as seen for returning visitor | Optional | Any | None | `{ success: true, message: "Landing page marked as seen." }` | `server.js:L1588` | `state.users`, Supabase `users.has_seen_landing` |
| `POST` | `/api/auth/login` | Authenticates user credentials via email/password | No | Public | `{ email: string, password: string }` | `{ success: true, message: "Login successful", data: UserSession }` | `server.js:L1600` / `AuthController.java:login` | `state.users`, `state.profiles`, `audit_logs` |
| `POST` | `/api/auth/firebase-login` | 1-Click Google OAuth session synchronization | No | Public | `{ email: string, fullName: string, photoURL: string, uid: string, idToken: string }` | `{ success: true, message: "Firebase login successful", data: UserSession }` | `server.js:L1656` | `state.users`, `state.profiles`, `audit_logs`, Supabase `users` |
| `POST` | `/api/auth/logout` | Terminates active user session and clears cookie | Yes | Authenticated | None | `{ success: true, message: "Logged out successfully" }` | `server.js:L1762` / `AuthController.java:logout` | `state.currentUser = null`, `audit_logs` |
| `POST` | `/api/auth/register` | Registers new student, validates college email, generates OTP | No | Public | `{ fullName, email, password, college?, department, yearOfStudy, phone? }` | `{ success: true, message: "Registration initiated. Verification OTP sent.", email }` | `server.js:L1777` / `AuthController.java:register` | `state.otps`, `state.users`, `state.profiles`, SMTP Gmail Service |
| `POST` | `/api/auth/verify-email` | Validates 6-digit cryptographic OTP and activates account | No | Public | `{ email: string, otp: string }` | `{ success: true, message: "Email verified successfully.", user }` | `server.js:L1885` / `AuthController.java:verifyEmail` | `state.otps`, `state.users`, `state.profiles`, Supabase `users` |
| `POST` | `/api/auth/resend-otp` | Generates fresh OTP code with expiration reset | No | Public | `{ email: string }` | `{ success: true, message: "New verification code sent." }` | `server.js:L1948` / `AuthController.java:resendOtp` | `state.otps`, SMTP Gmail Service |
| `POST` | `/api/auth/forgot-password` | Dispatches 6-digit password reset OTP to student inbox | No | Public | `{ email: string }` | `{ success: true, message: "Password reset OTP sent." }` | `server.js:L2000` / `AuthController.java:forgotPassword` | `state.otps`, `state.users`, SMTP Gmail Service |
| `POST` | `/api/auth/reset-password` | Verifies reset code and updates student account password | No | Public | `{ email: string, otp: string, newPassword: string }` | `{ success: true, message: "Password updated successfully." }` | `server.js:L2040` / `AuthController.java:resetPassword` | `state.users`, `state.otps`, Supabase `users` |

---

## 2. Platform Statistics & File Upload APIs

| Method | Endpoint | Purpose | Auth Required | Role Required | Request Payload | Response Data | Backend Handler | Database / Storage Entity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/stats` | Aggregated platform counter KPIs for home hero | No | Public | None | `{ success: true, data: { totalStudents, totalSkills, totalExchanges, totalReviews, satisfactionRate } }` | `server.js:L2098` | `state.users`, `state.skills`, `state.exchanges`, `state.reviews` |
| `POST` | `/api/upload` | Base64 file uploader with extension whitelist (15MB limit) | Optional | Authenticated / Public | `{ fileName: string, fileData: string (base64), folder: 'chat'\|'avatars'\|'proofs' }` | `{ success: true, url: string, fileName, fileSize, formattedSize, fileType }` | `server.js:L2118` / `app.upload.dir` | Filesystem: `src/main/resources/static/uploads/{folder}/` |

---

## 3. Student Profiles, Skills & Portfolio APIs

| Method | Endpoint | Purpose | Auth Required | Role Required | Request Payload | Response Data | Backend Handler | Database / State Entity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/students` | Returns all active, unblocked student directory cards | No | Public | None | `{ success: true, data: Array<StudentProfile> }` | `server.js:L2182` / `StudentController.java:getAll` | `state.profiles` (filter `!p.blocked`) |
| `GET` | `/api/students/profile/me` | Fetches active authenticated student's full profile | Yes | Authenticated | None | `{ success: true, data: StudentProfile }` | `server.js:L2186` / `StudentController.java:getMyProfile` | `state.profiles`, `user_teaching_skills`, `user_learning_skills` |
| `POST` | `/api/students/avatar` | Updates custom profile photo or DiceBear avatar URL | Yes | Authenticated | `{ avatarUrl: string }` | `{ success: true, avatarUrl: string }` | `server.js:L2192` / `StudentController.java:updateAvatar` | `state.profiles`, Supabase `student_profiles` |
| `DELETE` | `/api/students/avatar` | Resets avatar to default generated DiceBear robot | Yes | Authenticated | None | `{ success: true, avatarUrl: string }` | `server.js:L2246` / `StudentController.java:resetAvatar` | `state.profiles`, Supabase `student_profiles` |
| `GET` | `/api/students/:id` | Returns public profile of specified student | No | Public | Query: `:id` (userId) | `{ success: true, data: StudentProfile }` | `server.js:L2261` / `StudentController.java:getById` | `state.profiles` |
| `PUT` | `/api/students/:id` | Modifies student bio, phone, college, department | Yes | Owner / Admin | `{ fullName?, college?, department?, yearOfStudy?, phone?, bio? }` | `{ success: true, data: StudentProfile }` | `server.js:L2268` / `StudentController.java:updateProfile` | `state.profiles`, Supabase `student_profiles` |
| `GET` | `/api/students/:id/projects` | Retrieves portfolio projects of specified student | No | Public | Query: `:id` (studentId) | `{ success: true, data: Array<Project> }` | `server.js:L2286` | `state.projects` |
| `POST` | `/api/students/projects` | Adds new portfolio project with repository / demo link | Yes | Authenticated | `{ title, description, technologies, link, proofUrl? }` | `{ success: true, data: Project }` | `server.js:L2292` | `state.projects`, Supabase `projects` |
| `DELETE` | `/api/students/projects/:id` | Removes portfolio project from student showcase | Yes | Owner / Admin | Path: `:id` (projectId) | `{ success: true, message: "Project deleted" }` | `server.js:L2321` | `state.projects`, Supabase `projects` |
| `GET` | `/api/students/:id/experiences` | Lists work / club / tutoring experiences of student | No | Public | Query: `:id` (studentId) | `{ success: true, data: Array<Experience> }` | `server.js:L2334` | `state.experiences` |
| `POST` | `/api/students/experiences` | Adds work or mentorship experience item | Yes | Authenticated | `{ title, organization, description, duration, startDate?, endDate?, isCurrent? }` | `{ success: true, data: Experience }` | `server.js:L2340` | `state.experiences`, Supabase `experiences` |
| `DELETE` | `/api/students/experiences/:id` | Deletes experience record from student profile | Yes | Owner / Admin | Path: `:id` (experienceId) | `{ success: true, message: "Experience deleted" }` | `server.js:L2370` | `state.experiences`, Supabase `experiences` |
| `POST` | `/api/students/block` | Blocks peer to prevent proposals and direct messages | Yes | Authenticated | `{ blockedUserId: number }` | `{ success: true, message: "User blocked" }` | `server.js:L2383` / `ReportBlockController.java:blockUser` | `state.blockedUsers`, Supabase `blocked_users` |
| `POST` | `/api/students/unblock` | Unblocks previously restricted peer user | Yes | Authenticated | `{ blockedUserId: number }` | `{ success: true, message: "User unblocked" }` | `server.js:L2402` / `ReportBlockController.java:unblockUser` | `state.blockedUsers`, Supabase `blocked_users` |
| `GET` | `/api/students/blocked` | Returns list of user IDs blocked by active student | Yes | Authenticated | None | `{ success: true, data: Array<number> }` | `server.js:L2411` | `state.blockedUsers` |
| `POST` | `/api/students/skills/teach` | Declares skill student can teach with proficiency level | Yes | Authenticated | Query: `?skillId=X&proficiency=Y` | `{ success: true, data: TeachingSkill }` | `server.js:L2419` / `StudentController.java:addTeachingSkill` | `user_teaching_skills`, Supabase `user_teaching_skills` |
| `DELETE` | `/api/students/skills/teach/:id` | Removes declared teaching skill from student portfolio | Yes | Authenticated | Path: `:id` (skillId) | `{ success: true, message: "Skill removed" }` | `server.js:L2443` / `StudentController.java:removeTeachingSkill` | `user_teaching_skills`, Supabase `user_teaching_skills` |
| `POST` | `/api/students/skills/learn` | Declares skill student desires with urgency level | Yes | Authenticated | Query: `?skillId=X&urgency=Y` | `{ success: true, data: LearningSkill }` | `server.js:L2454` / `StudentController.java:addLearningSkill` | `user_learning_skills`, Supabase `user_learning_skills` |
| `DELETE` | `/api/students/skills/learn/:id` | Removes desired learning skill from student profile | Yes | Authenticated | Path: `:id` (skillId) | `{ success: true, message: "Skill removed" }` | `server.js:L2476` / `StudentController.java:removeLearningSkill` | `user_learning_skills`, Supabase `user_learning_skills` |
| `GET` | `/api/skills/categories` | Lists all skill taxonomy categories with count | No | Public | None | `{ success: true, data: Array<SkillCategory> }` | `server.js:L2487` / `SkillController.java:getCategories` | `state.categories`, `state.skills` |
| `GET` | `/api/skills` | Returns complete taxonomy catalogue of skills | No | Public | None | `{ success: true, data: Array<Skill> }` | `server.js:L2495` / `SkillController.java:getAllSkills` | `state.skills` |
| `POST` | `/api/skills` | Suggests or creates new skill in taxonomy | Yes | Authenticated | `{ name: string, categoryId: number, description?: string }` | `{ success: true, data: Skill }` | `server.js:L2499` / `SkillController.java:createSkill` | `state.skills`, Supabase `skills` |

---

## 4. Heuristic Matchmaking & Barter Exchange APIs

| Method | Endpoint | Purpose | Auth Required | Role Required | Request Payload | Response Data | Backend Handler | Database / State Entity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/matches` | Evaluates compatibility using explainable 5-factor formula | Yes | Authenticated | None | `{ success: true, data: Array<MatchCandidate> }` | `server.js:L2514` / `MatchingController.java:getMatches` | `state.profiles`, `user_teaching_skills`, `user_learning_skills`, `reviews` |
| `GET` | `/api/exchange-requests` | Retrieves sent and received exchange proposals | Yes | Authenticated | None | `{ success: true, data: Array<ExchangeRequest> }` | `server.js:L2615` / `ExchangeRequestController.java:getRequests` | `state.requests` |
| `GET` | `/api/exchange-requests/:id` | Fetches proposal details and related session status | Yes | Participant / Admin | Path: `:id` | `{ success: true, data: ExchangeRequestDetails }` | `server.js:L2635` | `state.requests`, `state.profiles`, `state.onlineSessions`, `state.offlineProgress` |
| `GET` | `/api/exchange-requests/pending` | Returns incoming unreviewed barter proposals | Yes | Authenticated | None | `{ success: true, data: Array<ExchangeRequest> }` | `server.js:L2859` | `state.requests` (filter `receiverId && status === 'PENDING'`) |
| `POST` | `/api/exchange-requests` | Proposes barter swap offering skill A for skill B | Yes | Authenticated | `{ receiverId, skillOfferedId, skillRequestedId, learningMode, message }` | `{ success: true, data: ExchangeRequest }` | `server.js:L2872` / `ExchangeRequestController.java:create` | `state.requests`, `notifications`, Supabase `exchange_requests` |
| `PUT` | `/api/exchange-requests/:id/accept` | Accepts proposal, establishes trade contract, creates session | Yes | Receiver | Path: `:id` | `{ success: true, data: ExchangeContract }` | `server.js:L2940` / `ExchangeRequestController.java:accept` | `state.requests`, `state.exchanges`, `state.onlineSessions`, `state.offlineProgress`, `notifications` |
| `PUT` | `/api/exchange-requests/:id/reject` | Rejects proposal with optional reason note | Yes | Receiver | Path: `:id`, Body: `{ reason?: string }` | `{ success: true, message: "Proposal rejected" }` | `server.js:L3017` / `ExchangeRequestController.java:reject` | `state.requests`, `notifications`, Supabase `exchange_requests` |
| `PUT` | `/api/exchange-requests/:id/complete` | Marks barter exchange as successfully concluded | Yes | Participant | Path: `:id` | `{ success: true, data: CompletedExchange }` | `server.js:L3027` / `ExchangeRequestController.java:complete` | `state.requests`, `state.exchanges`, `student_profiles.completedExchangesCount` |
| `GET` | `/api/exchanges` | Lists active/completed barter contracts | Yes | Authenticated | None | `{ success: true, data: Array<Exchange> }` | `server.js:L3054` | `state.exchanges` |
| `GET` | `/api/exchange-requests/history` | Filterable archive of student's completed/past trades | Yes | Authenticated | Query: `?status=COMPLETED` | `{ success: true, data: Array<ExchangeHistoryItem> }` | `server.js:L3058` | `state.exchanges`, `state.requests`, `reviews` |

---

## 5. Offline Campus Exchanges & Milestone Progress APIs

| Method | Endpoint | Purpose | Auth Required | Role Required | Request Payload | Response Data | Backend Handler | Database / State Entity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/offline-exchanges` | Lists offline campus exchanges with stage/progress | Yes | Authenticated / Admin | Query: `?status=ACTIVE` | `{ success: true, data: Array<OfflineProgress> }` | `server.js:L3101` / `OfflineExchangeProgressController.java` | `state.offlineProgress`, `state.offlineUpdates` |
| `GET` | `/api/offline-exchanges/metrics` | Calculates campus offline stats (Active, overdue, completed) | Yes | Authenticated / Admin | None | `{ success: true, data: { activeCount, completedCount, overdueCount, averageProgressPercentage } }` | `server.js:L3118` | `state.offlineProgress` |
| `GET` | `/api/offline-exchanges/:id` | Fetches offline progress timeline and session logs | Yes | Participant / Admin | Path: `:id` | `{ success: true, data: OfflineProgressDetails }` | `server.js:L3143` | `state.offlineProgress`, `state.offlineUpdates` |
| `POST` | `/api/offline-exchanges/:id/updates` | Logs milestone progress (stage, topics covered, %) | Yes | Participant | `{ stage, topicsCovered, description, progressPercentage, nextActivity, sessionDate? }` | `{ success: true, data: ProgressUpdate }` | `server.js:L3171` | `state.offlineProgress`, `state.offlineUpdates`, `notifications` |
| `GET` | `/api/exchange-requests/:id/offline-progress` | Retrieves offline tracker attached to exchange request | Yes | Participant / Admin | Path: `:id` | `{ success: true, data: OfflineProgress }` | `server.js:L3253` | `state.offlineProgress` |

---

## 6. Online Sessions & Zoom Meeting Launcher APIs

| Method | Endpoint | Purpose | Auth Required | Role Required | Request Payload | Response Data | Backend Handler | Database / State Entity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/online-sessions` | Schedules video masterclass and generates Zoom link | Yes | Participant | `{ exchangeRequestId, title, scheduledDate, scheduledTime, durationMinutes, description? }` | `{ success: true, data: OnlineSession }` | `server.js:L3286` / `OnlineSessionController.java` | `state.onlineSessions`, Zoom OAuth Service |
| `GET` | `/api/online-sessions` | Lists upcoming, live, and completed online sessions | Yes | Authenticated | Query: `?status=Scheduled` | `{ success: true, data: Array<OnlineSession> }` | `server.js:L3419` | `state.onlineSessions` |
| `GET` | `/api/online-sessions/:id` | Returns single online session record with join details | Yes | Participant / Admin | Path: `:id` | `{ success: true, data: OnlineSession }` | `server.js:L3434` | `state.onlineSessions` |
| `PUT` | `/api/online-sessions/:id/status` | Updates session status (Live, Completed, Cancelled) | Yes | Participant / Admin | `{ status: 'Live'\|'Completed'\|'Cancelled' }` | `{ success: true, data: OnlineSession }` | `server.js:L3456` | `state.onlineSessions` |
| `GET` | `/api/exchange-requests/:id/online-session` | Retrieves online session associated with trade proposal | Yes | Participant / Admin | Path: `:id` | `{ success: true, data: OnlineSession }` | `server.js:L3488` | `state.onlineSessions` |

---

## 7. Shared Notes, Doubts & Peer Messaging APIs

| Method | Endpoint | Purpose | Auth Required | Role Required | Request Payload | Response Data | Backend Handler | Database / State Entity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/exchange-notes` | Returns study notes shared between exchange partners | Yes | Authenticated | Query: `?exchangeRequestId=X` | `{ success: true, data: Array<ExchangeNote> }` | `server.js:L3515` / `ExchangeNoteController.java` | `state.exchangeNotes` |
| `POST` | `/api/exchange-notes` | Creates shared curriculum note or doubt breakdown | Yes | Authenticated | `{ partnerId, exchangeRequestId, topic, content }` | `{ success: true, data: ExchangeNote }` | `server.js:L3534` | `state.exchangeNotes` |
| `PUT` | `/api/exchange-notes/:id` | Edits existing study note or answers doubt | Yes | Author | Path: `:id`, Body: `{ topic?, content? }` | `{ success: true, data: ExchangeNote }` | `server.js:L3575` | `state.exchangeNotes` |
| `DELETE` | `/api/exchange-notes/:id` | Deletes shared study note entry | Yes | Author / Admin | Path: `:id` | `{ success: true, message: "Note deleted" }` | `server.js:L3601` | `state.exchangeNotes` |
| `GET` | `/api/messages/:partnerId` | Retrieves chronological chat thread with peer | Yes | Participant | Path: `:partnerId` | `{ success: true, data: Array<Message> }` | `server.js:L3622` / `ChatController.java:getThread` | `state.messages` |
| `POST` | `/api/messages/attachment` | Uploads file/image attachment directly for chat | Yes | Authenticated | `{ fileName, fileData (base64), category?: 'photo'\|'document' }` | `{ success: true, data: { fileUrl, fileName, fileSize, formattedSize, fileType } }` | `server.js:L3640` | Filesystem: `uploads/chat/` |
| `POST` | `/api/messages` | Transmits peer message with optional reply/attachment | Yes | Authenticated | `{ receiverId, messageText, attachmentUrl?, attachmentType?, attachmentName?, attachmentSize?, replyTo? }` | `{ success: true, data: Message }` | `server.js:L3709` / `ChatController.java:send` | `state.messages`, `notifications`, Supabase `messages` |
| `GET` | `/api/messages/conversations` | Lists distinct peer threads with last message & unread badge | Yes | Authenticated | None | `{ success: true, data: Array<ConversationSummary> }` | `server.js:L3798` | `state.messages`, `state.profiles` |
| `GET` | `/api/messages/unread-count` | Returns total unread messages count for navbar badge | Yes | Authenticated | None | `{ success: true, count: number }` | `server.js:L3830` | `state.messages` |

---

## 8. Skill Verification, Peer Reviews, Notifications & Abuse Reports

| Method | Endpoint | Purpose | Auth Required | Role Required | Request Payload | Response Data | Backend Handler | Database / State Entity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/verifications` | Lists verification submissions filed by student | Yes | Authenticated | None | `{ success: true, data: Array<Verification> }` | `server.js:L3837` / `VerificationController.java` | `state.verifications` |
| `POST` | `/api/verifications` | Submits certificate or project proof for admin audit | Yes | Authenticated | `{ skillId, certificateName, certificateUrl, projectTitle, projectDescription, projectTechnologies, projectLink, projectProofUrl, experienceTitle, experienceOrganization, experienceDescription, experienceDuration, experienceStartDate, experienceEndDate }` | `{ success: true, data: Verification }` | `server.js:L3850` | `state.verifications`, `audit_logs`, Supabase `skill_verifications` |
| `PUT` | `/api/verifications/:id/approve` | Grants ✓ VERIFIED SKILL badge and updates user profile | Yes | Admin (`ROLE_ADMIN`, `ROLE_SUPER_ADMIN`) | Path: `:id`, Body: `{ comment?: string }` | `{ success: true, data: Verification }` | `server.js:L3930` / `VerificationController.java:approve` | `state.verifications`, `user_teaching_skills.is_verified`, `audit_logs` |
| `PUT` | `/api/verifications/:id/reject` | Rejects proof submission with explanation | Yes | Admin | Path: `:id`, Body: `{ comment: string }` | `{ success: true, data: Verification }` | `server.js:L3967` / `VerificationController.java:reject` | `state.verifications`, `audit_logs` |
| `PUT` | `/api/verifications/:id/request-resubmission` | Instructs student to supply additional documentation | Yes | Admin | Path: `:id`, Body: `{ comment: string }` | `{ success: true, data: Verification }` | `server.js:L4004` | `state.verifications`, `audit_logs` |
| `GET` | `/api/reviews/:studentId` | Fetches 1-5 star peer reviews awarded to student | No | Public | Path: `:studentId` | `{ success: true, data: Array<Review> }` | `server.js:L4042` / `ReviewController.java:getReviews` | `state.reviews` |
| `POST` | `/api/reviews` | Submits peer rating & review preventing duplicate submissions | Yes | Participant | `{ exchangeId, reviewedStudentId, rating: 1..5, comment: string }` | `{ success: true, data: Review }` | `server.js:L4048` / `ReviewController.java:create` | `state.reviews`, `student_profiles.averageRating`, Supabase `reviews` |
| `GET` | `/api/notifications` | Returns active notifications for student | Yes | Authenticated | None | `{ success: true, data: Array<Notification> }` | `server.js:L4120` / `NotificationController.java` | `state.notifications` |
| `PUT` | `/api/notifications/:id/read` | Marks single notification as read | Yes | Recipient | Path: `:id` | `{ success: true, message: "Notification read" }` | `server.js:L4126` | `state.notifications` |
| `PUT` | `/api/notifications/read-all` | Marks all student notifications as read | Yes | Authenticated | None | `{ success: true, message: "All notifications read" }` | `server.js:L4133` | `state.notifications` |
| `GET` | `/api/notifications/unread-count` | Polls unread notifications count for bell badge | Yes | Authenticated | None | `{ success: true, count: number }` | `server.js:L4139` | `state.notifications` |
| `POST` | `/api/reports` | Files abuse, harassment, or fake profile incident report | Yes | Authenticated | `{ reportedUserId, reason, description, category?, evidence? }` | `{ success: true, data: Report }` | `server.js:L4146` / `ReportBlockController.java:reportUser` | `state.reports`, `audit_logs`, Supabase `reports` |

---

## 9. Administrative Control Panel APIs (`/api/admin/*`)

| Method | Endpoint | Purpose | Auth Required | Role Required | Request Payload | Response Data | Backend Handler | Database / State Entity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Aggregated platform dashboard KPIs and distributions | Yes | Admin / Super Admin | None | `{ success: true, data: { totalStudents, activeStudents, verifiedSkills, totalExchanges, pendingVerifications, openReports, averageRating, booksListingsCount } }` | `server.js:L4191` / `AdminController.java:getStats` | `state.users`, `state.verifications`, `state.reports`, `state.kitabBhandar` |
| `GET` | `/api/admin/users` | Filterable, searchable student and admin user directory | Yes | Admin / Super Admin | Query: `?q=search&status=ACTIVE` | `{ success: true, data: Array<AdminUserListItem> }` | `server.js:L4238` / `AdminController.java:getUsers` | `state.users`, `state.profiles` |
| `GET` | `/api/admin/users/:id` | Returns full admin view of student with skills & reports | Yes | Admin / Super Admin | Path: `:id` | `{ success: true, data: AdminUserDetail }` | `server.js:L4316` | `state.users`, `state.profiles`, `state.reports` |
| `PUT` | `/api/admin/users/:id/role` | Promotes/demotes user role (Enforces Super Admin only!) | Yes | **SUPER_ADMIN ONLY** | `{ role: 'ROLE_ADMIN'\|'ROLE_STUDENT' }` | `{ success: true, message: "User role updated", data: User }` | `server.js:L4351` / `SecurityConfig.java:hasAuthority` | `state.users`, `state.auditLogs`, Supabase `users` |
| `PUT` | `/api/admin/users/:id/toggle-status` | Suspends or reactivates student platform access | Yes | Admin / Super Admin | None | `{ success: true, active: boolean, message: string }` | `server.js:L4465` | `state.users`, `state.auditLogs`, Supabase `users` |
| `PUT` | `/api/admin/users/:id/toggle-verify` | Manually toggles verified student status | Yes | Admin / Super Admin | None | `{ success: true, verified: boolean }` | `server.js:L4503` | `state.profiles`, `state.auditLogs`, Supabase `student_profiles` |
| `GET` | `/api/admin/skills` | Lists all declared student skill listings across campus | Yes | Admin / Super Admin | None | `{ success: true, data: Array<AdminSkillListing> }` | `server.js:L4526` | `state.profiles.teachingSkills` |
| `PUT` | `/api/admin/skills/:id/status` | Moderates teaching skill status (VERIFIED, REJECTED) | Yes | Admin / Super Admin | `{ status: string }` | `{ success: true, message: "Skill status updated" }` | `server.js:L4553` | `user_teaching_skills`, `audit_logs` |
| `GET` | `/api/admin/categories` | Lists skill categories with counts | Yes | Admin / Super Admin | None | `{ success: true, data: Array<CategoryWithCount> }` | `server.js:L4582` | `state.categories`, `state.skills` |
| `POST` | `/api/admin/categories` | Adds new category to taxonomy | Yes | Admin / Super Admin | `{ name: string, description?: string, icon?: string }` | `{ success: true, data: SkillCategory }` | `server.js:L4595` | `state.categories`, Supabase `skill_categories` |
| `PUT` | `/api/admin/categories/:id` | Modifies skill category metadata or icon | Yes | Admin / Super Admin | Path: `:id`, Body: `{ name?, description?, icon? }` | `{ success: true, data: SkillCategory }` | `server.js:L4627` | `state.categories`, Supabase `skill_categories` |
| `DELETE` | `/api/admin/categories/:id` | Removes category if no active skills depend on it | Yes | Admin / Super Admin | Path: `:id` | `{ success: true, message: "Category deleted" }` | `server.js:L4649` | `state.categories`, Supabase `skill_categories` |
| `GET` | `/api/admin/exchanges` | Oversight of all platform barter contracts | Yes | Admin / Super Admin | None | `{ success: true, data: Array<AdminExchangeOverview> }` | `server.js:L4668` | `state.exchanges`, `state.profiles` |
| `PUT` | `/api/admin/exchanges/:id/status` | Overrides barter status (COMPLETED, CANCELLED) | Yes | Admin / Super Admin | Path: `:id`, Body: `{ status: string }` | `{ success: true, message: "Exchange status updated" }` | `server.js:L4689` | `state.exchanges`, `audit_logs` |
| `GET` | `/api/admin/requests` | Supervisory log of all exchange proposals | Yes | Admin / Super Admin | None | `{ success: true, data: Array<AdminRequestItem> }` | `server.js:L4709` | `state.requests` |
| `GET` | `/api/admin/reviews` | Moderation queue for peer reviews | Yes | Admin / Super Admin | None | `{ success: true, data: Array<AdminReviewItem> }` | `server.js:L4730` | `state.reviews` |
| `PUT` | `/api/admin/reviews/:id/visibility` | Flags or unhides controversial review | Yes | Admin / Super Admin | Path: `:id`, Body: `{ hidden: boolean }` | `{ success: true, message: "Review visibility updated" }` | `server.js:L4744` | `state.reviews`, `audit_logs` |
| `DELETE` | `/api/admin/reviews/:id` | Deletes abusive review and recalculates student rating | Yes | Admin / Super Admin | Path: `:id` | `{ success: true, message: "Review deleted" }` | `server.js:L4763` | `state.reviews`, `student_profiles.averageRating` |
| `GET` | `/api/admin/announcements` | Retrieves broadcast announcements list | Yes | Admin / Super Admin | None | `{ success: true, data: Array<Announcement> }` | `server.js:L4782` | `state.announcements` |
| `POST` | `/api/admin/announcements` | Broadcasts global notification to all campus students | Yes | Admin / Super Admin | `{ title, message, audience?: 'ALL_USERS', priority?: 'NORMAL'\|'HIGH' }` | `{ success: true, data: Announcement }` | `server.js:L4786` | `state.announcements`, `notifications` (broadcast) |
| `GET` | `/api/admin/analytics` | Analytical trends (daily activity, volume, categories) | Yes | Admin / Super Admin | Query: `?days=30` | `{ success: true, data: { timeSeries, categoryBreakdown, topSkills } }` | `server.js:L4829` | `state.exchanges`, `state.users`, `state.skills` |
| `GET` | `/api/admin/settings` | Returns governance settings (domain, auto-verify, maintenance) | Yes | Admin / Super Admin | None | `{ success: true, data: PlatformSettings }` | `server.js:L4863` | `state.settings` |
| `PUT` | `/api/admin/settings` | Modifies governance settings (allowed domain, 2FA, rules) | Yes | Admin / Super Admin | `{ allowedDomain?, autoVerifyTrusted?, requireProjectProof?, maxActiveExchangesPerStudent?, maintenanceMode? }` | `{ success: true, data: PlatformSettings }` | `server.js:L4867` | `state.settings`, `audit_logs` |
| `GET` | `/api/admin/admins` | Lists administrative staff accounts | Yes | Admin / Super Admin | None | `{ success: true, data: Array<AdminAccount> }` | `server.js:L4882` | `state.admins` |
| `POST` | `/api/admin/admins` | Appoints new admin team member (Super Admin only!) | Yes | **SUPER_ADMIN ONLY** | `{ email, name, role: 'ADMIN'\|'MODERATOR'\|'SUPPORT_ADMIN' }` | `{ success: true, data: AdminAccount }` | `server.js:L4886` | `state.admins`, `state.users`, `audit_logs` |
| `GET` | `/api/admin/audit-logs` | Comprehensive security ledger of all platform actions | Yes | Admin / Super Admin | Query: `?action=FILTER` | `{ success: true, data: Array<AuditLog> }` | `server.js:L4920` | `state.auditLogs`, Supabase `audit_logs` |
| `GET` | `/api/admin/verifications` | Full queue of student proof submissions | Yes | Admin / Super Admin | None | `{ success: true, data: Array<Verification> }` | `server.js:L4930` | `state.verifications` |
| `GET` | `/api/admin/students` | Administrative dump of all student profile records | Yes | Admin / Super Admin | None | `{ success: true, data: Array<StudentProfile> }` | `server.js:L4934` | `state.profiles` |
| `GET` | `/api/admin/reports` | Incident reports moderation queue | Yes | Admin / Super Admin | None | `{ success: true, data: Array<Report> }` | `server.js:L4938` | `state.reports` |
| `PUT` | `/api/admin/reports/:id` | Resolves or updates incident report status | Yes | Admin / Super Admin | Path: `:id`, Body: `{ status: 'RESOLVED'\|'DISMISSED'\|'INVESTIGATING', adminNotes?: string }` | `{ success: true, data: Report }` | `server.js:L4942` | `state.reports`, `audit_logs` |
| `PUT` | `/api/admin/users/:userId/skills/:skillId/verify` | Directly awards or revokes verified skill badge | Yes | Admin / Super Admin | Path: `:userId`, `:skillId`, Body: `{ status: 'VERIFIED'\|'REJECTED'\|'NOT_VERIFIED' }` | `{ success: true, message: "Skill verification updated" }` | `server.js:L4963` | `user_teaching_skills`, `audit_logs` |
| `GET` | `/api/admin/subscriptions` | Lists all users with membership status & days remaining | Yes | Admin / Super Admin | None | `{ success: true, data: Array<SubscriptionItem> }` | `server.js:L5030` | `state.profiles.membership`, `state.users` |
| `PUT` | `/api/admin/users/:userId/subscription` | Grants or overrides student trial days or Pro Scholar status | Yes | Admin / Super Admin | Path: `:userId`, Body: `{ status: 'TRIAL'\|'PREMIUM', plan: string, trialDaysRemaining?: number }` | `{ success: true, data: Membership }` | `server.js:L5082` | `state.profiles.membership`, `audit_logs` |
| `GET` | `/api/admin/kitab-bhandar` | Complete catalog of textbook & notes listings | Yes | Admin / Super Admin | None | `{ success: true, data: Array<BookListing> }` | `server.js:L5177` | `state.kitabBhandar` |
| `PUT` | `/api/admin/kitab-bhandar/:id/status` | Moderates book availability (AVAILABLE, EXCHANGED, RESERVED) | Yes | Admin / Super Admin | Path: `:id`, Body: `{ status: string }` | `{ success: true, data: BookListing }` | `server.js:L5181` | `state.kitabBhandar`, `audit_logs` |
| `DELETE` | `/api/admin/kitab-bhandar/:id` | Removes inappropriate book listing from marketplace | Yes | Admin / Super Admin | Path: `:id` | `{ success: true, message: "Listing deleted" }` | `server.js:L5201` | `state.kitabBhandar`, `audit_logs` |
| `GET` | `/api/admin/config` | Returns administrative configuration & Super Admin identity | Yes | Admin / Super Admin | None | `{ success: true, data: { isSuperAdmin: boolean, currentUser: UserSummary } }` | `server.js:L5221` | `state.currentUser`, `getSuperAdminEmails()` |
