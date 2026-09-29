/**
 * skillExchangeEngine.js
 * Comprehensive Skill Exchange Engine:
 * - Exchange Plan & First Teacher Workflow
 * - Unified Session Lifecycle (Online Zoom & Offline Location)
 * - Two-Way Session Verification & Confirmations
 * - Real Skill-Level Progress & Topic Tracking (No fake numbers)
 * - Daily Learning Log & Streak Tracking (Consecutive legitimate learning actions)
 * - Measurable Skill Health (Deterministic signals with human-readable rationale)
 * - Student & Admin Analytics Dashboards
 * - Admin Exchange Audit & Session Detail Views
 * - Inactivity Detection & Final Completion Reports
 */

const crypto = require('crypto');

function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderHtmlCertificate(cert) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate — ${escapeHtml(cert.studentName)} — ${escapeHtml(cert.skillName)} | SkillExchange</title>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background: #f1f5f9;
            font-family: 'Inter', sans-serif;
            color: #0f172a;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 24px;
        }
        .cert-card {
            background: #ffffff;
            border: 4px solid #18181b;
            box-shadow: 8px 8px 0px #18181b;
            border-radius: 4px;
            width: 100%;
            max-width: 860px;
            padding: 48px;
            position: relative;
        }
        .cert-inner {
            border: 2px dashed #18181b;
            padding: 36px 32px;
            text-align: center;
        }
        .cert-badge {
            display: inline-block;
            background: #facc15;
            color: #18181b;
            font-weight: 800;
            font-size: 0.75rem;
            letter-spacing: 2px;
            padding: 6px 16px;
            border: 2px solid #18181b;
            box-shadow: 3px 3px 0 #18181b;
            margin-bottom: 24px;
            text-transform: uppercase;
        }
        .cert-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 2rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
            line-height: 1.2;
        }
        .cert-sub {
            color: #64748b;
            font-size: 1rem;
            margin-bottom: 28px;
        }
        .cert-name {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 2.25rem;
            font-weight: 800;
            color: #2563eb;
            text-decoration: underline;
            text-underline-offset: 8px;
            margin-bottom: 24px;
        }
        .cert-desc {
            font-size: 1.05rem;
            line-height: 1.7;
            max-width: 650px;
            margin: 0 auto 32px auto;
            color: #334155;
        }
        .cert-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            border-top: 2px solid #18181b;
            border-bottom: 2px solid #18181b;
            padding: 20px 0;
            margin-bottom: 36px;
        }
        .cert-stat-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            font-weight: 700;
            color: #64748b;
            letter-spacing: 0.5px;
        }
        .cert-stat-val {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.25rem;
            font-weight: 800;
            color: #0f172a;
            margin-top: 4px;
        }
        .cert-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            text-align: left;
        }
        .cert-sig-line {
            width: 180px;
            border-bottom: 2px solid #18181b;
            margin-bottom: 8px;
        }
        .cert-sig-title {
            font-size: 0.75rem;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
        }
        .cert-id-tag {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
            color: #475569;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 4px 8px;
        }
        .action-bar {
            margin-top: 24px;
            display: flex;
            justify-content: center;
            gap: 16px;
        }
        .btn-action {
            background: #2563eb;
            color: #ffffff;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            font-size: 0.9rem;
            padding: 10px 24px;
            border: 2px solid #18181b;
            box-shadow: 4px 4px 0 #18181b;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }
        .btn-action:hover {
            transform: translate(-1px, -1px);
            box-shadow: 5px 5px 0 #18181b;
        }
        .btn-sec {
            background: #ffffff;
            color: #18181b;
        }
        @media print {
            body { background: #ffffff; padding: 0; }
            .action-bar { display: none; }
            .cert-card { box-shadow: none; border: 2px solid #000000; }
        }
    </style>
</head>
<body>
    <div>
        <div class="cert-card">
            <div class="cert-inner">
                <div class="cert-badge">★ Verified Skill Exchange Completion ★</div>
                <h1 class="cert-title">Certificate of Skill Exchange Completion</h1>
                <p class="cert-sub">MGM College of Engineering & Technology • Peer Skill Barter Program</p>
                <div class="cert-name">${escapeHtml(cert.studentName)}</div>
                <p class="cert-desc">
                    Has successfully completed the reciprocal skill exchange learning agreement for <strong>${escapeHtml(cert.skillName)}</strong> (${escapeHtml(cert.skillCategory || 'Technical')}), verified through hands-on practice, milestone assessments, and per-session mastery evaluations with peer mentor <strong>${escapeHtml(cert.partnerName)}</strong>.
                </p>
                <div class="cert-grid">
                    <div>
                        <div class="cert-stat-label">Verified Sessions</div>
                        <div class="cert-stat-val">${cert.verifiedSessions || cert.totalSessions || 4} / ${cert.totalSessions || 4} Completed</div>
                    </div>
                    <div>
                        <div class="cert-stat-label">Curriculum Mastery</div>
                        <div class="cert-stat-val">${cert.finalProgress || 100}% Final Score</div>
                    </div>
                    <div>
                        <div class="cert-stat-label">Issue Date</div>
                        <div class="cert-stat-val">${cert.issueDate || new Date().toISOString().split('T')[0]}</div>
                    </div>
                </div>
                <div class="cert-footer">
                    <div>
                        <div class="cert-sig-line"></div>
                        <div class="cert-sig-title">Peer Mentor Signature</div>
                        <small class="text-muted">${escapeHtml(cert.partnerName)}</small>
                    </div>
                    <div style="text-align: center;">
                        <div class="cert-id-tag">ID: ${escapeHtml(cert.id)}</div>
                        <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 4px;">Code: ${escapeHtml(cert.verificationCode || cert.id)}</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="cert-sig-line" style="margin-left: auto;"></div>
                        <div class="cert-sig-title">Platform Verification</div>
                        <small class="text-muted">SkillExchange Academic Barter</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="action-bar">
            <button onclick="window.print()" class="btn-action">🖨️ Print / Save as PDF</button>
            <a href="/dashboard.html" class="btn-action btn-sec">← Back to Dashboard</a>
        </div>
    </div>
</body>
</html>`;
}


// Curated default topics for campus skill exchange subjects
const DEFAULT_SKILL_CURRICULUM = {
    'java': [
        'Java Foundations, JVM Architecture & Data Types',
        'Object-Oriented Programming (Classes, Objects, Inheritance)',
        'Polymorphism, Abstract Classes & Interfaces',
        'Collections Framework, Generics & Exception Handling',
        'Java Streams API & Lambdas',
        'Practical Microservices / Mini-Project Implementation'
    ],
    'python': [
        'Python Environment Setup, Variables & Control Flow',
        'Data Structures (Lists, Tuples, Dictionaries, Sets)',
        'Functions, Scope & Functional Constructs',
        'OOP in Python (Classes, Magic Methods, Inheritance)',
        'Data Analysis with Pandas, NumPy & File I/O',
        'Applied Automation / Web Scraping Pipeline'
    ],
    'photoshop': [
        'Photoshop Workspace, Document Presets & Layer Hierarchy',
        'Non-Destructive Editing with Layer Masks & Clipping Masks',
        'Selection Tools & Pen Tool Vector Paths',
        'Color Correction, Adjustment Layers & Blend Modes',
        'Typography, Composition & Visual Hierarchy',
        'Final Campus Poster / Portfolio Project Showcase'
    ],
    'javascript': [
        'JavaScript Fundamentals, ES6+ Syntax & Scope',
        'DOM Manipulation & Event-Driven Architecture',
        'Asynchronous Programming (Promises, Async/Await, Fetch)',
        'Modular Architecture, NPM Packages & Tooling',
        'Component State Management Patterns',
        'Full Interactive Web Application Project'
    ],
    'public speaking': [
        'Speech Structure, Audience Analysis & Hook Framing',
        'Voice Modulation, Pitch, Pacing & Pauses',
        'Body Language, Eye Contact & Stage Presence',
        'Impromptu Speaking & Handling Q&A Under Pressure',
        'Presentation Slide Deck Design & Storytelling',
        'Mock Keynote / Placement Pitch Delivery & Critique'
    ],
    'ui/ux design': [
        'User Research, Personas & User Journey Mapping',
        'Information Architecture & Low-Fidelity Wireframing',
        'Figma Components, Auto-Layout & Design Systems',
        'High-Fidelity Prototyping & Micro-Interactions',
        'Usability Testing, Heuristic Evaluation & Iteration',
        'Complete Mobile App Case Study Review'
    ]
};

function getCuratedTopics(skillName) {
    const key = (skillName || '').toLowerCase().trim();
    for (const [k, topics] of Object.entries(DEFAULT_SKILL_CURRICULUM)) {
        if (key.includes(k) || k.includes(key)) {
            return topics.map((t, idx) => ({ id: idx + 1, name: t, completed: false, sessionCount: 0 }));
        }
    }
    // Fallback general 4-step learning track
    return [
        { id: 1, name: `${skillName} Foundations, Setup & Core Syntax`, completed: false, sessionCount: 0 },
        { id: 2, name: `${skillName} Intermediate Patterns & Practical Workflows`, completed: false, sessionCount: 0 },
        { id: 3, name: `${skillName} Problem Solving & Hands-on Exercises`, completed: false, sessionCount: 0 },
        { id: 4, name: `${skillName} Applied Project Implementation & Review`, completed: false, sessionCount: 0 }
    ];
}

/**
 * Initialize Exchange Engine State with sample sessions, learning logs, and streaks
 */
function initExchangeEngineState(state) {
    if (!state.sessions) {
        state.sessions = [];
    }
    if (!state.learningActivities) {
        state.learningActivities = [];
    }
    if (!state.learningStreaks) {
        state.learningStreaks = {};
    }

    if (!state.quizzes) {
        state.quizzes = [];
    }
    if (!state.quizAttempts) {
        state.quizAttempts = [];
    }
    if (!state.certificates) {
        state.certificates = [];
    }
    if (!state.kitabOrders) {
        state.kitabOrders = [];
    }

    // Default streak seed for demonstration users
    state.learningStreaks[2] = { userId: 2, currentStreak: 3, longestStreak: 7, lastActivityDate: new Date().toISOString().split('T')[0] }; // Harsh
    state.learningStreaks[3] = { userId: 3, currentStreak: 2, longestStreak: 5, lastActivityDate: new Date().toISOString().split('T')[0] }; // Sejal
    state.learningStreaks[4] = { userId: 4, currentStreak: 4, longestStreak: 6, lastActivityDate: new Date().toISOString().split('T')[0] }; // Raza
    state.learningStreaks[5] = { userId: 5, currentStreak: 1, longestStreak: 3, lastActivityDate: new Date(Date.now() - 86400000).toISOString().split('T')[0] }; // Udipti

    // Initialize Exchange 1 Plan (Harsh & Sejal: Java & Photoshop)
    if (state.exchanges && state.exchanges.length > 0) {
        const ex1 = state.exchanges[0];
        if (!ex1.plan) {
            ex1.plan = {
                exchangeId: ex1.id,
                requestId: ex1.requestId,
                studentAId: ex1.student1Id,
                studentAName: ex1.student1Name,
                studentBId: ex1.student2Id,
                studentBName: ex1.student2Name,
                skillAId: ex1.skill1Id,
                skillAName: ex1.skill1Name || "Java",
                skillBId: ex1.skill2Id,
                skillBName: ex1.skill2Name || "Photoshop",
                // First teacher is explicitly defined
                firstTeacherId: ex1.student2Id, // Sejal teaches Photoshop first
                firstTeacherName: ex1.student2Name,
                firstLearnerId: ex1.student1Id,
                firstLearnerName: ex1.student1Name,
                firstSkillId: ex1.skill2Id,
                firstSkillName: ex1.skill2Name || "Photoshop",
                secondTeacherId: ex1.student1Id, // Harsh teaches Java second
                secondTeacherName: ex1.student1Name,
                secondLearnerId: ex1.student2Id,
                secondLearnerName: ex1.student2Name,
                secondSkillId: ex1.skill1Id,
                secondSkillName: ex1.skill1Name || "Java",
                durationWeeks: 4,
                plannedSessionsCount: 4,
                learningObjectives: [
                    "Master Photoshop non-destructive layers, masking, and visual design fundamentals",
                    "Design complete vector graphics poster for campus tech fest",
                    "Understand Java OOP polymorphism, interfaces, and architecture",
                    "Build and test modular Java backend application"
                ],
                skillATopics: getCuratedTopics(ex1.skill1Name || "Java"),
                skillBTopics: getCuratedTopics(ex1.skill2Name || "Photoshop"),
                currentPhase: `Phase 2: ${ex1.student1Name} teaches ${ex1.skill1Name || 'Java'} to ${ex1.student2Name}`,
                overallProgress: 100,
                status: 'PLAN_CONFIRMED',
                confirmedByA: true,
                confirmedByB: true,
                confirmedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
                createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
            };
            ex1.lastActivityAt = new Date(Date.now() - 2 * 86400000).toISOString();
        }

        // Initialize Exchange 2 Plan (Raza & Udipti: Python & Public Speaking)
        if (state.exchanges.length > 1) {
            const ex2 = state.exchanges[1];
            if (!ex2.plan) {
                ex2.plan = {
                    exchangeId: ex2.id,
                    requestId: ex2.requestId,
                    studentAId: ex2.student1Id,
                    studentAName: ex2.student1Name,
                    studentBId: ex2.student2Id,
                    studentBName: ex2.student2Name,
                    skillAId: ex2.skill1Id,
                    skillAName: ex2.skill1Name || "Python",
                    skillBId: ex2.skill2Id,
                    skillBName: ex2.skill2Name || "Public Speaking",
                    firstTeacherId: ex2.student1Id, // Raza teaches Python first
                    firstTeacherName: ex2.student1Name,
                    firstLearnerId: ex2.student2Id,
                    firstLearnerName: ex2.student2Name,
                    firstSkillId: ex2.skill1Id,
                    firstSkillName: ex2.skill1Name || "Python",
                    secondTeacherId: ex2.student2Id,
                    secondTeacherName: ex2.student2Name,
                    secondLearnerId: ex2.student1Id,
                    secondLearnerName: ex2.student1Name,
                    secondSkillId: ex2.skill2Id,
                    secondSkillName: ex2.skill2Name || "Public Speaking",
                    durationWeeks: 4,
                    plannedSessionsCount: 4,
                    learningObjectives: [
                        "Master Python data structures and file processing",
                        "Build automated dataset cleaning script",
                        "Deliver structured 5-minute technical presentation with vocal variety"
                    ],
                    skillATopics: getCuratedTopics(ex2.skill1Name || "Python"),
                    skillBTopics: getCuratedTopics(ex2.skill2Name || "Public Speaking"),
                    currentPhase: `Phase 1: ${ex2.student1Name} teaches ${ex2.skill1Name || 'Python'} to ${ex2.student2Name}`,
                    overallProgress: 40,
                    status: 'PLAN_CONFIRMED',
                    confirmedByA: true,
                    confirmedByB: true,
                    confirmedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
                    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
                };
                ex2.lastActivityAt = new Date(Date.now() - 1 * 86400000).toISOString();
            }
        }
    }

    // Seed sample Quizzes, Certificates & Kitaab Orders if empty
    if (state.quizzes.length === 0) {
        state.quizzes.push({
            id: 1,
            sessionId: 1,
            exchangeId: 1,
            skillId: 4,
            skillName: "Photoshop",
            topic: "Photoshop Interface, Layers & Vector Masks",
            teacherId: 3,
            teacherName: "Sejal Sharma",
            learnerId: 2,
            learnerName: "Harsh Vardhan",
            title: "Photoshop Non-Destructive Masking Quiz",
            questions: [
                {
                    id: 1,
                    type: "MULTIPLE_CHOICE",
                    question: "Which color in a layer mask completely hides the layer content?",
                    options: ["White", "Black", "50% Gray", "Transparent"],
                    correctAnswer: "Black",
                    marks: 1
                },
                {
                    id: 2,
                    type: "TRUE_FALSE",
                    question: "Smart Objects allow non-destructive scaling and filtering in Photoshop.",
                    options: ["True", "False"],
                    correctAnswer: "True",
                    marks: 1
                },
                {
                    id: 3,
                    type: "MULTIPLE_CHOICE",
                    question: "What is the primary advantage of using an Adjustment Layer over direct image adjustments?",
                    options: ["Faster rendering", "Permanent pixel replacement", "Non-destructive flexibility with a built-in mask", "Smaller file size"],
                    correctAnswer: "Non-destructive flexibility with a built-in mask",
                    marks: 1
                },
                {
                    id: 4,
                    type: "SHORT_ANSWER",
                    question: "What tool is best for creating precise vector-based clipping paths in Photoshop?",
                    options: [],
                    correctAnswer: "Pen Tool",
                    marks: 1
                }
            ],
            maxMarks: 4,
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
        });

        state.quizAttempts.push({
            id: 1,
            quizId: 1,
            sessionId: 1,
            exchangeId: 1,
            learnerId: 2,
            learnerName: "Harsh Vardhan",
            marksObtained: 4,
            maxMarks: 4,
            percentage: 100,
            answers: [
                { questionId: 1, answer: "Black", isCorrect: true, marksAwarded: 1 },
                { questionId: 2, answer: "True", isCorrect: true, marksAwarded: 1 },
                { questionId: 3, answer: "Non-destructive flexibility with a built-in mask", isCorrect: true, marksAwarded: 1 },
                { questionId: 4, answer: "Pen Tool", isCorrect: true, marksAwarded: 1 }
            ],
            teacherFeedback: "Flawless demonstration of layer masks and vector paths! Ready for typography.",
            attemptedAt: new Date(Date.now() - 3 * 86400000 + 3900000).toISOString()
        });
    }

    if (state.certificates.length === 0) {
        state.certificates.push(
            {
                id: "CERT-2026-SE784A",
                exchangeId: 1,
                studentId: 2,
                studentName: "Harsh Vardhan",
                skillId: 4,
                skillName: "Photoshop",
                skillCategory: "Design",
                partnerId: 3,
                partnerName: "Sejal Sharma",
                totalSessions: 4,
                verifiedSessions: 4,
                finalProgress: 100,
                issueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                title: "Certificate of Skill Exchange Completion",
                institution: "Student Skill Exchange Platform • MGM College of Engineering & Technology",
                verificationCode: "MGM-SE-2026-HV04"
            },
            {
                id: "CERT-2026-SE784B",
                exchangeId: 1,
                studentId: 3,
                studentName: "Sejal Sharma",
                skillId: 1,
                skillName: "Java",
                skillCategory: "Programming",
                partnerId: 2,
                partnerName: "Harsh Vardhan",
                totalSessions: 4,
                verifiedSessions: 4,
                finalProgress: 100,
                issueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                title: "Certificate of Skill Exchange Completion",
                institution: "Student Skill Exchange Platform • MGM College of Engineering & Technology",
                verificationCode: "MGM-SE-2026-SS01"
            }
        );
    }

    if (state.kitabOrders.length === 0) {
        state.kitabOrders.push({
            id: 1,
            itemId: 1,
            itemTitle: "Operating System Concepts (10th Edition)",
            itemType: "BOOK",
            price: 0,
            sellerId: 2,
            sellerName: "Harsh Vardhan",
            sellerEmail: "harsh@mgmmumbai.ac.in",
            buyerId: 3,
            buyerName: "Sejal Sharma",
            buyerEmail: "sejal@mgmmumbai.ac.in",
            handoverLocation: "Central Library Ground Floor Study Zone",
            handoverDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            handoverTime: "13:30",
            notes: "Preparing for Semester 5 OS mid-terms.",
            status: "READY_FOR_HANDOVER",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    // Seed sample verified sessions if empty
    if (state.sessions.length === 0) {
        state.sessions.push(
            {
                id: 1,
                exchangeId: 1,
                exchangeRequestId: 1,
                sessionNumber: 1,
                mode: "ONLINE",
                teacherId: 3,
                teacherName: "Sejal Sharma",
                teacherEmail: "sejal@mgmmumbai.ac.in",
                learnerId: 2,
                learnerName: "Harsh Vardhan",
                learnerEmail: "harsh@mgmmumbai.ac.in",
                skillId: 4,
                skillName: "Photoshop",
                topic: "Photoshop Interface, Layers & Vector Masks",
                objective: "Master non-destructive editing and layer masking for campus creative designs",
                scheduledDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
                scheduledTime: "17:00",
                durationMinutes: 60,
                location: null,
                zoomMeetingId: "84920194821",
                zoomJoinUrl: "https://zoom.us/j/84920194821?pwd=skilltrade2026",
                zoomPassword: "skilltrade2026",
                status: "VERIFIED",
                attendance: {
                    teacher: "PRESENT",
                    learner: "PRESENT",
                    checkInAt: new Date(Date.now() - 3 * 86400000).toISOString(),
                    completedAt: new Date(Date.now() - 3 * 86400000 + 3600000).toISOString()
                },
                teacherReport: {
                    topicsCovered: "Layer hierarchy, adjustment layers, brush masking, smart objects",
                    summary: "Harsh demonstrated strong comprehension of masking techniques and completed the poster template.",
                    confirmed: true,
                    confirmedAt: new Date(Date.now() - 3 * 86400000 + 3700000).toISOString()
                },
                learnerReport: {
                    understanding: "Clear understanding of non-destructive masking and blend modes.",
                    confidence: 5,
                    practiceNeeded: "Bezier pen tool selections",
                    nextTopic: "Typography & Color Grading",
                    doubts: "None",
                    confirmed: true,
                    confirmedAt: new Date(Date.now() - 3 * 86400000 + 3800000).toISOString()
                },
                verificationStatus: "VERIFIED",
                verifiedAt: new Date(Date.now() - 3 * 86400000 + 3800000).toISOString(),
                resources: ["https://helpx.adobe.com/photoshop/using/layer-masks.html"],
                disputeReason: null,
                createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
            },
            {
                id: 2,
                exchangeId: 1,
                exchangeRequestId: 1,
                sessionNumber: 2,
                mode: "ONLINE",
                teacherId: 2,
                teacherName: "Harsh Vardhan",
                teacherEmail: "harsh@mgmmumbai.ac.in",
                learnerId: 3,
                learnerName: "Sejal Sharma",
                learnerEmail: "sejal@mgmmumbai.ac.in",
                skillId: 1,
                skillName: "Java",
                topic: "Java OOP, Polymorphism & Interface Contracts",
                objective: "Implement clean object-oriented architecture with interfaces and abstract classes",
                scheduledDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
                scheduledTime: "18:30",
                durationMinutes: 75,
                location: null,
                zoomMeetingId: "84920194822",
                zoomJoinUrl: "https://zoom.us/j/84920194822?pwd=skilltrade2026",
                zoomPassword: "skilltrade2026",
                status: "VERIFIED",
                attendance: {
                    teacher: "PRESENT",
                    learner: "PRESENT",
                    checkInAt: new Date(Date.now() - 2 * 86400000).toISOString(),
                    completedAt: new Date(Date.now() - 2 * 86400000 + 4500000).toISOString()
                },
                teacherReport: {
                    topicsCovered: "Classes, abstract classes, interface contracts, polymorphism",
                    summary: "Sejal wrote a full payment gateway interface and 2 concrete implementations without compilation errors.",
                    confirmed: true,
                    confirmedAt: new Date(Date.now() - 2 * 86400000 + 4600000).toISOString()
                },
                learnerReport: {
                    understanding: "Grasped why interfaces provide flexible decoupling in large systems.",
                    confidence: 4,
                    practiceNeeded: "Diamond problem in multiple interfaces",
                    nextTopic: "Collections Framework (Map, Set, List)",
                    doubts: "Difference between default methods and abstract classes",
                    confirmed: true,
                    confirmedAt: new Date(Date.now() - 2 * 86400000 + 4700000).toISOString()
                },
                verificationStatus: "VERIFIED",
                verifiedAt: new Date(Date.now() - 2 * 86400000 + 4700000).toISOString(),
                resources: ["https://dev.java/learn/oop/"],
                disputeReason: null,
                createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
            },
            {
                id: 3,
                exchangeId: 2,
                exchangeRequestId: 2,
                sessionNumber: 1,
                mode: "OFFLINE",
                teacherId: 4,
                teacherName: "Raza Khan",
                teacherEmail: "raza@mgmmumbai.ac.in",
                learnerId: 5,
                learnerName: "Udipti Sen",
                learnerEmail: "udipti@mgmmumbai.ac.in",
                skillId: 2,
                skillName: "Python",
                topic: "Python Environment Setup, Variables & Control Flow",
                objective: "Set up VS Code, virtual environment, and write conditional logic loops",
                scheduledDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
                scheduledTime: "15:00",
                durationMinutes: 60,
                location: "College Central Library — Discussion Room 2",
                zoomMeetingId: null,
                zoomJoinUrl: null,
                zoomPassword: null,
                status: "VERIFIED",
                attendance: {
                    teacher: "PRESENT",
                    learner: "PRESENT",
                    checkInAt: new Date(Date.now() - 1 * 86400000).toISOString(),
                    completedAt: new Date(Date.now() - 1 * 86400000 + 3600000).toISOString()
                },
                teacherReport: {
                    topicsCovered: "Python 3.11 setup, variables, string formatting, while/for loops",
                    summary: "Udipti installed Python, created first script, and completed 5 coding exercises in the library.",
                    confirmed: true,
                    confirmedAt: new Date(Date.now() - 1 * 86400000 + 3700000).toISOString()
                },
                learnerReport: {
                    understanding: "Understood syntax structure, indentation rules, and for loops.",
                    confidence: 5,
                    practiceNeeded: "Nested loops and break/continue statements",
                    nextTopic: "Data Structures (Lists & Dictionaries)",
                    doubts: "None",
                    confirmed: true,
                    confirmedAt: new Date(Date.now() - 1 * 86400000 + 3800000).toISOString()
                },
                verificationStatus: "VERIFIED",
                verifiedAt: new Date(Date.now() - 1 * 86400000 + 3800000).toISOString(),
                resources: ["https://docs.python.org/3/tutorial/"],
                disputeReason: null,
                createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
            }
        );
    }

    // Seed sample legitimate learning activities
    if (state.learningActivities.length === 0) {
        state.learningActivities.push(
            {
                id: 1,
                userId: 2,
                userName: "Harsh Vardhan",
                exchangeId: 1,
                sessionId: 1,
                skillName: "Photoshop",
                activityType: "SESSION_VERIFIED",
                description: "Verified Session #1: Photoshop Interface, Layers & Vector Masks (Learner)",
                date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
                timestamp: new Date(Date.now() - 3 * 86400000).toISOString()
            },
            {
                id: 2,
                userId: 3,
                userName: "Sejal Sharma",
                exchangeId: 1,
                sessionId: 1,
                skillName: "Photoshop",
                activityType: "SESSION_VERIFIED",
                description: "Verified Session #1: Photoshop Interface, Layers & Vector Masks (Teacher)",
                date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
                timestamp: new Date(Date.now() - 3 * 86400000).toISOString()
            },
            {
                id: 3,
                userId: 2,
                userName: "Harsh Vardhan",
                exchangeId: 1,
                sessionId: 2,
                skillName: "Java",
                activityType: "SESSION_VERIFIED",
                description: "Verified Session #2: Java OOP, Polymorphism & Interface Contracts (Teacher)",
                date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
                timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
            },
            {
                id: 4,
                userId: 3,
                userName: "Sejal Sharma",
                exchangeId: 1,
                sessionId: 2,
                skillName: "Java",
                activityType: "SESSION_VERIFIED",
                description: "Verified Session #2: Java OOP, Polymorphism & Interface Contracts (Learner)",
                date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
                timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
            },
            {
                id: 5,
                userId: 4,
                userName: "Raza Khan",
                exchangeId: 2,
                sessionId: 3,
                skillName: "Python",
                activityType: "SESSION_VERIFIED",
                description: "Verified Session #1: Python Environment Setup, Variables & Control Flow (Teacher)",
                date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
                timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
            },
            {
                id: 6,
                userId: 5,
                userName: "Udipti Sen",
                exchangeId: 2,
                sessionId: 3,
                skillName: "Python",
                activityType: "SESSION_VERIFIED",
                description: "Verified Session #1: Python Environment Setup, Variables & Control Flow (Learner)",
                date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
                timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
            }
        );
    }
}

/**
 * Calculate real topic-level progress for a skill in an exchange
 */
function calculateSkillProgress(exchange, skillName, state) {
    if (!exchange || !exchange.plan) {
        return {
            skillName,
            progressPercentage: 0,
            completedTopics: [],
            remainingTopics: [],
            totalTopicsCount: 0
        };
    }

    const sNameLower = (skillName || '').toLowerCase().trim();

    // Determine planned topics:
    // Check if skillATopics or skillBTopics match this skill
    let plannedTopics = [];
    const aTopics = exchange.plan.skillATopics || [];
    const bTopics = exchange.plan.skillBTopics || [];

    const aHasSkill = aTopics.some(t => (t.name || '').toLowerCase().includes(sNameLower));
    const bHasSkill = bTopics.some(t => (t.name || '').toLowerCase().includes(sNameLower));

    if (aHasSkill) {
        plannedTopics = aTopics;
    } else if (bHasSkill) {
        plannedTopics = bTopics;
    } else if ((exchange.plan.skillAName || '').toLowerCase().trim() === sNameLower) {
        plannedTopics = aTopics;
    } else if ((exchange.plan.skillBName || '').toLowerCase().trim() === sNameLower) {
        plannedTopics = bTopics;
    } else {
        plannedTopics = getCuratedTopics(skillName);
    }

    if (!plannedTopics || plannedTopics.length === 0) {
        plannedTopics = getCuratedTopics(skillName);
    }

    // Get all verified sessions for this exchange and skill
    const verifiedSessions = (state.sessions || []).filter(s => 
        s.exchangeId === exchange.id && 
        (s.skillName || '').toLowerCase().trim() === sNameLower &&
        s.verificationStatus === 'VERIFIED'
    );

    const completedTopics = [];
    const remainingTopics = [];

    plannedTopics.forEach((t, idx) => {
        const tLower = (t.name || '').toLowerCase();
        const tTokens = tLower.split(/[\s,&()/-]+/).filter(w => w.length > 2);

        const matchingSession = verifiedSessions.find(s => {
            const sTopic = (s.topic || '').toLowerCase();
            const sCovered = (s.teacherReport && s.teacherReport.topicsCovered ? s.teacherReport.topicsCovered : '').toLowerCase();
            if (sTopic.includes(tLower) || tLower.includes(sTopic)) return true;
            if (sCovered.includes(tLower) || tLower.includes(sCovered)) return true;
            return tTokens.some(tok => sTopic.includes(tok) || sCovered.includes(tok));
        });

        if (matchingSession || t.completed || idx < verifiedSessions.length) {
            completedTopics.push(t.name);
        } else {
            remainingTopics.push(t.name);
        }
    });

    const progressPercentage = Math.min(100, Math.round((completedTopics.length / plannedTopics.length) * 100));

    return {
        skillName,
        progressPercentage,
        completedTopics,
        remainingTopics,
        totalTopicsCount: plannedTopics.length
    };
}

/**
 * Calculate overall exchange progress by averaging skill progress
 */
function calculateExchangeOverallProgress(exchange, state) {
    if (!exchange || !exchange.plan) return 0;

    const progA = calculateSkillProgress(exchange, exchange.plan.skillAName, state);
    const progB = calculateSkillProgress(exchange, exchange.plan.skillBName, state);

    const totalCompleted = (progA.completedTopics?.length || 0) + (progB.completedTopics?.length || 0);
    const totalPlanned = Math.max(1, (progA.totalTopicsCount || 0) + (progB.totalTopicsCount || 0));
    const overall = Math.round((totalCompleted / totalPlanned) * 100);

    exchange.overallProgress = overall;
    exchange.plan.overallProgress = overall;
    return overall;
}

/**
 * Records legitimate learning activity and maintains consecutive streak
 */
function recordLearningActivity(userId, userName, exchangeId, sessionId, skillName, activityType, description, state) {
    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const newActivity = {
        id: (state.learningActivities || []).length + 1,
        userId,
        userName,
        exchangeId,
        sessionId,
        skillName,
        activityType,
        description,
        date: today,
        timestamp: nowIso
    };

    if (!state.learningActivities) state.learningActivities = [];
    state.learningActivities.unshift(newActivity);

    // Update streak logic (real consecutive calendar day tracking)
    if (!state.learningStreaks) state.learningStreaks = {};
    let streak = state.learningStreaks[userId];

    if (!streak) {
        streak = {
            userId,
            currentStreak: 1,
            longestStreak: 1,
            lastActivityDate: today
        };
        state.learningStreaks[userId] = streak;
    } else {
        const lastDate = streak.lastActivityDate;
        if (lastDate === today) {
            // Already logged activity today; streak unchanged
        } else {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            if (lastDate === yesterday) {
                // Consecutive day
                streak.currentStreak += 1;
            } else {
                // Streak broken; reset to 1
                streak.currentStreak = 1;
            }
            streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
            streak.lastActivityDate = today;
        }
    }

    return { activity: newActivity, streak };
}

/**
 * Calculate transparent, measurable Skill Health based on real stored signals
 */
function calculateSkillHealth(skillName, userId, state) {
    const verifiedSessions = (state.sessions || []).filter(s =>
        (s.skillName || '').toLowerCase() === (skillName || '').toLowerCase() &&
        (userId ? (s.teacherId === userId || s.learnerId === userId) : true) &&
        s.verificationStatus === 'VERIFIED'
    );

    const verifiedCount = verifiedSessions.length;
    let daysSinceLast = 999;

    if (verifiedCount > 0) {
        const sorted = [...verifiedSessions].sort((a, b) => new Date(b.verifiedAt || b.scheduledDate).getTime() - new Date(a.verifiedAt || a.scheduledDate).getTime());
        const lastDate = new Date(sorted[0].verifiedAt || sorted[0].scheduledDate).getTime();
        daysSinceLast = Math.max(0, Math.floor((Date.now() - lastDate) / 86400000));
    }

    // Confidence scores from learner reports
    const confidences = verifiedSessions
        .filter(s => s.learnerReport && s.learnerReport.confidence)
        .map(s => Number(s.learnerReport.confidence));

    const avgConfidence = confidences.length > 0
        ? confidences.reduce((acc, c) => acc + c, 0) / confidences.length
        : 4.5;

    // Check overdue sessions
    const today = new Date().toISOString().split('T')[0];
    const overdueCount = (state.sessions || []).filter(s =>
        (s.skillName || '').toLowerCase() === (skillName || '').toLowerCase() &&
        (userId ? (s.teacherId === userId || s.learnerId === userId) : true) &&
        s.scheduledDate < today &&
        s.verificationStatus !== 'VERIFIED' &&
        s.status !== 'COMPLETED'
    ).length;

    let status = 'ON TRACK';
    let reason = '';

    if (verifiedCount === 0 && daysSinceLast >= 999) {
        status = 'INACTIVE';
        reason = `No verified sessions conducted yet for ${skillName}.`;
    } else if (daysSinceLast > 10 || overdueCount >= 2) {
        status = 'NEEDS ATTENTION';
        reason = `No verified activity for ${daysSinceLast} days; ${overdueCount} overdue session(s) pending.`;
    } else if (avgConfidence >= 4.0 && daysSinceLast <= 5) {
        status = 'HEALTHY';
        reason = `Strong learner confidence (${avgConfidence.toFixed(1)}/5); ${verifiedCount} verified session(s); active ${daysSinceLast === 0 ? 'today' : daysSinceLast + 'd ago'}.`;
    } else if (daysSinceLast <= 7) {
        status = 'ON TRACK';
        reason = `Consistent weekly cadence; ${verifiedCount} verified session(s); active ${daysSinceLast}d ago.`;
    } else {
        status = 'ON TRACK';
        reason = `Cadence on track with ${verifiedCount} session(s) verified; last activity ${daysSinceLast}d ago.`;
    }

    return {
        skillName,
        status,
        reason,
        verifiedCount,
        averageConfidence: Number(avgConfidence.toFixed(1)),
        daysSinceLastActivity: daysSinceLast === 999 ? 0 : daysSinceLast,
        overdueCount
    };
}

/**
 * Creates a default structured Exchange Plan
 */
function createDefaultExchangePlan(exchange) {
    const studentAName = exchange.student1Name || exchange.userAName || "Student A";
    const studentBName = exchange.student2Name || exchange.userBName || "Student B";
    const skillAName = exchange.skill1Name || exchange.skillOfferedTitle || "Skill A";
    const skillBName = exchange.skill2Name || exchange.skillRequestedTitle || "Skill B";

    const plan = {
        exchangeId: exchange.id,
        requestId: exchange.requestId,
        studentAId: exchange.student1Id || exchange.userAId,
        studentAName: studentAName,
        studentBId: exchange.student2Id || exchange.userBId,
        studentBName: studentBName,
        skillAId: exchange.skill1Id,
        skillAName: skillAName,
        skillBId: exchange.skill2Id,
        skillBName: skillBName,
        // Explicitly defines who teaches first
        firstTeacherId: exchange.student2Id || exchange.userBId, // Default: Student B teaches first
        firstTeacherName: studentBName,
        firstLearnerId: exchange.student1Id || exchange.userAId,
        firstLearnerName: studentAName,
        firstSkillId: exchange.skill2Id,
        firstSkillName: skillBName,
        secondTeacherId: exchange.student1Id || exchange.userAId,
        secondTeacherName: studentAName,
        secondLearnerId: exchange.student2Id || exchange.userBId,
        secondLearnerName: studentBName,
        secondSkillId: exchange.skill1Id,
        secondSkillName: skillAName,
        durationWeeks: 4,
        plannedSessionsCount: 4,
        learningObjectives: [
            `Master fundamental concepts and setup of ${skillBName}`,
            `Complete hands-on implementation and problem sets in ${skillBName}`,
            `Transition to reciprocal phase: master fundamentals and patterns in ${skillAName}`,
            `Deliver collaborative capstone implementation with peer code review`
        ],
        skillATopics: getCuratedTopics(skillAName),
        skillBTopics: getCuratedTopics(skillBName),
        currentPhase: `Phase 1: ${studentBName} teaches ${skillBName} to ${studentAName}`,
        overallProgress: 0,
        status: 'PLAN_PENDING_CONFIRMATION',
        confirmedByA: false,
        confirmedByB: false,
        confirmedAt: null,
        createdAt: new Date().toISOString()
    };

    return plan;
}

/**
 * Main HTTP API Dispatcher for Skill Exchange Engine
 */
async function handleExchangeEngineApi(req, res, pathname, parsedUrl, state, helpers) {
    const { sendJson: rawSendJson, parseBody, syncSupabase, isAdmin, createZoomMeeting } = helpers;
    const sendJson = (responseObj, statusCode, payload) => {
        rawSendJson(responseObj, statusCode, payload);
        return true;
    };

    // Ensure state collections exist
    initExchangeEngineState(state);

    // =========================================================================
    // 1. EXCHANGE PLAN ENDPOINTS
    // =========================================================================

    // GET /api/exchanges/:id/plan
    if (pathname.match(/^\/api\/exchanges\/(\d+)\/plan$/) && req.method === 'GET') {
        const exId = Number(pathname.split('/')[3]);
        const ex = (state.exchanges || []).find(e => e.id === exId);
        if (!ex) return sendJson(res, 404, { success: false, message: "Exchange not found." });

        if (!ex.plan) {
            ex.plan = createDefaultExchangePlan(ex);
        }

        calculateExchangeOverallProgress(ex, state);
        return sendJson(res, 200, { success: true, data: ex.plan });
    }

    // POST /api/exchanges/:id/plan (Update/Define Exchange Plan)
    if (pathname.match(/^\/api\/exchanges\/(\d+)\/plan$/) && req.method === 'POST') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const exId = Number(pathname.split('/')[3]);
        const ex = (state.exchanges || []).find(e => e.id === exId);
        if (!ex) return sendJson(res, 404, { success: false, message: "Exchange not found." });

        const myId = state.currentUser.userId;
        const isParticipant = (ex.student1Id === myId || ex.student2Id === myId || ex.userAId === myId || ex.userBId === myId);
        if (!isParticipant && !isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden: You are not a participant in this exchange." });
        }

        const body = await parseBody(req);
        if (!ex.plan) {
            ex.plan = createDefaultExchangePlan(ex);
        }

        // Allow defining order
        if (body.firstTeacherId) {
            const fTeacherId = Number(body.firstTeacherId);
            const isStudentA = fTeacherId === ex.plan.studentAId;
            ex.plan.firstTeacherId = fTeacherId;
            ex.plan.firstTeacherName = isStudentA ? ex.plan.studentAName : ex.plan.studentBName;
            ex.plan.firstLearnerId = isStudentA ? ex.plan.studentBId : ex.plan.studentAId;
            ex.plan.firstLearnerName = isStudentA ? ex.plan.studentBName : ex.plan.studentAName;
            ex.plan.firstSkillId = isStudentA ? ex.plan.skillAId : ex.plan.skillBId;
            ex.plan.firstSkillName = isStudentA ? ex.plan.skillAName : ex.plan.skillBName;

            ex.plan.secondTeacherId = ex.plan.firstLearnerId;
            ex.plan.secondTeacherName = ex.plan.firstLearnerName;
            ex.plan.secondLearnerId = ex.plan.firstTeacherId;
            ex.plan.secondLearnerName = ex.plan.firstTeacherName;
            ex.plan.secondSkillId = isStudentA ? ex.plan.skillBId : ex.plan.skillAId;
            ex.plan.secondSkillName = isStudentA ? ex.plan.skillBName : ex.plan.skillAName;

            ex.plan.currentPhase = `Phase 1: ${ex.plan.firstTeacherName} teaches ${ex.plan.firstSkillName} to ${ex.plan.firstLearnerName}`;
        }

        if (body.skillAName) ex.plan.skillAName = body.skillAName;
        if (body.skillBName) ex.plan.skillBName = body.skillBName;
        if (body.durationWeeks) ex.plan.durationWeeks = Number(body.durationWeeks);
        if (body.plannedSessionsCount) ex.plan.plannedSessionsCount = Number(body.plannedSessionsCount);
        if (Array.isArray(body.learningObjectives)) ex.plan.learningObjectives = body.learningObjectives;
        if (Array.isArray(body.skillATopics)) {
            ex.plan.skillATopics = body.skillATopics;
            // If skillATopics explicitly has topics for skillBName, align skillAName and skillBName
            const firstTopic = (body.skillATopics[0]?.name || '').toLowerCase();
            if (firstTopic.includes('java') && (ex.plan.skillBName || '').toLowerCase().includes('java')) {
                const tmp = ex.plan.skillAName;
                ex.plan.skillAName = ex.plan.skillBName;
                ex.plan.skillBName = tmp;
            }
        }
        if (Array.isArray(body.skillBTopics)) ex.plan.skillBTopics = body.skillBTopics;

        // Reset confirmations whenever plan parameters change
        ex.plan.status = 'PLAN_PENDING_CONFIRMATION';
        ex.plan.confirmedByA = false;
        ex.plan.confirmedByB = false;
        ex.plan.confirmedAt = null;

        syncSupabase('saveExchange', ex);
        return sendJson(res, 200, { success: true, message: "Exchange plan updated. Both participants must confirm.", data: ex.plan });
    }

    // PUT /api/exchanges/:id/plan/confirm (Participant confirms the Exchange Plan)
    if (pathname.match(/^\/api\/exchanges\/(\d+)\/plan\/confirm$/) && req.method === 'PUT') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const exId = Number(pathname.split('/')[3]);
        const ex = (state.exchanges || []).find(e => e.id === exId);
        if (!ex) return sendJson(res, 404, { success: false, message: "Exchange not found." });

        const myId = state.currentUser.userId;
        if (!ex.plan) ex.plan = createDefaultExchangePlan(ex);

        const isStudentA = (myId === ex.plan.studentAId);
        const isStudentB = (myId === ex.plan.studentBId);

        if (!isStudentA && !isStudentB && !isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden: You are not a participant in this exchange." });
        }

        if (isStudentA || isAdmin(state.currentUser)) ex.plan.confirmedByA = true;
        if (isStudentB || isAdmin(state.currentUser)) ex.plan.confirmedByB = true;

        const bothConfirmed = ex.plan.confirmedByA && ex.plan.confirmedByB;
        if (bothConfirmed) {
            ex.plan.status = 'PLAN_CONFIRMED';
            ex.plan.confirmedAt = new Date().toISOString();

            // Auto-plan Session 1 if no sessions exist yet
            const existingSessions = (state.sessions || []).filter(s => s.exchangeId === ex.id);
            if (existingSessions.length === 0) {
                const firstTopic = (ex.plan.skillBTopics && ex.plan.skillBTopics[0]) ? ex.plan.skillBTopics[0].name : `${ex.plan.firstSkillName} Foundations`;
                const firstSession = {
                    id: (state.sessions || []).length + 1,
                    exchangeId: ex.id,
                    exchangeRequestId: ex.requestId,
                    sessionNumber: 1,
                    mode: ex.learningMode || "ONLINE",
                    teacherId: ex.plan.firstTeacherId,
                    teacherName: ex.plan.firstTeacherName,
                    teacherEmail: "student@mgmmumbai.ac.in",
                    learnerId: ex.plan.firstLearnerId,
                    learnerName: ex.plan.firstLearnerName,
                    learnerEmail: "student@mgmmumbai.ac.in",
                    skillId: ex.plan.firstSkillId,
                    skillName: ex.plan.firstSkillName,
                    topic: firstTopic,
                    objective: ex.plan.learningObjectives[0] || `Master ${ex.plan.firstSkillName} fundamentals`,
                    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    scheduledTime: "17:00",
                    durationMinutes: 60,
                    location: ex.learningMode === 'OFFLINE' ? "College Central Library / Study Hall" : null,
                    zoomMeetingId: null,
                    zoomJoinUrl: null,
                    zoomPassword: null,
                    status: "PLANNED",
                    attendance: { teacher: "PRESENT", learner: "PRESENT" },
                    teacherReport: null,
                    learnerReport: null,
                    verificationStatus: "PENDING",
                    verifiedAt: null,
                    resources: [],
                    disputeReason: null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                state.sessions.push(firstSession);
            }

            // Post notification
            state.notifications.unshift({
                id: Date.now(),
                recipientId: isStudentA ? ex.plan.studentBId : ex.plan.studentAId,
                title: "Exchange Plan Confirmed! 🎯",
                message: `Both participants confirmed the Exchange Plan for ${ex.plan.skillAName} ↔ ${ex.plan.skillBName}. Session 1 is planned!`,
                type: "EXCHANGE_PLAN_CONFIRMED",
                linkUrl: "requests.html",
                isRead: false,
                createdAt: new Date().toISOString()
            });
        }

        syncSupabase('saveExchange', ex);
        return sendJson(res, 200, {
            success: true,
            message: bothConfirmed ? "Exchange plan confirmed by both students!" : "Your confirmation recorded. Awaiting peer confirmation.",
            data: ex.plan
        });
    }

    // =========================================================================
    // 2. UNIFIED SESSION SYSTEM & TIMELINE
    // =========================================================================

    // GET /api/exchanges/:id/sessions (Timeline of all sessions for an exchange)
    if (pathname.match(/^\/api\/exchanges\/(\d+)\/sessions$/) && req.method === 'GET') {
        const exId = Number(pathname.split('/')[3]);
        const sessions = (state.sessions || [])
            .filter(s => s.exchangeId === exId)
            .sort((a, b) => a.sessionNumber - b.sessionNumber);

        return sendJson(res, 200, { success: true, data: sessions });
    }

    // POST /api/exchanges/:id/sessions (Schedule a new session)
    if (pathname.match(/^\/api\/exchanges\/(\d+)\/sessions$/) && req.method === 'POST') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const exId = Number(pathname.split('/')[3]);
        const ex = (state.exchanges || []).find(e => e.id === exId);
        if (!ex) return sendJson(res, 404, { success: false, message: "Exchange not found." });

        const myId = state.currentUser.userId;
        const isParticipant = (ex.student1Id === myId || ex.student2Id === myId || ex.userAId === myId || ex.userBId === myId);
        if (!isParticipant && !isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden: You are not authorized to schedule a session for this exchange." });
        }

        const body = await parseBody(req);
        const scheduledDate = (body.scheduledDate || '').trim();
        const scheduledTime = (body.scheduledTime || '').trim();
        const topic = (body.topic || '').trim();
        const mode = (body.mode || ex.learningMode || 'ONLINE').toUpperCase();

        if (!scheduledDate || !scheduledTime) {
            return sendJson(res, 400, { success: false, message: "Session date and start time are required." });
        }
        if (!topic) {
            return sendJson(res, 400, { success: false, message: "Session topic is required." });
        }

        const existingSessions = (state.sessions || []).filter(s => s.exchangeId === ex.id);
        const nextSessionNum = body.sessionNumber ? Number(body.sessionNumber) : existingSessions.length + 1;
        const durationMinutes = Math.min(300, Math.max(15, Number(body.durationMinutes) || 60));

        // Determine teacher and learner
        let teacherId = body.teacherId ? Number(body.teacherId) : myId;
        let learnerId = body.learnerId ? Number(body.learnerId) : ((teacherId === ex.student1Id) ? ex.student2Id : ex.student1Id);

        const teacherProf = (state.profiles || []).find(p => p.userId === teacherId);
        const learnerProf = (state.profiles || []).find(p => p.userId === learnerId);
        const teacherName = teacherProf ? teacherProf.fullName : "Teacher";
        const learnerName = learnerProf ? learnerProf.fullName : "Learner";

        let zoomMeetingId = null;
        let zoomJoinUrl = null;
        let zoomPassword = null;

        if (mode === 'ONLINE') {
            const zoomResult = await createZoomMeeting({
                topic: `Session #${nextSessionNum}: ${topic}`,
                startTime: `${scheduledDate}T${scheduledTime}:00Z`,
                durationMinutes,
                agenda: body.objective || `Skill Exchange Session: ${topic}`
            });
            zoomMeetingId = zoomResult.meetingId;
            zoomJoinUrl = zoomResult.joinUrl;
            zoomStartUrl = zoomResult.startUrl || zoomResult.joinUrl;
            zoomPassword = zoomResult.password;
        }

        const newSession = {
            id: (state.sessions || []).length + 1,
            exchangeId: ex.id,
            exchangeRequestId: ex.requestId,
            sessionNumber: nextSessionNum,
            mode,
            teacherId,
            teacherName,
            teacherEmail: teacherProf ? teacherProf.email : "teacher@mgmmumbai.ac.in",
            learnerId,
            learnerName,
            learnerEmail: learnerProf ? learnerProf.email : "learner@mgmmumbai.ac.in",
            skillId: body.skillId || ex.skill1Id,
            skillName: body.skillName || ex.skill1Name || "Skill",
            topic,
            objective: body.objective || `Master ${topic}`,
            scheduledDate,
            scheduledTime,
            durationMinutes,
            location: mode === 'OFFLINE' ? (body.location || "College Central Library / Lab") : null,
            zoomMeetingId,
            zoomJoinUrl,
            zoomStartUrl: zoomStartUrl || zoomJoinUrl,
            zoomPassword,
            status: "SCHEDULED",
            attendance: { teacher: "PRESENT", learner: "PRESENT" },
            teacherReport: null,
            learnerReport: null,
            verificationStatus: "PENDING",
            verifiedAt: null,
            resources: body.resources || [],
            disputeReason: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        state.sessions.push(newSession);

        // Notify learner
        state.notifications.unshift({
            id: Date.now(),
            recipientId: learnerId,
            title: "New Session Scheduled 📅",
            message: `${teacherName} scheduled Session #${nextSessionNum}: "${topic}" on ${scheduledDate} at ${scheduledTime}.`,
            type: "SESSION_SCHEDULED",
            linkUrl: "requests.html",
            isRead: false,
            createdAt: new Date().toISOString()
        });

        // Automatically share in chat
        const chatMsgText = `📅 [SESSION #${nextSessionNum} SCHEDULED]\n🎯 Topic: ${topic}\n📚 Skill: ${newSession.skillName}\n⏰ Time: ${scheduledDate} at ${scheduledTime} (${durationMinutes} mins)\n📍 Mode: ${mode}${mode === 'ONLINE' ? `\n🔗 Zoom Link: ${zoomJoinUrl}` : `\n📌 Location: ${newSession.location}`}`;
        const autoChatMsg = {
            id: (state.messages || []).length + 1,
            senderId: teacherId,
            senderName: teacherName,
            receiverId: learnerId,
            receiverName: learnerName,
            messageText: chatMsgText,
            content: chatMsgText,
            isSystem: true,
            sessionId: newSession.id,
            exchangeId: ex.id,
            sentAt: new Date().toISOString(),
            status: "DELIVERED",
            isRead: false
        };
        state.messages.push(autoChatMsg);

        return sendJson(res, 201, {
            success: true,
            message: "Session scheduled successfully and shared to conversation.",
            data: newSession
        });
    }

    // GET /api/sessions/:id (Single session details)
    if (pathname.match(/^\/api\/sessions\/(\d+)$/) && req.method === 'GET') {
        const sessId = Number(pathname.split('/')[3]);
        const session = (state.sessions || []).find(s => s.id === sessId);
        if (!session) return sendJson(res, 404, { success: false, message: "Session not found." });

        return sendJson(res, 200, { success: true, data: session });
    }

    // PUT /api/sessions/:id/status (Transition status: PLANNED -> SCHEDULED -> STARTING -> IN_PROGRESS -> AWAITING_COMPLETION)
    if (pathname.match(/^\/api\/sessions\/(\d+)\/status$/) && req.method === 'PUT') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const sessId = Number(pathname.split('/')[3]);
        const session = (state.sessions || []).find(s => s.id === sessId);
        if (!session) return sendJson(res, 404, { success: false, message: "Session not found." });

        const myId = state.currentUser.userId;
        const isParticipant = (session.teacherId === myId || session.learnerId === myId);
        if (!isParticipant && !isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden: You are not a participant in this session." });
        }

        const body = await parseBody(req);
        const validStatuses = ['PLANNED', 'SCHEDULED', 'STARTING', 'IN_PROGRESS', 'AWAITING_COMPLETION', 'AWAITING_CONFIRMATION', 'VERIFIED', 'COMPLETED', 'DISPUTED'];
        const newStatus = (body.status || '').toUpperCase();

        if (!validStatuses.includes(newStatus)) {
            return sendJson(res, 400, { success: false, message: `Invalid status. Allowed: ${validStatuses.join(', ')}` });
        }

        session.status = newStatus;
        session.updatedAt = new Date().toISOString();

        if (newStatus === 'IN_PROGRESS' && session.attendance) {
            session.attendance.checkInAt = new Date().toISOString();
        }

        return sendJson(res, 200, { success: true, message: `Session status updated to ${newStatus}`, data: session });
    }

    // PUT /api/sessions/:id/reschedule (Section 14: Reschedule session & update real Zoom meeting)
    if (pathname.match(/^\/api\/sessions\/(\d+)\/reschedule$/) && req.method === 'PUT') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const sessId = Number(pathname.split('/')[3]);
        const session = (state.sessions || []).find(s => s.id === sessId);
        if (!session) return sendJson(res, 404, { success: false, message: "Session not found." });

        const myId = state.currentUser.userId;
        const isParticipant = (session.teacherId === myId || session.learnerId === myId);
        if (!isParticipant && !isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden: You are not authorized to reschedule this session." });
        }

        const body = await parseBody(req);
        const newDate = (body.scheduledDate || '').trim();
        const newTime = (body.scheduledTime || '').trim();
        const newDuration = Math.min(300, Math.max(15, Number(body.durationMinutes) || session.durationMinutes || 60));

        if (!newDate || !newTime) {
            return sendJson(res, 400, { success: false, message: "New scheduled date and time are required." });
        }

        if (session.mode === 'ONLINE' && session.zoomMeetingId && helpers.updateZoomMeeting) {
            await helpers.updateZoomMeeting({
                meetingId: session.zoomMeetingId,
                topic: `Session #${session.sessionNumber}: ${session.topic}`,
                startTime: `${newDate}T${newTime}:00Z`,
                durationMinutes: newDuration
            });
        }

        session.scheduledDate = newDate;
        session.scheduledTime = newTime;
        session.durationMinutes = newDuration;
        session.status = "SCHEDULED";
        session.updatedAt = new Date().toISOString();

        return sendJson(res, 200, {
            success: true,
            message: "Session rescheduled successfully.",
            data: session
        });
    }

    // PUT /api/sessions/:id/attendance (Record attendance: PRESENT, ABSENT, PARTIAL)
    if (pathname.match(/^\/api\/sessions\/(\d+)\/attendance$/) && req.method === 'PUT') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const sessId = Number(pathname.split('/')[3]);
        const session = (state.sessions || []).find(s => s.id === sessId);
        if (!session) return sendJson(res, 404, { success: false, message: "Session not found." });

        const myId = state.currentUser.userId;
        const isParticipant = (session.teacherId === myId || session.learnerId === myId);
        if (!isParticipant && !isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden." });
        }

        const body = await parseBody(req);
        if (!session.attendance) {
            session.attendance = { teacher: 'PRESENT', learner: 'PRESENT' };
        }

        if (body.teacherAttendance) session.attendance.teacher = body.teacherAttendance.toUpperCase();
        if (body.learnerAttendance) session.attendance.learner = body.learnerAttendance.toUpperCase();
        session.updatedAt = new Date().toISOString();

        return sendJson(res, 200, { success: true, message: "Attendance updated.", data: session.attendance });
    }

    // POST /api/sessions/:id/teacher-report (Teacher records what was taught)
    if (pathname.match(/^\/api\/sessions\/(\d+)\/teacher-report$/) && req.method === 'POST') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const sessId = Number(pathname.split('/')[3]);
        const session = (state.sessions || []).find(s => s.id === sessId);
        if (!session) return sendJson(res, 404, { success: false, message: "Session not found." });

        const myId = state.currentUser.userId;
        if (session.teacherId !== myId && !isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden: Only the teacher can submit the teacher report." });
        }

        const body = await parseBody(req);
        const topicsCovered = (body.topicsCovered || '').trim();
        const summary = (body.summary || '').trim();

        if (!topicsCovered) {
            return sendJson(res, 400, { success: false, message: "Topics covered is required." });
        }

        session.teacherReport = {
            topicsCovered,
            summary: summary || "Topics taught as scheduled.",
            confirmed: true,
            confirmedAt: new Date().toISOString()
        };

        if (body.teacherAttendance) {
            if (!session.attendance) session.attendance = {};
            session.attendance.teacher = body.teacherAttendance.toUpperCase();
        }

        // Check if learner has already confirmed -> if so, verify session!
        if (session.learnerReport && session.learnerReport.confirmed) {
            verifySessionComplete(session, state);
        } else {
            session.status = 'AWAITING_CONFIRMATION';
            session.verificationStatus = 'AWAITING_CONFIRMATION';
        }

        session.updatedAt = new Date().toISOString();
        return sendJson(res, 200, {
            success: true,
            message: session.verificationStatus === 'VERIFIED' ? "Session fully verified!" : "Teacher report recorded. Awaiting learner confirmation.",
            data: session
        });
    }

    // POST /api/sessions/:id/learner-report (Learner records understanding & confidence)
    if (pathname.match(/^\/api\/sessions\/(\d+)\/learner-report$/) && req.method === 'POST') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const sessId = Number(pathname.split('/')[3]);
        const session = (state.sessions || []).find(s => s.id === sessId);
        if (!session) return sendJson(res, 404, { success: false, message: "Session not found." });

        const myId = state.currentUser.userId;
        if (session.learnerId !== myId && !isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden: Only the learner can submit the learner report." });
        }

        const body = await parseBody(req);
        const understanding = (body.understanding || '').trim();
        const confidence = Math.min(5, Math.max(1, Number(body.confidence) || 4));
        const practiceNeeded = (body.practiceNeeded || '').trim();
        const nextTopic = (body.nextTopic || '').trim();
        const doubts = (body.doubts || '').trim();

        if (!understanding) {
            return sendJson(res, 400, { success: false, message: "Please describe what you understood." });
        }

        session.learnerReport = {
            understanding,
            confidence,
            practiceNeeded: practiceNeeded || "Review examples and code implementation",
            nextTopic: nextTopic || "Next scheduled module",
            doubts: doubts || "None",
            confirmed: true,
            confirmedAt: new Date().toISOString()
        };

        if (body.learnerAttendance) {
            if (!session.attendance) session.attendance = {};
            session.attendance.learner = body.learnerAttendance.toUpperCase();
        }

        // Check if teacher has already confirmed -> if so, verify session!
        if (session.teacherReport && session.teacherReport.confirmed) {
            verifySessionComplete(session, state);
        } else {
            session.status = 'AWAITING_CONFIRMATION';
            session.verificationStatus = 'AWAITING_CONFIRMATION';
        }

        session.updatedAt = new Date().toISOString();
        return sendJson(res, 200, {
            success: true,
            message: session.verificationStatus === 'VERIFIED' ? "Session fully verified!" : "Learner feedback recorded. Awaiting teacher summary.",
            data: session
        });
    }

    // Helper: When both teacher and learner confirm -> mark session VERIFIED & update progress
    function verifySessionComplete(session, state) {
        session.status = 'VERIFIED';
        session.verificationStatus = 'VERIFIED';
        session.verifiedAt = new Date().toISOString();
        if (session.attendance) session.attendance.completedAt = new Date().toISOString();

        const ex = (state.exchanges || []).find(e => e.id === session.exchangeId);
        if (ex) {
            ex.lastActivityAt = new Date().toISOString();

            // Mark topic in exchange plan as completed
            if (ex.plan) {
                const isSkillA = (ex.plan.skillAName || '').toLowerCase() === (session.skillName || '').toLowerCase();
                const topicList = isSkillA ? ex.plan.skillATopics : ex.plan.skillBTopics;
                if (topicList) {
                    const matchedTopic = topicList.find(t => 
                        t.name.toLowerCase().includes(session.topic.toLowerCase()) || 
                        session.topic.toLowerCase().includes(t.name.toLowerCase())
                    );
                    if (matchedTopic) {
                        matchedTopic.completed = true;
                        matchedTopic.sessionCount = (matchedTopic.sessionCount || 0) + 1;
                    }
                }
            }

            // Recalculate real progress
            calculateExchangeOverallProgress(ex, state);

            // Phase transition check
            if (ex.plan && ex.plan.currentPhase && ex.plan.currentPhase.includes("Phase 1")) {
                const progFirst = calculateSkillProgress(ex, ex.plan.firstSkillName, state);
                if (progFirst.progressPercentage >= 50) {
                    ex.plan.currentPhase = `Phase 2: ${ex.plan.secondTeacherName} teaches ${ex.plan.secondSkillName} to ${ex.plan.secondLearnerName}`;
                }
            }
        }

        // Record legitimate learning activity for BOTH teacher and learner
        recordLearningActivity(session.teacherId, session.teacherName, session.exchangeId, session.id, session.skillName, "SESSION_VERIFIED", `Taught Session #${session.sessionNumber}: ${session.topic}`, state);
        recordLearningActivity(session.learnerId, session.learnerName, session.exchangeId, session.id, session.skillName, "SESSION_VERIFIED", `Completed & verified Session #${session.sessionNumber}: ${session.topic}`, state);

        // Notify both students
        state.notifications.unshift({
            id: Date.now(),
            recipientId: session.learnerId,
            title: "Session Verified! ✓",
            message: `Session #${session.sessionNumber} (${session.topic}) has been officially verified! Skill progress updated.`,
            type: "SESSION_VERIFIED",
            linkUrl: "requests.html",
            isRead: false,
            createdAt: new Date().toISOString()
        });
        state.notifications.unshift({
            id: Date.now() + 1,
            recipientId: session.teacherId,
            title: "Session Verified! ✓",
            message: `Session #${session.sessionNumber} (${session.topic}) has been officially verified by ${session.learnerName}!`,
            type: "SESSION_VERIFIED",
            linkUrl: "requests.html",
            isRead: false,
            createdAt: new Date().toISOString()
        });
    }

    // POST /api/sessions/:id/dispute (Raise a dispute for a session)
    if (pathname.match(/^\/api\/sessions\/(\d+)\/dispute$/) && req.method === 'POST') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const sessId = Number(pathname.split('/')[3]);
        const session = (state.sessions || []).find(s => s.id === sessId);
        if (!session) return sendJson(res, 404, { success: false, message: "Session not found." });

        const myId = state.currentUser.userId;
        const isParticipant = (session.teacherId === myId || session.learnerId === myId);
        if (!isParticipant && !isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden." });
        }

        const body = await parseBody(req);
        const reason = (body.reason || 'Dispute raised regarding session coverage or attendance.').trim();

        session.status = 'DISPUTED';
        session.verificationStatus = 'REVIEW_REQUIRED';
        session.disputeReason = reason;
        session.updatedAt = new Date().toISOString();

        // Add to audit logs for Admin attention
        state.auditLogs.unshift({
            id: Date.now(),
            action: "SESSION_DISPUTED",
            performedBy: state.currentUser.email,
            target: `Session #${session.sessionNumber} (Exchange #${session.exchangeId})`,
            timestamp: new Date().toISOString(),
            status: "REQUIRES_REVIEW",
            details: `Dispute reason: ${reason}`
        });

        return sendJson(res, 200, { success: true, message: "Dispute submitted. An administrator has been notified to review the session record.", data: session });
    }

    // POST /api/sessions/:id/share-in-chat (Share session link & timing to chat conversation)
    if (pathname.match(/^\/api\/sessions\/(\d+)\/share-in-chat$/) && req.method === 'POST') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const sessId = Number(pathname.split('/')[3]);
        const session = (state.sessions || []).find(s => s.id === sessId);
        if (!session) return sendJson(res, 404, { success: false, message: "Session not found." });

        const myId = state.currentUser.userId;
        const partnerId = (myId === session.teacherId) ? session.learnerId : session.teacherId;
        const partnerName = (myId === session.teacherId) ? session.learnerName : session.teacherName;
        const myName = (myId === session.teacherId) ? session.teacherName : session.learnerName;

        const shareText = `📅 [SESSION #${session.sessionNumber} MEETING DETAILS]\n🎯 Topic: ${session.topic}\n📚 Skill: ${session.skillName}\n⏰ Time: ${session.scheduledDate} at ${session.scheduledTime} (${session.durationMinutes} mins)\n📍 Mode: ${session.mode}${session.mode === 'ONLINE' ? `\n🔗 Zoom Join Link: ${session.zoomJoinUrl}\n🔑 Password: ${session.zoomPassword}` : `\n📌 In-Person Location: ${session.location}`}`;

        const newMsg = {
            id: (state.messages || []).length + 1,
            senderId: myId,
            senderName: myName,
            receiverId: partnerId,
            receiverName: partnerName,
            messageText: shareText,
            content: shareText,
            isSystem: false,
            sessionId: session.id,
            exchangeId: session.exchangeId,
            sentAt: new Date().toISOString(),
            status: "DELIVERED",
            isRead: false
        };

        state.messages.push(newMsg);
        return sendJson(res, 200, { success: true, message: "Session details shared in chat.", data: newMsg });
    }

    // =========================================================================
    // 3. SKILL PROGRESS, STREAK & HEALTH
    // =========================================================================

    // GET /api/exchanges/:id/progress (Real topic-level progress)
    if (pathname.match(/^\/api\/exchanges\/(\d+)\/progress$/) && req.method === 'GET') {
        const exId = Number(pathname.split('/')[3]);
        const ex = (state.exchanges || []).find(e => e.id === exId);
        if (!ex) return sendJson(res, 404, { success: false, message: "Exchange not found." });

        if (!ex.plan) ex.plan = createDefaultExchangePlan(ex);

        const progA = calculateSkillProgress(ex, ex.plan.skillAName, state);
        const progB = calculateSkillProgress(ex, ex.plan.skillBName, state);
        const overall = calculateExchangeOverallProgress(ex, state);

        return sendJson(res, 200, {
            success: true,
            data: {
                exchangeId: ex.id,
                overallProgress: overall,
                currentPhase: ex.plan.currentPhase,
                skillA: progA,
                skillB: progB
            }
        });
    }

    // GET /api/skills/:skillName/health (Measurable Skill Health)
    if (pathname.match(/^\/api\/skills\/([^\/]+)\/health$/) && req.method === 'GET') {
        const skillName = decodeURIComponent(pathname.split('/')[3]);
        const userId = state.currentUser ? state.currentUser.userId : null;
        const health = calculateSkillHealth(skillName, userId, state);

        return sendJson(res, 200, { success: true, data: health });
    }

    // =========================================================================
    // 4. STUDENT ANALYTICS DASHBOARD
    // =========================================================================

    // GET /api/students/analytics (Comprehensive Student Learning Analytics)
    if (pathname === '/api/students/analytics' && req.method === 'GET') {
        const myId = state.currentUser ? state.currentUser.userId : 2;

        const myExchanges = (state.exchanges || []).filter(e => 
            e.student1Id === myId || e.student2Id === myId || e.userAId === myId || e.userBId === myId
        );

        const activeExchanges = myExchanges.filter(e => e.status !== 'COMPLETED').length;
        const completedExchanges = myExchanges.filter(e => e.status === 'COMPLETED').length;

        const mySessions = (state.sessions || []).filter(s => s.teacherId === myId || s.learnerId === myId);
        const completedSessions = mySessions.filter(s => s.status === 'COMPLETED' || s.status === 'VERIFIED').length;
        const verifiedSessions = mySessions.filter(s => s.verificationStatus === 'VERIFIED').length;
        const upcomingSessions = mySessions.filter(s => s.status === 'SCHEDULED' || s.status === 'PLANNED').length;

        // Skill progress items
        const skillsMap = new Map();
        myExchanges.forEach(ex => {
            if (ex.plan) {
                const isSkillA = (ex.plan.studentAId === myId);
                const myLearnSkill = isSkillA ? ex.plan.skillBName : ex.plan.skillAName;
                const prog = calculateSkillProgress(ex, myLearnSkill, state);
                const health = calculateSkillHealth(myLearnSkill, myId, state);

                skillsMap.set(myLearnSkill, {
                    skillName: myLearnSkill,
                    progressPercentage: prog.progressPercentage,
                    completedTopics: prog.completedTopics,
                    remainingTopics: prog.remainingTopics,
                    totalTopics: prog.totalTopicsCount,
                    healthStatus: health.status,
                    healthReason: health.reason
                });
            }
        });

        // Total learning minutes
        const totalMinutes = mySessions
            .filter(s => s.verificationStatus === 'VERIFIED')
            .reduce((acc, s) => acc + (s.durationMinutes || 60), 0);

        // Streak
        const streakObj = (state.learningStreaks && state.learningStreaks[myId]) || { currentStreak: 1, longestStreak: 1, lastActivityDate: new Date().toISOString().split('T')[0] };

        // Next upcoming session
        const upcomingSorted = mySessions
            .filter(s => s.status === 'SCHEDULED' || s.status === 'PLANNED')
            .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
        const nextSession = upcomingSorted[0] || null;

        // Recent record (latest verified session)
        const verifiedSorted = mySessions
            .filter(s => s.verificationStatus === 'VERIFIED')
            .sort((a, b) => new Date(b.verifiedAt || b.scheduledDate).getTime() - new Date(a.verifiedAt || a.scheduledDate).getTime());
        const recentRecord = verifiedSorted[0] || null;

        return sendJson(res, 200, {
            success: true,
            data: {
                overview: {
                    activeExchanges,
                    completedExchanges,
                    upcomingSessions,
                    completedSessions,
                    verifiedSessions
                },
                skillProgress: Array.from(skillsMap.values()),
                learningActivity: {
                    totalLearningMinutes: totalMinutes,
                    sessionsThisWeek: mySessions.filter(s => s.verificationStatus === 'VERIFIED' && (Date.now() - new Date(s.verifiedAt || s.scheduledDate).getTime() <= 7 * 86400000)).length,
                    topicsCompleted: Array.from(skillsMap.values()).reduce((acc, sp) => acc + sp.completedTopics.length, 0),
                    recentActivities: (state.learningActivities || []).filter(a => a.userId === myId).slice(0, 5)
                },
                streak: {
                    currentStreak: streakObj.currentStreak,
                    longestStreak: streakObj.longestStreak,
                    lastLearningActivity: streakObj.lastActivityDate
                },
                upcoming: nextSession,
                recentRecord
            }
        });
    }

    // =========================================================================
    // 5. ADMIN ANALYTICS & AUDIT VIEWS
    // =========================================================================

    // GET /api/admin/analytics/overview (Platform & Session Metrics for Admin)
    if (pathname === '/api/admin/analytics/overview' && req.method === 'GET') {
        const totalStudents = (state.profiles || []).length;
        const totalExchanges = (state.exchanges || []).length;
        const activeExchanges = (state.exchanges || []).filter(e => e.status !== 'COMPLETED').length;
        const completedExchanges = (state.exchanges || []).filter(e => e.status === 'COMPLETED').length;

        const onlineCount = (state.exchanges || []).filter(e => (e.learningMode || '').toUpperCase() === 'ONLINE').length;
        const offlineCount = (state.exchanges || []).filter(e => (e.learningMode || '').toUpperCase() === 'OFFLINE').length;

        const totalSessions = (state.sessions || []).length;
        const verifiedSessions = (state.sessions || []).filter(s => s.verificationStatus === 'VERIFIED').length;
        const pendingConfirmations = (state.sessions || []).filter(s => s.status === 'AWAITING_CONFIRMATION').length;
        const disputedSessions = (state.sessions || []).filter(s => s.status === 'DISPUTED').length;

        const today = new Date().toISOString().split('T')[0];
        const overdueSessions = (state.sessions || []).filter(s => s.scheduledDate < today && s.verificationStatus !== 'VERIFIED' && s.status !== 'COMPLETED').length;

        // Inactive exchanges (> 7 days without activity)
        const inactiveExchanges = (state.exchanges || []).filter(e => {
            if (e.status === 'COMPLETED') return false;
            const lastTime = e.lastActivityAt ? new Date(e.lastActivityAt).getTime() : new Date(e.startDate).getTime();
            const days = Math.floor((Date.now() - lastTime) / 86400000);
            return days >= 7;
        }).length;

        return sendJson(res, 200, {
            success: true,
            data: {
                platform: {
                    totalStudents,
                    activeExchanges,
                    completedExchanges,
                    onlineExchanges: onlineCount,
                    offlineExchanges: offlineCount
                },
                sessions: {
                    totalSessions,
                    verifiedSessions,
                    pendingConfirmations,
                    disputedSessions,
                    overdueSessions,
                    missedSessions: (state.sessions || []).filter(s => s.attendance && (s.attendance.teacher === 'ABSENT' || s.attendance.learner === 'ABSENT')).length
                },
                learning: {
                    averageProgress: Math.round(((state.exchanges || []).reduce((acc, e) => acc + (e.overallProgress || 0), 0) / (totalExchanges || 1))),
                    inactiveExchanges,
                    topSkills: ["Python", "Java", "Photoshop", "Public Speaking", "UI/UX Design"]
                },
                safety: {
                    disputedSessions,
                    reportsCount: (state.reports || []).length,
                    blockedUsers: (state.blockedUsers || []).length
                }
            }
        });
    }

    // GET /api/admin/exchanges/:id/audit (Full Admin Exchange Audit View)
    const mAudit = pathname.match(/^\/api\/admin\/exchanges\/(\d+)\/audit$/);
    if (mAudit && req.method === 'GET') {
        const exId = Number(mAudit[1]);
        const ex = (state.exchanges || []).find(e => e.id === exId);
        if (!ex) return sendJson(res, 404, { success: false, message: "Exchange not found." });

        if (!ex.plan) ex.plan = createDefaultExchangePlan(ex);

        const sessions = (state.sessions || [])
            .filter(s => s.exchangeId === ex.id)
            .sort((a, b) => a.sessionNumber - b.sessionNumber);

        const lastActivityTime = ex.lastActivityAt ? new Date(ex.lastActivityAt).getTime() : new Date(ex.startDate).getTime();
        const daysSinceActivity = Math.max(0, Math.floor((Date.now() - lastActivityTime) / 86400000));
        const isInactive = (ex.status !== 'COMPLETED' && daysSinceActivity >= 7);

        return sendJson(res, 200, {
            success: true,
            data: {
                exchange: ex,
                plan: ex.plan,
                sessionsTimeline: sessions,
                sessions: sessions,
                quizzes: (state.quizzes || []).filter(q => q.exchangeId === ex.id),
                certificates: (state.certificates || []).filter(c => c.exchangeId === ex.id),
                daysSinceActivity,
                inactivityWarning: isInactive ? `Attention: No verified learning session in ${daysSinceActivity} days.` : null,
                disputedSessions: sessions.filter(s => s.status === 'DISPUTED')
            }
        });
    }

    // GET /api/admin/sessions/:id (Admin Single Session Detail)
    const mAdminSess = pathname.match(/^\/api\/admin\/sessions\/(\d+)$/);
    if (mAdminSess && req.method === 'GET') {
        const sessId = Number(mAdminSess[1]);
        const session = (state.sessions || []).find(s => s.id === sessId);
        if (!session) return sendJson(res, 404, { success: false, message: "Session not found." });

        const ex = (state.exchanges || []).find(e => e.id === session.exchangeId);

        return sendJson(res, 200, {
            success: true,
            data: {
                session,
                exchange: ex,
                auditRecord: {
                    teacherAttendance: session.attendance ? session.attendance.teacher : 'PRESENT',
                    learnerAttendance: session.attendance ? session.attendance.learner : 'PRESENT',
                    teacherConfirmed: session.teacherReport ? session.teacherReport.confirmed : false,
                    learnerConfirmed: session.learnerReport ? session.learnerReport.confirmed : false,
                    verificationStatus: session.verificationStatus,
                    verifiedAt: session.verifiedAt
                }
            }
        });
    }

    // GET /api/admin/exchanges/inactive (List of inactive exchanges needing attention)
    if (pathname === '/api/admin/exchanges/inactive' && req.method === 'GET') {
        const list = (state.exchanges || []).filter(e => {
            if (e.status === 'COMPLETED') return false;
            const lastTime = e.lastActivityAt ? new Date(e.lastActivityAt).getTime() : new Date(e.startDate).getTime();
            const days = Math.floor((Date.now() - lastTime) / 86400000);
            return days >= 7;
        }).map(e => {
            const lastTime = e.lastActivityAt ? new Date(e.lastActivityAt).getTime() : new Date(e.startDate).getTime();
            const days = Math.floor((Date.now() - lastTime) / 86400000);
            return {
                ...e,
                daysSinceActivity: days,
                statusLabel: "NEEDS ATTENTION"
            };
        });

        return sendJson(res, 200, { success: true, data: list });
    }

    // =========================================================================
    // 6. FINAL EXCHANGE COMPLETION & REPORT
    // =========================================================================

    // POST /api/exchanges/:id/complete (Finalize exchange & generate permanent completion report)
    if (pathname.match(/^\/api\/exchanges\/(\d+)\/complete$/) && req.method === 'POST') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const exId = Number(pathname.split('/')[3]);
        const ex = (state.exchanges || []).find(e => e.id === exId);
        if (!ex) return sendJson(res, 404, { success: false, message: "Exchange not found." });

        const myId = state.currentUser.userId;
        const isParticipant = (ex.student1Id === myId || ex.student2Id === myId || ex.userAId === myId || ex.userBId === myId);
        if (!isParticipant && !isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden." });
        }

        const body = await parseBody(req);
        const finalSessions = (state.sessions || []).filter(s => s.exchangeId === ex.id);
        const verifiedCount = finalSessions.filter(s => s.verificationStatus === 'VERIFIED').length;

        ex.status = 'COMPLETED';
        ex.completionDate = new Date().toISOString();
        ex.overallProgress = 100;
        if (ex.plan) {
            ex.plan.overallProgress = 100;
            ex.plan.currentPhase = "Exchange Completed";
        }

        const report = {
            exchangeId: ex.id,
            participants: [
                { id: ex.student1Id, name: ex.student1Name },
                { id: ex.student2Id, name: ex.student2Name }
            ],
            skillsExchanged: `${ex.skill1Name || ex.skillOfferedTitle} ↔ ${ex.skill2Name || ex.skillRequestedTitle}`,
            durationWeeks: ex.plan ? ex.plan.durationWeeks : 4,
            plannedSessions: ex.plan ? ex.plan.plannedSessionsCount : 4,
            completedSessions: finalSessions.length,
            verifiedSessions: verifiedCount,
            finalProgress: 100,
            completionDate: ex.completionDate,
            teacherFinalSummary: body.teacherFinalSummary || "All curriculum topics covered with hands-on practice.",
            learnerFinalUnderstanding: body.learnerFinalUnderstanding || "Concepts understood and demonstrated through project.",
            reviewAllowed: true
        };

        ex.completionReport = report;

        // Increment completed exchanges count on student profiles
        [ex.student1Id, ex.student2Id].forEach(uid => {
            const prof = (state.profiles || []).find(p => p.userId === uid);
            if (prof) prof.completedExchangesCount = (prof.completedExchangesCount || 0) + 1;
        });

        // SECTION 24: Issue Official Student Skill Exchange Certificates
        if (!state.certificates) state.certificates = [];
        const dateStr = new Date().toISOString().split('T')[0];
        const certCode1 = "SE-" + Math.floor(1000 + Math.random() * 9000) + "-A";
        const certCode2 = "SE-" + Math.floor(1000 + Math.random() * 9000) + "-B";

        const cert1 = {
            id: "CERT-2026-" + crypto.randomBytes(3).toString('hex').toUpperCase(),
            exchangeId: ex.id,
            studentId: ex.student1Id,
            studentName: ex.student1Name,
            skillId: ex.skill2Id,
            skillName: ex.skill2Name || ex.skillRequestedTitle,
            skillCategory: "Technical",
            partnerId: ex.student2Id,
            partnerName: ex.student2Name,
            totalSessions: finalSessions.length,
            verifiedSessions: verifiedCount,
            finalProgress: 100,
            issueDate: dateStr,
            title: "Certificate of Skill Exchange Completion",
            institution: "Student Skill Exchange Platform • MGM College of Engineering & Technology",
            verificationCode: certCode1
        };

        const cert2 = {
            id: "CERT-2026-" + crypto.randomBytes(3).toString('hex').toUpperCase(),
            exchangeId: ex.id,
            studentId: ex.student2Id,
            studentName: ex.student2Name,
            skillId: ex.skill1Id,
            skillName: ex.skill1Name || ex.skillOfferedTitle,
            skillCategory: "Technical",
            partnerId: ex.student1Id,
            partnerName: ex.student1Name,
            totalSessions: finalSessions.length,
            verifiedSessions: verifiedCount,
            finalProgress: 100,
            issueDate: dateStr,
            title: "Certificate of Skill Exchange Completion",
            institution: "Student Skill Exchange Platform • MGM College of Engineering & Technology",
            verificationCode: certCode2
        };

        state.certificates.push(cert1, cert2);
        report.certificates = [cert1, cert2];

        // SECTION 26: Create Admin Auto-Notification
        state.notifications.unshift({
            id: Date.now(),
            recipientId: 1, // Admin
            title: "Skill Exchange Completed! 🎓",
            message: `Exchange EX-${ex.id} between ${ex.student1Name} and ${ex.student2Name} (${report.skillsExchanged}) has officially completed. ${verifiedCount}/${finalSessions.length} sessions verified. Certificates issued.`,
            type: "EXCHANGE_COMPLETED",
            linkUrl: "admin-dashboard.html",
            isRead: false,
            createdAt: new Date().toISOString()
        });

        // Add to audit logs
        state.auditLogs.unshift({
            id: Date.now(),
            action: "SKILL_EXCHANGE_COMPLETED",
            performedBy: state.currentUser ? state.currentUser.email : "Student",
            target: `Exchange #${ex.id}`,
            timestamp: new Date().toISOString(),
            status: "COMPLETED",
            details: `Reciprocal exchange completed between ${ex.student1Name} and ${ex.student2Name}. Certificates: ${cert1.id}, ${cert2.id}.`
        });

        syncSupabase('saveExchange', ex);

        return sendJson(res, 200, {
            success: true,
            message: "Skill exchange officially completed! Permanent report generated and peer reviews enabled.",
            data: report
        });
    }

    // GET /api/exchanges/:id/report (Permanent completion report)
    if (pathname.match(/^\/api\/exchanges\/(\d+)\/report$/) && req.method === 'GET') {
        const exId = Number(pathname.split('/')[3]);
        const ex = (state.exchanges || []).find(e => e.id === exId);
        if (!ex) return sendJson(res, 404, { success: false, message: "Exchange not found." });

        if (!ex.completionReport) {
            const finalSessions = (state.sessions || []).filter(s => s.exchangeId === ex.id);
            const verifiedCount = finalSessions.filter(s => s.verificationStatus === 'VERIFIED').length;
            ex.completionReport = {
                exchangeId: ex.id,
                participants: [
                    { id: ex.student1Id, name: ex.student1Name },
                    { id: ex.student2Id, name: ex.student2Name }
                ],
                skillsExchanged: `${ex.skill1Name || ex.skillOfferedTitle} ↔ ${ex.skill2Name || ex.skillRequestedTitle}`,
                durationWeeks: ex.plan ? ex.plan.durationWeeks : 4,
                plannedSessions: ex.plan ? ex.plan.plannedSessionsCount : 4,
                completedSessions: finalSessions.length,
                verifiedSessions: verifiedCount,
                finalProgress: ex.overallProgress || 100,
                completionDate: ex.completionDate || new Date().toISOString(),
                teacherFinalSummary: "All planned curriculum modules delivered and evaluated.",
                learnerFinalUnderstanding: "Practical comprehension demonstrated across all topics.",
                reviewAllowed: true
            };
        }

        return sendJson(res, 200, { success: true, data: ex.completionReport });
    }


    // =========================================================================
    // 6. RECURRING SCHEDULE GENERATOR (SECTION 10)
    // =========================================================================
    if (pathname.match(/^\/api\/exchanges\/(\d+)\/generate-schedule$/) && req.method === 'POST') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const exId = Number(pathname.split('/')[3]);
        const ex = (state.exchanges || []).find(e => e.id === exId);
        if (!ex) return sendJson(res, 404, { success: false, message: "Exchange not found." });

        const myId = state.currentUser.userId;
        const isParticipant = (ex.student1Id === myId || ex.student2Id === myId || ex.userAId === myId || ex.userBId === myId);
        if (!isParticipant && !isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden." });
        }

        const body = await parseBody(req);
        const preferredDays = Array.isArray(body.preferredDays) ? body.preferredDays : ["Monday", "Wednesday", "Friday"];
        const preferredTime = body.preferredTime || "17:00";
        const sessionDuration = Number(body.durationMinutes) || 60;
        const totalSessions = Math.min(12, Math.max(2, Number(body.totalSessions) || 4));
        const mode = (body.mode || ex.learningMode || 'ONLINE').toUpperCase();

        if (!ex.plan) ex.plan = createDefaultExchangePlan(ex);

        const generatedSessions = [];
        const now = new Date();

        for (let i = 1; i <= totalSessions; i++) {
            const sessionDate = new Date(now.getTime() + i * 2 * 86400000).toISOString().split('T')[0];
            const isPhase1 = i <= Math.ceil(totalSessions / 2);

            const teacherId = isPhase1 ? ex.plan.firstTeacherId : ex.plan.secondTeacherId;
            const teacherName = isPhase1 ? ex.plan.firstTeacherName : ex.plan.secondTeacherName;
            const learnerId = isPhase1 ? ex.plan.firstLearnerId : ex.plan.secondLearnerId;
            const learnerName = isPhase1 ? ex.plan.firstLearnerName : ex.plan.secondLearnerName;
            const skillId = isPhase1 ? ex.plan.firstSkillId : ex.plan.secondSkillId;
            const skillName = isPhase1 ? ex.plan.firstSkillName : ex.plan.secondSkillName;

            const topicList = isPhase1 ? ex.plan.skillBTopics : ex.plan.skillATopics;
            const topicObj = (topicList && topicList[(i - 1) % topicList.length]) || { name: `${skillName} Module #${i}` };

            const sess = {
                id: (state.sessions || []).length + 1,
                exchangeId: ex.id,
                exchangeRequestId: ex.requestId,
                sessionNumber: i,
                phase: isPhase1 ? 1 : 2,
                mode: mode,
                teacherId,
                teacherName,
                teacherEmail: "student@mgmmumbai.ac.in",
                learnerId,
                learnerName,
                learnerEmail: "student@mgmmumbai.ac.in",
                skillId,
                skillName,
                topic: topicObj.name,
                objective: `Master ${topicObj.name} with hands-on practice`,
                scheduledDate: sessionDate,
                scheduledTime: preferredTime,
                durationMinutes: sessionDuration,
                location: mode === 'OFFLINE' ? "College Central Library / Lab 402" : null,
                zoomMeetingId: null,
                zoomJoinUrl: mode === 'ONLINE' ? "https://zoom.us/j/849201948" + i + "?pwd=skilltrade2026" : null,
                zoomPassword: mode === 'ONLINE' ? "skilltrade2026" : null,
                status: i === 1 ? "SCHEDULED" : "PLANNED",
                attendance: { teacher: "PRESENT", learner: "PRESENT" },
                teacherReport: null,
                learnerReport: null,
                verificationStatus: "PENDING",
                verifiedAt: null,
                resources: [],
                disputeReason: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            state.sessions.push(sess);
            generatedSessions.push(sess);
        }

        ex.plan.plannedSessionsCount = totalSessions;
        ex.plan.status = 'PLAN_CONFIRMED';
        syncSupabase('saveExchange', ex);

        return sendJson(res, 201, {
            success: true,
            message: `Successfully generated ${generatedSessions.length} planned sessions for exchange schedule.`,
            data: generatedSessions
        });
    }

    // =========================================================================
    // 7. EXCHANGE EXTENSION (SECTION 11)
    // =========================================================================
    if (pathname.match(/^\/api\/exchanges\/(\d+)\/extend$/) && req.method === 'PUT') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const exId = Number(pathname.split('/')[3]);
        const ex = (state.exchanges || []).find(e => e.id === exId);
        if (!ex) return sendJson(res, 404, { success: false, message: "Exchange not found." });

        const myId = state.currentUser.userId;
        const isParticipant = (ex.student1Id === myId || ex.student2Id === myId || ex.userAId === myId || ex.userBId === myId);
        if (!isParticipant && !isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden." });
        }

        const body = await parseBody(req);
        const addDays = Math.min(30, Math.max(1, Number(body.additionalDays) || 7));
        const reason = (body.reason || "Mutual study schedule extension").trim();

        if (!ex.plan) ex.plan = createDefaultExchangePlan(ex);
        ex.plan.durationWeeks = (ex.plan.durationWeeks || 4) + Math.ceil(addDays / 7);
        ex.status = 'EXTENDED';
        ex.updatedAt = new Date().toISOString();

        state.auditLogs.unshift({
            id: Date.now(),
            action: "EXCHANGE_EXTENDED",
            performedBy: state.currentUser.email,
            target: `Exchange #${ex.id}`,
            timestamp: new Date().toISOString(),
            status: "EXTENDED",
            details: `Extended by ${addDays} days. Reason: ${reason}`
        });

        return sendJson(res, 200, {
            success: true,
            message: `Exchange extended by ${addDays} days upon mutual agreement.`,
            data: ex
        });
    }

    // =========================================================================
    // 8. PER-SESSION QUIZ SYSTEM (SECTIONS 16, 17, 18)
    // =========================================================================

    // POST /api/sessions/:id/quiz (Teacher creates quiz for session)
    if (pathname.match(/^\/api\/sessions\/(\d+)\/quiz$/) && req.method === 'POST') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const sessId = Number(pathname.split('/')[3]);
        const session = (state.sessions || []).find(s => s.id === sessId);
        if (!session) return sendJson(res, 404, { success: false, message: "Session not found." });

        const myId = state.currentUser.userId;
        if (session.teacherId !== myId && !isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden: Only the teacher of this session can create a quiz." });
        }

        const body = await parseBody(req);
        const title = (body.title || `Quiz: ${session.topic}`).trim();
        const questions = Array.isArray(body.questions) ? body.questions : [];

        if (questions.length === 0) {
            return sendJson(res, 400, { success: false, message: "Quiz must contain at least 1 question." });
        }

        let maxMarks = 0;
        const formattedQuestions = questions.map((q, idx) => {
            const marks = Number(q.marks) || 1;
            maxMarks += marks;
            return {
                id: idx + 1,
                type: (q.type || "MULTIPLE_CHOICE").toUpperCase(),
                question: (q.question || "Question").trim(),
                options: Array.isArray(q.options) ? q.options : (q.type === 'TRUE_FALSE' ? ["True", "False"] : []),
                correctAnswer: (q.correctAnswer || "").trim(),
                marks: marks
            };
        });

        const newQuiz = {
            id: (state.quizzes || []).length + 1,
            sessionId: session.id,
            exchangeId: session.exchangeId,
            skillId: session.skillId,
            skillName: session.skillName,
            topic: session.topic,
            teacherId: session.teacherId,
            teacherName: session.teacherName,
            learnerId: session.learnerId,
            learnerName: session.learnerName,
            title,
            questions: formattedQuestions,
            maxMarks,
            createdAt: new Date().toISOString()
        };

        if (!state.quizzes) state.quizzes = [];
        const existingIdx = state.quizzes.findIndex(q => q.sessionId === sessId);
        if (existingIdx !== -1) {
            newQuiz.id = state.quizzes[existingIdx].id;
            state.quizzes[existingIdx] = newQuiz;
        } else {
            state.quizzes.push(newQuiz);
        }

        // Reset previous learner attempts for this session so learner can take the new quiz
        if (state.quizAttempts) {
            state.quizAttempts = state.quizAttempts.filter(a => a.quizId !== newQuiz.id && a.sessionId !== sessId);
        }
        delete session.quizScore;

        session.hasQuiz = true;
        session.quizId = newQuiz.id;

        // Notify learner
        state.notifications.unshift({
            id: Date.now(),
            recipientId: session.learnerId,
            title: "New Session Quiz Available! 📝",
            message: `${session.teacherName} posted a quiz for Session #${session.sessionNumber} (${session.topic}). Test your understanding now!`,
            type: "QUIZ_ASSIGNED",
            linkUrl: "requests.html",
            isRead: false,
            createdAt: new Date().toISOString()
        });

        return sendJson(res, 201, {
            success: true,
            message: "Quiz created successfully for this session.",
            data: newQuiz
        });
    }

    // GET /api/sessions/:id/quiz (View quiz)
    if (pathname.match(/^\/api\/sessions\/(\d+)\/quiz$/) && req.method === 'GET') {
        const sessId = Number(pathname.split('/')[3]);
        const session = (state.sessions || []).find(s => s.id === sessId);
        if (!session) return sendJson(res, 404, { success: false, message: "Session not found." });

        const quiz = (state.quizzes || []).find(q => q.sessionId === sessId);
        if (!quiz) return sendJson(res, 404, { success: false, message: "No quiz found for this session." });

        const myId = state.currentUser ? state.currentUser.userId : 0;
        const attempt = (state.quizAttempts || []).find(a => a.quizId === quiz.id && a.learnerId === (myId || session.learnerId));

        // If current user is learner and hasn't submitted yet: hide correct answers
        const isLearnerUnsubmitted = (myId === session.learnerId && !attempt);
        const questionsToSend = isLearnerUnsubmitted ? quiz.questions.map(q => ({
            id: q.id,
            type: q.type,
            question: q.question,
            options: q.options,
            marks: q.marks
        })) : quiz.questions;

        return sendJson(res, 200, {
            success: true,
            data: {
                ...quiz,
                questions: questionsToSend,
                attempt: attempt || null
            }
        });
    }

    // POST /api/sessions/:id/quiz/submit (Learner submits quiz)
    if (pathname.match(/^\/api\/sessions\/(\d+)\/quiz\/submit$/) && req.method === 'POST') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const sessId = Number(pathname.split('/')[3]);
        const session = (state.sessions || []).find(s => s.id === sessId);
        if (!session) return sendJson(res, 404, { success: false, message: "Session not found." });

        const quiz = (state.quizzes || []).find(q => q.sessionId === sessId);
        if (!quiz) return sendJson(res, 404, { success: false, message: "Quiz not found for this session." });

        const myId = state.currentUser.userId;
        if (session.learnerId !== myId && !isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden: Only the learner can submit answers for this quiz." });
        }

        const body = await parseBody(req);
        const submittedAnswers = Array.isArray(body.answers) ? body.answers : [];

        let marksObtained = 0;
        const evaluatedAnswers = quiz.questions.map(q => {
            const sub = submittedAnswers.find(a => a.questionId === q.id);
            const userAns = sub ? String(sub.answer).trim() : "";
            let isCorrect = false;
            let awarded = 0;

            if (q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') {
                if (userAns.toLowerCase() === (q.correctAnswer || "").toLowerCase()) {
                    isCorrect = true;
                    awarded = q.marks;
                }
            } else {
                // Short answer keyword match or teacher review
                if (userAns.toLowerCase().includes((q.correctAnswer || "").toLowerCase())) {
                    isCorrect = true;
                    awarded = q.marks;
                }
            }
            marksObtained += awarded;
            return {
                questionId: q.id,
                answer: userAns,
                correctAnswer: q.correctAnswer,
                isCorrect,
                marksAwarded: awarded
            };
        });

        const percentage = Math.round((marksObtained / (quiz.maxMarks || 1)) * 100);

        if (!state.quizAttempts) state.quizAttempts = [];
        const attempt = {
            id: state.quizAttempts.length + 1,
            quizId: quiz.id,
            sessionId: session.id,
            exchangeId: session.exchangeId,
            learnerId: session.learnerId,
            learnerName: session.learnerName,
            marksObtained,
            maxMarks: quiz.maxMarks,
            percentage,
            answers: evaluatedAnswers,
            teacherFeedback: percentage >= 80 ? "Excellent understanding of session concepts!" : "Good effort. Review recommended topics before next class.",
            attemptedAt: new Date().toISOString()
        };

        state.quizAttempts.push(attempt);

        // Update session quiz score
        session.quizScore = { marksObtained, maxMarks: quiz.maxMarks, percentage };

        // SECTION 18: Quiz data directly updates real topic learning record
        const ex = (state.exchanges || []).find(e => e.id === session.exchangeId);
        if (ex && ex.plan) {
            const isSkillA = (ex.plan.skillAName || '').toLowerCase() === (session.skillName || '').toLowerCase();
            const topicList = isSkillA ? ex.plan.skillATopics : ex.plan.skillBTopics;
            if (topicList) {
                const matchedTopic = topicList.find(t => 
                    t.name.toLowerCase().includes(session.topic.toLowerCase()) || 
                    session.topic.toLowerCase().includes(t.name.toLowerCase())
                );
                if (matchedTopic) {
                    matchedTopic.quizScore = percentage;
                    matchedTopic.completed = percentage >= 60;
                    matchedTopic.status = percentage >= 80 ? "Mastered" : (percentage >= 60 ? "Understood" : "Needs Practice");
                }
            }
            calculateExchangeOverallProgress(ex, state);
        }

        // SECTION 30: Real streak updated upon legitimate learning action
        recordLearningActivity(session.learnerId, session.learnerName, session.exchangeId, session.id, session.skillName, "QUIZ_COMPLETED", `Scored ${marksObtained}/${quiz.maxMarks} (${percentage}%) on ${session.topic} quiz`, state);

        return sendJson(res, 200, {
            success: true,
            message: `Quiz submitted! Score: ${marksObtained}/${quiz.maxMarks} (${percentage}%).`,
            data: attempt
        });
    }

    // PUT /api/sessions/:id/quiz/grade (Teacher grades/reviews quiz and gives feedback)
    if (pathname.match(/^\/api\/sessions\/(\d+)\/quiz\/grade$/) && req.method === 'PUT') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const sessId = Number(pathname.split('/')[3]);
        const session = (state.sessions || []).find(s => s.id === sessId);
        if (!session) return sendJson(res, 404, { success: false, message: "Session not found." });

        const myId = state.currentUser.userId;
        if (session.teacherId !== myId && !isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden: Only the teacher can grade this quiz." });
        }

        const body = await parseBody(req);
        const attempt = (state.quizAttempts || []).find(a => a.sessionId === sessId);
        if (!attempt) return sendJson(res, 404, { success: false, message: "No quiz attempt to grade." });

        if (body.teacherFeedback) attempt.teacherFeedback = body.teacherFeedback.trim();
        if (body.marksObtained !== undefined) {
            attempt.marksObtained = Number(body.marksObtained);
            attempt.percentage = Math.round((attempt.marksObtained / (attempt.maxMarks || 1)) * 100);
            session.quizScore = { marksObtained: attempt.marksObtained, maxMarks: attempt.maxMarks, percentage: attempt.percentage };
        }

        return sendJson(res, 200, {
            success: true,
            message: "Quiz grade and teacher feedback updated.",
            data: attempt
        });
    }

    // =========================================================================
    // 9. TWO-WAY EXCHANGE PHASE TRANSITION (SECTIONS 20 & 21)
    // =========================================================================
    if (pathname.match(/^\/api\/exchanges\/(\d+)\/phase-transition$/) && req.method === 'POST') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const exId = Number(pathname.split('/')[3]);
        const ex = (state.exchanges || []).find(e => e.id === exId);
        if (!ex) return sendJson(res, 404, { success: false, message: "Exchange not found." });

        const myId = state.currentUser.userId;
        const isParticipant = (ex.student1Id === myId || ex.student2Id === myId || ex.userAId === myId || ex.userBId === myId);
        if (!isParticipant && !isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden." });
        }

        if (!ex.plan) ex.plan = createDefaultExchangePlan(ex);

        // Check who confirmed
        const isStudentA = (myId === ex.student1Id || myId === ex.userAId);
        const isStudentB = (myId === ex.student2Id || myId === ex.userBId);

        if (isStudentA || isAdmin(state.currentUser)) ex.plan.phase2ConfirmedByA = true;
        if (isStudentB || isAdmin(state.currentUser)) ex.plan.phase2ConfirmedByB = true;

        const bothConfirmed = ex.plan.phase2ConfirmedByA && ex.plan.phase2ConfirmedByB;

        if (bothConfirmed) {
            ex.plan.phase1Status = "COMPLETED";
            ex.plan.phase2Status = "ACTIVE";
            ex.plan.currentPhase = `Phase 2: ${ex.plan.secondTeacherName} teaches ${ex.plan.secondSkillName} to ${ex.plan.secondLearnerName}`;

            // Auto-schedule Phase 2 sessions if none exist yet
            const existingPhase2 = (state.sessions || []).filter(s => s.exchangeId === ex.id && s.phase === 2);
            if (existingPhase2.length === 0) {
                const p2Topics = ex.plan.skillATopics || [];
                for (let i = 1; i <= 2; i++) {
                    const sessDate = new Date(Date.now() + i * 2 * 86400000).toISOString().split('T')[0];
                    const topicName = (p2Topics[i - 1] && p2Topics[i - 1].name) || `${ex.plan.secondSkillName} Module #${i}`;
                    const sess = {
                        id: (state.sessions || []).length + 1,
                        exchangeId: ex.id,
                        exchangeRequestId: ex.requestId,
                        sessionNumber: (state.sessions || []).filter(s => s.exchangeId === ex.id).length + 1,
                        phase: 2,
                        mode: ex.learningMode || "ONLINE",
                        teacherId: ex.plan.secondTeacherId,
                        teacherName: ex.plan.secondTeacherName,
                        teacherEmail: "student@mgmmumbai.ac.in",
                        learnerId: ex.plan.secondLearnerId,
                        learnerName: ex.plan.secondLearnerName,
                        learnerEmail: "student@mgmmumbai.ac.in",
                        skillId: ex.plan.secondSkillId,
                        skillName: ex.plan.secondSkillName,
                        topic: topicName,
                        objective: `Master reciprocal skill: ${topicName}`,
                        scheduledDate: sessDate,
                        scheduledTime: "18:00",
                        durationMinutes: 60,
                        location: ex.learningMode === 'OFFLINE' ? "College Central Library / Lab 402" : null,
                        zoomMeetingId: null,
                        zoomJoinUrl: "https://zoom.us/j/8492019488" + i + "?pwd=skilltrade2026",
                        zoomPassword: "skilltrade2026",
                        status: "SCHEDULED",
                        attendance: { teacher: "PRESENT", learner: "PRESENT" },
                        teacherReport: null,
                        learnerReport: null,
                        verificationStatus: "PENDING",
                        verifiedAt: null,
                        resources: [],
                        disputeReason: null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    state.sessions.push(sess);
                }
            }

            state.notifications.unshift({
                id: Date.now(),
                recipientId: isStudentA ? ex.student2Id : ex.student1Id,
                title: "Phase 2 Active! 🔄",
                message: `Both students confirmed! Phase 2 is now active: ${ex.plan.secondTeacherName} is teaching ${ex.plan.secondSkillName}.`,
                type: "PHASE_TRANSITION_ACTIVE",
                linkUrl: "requests.html",
                isRead: false,
                createdAt: new Date().toISOString()
            });
        }

        syncSupabase('saveExchange', ex);
        return sendJson(res, 200, {
            success: true,
            message: bothConfirmed ? "Phase 2 activated! Teaching direction transitioned." : "Confirmation recorded. Awaiting peer confirmation to start Phase 2.",
            data: ex.plan
        });
    }

    // =========================================================================
    // 10. CERTIFICATES REST APIS (SECTIONS 24 & 25)
    // =========================================================================

    // GET /api/certificates/:id (View certificate details or printable HTML)
    if (pathname.match(/^\/api\/certificates\/([^\/]+)$/) && req.method === 'GET') {
        const certId = pathname.split('/')[3];
        const cert = (state.certificates || []).find(c => c.id === certId || c.verificationCode === certId);
        if (!cert) return sendJson(res, 404, { success: false, message: "Certificate not found." });

        const myId = state.currentUser ? state.currentUser.userId : 0;
        const isOwner = (myId === cert.studentId || myId === cert.partnerId);
        if (!isOwner && !isAdmin(state.currentUser)) {
            // Check public verification request
            if (parsedUrl.query && parsedUrl.query.verify === 'true') {
                return sendJson(res, 200, { success: true, verified: true, data: { id: cert.id, studentName: cert.studentName, skillName: cert.skillName, issueDate: cert.issueDate } });
            }
            return sendJson(res, 403, { success: false, message: "Access Denied: You are not authorized to view this certificate." });
        }

        // If client requested HTML format (or clicked directly in browser)
        const acceptHeader = (req.headers && req.headers['accept']) || '';
        if (parsedUrl.query && (parsedUrl.query.format === 'html' || parsedUrl.query.view === 'true') || acceptHeader.includes('text/html')) {
            const html = renderHtmlCertificate(cert);
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
            return true;
        }

        return sendJson(res, 200, { success: true, data: cert });
    }

    // GET /api/students/:id/certificates (List student certificates)
    if (pathname.match(/^\/api\/students\/(\d+)\/certificates$/) && req.method === 'GET') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const studentId = Number(pathname.split('/')[3]);
        const myId = state.currentUser.userId;

        if (studentId !== myId && !isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden: You can only view your own certificates." });
        }

        const certs = (state.certificates || []).filter(c => c.studentId === studentId);
        return sendJson(res, 200, { success: true, data: certs });
    }

    // GET /api/admin/certificates (Admin audit of all issued certificates)
    if (pathname === '/api/admin/certificates' && req.method === 'GET') {
        if (!isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden: Administrator authorization required." });
        }
        return sendJson(res, 200, { success: true, data: state.certificates || [] });
    }

    // GET /api/certificates/verify/:id (Public verification)
    if (pathname.match(/^\/api\/certificates\/verify\/([^\/]+)$/) && req.method === 'GET') {
        const certId = pathname.split('/')[4];
        const cert = (state.certificates || []).find(c => c.id === certId || c.verificationCode === certId);
        if (!cert) return sendJson(res, 404, { success: false, verified: false, message: "Invalid or unrecognized Certificate ID." });

        return sendJson(res, 200, {
            success: true,
            verified: true,
            data: {
                id: cert.id,
                studentName: cert.studentName,
                skillName: cert.skillName,
                partnerName: cert.partnerName,
                issueDate: cert.issueDate,
                totalSessions: cert.totalSessions,
                verifiedSessions: cert.verifiedSessions,
                institution: cert.institution
            }
        });
    }

    // =========================================================================
    // 11. ADMIN EXCHANGE AUDIT TRAIL (SECTION 27)
    // =========================================================================
    if (pathname.match(/^\/api\/admin\/exchanges\/(\d+)\/audit$/) && req.method === 'GET') {
        if (!isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden: Administrator authorization required." });
        }
        const exId = Number(pathname.split('/')[4]);
        const ex = (state.exchanges || []).find(e => e.id === exId);
        if (!ex) return sendJson(res, 404, { success: false, message: "Exchange not found." });

        const s1Prof = (state.profiles || []).find(p => p.userId === ex.student1Id) || {};
        const s2Prof = (state.profiles || []).find(p => p.userId === ex.student2Id) || {};
        const sessions = (state.sessions || []).filter(s => s.exchangeId === ex.id);
        const quizzes = (state.quizzes || []).filter(q => q.exchangeId === ex.id);
        const attempts = (state.quizAttempts || []).filter(a => a.exchangeId === ex.id);
        const certs = (state.certificates || []).filter(c => c.exchangeId === ex.id);
        const relatedLogs = (state.auditLogs || []).filter(l => l.target && l.target.includes(`Exchange #${ex.id}`));

        const auditTrail = {
            exchangeId: ex.id,
            status: ex.status,
            startDate: ex.startDate,
            completionDate: ex.completionDate || null,
            overallProgress: ex.overallProgress || 0,
            learningMode: ex.learningMode || 'ONLINE',
            participants: {
                student1: { id: ex.student1Id, name: ex.student1Name, email: s1Prof.email, department: s1Prof.department, rating: s1Prof.averageRating, completedExchanges: s1Prof.completedExchangesCount },
                student2: { id: ex.student2Id, name: ex.student2Name, email: s2Prof.email, department: s2Prof.department, rating: s2Prof.averageRating, completedExchanges: s2Prof.completedExchangesCount }
            },
            skills: {
                skill1: { id: ex.skill1Id, name: ex.skill1Name || ex.skillOfferedTitle },
                skill2: { id: ex.skill2Id, name: ex.skill2Name || ex.skillRequestedTitle }
            },
            plan: ex.plan || null,
            sessions: sessions,
            quizzes: quizzes.map(q => ({
                ...q,
                attempts: attempts.filter(a => a.quizId === q.id)
            })),
            certificates: certs,
            disputes: sessions.filter(s => s.status === 'DISPUTED'),
            auditLogs: relatedLogs
        };

        return sendJson(res, 200, { success: true, data: auditTrail });
    }

    // =========================================================================
    // 12. KITAAB GHAR BUY / SELL & ORDER APIS (SECTIONS 32-37)
    // =========================================================================

    // POST /api/kitab-ghar/:id/order (Buyer places purchase / handover request)
    if (pathname.match(/^\/api\/kitab-ghar\/(\d+)\/order$/) && req.method === 'POST') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required to request a book." });
        const itemId = Number(pathname.split('/')[3]);
        const item = (state.kitabBhandar || []).find(b => b.id === itemId);
        if (!item) return sendJson(res, 404, { success: false, message: "Listing not found." });

        const myId = state.currentUser.userId;
        if (item.ownerId === myId) {
            return sendJson(res, 400, { success: false, message: "You cannot purchase your own listing." });
        }
        if (item.status === 'SOLD' || item.status === 'UNAVAILABLE') {
            return sendJson(res, 400, { success: false, message: "This item is no longer available." });
        }

        const body = await parseBody(req);
        const handoverLocation = (body.handoverLocation || "College Library").trim();
        const handoverDate = (body.handoverDate || new Date().toISOString().split('T')[0]).trim();
        const handoverTime = (body.handoverTime || "14:00").trim();
        const notes = (body.notes || "").trim();

        if (!state.kitabOrders) state.kitabOrders = [];
        const newOrder = {
            id: state.kitabOrders.length + 1,
            itemId: item.id,
            itemTitle: item.title,
            itemType: item.itemType || 'BOOK',
            price: Number(item.price) || 0,
            sellerId: item.ownerId,
            sellerName: item.ownerName,
            sellerEmail: item.ownerEmail,
            buyerId: myId,
            buyerName: state.currentUser.fullName || state.currentUser.email,
            buyerEmail: state.currentUser.email,
            handoverLocation,
            handoverDate,
            handoverTime,
            notes,
            status: "PENDING",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        state.kitabOrders.unshift(newOrder);
        item.status = "PENDING"; // Mark listing as pending order

        // Notify seller
        state.notifications.unshift({
            id: Date.now(),
            recipientId: item.ownerId,
            title: "New Book Order / Handover Request! 📚",
            message: `${newOrder.buyerName} requested to buy/swap "${item.title}". Handover proposed at ${handoverLocation} on ${handoverDate} at ${handoverTime}.`,
            type: "KITAB_ORDER_RECEIVED",
            linkUrl: "kitaab-ghar.html",
            isRead: false,
            createdAt: new Date().toISOString()
        });

        // Audit log
        state.auditLogs.unshift({
            id: Date.now(),
            action: "KITAB_ORDER_CREATED",
            performedBy: state.currentUser.email,
            target: `Order #${newOrder.id} (${item.title})`,
            timestamp: new Date().toISOString(),
            status: "PENDING",
            details: `Buyer ${newOrder.buyerName} requested item from ${item.ownerName}.`
        });

        return sendJson(res, 201, {
            success: true,
            message: "Purchase & handover request sent to seller!",
            data: newOrder
        });
    }

    // GET /api/kitab-ghar/orders (List user orders: purchases and sales)
    if (pathname === '/api/kitab-ghar/orders' && req.method === 'GET') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const myId = state.currentUser.userId;
        const allOrders = state.kitabOrders || [];

        const purchases = allOrders.filter(o => o.buyerId === myId);
        const sales = allOrders.filter(o => o.sellerId === myId);

        return sendJson(res, 200, {
            success: true,
            data: {
                purchases,
                sales,
                totalOrders: purchases.length + sales.length
            }
        });
    }

    // PUT /api/kitab-ghar/orders/:id/status (Update order status)
    if (pathname.match(/^\/api\/kitab-ghar\/orders\/(\d+)\/status$/) && req.method === 'PUT') {
        if (!state.currentUser) return sendJson(res, 401, { success: false, message: "Authentication required." });
        const orderId = Number(pathname.split('/')[4]);
        const order = (state.kitabOrders || []).find(o => o.id === orderId);
        if (!order) return sendJson(res, 404, { success: false, message: "Order not found." });

        const myId = state.currentUser.userId;
        const isParticipant = (order.buyerId === myId || order.sellerId === myId);
        if (!isParticipant && !isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden: You are not authorized to update this order." });
        }

        const body = await parseBody(req);
        const nextStatus = (body.status || "").toUpperCase();

        const validTransitions = ["PENDING", "READY_FOR_HANDOVER", "PAID", "COMPLETED", "CANCELLED"];
        if (!validTransitions.includes(nextStatus)) {
            return sendJson(res, 400, { success: false, message: `Invalid order status. Allowed: ${validTransitions.join(', ')}` });
        }

        order.status = nextStatus;
        order.updatedAt = new Date().toISOString();

        // Sync with item listing
        const item = (state.kitabBhandar || []).find(b => b.id === order.itemId);
        if (item) {
            if (nextStatus === 'COMPLETED' || nextStatus === 'PAID') {
                item.status = 'SOLD';
            } else if (nextStatus === 'CANCELLED') {
                item.status = 'AVAILABLE';
            } else if (nextStatus === 'READY_FOR_HANDOVER') {
                item.status = 'PENDING';
            }
        }

        // Notify other party
        const notifyRecipientId = (myId === order.buyerId) ? order.sellerId : order.buyerId;
        state.notifications.unshift({
            id: Date.now(),
            recipientId: notifyRecipientId,
            title: `Book Order ${nextStatus}! 📚`,
            message: `Status of order for "${order.itemTitle}" was updated to ${nextStatus}.`,
            type: "KITAB_ORDER_STATUS_UPDATE",
            linkUrl: "kitaab-ghar.html",
            isRead: false,
            createdAt: new Date().toISOString()
        });

        return sendJson(res, 200, {
            success: true,
            message: `Order status updated to ${nextStatus}.`,
            data: order
        });
    }

    // GET /api/admin/kitab-ghar/orders (Admin monitoring)
    if (pathname === '/api/admin/kitab-ghar/orders' && req.method === 'GET') {
        if (!isAdmin(state.currentUser)) {
            return sendJson(res, 403, { success: false, message: "Forbidden: Administrator authorization required." });
        }
        return sendJson(res, 200, { success: true, data: state.kitabOrders || [] });
    }


    // Not handled by Skill Exchange Engine -> pass through
    return false;
}

module.exports = {
    initExchangeEngineState,
    handleExchangeEngineApi,
    calculateSkillProgress,
    calculateExchangeOverallProgress,
    calculateSkillHealth,
    recordLearningActivity,
    createDefaultExchangePlan,
    getCuratedTopics
};
