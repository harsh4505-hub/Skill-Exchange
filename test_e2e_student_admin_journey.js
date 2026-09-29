/**
 * COMPREHENSIVE END-TO-END STUDENT & ADMIN JOURNEY TEST
 * Corresponds to Section 32 of ANTIGRAVITY MASTER PROMPT
 */

const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:8080';

function post(path, data = {}) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const req = http.request(`${BASE_URL}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch {
                    resolve({ status: res.statusCode, raw: body });
                }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

function put(path, data = {}) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const req = http.request(`${BASE_URL}${path}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch {
                    resolve({ status: res.statusCode, raw: body });
                }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

function get(path) {
    return new Promise((resolve, reject) => {
        const req = http.request(`${BASE_URL}${path}`, {
            method: 'GET'
        }, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch {
                    resolve({ status: res.statusCode, raw: body });
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function runE2E() {
    console.log('===========================================================');
    console.log('STARTING SECTION 32 END-TO-END LIFECYCLE VERIFICATION');
    console.log('===========================================================');

    let passed = 0;
    function check(cond, msg) {
        if (cond) {
            console.log(`[PASS] ${msg}`);
            passed++;
        } else {
            console.error(`[FAIL] ${msg}`);
            process.exit(1);
        }
    }

    const timestamp = Date.now();
    const emailA = `journey_a_${timestamp}@mgmmumbai.ac.in`;
    const emailB = `journey_b_${timestamp}@mgmmumbai.ac.in`;
    const pass = 'password123';

    // 1. User A Register & Login
    console.log('\n--- 1. USER A REGISTRATION & LOGIN ---');
    const regA = await post('/api/auth/register', {
        email: emailA,
        password: pass,
        confirmPassword: pass,
        fullName: 'Student A Learner',
        college: 'MGM College of Engineering',
        department: 'Information Technology',
        yearOfStudy: '3rd Year'
    });
    // In local dev without SMTP credentials, server stores pending user
    // We can authenticate A via direct login if active or via firebase-login
    const loginA = await post('/api/auth/firebase-login', {
        email: emailA,
        fullName: 'Student A Learner'
    });
    check(loginA.status === 200 && loginA.data.success, 'User A logs in successfully');
    const userA = loginA.data.data;

    // 2. User A Profile Setup & Skills
    console.log('\n--- 2. USER A ADDS SKILLS & PROFILE ---');
    const addTeachA = await post('/api/students/skills/teach?skillId=4&proficiency=Advanced');
    check(addTeachA.status === 200, 'User A adds teaching skill (JavaScript)');

    const addLearnA = await post('/api/students/skills/learn?skillId=2&urgency=High');
    check(addLearnA.status === 200, 'User A adds learning skill (Python)');

    // 3. User B Register & Login
    console.log('\n--- 3. USER B REGISTRATION & SKILLS ---');
    const loginB = await post('/api/auth/firebase-login', {
        email: emailB,
        fullName: 'Student B Teacher'
    });
    check(loginB.status === 200 && loginB.data.success, 'User B logs in successfully');
    const userB = loginB.data.data;

    const addTeachB = await post('/api/students/skills/teach?skillId=2&proficiency=Expert');
    check(addTeachB.status === 200, 'User B adds teaching skill (Python)');

    const addLearnB = await post('/api/students/skills/learn?skillId=4&urgency=Medium');
    check(addLearnB.status === 200, 'User B adds learning skill (JavaScript)');

    // 4. Matching: User A finds complementary partner User B
    console.log('\n--- 4. MATCHING RECOGNITION ---');
    // Login as User A again
    await post('/api/auth/firebase-login', { email: emailA });
    const matchesRes = await get('/api/matches');
    check(matchesRes.status === 200 && Array.isArray(matchesRes.data.data), 'Matches query succeeds');
    const foundPartner = matchesRes.data.data.find(m => m.studentId === userB.userId);
    check(Boolean(foundPartner), 'User A successfully finds User B as a complementary skill match');

    // 5. Send Exchange Request from A to B
    console.log('\n--- 5. PROPOSAL CREATION & NOTIFICATION ---');
    const reqRes = await post('/api/exchange-requests', {
        receiverId: userB.userId,
        skillOfferedId: 4, // JavaScript
        skillOfferedName: 'JavaScript',
        skillRequestedId: 2, // Python
        skillRequestedName: 'Python',
        learningMode: 'OFFLINE',
        message: 'Hi Student B! I would love to trade my JavaScript knowledge for your Python expertise.'
    });
    check(reqRes.status === 200 && reqRes.data.success, 'Exchange proposal created successfully');
    const createdRequestId = reqRes.data.data.id;

    // 6. User B receives and accepts proposal
    console.log('\n--- 6. PROPOSAL ACCEPTANCE & WORKFLOW INITIALIZATION ---');
    await post('/api/auth/firebase-login', { email: emailB });
    const acceptRes = await put(`/api/exchange-requests/${createdRequestId}/accept`);
    check(acceptRes.status === 200 && acceptRes.data.data.status === 'ACCEPTED', 'User B accepts proposal; status is ACCEPTED');

    // 7. Verify Offline Progress Auto-Initialized
    const offProg = await get(`/api/exchange-requests/${createdRequestId}/offline-progress`);
    check(offProg.status === 200 && offProg.data.data !== null, 'Offline progress record initialized');
    const progressId = offProg.data.data.id;

    // 8. Progress Update (Session 1 -> 50%)
    console.log('\n--- 7. SESSION UPDATES & PROGRESS LOGGING ---');
    const update1 = await post(`/api/offline-exchanges/${progressId}/updates`, {
        topicsCovered: 'Python basics, control flow, functions',
        progressPercentage: 50,
        stage: 'Learning in Progress',
        description: 'First offline meeting in Library Room 3.'
    });
    check(update1.status === 200 && update1.data.data.progressPercentage === 50, 'Progress recorded at 50%');

    // 9. Completion Update (Session 2 -> 100%)
    console.log('\n--- 8. EXCHANGE COMPLETION ---');
    const update2 = await post(`/api/offline-exchanges/${progressId}/updates`, {
        topicsCovered: 'Data analysis, pandas, and project completion',
        progressPercentage: 100,
        stage: 'Exchange Completed',
        description: 'Final review session completed.'
    });
    check(update2.status === 200 && update2.data.data.status === 'COMPLETED', 'Exchange reaches 100% and is COMPLETED');

    // 10. Submit Peer Review
    console.log('\n--- 9. RATINGS & REVIEW SUBMISSION ---');
    const reviewRes = await post('/api/reviews', {
        exchangeId: offProg.data.data.exchangeId || createdRequestId,
        reviewedStudentId: userA.userId,
        rating: 5,
        comment: 'Fantastic teacher, explained JavaScript async/await clearly!'
    });
    check(reviewRes.status === 200 && reviewRes.data.success, 'Peer review submitted successfully');

    // 11. Super Admin Oversight
    console.log('\n--- 10. SUPER ADMIN OVERSIGHT & VALIDATION ---');
    const adminLogin = await post('/api/auth/login', {
        email: 'harshtukaram45@gmail.com',
        password: 'password123'
    });
    check(adminLogin.status === 200 && adminLogin.data.data.role === 'ROLE_SUPER_ADMIN', 'Super Admin logged in');

    const adminStats = await get('/api/admin/stats');
    check(adminStats.status === 200 && adminStats.data.success, 'Super Admin retrieves platform statistics');

    const adminOffExchanges = await get('/api/offline-exchanges');
    check(adminOffExchanges.status === 200, 'Super Admin views offline exchanges');
    const recordedInAdmin = adminOffExchanges.data.data.find(o => o.id === progressId);
    check(Boolean(recordedInAdmin), 'Super Admin sees newly completed offline exchange');
    check(recordedInAdmin.status === 'COMPLETED' && recordedInAdmin.progressPercentage === 100, 'Super Admin verifies 100% completion in database state');

    console.log(`\n===========================================================`);
    console.log(`ALL ${passed} SECTION 32 END-TO-END CHECKS PASSED PERFECTLY!`);
    console.log(`===========================================================\n`);
}

runE2E().catch(err => {
    console.error('Fatal E2E error:', err);
    process.exit(1);
});
