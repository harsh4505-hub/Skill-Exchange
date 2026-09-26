-- ===================================================================
-- STUDENT SKILL EXCHANGE PLATFORM - DATABASE SETUP SCRIPT (MySQL)
-- 2nd Year Information Technology College Mini Project
-- ===================================================================

CREATE DATABASE IF NOT EXISTS skill_exchange_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE skill_exchange_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL, -- 'ROLE_STUDENT', 'ROLE_ADMIN'
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. STUDENT PROFILES TABLE
CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    college VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year_of_study VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    bio TEXT,
    avatar_url VARCHAR(500),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    average_rating DOUBLE NOT NULL DEFAULT 0.0,
    completed_exchanges_count INT NOT NULL DEFAULT 0,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. SKILL CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS skill_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    description VARCHAR(255),
    icon VARCHAR(50)
) ENGINE=InnoDB;

-- 4. SKILLS TABLE
CREATE TABLE IF NOT EXISTS skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category_id BIGINT NOT NULL,
    description VARCHAR(500),
    FOREIGN KEY (category_id) REFERENCES skill_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. USER TEACHING SKILLS TABLE
CREATE TABLE IF NOT EXISTS user_teaching_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    proficiency_level VARCHAR(30) DEFAULT 'Intermediate',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    proof_document_url VARCHAR(500),
    verification_notes VARCHAR(500),
    UNIQUE KEY uk_user_teaching (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. USER LEARNING SKILLS TABLE
CREATE TABLE IF NOT EXISTS user_learning_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    urgency_level VARCHAR(30) DEFAULT 'Medium',
    notes VARCHAR(500),
    UNIQUE KEY uk_user_learning (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. EXCHANGE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS exchange_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    skill_offered_id BIGINT NOT NULL,
    skill_requested_id BIGINT NOT NULL,
    message TEXT,
    learning_mode VARCHAR(30) NOT NULL DEFAULT 'ONLINE', -- 'ONLINE', 'OFFLINE', 'CHAT'
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',        -- 'PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_offered_id) REFERENCES skills(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_requested_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. ACTIVE/COMPLETED EXCHANGES TABLE
CREATE TABLE IF NOT EXISTS exchanges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL UNIQUE,
    student1_id BIGINT NOT NULL,
    student2_id BIGINT NOT NULL,
    skill1_id BIGINT NOT NULL,
    skill2_id BIGINT NOT NULL,
    learning_mode VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'COMPLETED', 'CANCELLED'
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP NULL,
    FOREIGN KEY (request_id) REFERENCES exchange_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (student1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student2_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill1_id) REFERENCES skills(id) ON DELETE CASCADE,
    FOREIGN KEY (skill2_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. MESSAGES (CHAT) TABLE
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(40) NOT NULL,
    related_entity_id BIGINT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. SKILL VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS skill_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    document_name VARCHAR(150) NOT NULL,
    document_path VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'REJECTED'
    admin_comment TEXT,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_date TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. RATINGS & REVIEWS TABLE
CREATE TABLE IF NOT EXISTS ratings_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exchange_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    reviewed_student_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_exchange_reviewer (exchange_id, reviewer_id),
    FOREIGN KEY (exchange_id) REFERENCES exchanges(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. ABUSE REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    reported_user_id BIGINT NOT NULL,
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'RESOLVED', 'DISMISSED'
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. BLOCKED USERS TABLE
CREATE TABLE IF NOT EXISTS blocked_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    blocker_id BIGINT NOT NULL,
    blocked_id BIGINT NOT NULL,
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_blocker_blocked (blocker_id, blocked_id),
    FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ===================================================================
-- SAMPLE SEED DATA
-- Default password for all seed accounts: password123
-- BCrypt Hash: $2a$10$7v1b1w0s3p0Z3... (generated via BCryptPasswordEncoder)
-- ===================================================================

-- Categories
INSERT INTO skill_categories (id, name, description, icon) VALUES
(1, 'Programming', 'Software engineering, algorithms & coding', 'bi-code-slash'),
(2, 'Web Development', 'Frontend, backend, and full-stack web tech', 'bi-globe'),
(3, 'Design', 'Graphic design, UI/UX, and branding', 'bi-palette'),
(4, 'Photography & Video', 'Digital photography & video post-production', 'bi-camera-video'),
(5, 'Communication', 'Public speaking, presentation, & soft skills', 'bi-chat-dots'),
(6, 'Academic & Productivity', 'Mathematics, data analysis, and tools', 'bi-journal-bookmark')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Skills
INSERT INTO skills (id, name, category_id, description) VALUES
(1, 'Java', 1, 'Core Java OOP, Collections, Multi-threading, and Spring Boot framework'),
(2, 'Python', 1, 'Scripting, Data structures, automation, and basics of ML'),
(3, 'HTML/CSS/JS', 2, 'Modern responsive web development with JavaScript and Bootstrap 5'),
(4, 'Photoshop', 3, 'Photo editing, poster design, photo manipulation, and color grading'),
(5, 'Graphic Design', 3, 'Visual identity, logo design, typography, and Figma UI wireframing'),
(6, 'Video Editing', 4, 'Premiere Pro / DaVinci Resolve video cutting, B-roll, and transitions'),
(7, 'Public Speaking', 5, 'Overcoming stage fright, voice modulation, and campus presentation skills'),
(8, 'Excel & Data Analysis', 6, 'VLOOKUP, XLOOKUP, Pivot Tables, and business dashboards')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Note: When launching with Spring Boot, DataInitializer.java automatically seeds
-- Harsh, Sejal, Raza, Udipti, and Admin with fresh BCrypt password encodings!
