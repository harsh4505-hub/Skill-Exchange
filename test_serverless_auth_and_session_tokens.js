/**
 * Automated Test: Serverless Stateless HMAC Session Tokens & Auth Verification
 */

const http = require('http');

function request(options, body = null) {
    return new Promise((resolve, reject) => {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ...(options.headers || {})
        };
        const req = http.request({ ...options, headers }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
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

async function runTests() {
    console.log("=== Testing Serverless Stateless Auth & Session Verification ===");
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log("  [PASS] " + message);
            passed++;
        } else {
            console.error("  [FAIL] " + message);
            failed++;
        }
    }

    try {
        // 1. Unauthenticated request to /api/auth/current-user
        const unauthRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/auth/current-user',
            method: 'GET'
        });
        assert(unauthRes.status === 200, "Unauthenticated /api/auth/current-user returns status 200");
        assert(unauthRes.body.data && unauthRes.body.data.authenticated === false, "Returns authenticated: false when unauthenticated");

        // 2. Real email/password login
        const loginRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            email: 'harsh@mgmmumbai.ac.in',
            password: 'password123'
        });
        assert(loginRes.status === 200, "Login returns HTTP 200");
        assert(loginRes.body.success === true, "Login response success: true");
        assert(Boolean(loginRes.body.token), "Login response returns signed session token");
        assert(loginRes.body.token.split('.').length === 3, "Session token is 3-part HMAC signed JWT structure");

        const cookieHeader = loginRes.headers['set-cookie'];
        assert(Boolean(cookieHeader), "Login response sets Set-Cookie header");
        const cookieStr = Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader;
        assert(cookieStr.includes('se_session='), "Cookie contains se_session");
        assert(cookieStr.includes('HttpOnly'), "Cookie contains HttpOnly flag");
        assert(cookieStr.includes('SameSite=Lax'), "Cookie contains SameSite=Lax");

        const sessionToken = loginRes.body.token;

        // 3. Authenticated request using Cookie
        const cookieAuthRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/auth/current-user',
            method: 'GET',
            headers: { 'Cookie': cookieStr }
        });
        assert(cookieAuthRes.status === 200, "Cookie authenticated request returns HTTP 200");
        assert(cookieAuthRes.body.data.authenticated === true, "Cookie authenticated response authenticated: true");
        assert(cookieAuthRes.body.data.email === 'harsh@mgmmumbai.ac.in', "Identifies user email correctly from cookie");

        // 4. Authenticated request using Bearer header (Cross-lambda serverless scenario)
        const bearerAuthRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/auth/current-user',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
        assert(bearerAuthRes.status === 200, "Bearer authenticated request returns HTTP 200");
        assert(bearerAuthRes.body.data.authenticated === true, "Bearer authenticated response authenticated: true");
        assert(bearerAuthRes.body.data.email === 'harsh@mgmmumbai.ac.in', "Identifies user email correctly from Bearer token");

        // 5. Authenticated request using x-session-token header
        const xTokenRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/auth/current-user',
            method: 'GET',
            headers: { 'x-session-token': sessionToken }
        });
        assert(xTokenRes.status === 200, "x-session-token authenticated request returns HTTP 200");
        assert(xTokenRes.body.data.authenticated === true, "x-session-token authenticated response authenticated: true");

        // 6. Test token claims structure
        const parts = sessionToken.split('.');
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        assert(payload.email === 'harsh@mgmmumbai.ac.in', "Token payload base64url contains valid user claims");
        assert(payload.userId === 2, "Token payload contains correct userId");

        // 7. Test tampered token rejection
        const tamperedParts = [...parts];
        const tamperedPayload = Buffer.from(JSON.stringify({ ...payload, email: 'hacker@mgmmumbai.ac.in' })).toString('base64url');
        const tamperedToken = `${tamperedParts[0]}.${tamperedPayload}.${tamperedParts[2]}`;
        const tamperedRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/auth/current-user',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${tamperedToken}` }
        });
        assert(tamperedRes.body.data.authenticated === false, "Tampered signature session token is rejected");

        // 8. Test Firebase login without ID token in production simulation is rejected
        const fakeFirebaseRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/auth/firebase-login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-enforce-token': 'true'
            }
        }, {
            email: 'fake@example.com',
            fullName: 'Fake User'
        });
        assert(fakeFirebaseRes.status === 400, "Firebase login without idToken in production returns HTTP 400 Bad Request");
        assert(fakeFirebaseRes.body.success === false, "Client-asserted unverified Firebase payload rejected");

        // 9. Test Firebase login with forged/garbage ID token is rejected
        const invalidFirebaseRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/auth/firebase-login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            idToken: 'forged.fake.token'
        });
        assert(invalidFirebaseRes.status === 401, "Forged Firebase token returns HTTP 401 Unauthorized");
        assert(invalidFirebaseRes.body.success === false, "Forged Firebase token rejected cryptographically");

        // 10. Logout and verify cookie clearing and revocation
        const logoutRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/auth/logout',
            method: 'POST',
            headers: { 'Cookie': cookieStr }
        });
        assert(logoutRes.status === 200, "Logout returns HTTP 200");
        const clearCookieHeader = logoutRes.headers['set-cookie'];
        const clearStr = Array.isArray(clearCookieHeader) ? clearCookieHeader[0] : clearCookieHeader;
        assert(clearStr.includes('Max-Age=0'), "Logout cookie header contains Max-Age=0 to invalidate session");

        // 11. Verify logged out session token cannot authenticate
        const postLogoutAuthRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/auth/current-user',
            method: 'GET',
            headers: { 'Cookie': cookieStr }
        });
        assert(postLogoutAuthRes.body.data.authenticated === false, "Revoked session token cannot authenticate after logout");

        console.log(`\nResults: ${passed} passed, ${failed} failed.`);
        if (failed > 0) process.exit(1);
    } catch (e) {
        console.error("Test execution error:", e);
        process.exit(1);
    }
}

runTests();
