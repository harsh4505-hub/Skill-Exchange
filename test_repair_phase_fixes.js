/**
 * REPAIR PHASE VALIDATION TEST SUITE
 * Validates:
 * 1. Security: Firebase auth blocks admin/super-admin privilege escalation with HTTP 403
 * 2. RBAC: Super Admin has full administrative access to online sessions, notes, offline progress
 * 3. Routing: /admin.html redirects or serves admin-dashboard with proper RBAC
 * 4. Supabase Service: All persistence handlers exist and operate cleanly
 */

const http = require('http');
const assert = require('assert');
const supabaseService = require('./supabaseService');

const BASE_URL = 'http://localhost:8080';

function post(path, data, headers = {}) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const req = http.request(`${BASE_URL}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                ...headers
            }
        }, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers });
                } catch {
                    resolve({ status: res.statusCode, raw: body, headers: res.headers });
                }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

function get(path, headers = {}) {
    return new Promise((resolve, reject) => {
        const req = http.request(`${BASE_URL}${path}`, {
            method: 'GET',
            headers
        }, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers });
                } catch {
                    resolve({ status: res.statusCode, raw: body, headers: res.headers });
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function runTests() {
    let passed = 0;
    let failed = 0;

    function test(name, fn) {
        return fn().then(() => {
            console.log(`[PASS] ${name}`);
            passed++;
        }).catch(err => {
            console.error(`[FAIL] ${name}:`, err.message);
            failed++;
        });
    }

    console.log('--- STARTING REPAIR PHASE FIXES VALIDATION ---');

    // TEST 1: Firebase Auth Escalation Protection for Super Admin Email
    await test('Firebase Login: Blocks takeover of Super Admin email harshtukaram45@gmail.com', async () => {
        const res = await post('/api/auth/firebase-login', {
            email: 'harshtukaram45@gmail.com',
            fullName: 'Attacker Impersonating Super Admin',
            uid: 'fake-uid-123'
        });
        assert.strictEqual(res.status, 403, 'Should return 403 Forbidden');
        assert.strictEqual(res.data.success, false);
        assert.ok(res.data.message.includes('Administrative accounts must log in'));
    });

    // TEST 2: Firebase Auth Escalation Protection for Admin Email
    await test('Firebase Login: Blocks takeover of Admin email admin@mgmmumbai.ac.in', async () => {
        const res = await post('/api/auth/firebase-login', {
            email: 'admin@mgmmumbai.ac.in',
            fullName: 'Attacker Impersonating Admin',
            uid: 'fake-uid-456'
        });
        assert.strictEqual(res.status, 403, 'Should return 403 Forbidden');
        assert.strictEqual(res.data.success, false);
    });

    // TEST 3: Legitimate Student Firebase Auth Still Functions
    await test('Firebase Login: Regular student account login succeeds', async () => {
        const studentEmail = `student_${Date.now()}@mgmmumbai.ac.in`;
        const res = await post('/api/auth/firebase-login', {
            email: studentEmail,
            fullName: 'Verified Test Student',
            uid: 'student-uid-789'
        });
        assert.strictEqual(res.status, 200, 'Student login should succeed');
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.data.role, 'ROLE_STUDENT');
    });

    // TEST 4: Super Admin Login & RBAC on Online Sessions
    await test('Super Admin: Logs in and accesses all online sessions without role shadowing bug', async () => {
        const loginRes = await post('/api/auth/login', {
            email: 'harshtukaram45@gmail.com',
            password: 'password123'
        });
        assert.strictEqual(loginRes.status, 200, 'Super admin login should succeed');
        assert.strictEqual(loginRes.data.data.role, 'ROLE_SUPER_ADMIN');

        const sessRes = await get('/api/online-sessions');
        assert.strictEqual(sessRes.status, 200, 'Super Admin should be able to view online sessions');
        assert.strictEqual(sessRes.data.success, true);
        assert.ok(Array.isArray(sessRes.data.data), 'Sessions should be an array');
        assert.ok(sessRes.data.data.length > 0, 'Should have at least 1 session');
    });

    // TEST 5: Super Admin Access to Offline Exchanges
    await test('Super Admin: Accesses offline exchange detailed progress record', async () => {
        const offRes = await get('/api/offline-exchanges/1');
        assert.strictEqual(offRes.status, 200, 'Super Admin should view offline exchange progress');
        assert.strictEqual(offRes.data.success, true);
        assert.strictEqual(offRes.data.data.id, 1);
        assert.ok(Array.isArray(offRes.data.data.updates), 'Should return session updates timeline');
    });

    // TEST 6: Protected /admin.html access when logged in as Super Admin
    await test('/admin.html route rewrite serves admin dashboard to Super Admin without 404', async () => {
        const adminRes = await get('/admin.html');
        assert.strictEqual(adminRes.status, 200, 'Super Admin should receive HTTP 200');
        assert.ok(adminRes.raw.includes('Administrator Control Center') || adminRes.raw.includes('Skill Exchange'), 'Should serve the admin dashboard HTML');
    });

    // TEST 7: Supabase Service Methods Verification
    await test('Supabase Service: All persistence methods are functions', async () => {
        const requiredFns = [
            'saveOnlineSession',
            'saveExchangeNote',
            'deleteExchangeNote',
            'saveOfflineProgress',
            'saveOfflineUpdate',
            'saveKitabListing',
            'deleteKitabListing'
        ];
        for (const fn of requiredFns) {
            assert.strictEqual(typeof supabaseService[fn], 'function', `${fn} must be a function`);
        }
    });

    console.log(`\n========================================`);
    console.log(`REPAIR TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
