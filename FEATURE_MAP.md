# FEATURE MAP — Student Skill Exchange Platform

This document establishes the end-to-end trace from User Interface down to Cloud Database persistence for every feature implemented in the application.

---

## 1. Student Registration & College Domain OTP Verification
```
FEATURE: Student Registration with College Domain Enforcement
  ↓
PAGE: register.html
  ↓
COMPONENT: Registration Form (#registerForm), Domain Validator badge, Password Match indicator
  ↓
API: POST /api/auth/register
  ↓
BACKEND: server.js:L1777 (isValidCollegeEmail, generateSecureOtp, hashOtp, sendVerificationEmail) / AuthController.java:register
  ↓
DATABASE: state.otps, state.users, state.profiles
  ↓
SUPABASE: public.users (active=false, email_verified=false), public.otps
  ↓
FOLLOW-UP: User redirected to verify-email.html → POST /api/auth/verify-email → User activated and logged in
```

---

## 2. Student Authentication & Session Management
```
FEATURE: Multi-Method Authentication (Local Credentials + Firebase Google Sign-In)
  ↓
PAGE: login.html
  ↓
COMPONENT: Credential Form (#loginForm), 1-Click Demo Buttons, Google Sign-In Button (#btnGoogleLogin)
  ↓
API: POST /api/auth/login OR POST /api/auth/firebase-login
  ↓
BACKEND: server.js:L1600 (credential match in state.users) & server.js:L1656 (Firebase account synchronization)
  ↓
DATABASE: state.currentUser, state.auditLogs
  ↓
SUPABASE: public.users, public.student_profiles, public.audit_logs
  ↓
FOLLOW-UP: Session cookie set (skill_exchange_session) → Redirected to dashboard.html or index.html
```

---

## 3. Password Recovery & Secure Reset Flow
```
FEATURE: 6-Digit Email OTP Password Reset
  ↓
PAGE: forgot-password.html
  ↓
COMPONENT: Step 1 (Email Input), Step 2 (6-digit OTP code entry), Step 3 (New Password Confirmation)
  ↓
API: POST /api/auth/forgot-password → POST /api/auth/reset-password
  ↓
BACKEND: server.js:L2000 (sendPasswordResetEmail) & server.js:L2040 (hash verification & password update)
  ↓
DATABASE: state.otps, state.users
  ↓
SUPABASE: public.users (password update)
  ↓
FOLLOW-UP: Prompt user to login with newly updated credentials
```

---

## 4. Student Profile, Avatar & Bio Management
```
FEATURE: Student Profile & Personal Information Editing
  ↓
PAGE: profile.html
  ↓
COMPONENT: Profile Card, Avatar Uploader (#avatarInput), Edit Profile Modal, Bio Textarea
  ↓
API: GET /api/students/profile/me → POST /api/students/avatar → PUT /api/students/:id
  ↓
BACKEND: server.js:L2186, server.js:L2192, server.js:L2268 / StudentController.java
  ↓
DATABASE: state.profiles
  ↓
SUPABASE: public.student_profiles
  ↓
FOLLOW-UP: Updates reflected instantly in navbar avatar and public profile cards
```

---

## 5. Portfolio Projects & Campus Experience Showcase
```
FEATURE: Student Portfolio & Practical Experience Evidence
  ↓
PAGE: profile.html
  ↓
COMPONENT: Portfolio Project Cards, Add Project Modal (#addProjectModal), Experience Timeline, Add Experience Modal
  ↓
API: POST /api/students/projects, DELETE /api/students/projects/:id, POST /api/students/experiences
  ↓
BACKEND: server.js:L2292, server.js:L2321, server.js:L2340 / StudentController.java
  ↓
DATABASE: state.projects, state.experiences
  ↓
SUPABASE: public.projects, public.experiences
  ↓
FOLLOW-UP: Visible to potential trade partners to establish credibility and trust
```

---

## 6. Skill Repertoire Management (Teaching & Learning Skills)
```
FEATURE: Skill Portfolio Management
  ↓
PAGE: skills.html
  ↓
COMPONENT: Teaching Skills Tab, Learning Skills Tab, Add Skill Modal, Proficiency Selector, Urgency Slider
  ↓
API: GET /api/skills, POST /api/students/skills/teach, POST /api/students/skills/learn
  ↓
BACKEND: server.js:L2419 (addTeachingSkill), server.js:L2454 (addLearningSkill) / StudentController.java
  ↓
DATABASE: state.profiles[i].teachingSkills, state.profiles[i].learningSkills
  ↓
SUPABASE: public.user_teaching_skills, public.user_learning_skills
  ↓
FOLLOW-UP: Re-indexes student in the Heuristic Matching Engine for discovery
```

---

## 7. Heuristic Skill Compatibility Matcher (5-Factor Formula)
```
FEATURE: Explainable 5-Factor Skill Matchmaking
  ↓
PAGE: matches.html
  ↓
COMPONENT: Match Cards, Compatibility Badge (e.g. 95%), 5-Factor Score Breakdown Pill, Propose Exchange Modal Trigger
  ↓
API: GET /api/matches
  ↓
BACKEND: server.js:L2514 (Calculates: 40% Direct + 20% Reverse + 15% Rating + 15% Verification + 10% Academic Synergy)
  ↓
DATABASE: Evaluates state.profiles, teachingSkills, learningSkills, reviews
  ↓
SUPABASE: Queried via user_teaching_skills and user_learning_skills
  ↓
FOLLOW-UP: Clicking "Propose Exchange" pre-fills proposal modal with optimal skill trade
```

---

## 8. Exchange Proposal & Barter Contract Flow
```
FEATURE: Bilateral Barter Proposals (Propose, Accept, Reject, Complete)
  ↓
PAGE: requests.html & index.html & matches.html
  ↓
COMPONENT: Propose Modal (#proposeModal), Received Proposals Tab, Sent Proposals Tab, Accept / Reject Buttons, Complete Trade Button
  ↓
API: POST /api/exchange-requests → PUT /api/exchange-requests/:id/accept → PUT /api/exchange-requests/:id/complete
  ↓
BACKEND: server.js:L2872, server.js:L2940, server.js:L3027 / ExchangeRequestController.java
  ↓
DATABASE: state.requests, state.exchanges, state.notifications
  ↓
SUPABASE: public.exchange_requests, public.exchanges, public.notifications
  ↓
FOLLOW-UP: Acceptance triggers automatic creation of Chat thread, Online Zoom link, and Offline Progress card
```

---

## 9. Online Video Masterclass Session Scheduling
```
FEATURE: Integrated Online Video Sessions & Zoom Launcher
  ↓
PAGE: chat.html & dashboard.html
  ↓
COMPONENT: "Schedule Online Session" Button, Zoom Meeting Launcher Modal (#zoomModal), Countdown Banner, Join Meeting Link
  ↓
API: POST /api/online-sessions → GET /api/online-sessions
  ↓
BACKEND: server.js:L3286 (getZoomConfig, generates Zoom OAuth credentials or demo room URL) / OnlineSessionController.java
  ↓
DATABASE: state.onlineSessions
  ↓
SUPABASE: public.exchanges (online mode metadata) / in-memory onlineSessions
  ↓
FOLLOW-UP: Real-time countdown timer displayed to both participants; status transitions to 'Live' and 'Completed'
```

---

## 10. Campus Offline Milestones & Progress Tracking
```
FEATURE: In-Person Physical Learning Tracker
  ↓
PAGE: requests.html & admin-dashboard.html
  ↓
COMPONENT: Offline Progress Card, Percentage Progress Bar (0..100%), Milestone Timeline, Log Milestone Update Modal
  ↓
API: GET /api/offline-exchanges/:id → POST /api/offline-exchanges/:id/updates
  ↓
BACKEND: server.js:L3101, server.js:L3171 / OfflineExchangeProgressController.java
  ↓
DATABASE: state.offlineProgress, state.offlineUpdates, state.notifications
  ↓
SUPABASE: Logged to audit trail / in-memory offline progress entities
  ↓
FOLLOW-UP: Progress >= 100% flags exchange as ready for mutual completion and review
```

---

## 11. Peer-to-Peer Chat & Attachment Sharing
```
FEATURE: Real-Time In-App Messaging & Media Sharing
  ↓
PAGE: chat.html
  ↓
COMPONENT: Conversation Sidebar, Active Chat Thread, Message Input Box, Media Attachment Button, Delivery/Seen Checkmarks
  ↓
API: GET /api/messages/:partnerId → POST /api/messages/attachment → POST /api/messages
  ↓
BACKEND: server.js:L3622, server.js:L3640, server.js:L3709 / ChatController.java
  ↓
DATABASE: state.messages, state.notifications
  ↓
SUPABASE: public.messages, public.notifications
  ↓
STORAGE: src/main/resources/static/uploads/chat/
  ↓
FOLLOW-UP: Real-time polling updates incoming messages and read receipts
```

---

## 12. Collaborative Notes & Student Doubts Scratchpad
```
FEATURE: Shared Study Notes & Doubts During Exchange
  ↓
PAGE: chat.html (Notes & Doubts Drawer)
  ↓
COMPONENT: Notes List, "Add Note / Doubt" Modal, Topic & Content Editor, Delete Note Trigger
  ↓
API: GET /api/exchange-notes → POST /api/exchange-notes → PUT /api/exchange-notes/:id
  ↓
BACKEND: server.js:L3515, server.js:L3534, server.js:L3575 / ExchangeNoteController.java
  ↓
DATABASE: state.exchangeNotes
  ↓
SUPABASE: Synced through platform service layer
  ↓
FOLLOW-UP: Both exchange participants can collaboratively add curriculum points and resolve questions
```

---

## 13. Skill Verification Document Audit & Badge Awarding
```
FEATURE: Skill Verification Proof Auditing & Badge Issuance
  ↓
PAGE: verification.html (Student) → admin-dashboard.html (Admin)
  ↓
COMPONENT: Student Proof Submission Form (#verificationForm) → Admin Verification Audit Table (#pane-verification)
  ↓
API: POST /api/verifications → PUT /api/verifications/:id/approve (or reject / request-resubmission)
  ↓
BACKEND: server.js:L3850, server.js:L3930, server.js:L4963 / VerificationController.java
  ↓
DATABASE: state.verifications, state.profiles[i].teachingSkills.is_verified, state.auditLogs
  ↓
SUPABASE: public.skill_verifications, public.user_teaching_skills.is_verified, public.audit_logs
  ↓
STORAGE: src/main/resources/static/uploads/certificates/, src/main/resources/static/uploads/proofs/
  ↓
FOLLOW-UP: Verified student profile displays green "✓ VERIFIED SKILL" badge and gains +15% matching boost
```

---

## 14. Closed-Loop 1-5 Star Peer Rating & Review System
```
FEATURE: Post-Trade Peer Reviews & Automatic Rating Recalculation
  ↓
PAGE: exchange-history.html
  ↓
COMPONENT: Completed Trade Cards, "Write Review" Modal (#reviewModal), 5-Star Rating Picker, Comment Box
  ↓
API: POST /api/reviews
  ↓
BACKEND: server.js:L4048 (Enforces 1 review per exchange; recalculates student's averageRating) / ReviewController.java
  ↓
DATABASE: state.reviews, state.profiles[i].averageRating
  ↓
SUPABASE: public.reviews (unique constraint uk_review_exchange_reviewer), public.student_profiles.average_rating
  ↓
FOLLOW-UP: Instantly updates candidate's score in Heuristic Matchmaker and public profile
```

---

## 15. Kitab Bhandar (Campus Book & Notes Barter Marketplace)
```
FEATURE: Student Physical Textbook & Notes Barter
  ↓
PAGE: admin-dashboard.html (Admin Management) & Platform Service Layer
  ↓
COMPONENT: Kitab Bhandar Inventory Table (#pane-kitab-bhandar), Book Status Toggle (Available / Bartered), Remove Listing
  ↓
API: GET /api/admin/kitab-bhandar, PUT /api/admin/kitab-bhandar/:id/status, DELETE /api/admin/kitab-bhandar/:id
  ↓
BACKEND: server.js:L5177, server.js:L5181, server.js:L5201
  ↓
DATABASE: state.kitabBhandar, state.auditLogs
  ↓
SUPABASE: Synced with audit log ledger
  ↓
FOLLOW-UP: Enables students to exchange expensive textbooks and exam preparation notes without money
```

---

## 16. 30-Day Free Trial & Campus Premium Memberships
```
FEATURE: Student Free Trial & Pro Scholar Membership Tracking
  ↓
PAGE: landing.html, profile.html, admin-dashboard.html
  ↓
COMPONENT: Membership Status Banner, Trial Days Remaining Countdown (e.g. 21 days), Admin Subscriptions Table
  ↓
API: GET /api/admin/subscriptions, PUT /api/admin/users/:userId/subscription
  ↓
BACKEND: server.js:L5030, server.js:L5082
  ↓
DATABASE: state.profiles[i].membership, state.auditLogs
  ↓
SUPABASE: public.student_profiles / public.audit_logs
  ↓
FOLLOW-UP: Administrators can grant trial extensions or toggle Pro Scholar membership tiers
```

---

## 17. Super Admin & Administrative Staff Governance Panel
```
FEATURE: Centralized Admin Operations & Role Management
  ↓
PAGE: admin-dashboard.html
  ↓
COMPONENT: 18 Tab Panes (Dashboard, Users, Skills, Categories, Exchanges, Reports, Admins, Audit Logs, Settings)
  ↓
API: GET /api/admin/stats, PUT /api/admin/users/:id/role (Super Admin only!), POST /api/admin/admins, PUT /api/admin/settings
  ↓
BACKEND: server.js:L4181-L5240 (Protected by isAdmin and isSuperAdmin RBAC guards)
  ↓
DATABASE: state.users, state.admins, state.settings, state.auditLogs
  ↓
SUPABASE: public.users, public.audit_logs, public.student_profiles
  ↓
FOLLOW-UP: Super Admin (harshtukaram45@gmail.com) can promote students to ROLE_ADMIN, demote staff, and configure settings
```

---

## 18. Incident Reporting & Peer Blocking System
```
FEATURE: Campus Safety, Abuse Reporting & User Blocking
  ↓
PAGE: chat.html & profile.html (Report/Block trigger) → admin-dashboard.html (Report Queue)
  ↓
COMPONENT: "Report User" Modal, "Block User" Button, Admin Reports Table (#pane-reports), Resolve Report Modal
  ↓
API: POST /api/reports, POST /api/students/block, PUT /api/admin/reports/:id
  ↓
BACKEND: server.js:L4146, server.js:L2383, server.js:L4942 / ReportBlockController.java
  ↓
DATABASE: state.reports, state.blockedUsers, state.auditLogs
  ↓
SUPABASE: public.reports, public.blocked_users, public.audit_logs
  ↓
FOLLOW-UP: Blocked users cannot view profile or send messages; reports trigger administrative investigation
```
