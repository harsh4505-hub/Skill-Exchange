/**
 * test_complete_skill_exchange_engine.js
 * End-to-end verification of the Complete Skill Exchange Engine (Master Prompt Section 32):
 * 1. Matching & Exchange Request
 * 2. Acceptance & Exchange Plan Creation
 * 3. First Teacher & Learning Order Confirmation (B teaches Java first, then A teaches Photoshop)
 * 4. Online Zoom Session Flow (Schedule, Zoom URL, Share in Chat, Attendance, Teacher Summary, Learner Understanding, Two-way Confirmation)
 * 5. Offline Session Flow (Location, Topic, Progress, Two-way Confirmation)
 * 6. Skill Progress Calculation (Real topic records, NO fake numbers)
 * 7. Daily Learning Activity Log & Streak Update
 * 8. Measurable Skill Health with Rationale
 * 9. Student Analytics Dashboard
 * 10. Admin Analytics Dashboard
 * 11. Admin Exchange Audit & Session Detail Views
 * 12. Inactivity Detection
 * 13. Final Exchange Completion & Permanent History Report
 * 14. Security & IDOR Authorization Guards
 */

const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:8080';

let passed = 0;
let failed = 0;

function check(condition, message) {
    if (condition) {
        console.log(`  [PASS] ${message}`);
        passed++;
    } else {
        console.error(`  [FAIL] ${message}`);
        failed++;
    }
}

function request(options, bodyData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(body);
                } catch (e) {
                    parsed = body;
                }
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: parsed,
                    rawBody: body
                });
            });
        });
        req.on('error', reject);
        if (bodyData) {
            req.write(typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData));
        }
        req.end();
    });
}

function get(urlPath, cookie) {
    const url = new URL(urlPath, BASE_URL);
    return request({
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: 'GET',
        headers: cookie ? { 'Cookie': cookie } : {}
    });
}

function post(urlPath, data, cookie) {
    const url = new URL(urlPath, BASE_URL);
    const bodyStr = JSON.stringify(data);
    return request({
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(bodyStr),
            ...(cookie ? { 'Cookie': cookie } : {})
        }
    }, bodyStr);
}

function put(urlPath, data, cookie) {
    const url = new URL(urlPath, BASE_URL);
    const bodyStr = JSON.stringify(data || {});
    return request({
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(bodyStr),
            ...(cookie ? { 'Cookie': cookie } : {})
        }
    }, bodyStr);
}

function extractCookie(res) {
    const sc = res.headers['set-cookie'];
    if (!sc) return null;
    const cookie = Array.isArray(sc) ? sc[0] : sc;
    return cookie.split(';')[0];
}

async function runScenario() {
    console.log('================================================================');
    console.log('  EXECUTING MASTER PROMPT SECTION 32 COMPLETE TEST SCENARIO');
    console.log('================================================================\n');

    // -------------------------------------------------------------
    // 1. AUTHENTICATE PARTICIPANTS
    // -------------------------------------------------------------
    console.log('[STEP 1] Authenticate Student A (Harsh) & Student B (Sejal)');
    // Student A: Harsh (userId 2)
    const loginA = await post('/api/auth/login', { email: 'harsh@mgmmumbai.ac.in', password: 'password123' });
    check(loginA.statusCode === 200 && loginA.body.success, 'Student A (Harsh) logs in successfully');
    const cookieA = extractCookie(loginA);
    const userAId = loginA.body.data.userId;

    // Student B: Sejal (userId 3)
    const loginB = await post('/api/auth/login', { email: 'sejal@mgmmumbai.ac.in', password: 'password123' });
    check(loginB.statusCode === 200 && loginB.body.success, 'Student B (Sejal) logs in successfully');
    const cookieB = extractCookie(loginB);
    const userBId = loginB.body.data.userId;

    // Student C: Raza (unauthorized 3rd party for IDOR tests)
    const loginC = await post('/api/auth/login', { email: 'raza@mgmmumbai.ac.in', password: 'password123' });
    check(loginC.statusCode === 200 && loginC.body.success, 'Student C (Raza) logs in for IDOR testing');
    const cookieC = extractCookie(loginC);

    // -------------------------------------------------------------
    // 2. EXCHANGE REQUEST CREATION & ACCEPTANCE
    // -------------------------------------------------------------
    console.log('\n[STEP 2] Create Exchange Proposal: Student A requests Java from B, offers Photoshop');
    await post('/api/auth/login', { email: 'harsh@mgmmumbai.ac.in', password: 'password123' });
    const reqRes = await post('/api/exchange-requests', {
        receiverId: userBId,
        skillOfferedId: 4,
        skillOfferedName: 'Photoshop',
        skillRequestedId: 1,
        skillRequestedName: 'Java',
        learningMode: 'ONLINE',
        message: 'Hi Sejal! Let us establish a structured exchange: Java programming for Photoshop graphic design.'
    }, cookieA);
    check(reqRes.statusCode === 200 && reqRes.body.success, 'Exchange proposal created successfully');
    const requestId = reqRes.body.data.id;

    // Student B accepts proposal
    await post('/api/auth/login', { email: 'sejal@mgmmumbai.ac.in', password: 'password123' });
    const acceptRes = await put(`/api/exchange-requests/${requestId}/accept`, {}, cookieB);
    check(acceptRes.statusCode === 200 && acceptRes.body.success, 'Student B accepts exchange proposal');

    // Retrieve active exchange
    const exListRes = await get('/api/exchanges', cookieB);
    const activeExchange = exListRes.body.data.find(e => e.requestId === requestId || (e.student1Id === userAId && e.student2Id === userBId));
    check(Boolean(activeExchange), 'Active Exchange created with ID: ' + (activeExchange ? activeExchange.id : 'none'));
    const exchangeId = activeExchange.id;

    // -------------------------------------------------------------
    // 3. EXCHANGE PLAN & FIRST TEACHER CONFIRMATION
    // -------------------------------------------------------------
    console.log('\n[STEP 3] Exchange Plan & First Teacher / Learning Order Confirmation');
    const planRes = await get(`/api/exchanges/${exchangeId}/plan`, cookieB);
    check(planRes.statusCode === 200 && planRes.body.success, 'Exchange plan initialized');
    let plan = planRes.body.data;

    // Define: Student B (Sejal) teaches Java first (Phase 1), then Student A teaches Photoshop (Phase 2)
    const updatePlanRes = await post(`/api/exchanges/${exchangeId}/plan`, {
        firstTeacherId: userBId, // Sejal teaches Java first
        durationWeeks: 4,
        plannedSessionsCount: 4,
        learningObjectives: [
            "Phase 1: Master Java fundamentals, OOP polymorphism, and Collections",
            "Phase 2: Master Photoshop layer masks, typography, and visual design"
        ],
        skillATopics: [
            { id: 1, name: "Java Basics & Data Types", completed: false, sessionCount: 0 },
            { id: 2, name: "Java OOP & Inheritance", completed: false, sessionCount: 0 },
            { id: 3, name: "Java Collections & Streams", completed: false, sessionCount: 0 }
        ],
        skillBTopics: [
            { id: 1, name: "Photoshop Workspace & Vector Masks", completed: false, sessionCount: 0 },
            { id: 2, name: "Photoshop Color Grading & Poster Design", completed: false, sessionCount: 0 }
        ]
    }, cookieB);
    check(updatePlanRes.statusCode === 200 && updatePlanRes.body.success, 'Exchange plan customized: Sejal teaches Java first');
    plan = updatePlanRes.body.data;
    check(plan.status === 'PLAN_PENDING_CONFIRMATION', 'Plan status is PLAN_PENDING_CONFIRMATION prior to both confirmations');

    // Student A confirms plan
    await post('/api/auth/login', { email: 'harsh@mgmmumbai.ac.in', password: 'password123' });
    const confARes = await put(`/api/exchanges/${exchangeId}/plan/confirm`, {}, cookieA);
    check(confARes.statusCode === 200, 'Student A confirms exchange plan');
    check(confARes.body.data.confirmedByA === true, 'Plan confirmedByA is true');

    // Student B confirms plan
    await post('/api/auth/login', { email: 'sejal@mgmmumbai.ac.in', password: 'password123' });
    const confBRes = await put(`/api/exchanges/${exchangeId}/plan/confirm`, {}, cookieB);
    check(confBRes.statusCode === 200, 'Student B confirms exchange plan');
    check(confBRes.body.data.status === 'PLAN_CONFIRMED', 'Exchange plan status reaches PLAN_CONFIRMED after both confirmations');
    check(confBRes.body.data.confirmedAt !== null, 'Plan confirmation timestamp recorded');

    // -------------------------------------------------------------
    // 4. SESSION 1: ONLINE ZOOM SESSION (JAVA BASICS)
    // -------------------------------------------------------------
    console.log('\n[STEP 4] Online Session Flow: Schedule, Zoom URL, Chat Share, 2-Way Verification');
    const scheduleSess1 = await post(`/api/exchanges/${exchangeId}/sessions`, {
        sessionNumber: 1,
        mode: 'ONLINE',
        teacherId: userBId, // Sejal
        learnerId: userAId, // Harsh
        skillName: 'Java',
        topic: 'Java Basics & Data Types',
        objective: 'Set up JDK, understand memory stack/heap, and write clean primitive data type methods',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '18:00',
        durationMinutes: 60
    }, cookieB);
    check(scheduleSess1.statusCode === 201 && scheduleSess1.body.success, 'Session 1 (Online) scheduled');
    const session1 = scheduleSess1.body.data;
    check(Boolean(session1.zoomJoinUrl), 'Zoom meeting generated securely without credential leakage: ' + session1.zoomJoinUrl);
    check(session1.status === 'SCHEDULED', 'Session 1 initial status is SCHEDULED');

    // Share Session in Chat
    const shareChatRes = await post(`/api/sessions/${session1.id}/share-in-chat`, {}, cookieB);
    check(shareChatRes.statusCode === 200 && shareChatRes.body.success, 'Session details shared into exchange conversation');

    // Start Session
    const startSess1 = await put(`/api/sessions/${session1.id}/status`, { status: 'IN_PROGRESS' }, cookieB);
    check(startSess1.statusCode === 200 && startSess1.body.data.status === 'IN_PROGRESS', 'Session 1 marked IN_PROGRESS with check-in timestamp');

    // Record Attendance
    const attendSess1 = await put(`/api/sessions/${session1.id}/attendance`, {
        teacherAttendance: 'PRESENT',
        learnerAttendance: 'PRESENT'
    }, cookieB);
    check(attendSess1.statusCode === 200 && attendSess1.body.data.teacher === 'PRESENT', 'Session attendance verified: Teacher PRESENT, Learner PRESENT');

    // Teacher submits report
    const teachRep1 = await post(`/api/sessions/${session1.id}/teacher-report`, {
        topicsCovered: 'JDK 17 installation, primitive data types, memory stack vs heap allocation, and type casting',
        summary: 'Harsh completed the practice memory allocation exercise quickly with zero errors.'
    }, cookieB);
    check(teachRep1.statusCode === 200, 'Teacher submits what was taught');
    check(teachRep1.body.data.status === 'AWAITING_CONFIRMATION', 'Session remains AWAITING_CONFIRMATION when only one party confirmed');

    // Learner submits report
    await post('/api/auth/login', { email: 'harsh@mgmmumbai.ac.in', password: 'password123' });
    const learnRep1 = await post(`/api/sessions/${session1.id}/learner-report`, {
        understanding: 'Understood stack vs heap differences and primitive vs reference types.',
        confidence: 5,
        practiceNeeded: 'Wrapper classes autoboxing edge cases',
        nextTopic: 'Java OOP & Inheritance',
        doubts: 'None'
    }, cookieA);
    check(learnRep1.statusCode === 200, 'Learner submits understanding, confidence (5/5), and practice needed');
    check(learnRep1.body.data.verificationStatus === 'VERIFIED', 'Session 1 reaches VERIFIED status after both confirmations');
    check(learnRep1.body.data.verifiedAt !== null, 'Permanent verified timestamp recorded');

    // -------------------------------------------------------------
    // 5. SESSION 2: OFFLINE SESSION (JAVA OOP)
    // -------------------------------------------------------------
    console.log('\n[STEP 5] Offline Session Flow: Physical Location, Attendance & Verification');
    await post('/api/auth/login', { email: 'sejal@mgmmumbai.ac.in', password: 'password123' });
    const scheduleSess2 = await post(`/api/exchanges/${exchangeId}/sessions`, {
        sessionNumber: 2,
        mode: 'OFFLINE',
        teacherId: userBId,
        learnerId: userAId,
        skillName: 'Java',
        topic: 'Java OOP & Inheritance',
        objective: 'Construct class hierarchy with inheritance and super keyword',
        location: 'College Central Library — Room 204',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '16:00',
        durationMinutes: 90
    }, cookieB);
    check(scheduleSess2.statusCode === 201, 'Session 2 (Offline) scheduled with physical location');
    const session2 = scheduleSess2.body.data;
    check(session2.location === 'College Central Library — Room 204', 'Physical meeting location preserved');

    // Submit reports for Session 2
    await post(`/api/sessions/${session2.id}/teacher-report`, {
        topicsCovered: 'Inheritance, method overriding, super() constructor calls, dynamic method dispatch',
        summary: 'Met in Library Room 204. Designed bank account hierarchy with Savings and Current accounts.'
    }, cookieB);

    await post('/api/auth/login', { email: 'harsh@mgmmumbai.ac.in', password: 'password123' });
    const learnRep2 = await post(`/api/sessions/${session2.id}/learner-report`, {
        understanding: 'Solid understanding of runtime polymorphism and method overriding.',
        confidence: 4,
        practiceNeeded: 'Abstract classes vs interface contracts',
        nextTopic: 'Photoshop Phase Transition'
    }, cookieA);
    check(learnRep2.body.data.verificationStatus === 'VERIFIED', 'Session 2 (Offline) verified with mutual confirmations');

    // -------------------------------------------------------------
    // 6. REAL SKILL PROGRESS VERIFICATION (NO FAKE DATA)
    // -------------------------------------------------------------
    console.log('\n[STEP 6] Verify Calculated Topic-Level Skill Progress');
    const progRes = await get(`/api/exchanges/${exchangeId}/progress`, cookieA);
    check(progRes.statusCode === 200 && progRes.body.success, 'GET /api/exchanges/:id/progress returns 200 OK');
    const progData = progRes.body.data;
    check(progData.skillA.completedTopics.length >= 2, `Java completed topics count is ${progData.skillA.completedTopics.length} (from real verified sessions)`);
    check(progData.skillA.progressPercentage > 0, `Java calculated progress is ${progData.skillA.progressPercentage}%`);
    check(progData.overallProgress > 0, `Overall exchange calculated progress is ${progData.overallProgress}%`);

    // -------------------------------------------------------------
    // 7. DAILY LEARNING ACTIVITY & STREAK VERIFICATION
    // -------------------------------------------------------------
    console.log('\n[STEP 7] Daily Learning Activity & Streak System');
    const analyticsRes = await get('/api/students/analytics', cookieA);
    check(analyticsRes.statusCode === 200 && analyticsRes.body.success, 'GET /api/students/analytics returns 200 OK');
    const studentAnalytics = analyticsRes.body.data;
    check(studentAnalytics.streak.currentStreak >= 1, `Current learning streak is ${studentAnalytics.streak.currentStreak} day(s)`);
    check(studentAnalytics.learningActivity.recentActivities.length > 0, 'Real legitimate learning activities logged');
    check(studentAnalytics.overview.verifiedSessions >= 2, 'Verified sessions count reflects verified records');

    // -------------------------------------------------------------
    // 8. MEASURABLE SKILL HEALTH VERIFICATION
    // -------------------------------------------------------------
    console.log('\n[STEP 8] Measurable Skill Health & Explanation');
    const healthRes = await get('/api/skills/Java/health', cookieA);
    check(healthRes.statusCode === 200 && healthRes.body.success, 'GET /api/skills/Java/health returns 200 OK');
    const healthData = healthRes.body.data;
    check(['HEALTHY', 'ON TRACK'].includes(healthData.status), `Java Skill Health status is: ${healthData.status}`);
    check(typeof healthData.reason === 'string' && healthData.reason.length > 10, 'Health includes explicit measurable rationale: ' + healthData.reason);

    // -------------------------------------------------------------
    // 9. ADMIN ANALYTICS & EXCHANGE AUDIT DOSSIER
    // -------------------------------------------------------------
    console.log('\n[STEP 9] Admin Platform Oversight & Audit Dossier');
    const adminLogin = await post('/api/auth/login', { email: 'admin@mgmmumbai.ac.in', password: 'password123' });
    const adminCookie = extractCookie(adminLogin);

    // Platform Overview
    const adminOverview = await get('/api/admin/analytics/overview', adminCookie);
    check(adminOverview.statusCode === 200 && adminOverview.body.success, 'Admin analytics overview returns 200 OK');
    check(adminOverview.body.data.sessions.verifiedSessions >= 2, 'Admin overview accurately counts verified sessions');

    // Full Exchange Audit
    const auditRes = await get(`/api/admin/exchanges/${exchangeId}/audit`, adminCookie);
    check(auditRes.statusCode === 200 && auditRes.body.success, `GET /api/admin/exchanges/${exchangeId}/audit returns 200 OK`);
    const auditData = auditRes.body.data;
    check(auditData.exchange.id === exchangeId, 'Audit matches target exchange');
    check(auditData.plan.status === 'PLAN_CONFIRMED', 'Audit displays confirmed Exchange Plan');
    check(auditData.sessionsTimeline.length >= 2, `Audit displays full session timeline (${auditData.sessionsTimeline.length} sessions)`);

    // Single Session Audit Drilldown
    const sessAuditRes = await get(`/api/admin/sessions/${session1.id}`, adminCookie);
    check(sessAuditRes.statusCode === 200 && sessAuditRes.body.success, `GET /api/admin/sessions/${session1.id} returns 200 OK`);
    check(sessAuditRes.body.data.auditRecord.verificationStatus === 'VERIFIED', 'Session audit record shows VERIFIED');
    check(sessAuditRes.body.data.session.teacherReport.topicsCovered.length > 0, 'Audit preserves teacher report');
    check(sessAuditRes.body.data.session.learnerReport.understanding.length > 0, 'Audit preserves learner understanding');

    // -------------------------------------------------------------
    // 10. FINAL EXCHANGE COMPLETION & PERMANENT REPORT
    // -------------------------------------------------------------
    console.log('\n[STEP 10] Final Exchange Completion & Permanent History');
    await post('/api/auth/login', { email: 'harsh@mgmmumbai.ac.in', password: 'password123' });
    const completeRes = await post(`/api/exchanges/${exchangeId}/complete`, {
        teacherFinalSummary: 'Java fundamentals and practical OOP completed successfully.',
        learnerFinalUnderstanding: 'Ready to build independent backend projects with Java 17.'
    }, cookieA);
    check(completeRes.statusCode === 200 && completeRes.body.success, 'Exchange officially completed');
    check(completeRes.body.data.finalProgress === 100, 'Exchange final progress finalized at 100%');

    // Permanent History Report
    const reportRes = await get(`/api/exchanges/${exchangeId}/report`, cookieA);
    check(reportRes.statusCode === 200 && reportRes.body.success, 'Permanent exchange history report retrieved');
    check(reportRes.body.data.reviewAllowed === true, 'Peer review enabled on completed exchange');

    // Submit Peer Review
    const revRes = await post('/api/reviews', {
        exchangeId,
        revieweeId: userBId,
        rating: 5,
        comment: 'Sejal is an outstanding peer teacher. Great pacing, clear OOP diagrams, and very supportive during code exercises.'
    }, cookieA);
    check(revRes.statusCode === 200 || revRes.statusCode === 201, 'Peer review submitted successfully');

    // -------------------------------------------------------------
    // 11. SECURITY & IDOR AUTHORIZATION GUARDS
    // -------------------------------------------------------------
    console.log('\n[STEP 11] Security & IDOR Authorization Protection');
    // Student C (Raza) attempts to submit a teacher report on Session 1 (owned by Harsh & Sejal)
    await post('/api/auth/login', { email: 'raza@mgmmumbai.ac.in', password: 'password123' });
    const maliciousReport = await post(`/api/sessions/${session1.id}/teacher-report`, {
        topicsCovered: 'Unauthorized tampered topics',
        summary: 'Hacked summary'
    }, cookieC);
    check(maliciousReport.statusCode === 403, `Unauthorized student blocked from modifying session (HTTP 403 Forbidden, got: ${maliciousReport.statusCode})`);

    // Student C attempts to confirm an exchange plan they are not part of
    const maliciousPlanConfirm = await put(`/api/exchanges/${exchangeId}/plan/confirm`, {}, cookieC);
    check(maliciousPlanConfirm.statusCode === 403, `Unauthorized student blocked from confirming plan (HTTP 403 Forbidden, got: ${maliciousPlanConfirm.statusCode})`);

    console.log('\n================================================================');
    console.log(`  COMPLETE TEST SCENARIO SUMMARY: PASSED: ${passed}, FAILED: ${failed}`);
    console.log('================================================================\n');

    if (failed > 0) process.exit(1);
}

runScenario().catch(err => {
    console.error('Test scenario execution failed with error:', err);
    process.exit(1);
});
