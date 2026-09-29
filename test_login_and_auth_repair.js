/**
 * TEST SUITE: COMPLETE LOGIN, AUTHENTICATION & SESSION ISOLATION AUDIT
 * Verifies all P0 fixes requested in Antigravity Master Prompt.
 */

const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:8080';

function makeRequest(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                ...headers
            }
        };

        let requestBody = null;
        if (body) {
            requestBody = JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(requestBody);
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                let json = null;
                try {
                    json = JSON.parse(data);
                } catch (e) {
                    json = data;
                }
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    cookies: res.headers['set-cookie'] || [],
                    data: json
                });
            });
        });

        req.on('error', reject);
        if (requestBody) req.write(requestBody);
        req.end();
    });
}

function extractCookie(cookieArray, name) {
    if (!cookieArray || !Array.isArray(cookieArray)) return null;
    for (const c of cookieArray) {
        const parts = c.split(';')[0].split('=');
        if (parts[0].trim() === name) {
            return parts[1].trim();
        }
    }
    return null;
}

let passed = 0;
let failed = 0;

async function runTest(name, fn) {
    try {
        await fn();
        console.log(`[PASS] ${name}`);
        passed++;
    } catch (err) {
        console.error(`[FAIL] ${name}:`, err.message);
        failed++;
    }
}

async function runSuite() {
    console.log("============================================================");
    console.log("  RUNNING AUTH & LOGIN COMPLETE AUDIT SUITE");
    console.log("============================================================\n");

    // Ensure clean initial unauthenticated state before testing
    await makeRequest('POST', '/api/auth/logout');

    // TEST 1: Initial unauthenticated check
    await runTest("1. Clean Boot: Initial GET /api/auth/current-user returns unauthenticated", async () => {
        const res = await makeRequest('GET', '/api/auth/current-user');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.data.authenticated, false, "Should not be automatically authenticated on boot");
    });

    // TEST 2: Validation - Empty Email
    await runTest("2. Validation: Empty email rejected with 400", async () => {
        const res = await makeRequest('POST', '/api/auth/login', { email: '', password: 'password123' });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.data.success, false);
        assert.ok(res.data.message.includes("valid email"));
    });

    // TEST 3: Validation - Empty Password
    await runTest("3. Validation: Empty password rejected with 400", async () => {
        const res = await makeRequest('POST', '/api/auth/login', { email: 'harsh@mgmmumbai.ac.in', password: '' });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.data.success, false);
        assert.ok(res.data.message.includes("password"));
    });

    // TEST 4: Validation - Invalid Credentials
    await runTest("4. Auth: Incorrect password returns 401", async () => {
        const res = await makeRequest('POST', '/api/auth/login', { email: 'harsh@mgmmumbai.ac.in', password: 'wrongPassword!' });
        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.data.success, false);
        assert.ok(res.data.message.includes("Incorrect email or password"));
    });

    // TEST 5: Student Login + Session Cookie Issuance
    let studentSessionCookie = null;
    let studentToken = null;
    await runTest("5. Student Login: Returns 200, user data, and Set-Cookie with se_session", async () => {
        const res = await makeRequest('POST', '/api/auth/login', {
            email: '  HARSH@mgmmumbai.ac.in  ', // tests case & trim normalization
            password: 'password123'
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.data.role, 'ROLE_STUDENT');
        assert.strictEqual(res.data.data.email, 'harsh@mgmmumbai.ac.in');
        assert.ok(res.data.token, "Response must include session token");
        studentToken = res.data.token;

        studentSessionCookie = extractCookie(res.cookies, 'se_session');
        assert.ok(studentSessionCookie, "Set-Cookie header must include se_session");
        assert.strictEqual(studentSessionCookie, studentToken);
    });

    // TEST 6: Session Verification via Cookie
    await runTest("6. Session Persistence: GET /api/auth/current-user with cookie resolves user", async () => {
        const res = await makeRequest('GET', '/api/auth/current-user', null, {
            'Cookie': `se_session=${studentSessionCookie}`
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.data.authenticated, true);
        assert.strictEqual(res.data.data.email, 'harsh@mgmmumbai.ac.in');
    });

    // TEST 7: Session Isolation: Different client with unauthenticated/invalid cookie remains unauthenticated
    await runTest("7. Session Isolation: Request without valid session cookie remains unauthenticated", async () => {
        const res = await makeRequest('GET', '/api/auth/current-user', null, {
            'Cookie': 'se_session=invalid_or_unauthenticated'
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.data.authenticated, false, "Separate client without valid session cookie must not inherit session");
    });

    // TEST 8: Admin Login
    let adminSessionCookie = null;
    await runTest("8. Admin Login: Logs in admin@mgmmumbai.ac.in with ROLE_ADMIN and sets cookie", async () => {
        const res = await makeRequest('POST', '/api/auth/login', {
            email: 'admin@mgmmumbai.ac.in',
            password: 'password123'
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.data.role, 'ROLE_ADMIN');
        adminSessionCookie = extractCookie(res.cookies, 'se_session');
        assert.ok(adminSessionCookie);
    });

    // TEST 9: Super Admin Login
    let superAdminSessionCookie = null;
    await runTest("9. Super Admin Login: Logs in harshtukaram45@gmail.com with ROLE_SUPER_ADMIN", async () => {
        const res = await makeRequest('POST', '/api/auth/login', {
            email: 'harshtukaram45@gmail.com',
            password: 'password123'
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.data.role, 'ROLE_SUPER_ADMIN');
        superAdminSessionCookie = extractCookie(res.cookies, 'se_session');
        assert.ok(superAdminSessionCookie);
    });

    // TEST 10: Multi-session concurrency (Student and Admin retain distinct sessions)
    await runTest("10. Multi-session concurrency: Student and Super Admin cookies resolve independently", async () => {
        const resStudent = await makeRequest('GET', '/api/auth/current-user', null, {
            'Cookie': `se_session=${studentSessionCookie}`
        });
        assert.strictEqual(resStudent.data.data.email, 'harsh@mgmmumbai.ac.in');
        assert.strictEqual(resStudent.data.data.role, 'ROLE_STUDENT');

        const resSuper = await makeRequest('GET', '/api/auth/current-user', null, {
            'Cookie': `se_session=${superAdminSessionCookie}`
        });
        assert.strictEqual(resSuper.data.data.email, 'harshtukaram45@gmail.com');
        assert.strictEqual(resSuper.data.data.role, 'ROLE_SUPER_ADMIN');
    });

    // TEST 11: Logout invalidates session
    await runTest("11. Logout: POST /api/auth/logout invalidates session and clears cookie", async () => {
        const logoutRes = await makeRequest('POST', '/api/auth/logout', {}, {
            'Cookie': `se_session=${studentSessionCookie}`
        });
        assert.strictEqual(logoutRes.status, 200);
        assert.strictEqual(logoutRes.data.success, true);

        // Verify cookie clear header
        const clearedCookie = logoutRes.cookies.find(c => c.includes('se_session=;'));
        assert.ok(clearedCookie, "Should send Max-Age=0 / empty cookie header");

        // Verify old session token no longer resolves
        const verifyRes = await makeRequest('GET', '/api/auth/current-user', null, {
            'Cookie': `se_session=${studentSessionCookie}`
        });
        assert.strictEqual(verifyRes.data.data.authenticated, false, "Invalidated session must not authenticate");
    });

    // TEST 12: Firebase Token verification rejection on malformed token
    await runTest("12. Firebase Security: Malformed token is rejected with 401", async () => {
        const res = await makeRequest('POST', '/api/auth/firebase-login', {
            email: 'student_fb@mgmmumbai.ac.in',
            idToken: 'malformed.idtoken.payload'
        });
        assert.strictEqual(res.status, 401, "Should reject unverified token");
        assert.strictEqual(res.data.success, false);
    });

    // TEST 13: Firebase Escalation Protection for Super Admin
    await runTest("13. Firebase Security: Blocks takeover of Super Admin email", async () => {
        const res = await makeRequest('POST', '/api/auth/firebase-login', {
            email: 'harshtukaram45@gmail.com',
            fullName: 'Attacker Impersonating Super Admin',
            uid: 'fake-uid-123'
        });
        assert.strictEqual(res.status, 403);
        assert.strictEqual(res.data.success, false);
    });

    // TEST 14: Firebase Escalation Protection for Admin
    await runTest("14. Firebase Security: Blocks takeover of Admin email", async () => {
        const res = await makeRequest('POST', '/api/auth/firebase-login', {
            email: 'admin@mgmmumbai.ac.in',
            fullName: 'Attacker Impersonating Admin',
            uid: 'fake-uid-456'
        });
        assert.strictEqual(res.status, 403);
        assert.strictEqual(res.data.success, false);
    });

    // TEST 15: Legitimate Student Firebase Auth issues session cookie
    await runTest("15. Firebase Login: Legitimate student login returns session cookie", async () => {
        const studentEmail = `student_${Date.now()}@mgmmumbai.ac.in`;
        const res = await makeRequest('POST', '/api/auth/firebase-login', {
            email: studentEmail,
            fullName: 'Legit Firebase Student',
            uid: 'student-fb-789'
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.data.role, 'ROLE_STUDENT');
        const fbCookie = extractCookie(res.cookies, 'se_session');
        assert.ok(fbCookie, "Firebase login must establish an authenticated session cookie");
    });

    console.log("\n============================================================");
    console.log(`  AUTH SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("============================================================\n");

    if (failed > 0) process.exit(1);
}

runSuite().catch(err => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
