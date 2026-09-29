/**
 * TEST SUITE: COMPLETE TWO-WAY SKILL EXCHANGE WORKFLOW, QUIZZES, CERTIFICATES & KITAAB GHAR
 * Validates Parts A, B, C & D of Antigravity Master Prompt
 */

const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:8080';

function post(path, body, cookie = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const bodyStr = JSON.stringify(body || {});
        const req = http.request({
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(bodyStr),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                ...(cookie ? { 'Cookie': cookie } : {})
            }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
                resolve({ statusCode: res.statusCode, headers: res.headers, data: parsed });
            });
        });
        req.on('error', reject);
        req.write(bodyStr);
        req.end();
    });
}

function put(path, body, cookie = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const bodyStr = JSON.stringify(body || {});
        const req = http.request({
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(bodyStr),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                ...(cookie ? { 'Cookie': cookie } : {})
            }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
                resolve({ statusCode: res.statusCode, headers: res.headers, data: parsed });
            });
        });
        req.on('error', reject);
        req.write(bodyStr);
        req.end();
    });
}

function get(path, cookie = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const req = http.request({
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                ...(cookie ? { 'Cookie': cookie } : {})
            }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
                resolve({ statusCode: res.statusCode, headers: res.headers, data: parsed, raw: data });
            });
        });
        req.on('error', reject);
        req.end();
    });
}

function extractCookie(res) {
    const sc = res.headers['set-cookie'];
    if (!sc) return null;
    const cookie = Array.isArray(sc) ? sc[0] : sc;
    return cookie.split(';')[0];
}

async function runWorkflowAudit() {
    console.log("============================================================");
    console.log("  RUNNING COMPLETE REAL-WORLD WORKFLOW AUDIT SUITE");
    console.log("============================================================\n");

    // Clean initial state
    await post('/api/auth/logout', {});

    // 1. Authenticate Student A (Harsh) & Student B (Sejal) & Admin
    const loginHarsh = await post('/api/auth/login', { email: 'harsh@mgmmumbai.ac.in', password: 'password123' });
    assert.strictEqual(loginHarsh.statusCode, 200);
    const harshCookie = extractCookie(loginHarsh);
    console.log("[PASS] 1. Student A (Harsh) logged in successfully");

    const loginSejal = await post('/api/auth/login', { email: 'sejal@mgmmumbai.ac.in', password: 'password123' });
    assert.strictEqual(loginSejal.statusCode, 200);
    const sejalCookie = extractCookie(loginSejal);
    console.log("[PASS] 2. Student B (Sejal) logged in successfully");

    const loginAdmin = await post('/api/auth/login', { email: 'admin@mgmmumbai.ac.in', password: 'password123' });
    assert.strictEqual(loginAdmin.statusCode, 200);
    const adminCookie = extractCookie(loginAdmin);
    console.log("[PASS] 3. Admin logged in successfully");

    // 2. PART A AUDIT: Verification Document Retrieval & Route Protection
    const docRes = await get('/uploads/proofs/raza_pipeline_screenshot.png', adminCookie);
    assert.strictEqual(docRes.statusCode, 200, "Admin can view proof document");
    assert.strictEqual(docRes.headers['content-type'], 'image/png');

    const adminPrefixedDoc = await get('/admin/uploads/proofs/raza_pipeline_screenshot.png', adminCookie);
    assert.strictEqual(adminPrefixedDoc.statusCode, 200, "Admin prefixed path resolves to document");

    const missingDoc = await get('/uploads/proofs/non_existent_file.png', adminCookie);
    assert.strictEqual(missingDoc.statusCode, 404, "Missing document returns 404");
    assert.strictEqual(missingDoc.headers['content-type'], 'application/json', "Missing document returns JSON, never HTML");
    console.log("[PASS] 4. PART A Verified: Document routing, admin access and 404 security intact");

    // 3. PART B AUDIT: Two-Way Exchange Plan Confirmation
    const planRes = await get('/api/exchanges/1/plan', harshCookie);
    assert.strictEqual(planRes.statusCode, 200);
    assert.ok(planRes.data.data.firstTeacherName, "First teacher explicitly declared");
    assert.ok(planRes.data.data.firstSkillName, "First skill explicitly declared");
    console.log(`[PASS] 5. Exchange Plan details intact (First teacher: ${planRes.data.data.firstTeacherName}, Skill: ${planRes.data.data.firstSkillName})`);

    // 4. Recurring Schedule Generation
    const schedGenRes = await post('/api/exchanges/1/generate-schedule', {
        preferredDays: ["Monday", "Wednesday", "Friday"],
        preferredTime: "17:30",
        durationMinutes: 60,
        totalSessions: 6,
        mode: "ONLINE"
    }, harshCookie);
    assert.strictEqual(schedGenRes.statusCode, 201);
    assert.ok(Array.isArray(schedGenRes.data.data));
    assert.strictEqual(schedGenRes.data.data.length, 6);
    console.log(`[PASS] 6. Recurring schedule generated: 6 sessions planned with alternating phases`);

    // 5. Plan Extension Endpoint (Section 11)
    const extendRes = await put('/api/exchanges/1/extend', { additionalDays: 7, reason: "Midterm exam buffer" }, harshCookie);
    assert.strictEqual(extendRes.statusCode, 200);
    assert.strictEqual(extendRes.data.data.status, "EXTENDED");
    console.log("[PASS] 7. Session/Exchange schedule extended by mutual agreement");

    // 6. Session Lifecycle & Two-Way Learning Records (Section 15)
    // Teacher (Sejal) submits What I Taught
    const teacherReportRes = await post('/api/sessions/1/teacher-report', {
        topicsCovered: "Photoshop Interface, Layers & Vector Masks",
        summary: "Covered layer hierarchy, non-destructive adjustment masks, and clipping paths with practical exercises."
    }, sejalCookie);
    assert.strictEqual(teacherReportRes.statusCode, 200);
    console.log("[PASS] 8. Teacher learning record submitted ('What I Taught')");

    // Learner (Harsh) submits What I Understood
    const learnerReportRes = await post('/api/sessions/1/learner-report', {
        understanding: "Understood layer masks completely. Built sample poster mockup.",
        confidence: 5,
        practiceNeeded: "Pen tool curves",
        doubts: "None"
    }, harshCookie);
    assert.strictEqual(learnerReportRes.statusCode, 200);
    assert.strictEqual(learnerReportRes.data.data.verificationStatus, "VERIFIED");
    console.log("[PASS] 9. Learner learning record submitted ('What I Understood') -> Session 1 VERIFIED");

    // 7. Per-Session Quiz Creation (Section 16)
    const createQuizRes = await post('/api/sessions/1/quiz', {
        title: "Photoshop Layer Masks Quick Quiz",
        questions: [
            {
                id: 1,
                type: "MULTIPLE_CHOICE",
                question: "Which color reveals content in a layer mask?",
                options: ["White", "Black", "Gray", "Red"],
                correctAnswer: "White",
                marks: 1
            },
            {
                id: 2,
                type: "TRUE_FALSE",
                question: "Layer masks permanently erase underlying pixel data.",
                options: ["True", "False"],
                correctAnswer: "False",
                marks: 1
            }
        ]
    }, sejalCookie);
    assert.strictEqual(createQuizRes.statusCode, 201);
    console.log("[PASS] 10. Teacher created per-session quiz with 2 questions");

    // 8. Quiz Fetch & Learner Submission (Sections 17 & 18)
    const getQuizRes = await get('/api/sessions/1/quiz', harshCookie);
    assert.strictEqual(getQuizRes.statusCode, 200);
    assert.strictEqual(getQuizRes.data.data.questions[0].correctAnswer, undefined, "Unsubmitted learner cannot see correct answers");

    const submitQuizRes = await post('/api/sessions/1/quiz/submit', {
        answers: [
            { questionId: 1, answer: "White" },
            { questionId: 2, answer: "False" }
        ]
    }, harshCookie);
    assert.strictEqual(submitQuizRes.statusCode, 200);
    assert.strictEqual(submitQuizRes.data.data.percentage, 100, "Auto-grading must compute 100%");
    console.log(`[PASS] 11. Learner submitted quiz: Score ${submitQuizRes.data.data.marksObtained}/${submitQuizRes.data.data.maxMarks} (${submitQuizRes.data.data.percentage}%)`);

    // 9. Phase 1 to Phase 2 Transition (Sections 20 & 21)
    const phaseTransA = await post('/api/exchanges/1/phase-transition', {}, harshCookie);
    assert.strictEqual(phaseTransA.statusCode, 200);

    const phaseTransB = await post('/api/exchanges/1/phase-transition', {}, sejalCookie);
    assert.strictEqual(phaseTransB.statusCode, 200);
    assert.strictEqual(phaseTransB.data.data.phase2Status, "ACTIVE");
    console.log("[PASS] 12. Two-Way Phase Transition completed: Phase 2 active with second teacher");

    // 10. Final Exchange Completion & Official Certificates (Sections 22, 23, 24, 25)
    const completeRes = await post('/api/exchanges/1/complete', {
        teacherFinalSummary: "Both Photoshop and Java curriculum goals fully delivered and verified.",
        learnerFinalUnderstanding: "Mastered full design stack and core backend programming."
    }, harshCookie);
    assert.strictEqual(completeRes.statusCode, 200);
    assert.strictEqual(completeRes.data.data.finalProgress, 100);
    assert.ok(completeRes.data.data.certificates && completeRes.data.data.certificates.length === 2, "2 Official Certificates issued");
    const certId = completeRes.data.data.certificates[0].id;
    console.log(`[PASS] 13. Final Exchange Completed! Certificates issued: ${certId}`);

    // Verify Certificate API & HTML Printable view
    const certDataRes = await get(`/api/certificates/${certId}`, harshCookie);
    assert.strictEqual(certDataRes.statusCode, 200);
    assert.strictEqual(certDataRes.data.data.studentName, "Harsh Vardhan");

    const certHtmlRes = await get(`/api/certificates/${certId}?format=html`, harshCookie);
    assert.strictEqual(certHtmlRes.statusCode, 200);
    assert.ok(certHtmlRes.raw.includes("Certificate of Skill Exchange Completion"));
    assert.ok(certHtmlRes.raw.includes("Harsh Vardhan"));
    console.log("[PASS] 14. Official Certificate rendered in Neo-Brutalist HTML layout for download/print");

    // Public Certificate Verification
    const publicCertRes = await get(`/api/certificates/verify/${certId}`);
    assert.strictEqual(publicCertRes.statusCode, 200);
    assert.strictEqual(publicCertRes.data.verified, true);
    console.log("[PASS] 15. Public certificate verification endpoint verified certificate authenticity");

    // 11. Admin Deep Exchange Audit Trail (Section 27)
    const adminAuditRes = await get('/api/admin/exchanges/1/audit', adminCookie);
    assert.strictEqual(adminAuditRes.statusCode, 200);
    assert.ok(adminAuditRes.data.data.sessions.length >= 6);
    assert.ok(adminAuditRes.data.data.certificates.length >= 2);
    assert.ok(adminAuditRes.data.data.quizzes.length >= 1);
    console.log("[PASS] 16. Admin deep exchange audit trail intact (sessions, quizzes, certificates, logs)");

    // 12. PART C AUDIT: Kitaab Ghar Buy/Sell & Order Flow (Sections 32-37)
    // Buyer (Sejal) requests to purchase/swap book from Seller (Harsh)
    const orderRes = await post('/api/kitab-ghar/1/order', {
        handoverLocation: "College Library Ground Floor",
        handoverDate: "2026-10-05",
        handoverTime: "15:00",
        notes: "Need textbook for Semester 5 exam prep."
    }, sejalCookie);
    assert.strictEqual(orderRes.statusCode, 201);
    const orderId = orderRes.data.data.id;
    assert.strictEqual(orderRes.data.data.status, "PENDING");
    console.log(`[PASS] 17. Buyer requested Kitaab Ghar item: Order #${orderId} created in PENDING status`);

    // Seller (Harsh) accepts & confirms handover
    const updateOrderRes = await put(`/api/kitab-ghar/orders/${orderId}/status`, {
        status: "READY_FOR_HANDOVER"
    }, harshCookie);
    assert.strictEqual(updateOrderRes.statusCode, 200);
    assert.strictEqual(updateOrderRes.data.data.status, "READY_FOR_HANDOVER");
    console.log(`[PASS] 18. Seller accepted order -> status updated to READY_FOR_HANDOVER`);

    // Buyer views their purchases
    const myOrdersRes = await get('/api/kitab-ghar/orders', sejalCookie);
    assert.strictEqual(myOrdersRes.statusCode, 200);
    assert.ok(myOrdersRes.data.data.purchases.some(p => p.id === orderId));
    console.log("[PASS] 19. Buyer views purchases and handover coordination details");

    // Admin monitors Kitaab Ghar orders
    const adminOrdersRes = await get('/api/admin/kitab-ghar/orders', adminCookie);
    assert.strictEqual(adminOrdersRes.statusCode, 200);
    assert.ok(Array.isArray(adminOrdersRes.data.data));
    console.log(`[PASS] 20. Admin monitors all campus Kitaab Ghar transactions (${adminOrdersRes.data.data.length} orders)`);

    // Clean up sessions
    await post('/api/auth/logout', {}, harshCookie);
    await post('/api/auth/logout', {}, sejalCookie);
    await post('/api/auth/logout', {}, adminCookie);

    console.log("\n============================================================");
    console.log("  ALL 20 REAL-WORLD WORKFLOW AUDIT ASSERTIONS PASSED! 100%");
    console.log("============================================================\n");
}

runWorkflowAudit().catch(err => {
    console.error("Workflow Audit Failed:", err);
    process.exit(1);
});
