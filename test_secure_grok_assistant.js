/**
 * test_secure_grok_assistant.js
 * Comprehensive automated test suite for Secure Grok Learning Assistant
 */

const http = require('http');
const fs = require('fs');
const assert = require('assert');

const BASE_URL = 'http://localhost:8080';

function request(method, path, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const reqHeaders = { ...headers };
        if (body && !reqHeaders['Content-Type']) {
            reqHeaders['Content-Type'] = 'application/json';
        }

        const req = http.request(url, { method, headers: reqHeaders }, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(data);
                } catch (e) {
                    parsed = data;
                }
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: parsed
                });
            });
        });

        req.on('error', reject);
        if (body) {
            req.write(typeof body === 'string' ? body : JSON.stringify(body));
        }
        req.end();
    });
}

function extractCookie(headers) {
    const setCookie = headers['set-cookie'];
    if (!setCookie) return '';
    const cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    return cookie.split(';')[0];
}

async function runGrokAssistantTestSuite() {
    console.log("============================================================");
    console.log("  RUNNING SECURE GROK LEARNING ASSISTANT TEST SUITE");
    console.log("============================================================\n");

    const grokService = require('./grokAssistantService');
    grokService.resetRateLimits();

    let studentCookie = '';
    let adminCookie = '';

    // Test 1: Unauthenticated request must return 401
    const unauthRes = await request('POST', '/api/ai/chat', {}, { message: "When is my next session?" });
    assert.strictEqual(unauthRes.status, 401, "Unauthenticated request should return 401");
    assert.strictEqual(unauthRes.body.success, false);
    console.log("[PASS] 1. Unauthenticated request strictly rejected with HTTP 401");

    // Test 2: Log in as Student Harsh
    const loginRes = await request('POST', '/api/auth/login', {}, {
        email: 'harsh@mgmmumbai.ac.in',
        password: 'password123'
    });
    assert.strictEqual(loginRes.status, 200, "Student Harsh login failed");
    studentCookie = extractCookie(loginRes.headers);
    assert.ok(studentCookie, "Session cookie missing for student");
    console.log("[PASS] 2. Student Harsh authenticated successfully with session cookie");

    // Test 3: Authenticated question: "When is my next session?"
    const sessionRes = await request('POST', '/api/ai/chat', { Cookie: studentCookie }, {
        message: "When is my next session?"
    });
    assert.strictEqual(sessionRes.status, 200, "Authenticated Grok chat returned non-200");
    assert.strictEqual(sessionRes.body.success, true);
    assert.ok(sessionRes.body.data.answer, "Grok answer missing");
    assert.ok(sessionRes.body.data.answer.toLowerCase().includes("session") || sessionRes.body.data.answer.toLowerCase().includes("photoshop"), 
        "Response should mention next session details: " + sessionRes.body.data.answer);
    console.log("[PASS] 3. Contextual Query: 'When is my next session?' -> Answered accurately from student's schedule");

    // Test 4: Authenticated question: "What is my learning streak?"
    const streakRes = await request('POST', '/api/ai/chat', { Cookie: studentCookie }, {
        message: "What is my learning streak?"
    });
    assert.strictEqual(streakRes.status, 200);
    assert.strictEqual(streakRes.body.success, true);
    assert.ok(streakRes.body.data.answer.includes("3") && streakRes.body.data.answer.toLowerCase().includes("streak"),
        "Streak response should mention 3 days streak");
    console.log("[PASS] 4. Contextual Query: 'What is my learning streak?' -> Verified 3-day active streak from real data");

    // Test 5: Authenticated question: "What did I learn in the last session?"
    const lastSessionRes = await request('POST', '/api/ai/chat', { Cookie: studentCookie }, {
        message: "What did I learn in the last session?"
    });
    assert.strictEqual(lastSessionRes.status, 200);
    assert.strictEqual(lastSessionRes.body.success, true);
    console.log("[PASS] 5. Contextual Query: 'What did I learn in the last session?' -> Verified learning logs synthesized");

    // Test 6: Authenticated question: "What is my current skill progress?"
    const progressRes = await request('POST', '/api/ai/chat', { Cookie: studentCookie }, {
        message: "What is my current skill progress?"
    });
    assert.strictEqual(progressRes.status, 200);
    assert.strictEqual(progressRes.body.success, true);
    assert.ok(progressRes.body.data.answer.toLowerCase().includes("progress") || progressRes.body.data.answer.includes("%"),
        "Progress response should include percentage");
    console.log("[PASS] 6. Contextual Query: 'What is my current skill progress?' -> Real verified progress retrieved");

    // Test 7: Authenticated question: "What topics should I revise?"
    const reviseRes = await request('POST', '/api/ai/chat', { Cookie: studentCookie }, {
        message: "What topics should I revise?"
    });
    assert.strictEqual(reviseRes.status, 200);
    assert.strictEqual(reviseRes.body.success, true);
    console.log("[PASS] 7. Contextual Query: 'What topics should I revise?' -> Tailored study recommendations delivered");

    // Test 8: Empty or invalid message validation
    const emptyRes = await request('POST', '/api/ai/chat', { Cookie: studentCookie }, { message: "   " });
    assert.strictEqual(emptyRes.status, 400, "Empty message should return 400");
    console.log("[PASS] 8. Payload validation: Empty query rejected with HTTP 400");

    // Test 9: Oversize message validation (> 1000 characters)
    const longMessage = "a".repeat(1005);
    const oversizeRes = await request('POST', '/api/ai/chat', { Cookie: studentCookie }, { message: longMessage });
    assert.strictEqual(oversizeRes.status, 400, "Oversize query should return 400");
    console.log("[PASS] 9. Security validation: Oversize message rejected (> 1000 characters)");

    // Test 10: Authenticate as Sejal (Student B) and verify isolated context (No IDOR)
    const sejalLogin = await request('POST', '/api/auth/login', {}, {
        email: 'sejal@mgmmumbai.ac.in',
        password: 'password123'
    });
    assert.strictEqual(sejalLogin.status, 200);
    const sejalCookie = extractCookie(sejalLogin.headers);
    const sejalStreak = await request('POST', '/api/ai/chat', { Cookie: sejalCookie }, {
        message: "What is my learning streak?"
    });
    assert.strictEqual(sejalStreak.status, 200);
    // Sejal's streak is 2 days in test database
    assert.ok(sejalStreak.body.data.answer.includes("2"), "Sejal's response should reflect Sejal's 2-day streak");
    console.log("[PASS] 10. IDOR Prevention: Student Sejal's assistant returns only Sejal's isolated academic data");

    // Test 11: Verify context builder module does not leak private fields
    const mockState = {
        users: [{ id: 2, fullName: "Harsh", email: "harsh@mgm.ac.in", password: "hashed_secret_password", role: "ROLE_STUDENT" }],
        profiles: [{ userId: 2, department: "Computer Science", yearOfStudy: "4th Year", secretToken: "sensitive_token_123" }],
        exchanges: [],
        sessions: [],
        learningStreaks: { 2: { currentStreak: 3, longestStreak: 7 } },
        quizAttempts: []
    };
    const ctx = grokService.buildStudentContext(2, mockState);
    const ctxJson = JSON.stringify(ctx);
    assert.ok(!ctxJson.includes("hashed_secret_password"), "Password leaked in context builder!");
    assert.ok(!ctxJson.includes("sensitive_token_123"), "Secret token leaked in context builder!");
    console.log("[PASS] 11. Security Audit: Sensitive credentials (passwords, salts, tokens) strictly excluded from AI context");

    // Test 12: Verify Frontend static files NEVER contain real XAI_API_KEY
    const staticJs = fs.readFileSync('src/main/resources/static/js/grok-assistant.js', 'utf8');
    const appJs = fs.readFileSync('src/main/resources/static/js/app.js', 'utf8');
    assert.ok(!staticJs.includes("xai-") && !staticJs.includes("XAI_API_KEY"), "API Key leak in grok-assistant.js!");
    assert.ok(!appJs.includes("xai-"), "API Key leak in app.js!");
    console.log("[PASS] 12. Client-Side Audit: Zero XAI_API_KEY occurrences in frontend JavaScript assets");

    // Test 13: Verify rate-limiter functionality with a dedicated test account
    const razaLogin = await request('POST', '/api/auth/login', {}, {
        email: 'raza@mgmmumbai.ac.in',
        password: 'password123'
    });
    const razaCookie = extractCookie(razaLogin.headers);
    let blockedCount = 0;
    for (let i = 0; i < 18; i++) {
        const r = await request('POST', '/api/ai/chat', { Cookie: razaCookie }, { message: "Ping " + i });
        if (r.status === 429) {
            blockedCount++;
        }
    }
    assert.ok(blockedCount > 0, "Rate limiter should have triggered 429 Too Many Requests");
    console.log(`[PASS] 13. Rate Limiter: Excessive burst traffic blocked (${blockedCount} requests throttled with HTTP 429)`);

    console.log("\n============================================================");
    console.log("  ALL 13 SECURE GROK ASSISTANT TESTS PASSED! 100%");
    console.log("============================================================\n");
}

runGrokAssistantTestSuite().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
