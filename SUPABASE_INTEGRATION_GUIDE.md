# Supabase Cloud Database Integration Guide
**Project URL:** [https://qfokonidfrpkunkuivwo.supabase.co](https://qfokonidfrpkunkuivwo.supabase.co)

---

## 🚀 Overview

The **Student Skill Exchange Platform** has been upgraded with native **Supabase PostgreSQL Cloud Database Integration**. All application data, authentication, skill profiles, exchange requests, chat messages, verifications, peer reviews, and administrative audits can now be persisted in your Supabase project.

---

## 🛠️ What Was Built & Connected

1. **`supabase_schema.sql`**
   - Full PostgreSQL schema created specifically for your Supabase project.
   - Includes all **18 tables**: `users`, `student_profiles`, `skill_categories`, `skills`, `user_teaching_skills`, `user_learning_skills`, `projects`, `experiences`, `exchange_requests`, `exchanges`, `messages`, `notifications`, `skill_verifications`, `reviews`, `reports`, `blocked_users`, `audit_logs`, and `otps`.
   - Complete Row Level Security (RLS) policies and pre-seeded demo records for student & admin personas.

2. **`supabaseService.js`**
   - Implements `@supabase/supabase-js` client connection.
   - **Startup Synchronization (`syncFromSupabase`)**: Pulls all tables from Supabase into the backend cache.
   - **Live Cloud Persistence**: Asynchronously writes every creation, update, and deletion to Supabase tables.

3. **`server.js`**
   - Hooked up with Supabase lifecycle hooks across all 14 platform modules.
   - On server start, automatically detects `SUPABASE_URL` and `SUPABASE_KEY` from `.env`.
   - When an action is taken on the site (registration, skill swap, review, message, profile edit), changes are immediately saved to Supabase.

---

## ⚡ 2 Quick Steps to Activate Live Sync

### Step 1: Run the Database Schema in Supabase
1. Open your Supabase Dashboard:  
   👉 [https://supabase.com/dashboard/project/qfokonidfrpkunkuivwo/sql](https://supabase.com/dashboard/project/qfokonidfrpkunkuivwo/sql)
2. Click **New query** (or the SQL Editor icon in the left sidebar).
3. Open [`supabase_schema.sql`](./supabase_schema.sql) in this project, copy all contents, paste into the Supabase SQL editor, and click **Run**.
4. All tables, security policies, and seed data will be created instantly.

### Step 2: Add your Supabase API Key to `.env`
1. Go to your Supabase Project Settings:  
   👉 [https://supabase.com/dashboard/project/qfokonidfrpkunkuivwo/settings/api](https://supabase.com/dashboard/project/qfokonidfrpkunkuivwo/settings/api)
2. Under **Project API keys**, copy either:
   - `anon` `public` key, OR
   - `service_role` `secret` key (recommended for full backend administrative access).
3. Open your [`.env`](./.env) file and add the key:
   ```env
   SUPABASE_URL=https://qfokonidfrpkunkuivwo.supabase.co
   SUPABASE_KEY=your-copied-key-here
   ```
4. Save the file. The server will automatically connect and synchronize with Supabase!
