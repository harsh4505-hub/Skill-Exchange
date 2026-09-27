/**
 * STUDENT SKILL EXCHANGE PLATFORM
 * Node.js Runtime Server & REST API Provider
 * Serves the full web application on http://localhost:8080
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const PORT = 8080;
const STATIC_DIR = path.join(__dirname, 'src', 'main', 'resources', 'static');

// Auto-load environment variables from .env file if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split(/\r?\n/).forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const idx = trimmed.indexOf('=');
                if (idx > 0) {
                    const key = trimmed.slice(0, idx).trim();
                    let val = trimmed.slice(idx + 1).trim();
                    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.slice(1, -1);
                    }
                    if (!process.env[key]) {
                        process.env[key] = val;
                    }
                }
            }
        });
    } catch (e) {
        console.error("Warning: Could not parse .env file:", e.message);
    }
}

// ===================================================================
// COLLEGE EMAIL DOMAIN RESTRICTION VALIDATOR (@mgmmumbai.ac.in)
// ===================================================================

const COLLEGE_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@mgmmumbai\.ac\.in$/i;

function isValidCollegeEmail(email) {
    if (!email || typeof email !== 'string') return false;
    return COLLEGE_EMAIL_REGEX.test(email.trim());
}

// ===================================================================
// CRYPTOGRAPHIC OTP & GMAIL SMTP EMAIL SERVICE
// ===================================================================

function hashOtp(otp) {
    return crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
}

function generateSecureOtp() {
    // Generates a cryptographically secure 6-digit number between 100000 and 999999
    return crypto.randomInt(100000, 1000000).toString();
}

function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getMailTransporter() {
    const user = process.env.MAIL_USERNAME;
    const pass = process.env.MAIL_PASSWORD;
    if (!user || !pass) {
        return null;
    }
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // TLS via STARTTLS
        auth: {
            user: user.trim(),
            pass: pass.trim().replace(/\s+/g, '') // Strips any spaces if user copied "xxxx yyyy zzzz wwww"
        },
        tls: {
            rejectUnauthorized: true
        }
    });
}

async function sendVerificationEmail(recipientEmail, studentName, otpCode) {
    const rawUser = process.env.MAIL_USERNAME;
    const rawPass = process.env.MAIL_PASSWORD;
    const userClean = rawUser ? rawUser.trim() : '';
    const passClean = rawPass ? rawPass.trim().replace(/\s+/g, '') : '';

    const isUserConfigured = userClean.length > 0;
    const isPassConfigured = passClean.length > 0;
    const isRecipientValid = isValidCollegeEmail(recipientEmail);

    console.log("\n==================== [EMAIL DEBUG] ====================");
    console.log("SMTP host configured: YES (smtp.gmail.com)");
    console.log("SMTP port: 587");
    console.log("MAIL_USERNAME configured: " + (isUserConfigured ? "YES" : "NO"));
    console.log("MAIL_PASSWORD configured: " + (isPassConfigured ? "YES" : "NO"));
    console.log("Transporter available: YES");
    console.log("Recipient domain valid (@mgmmumbai.ac.in): " + (isRecipientValid ? "YES" : "NO"));

    if (!isUserConfigured || !isPassConfigured) {
        const reason = (!isUserConfigured && !isPassConfigured)
            ? "Both MAIL_USERNAME and MAIL_PASSWORD are missing from the environment (.env)"
            : (!isUserConfigured ? "MAIL_USERNAME is not configured" : "MAIL_PASSWORD is not configured");
        console.log("SMTP connection: NOT ATTEMPTED");
        console.log("Reason: " + reason);
        console.log("Remedy: Set MAIL_USERNAME and MAIL_PASSWORD in a .env file in the project root.");
        console.log("========================================================\n");
        throw new Error(reason);
    }

    const transporter = getMailTransporter();
    const mailOptions = {
        from: `"Student Skill Exchange" <${userClean}>`,
        to: recipientEmail,
        subject: "Verify Your Student Skill Exchange Account",
        text: `Student Skill Exchange\n\nHello ${studentName || 'Student'},\n\nThank you for registering with Student Skill Exchange.\n\nYour 6-digit verification code is:\n\n${otpCode}\n\nThis code will expire in 10 minutes.\n\nIf you did not create this account, you can safely ignore this email.\n\nStudent Skill Exchange`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; color: #1e293b;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Student Skill Exchange</h2>
                    <p style="margin: 4px 0 0; color: #64748b; font-size: 13px; font-weight: 500;">Official MGM Student Peer Learning Network</p>
                </div>
                <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
                    <p style="font-size: 15px; line-height: 1.5; margin: 0 0 16px;">Hello <strong>${studentName || 'Student'}</strong>,</p>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
                        Thank you for registering with Student Skill Exchange. Use the 6-digit confirmation code below to verify your official college email address:
                    </p>
                    <div style="background: #f8fafc; border: 2px dashed #0f172a; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 34px; font-weight: 800; font-family: 'Courier New', Courier, monospace; letter-spacing: 8px; color: #0f172a;">${otpCode}</span>
                    </div>
                    <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 12px;">
                        ⏳ <strong>This code will expire in 10 minutes.</strong>
                    </p>
                    <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 12px;">
                        If you did not create this account, you can safely ignore this email.
                    </p>
                    <p style="font-size: 12px; color: #94a3b8; margin: 24px 0 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                        Student Skill Exchange &bull; MGM Mumbai
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("SMTP connection: SUCCESS");
        console.log("Email delivery: DELIVERED to " + recipientEmail);
        console.log("========================================================\n");
    } catch (err) {
        console.log("SMTP connection: FAILED");
        let failureReason = err.message || 'SMTP communication error';
        if (err.responseCode === 535 || (err.message && err.message.includes('535'))) {
            failureReason = "SMTP 535: Authentication failed (Invalid Gmail username or Google App Password).";
        } else if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
            failureReason = "Connection timeout connecting to smtp.gmail.com:587";
        }
        console.log("Reason: " + failureReason);
        console.log("========================================================\n");
        throw err;
    }
}

async function sendPasswordResetEmail(recipientEmail, studentName, resetCode) {
    const user = process.env.MAIL_USERNAME;
    const pass = process.env.MAIL_PASSWORD;
    if (!user || !pass) {
        console.error("Password reset email failed: Missing MAIL_USERNAME or MAIL_PASSWORD environment variables.");
        throw new Error("Missing SMTP credentials");
    }

    const transporter = getMailTransporter();
    const mailOptions = {
        from: `"Student Skill Exchange" <${user.trim()}>`,
        to: recipientEmail,
        subject: "Reset Your Student Skill Exchange Password",
        text: `Student Skill Exchange\n\nHello ${studentName || 'Student'},\n\nWe received a request to reset your password.\n\nYour 6-digit reset code is:\n\n${resetCode}\n\nThis code will expire in 15 minutes.\n\nIf you did not request a password reset, you can safely ignore this email.\n\nStudent Skill Exchange`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; color: #1e293b;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Student Skill Exchange</h2>
                    <p style="margin: 4px 0 0; color: #64748b; font-size: 13px; font-weight: 500;">Official MGM Student Peer Learning Network</p>
                </div>
                <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
                    <p style="font-size: 15px; line-height: 1.5; margin: 0 0 16px;">Hello <strong>${studentName || 'Student'}</strong>,</p>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
                        We received a request to reset your account password. Use the 6-digit code below to proceed:
                    </p>
                    <div style="background: #f8fafc; border: 2px dashed #0f172a; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 34px; font-weight: 800; font-family: 'Courier New', Courier, monospace; letter-spacing: 8px; color: #0f172a;">${resetCode}</span>
                    </div>
                    <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 12px;">
                        ⏳ <strong>This code will expire in 15 minutes.</strong>
                    </p>
                    <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 12px;">
                        If you did not request a password reset, you can safely ignore this email.
                    </p>
                    <p style="font-size: 12px; color: #94a3b8; margin: 24px 0 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                        Student Skill Exchange &bull; MGM Mumbai
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Password reset email delivered to: ${recipientEmail}`);
    } catch (err) {
        if (err.responseCode === 535) {
            console.error("Password reset email failed: SMTP authentication failed.");
        } else {
            console.error(`Password reset email failed: ${err.message || 'SMTP error'}`);
        }
        throw err;
    }
}

// ===================================================================
// IN-MEMORY DATABASE STATE (Pre-seeded with Sample Demonstration Data)
// ===================================================================

const state = {
    currentUser: null,

    // OTP Store for email verification and password reset
    otps: {},

    auditLogs: [
        {
            id: 1,
            action: "PLATFORM_INIT",
            performedBy: "admin@mgmmumbai.ac.in",
            target: "SYSTEM",
            timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
            details: "Platform initialized with college email security policy (@mgmmumbai.ac.in)."
        },
        {
            id: 2,
            action: "SKILL_VERIFICATION_APPROVED",
            performedBy: "admin@mgmmumbai.ac.in",
            target: "harsh@mgmmumbai.ac.in",
            timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
            details: "Approved Java skill verification proof (Project & Experience verified)."
        },
        {
            id: 3,
            action: "SKILL_VERIFICATION_APPROVED",
            performedBy: "admin@mgmmumbai.ac.in",
            target: "sejal@mgmmumbai.ac.in",
            timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
            details: "Approved Photoshop skill verification proof (Portfolio & Experience verified)."
        }
    ],

    blockedUsers: [],

    projects: [
        {
            id: 1,
            studentId: 2,
            title: "Microservices Learning Exchange Backend",
            description: "Developed a distributed RESTful skill exchange engine with Spring Boot, Redis caching, and reciprocal matchmaking.",
            technologies: "Java 17, Spring Boot, MySQL, Docker",
            link: "https://github.com/harsh/skill-exchange-service",
            proofUrl: ""
        },
        {
            id: 2,
            studentId: 2,
            title: "College Campus Event Manager",
            description: "Built a real-time event booking and QR attendance scanning portal for MGM annual technical fests.",
            technologies: "Java, Spring MVC, Thymeleaf, PostgreSQL",
            link: "https://github.com/harsh/mgm-event-manager",
            proofUrl: ""
        },
        {
            id: 3,
            studentId: 3,
            title: "Brand Identity & Vector Retouching System",
            description: "Created commercial posters, photo composite imagery, and multi-layered branding assets for college cultural fests.",
            technologies: "Adobe Photoshop 2024, Lightroom, Figma",
            link: "https://behance.net/sejal_photoshop_portfolio",
            proofUrl: ""
        }
    ],

    experiences: [
        {
            id: 1,
            studentId: 2,
            title: "Lead Java Developer & Mentor",
            organization: "MGM College Open Source Developer Club",
            description: "Mentored 40+ junior students in Object-Oriented Programming, Spring framework fundamentals, and code reviews.",
            duration: "1 Year",
            startDate: "2025-01-10",
            endDate: "Present",
            isCurrent: true
        },
        {
            id: 2,
            studentId: 3,
            title: "Head Graphic Designer",
            organization: "MGM College Annual Magazine Editorial Board",
            description: "Designed front-cover layouts, retouched photography, and coordinated print publishing for 1,500+ physical magazine copies.",
            duration: "1.5 Years",
            startDate: "2024-09-01",
            endDate: "Present",
            isCurrent: true
        }
    ],

    categories: [
        { id: 1, name: "Programming", description: "Software engineering, algorithms & coding", icon: "bi-code-slash" },
        { id: 2, name: "Web Development", description: "Frontend, backend, and full-stack web tech", icon: "bi-globe" },
        { id: 3, name: "Design", description: "Graphic design, UI/UX, and branding", icon: "bi-palette" },
        { id: 4, name: "Photography & Video", description: "Digital photography & video post-production", icon: "bi-camera-video" },
        { id: 5, name: "Communication", description: "Public speaking, presentation, & soft skills", icon: "bi-chat-dots" },
        { id: 6, name: "Academic & Productivity", description: "Mathematics, data analysis, and office tools", icon: "bi-journal-bookmark" }
    ],

    skills: [
        { id: 1, name: "Java", categoryId: 1, categoryName: "Programming", description: "Core Java OOP, Collections, Multi-threading, and Spring Boot framework" },
        { id: 2, name: "Python", categoryId: 1, categoryName: "Programming", description: "Python scripting, data structures, and automation" },
        { id: 3, name: "HTML/CSS/JS", categoryId: 2, categoryName: "Web Development", description: "Modern responsive web development with JavaScript and Bootstrap 5" },
        { id: 4, name: "Photoshop", categoryId: 3, categoryName: "Design", description: "Image manipulation, digital art, poster design, and photo editing" },
        { id: 5, name: "Graphic Design", categoryId: 3, categoryName: "Design", description: "Typography, Figma UI design, and visual brand identity" },
        { id: 6, name: "Video Editing", categoryId: 4, categoryName: "Photography & Video", description: "Premiere Pro / DaVinci Resolve video cutting and color grading" },
        { id: 7, name: "Public Speaking", categoryId: 5, categoryName: "Communication", description: "Overcoming stage fear, debate, and confident speech presentation" },
        { id: 8, name: "Excel & Data Analysis", categoryId: 6, categoryName: "Academic & Productivity", description: "Formulas, pivot tables, lookup functions, and data charts" }
    ],

    users: [
        { id: 1, email: "admin@mgmmumbai.ac.in", role: "ROLE_ADMIN", password: "password123", active: true, emailVerified: true, hasSeenLanding: true },
        { id: 2, email: "harsh@mgmmumbai.ac.in", role: "ROLE_STUDENT", password: "password123", active: true, emailVerified: true, hasSeenLanding: true },
        { id: 3, email: "sejal@mgmmumbai.ac.in", role: "ROLE_STUDENT", password: "password123", active: true, emailVerified: true, hasSeenLanding: true },
        { id: 4, email: "raza@mgmmumbai.ac.in", role: "ROLE_STUDENT", password: "password123", active: true, emailVerified: true, hasSeenLanding: true },
        { id: 5, email: "udipti@mgmmumbai.ac.in", role: "ROLE_STUDENT", password: "password123", active: true, emailVerified: true, hasSeenLanding: true }
    ],

    profiles: [
        {
            id: 2,
            userId: 2,
            fullName: "Harsh Vardhan",
            email: "harsh@mgmmumbai.ac.in",
            college: "College of Engineering & Technology",
            department: "Information Technology",
            yearOfStudy: "2nd Year",
            phone: "9876543210",
            bio: "2nd-year IT student passionate about Java backend architectures and algorithms. Wanting to learn design and video editing!",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Harsh",
            verified: true,
            averageRating: 4.8,
            completedExchangesCount: 2,
            blocked: false,
            teachingSkills: [
                { id: 1, skillId: 1, skillName: "Java", categoryId: 1, categoryName: "Programming", levelOrUrgency: "Advanced", verified: true, verificationStatus: "VERIFIED", proofDocumentUrl: "uploads/certificates/harsh_java.pdf" },
                { id: 2, skillId: 3, skillName: "HTML/CSS/JS", categoryId: 2, categoryName: "Web Development", levelOrUrgency: "Intermediate", verified: false, verificationStatus: "NOT_VERIFIED" }
            ],
            learningSkills: [
                { id: 1, skillId: 4, skillName: "Photoshop", categoryId: 3, categoryName: "Design", levelOrUrgency: "High" },
                { id: 2, skillId: 6, skillName: "Video Editing", categoryId: 4, categoryName: "Photography & Video", levelOrUrgency: "Medium" }
            ]
        },
        {
            id: 3,
            userId: 3,
            fullName: "Sejal Sharma",
            email: "sejal@mgmmumbai.ac.in",
            college: "College of Engineering & Technology",
            department: "Information Technology",
            yearOfStudy: "2nd Year",
            phone: "9876543211",
            bio: "Creative designer and IT student. Certified in Adobe Photoshop. Looking to conquer core Java and web development!",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Sejal",
            verified: true,
            averageRating: 4.9,
            completedExchangesCount: 3,
            blocked: false,
            teachingSkills: [
                { id: 3, skillId: 4, skillName: "Photoshop", categoryId: 3, categoryName: "Design", levelOrUrgency: "Expert", verified: true, verificationStatus: "VERIFIED", proofDocumentUrl: "uploads/certificates/sejal_photoshop.pdf" },
                { id: 4, skillId: 5, skillName: "Graphic Design", categoryId: 3, categoryName: "Design", levelOrUrgency: "Advanced", verified: false, verificationStatus: "NEEDS_RESUBMISSION" }
            ],
            learningSkills: [
                { id: 3, skillId: 1, skillName: "Java", categoryId: 1, categoryName: "Programming", levelOrUrgency: "High" },
                { id: 4, skillId: 3, skillName: "HTML/CSS/JS", categoryId: 2, categoryName: "Web Development", levelOrUrgency: "Medium" }
            ]
        },
        {
            id: 4,
            userId: 4,
            fullName: "Raza Khan",
            email: "raza@mgmmumbai.ac.in",
            college: "College of Engineering & Technology",
            department: "Computer Science",
            yearOfStudy: "3rd Year",
            phone: "9876543212",
            bio: "Python enthusiast and data geek. Wanting to improve communication and speech delivery for campus placements.",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Raza",
            verified: false,
            averageRating: 4.5,
            completedExchangesCount: 1,
            blocked: false,
            teachingSkills: [
                { id: 5, skillId: 2, skillName: "Python", categoryId: 1, categoryName: "Programming", levelOrUrgency: "Advanced", verified: false, verificationStatus: "PENDING" },
                { id: 6, skillId: 8, skillName: "Excel & Data Analysis", categoryId: 6, categoryName: "Academic & Productivity", levelOrUrgency: "Intermediate", verified: false, verificationStatus: "NOT_VERIFIED" }
            ],
            learningSkills: [
                { id: 5, skillId: 7, skillName: "Public Speaking", categoryId: 5, categoryName: "Communication", levelOrUrgency: "High" }
            ]
        },
        {
            id: 5,
            userId: 5,
            fullName: "Udipti Sen",
            email: "udipti@mgmmumbai.ac.in",
            college: "College of Engineering & Technology",
            department: "Information Technology",
            yearOfStudy: "2nd Year",
            phone: "9876543213",
            bio: "College debate society president. Eager to help peers with confident public speaking in return for Python tutoring!",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Udipti",
            verified: true,
            averageRating: 5.0,
            completedExchangesCount: 4,
            blocked: false,
            teachingSkills: [
                { id: 7, skillId: 7, skillName: "Public Speaking", categoryId: 5, categoryName: "Communication", levelOrUrgency: "Expert", verified: true, verificationStatus: "VERIFIED", proofDocumentUrl: "uploads/certificates/debate.pdf" }
            ],
            learningSkills: [
                { id: 6, skillId: 2, skillName: "Python", categoryId: 1, categoryName: "Programming", levelOrUrgency: "High" },
                { id: 7, skillId: 8, skillName: "Excel & Data Analysis", categoryId: 6, categoryName: "Academic & Productivity", levelOrUrgency: "Medium" }
            ]
        }
    ],

    requests: [
        {
            id: 1,
            senderId: 2,
            senderName: "Harsh Vardhan",
            senderEmail: "harsh@mgmmumbai.ac.in",
            receiverId: 3,
            receiverName: "Sejal Sharma",
            skillOfferedId: 1,
            skillOfferedName: "Java",
            skillRequestedId: 4,
            skillRequestedName: "Photoshop",
            learningMode: "ONLINE",
            message: "Hey Sejal! Let's trade Java OOP lessons for Photoshop UI poster design!",
            status: "COMPLETED",
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
        },
        {
            id: 2,
            senderId: 4,
            senderName: "Raza Khan",
            senderEmail: "raza@mgmmumbai.ac.in",
            receiverId: 5,
            receiverName: "Udipti Sen",
            skillOfferedId: 2,
            skillOfferedName: "Python",
            skillRequestedId: 7,
            skillRequestedName: "Public Speaking",
            learningMode: "CHAT",
            message: "Hi Udipti! I can teach you Python basics in exchange for speech coaching.",
            status: "ACCEPTED",
            createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
        },
        {
            id: 3,
            senderId: 3,
            senderName: "Sejal Sharma",
            senderEmail: "sejal@mgmmumbai.ac.in",
            receiverId: 2,
            receiverName: "Harsh Vardhan",
            skillOfferedId: 5,
            skillOfferedName: "Graphic Design",
            skillRequestedId: 3,
            skillRequestedName: "HTML/CSS/JS",
            learningMode: "ONLINE",
            message: "Hi Harsh! Want to explore Figma design while teaching me modern CSS layouts?",
            status: "PENDING",
            createdAt: new Date().toISOString()
        }
    ],

    exchanges: [
        {
            id: 1,
            requestId: 1,
            student1Id: 2,
            student1Name: "Harsh Vardhan",
            student2Id: 3,
            student2Name: "Sejal Sharma",
            userAId: 2,
            userAName: "Harsh Vardhan",
            userBId: 3,
            userBName: "Sejal Sharma",
            skill1Id: 1,
            skill1Name: "Java",
            skill2Id: 4,
            skill2Name: "Photoshop",
            skillOfferedTitle: "Java",
            skillRequestedTitle: "Photoshop",
            learningMode: "ONLINE",
            status: "COMPLETED",
            startDate: new Date(Date.now() - 3 * 86400000).toISOString(),
            completionDate: new Date(Date.now() - 2 * 86400000).toISOString()
        },
        {
            id: 2,
            requestId: 2,
            student1Id: 4,
            student1Name: "Raza Khan",
            student2Id: 5,
            student2Name: "Udipti Sen",
            userAId: 4,
            userAName: "Raza Khan",
            userBId: 5,
            userBName: "Udipti Sen",
            skill1Id: 2,
            skill1Name: "Python",
            skill2Id: 7,
            skill2Name: "Public Speaking",
            skillOfferedTitle: "Python",
            skillRequestedTitle: "Public Speaking",
            learningMode: "CHAT",
            status: "ACTIVE",
            startDate: new Date(Date.now() - 1 * 86400000).toISOString()
        }
    ],

    messages: [
        {
            id: 1,
            senderId: 2,
            senderName: "Harsh Vardhan",
            receiverId: 3,
            receiverName: "Sejal Sharma",
            messageText: "Hi Sejal! Thanks for accepting my Java for Photoshop request!",
            sentAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            deliveredAt: new Date(Date.now() - 2 * 86400000 + 2000).toISOString(),
            seenAt: new Date(Date.now() - 2 * 86400000 + 60000).toISOString(),
            status: "SEEN",
            isRead: true,
            attachmentUrl: null,
            attachmentType: null,
            attachmentName: null,
            attachmentSize: null,
            replyTo: null
        },
        {
            id: 2,
            senderId: 3,
            senderName: "Sejal Sharma",
            receiverId: 2,
            receiverName: "Harsh Vardhan",
            messageText: "Hey Harsh! Super excited! When are you free for our first session?",
            sentAt: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString(),
            deliveredAt: new Date(Date.now() - 2 * 86400000 + 3602000).toISOString(),
            seenAt: new Date(Date.now() - 2 * 86400000 + 3660000).toISOString(),
            status: "SEEN",
            isRead: true,
            attachmentUrl: null,
            attachmentType: null,
            attachmentName: null,
            attachmentSize: null,
            replyTo: null
        },
        {
            id: 3,
            senderId: 2,
            senderName: "Harsh Vardhan",
            receiverId: 3,
            receiverName: "Sejal Sharma",
            messageText: "I'm free tomorrow after 5 PM in the college library or over Google Meet!",
            sentAt: new Date(Date.now() - 1 * 86400000).toISOString(),
            deliveredAt: new Date(Date.now() - 1 * 86400000 + 2000).toISOString(),
            seenAt: new Date(Date.now() - 1 * 86400000 + 120000).toISOString(),
            status: "SEEN",
            isRead: true,
            attachmentUrl: null,
            attachmentType: null,
            attachmentName: null,
            attachmentSize: null,
            replyTo: null
        }
    ],

    verifications: [
        {
            id: 1,
            studentId: 4,
            studentName: "Raza Khan",
            studentEmail: "raza@mgmmumbai.ac.in",
            skillId: 2,
            skillName: "Python",
            certificateName: "HackerRank Python 5-Star Gold Badge",
            certificateUrl: "uploads/verifications/raza_python.pdf",
            projectTitle: "Automated Data Scraping & Analysis Pipeline",
            projectDescription: "Built a Python-based asynchronous web scraper and pandas analysis pipeline processing 10,000+ records daily with data cleaning and CSV export.",
            projectTechnologies: "Python 3.11, BeautifulSoup4, Pandas, SQLite, Requests",
            projectLink: "https://github.com/raza-khan/python-data-pipeline",
            projectProofUrl: "uploads/proofs/raza_pipeline_screenshot.png",
            experienceTitle: "Lead Python Developer & Workshop Trainer",
            experienceOrganization: "MGM Coding Club & Techfest Committee",
            experienceDescription: "Conducted hands-on Python workshops for 80+ engineering students, built the campus competition scoring system, and reviewed peer code.",
            experienceDuration: "8 months",
            experienceStartDate: "2025-08-01",
            experienceEndDate: "Present",
            status: "PENDING",
            adminComment: "",
            submissionDate: new Date(Date.now() - 1 * 86400000).toISOString(),
            reviewedDate: null
        },
        {
            id: 2,
            studentId: 2,
            studentName: "Harsh Vardhan",
            studentEmail: "harsh@mgmmumbai.ac.in",
            skillId: 1,
            skillName: "Java",
            certificateName: "Oracle Certified Associate Java SE 11",
            certificateUrl: "uploads/certificates/harsh_java.pdf",
            projectTitle: "Enterprise Spring Boot Microservices Platform",
            projectDescription: "Architected RESTful microservices with Spring Data JPA, JWT authentication, and MySQL backend with 95%+ unit test coverage.",
            projectTechnologies: "Java 17, Spring Boot, Hibernate, MySQL, Maven, Docker",
            projectLink: "https://github.com/harsh4505/enterprise-java-suite",
            projectProofUrl: "uploads/proofs/harsh_spring_demo.png",
            experienceTitle: "Backend Engineering Teaching Assistant",
            experienceOrganization: "MGM Department of Information Technology",
            experienceDescription: "Assisted professors in evaluating Java OOP laboratory assignments and conducted weekly tutorial sessions for 60+ sophomores.",
            experienceDuration: "1 year",
            experienceStartDate: "2025-07-01",
            experienceEndDate: "Present",
            status: "VERIFIED",
            adminComment: "Outstanding project portfolio and validated departmental teaching experience.",
            submissionDate: new Date(Date.now() - 3 * 86400000).toISOString(),
            reviewedDate: new Date(Date.now() - 2 * 86400000).toISOString()
        },
        {
            id: 3,
            studentId: 3,
            studentName: "Sejal Sharma",
            studentEmail: "sejal@mgmmumbai.ac.in",
            skillId: 4,
            skillName: "Photoshop",
            certificateName: "Adobe Certified Professional in Visual Design",
            certificateUrl: "uploads/certificates/sejal_photoshop.pdf",
            projectTitle: "Brand Identity & Vector Retouching System",
            projectDescription: "Created high-resolution commercial posters, photo composite imagery, and multi-layered branding assets for college cultural fests.",
            projectTechnologies: "Adobe Photoshop 2024, Lightroom, Camera RAW",
            projectLink: "https://behance.net/sejal_photoshop_portfolio",
            projectProofUrl: "uploads/proofs/sejal_brand_suite.png",
            experienceTitle: "Head Graphic Designer",
            experienceOrganization: "MGM College Annual Magazine Editorial Board",
            experienceDescription: "Designed front-cover layouts, retouched photography, and coordinated with printers for 1,500+ physical magazine copies.",
            experienceDuration: "1.5 years",
            experienceStartDate: "2024-09-01",
            experienceEndDate: "Present",
            status: "VERIFIED",
            adminComment: "High caliber creative portfolio with confirmed publication track record.",
            submissionDate: new Date(Date.now() - 4 * 86400000).toISOString(),
            reviewedDate: new Date(Date.now() - 3 * 86400000).toISOString()
        },
        {
            id: 4,
            studentId: 3,
            studentName: "Sejal Sharma",
            studentEmail: "sejal@mgmmumbai.ac.in",
            skillId: 5,
            skillName: "Graphic Design",
            certificateName: "",
            certificateUrl: "",
            projectTitle: "College Fest Flyer Mockups",
            projectDescription: "Drafted social media flyers for college sports day.",
            projectTechnologies: "Canva, Figma",
            projectLink: "https://figma.com/@sejal_drafts",
            projectProofUrl: "",
            experienceTitle: "Design Committee Volunteer",
            experienceOrganization: "Sports Committee",
            experienceDescription: "Helped create social banners.",
            experienceDuration: "2 months",
            experienceStartDate: "2025-10-01",
            experienceEndDate: "2025-11-30",
            status: "NEEDS_RESUBMISSION",
            adminComment: "Please provide a complete Figma design system link with component variants and detailed design role responsibilities.",
            submissionDate: new Date(Date.now() - 2 * 86400000).toISOString(),
            reviewedDate: new Date(Date.now() - 1 * 86400000).toISOString()
        }
    ],

    reviews: [
        {
            id: 1,
            exchangeId: 1,
            reviewerId: 3,
            reviewerName: "Sejal Sharma",
            reviewedStudentId: 2,
            reviewedStudentName: "Harsh Vardhan",
            rating: 5,
            comment: "Harsh was phenomenal at explaining Java OOP principles and Spring fundamentals! Very articulate and helpful.",
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
        },
        {
            id: 2,
            exchangeId: 1,
            reviewerId: 2,
            reviewerName: "Harsh Vardhan",
            reviewedStudentId: 3,
            reviewedStudentName: "Sejal Sharma",
            rating: 5,
            comment: "Sejal is a Photoshop wizard! She guided me step-by-step through layers, retouching, and export formats.",
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
        }
    ],

    notifications: [
        {
            id: 1,
            recipientId: 2,
            title: "Welcome to Skill Exchange!",
            message: "Start by exploring student matches or adding skills you teach and want to learn.",
            type: "INFO",
            isRead: true,
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
        },
        {
            id: 2,
            recipientId: 2,
            title: "Incoming Proposal from Sejal",
            message: "Sejal Sharma proposed an exchange: Offering Graphic Design for HTML/CSS/JS.",
            type: "EXCHANGE_REQUEST",
            isRead: false,
            createdAt: new Date().toISOString()
        }
    ],

    reports: [
        {
            id: 1,
            reporterId: 3,
            reporterName: "Sejal Sharma",
            reportedEntity: "USER",
            reportedUserId: 4,
            reportedUserName: "Raza Khan",
            reason: "Unresponsive after agreeing to campus exchange session",
            category: "Incomplete Barter",
            description: "User agreed to meet in IT lab for Python exchange on Friday but did not attend and hasn't replied to chat.",
            evidence: "Chat timestamp screenshot 2026-09-24",
            status: "OPEN",
            priority: "MEDIUM",
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            adminNotes: ""
        },
        {
            id: 2,
            reporterId: 2,
            reporterName: "Harsh Vardhan",
            reportedEntity: "SKILL",
            reportedSkillId: 2,
            reportedSkillTitle: "Python Scripting & DSA",
            reportedUserId: 4,
            reportedUserName: "Raza Khan",
            reason: "Misleading skill level claims",
            category: "Fake Profile",
            description: "Skill is marked as Advanced but provider acknowledged they are still learning basic syntax.",
            evidence: "Message exchange excerpt",
            status: "INVESTIGATING",
            priority: "HIGH",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            adminNotes: "Reviewing student verification proof and code repository"
        },
        {
            id: 3,
            reporterId: 5,
            reporterName: "Udipti Sen",
            reportedEntity: "REVIEW",
            reportedUserId: 2,
            reportedUserName: "Harsh Vardhan",
            reason: "Duplicate or accidental review submission",
            category: "Other",
            description: "Submitted double review by mistake.",
            evidence: "Review ID #2",
            status: "RESOLVED",
            priority: "LOW",
            createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
            adminNotes: "Duplicate entry resolved and archived."
        }
    ],

    admins: [
        { id: 1, email: "admin@mgmmumbai.ac.in", name: "System Administrator", role: "SUPER_ADMIN", active: true, lastActive: new Date().toISOString(), createdAt: "2026-08-15T09:00:00Z" },
        { id: 2, email: "moderator@mgmmumbai.ac.in", name: "Prof. S. Kulkarni (Staff Auditor)", role: "MODERATOR", active: true, lastActive: new Date(Date.now() - 3600000).toISOString(), createdAt: "2026-09-01T10:00:00Z" },
        { id: 3, email: "support@mgmmumbai.ac.in", name: "Ananya Deshmukh (Student Council)", role: "SUPPORT_ADMIN", active: true, lastActive: new Date(Date.now() - 86400000).toISOString(), createdAt: "2026-09-10T14:30:00Z" }
    ],

    announcements: [
        {
            id: 1,
            title: "Semester Skill Exchange Fest Announcement",
            message: "The university semester exchange drive is now active. Complete verified trades to earn official certificate badges!",
            audience: "ALL_USERS",
            sender: "admin@mgmmumbai.ac.in",
            priority: "NORMAL",
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
        }
    ],

    settings: {
        platformName: "Student Skill Exchange Platform",
        supportEmail: "admin@mgmmumbai.ac.in",
        allowedDomain: "@mgmmumbai.ac.in",
        autoVerifyTrusted: false,
        requireProjectProof: true,
        maxActiveExchangesPerStudent: 3,
        twoFactorEnforced: false,
        maintenanceMode: false
    }
};

// Default authenticated user to Harsh (student ID 2) for immediate exploration
state.currentUser = {
    authenticated: true,
    userId: 2,
    email: "harsh@mgmmumbai.ac.in",
    role: "ROLE_STUDENT",
    fullName: "Harsh Vardhan",
    hasSeenLanding: true
};

// ===================================================================
// REQUEST DISPATCHER & REST API HANDLERS
// ===================================================================

function parseBody(req) {
    return new Promise(resolve => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                resolve({});
            }
        });
    });
}

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // Handle OPTIONS for CORS
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return;
    }

    // -------------------------------------------------------------------
    // REST API ENDPOINTS
    // -------------------------------------------------------------------

    if (pathname.startsWith('/api/')) {
        // --- 1. AUTHENTICATION & SECURITY ---
        if (pathname === '/api/auth/current-user' && req.method === 'GET') {
            if (state.currentUser) {
                const prof = state.profiles.find(p => p.userId === state.currentUser.userId);
                if (prof) {
                    state.currentUser.avatarUrl = prof.avatarUrl || null;
                    if (prof.fullName) state.currentUser.fullName = prof.fullName;
                }
                const usr = state.users.find(u => u.id === state.currentUser.userId);
                if (usr) {
                    state.currentUser.hasSeenLanding = usr.hasSeenLanding !== false;
                }
            }
            return sendJson(res, 200, { success: true, data: state.currentUser });
        }

        if (pathname === '/api/auth/seen-landing' && req.method === 'POST') {
            if (state.currentUser) {
                state.currentUser.hasSeenLanding = true;
                const usr = state.users.find(u => u.id === state.currentUser.userId);
                if (usr) usr.hasSeenLanding = true;
            }
            return sendJson(res, 200, { success: true, message: "Landing page marked as seen." });
        }

        if (pathname === '/api/auth/login' && req.method === 'POST') {
            const body = await parseBody(req);
            const normalizedEmail = (body.email || '').trim().toLowerCase();

            // Backend validation: Official college email address ending with @mgmmumbai.ac.in
            if (!isValidCollegeEmail(normalizedEmail)) {
                return sendJson(res, 400, {
                    success: false,
                    message: "Please use your official college email address ending with @mgmmumbai.ac.in."
                });
            }

            const user = state.users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === body.password);
            if (!user) {
                return sendJson(res, 401, { success: false, message: "Invalid email or password" });
            }

            // Existing accounts must adhere to official college domain rule
            if (!isValidCollegeEmail(user.email)) {
                return sendJson(res, 403, {
                    success: false,
                    message: "Please use your official college email address ending with @mgmmumbai.ac.in."
                });
            }

            // Email verification check
            if (user.emailVerified === false) {
                return sendJson(res, 403, {
                    success: false,
                    unverified: true,
                    email: user.email,
                    message: "Your college email address has not been verified yet. Please complete email verification."
                });
            }

            if (!user.active) {
                return sendJson(res, 403, { success: false, message: "This account has been deactivated or suspended by administrator." });
            }

            const profile = state.profiles.find(p => p.userId === user.id);
            state.currentUser = {
                authenticated: true,
                userId: user.id,
                email: user.email,
                role: user.role,
                avatarUrl: profile ? profile.avatarUrl : null,
                fullName: profile ? profile.fullName : (user.role === 'ROLE_ADMIN' ? 'System Administrator' : user.email),
                hasSeenLanding: user.hasSeenLanding !== false
            };

            // Audit log
            state.auditLogs.unshift({
                id: Date.now(),
                action: "USER_LOGIN",
                performedBy: user.email,
                target: user.email,
                timestamp: new Date().toISOString(),
                details: "Successful login session established."
            });

            return sendJson(res, 200, { success: true, message: "Login successful", data: state.currentUser });
        }

        if (pathname === '/api/auth/logout' && req.method === 'POST') {
            if (state.currentUser) {
                state.auditLogs.unshift({
                    id: Date.now(),
                    action: "USER_LOGOUT",
                    performedBy: state.currentUser.email,
                    target: state.currentUser.email,
                    timestamp: new Date().toISOString(),
                    details: "User logged out."
                });
            }
            state.currentUser = null;
            return sendJson(res, 200, { success: true, message: "Logged out" });
        }

        if (pathname === '/api/auth/register' && req.method === 'POST') {
            const body = await parseBody(req);
            const normalizedEmail = (body.email || '').trim().toLowerCase();

            // Strict Backend validation: Reject any domain not ending in @mgmmumbai.ac.in
            if (!isValidCollegeEmail(normalizedEmail)) {
                return sendJson(res, 400, {
                    success: false,
                    message: "Only college email addresses ending with @mgmmumbai.ac.in are authorized to register."
                });
            }

            const existingUser = state.users.find(u => u.email.toLowerCase() === normalizedEmail);
            if (existingUser && existingUser.emailVerified && existingUser.active) {
                return sendJson(res, 409, {
                    success: false,
                    message: "An active account with this college email already exists. Please login."
                });
            }

            // Generate secure 6-digit OTP
            const otpCode = generateSecureOtp();
            const studentName = (body.fullName || '').trim() || 'Student';

            // Attempt delivery through real Gmail SMTP
            try {
                await sendVerificationEmail(normalizedEmail, studentName, otpCode);
            } catch (err) {
                return sendJson(res, 500, {
                    success: false,
                    message: "We couldn't send the verification email. Please try again."
                });
            }

            let user = existingUser;
            if (!user) {
                const newId = state.users.length + 1;
                user = {
                    id: newId,
                    email: normalizedEmail,
                    role: "ROLE_STUDENT",
                    password: body.password,
                    active: false,
                    emailVerified: false,
                    hasSeenLanding: false
                };
                state.users.push(user);

                const newProfile = {
                    id: newId,
                    userId: newId,
                    fullName: studentName,
                    email: normalizedEmail,
                    college: (body.college || 'MGM College of Engineering & Technology').trim(),
                    department: body.department || 'Information Technology',
                    yearOfStudy: body.yearOfStudy || '2nd Year',
                    phone: (body.phone || '').trim(),
                    bio: `Hello! I am a student at ${body.college || 'MGM'} looking to exchange skills.`,
                    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${newId}`,
                    verified: false,
                    averageRating: 0.0,
                    completedExchangesCount: 0,
                    blocked: false,
                    teachingSkills: [],
                    learningSkills: []
                };
                state.profiles.push(newProfile);
            } else {
                // Update password for unverified account re-attempting registration
                user.password = body.password;
                user.active = false;
                user.emailVerified = false;
            }

            // Store securely hashed OTP with 10-minute expiry
            state.otps[normalizedEmail] = {
                otpHash: hashOtp(otpCode),
                type: 'EMAIL_VERIFICATION',
                expiresAt: Date.now() + 10 * 60 * 1000,
                attempts: 0,
                lastSentAt: Date.now()
            };

            // Audit log without secret or OTP
            state.auditLogs.unshift({
                id: Date.now(),
                action: "STUDENT_REGISTRATION",
                performedBy: normalizedEmail,
                target: normalizedEmail,
                timestamp: new Date().toISOString(),
                details: "New college student registration initiated. Verification OTP dispatched via Gmail SMTP."
            });

            return sendJson(res, 200, {
                success: true,
                requiresVerification: true,
                email: normalizedEmail,
                message: "Registration initiated! A 6-digit verification code has been dispatched to your @mgmmumbai.ac.in college email."
            });
        }

        // --- EMAIL VERIFICATION ENDPOINTS ---
        if (pathname === '/api/auth/verify-email' && req.method === 'POST') {
            const body = await parseBody(req);
            const email = (body.email || '').trim().toLowerCase();
            const otp = (body.otp || '').trim();

            if (!isValidCollegeEmail(email)) {
                return sendJson(res, 400, { success: false, message: "Invalid college email address." });
            }

            if (!/^\d{6}$/.test(otp)) {
                return sendJson(res, 400, { success: false, message: "Please provide a valid 6-digit confirmation code." });
            }

            const record = state.otps[email];
            if (!record || record.type !== 'EMAIL_VERIFICATION') {
                return sendJson(res, 400, { success: false, message: "No active verification code found for this email. Please request a new one." });
            }

            if (Date.now() > record.expiresAt) {
                delete state.otps[email];
                return sendJson(res, 400, { success: false, message: "This verification code has expired. Please request a new code." });
            }

            if (record.attempts >= 5) {
                delete state.otps[email];
                return sendJson(res, 429, { success: false, message: "Too many incorrect attempts. Please request a new verification code." });
            }

            if (record.otpHash !== hashOtp(otp)) {
                record.attempts++;
                const remaining = 5 - record.attempts;
                if (remaining <= 0) {
                    delete state.otps[email];
                    return sendJson(res, 429, { success: false, message: "Too many incorrect attempts. Please request a new verification code." });
                }
                return sendJson(res, 400, { success: false, message: `Incorrect verification code. Please try again. (${remaining} attempts remaining)` });
            }

            // Verification successful
            delete state.otps[email];
            const user = state.users.find(u => u.email.toLowerCase() === email);
            if (user) {
                user.emailVerified = true;
                user.active = true;
            }

            state.auditLogs.unshift({
                id: Date.now(),
                action: "EMAIL_VERIFIED",
                performedBy: email,
                target: email,
                timestamp: new Date().toISOString(),
                details: "College email verified and student account activated."
            });

            return sendJson(res, 200, {
                success: true,
                message: "College email verified successfully! Your account is now active. You may log in."
            });
        }

        if (pathname === '/api/auth/resend-otp' && req.method === 'POST') {
            const body = await parseBody(req);
            const email = (body.email || '').trim().toLowerCase();

            if (!isValidCollegeEmail(email)) {
                return sendJson(res, 400, { success: false, message: "Invalid college email address." });
            }

            const user = state.users.find(u => u.email.toLowerCase() === email);
            if (!user) {
                return sendJson(res, 404, { success: false, message: "No registered student account found with this email." });
            }

            if (user.emailVerified && user.active) {
                return sendJson(res, 400, { success: false, message: "This account has already been verified. You can log in directly." });
            }

            const record = state.otps[email];
            if (record && (Date.now() - record.lastSentAt) < 60000) {
                const waitSec = Math.ceil((60000 - (Date.now() - record.lastSentAt)) / 1000);
                return sendJson(res, 429, { success: false, message: `Please wait ${waitSec}s before requesting a new code.` });
            }

            const newOtp = generateSecureOtp();
            const profile = state.profiles.find(p => p.email.toLowerCase() === email);
            const studentName = profile ? profile.fullName : 'Student';

            try {
                await sendVerificationEmail(email, studentName, newOtp);
            } catch (err) {
                return sendJson(res, 500, {
                    success: false,
                    message: "We couldn't send the verification email. Please try again."
                });
            }

            // Invalidate old OTP and store new hashed OTP
            state.otps[email] = {
                otpHash: hashOtp(newOtp),
                type: 'EMAIL_VERIFICATION',
                expiresAt: Date.now() + 10 * 60 * 1000,
                attempts: 0,
                lastSentAt: Date.now()
            };

            return sendJson(res, 200, {
                success: true,
                message: "A fresh 6-digit verification code has been dispatched to your official college email."
            });
        }

        // --- PASSWORD RESET ENDPOINTS ---
        if (pathname === '/api/auth/forgot-password' && req.method === 'POST') {
            const body = await parseBody(req);
            const email = (body.email || '').trim().toLowerCase();

            if (!isValidCollegeEmail(email)) {
                return sendJson(res, 400, { success: false, message: "Please provide a valid college email ending with @mgmmumbai.ac.in." });
            }

            const user = state.users.find(u => u.email.toLowerCase() === email);
            if (!user) {
                return sendJson(res, 404, { success: false, message: "No registered student account found with this college email." });
            }

            const resetOtp = generateSecureOtp();
            const profile = state.profiles.find(p => p.email.toLowerCase() === email);
            const studentName = profile ? profile.fullName : 'Student';

            try {
                await sendPasswordResetEmail(email, studentName, resetOtp);
            } catch (err) {
                return sendJson(res, 500, {
                    success: false,
                    message: "We couldn't send the password reset email. Please try again."
                });
            }

            state.otps[email] = {
                otpHash: hashOtp(resetOtp),
                type: 'PASSWORD_RESET',
                expiresAt: Date.now() + 15 * 60 * 1000,
                attempts: 0,
                lastSentAt: Date.now()
            };

            return sendJson(res, 200, {
                success: true,
                message: "Password reset code dispatched to your official college email."
            });
        }

        if (pathname === '/api/auth/reset-password' && req.method === 'POST') {
            const body = await parseBody(req);
            const email = (body.email || '').trim().toLowerCase();
            const otp = (body.otp || '').trim();
            const newPassword = body.newPassword || '';
            const confirmPassword = body.confirmPassword || '';

            if (newPassword.length < 6) {
                return sendJson(res, 400, { success: false, message: "Password must be at least 6 characters long." });
            }
            if (newPassword !== confirmPassword) {
                return sendJson(res, 400, { success: false, message: "Passwords do not match." });
            }

            const record = state.otps[email];
            if (!record || record.type !== 'PASSWORD_RESET') {
                return sendJson(res, 400, { success: false, message: "No password reset request found for this email." });
            }

            if (Date.now() > record.expiresAt) {
                delete state.otps[email];
                return sendJson(res, 400, { success: false, message: "Password reset code has expired. Please request a new code." });
            }

            if (record.attempts >= 5) {
                delete state.otps[email];
                return sendJson(res, 429, { success: false, message: "Too many incorrect attempts. Please request a new code." });
            }

            if (record.otpHash !== hashOtp(otp)) {
                record.attempts++;
                const remaining = 5 - record.attempts;
                if (remaining <= 0) {
                    delete state.otps[email];
                    return sendJson(res, 429, { success: false, message: "Too many incorrect attempts. Please request a new code." });
                }
                return sendJson(res, 400, { success: false, message: `Incorrect reset code. Please try again. (${remaining} attempts remaining)` });
            }

            delete state.otps[email];
            const user = state.users.find(u => u.email.toLowerCase() === email);
            if (user) {
                user.password = newPassword;
            }

            state.auditLogs.unshift({
                id: Date.now(),
                action: "PASSWORD_RESET",
                performedBy: email,
                target: email,
                timestamp: new Date().toISOString(),
                details: "Student account password was reset successfully."
            });

            return sendJson(res, 200, { success: true, message: "Password reset successfully! You can now log in with your new password." });
        }

        // --- PUBLIC PLATFORM STATISTICS ---
        if (pathname === '/api/stats' && req.method === 'GET') {
            const totalStudents = state.users.filter(u => u.role === 'ROLE_STUDENT').length;
            const totalSkills = state.skills.length;
            const verifiedSkillsCount = state.profiles.reduce((acc, p) => acc + (p.teachingSkills ? p.teachingSkills.filter(t => t.verified || t.verificationStatus === 'VERIFIED').length : 0), 0);
            const activeExchanges = state.exchanges.filter(e => e.status === 'ACTIVE').length;
            const completedExchanges = state.exchanges.filter(e => e.status === 'COMPLETED').length;

            return sendJson(res, 200, {
                success: true,
                data: {
                    totalStudents,
                    totalSkills,
                    verifiedSkillsCount,
                    activeExchanges,
                    completedExchanges
                }
            });
        }

        // --- SECURE FILE UPLOAD ---
        if (pathname === '/api/upload' && req.method === 'POST') {
            const body = await parseBody(req);
            const fileName = body.fileName || 'file.dat';
            const fileData = body.fileData || ''; // base64 or text
            const rawFolder = (body.folder || 'chat').replace(/[^a-z0-9_-]/gi, '');
            const folder = ['chat', 'avatars', 'proofs'].includes(rawFolder) ? rawFolder : 'chat';

            const ext = path.extname(fileName).toLowerCase();
            const allowedExts = [
                '.pdf', '.png', '.jpg', '.jpeg', '.webp', '.gif',
                '.doc', '.docx', '.txt', '.zip', '.mp4', '.webm'
            ];
            const dangerousExts = ['.exe', '.bat', '.cmd', '.sh', '.php', '.js', '.py', '.html', '.msi', '.vbs', '.jar', '.com', '.scr'];

            if (dangerousExts.includes(ext)) {
                return sendJson(res, 400, { success: false, message: "Security Warning: Executable and script file uploads are strictly prohibited." });
            }

            if (!allowedExts.includes(ext)) {
                return sendJson(res, 400, { success: false, message: "Invalid file type. Allowed formats: Images (PNG, JPG, WEBP, GIF), Documents (PDF, DOC, DOCX, TXT, ZIP), Videos (MP4, WEBM)." });
            }

            // Generate safe filename
            const prefix = folder === 'avatars' ? 'avatar' : (folder === 'proofs' ? 'proof' : 'chat');
            const safeName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
            const uploadDir = path.join(STATIC_DIR, 'uploads', folder);
            try {
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const buffer = Buffer.from(fileData.replace(/^data:[^;]+;base64,/, ''), 'base64');
                // Enforce 15MB limit
                if (buffer.length > 15 * 1024 * 1024) {
                    return sendJson(res, 400, { success: false, message: "File exceeds maximum permitted size of 15MB." });
                }
                fs.writeFileSync(path.join(uploadDir, safeName), buffer);
                const fileUrl = `uploads/${folder}/${safeName}`;

                // Formatted file size string
                let formattedSize = (buffer.length / 1024).toFixed(1) + ' KB';
                if (buffer.length >= 1024 * 1024) {
                    formattedSize = (buffer.length / (1024 * 1024)).toFixed(1) + ' MB';
                }

                // File category
                let fileCategory = 'file';
                if (['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext)) fileCategory = 'image';
                else if (['.mp4', '.webm'].includes(ext)) fileCategory = 'video';

                return sendJson(res, 200, {
                    success: true,
                    url: fileUrl,
                    fileName: fileName,
                    fileSize: buffer.length,
                    formattedSize: formattedSize,
                    fileType: fileCategory,
                    message: "File uploaded securely."
                });
            } catch (err) {
                return sendJson(res, 500, { success: false, message: "Failed to upload file: " + err.message });
            }
        }

        // --- 2. STUDENT PROFILES & IDOR PROTECTION ---
        if (pathname === '/api/students' && req.method === 'GET') {
            return sendJson(res, 200, { success: true, data: state.profiles.filter(p => !p.blocked) });
        }

        if (pathname === '/api/students/profile/me' && req.method === 'GET') {
            if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Not logged in" });
            const prof = state.profiles.find(p => p.userId === state.currentUser.userId);
            return sendJson(res, 200, { success: true, data: prof || {} });
        }

        if (pathname === '/api/students/avatar' && req.method === 'POST') {
            if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
            const body = await parseBody(req);
            const fileData = body.fileData || body.image || '';
            const fileName = (body.fileName || body.filename || 'avatar.png').replace(/[^a-zA-Z0-9._-]/g, '_');
            const ext = path.extname(fileName).toLowerCase() || '.png';
            const allowedExts = ['.png', '.jpg', '.jpeg', '.webp'];

            if (!allowedExts.includes(ext)) {
                return sendJson(res, 400, { success: false, message: "Invalid image format. Allowed formats: PNG, JPG, JPEG, WEBP." });
            }

            try {
                const buffer = Buffer.from(fileData.replace(/^data:[^;]+;base64,/, ''), 'base64');
                if (buffer.length === 0) {
                    return sendJson(res, 400, { success: false, message: "No image data received." });
                }
                if (buffer.length > 5 * 1024 * 1024) {
                    return sendJson(res, 400, { success: false, message: "Image exceeds 5MB maximum file size." });
                }

                // Verify magic bytes for genuine image header
                const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
                const isJpg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
                const isWebp = buffer.length > 12 && buffer.toString('ascii', 8, 12) === 'WEBP';

                if (!isPng && !isJpg && !isWebp) {
                    return sendJson(res, 400, { success: false, message: "Security error: File content does not match allowed image formats." });
                }

                const safeName = `avatar_${state.currentUser.userId}_${Date.now()}${ext}`;
                const uploadDir = path.join(STATIC_DIR, 'uploads', 'avatars');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                fs.writeFileSync(path.join(uploadDir, safeName), buffer);
                const avatarUrl = `uploads/avatars/${safeName}`;

                const prof = state.profiles.find(p => p.userId === state.currentUser.userId);
                if (prof) {
                    prof.avatarUrl = avatarUrl;
                }
                state.currentUser.avatarUrl = avatarUrl;

                return sendJson(res, 200, {
                    success: true,
                    avatarUrl: avatarUrl,
                    message: "Profile photo uploaded and updated successfully."
                });
            } catch (err) {
                return sendJson(res, 500, { success: false, message: "Failed to save profile photo: " + err.message });
            }
        }

        if (pathname === '/api/students/avatar' && req.method === 'DELETE') {
            if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
            const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${state.currentUser.userId}`;
            const prof = state.profiles.find(p => p.userId === state.currentUser.userId);
            if (prof) {
                prof.avatarUrl = defaultAvatar;
            }
            state.currentUser.avatarUrl = defaultAvatar;
            return sendJson(res, 200, {
                success: true,
                avatarUrl: defaultAvatar,
                message: "Profile photo removed and restored to default avatar."
            });
        }

        if (pathname.match(/^\/api\/students\/(\d+)$/) && req.method === 'GET') {
            const id = Number(pathname.split('/')[3]);
            const prof = state.profiles.find(p => p.userId === id);
            return sendJson(res, 200, { success: true, data: prof || {} });
        }

        // IDOR-Protected Profile Update
        if (pathname.match(/^\/api\/students\/(\d+)$/) && req.method === 'PUT') {
            const id = Number(pathname.split('/')[3]);
            const myId = state.currentUser ? state.currentUser.userId : null;
            const isStaff = state.currentUser && state.currentUser.role === 'ROLE_ADMIN';

            if (!isStaff && myId !== id) {
                return sendJson(res, 403, { success: false, message: "Access Denied: You cannot modify another student's profile." });
            }

            const body = await parseBody(req);
            const prof = state.profiles.find(p => p.userId === id);
            if (prof) {
                Object.assign(prof, body);
            }
            return sendJson(res, 200, { success: true, data: prof });
        }

        // --- STUDENT PROJECTS PORTFOLIO ---
        if (pathname.match(/^\/api\/students\/(\d+)\/projects$/) && req.method === 'GET') {
            const studentId = Number(pathname.split('/')[3]);
            const list = state.projects.filter(pr => pr.studentId === studentId);
            return sendJson(res, 200, { success: true, data: list });
        }

        if (pathname === '/api/students/projects' && req.method === 'POST') {
            const body = await parseBody(req);
            const myId = state.currentUser ? state.currentUser.userId : 2;

            const projTitle = (body.title || body.projectTitle || '').trim();
            const projDesc = (body.description || '').trim();
            const projTech = (body.technologies || '').trim();
            const projLink = (body.link || body.projectLink || '').trim();

            if (!projTitle || !projDesc) {
                return sendJson(res, 400, { success: false, message: "Title and description are required for project." });
            }

            const newProject = {
                id: state.projects.length + 1,
                studentId: myId,
                title: projTitle,
                description: projDesc,
                technologies: projTech,
                link: projLink,
                projectLink: projLink,
                proofUrl: (body.proofUrl || '').trim(),
                createdAt: new Date().toISOString()
            };
            state.projects.unshift(newProject);
            return sendJson(res, 200, { success: true, data: newProject, message: "Project added to portfolio." });
        }

        if (pathname.match(/^\/api\/students\/projects\/(\d+)$/) && req.method === 'DELETE') {
            const projectId = Number(pathname.split('/')[4]);
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const project = state.projects.find(pr => pr.id === projectId);
            if (project && project.studentId !== myId && state.currentUser.role !== 'ROLE_ADMIN') {
                return sendJson(res, 403, { success: false, message: "Cannot delete another student's project." });
            }
            state.projects = state.projects.filter(pr => pr.id !== projectId);
            return sendJson(res, 200, { success: true, message: "Project deleted." });
        }

        // --- STUDENT EXPERIENCES ---
        if (pathname.match(/^\/api\/students\/(\d+)\/experiences$/) && req.method === 'GET') {
            const studentId = Number(pathname.split('/')[3]);
            const list = state.experiences.filter(ex => ex.studentId === studentId);
            return sendJson(res, 200, { success: true, data: list });
        }

        if (pathname === '/api/students/experiences' && req.method === 'POST') {
            const body = await parseBody(req);
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const expTitle = (body.title || body.role || '').trim();
            const expOrg = (body.organization || '').trim();
            const expDesc = (body.description || '').trim();

            if (!expTitle || !expOrg || !expDesc) {
                return sendJson(res, 400, { success: false, message: "Role title, organization, and description are required." });
            }

            const newExp = {
                id: state.experiences.length + 1,
                studentId: myId,
                title: expTitle,
                role: expTitle,
                organization: expOrg,
                description: expDesc,
                duration: (body.duration || '').trim(),
                startDate: (body.startDate || '').trim(),
                endDate: (body.endDate || (body.currentlyWorking || body.isCurrent ? 'Present' : '')).trim(),
                currentlyWorking: !!(body.currentlyWorking || body.isCurrent),
                isCurrent: !!(body.currentlyWorking || body.isCurrent),
                createdAt: new Date().toISOString()
            };
            state.experiences.unshift(newExp);
            return sendJson(res, 200, { success: true, data: newExp, message: "Experience added to profile." });
        }

        if (pathname.match(/^\/api\/students\/experiences\/(\d+)$/) && req.method === 'DELETE') {
            const expId = Number(pathname.split('/')[4]);
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const exp = state.experiences.find(e => e.id === expId);
            if (exp && exp.studentId !== myId && state.currentUser.role !== 'ROLE_ADMIN') {
                return sendJson(res, 403, { success: false, message: "Cannot delete another student's experience record." });
            }
            state.experiences = state.experiences.filter(e => e.id !== expId);
            return sendJson(res, 200, { success: true, message: "Experience record deleted." });
        }

        // --- BLOCK / UNBLOCK PEER SYSTEM ---
        if (pathname === '/api/students/block' && req.method === 'POST') {
            const body = await parseBody(req);
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const targetId = Number(body.targetUserId);

            if (myId === targetId) {
                return sendJson(res, 400, { success: false, message: "You cannot block yourself." });
            }

            if (!state.blockedUsers.some(b => b.blockerId === myId && b.blockedId === targetId)) {
                state.blockedUsers.push({
                    blockerId: myId,
                    blockedId: targetId,
                    blockedAt: new Date().toISOString()
                });
            }
            return sendJson(res, 200, { success: true, message: "Student blocked. They will no longer be able to message you or propose exchanges." });
        }

        if (pathname === '/api/students/unblock' && req.method === 'POST') {
            const body = await parseBody(req);
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const targetId = Number(body.targetUserId);

            state.blockedUsers = state.blockedUsers.filter(b => !(b.blockerId === myId && b.blockedId === targetId));
            return sendJson(res, 200, { success: true, message: "Student unblocked." });
        }

        if (pathname === '/api/students/blocked' && req.method === 'GET') {
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const blockedIds = state.blockedUsers.filter(b => b.blockerId === myId).map(b => b.blockedId);
            const list = state.profiles.filter(p => blockedIds.includes(p.userId));
            return sendJson(res, 200, { success: true, data: list });
        }

        // Add/remove teaching skill
        if (pathname === '/api/students/skills/teach' && req.method === 'POST') {
            const skillId = Number(parsedUrl.query.skillId);
            const level = parsedUrl.query.proficiencyLevel || 'Intermediate';
            const prof = state.profiles.find(p => p.userId === state.currentUser.userId);
            const skill = state.skills.find(s => s.id === skillId);
            if (prof && skill) {
                if (!prof.teachingSkills.some(t => t.skillId === skillId)) {
                    prof.teachingSkills.push({
                        id: Date.now(),
                        skillId: skill.id,
                        skillName: skill.name,
                        categoryId: skill.categoryId,
                        categoryName: skill.categoryName,
                        levelOrUrgency: level,
                        verified: false,
                        verificationStatus: 'NOT_VERIFIED'
                    });
                }
            }
            return sendJson(res, 200, { success: true, message: "Skill added to teaching list" });
        }

        if (pathname.match(/^\/api\/students\/skills\/teach\/(\d+)$/) && req.method === 'DELETE') {
            const skillId = Number(pathname.split('/')[5]);
            const prof = state.profiles.find(p => p.userId === state.currentUser.userId);
            if (prof) {
                prof.teachingSkills = prof.teachingSkills.filter(t => t.skillId !== skillId);
            }
            return sendJson(res, 200, { success: true, message: "Skill removed" });
        }

        // Add/remove learning skill
        if (pathname === '/api/students/skills/learn' && req.method === 'POST') {
            const skillId = Number(parsedUrl.query.skillId);
            const urgency = parsedUrl.query.urgencyLevel || 'Medium';
            const prof = state.profiles.find(p => p.userId === state.currentUser.userId);
            const skill = state.skills.find(s => s.id === skillId);
            if (prof && skill) {
                if (!prof.learningSkills.some(l => l.skillId === skillId)) {
                    prof.learningSkills.push({
                        id: Date.now(),
                        skillId: skill.id,
                        skillName: skill.name,
                        categoryId: skill.categoryId,
                        categoryName: skill.categoryName,
                        levelOrUrgency: urgency
                    });
                }
            }
            return sendJson(res, 200, { success: true, message: "Skill added to learning wishlist" });
        }

        if (pathname.match(/^\/api\/students\/skills\/learn\/(\d+)$/) && req.method === 'DELETE') {
            const skillId = Number(pathname.split('/')[5]);
            const prof = state.profiles.find(p => p.userId === state.currentUser.userId);
            if (prof) {
                prof.learningSkills = prof.learningSkills.filter(l => l.skillId !== skillId);
            }
            return sendJson(res, 200, { success: true, message: "Skill removed" });
        }

        // --- 3. SKILLS & CATEGORIES ---
        if (pathname === '/api/skills/categories' && req.method === 'GET') {
            const data = state.categories.map(c => ({
                ...c,
                skillCount: state.skills.filter(s => s.categoryId === c.id).length
            }));
            return sendJson(res, 200, { success: true, data });
        }

        if (pathname === '/api/skills' && req.method === 'GET') {
            return sendJson(res, 200, { success: true, data: state.skills });
        }

        if (pathname === '/api/skills' && req.method === 'POST') {
            const body = await parseBody(req);
            const cat = state.categories.find(c => c.id === Number(body.categoryId));
            const newSkill = {
                id: state.skills.length + 1,
                name: body.name,
                categoryId: Number(body.categoryId),
                categoryName: cat ? cat.name : "General",
                description: body.description || ""
            };
            state.skills.push(newSkill);
            return sendJson(res, 200, { success: true, data: newSkill });
        }

        // --- 4. EXPLAINABLE MATCHING ALGORITHM (MODULE 4) ---
        if (pathname === '/api/matches' && req.method === 'GET') {
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const myProf = state.profiles.find(p => p.userId === myId);

            const myWantsSkillIds = myProf ? new Set(myProf.learningSkills.map(l => l.skillId)) : new Set();
            const myTeachesSkillIds = myProf ? new Set(myProf.teachingSkills.map(t => t.skillId)) : new Set();

            const matches = [];

            for (const cand of state.profiles) {
                if (cand.userId === myId || cand.blocked) continue;

                // What candidate teaches that I want
                const directMatch = cand.teachingSkills.find(t => myWantsSkillIds.has(t.skillId));
                // What I teach that candidate wants
                const reverseMatch = cand.learningSkills.find(l => myTeachesSkillIds.has(l.skillId));

                let score = 0;
                const breakdown = [];

                // 1. Direct (40%)
                if (directMatch) {
                    score += 40;
                    breakdown.push(`Teaches ${directMatch.skillName} (+40%)`);
                } else if (!myProf) {
                    score += 20;
                }

                // 2. Reverse Mutual (20%)
                let isMutual = false;
                if (reverseMatch) {
                    score += 20;
                    isMutual = true;
                    breakdown.push(`Wants to learn ${reverseMatch.skillName} (+20% Mutual Barter)`);
                }

                // 3. Rating (15%)
                const rating = cand.averageRating > 0 ? cand.averageRating : 3.5;
                const ratingScore = (rating / 5.0) * 15;
                score += ratingScore;
                breakdown.push(`Rating ${rating.toFixed(1)}★ (+${ratingScore.toFixed(1)}%)`);

                // 4. Verification (15%)
                if (cand.verified || (directMatch && directMatch.verified)) {
                    score += 15;
                    breakdown.push("Verified Skill Badge (+15%)");
                } else {
                    score += 6;
                    breakdown.push("Standard Profile (+6%)");
                }

                // 5. Academic synergy (10%)
                if (myProf && cand.department === myProf.department && cand.college === myProf.college) {
                    score += 10;
                    breakdown.push("Same Department & College (+10%)");
                } else if (myProf && cand.college === myProf.college) {
                    score += 7;
                    breakdown.push("Same College (+7%)");
                } else {
                    score += 4;
                    breakdown.push("Cross-Campus (+4%)");
                }

                const primaryTeach = directMatch || cand.teachingSkills[0];
                const primaryLearn = reverseMatch || cand.learningSkills[0];

                const allCats = new Set();
                if (primaryTeach && primaryTeach.categoryName) allCats.add(primaryTeach.categoryName);
                cand.teachingSkills.forEach(t => { if (t.categoryName) allCats.add(t.categoryName); });
                cand.learningSkills.forEach(l => { if (l.categoryName) allCats.add(l.categoryName); });

                matches.push({
                    studentId: cand.id,
                    userId: cand.userId,
                    studentName: cand.fullName,
                    college: cand.college,
                    department: cand.department,
                    yearOfStudy: cand.yearOfStudy,
                    avatarUrl: cand.avatarUrl,
                    averageRating: cand.averageRating,
                    verified: cand.verified,
                    categoryName: primaryTeach ? primaryTeach.categoryName : "General",
                    categories: Array.from(allCats),
                    skillTheyTeachYou: primaryTeach ? primaryTeach.skillName : "Explore Skills",
                    skillTheyTeachYouId: primaryTeach ? primaryTeach.skillId : null,
                    skillTheyTeachYouVerified: primaryTeach ? (primaryTeach.verified || primaryTeach.verificationStatus === 'VERIFIED') : false,
                    skillYouTeachThem: reverseMatch ? reverseMatch.skillName : "",
                    skillYouTeachThemId: reverseMatch ? reverseMatch.skillId : null,
                    teachingSkills: cand.teachingSkills || [],
                    learningSkills: cand.learningSkills || [],
                    isMutualMatch: isMutual && !!directMatch,
                    matchPercentage: Math.min(100, Math.round(score)),
                    matchReason: breakdown.join(" | ")
                });
            }

            matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
            return sendJson(res, 200, { success: true, data: matches });
        }

        // --- 5. EXCHANGE REQUESTS & HISTORY ---
        if (pathname === '/api/exchange-requests' && req.method === 'GET') {
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const reqs = state.requests.filter(r => r.senderId === myId || r.receiverId === myId).map(r => {
                const senderProf = state.profiles.find(p => p.userId === r.senderId);
                const ts = senderProf ? senderProf.teachingSkills.find(t => t.skillId === r.skillOfferedId) : null;
                return {
                    ...r,
                    skillOfferedVerified: ts ? (ts.verified || ts.verificationStatus === 'VERIFIED') : false
                };
            });
            return sendJson(res, 200, { success: true, data: reqs });
        }

        if (pathname === '/api/exchange-requests/pending' && req.method === 'GET') {
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const reqs = state.requests.filter(r => r.receiverId === myId && r.status === 'PENDING').map(r => {
                const senderProf = state.profiles.find(p => p.userId === r.senderId);
                const ts = senderProf ? senderProf.teachingSkills.find(t => t.skillId === r.skillOfferedId) : null;
                return {
                    ...r,
                    skillOfferedVerified: ts ? (ts.verified || ts.verificationStatus === 'VERIFIED') : false
                };
            });
            return sendJson(res, 200, { success: true, data: reqs });
        }

        if (pathname === '/api/exchange-requests' && req.method === 'POST') {
            const body = await parseBody(req);
            const myId = state.currentUser ? state.currentUser.userId : 2;

            if (body.receiverId === myId) {
                return sendJson(res, 400, { success: false, message: "You cannot send an exchange proposal to yourself." });
            }

            if (state.blockedUsers.some(b => (b.blockerId === myId && b.blockedId === body.receiverId) || (b.blockerId === body.receiverId && b.blockedId === myId))) {
                return sendJson(res, 403, { success: false, message: "Cannot propose skill exchange with a blocked student." });
            }

            if (state.requests.some(r => r.senderId === myId && r.receiverId === body.receiverId && r.skillOfferedId === body.skillOfferedId && r.skillRequestedId === body.skillRequestedId && r.status === 'PENDING')) {
                return sendJson(res, 409, { success: false, message: "An active exchange proposal with these skills is already pending." });
            }

            const senderProf = state.profiles.find(p => p.userId === myId);
            const receiverProf = state.profiles.find(p => p.userId === body.receiverId);
            const skillOffered = state.skills.find(s => s.id === body.skillOfferedId);
            const skillReq = state.skills.find(s => s.id === body.skillRequestedId);

            const newReq = {
                id: state.requests.length + 1,
                senderId: myId,
                senderName: senderProf ? senderProf.fullName : "Student",
                senderEmail: senderProf ? senderProf.email : "",
                receiverId: body.receiverId,
                receiverName: receiverProf ? receiverProf.fullName : "Student",
                skillOfferedId: body.skillOfferedId,
                skillOfferedName: skillOffered ? skillOffered.name : "",
                skillRequestedId: body.skillRequestedId,
                skillRequestedName: skillReq ? skillReq.name : "",
                learningMode: body.learningMode || "ONLINE",
                message: body.message || "",
                status: "PENDING",
                createdAt: new Date().toISOString()
            };
            state.requests.unshift(newReq);

            // Audit log
            state.auditLogs.unshift({
                id: Date.now(),
                action: "EXCHANGE_PROPOSAL_SENT",
                performedBy: newReq.senderEmail,
                target: receiverProf ? receiverProf.email : "Student",
                timestamp: new Date().toISOString(),
                details: `Proposed ${newReq.skillOfferedName} for ${newReq.skillRequestedName}`
            });

            // Add notification for receiver
            state.notifications.unshift({
                id: Date.now(),
                recipientId: body.receiverId,
                title: "New Exchange Proposal",
                message: `${newReq.senderName} proposed: Offering ${newReq.skillOfferedName} for ${newReq.skillRequestedName}.`,
                type: "EXCHANGE_REQUEST",
                isRead: false,
                createdAt: new Date().toISOString()
            });

            return sendJson(res, 200, { success: true, data: newReq });
        }

        if (pathname.match(/^\/api\/exchange-requests\/(\d+)\/accept$/) && req.method === 'PUT') {
            const id = Number(pathname.split('/')[3]);
            const r = state.requests.find(req => req.id === id);
            if (r) {
                r.status = 'ACCEPTED';
                state.exchanges.unshift({
                    id: state.exchanges.length + 1,
                    requestId: r.id,
                    student1Id: r.senderId,
                    student1Name: r.senderName,
                    student2Id: r.receiverId,
                    student2Name: r.receiverName,
                    userAId: r.senderId,
                    userAName: r.senderName,
                    userBId: r.receiverId,
                    userBName: r.receiverName,
                    skill1Id: r.skillOfferedId,
                    skill1Name: r.skillOfferedName,
                    skill2Id: r.skillRequestedId,
                    skill2Name: r.skillRequestedName,
                    skillOfferedTitle: r.skillOfferedName,
                    skillRequestedTitle: r.skillRequestedName,
                    learningMode: r.learningMode,
                    status: "ACTIVE",
                    startDate: new Date().toISOString()
                });

                state.notifications.unshift({
                    id: Date.now(),
                    recipientId: r.senderId,
                    title: "Proposal Accepted!",
                    message: `${r.receiverName} accepted your skill exchange proposal!`,
                    type: "REQUEST_ACCEPTED",
                    isRead: false,
                    createdAt: new Date().toISOString()
                });
            }
            return sendJson(res, 200, { success: true, data: r });
        }

        if (pathname.match(/^\/api\/exchange-requests\/(\d+)\/reject$/) && req.method === 'PUT') {
            const id = Number(pathname.split('/')[3]);
            const r = state.requests.find(req => req.id === id);
            if (r) r.status = 'REJECTED';
            return sendJson(res, 200, { success: true, data: r });
        }

        if (pathname.match(/^\/api\/exchange-requests\/(\d+)\/complete$/) && req.method === 'PUT') {
            const id = Number(pathname.split('/')[3]);
            const r = state.requests.find(req => req.id === id);
            if (r) {
                r.status = 'COMPLETED';
                const ex = state.exchanges.find(e => e.requestId === r.id);
                if (ex) {
                    ex.status = 'COMPLETED';
                    ex.completionDate = new Date().toISOString();
                }

                const p1 = state.profiles.find(p => p.userId === r.senderId);
                if (p1) p1.completedExchangesCount++;
                const p2 = state.profiles.find(p => p.userId === r.receiverId);
                if (p2) p2.completedExchangesCount++;
            }
            return sendJson(res, 200, { success: true, data: r });
        }

        if (pathname === '/api/exchanges' && req.method === 'GET') {
            return sendJson(res, 200, { success: true, data: state.exchanges });
        }

        if (pathname === '/api/exchange-requests/history' && req.method === 'GET') {
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const statusFilter = parsedUrl.query.status;
            let list = state.exchanges.filter(e => e.student1Id === myId || e.student2Id === myId || e.userAId === myId || e.userBId === myId);
            if (statusFilter) {
                list = list.filter(e => e.status.toUpperCase() === statusFilter.toUpperCase());
            }

            const data = list.map(e => ({
                ...e,
                reviewedByCurrentStudent: state.reviews.some(rev => rev.exchangeId === e.id && rev.reviewerId === myId)
            }));
            return sendJson(res, 200, { success: true, data });
        }

        // --- 6. CHAT & MESSAGING (MODULE 8) ---
        if (pathname.match(/^\/api\/messages\/(\d+)$/) && req.method === 'GET') {
            const partnerId = Number(pathname.split('/')[3]);
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const now = new Date().toISOString();
            const msgs = state.messages.filter(m =>
                (m.senderId === myId && m.receiverId === partnerId) ||
                (m.senderId === partnerId && m.receiverId === myId)
            );
            msgs.forEach(m => {
                if (m.receiverId === myId) {
                    m.isRead = true;
                    m.status = "SEEN";
                    if (!m.seenAt) m.seenAt = now;
                }
            });
            return sendJson(res, 200, { success: true, data: msgs });
        }

        if (pathname === '/api/messages/attachment' && req.method === 'POST') {
            if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
            const body = await parseBody(req);
            const fileName = (body.fileName || body.filename || 'file.dat').replace(/[^a-zA-Z0-9._-]/g, '_');
            const fileData = body.fileData || body.file || '';

            const ext = path.extname(fileName).toLowerCase();
            const allowedImageExts = ['.png', '.jpg', '.jpeg', '.webp'];
            const allowedDocExts = ['.pdf', '.doc', '.docx', '.txt', '.zip'];
            const dangerousExts = ['.exe', '.bat', '.cmd', '.sh', '.php', '.js', '.html', '.msi', '.vbs', '.jar', '.scr', '.com'];

            if (dangerousExts.includes(ext)) {
                return sendJson(res, 400, { success: false, message: "Executable and script files are strictly blocked." });
            }

            const isPhoto = (body.category === 'photo' || body.category === 'image' || allowedImageExts.includes(ext));
            const category = isPhoto ? 'image' : 'document';

            if (category === 'image' && !allowedImageExts.includes(ext)) {
                return sendJson(res, 400, { success: false, message: "Invalid photo format. Allowed: PNG, JPG, JPEG, WEBP." });
            }

            if (category === 'document' && !allowedDocExts.includes(ext)) {
                return sendJson(res, 400, { success: false, message: "Invalid document format. Allowed: PDF, DOC, DOCX, TXT, ZIP." });
            }

            try {
                const buffer = Buffer.from(fileData.replace(/^data:[^;]+;base64,/, ''), 'base64');
                if (buffer.length === 0) {
                    return sendJson(res, 400, { success: false, message: "Empty file attachment received." });
                }
                if (buffer.length > 10 * 1024 * 1024) {
                    return sendJson(res, 400, { success: false, message: "Attachment exceeds 10MB maximum limit." });
                }

                const safeName = `chat_${state.currentUser.userId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
                const uploadDir = path.join(STATIC_DIR, 'uploads', 'chat');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                fs.writeFileSync(path.join(uploadDir, safeName), buffer);
                const fileUrl = `uploads/chat/${safeName}`;

                let formattedSize = (buffer.length / 1024).toFixed(1) + ' KB';
                if (buffer.length >= 1024 * 1024) {
                    formattedSize = (buffer.length / (1024 * 1024)).toFixed(1) + ' MB';
                }

                const resultData = {
                    fileUrl: fileUrl,
                    url: fileUrl,
                    fileName: fileName,
                    fileSize: buffer.length,
                    formattedSize: formattedSize,
                    fileType: category,
                    fileCategory: isPhoto ? 'photo' : 'document'
                };

                return sendJson(res, 200, {
                    success: true,
                    data: resultData,
                    ...resultData,
                    message: "Attachment uploaded successfully."
                });
            } catch (err) {
                return sendJson(res, 500, { success: false, message: "Failed to upload attachment: " + err.message });
            }
        }

        if (pathname === '/api/messages' && req.method === 'POST') {
            const body = await parseBody(req);
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const senderProf = state.profiles.find(p => p.userId === myId);
            const receiverId = Number(body.receiverId);
            const receiverProf = state.profiles.find(p => p.userId === receiverId);

            if (!receiverId || receiverId === myId) {
                return sendJson(res, 400, { success: false, message: "Please specify a valid recipient." });
            }

            const rawText = (body.messageText || body.content || body.text || '').trim();
            if (rawText.length > 5000) {
                return sendJson(res, 400, { success: false, message: "Message exceeds 5,000 characters limit." });
            }
            const sanitizedText = escapeHtml(rawText);

            if (!sanitizedText && !body.attachmentUrl) {
                return sendJson(res, 400, { success: false, message: "Cannot send an empty message." });
            }

            const now = new Date().toISOString();
            const nextId = state.messages.length > 0 ? Math.max(...state.messages.map(m => m.id)) + 1 : 1;
            const newMsg = {
                id: nextId,
                senderId: myId,
                senderName: senderProf ? senderProf.fullName : "Student",
                receiverId: receiverId,
                receiverName: receiverProf ? receiverProf.fullName : "Student",
                messageText: sanitizedText,
                content: sanitizedText,
                attachmentUrl: body.attachmentUrl || null,
                attachmentType: body.attachmentType || null,
                attachmentName: body.attachmentName || null,
                attachmentSize: body.attachmentSize || null,
                replyTo: body.replyTo || null,
                isRead: false,
                timestamp: now,
                sentAt: now,
                deliveredAt: now,
                seenAt: null,
                status: "DELIVERED",
                isRead: false
            };
            state.messages.push(newMsg);

            const notifText = newMsg.messageText 
                ? (newMsg.messageText.length > 50 ? newMsg.messageText.substring(0, 47) + "..." : newMsg.messageText)
                : `Sent an attachment: ${newMsg.attachmentName || 'file'}`;

            state.notifications.unshift({
                id: Date.now(),
                recipientId: receiverId,
                title: `Message from ${newMsg.senderName}`,
                message: notifText,
                type: "NEW_MESSAGE",
                linkUrl: "chat.html",
                isRead: false,
                createdAt: now
            });

            return sendJson(res, 200, { success: true, data: newMsg });
        }

        if (pathname.match(/^\/api\/messages\/(\d+)$/) && req.method === 'DELETE') {
            const msgId = Number(pathname.split('/')[3]);
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const isAdmin = state.currentUser && state.currentUser.role === 'ROLE_ADMIN';
            const idx = state.messages.findIndex(m => m.id === msgId);
            if (idx === -1) {
                return sendJson(res, 404, { success: false, message: "Message not found" });
            }
            const msg = state.messages[idx];
            if (!isAdmin && msg.senderId !== myId) {
                return sendJson(res, 403, { success: false, message: "Security violation: You can only delete your own sent messages." });
            }
            state.messages.splice(idx, 1);
            return sendJson(res, 200, { success: true, message: "Message deleted successfully." });
        }

        if (pathname === '/api/messages/conversations' && req.method === 'GET') {
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const partners = new Set();
            state.messages.forEach(m => {
                if (m.senderId === myId) partners.add(m.receiverId);
                if (m.receiverId === myId) partners.add(m.senderId);
            });
            state.exchanges.forEach(e => {
                if (e.student1Id === myId) partners.add(e.student2Id);
                if (e.student2Id === myId) partners.add(e.student1Id);
                if (e.userAId === myId) partners.add(e.userBId);
                if (e.userBId === myId) partners.add(e.userAId);
            });

            const data = Array.from(partners).map(pId => {
                const prof = state.profiles.find(p => p.userId === pId);
                if (!prof) return null;
                // Find last message and unread count
                const thread = state.messages.filter(m => (m.senderId === myId && m.receiverId === pId) || (m.senderId === pId && m.receiverId === myId));
                const lastMsg = thread.length > 0 ? thread[thread.length - 1] : null;
                const unread = thread.filter(m => m.receiverId === myId && !m.isRead).length;
                return {
                    ...prof,
                    lastMessage: lastMsg ? (lastMsg.messageText || (lastMsg.attachmentName ? `📎 ${lastMsg.attachmentName}` : 'Attachment')) : null,
                    lastMessageAt: lastMsg ? lastMsg.sentAt : null,
                    unreadCount: unread
                };
            }).filter(Boolean);

            return sendJson(res, 200, { success: true, data });
        }

        if (pathname === '/api/messages/unread-count' && req.method === 'GET') {
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const count = state.messages.filter(m => m.receiverId === myId && !m.isRead).length;
            return sendJson(res, 200, { success: true, data: count });
        }

        // --- 7. SKILL VERIFICATION (SKILL-SPECIFIC PROOF AUDITING) ---
        if (pathname === '/api/verifications' && req.method === 'GET') {
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const data = state.verifications.filter(v => v.studentId === myId);
            return sendJson(res, 200, { success: true, data });
        }

        if (pathname.match(/^\/api\/verifications\/skill\/(\d+)$/) && req.method === 'GET') {
            const skillId = Number(pathname.split('/')[4]);
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const ver = state.verifications.find(v => v.studentId === myId && v.skillId === skillId);
            return sendJson(res, 200, { success: true, data: ver || null });
        }

        if (pathname === '/api/verifications' && req.method === 'POST') {
            const body = await parseBody(req);
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const myProf = state.profiles.find(p => p.userId === myId);
            const skillId = Number(body.skillId);
            const skill = state.skills.find(s => s.id === skillId);

            if (!skill) {
                return sendJson(res, 400, { success: false, message: "A valid teaching skill must be selected for verification." });
            }

            // --- STRICT VERIFICATION VALIDATION ---
            // Projects: Compulsory (Title, Description, Technologies)
            const hasProject = body.projectTitle && body.projectTitle.trim().length > 0 &&
                               body.projectDescription && body.projectDescription.trim().length > 0 &&
                               body.projectTechnologies && body.projectTechnologies.trim().length > 0;

            // Experience: Compulsory (Title/Role, Organization, Description, Start Date, End Date/Ongoing)
            const hasExperience = body.experienceTitle && body.experienceTitle.trim().length > 0 &&
                                  body.experienceOrganization && body.experienceOrganization.trim().length > 0 &&
                                  body.experienceDescription && body.experienceDescription.trim().length > 0 &&
                                  body.experienceStartDate && body.experienceStartDate.trim().length > 0 &&
                                  body.experienceEndDate && body.experienceEndDate.trim().length > 0;

            if (!hasProject || !hasExperience) {
                return sendJson(res, 400, {
                    success: false,
                    message: "Project and experience proof are required to verify this skill. Certificate is optional."
                });
            }

            // Find existing verification for this student & skill or create new
            let ver = state.verifications.find(v => v.studentId === myId && v.skillId === skillId);
            if (!ver) {
                ver = {
                    id: state.verifications.length + 1,
                    studentId: myId,
                    studentName: myProf ? myProf.fullName : "Student",
                    studentEmail: myProf ? myProf.email : "",
                    skillId: skillId,
                    skillName: skill.name
                };
                state.verifications.unshift(ver);
            }

            // Update verification fields
            ver.certificateName = (body.certificateName || '').trim();
            ver.certificateUrl = (body.certificateUrl || '').trim();
            ver.projectTitle = body.projectTitle.trim();
            ver.projectDescription = body.projectDescription.trim();
            ver.projectTechnologies = body.projectTechnologies.trim();
            ver.projectLink = (body.projectLink || '').trim();
            ver.projectProofUrl = (body.projectProofUrl || '').trim();
            ver.experienceTitle = body.experienceTitle.trim();
            ver.experienceOrganization = body.experienceOrganization.trim();
            ver.experienceDescription = body.experienceDescription.trim();
            ver.experienceDuration = (body.experienceDuration || '').trim();
            ver.experienceStartDate = body.experienceStartDate.trim();
            ver.experienceEndDate = body.experienceEndDate.trim();
            ver.status = "PENDING";
            ver.adminComment = "";
            ver.submissionDate = new Date().toISOString();
            ver.reviewedDate = null;

            // Update student's specific teaching skill verificationStatus to PENDING (verified false until admin approval)
            if (myProf) {
                const ts = myProf.teachingSkills.find(t => t.skillId === skillId);
                if (ts) {
                    ts.verified = false;
                    ts.verificationStatus = 'PENDING';
                }
            }

            return sendJson(res, 200, {
                success: true,
                message: "Verification proof submitted successfully! Verification is now pending administrator audit.",
                data: ver
            });
        }

        if (pathname.match(/^\/api\/verifications\/(\d+)\/approve$/) && req.method === 'PUT') {
            if (!state.currentUser || state.currentUser.role !== 'ROLE_ADMIN') {
                return sendJson(res, 403, { success: false, message: "Forbidden: Administrator authorization required." });
            }
            const id = Number(pathname.split('/')[3]);
            const body = await parseBody(req);
            const ver = state.verifications.find(v => v.id === id);
            if (!ver) return sendJson(res, 404, { success: false, message: "Verification record not found" });

            ver.status = 'VERIFIED';
            ver.reviewedDate = new Date().toISOString();
            ver.adminComment = body.adminComment || "Verified by Administrator: Project and experience criteria met.";

            const prof = state.profiles.find(p => p.userId === ver.studentId);
            if (prof) {
                const ts = prof.teachingSkills.find(t => t.skillId === ver.skillId);
                if (ts) {
                    ts.verified = true;
                    ts.verificationStatus = 'VERIFIED';
                }
                prof.verified = prof.teachingSkills.some(t => t.verified);
            }

            state.notifications.unshift({
                id: Date.now(),
                recipientId: ver.studentId,
                title: "Skill Verification Approved! ✓",
                message: `Congratulations! Your verification proof for ${ver.skillName} was approved. You now hold the ✓ Verified Skill badge for this skill!`,
                type: "VERIFICATION_APPROVED",
                linkUrl: "verification.html",
                isRead: false,
                createdAt: new Date().toISOString()
            });

            return sendJson(res, 200, { success: true, message: `Skill ${ver.skillName} approved!`, data: ver });
        }

        if (pathname.match(/^\/api\/verifications\/(\d+)\/reject$/) && req.method === 'PUT') {
            if (!state.currentUser || state.currentUser.role !== 'ROLE_ADMIN') {
                return sendJson(res, 403, { success: false, message: "Forbidden: Administrator authorization required." });
            }
            const id = Number(pathname.split('/')[3]);
            const body = await parseBody(req);
            const ver = state.verifications.find(v => v.id === id);
            if (!ver) return sendJson(res, 404, { success: false, message: "Verification record not found" });

            ver.status = 'REJECTED';
            ver.reviewedDate = new Date().toISOString();
            ver.adminComment = body.adminComment || "Proof does not sufficiently demonstrate hands-on experience.";

            const prof = state.profiles.find(p => p.userId === ver.studentId);
            if (prof) {
                const ts = prof.teachingSkills.find(t => t.skillId === ver.skillId);
                if (ts) {
                    ts.verified = false;
                    ts.verificationStatus = 'REJECTED';
                }
                prof.verified = prof.teachingSkills.some(t => t.verified);
            }

            state.notifications.unshift({
                id: Date.now(),
                recipientId: ver.studentId,
                title: "Skill Verification Rejected",
                message: `Your verification submission for ${ver.skillName} was rejected: ${ver.adminComment}`,
                type: "VERIFICATION_REJECTED",
                linkUrl: "verification.html",
                isRead: false,
                createdAt: new Date().toISOString()
            });

            return sendJson(res, 200, { success: true, message: `Skill ${ver.skillName} verification rejected.`, data: ver });
        }

        if (pathname.match(/^\/api\/verifications\/(\d+)\/request-resubmission$/) && req.method === 'PUT') {
            if (!state.currentUser || state.currentUser.role !== 'ROLE_ADMIN') {
                return sendJson(res, 403, { success: false, message: "Forbidden: Administrator authorization required." });
            }
            const id = Number(pathname.split('/')[3]);
            const body = await parseBody(req);
            const ver = state.verifications.find(v => v.id === id);
            if (!ver) return sendJson(res, 404, { success: false, message: "Verification record not found" });

            ver.status = 'NEEDS_RESUBMISSION';
            ver.reviewedDate = new Date().toISOString();
            ver.adminComment = body.adminComment || "Please provide more details on your project repository and work responsibilities.";

            const prof = state.profiles.find(p => p.userId === ver.studentId);
            if (prof) {
                const ts = prof.teachingSkills.find(t => t.skillId === ver.skillId);
                if (ts) {
                    ts.verified = false;
                    ts.verificationStatus = 'NEEDS_RESUBMISSION';
                }
                prof.verified = prof.teachingSkills.some(t => t.verified);
            }

            state.notifications.unshift({
                id: Date.now(),
                recipientId: ver.studentId,
                title: "Skill Verification Needs Resubmission ⚠",
                message: `The administrator requested updates on your ${ver.skillName} proof: "${ver.adminComment}". Please update and resubmit.`,
                type: "VERIFICATION_RESUBMISSION",
                linkUrl: "verification.html",
                isRead: false,
                createdAt: new Date().toISOString()
            });

            return sendJson(res, 200, { success: true, message: `Resubmission requested for ${ver.skillName}.`, data: ver });
        }

        // --- 8. REVIEWS & RATINGS (MODULE 10) ---
        if (pathname.match(/^\/api\/reviews\/(\d+)$/) && req.method === 'GET') {
            const studentId = Number(pathname.split('/')[3]);
            const data = state.reviews.filter(r => r.reviewedStudentId === studentId);
            return sendJson(res, 200, { success: true, data });
        }

        if (pathname === '/api/reviews' && req.method === 'POST') {
            const body = await parseBody(req);
            const myId = state.currentUser ? state.currentUser.userId : 2;

            const ex = state.exchanges.find(e => e.id === Number(body.exchangeId));
            if (!ex) {
                return sendJson(res, 404, { success: false, message: "Exchange record not found." });
            }
            if (ex.status !== 'COMPLETED') {
                return sendJson(res, 400, { success: false, message: "Reviews and ratings are only permitted for completed skill exchanges." });
            }
            const isParticipant = (ex.student1Id === myId || ex.student2Id === myId || ex.userAId === myId || ex.userBId === myId);
            if (!isParticipant) {
                return sendJson(res, 403, { success: false, message: "Security violation: You can only leave reviews for exchanges you participated in." });
            }
            if (state.reviews.some(r => r.exchangeId === Number(body.exchangeId) && r.reviewerId === myId)) {
                return sendJson(res, 409, { success: false, message: "You have already submitted a review for this completed exchange." });
            }

            const reviewerProf = state.profiles.find(p => p.userId === myId);
            const targetProf = state.profiles.find(p => p.userId === body.reviewedStudentId);

            const newRev = {
                id: state.reviews.length + 1,
                exchangeId: Number(body.exchangeId),
                reviewerId: myId,
                reviewerName: reviewerProf ? reviewerProf.fullName : "Student",
                reviewedStudentId: body.reviewedStudentId,
                reviewedStudentName: targetProf ? targetProf.fullName : "Student",
                rating: body.rating,
                comment: body.comment || "",
                createdAt: new Date().toISOString()
            };
            state.reviews.push(newRev);

            // Recalculate average rating
            const studentReviews = state.reviews.filter(r => r.reviewedStudentId === body.reviewedStudentId);
            const avg = studentReviews.reduce((sum, r) => sum + r.rating, 0) / studentReviews.length;
            if (targetProf) {
                targetProf.averageRating = Math.round(avg * 10) / 10;
            }

            // Audit log
            state.auditLogs.unshift({
                id: Date.now(),
                action: "EXCHANGE_REVIEW_SUBMITTED",
                performedBy: reviewerProf ? reviewerProf.email : "Student",
                target: targetProf ? targetProf.email : "Student",
                timestamp: new Date().toISOString(),
                details: `Rating: ${body.rating}★, Comment: ${newRev.comment.substring(0, 30)}...`
            });

            state.notifications.unshift({
                id: Date.now(),
                recipientId: body.reviewedStudentId,
                title: `New Peer Review (${body.rating}★)`,
                message: `${newRev.reviewerName} left a review: "${newRev.comment}"`,
                type: "NEW_REVIEW",
                isRead: false,
                createdAt: new Date().toISOString()
            });

            return sendJson(res, 200, { success: true, data: newRev });
        }

        // --- 9. NOTIFICATIONS (MODULE 11) ---
        if (pathname === '/api/notifications' && req.method === 'GET') {
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const data = state.notifications.filter(n => n.recipientId === myId);
            return sendJson(res, 200, { success: true, data });
        }

        if (pathname.match(/^\/api\/notifications\/(\d+)\/read$/) && req.method === 'PUT') {
            const id = Number(pathname.split('/')[3]);
            const notif = state.notifications.find(n => n.id === id);
            if (notif) notif.isRead = true;
            return sendJson(res, 200, { success: true, message: "Marked as read" });
        }

        if (pathname === '/api/notifications/read-all' && req.method === 'PUT') {
            const myId = state.currentUser ? state.currentUser.userId : 2;
            state.notifications.filter(n => n.recipientId === myId).forEach(n => { n.isRead = true; });
            return sendJson(res, 200, { success: true, message: "All marked as read" });
        }

        if (pathname === '/api/notifications/unread-count' && req.method === 'GET') {
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const count = state.notifications.filter(n => n.recipientId === myId && !n.isRead).length;
            return sendJson(res, 200, { success: true, data: count });
        }

        // --- 10. REPORTS & BLOCKING (MODULE 13) ---
        if (pathname === '/api/reports' && req.method === 'POST') {
            const body = await parseBody(req);
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const reporter = state.profiles.find(p => p.userId === myId);
            const reported = state.profiles.find(p => p.userId === body.reportedUserId);

            const newReport = {
                id: state.reports.length + 1,
                reporterId: myId,
                reporterName: reporter ? reporter.fullName : "Student",
                reportedUserId: body.reportedUserId,
                reportedUserName: reported ? reported.fullName : "Student",
                reason: body.reason,
                description: body.description,
                status: "PENDING",
                createdAt: new Date().toISOString()
            };
            state.reports.push(newReport);

            state.auditLogs.unshift({
                id: Date.now(),
                action: "ABUSE_REPORT_FILED",
                performedBy: reporter ? reporter.email : "Student",
                target: reported ? reported.email : "Student",
                timestamp: new Date().toISOString(),
                details: `Reason: ${body.reason}, Details: ${body.description}`
            });

            return sendJson(res, 200, { success: true, data: newReport, message: "Report submitted to administration for safety audit." });
        }

        // --- 11. COMPREHENSIVE ADMIN API SUITE ---
        if (pathname.startsWith('/api/admin')) {
            if (!state.currentUser || state.currentUser.role !== 'ROLE_ADMIN') {
                return sendJson(res, 403, {
                    success: false,
                    message: "Forbidden: Administrator authorization required to access this endpoint."
                });
            }
        }

        // 11.1 Platform Overview KPI Stats
        if (pathname === '/api/admin/stats' && req.method === 'GET') {
            const totalStudents = state.users.filter(u => u.role === 'ROLE_STUDENT').length;
            const activeStudents = state.users.filter(u => u.role === 'ROLE_STUDENT' && u.active).length;
            const verifiedStudents = state.profiles.filter(p => p.verified).length;
            const totalSkills = state.skills.length;
            const activeSkillListings = state.profiles.reduce((acc, p) => acc + (p.teachingSkills ? p.teachingSkills.length : 0), 0);
            const totalExchanges = state.exchanges.length;
            const completedExchanges = state.exchanges.filter(e => e.status === 'COMPLETED').length;
            const pendingVerifications = state.verifications.filter(v => v.status === 'PENDING').length;
            const pendingReports = state.reports.filter(r => r.status === 'OPEN' || r.status === 'INVESTIGATING').length;
            const disputedExchanges = state.exchanges.filter(e => e.status === 'DISPUTED').length;
            const avgRating = (state.profiles.reduce((acc, p) => acc + (p.averageRating || 0), 0) / (state.profiles.length || 1)).toFixed(1);

            return sendJson(res, 200, {
                success: true,
                data: {
                    totalUsers: totalStudents + state.admins.length,
                    totalStudents,
                    activeStudents,
                    verifiedStudents,
                    totalSkills,
                    activeSkillListings,
                    totalExchanges,
                    completedExchanges,
                    disputedExchanges,
                    pendingVerifications,
                    pendingReports,
                    averageRating: parseFloat(avgRating) || 4.8,
                    hoursSavedEstimate: completedExchanges * 6,
                    barterSavingsValue: "₹" + (completedExchanges * 4500).toLocaleString()
                }
            });
        }

        // 11.2 Users Management
        if (pathname === '/api/admin/users' && req.method === 'GET') {
            const q = (parsedUrl.query.q || '').toLowerCase();
            const statusFilter = (parsedUrl.query.status || 'ALL').toUpperCase();

            let usersList = state.profiles.map(p => {
                const user = state.users.find(u => u.id === p.userId) || { active: true, email: p.email, role: 'ROLE_STUDENT' };
                const teachCount = p.teachingSkills ? p.teachingSkills.length : 0;
                const learnCount = p.learningSkills ? p.learningSkills.length : 0;
                const exchangeCount = state.exchanges.filter(e => e.student1Id === p.userId || e.student2Id === p.userId).length;

                return {
                    id: p.id,
                    userId: p.userId,
                    fullName: p.fullName,
                    email: p.email,
                    department: p.department,
                    college: p.college,
                    yearOfStudy: p.yearOfStudy,
                    phone: p.phone,
                    bio: p.bio,
                    avatarUrl: p.avatarUrl,
                    verified: p.verified,
                    active: user.active !== false && !p.blocked,
                    suspended: p.blocked || user.active === false,
                    averageRating: p.averageRating,
                    completedExchangesCount: p.completedExchangesCount,
                    totalExchanges: exchangeCount,
                    teachingSkillsCount: teachCount,
                    learningSkillsCount: learnCount,
                    joinedAt: "2026-08-20T10:00:00Z"
                };
            });

            if (q) {
                usersList = usersList.filter(u => 
                    u.fullName.toLowerCase().includes(q) || 
                    u.email.toLowerCase().includes(q) || 
                    u.department.toLowerCase().includes(q) || 
                    String(u.userId).includes(q)
                );
            }

            if (statusFilter === 'VERIFIED') usersList = usersList.filter(u => u.verified);
            if (statusFilter === 'UNVERIFIED') usersList = usersList.filter(u => !u.verified);
            if (statusFilter === 'ACTIVE') usersList = usersList.filter(u => u.active);
            if (statusFilter === 'SUSPENDED') usersList = usersList.filter(u => u.suspended);

            return sendJson(res, 200, { success: true, data: usersList });
        }

        if (pathname.match(/^\/api\/admin\/users\/(\d+)$/) && req.method === 'GET') {
            const userId = Number(pathname.split('/')[4]);
            const prof = state.profiles.find(p => p.userId === userId || p.id === userId);
            if (!prof) return sendJson(res, 404, { success: false, message: "User profile not found." });

            const user = state.users.find(u => u.id === prof.userId) || { active: true };
            const studentExchanges = state.exchanges.filter(e => e.student1Id === prof.userId || e.student2Id === prof.userId);
            const studentReviews = state.reviews.filter(r => r.reviewedStudentId === prof.userId);
            const studentProjects = state.projects.filter(p => p.studentId === prof.userId);
            const studentExperiences = state.experiences.filter(e => e.studentId === prof.userId);
            const studentReports = state.reports.filter(r => r.reportedUserId === prof.userId);

            return sendJson(res, 200, {
                success: true,
                data: {
                    ...prof,
                    active: user.active !== false && !prof.blocked,
                    exchanges: studentExchanges,
                    reviews: studentReviews,
                    projects: studentProjects,
                    experiences: studentExperiences,
                    reports: studentReports
                }
            });
        }

        if (pathname.match(/^\/api\/admin\/users\/(\d+)\/toggle-status$/) && req.method === 'PUT') {
            const userId = Number(pathname.split('/')[4]);
            const user = state.users.find(u => u.id === userId);
            const prof = state.profiles.find(p => p.userId === userId || p.id === userId);
            const body = await parseBody(req);

            if (prof) prof.blocked = !prof.blocked;
            if (user) user.active = !user.active;

            const isSuspended = prof ? prof.blocked : true;

            state.auditLogs.unshift({
                id: Date.now(),
                action: isSuspended ? "USER_SUSPENDED" : "USER_REACTIVATED",
                performedBy: state.currentUser ? state.currentUser.email : "Admin",
                target: prof ? prof.email : `User #${userId}`,
                timestamp: new Date().toISOString(),
                details: body.reason ? `Reason: ${body.reason}` : `Account status modified by administrator.`
            });

            return sendJson(res, 200, {
                success: true,
                message: isSuspended ? "User suspended successfully." : "User reactivated successfully.",
                data: { suspended: isSuspended, active: !isSuspended }
            });
        }

        if (pathname.match(/^\/api\/admin\/users\/(\d+)\/toggle-verify$/) && req.method === 'PUT') {
            const userId = Number(pathname.split('/')[4]);
            const prof = state.profiles.find(p => p.userId === userId || p.id === userId);
            if (!prof) return sendJson(res, 404, { success: false, message: "User not found." });

            prof.verified = !prof.verified;
            if (prof.teachingSkills) {
                prof.teachingSkills.forEach(t => { t.verified = prof.verified; });
            }

            state.auditLogs.unshift({
                id: Date.now(),
                action: prof.verified ? "USER_VERIFIED" : "USER_UNVERIFIED",
                performedBy: state.currentUser ? state.currentUser.email : "Admin",
                target: prof.email,
                timestamp: new Date().toISOString(),
                details: `Verification badge ${prof.verified ? 'awarded' : 'revoked'}.`
            });

            return sendJson(res, 200, { success: true, data: { verified: prof.verified } });
        }

        // 11.3 Skill Listings Oversight
        if (pathname === '/api/admin/skills' && req.method === 'GET') {
            const listings = [];
            state.profiles.forEach(p => {
                if (p.teachingSkills) {
                    p.teachingSkills.forEach(ts => {
                        listings.push({
                            id: ts.id,
                            skillId: ts.skillId,
                            title: ts.skillName,
                            category: ts.categoryName || "General",
                            level: ts.levelOrUrgency || "Intermediate",
                            mode: "Hybrid (Online / Campus)",
                            verified: ts.verified || false,
                            status: ts.verificationStatus === 'VERIFIED' ? 'APPROVED' : (ts.verificationStatus === 'PENDING' ? 'PENDING' : 'APPROVED'),
                            providerId: p.userId,
                            providerName: p.fullName,
                            providerEmail: p.email,
                            rating: p.averageRating,
                            proofUrl: ts.proofDocumentUrl || null,
                            createdAt: "2026-08-25T11:00:00Z"
                        });
                    });
                }
            });
            return sendJson(res, 200, { success: true, data: listings });
        }

        if (pathname.match(/^\/api\/admin\/skills\/(\d+)\/status$/) && req.method === 'PUT') {
            const skillListingId = Number(pathname.split('/')[4]);
            const body = await parseBody(req);
            let found = null;

            state.profiles.forEach(p => {
                if (p.teachingSkills) {
                    const ts = p.teachingSkills.find(t => t.id === skillListingId);
                    if (ts) {
                        ts.verificationStatus = body.status;
                        ts.verified = body.status === 'APPROVED' || body.status === 'VERIFIED';
                        found = ts;
                    }
                }
            });

            state.auditLogs.unshift({
                id: Date.now(),
                action: "SKILL_STATUS_UPDATED",
                performedBy: state.currentUser ? state.currentUser.email : "Admin",
                target: found ? found.skillName : `Listing #${skillListingId}`,
                timestamp: new Date().toISOString(),
                details: `Status set to ${body.status}. Note: ${body.reason || 'Audited by admin'}`
            });

            return sendJson(res, 200, { success: true, message: `Skill status updated to ${body.status}.`, data: found });
        }

        // 11.4 Categories Management
        if (pathname === '/api/admin/categories' && req.method === 'GET') {
            const list = state.categories.map(c => {
                const skillsInCat = state.skills.filter(s => s.categoryId === c.id).length;
                return {
                    ...c,
                    skillsCount: skillsInCat,
                    usersCount: state.profiles.length,
                    status: "ACTIVE"
                };
            });
            return sendJson(res, 200, { success: true, data: list });
        }

        if (pathname === '/api/admin/categories' && req.method === 'POST') {
            const body = await parseBody(req);
            if (!body.name) {
                return sendJson(res, 400, { success: false, message: "Category name is required." });
            }
            const newCat = {
                id: state.categories.length > 0 ? Math.max(...state.categories.map(c => c.id)) + 1 : 1,
                name: body.name.trim(),
                description: (body.description || '').trim(),
                icon: body.icon ? body.icon.trim() : "tag"
            };
            state.categories.push(newCat);
            state.auditLogs.unshift({
                id: Date.now(),
                action: "CATEGORY_CREATED",
                performedBy: state.currentUser ? state.currentUser.email : "Admin",
                target: newCat.name,
                timestamp: new Date().toISOString(),
                details: `Created new skill category: ${newCat.name}`
            });
            return sendJson(res, 201, {
                success: true,
                data: {
                    ...newCat,
                    skillsCount: 0,
                    usersCount: 0,
                    status: "ACTIVE"
                },
                message: "Category created successfully."
            });
        }

        if (pathname.match(/^\/api\/admin\/categories\/(\d+)$/) && req.method === 'PUT') {
            const catId = Number(pathname.split('/')[4]);
            const body = await parseBody(req);
            const cat = state.categories.find(c => c.id === catId);
            if (!cat) return sendJson(res, 404, { success: false, message: "Category not found." });

            if (body.name) cat.name = body.name.trim();
            if (body.description) cat.description = body.description.trim();
            if (body.icon) cat.icon = body.icon.trim();

            state.auditLogs.unshift({
                id: Date.now(),
                action: "CATEGORY_UPDATED",
                performedBy: state.currentUser ? state.currentUser.email : "Admin",
                target: cat.name,
                timestamp: new Date().toISOString(),
                details: `Updated category details for ${cat.name}`
            });

            return sendJson(res, 200, { success: true, data: cat, message: "Category updated successfully." });
        }

        if (pathname.match(/^\/api\/admin\/categories\/(\d+)$/) && req.method === 'DELETE') {
            const catId = Number(pathname.split('/')[4]);
            const idx = state.categories.findIndex(c => c.id === catId);
            if (idx === -1) return sendJson(res, 404, { success: false, message: "Category not found." });

            const deleted = state.categories.splice(idx, 1)[0];
            state.auditLogs.unshift({
                id: Date.now(),
                action: "CATEGORY_DELETED",
                performedBy: state.currentUser ? state.currentUser.email : "Admin",
                target: deleted.name,
                timestamp: new Date().toISOString(),
                details: `Removed category: ${deleted.name}`
            });

            return sendJson(res, 200, { success: true, message: "Category deleted." });
        }

        // 11.5 Exchanges Oversight
        if (pathname === '/api/admin/exchanges' && req.method === 'GET') {
            const exchangesList = state.exchanges.map(e => {
                const p1 = state.profiles.find(p => p.userId === e.student1Id) || { fullName: e.student1Name || "Student 1" };
                const p2 = state.profiles.find(p => p.userId === e.student2Id) || { fullName: e.student2Name || "Student 2" };
                return {
                    id: e.id,
                    userAId: e.student1Id,
                    userAName: p1.fullName,
                    userBId: e.student2Id,
                    userBName: p2.fullName,
                    skillA: e.skill1Name || "Java",
                    skillB: e.skill2Name || "Photoshop",
                    startedAt: e.startDate || e.createdDate,
                    completedAt: e.completedDate || null,
                    status: e.status, // REQUESTED, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED, DISPUTED
                    notes: e.meetingLocation || "Online Meet"
                };
            });
            return sendJson(res, 200, { success: true, data: exchangesList });
        }

        if (pathname.match(/^\/api\/admin\/exchanges\/(\d+)\/status$/) && req.method === 'PUT') {
            const exId = Number(pathname.split('/')[4]);
            const body = await parseBody(req);
            const ex = state.exchanges.find(e => e.id === exId);
            if (!ex) return sendJson(res, 404, { success: false, message: "Exchange record not found." });

            ex.status = body.status;
            state.auditLogs.unshift({
                id: Date.now(),
                action: "EXCHANGE_STATUS_OVERRIDE",
                performedBy: state.currentUser ? state.currentUser.email : "Admin",
                target: `Exchange #${exId}`,
                timestamp: new Date().toISOString(),
                details: `Status set to ${body.status}. Note: ${body.adminNotes || ''}`
            });

            return sendJson(res, 200, { success: true, message: `Exchange status updated to ${body.status}.`, data: ex });
        }

        // 11.6 Requests Queue
        if (pathname === '/api/admin/requests' && req.method === 'GET') {
            const reqList = state.requests.map(r => {
                const s1 = state.profiles.find(p => p.userId === r.senderId) || { fullName: r.senderName || "Student" };
                const s2 = state.profiles.find(p => p.userId === r.receiverId) || { fullName: r.receiverName || "Student" };
                return {
                    id: r.id,
                    requesterId: r.senderId,
                    requesterName: s1.fullName,
                    recipientId: r.receiverId,
                    recipientName: s2.fullName,
                    requestedSkill: r.requestedSkillName,
                    offeredSkill: r.offeredSkillName,
                    status: r.status,
                    createdAt: r.createdAt || r.requestDate,
                    message: r.message
                };
            });
            return sendJson(res, 200, { success: true, data: reqList });
        }

        // 11.7 Reviews & Safety Moderation
        if (pathname === '/api/admin/reviews' && req.method === 'GET') {
            const list = state.reviews.map(r => {
                const reviewer = state.profiles.find(p => p.userId === r.reviewerId);
                const reviewed = state.profiles.find(p => p.userId === r.reviewedStudentId);
                return {
                    ...r,
                    reviewerName: reviewer ? reviewer.fullName : r.reviewerName,
                    reviewedStudentName: reviewed ? reviewed.fullName : r.reviewedStudentName,
                    status: r.status || "VISIBLE"
                };
            });
            return sendJson(res, 200, { success: true, data: list });
        }

        if (pathname.match(/^\/api\/admin\/reviews\/(\d+)\/visibility$/) && req.method === 'PUT') {
            const reviewId = Number(pathname.split('/')[4]);
            const body = await parseBody(req);
            const review = state.reviews.find(r => r.id === reviewId);
            if (!review) return sendJson(res, 404, { success: false, message: "Review not found." });

            review.status = body.status || (review.status === 'HIDDEN' ? 'VISIBLE' : 'HIDDEN');
            state.auditLogs.unshift({
                id: Date.now(),
                action: review.status === 'HIDDEN' ? "REVIEW_HIDDEN" : "REVIEW_RESTORED",
                performedBy: state.currentUser ? state.currentUser.email : "Admin",
                target: `Review #${reviewId}`,
                timestamp: new Date().toISOString(),
                details: `Moderation note: ${body.reason || 'Content standard compliance'}`
            });

            return sendJson(res, 200, { success: true, data: review, message: `Review is now ${review.status}.` });
        }

        if (pathname.match(/^\/api\/admin\/reviews\/(\d+)$/) && req.method === 'DELETE') {
            const reviewId = Number(pathname.split('/')[4]);
            const idx = state.reviews.findIndex(r => r.id === reviewId);
            if (idx === -1) return sendJson(res, 404, { success: false, message: "Review not found." });

            state.reviews.splice(idx, 1);
            state.auditLogs.unshift({
                id: Date.now(),
                action: "REVIEW_DELETED",
                performedBy: state.currentUser ? state.currentUser.email : "Admin",
                target: `Review #${reviewId}`,
                timestamp: new Date().toISOString(),
                details: "Deleted violating review"
            });

            return sendJson(res, 200, { success: true, message: "Review deleted successfully." });
        }

        // 11.8 Campus Announcements & Notifications
        if (pathname === '/api/admin/announcements' && req.method === 'GET') {
            return sendJson(res, 200, { success: true, data: state.announcements });
        }

        if (pathname === '/api/admin/announcements' && req.method === 'POST') {
            const body = await parseBody(req);
            if (!body.title || !body.message) {
                return sendJson(res, 400, { success: false, message: "Title and message are required." });
            }

            const announcement = {
                id: Date.now(),
                title: body.title.trim(),
                message: body.message.trim(),
                audience: body.audience || "ALL_USERS",
                priority: body.priority || "NORMAL",
                sender: state.currentUser ? state.currentUser.email : "admin@mgmmumbai.ac.in",
                createdAt: new Date().toISOString()
            };
            state.announcements.unshift(announcement);

            // Broadcast notification to all student inboxes
            state.profiles.forEach(p => {
                state.notifications.unshift({
                    id: Date.now() + Math.random(),
                    recipientId: p.userId,
                    title: `📢 Announcement: ${announcement.title}`,
                    message: announcement.message,
                    type: "ANNOUNCEMENT",
                    isRead: false,
                    createdAt: announcement.createdAt
                });
            });

            state.auditLogs.unshift({
                id: Date.now(),
                action: "CAMPUS_ANNOUNCEMENT_BROADCAST",
                performedBy: announcement.sender,
                target: announcement.audience,
                timestamp: announcement.createdAt,
                details: `Broadcast: ${announcement.title}`
            });

            return sendJson(res, 200, { success: true, data: announcement, message: "Announcement published and broadcasted to campus students." });
        }

        // 11.9 Analytics & Reports Data
        if (pathname === '/api/admin/analytics' && req.method === 'GET') {
            const daysRange = Number(parsedUrl.query.days) || 30;
            return sendJson(res, 200, {
                success: true,
                data: {
                    userGrowth: [
                        { period: "Day 1", count: 2 },
                        { period: "Day 7", count: 3 },
                        { period: "Day 14", count: 4 },
                        { period: "Day 21", count: 5 },
                        { period: "Day 30", count: state.profiles.length }
                    ],
                    exchangeVelocity: [
                        { label: "Requested", value: state.requests.length + state.exchanges.length },
                        { label: "In Progress", value: state.exchanges.filter(e => e.status === 'ACCEPTED' || e.status === 'IN_PROGRESS').length },
                        { label: "Completed", value: state.exchanges.filter(e => e.status === 'COMPLETED').length }
                    ],
                    activeEngagement: {
                        dau: Math.max(3, state.profiles.length - 1),
                        wau: state.profiles.length,
                        mau: state.profiles.length
                    },
                    topDemandedSkills: [
                        { name: "Photoshop", requests: 4, barPct: 90 },
                        { name: "Java", requests: 3, barPct: 75 },
                        { name: "Python", requests: 2, barPct: 55 },
                        { name: "Public Speaking", requests: 2, barPct: 50 },
                        { name: "Excel & Data", requests: 1, barPct: 30 }
                    ]
                }
            });
        }

        // 11.10 Platform Settings
        if (pathname === '/api/admin/settings' && req.method === 'GET') {
            return sendJson(res, 200, { success: true, data: state.settings });
        }

        if (pathname === '/api/admin/settings' && req.method === 'PUT') {
            const body = await parseBody(req);
            Object.assign(state.settings, body);
            state.auditLogs.unshift({
                id: Date.now(),
                action: "PLATFORM_SETTINGS_UPDATED",
                performedBy: state.currentUser ? state.currentUser.email : "Admin",
                target: "SYSTEM_SETTINGS",
                timestamp: new Date().toISOString(),
                details: "Updated platform settings & policies."
            });
            return sendJson(res, 200, { success: true, data: state.settings, message: "Settings saved successfully." });
        }

        // 11.11 Admin Management
        if (pathname === '/api/admin/admins' && req.method === 'GET') {
            return sendJson(res, 200, { success: true, data: state.admins });
        }

        if (pathname === '/api/admin/admins' && req.method === 'POST') {
            const body = await parseBody(req);
            if (!body.email || !body.name) {
                return sendJson(res, 400, { success: false, message: "Name and email are required." });
            }
            const newAdmin = {
                id: state.admins.length + 1,
                name: body.name.trim(),
                email: body.email.trim().toLowerCase(),
                role: body.role || "MODERATOR",
                active: true,
                lastActive: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };
            state.admins.push(newAdmin);
            state.auditLogs.unshift({
                id: Date.now(),
                action: "ADMIN_STAFF_INVITED",
                performedBy: state.currentUser ? state.currentUser.email : "Admin",
                target: newAdmin.email,
                timestamp: new Date().toISOString(),
                details: `Added new admin role: ${newAdmin.role}`
            });
            return sendJson(res, 200, { success: true, data: newAdmin, message: "Staff administrator added." });
        }

        // 11.12 Audit Logs
        if (pathname === '/api/admin/audit-logs' && req.method === 'GET') {
            const actionFilter = (parsedUrl.query.action || '').toUpperCase();
            let logs = state.auditLogs;
            if (actionFilter) {
                logs = logs.filter(l => l.action.toUpperCase().includes(actionFilter));
            }
            return sendJson(res, 200, { success: true, data: logs });
        }

        // 11.13 Verification Queue (Legacy & Enhanced)
        if (pathname === '/api/admin/verifications' && req.method === 'GET') {
            return sendJson(res, 200, { success: true, data: state.verifications });
        }

        if (pathname === '/api/admin/students' && req.method === 'GET') {
            return sendJson(res, 200, { success: true, data: state.profiles });
        }

        if (pathname === '/api/admin/reports' && req.method === 'GET') {
            return sendJson(res, 200, { success: true, data: state.reports });
        }

        if (pathname.match(/^\/api\/admin\/reports\/(\d+)$/) && req.method === 'PUT') {
            const reportId = Number(pathname.split('/')[4]);
            const body = await parseBody(req);
            const report = state.reports.find(r => r.id === reportId);
            if (report) {
                report.status = body.status || "RESOLVED";
                report.adminNotes = body.adminNotes || "Audited by Administrator";
                state.auditLogs.unshift({
                    id: Date.now(),
                    action: "REPORT_STATUS_UPDATED",
                    performedBy: state.currentUser ? state.currentUser.email : "Admin",
                    target: `Report #${reportId}`,
                    timestamp: new Date().toISOString(),
                    details: `Status set to ${report.status}. Notes: ${report.adminNotes}`
                });
            }
            return sendJson(res, 200, { success: true, data: report, message: "Report updated." });
        }

        return sendJson(res, 404, { success: false, message: "Endpoint not found" });
    }

    // -------------------------------------------------------------------
    // STATIC FILE SERVING & ROUTE REWRITES
    // -------------------------------------------------------------------

    let filePath = pathname === '/' ? 'index.html' : pathname;

    // Remove leading slash
    if (filePath.startsWith('/')) filePath = filePath.substring(1);

    // SaaS Clean URL rewrite: Any /admin route serves the admin dashboard
    if (filePath.startsWith('admin') && !filePath.includes('.')) {
        filePath = 'admin-dashboard.html';
    } else if (filePath === 'landing' || filePath === 'landing/') {
        filePath = 'landing.html';
    } else if (!filePath.includes('.')) {
        filePath += '.html';
    }

    // Backend-enforced Admin Authorization for Admin Dashboard page
    if (filePath === 'admin-dashboard.html' || filePath.startsWith('admin')) {
        if (!state.currentUser || state.currentUser.role !== 'ROLE_ADMIN') {
            res.writeHead(302, { 'Location': '/login.html?unauthorized=admin_required' });
            res.end();
            return;
        }
    }

    const fullPath = path.join(STATIC_DIR, filePath);

    fs.readFile(fullPath, (err, data) => {
        if (err) {
            // Fallback to index.html
            fs.readFile(path.join(STATIC_DIR, 'index.html'), (errIndex, dataIndex) => {
                if (errIndex) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(dataIndex);
                }
            });
            return;
        }

        // MIME types
        const ext = path.extname(fullPath).toLowerCase();
        let contentType = 'text/html';
        if (ext === '.css') contentType = 'text/css';
        else if (ext === '.js') contentType = 'application/javascript';
        else if (ext === '.json') contentType = 'application/json';
        else if (ext === '.svg') contentType = 'image/svg+xml';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.gif') contentType = 'image/gif';
        else if (ext === '.pdf') contentType = 'application/pdf';
        else if (ext === '.mp4') contentType = 'video/mp4';
        else if (ext === '.webm') contentType = 'video/webm';
        else if (ext === '.txt') contentType = 'text/plain';
        else if (ext === '.zip') contentType = 'application/zip';
        else if (ext === '.doc' || ext === '.docx') contentType = 'application/msword';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log("===================================================================");
    console.log("  STUDENT SKILL EXCHANGE PLATFORM - SERVER ACTIVE                  ");
    console.log(`  Live URL: http://localhost:${PORT}                                `);
    console.log("  All 14 Modules, REST APIs & Heuristic Matcher fully operational  ");
    console.log("===================================================================");
});
