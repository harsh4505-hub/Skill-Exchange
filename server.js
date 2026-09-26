/**
 * STUDENT SKILL EXCHANGE PLATFORM
 * Node.js Runtime Server & REST API Provider
 * Serves the full web application on http://localhost:8080
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const STATIC_DIR = path.join(__dirname, 'src', 'main', 'resources', 'static');

// ===================================================================
// COLLEGE EMAIL DOMAIN RESTRICTION VALIDATOR (@mgmmumbai.ac.in)
// ===================================================================

const COLLEGE_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@mgmmumbai\.ac\.in$/i;

function isValidCollegeEmail(email) {
    if (!email || typeof email !== 'string') return false;
    return COLLEGE_EMAIL_REGEX.test(email.trim());
}

// ===================================================================
// IN-MEMORY DATABASE STATE (Pre-seeded with Sample Demonstration Data)
// ===================================================================

const state = {
    currentUser: null,

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
        { id: 1, email: "admin@mgmmumbai.ac.in", role: "ROLE_ADMIN", password: "password123", active: true },
        { id: 2, email: "harsh@mgmmumbai.ac.in", role: "ROLE_STUDENT", password: "password123", active: true },
        { id: 3, email: "sejal@mgmmumbai.ac.in", role: "ROLE_STUDENT", password: "password123", active: true },
        { id: 4, email: "raza@mgmmumbai.ac.in", role: "ROLE_STUDENT", password: "password123", active: true },
        { id: 5, email: "udipti@mgmmumbai.ac.in", role: "ROLE_STUDENT", password: "password123", active: true }
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
                { id: 1, skillId: 1, skillName: "Java", categoryId: 1, categoryName: "Programming", levelOrUrgency: "Advanced", verified: true, proofDocumentUrl: "uploads/certificates/harsh_java.pdf" },
                { id: 2, skillId: 3, skillName: "HTML/CSS/JS", categoryId: 2, categoryName: "Web Development", levelOrUrgency: "Intermediate", verified: false }
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
                { id: 3, skillId: 4, skillName: "Photoshop", categoryId: 3, categoryName: "Design", levelOrUrgency: "Expert", verified: true, proofDocumentUrl: "uploads/certificates/sejal_photoshop.pdf" },
                { id: 4, skillId: 5, skillName: "Graphic Design", categoryId: 3, categoryName: "Design", levelOrUrgency: "Advanced", verified: false }
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
                { id: 5, skillId: 2, skillName: "Python", categoryId: 1, categoryName: "Programming", levelOrUrgency: "Advanced", verified: false },
                { id: 6, skillId: 8, skillName: "Excel & Data Analysis", categoryId: 6, categoryName: "Academic & Productivity", levelOrUrgency: "Intermediate", verified: false }
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
                { id: 7, skillId: 7, skillName: "Public Speaking", categoryId: 5, categoryName: "Communication", levelOrUrgency: "Expert", verified: true, proofDocumentUrl: "uploads/certificates/debate.pdf" }
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
            skill1Id: 1,
            skill1Name: "Java",
            skill2Id: 4,
            skill2Name: "Photoshop",
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
            skill1Id: 2,
            skill1Name: "Python",
            skill2Id: 7,
            skill2Name: "Public Speaking",
            learningMode: "CHAT",
            status: "ACTIVE",
            startDate: new Date(Date.now() - 1 * 86400000).toISOString()
        }
    ],

    messages: [
        { id: 1, senderId: 2, receiverId: 3, messageText: "Hi Sejal! Thanks for accepting my Java for Photoshop request!", sentAt: new Date(Date.now() - 2 * 86400000).toISOString(), isRead: true },
        { id: 2, senderId: 3, receiverId: 2, messageText: "Hey Harsh! Super excited! When are you free for our first session?", sentAt: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString(), isRead: true },
        { id: 3, senderId: 2, receiverId: 3, messageText: "I'm free tomorrow after 5 PM in the college library or over Google Meet!", sentAt: new Date(Date.now() - 1 * 86400000).toISOString(), isRead: true }
    ],

    verifications: [
        {
            id: 1,
            studentId: 4,
            studentName: "Raza Khan",
            studentEmail: "raza@mgmmumbai.ac.in",
            skillId: 2,
            skillName: "Python",
            documentName: "HackerRank Python 5-Star Gold Badge",
            documentPath: "uploads/verifications/raza_python.pdf",
            description: "Completed 50+ problem solving challenges and achieved 5 stars on HackerRank.",
            status: "PENDING",
            submissionDate: new Date(Date.now() - 1 * 86400000).toISOString()
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

    reports: []
};

// Default authenticated user to Harsh (student ID 2) for immediate exploration
state.currentUser = {
    authenticated: true,
    userId: 2,
    email: "harsh@mgmmumbai.ac.in",
    role: "ROLE_STUDENT",
    fullName: "Harsh Vardhan"
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
        // --- 1. AUTHENTICATION ---
        if (pathname === '/api/auth/current-user' && req.method === 'GET') {
            return sendJson(res, 200, { success: true, data: state.currentUser });
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

            // Existing accounts must also adhere to official college domain rule
            if (!isValidCollegeEmail(user.email)) {
                return sendJson(res, 403, {
                    success: false,
                    message: "Please use your official college email address ending with @mgmmumbai.ac.in."
                });
            }

            const profile = state.profiles.find(p => p.userId === user.id);
            state.currentUser = {
                authenticated: true,
                userId: user.id,
                email: user.email,
                role: user.role,
                fullName: profile ? profile.fullName : (user.role === 'ROLE_ADMIN' ? 'System Administrator' : user.email)
            };
            return sendJson(res, 200, { success: true, message: "Login successful", data: state.currentUser });
        }

        if (pathname === '/api/auth/logout' && req.method === 'POST') {
            state.currentUser = null;
            return sendJson(res, 200, { success: true, message: "Logged out" });
        }

        if (pathname === '/api/auth/register' && req.method === 'POST') {
            const body = await parseBody(req);
            const normalizedEmail = (body.email || '').trim().toLowerCase();

            // Backend validation: Reject any domain not ending in @mgmmumbai.ac.in
            if (!isValidCollegeEmail(normalizedEmail)) {
                return sendJson(res, 400, {
                    success: false,
                    message: "Please use your official college email address ending with @mgmmumbai.ac.in."
                });
            }

            if (state.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
                return sendJson(res, 409, { success: false, message: "An account with this email already exists" });
            }
            const newId = state.users.length + 1;
            const newUser = { id: newId, email: normalizedEmail, role: "ROLE_STUDENT", password: body.password, active: true };
            state.users.push(newUser);

            const newProfile = {
                id: newId,
                userId: newId,
                fullName: (body.fullName || '').trim(),
                email: normalizedEmail,
                college: (body.college || '').trim(),
                department: body.department,
                yearOfStudy: body.yearOfStudy,
                phone: (body.phone || '').trim(),
                bio: `Hello! I am a student at ${body.college} looking to exchange skills.`,
                avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${newId}`,
                verified: false,
                averageRating: 0.0,
                completedExchangesCount: 0,
                blocked: false,
                teachingSkills: [],
                learningSkills: []
            };
            state.profiles.push(newProfile);

            state.currentUser = {
                authenticated: true,
                userId: newId,
                email: normalizedEmail,
                role: "ROLE_STUDENT",
                fullName: (body.fullName || '').trim()
            };
            return sendJson(res, 200, { success: true, message: "Registration successful", data: state.currentUser });
        }

        // --- 2. STUDENT PROFILES ---
        if (pathname === '/api/students' && req.method === 'GET') {
            return sendJson(res, 200, { success: true, data: state.profiles.filter(p => !p.blocked) });
        }

        if (pathname === '/api/students/profile/me' && req.method === 'GET') {
            if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Not logged in" });
            const prof = state.profiles.find(p => p.userId === state.currentUser.userId);
            return sendJson(res, 200, { success: true, data: prof || {} });
        }

        if (pathname.match(/^\/api\/students\/(\d+)$/) && req.method === 'GET') {
            const id = Number(pathname.split('/')[3]);
            const prof = state.profiles.find(p => p.userId === id);
            return sendJson(res, 200, { success: true, data: prof || {} });
        }

        if (pathname.match(/^\/api\/students\/(\d+)$/) && req.method === 'PUT') {
            const id = Number(pathname.split('/')[3]);
            const body = await parseBody(req);
            const prof = state.profiles.find(p => p.userId === id);
            if (prof) {
                Object.assign(prof, body);
            }
            return sendJson(res, 200, { success: true, data: prof });
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
                        verified: false
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
            const reqs = state.requests.filter(r => r.senderId === myId || r.receiverId === myId);
            return sendJson(res, 200, { success: true, data: reqs });
        }

        if (pathname === '/api/exchange-requests/pending' && req.method === 'GET') {
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const reqs = state.requests.filter(r => r.receiverId === myId && r.status === 'PENDING');
            return sendJson(res, 200, { success: true, data: reqs });
        }

        if (pathname === '/api/exchange-requests' && req.method === 'POST') {
            const body = await parseBody(req);
            const myId = state.currentUser ? state.currentUser.userId : 2;
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
                    skill1Id: r.skillOfferedId,
                    skill1Name: r.skillOfferedName,
                    skill2Id: r.skillRequestedId,
                    skill2Name: r.skillRequestedName,
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

        if (pathname === '/api/exchange-requests/history' && req.method === 'GET') {
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const statusFilter = parsedUrl.query.status;
            let list = state.exchanges.filter(e => e.student1Id === myId || e.student2Id === myId);
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
            const msgs = state.messages.filter(m =>
                (m.senderId === myId && m.receiverId === partnerId) ||
                (m.senderId === partnerId && m.receiverId === myId)
            );
            msgs.forEach(m => {
                if (m.receiverId === myId) m.isRead = true;
            });
            return sendJson(res, 200, { success: true, data: msgs });
        }

        if (pathname === '/api/messages' && req.method === 'POST') {
            const body = await parseBody(req);
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const senderProf = state.profiles.find(p => p.userId === myId);
            const receiverProf = state.profiles.find(p => p.userId === body.receiverId);

            const newMsg = {
                id: state.messages.length + 1,
                senderId: myId,
                senderName: senderProf ? senderProf.fullName : "Student",
                receiverId: body.receiverId,
                receiverName: receiverProf ? receiverProf.fullName : "Student",
                messageText: body.messageText,
                sentAt: new Date().toISOString(),
                isRead: false
            };
            state.messages.push(newMsg);

            state.notifications.unshift({
                id: Date.now(),
                recipientId: body.receiverId,
                title: `Message from ${newMsg.senderName}`,
                message: newMsg.messageText.length > 50 ? newMsg.messageText.substring(0, 47) + "..." : newMsg.messageText,
                type: "NEW_MESSAGE",
                isRead: false,
                createdAt: new Date().toISOString()
            });

            return sendJson(res, 200, { success: true, data: newMsg });
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
            });

            const data = Array.from(partners).map(pId => state.profiles.find(p => p.userId === pId)).filter(Boolean);
            return sendJson(res, 200, { success: true, data });
        }

        if (pathname === '/api/messages/unread-count' && req.method === 'GET') {
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const count = state.messages.filter(m => m.receiverId === myId && !m.isRead).length;
            return sendJson(res, 200, { success: true, data: count });
        }

        // --- 7. SKILL VERIFICATION (MODULE 9) ---
        if (pathname === '/api/verifications' && req.method === 'GET') {
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const data = state.verifications.filter(v => v.studentId === myId);
            return sendJson(res, 200, { success: true, data });
        }

        if (pathname === '/api/verifications' && req.method === 'POST') {
            const body = await parseBody(req);
            const myId = state.currentUser ? state.currentUser.userId : 2;
            const myProf = state.profiles.find(p => p.userId === myId);
            const skill = state.skills.find(s => s.id === body.skillId);

            const newVer = {
                id: state.verifications.length + 1,
                studentId: myId,
                studentName: myProf ? myProf.fullName : "Student",
                studentEmail: myProf ? myProf.email : "",
                skillId: body.skillId,
                skillName: skill ? skill.name : "",
                documentName: body.documentName,
                documentPath: body.documentPath || "uploads/proof.pdf",
                description: body.description || "",
                status: "PENDING",
                submissionDate: new Date().toISOString()
            };
            state.verifications.unshift(newVer);
            return sendJson(res, 200, { success: true, data: newVer });
        }

        if (pathname.match(/^\/api\/verifications\/(\d+)\/approve$/) && req.method === 'PUT') {
            const id = Number(pathname.split('/')[3]);
            const body = await parseBody(req);
            const ver = state.verifications.find(v => v.id === id);
            if (ver) {
                ver.status = 'VERIFIED';
                ver.adminComment = body.adminComment || "Verified by Administrator.";
                const prof = state.profiles.find(p => p.userId === ver.studentId);
                if (prof) {
                    prof.verified = true;
                    const ts = prof.teachingSkills.find(t => t.skillId === ver.skillId);
                    if (ts) ts.verified = true;
                }

                state.notifications.unshift({
                    id: Date.now(),
                    recipientId: ver.studentId,
                    title: "Skill Verification Approved! ✓",
                    message: `Congratulations! Your proof for ${ver.skillName} was approved. You now hold a Verified Skill badge!`,
                    type: "VERIFICATION_APPROVED",
                    isRead: false,
                    createdAt: new Date().toISOString()
                });
            }
            return sendJson(res, 200, { success: true, data: ver });
        }

        if (pathname.match(/^\/api\/verifications\/(\d+)\/reject$/) && req.method === 'PUT') {
            const id = Number(pathname.split('/')[3]);
            const body = await parseBody(req);
            const ver = state.verifications.find(v => v.id === id);
            if (ver) {
                ver.status = 'REJECTED';
                ver.adminComment = body.adminComment || "Insufficient proof provided.";
                state.notifications.unshift({
                    id: Date.now(),
                    recipientId: ver.studentId,
                    title: "Skill Verification Decision",
                    message: `Your proof for ${ver.skillName} was rejected: ${ver.adminComment}`,
                    type: "VERIFICATION_REJECTED",
                    isRead: false,
                    createdAt: new Date().toISOString()
                });
            }
            return sendJson(res, 200, { success: true, data: ver });
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
            const reviewerProf = state.profiles.find(p => p.userId === myId);
            const targetProf = state.profiles.find(p => p.userId === body.reviewedStudentId);

            if (state.reviews.some(r => r.exchangeId === body.exchangeId && r.reviewerId === myId)) {
                return sendJson(res, 409, { success: false, message: "You have already reviewed this exchange" });
            }

            const newRev = {
                id: state.reviews.length + 1,
                exchangeId: body.exchangeId,
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
            return sendJson(res, 200, { success: true, data: newReport });
        }

        // --- 11. ADMIN DASHBOARD (MODULE 14) ---
        if (pathname === '/api/admin/stats' && req.method === 'GET') {
            const totalStudents = state.users.filter(u => u.role === 'ROLE_STUDENT').length;
            const totalSkills = state.skills.length;
            const totalExchanges = state.exchanges.length;
            const completedExchanges = state.exchanges.filter(e => e.status === 'COMPLETED').length;
            const pendingVerifications = state.verifications.filter(v => v.status === 'PENDING').length;
            const pendingReports = state.reports.filter(r => r.status === 'PENDING').length;

            return sendJson(res, 200, {
                success: true,
                data: { totalStudents, totalSkills, totalExchanges, completedExchanges, pendingVerifications, pendingReports }
            });
        }

        if (pathname === '/api/admin/verifications' && req.method === 'GET') {
            return sendJson(res, 200, { success: true, data: state.verifications });
        }

        if (pathname === '/api/admin/students' && req.method === 'GET') {
            return sendJson(res, 200, { success: true, data: state.profiles });
        }

        if (pathname.match(/^\/api\/admin\/students\/(\d+)\/toggle-block$/) && req.method === 'PUT') {
            const profId = Number(pathname.split('/')[4]);
            const prof = state.profiles.find(p => p.id === profId);
            if (prof) prof.blocked = !prof.blocked;
            return sendJson(res, 200, { success: true, data: prof ? prof.blocked : false });
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
                report.adminNotes = body.adminNotes || "Audited";
            }
            return sendJson(res, 200, { success: true, data: report });
        }

        return sendJson(res, 404, { success: false, message: "Endpoint not found" });
    }

    // -------------------------------------------------------------------
    // STATIC FILE SERVING & ROUTE REWRITES
    // -------------------------------------------------------------------

    let filePath = pathname === '/' ? 'index.html' : pathname;

    // Remove leading slash
    if (filePath.startsWith('/')) filePath = filePath.substring(1);

    // Clean URL routing without extension
    if (!filePath.includes('.')) {
        filePath += '.html';
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
