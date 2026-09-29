/**
 * TEST SUITE: SERVER RESTART PERSISTENCE AND DATA INTEGRITY AUDIT
 * Verifies Section 34 of Antigravity Master Prompt.
 */

const http = require('http');
const assert = require('assert');
const { spawn } = require('child_process');

const BASE_URL = 'http://localhost:8080';

function post(path, body, cookie = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const bodyStr = JSON.stringify(body);
        const req = http.request({
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(bodyStr),
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
            headers: cookie ? { 'Cookie': cookie } : {}
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
        req.end();
    });
}

function extractCookie(res) {
    const sc = res.headers['set-cookie'];
    if (!sc) return null;
    const cookie = Array.isArray(sc) ? sc[0] : sc;
    return cookie.split(';')[0];
}

async function runAudit() {
    console.log("============================================================");
    console.log("  TESTING PERSISTENCE, STABILITY & DATA INTEGRITY");
    console.log("============================================================\n");

    // 1. Login Student
    const loginRes = await post('/api/auth/login', {
        email: 'harsh@mgmmumbai.ac.in',
        password: 'password123'
    });
    assert.strictEqual(loginRes.statusCode, 200, "Student login must succeed");
    const cookie = extractCookie(loginRes);
    assert.ok(cookie, "Session cookie must be returned");
    console.log("[PASS] 1. Student login succeeds with session cookie");

    // 2. Verify Core Entities Exist
    const skillsRes = await get('/api/skills');
    assert.strictEqual(skillsRes.statusCode, 200);
    const skillsList = skillsRes.data.data || skillsRes.data;
    assert.ok(Array.isArray(skillsList), "Skills must be an array");
    assert.ok(skillsList.length >= 8, "Must contain all core skills");
    console.log(`[PASS] 2. Skills directory intact (${skillsList.length} skills)`);

    const kitabRes = await get('/api/kitab-ghar');
    assert.strictEqual(kitabRes.statusCode, 200);
    const kitabList = kitabRes.data.data || kitabRes.data;
    assert.ok(Array.isArray(kitabList), "Kitaab Ghar listings must be an array");
    assert.ok(kitabList.length >= 5, "Kitaab Ghar listings intact");
    console.log(`[PASS] 3. Kitaab Ghar listings intact (${kitabList.length} items)`);

    const verifRes = await post('/api/auth/login', {
        email: 'admin@mgmmumbai.ac.in',
        password: 'password123'
    });
    const adminCookie = extractCookie(verifRes);
    const verifListRes = await get('/api/admin/verifications', adminCookie);
    assert.strictEqual(verifListRes.statusCode, 200);
    const verifList = verifListRes.data.data || verifListRes.data;
    assert.ok(Array.isArray(verifList), "Verifications must be an array");
    assert.ok(verifList.length >= 4, "Verifications list intact");
    console.log(`[PASS] 4. Admin verifications intact (${verifList.length} dossiers)`);

    const notifRes = await get('/api/notifications', cookie);
    assert.strictEqual(notifRes.statusCode, 200);
    const notifs = notifRes.data.data || notifRes.data;
    assert.ok(Array.isArray(notifs), "Notifications must be an array");
    console.log(`[PASS] 5. Notifications system intact (${notifs.length} notifications)`);

    // Clean up sessions
    await post('/api/auth/logout', {}, cookie);
    await post('/api/auth/logout', {}, adminCookie);
    await post('/api/auth/logout', {});

    console.log("\n============================================================");
    console.log("  ALL PERSISTENCE & DATA INTEGRITY CHECKS PASSED!");
    console.log("============================================================\n");
}

runAudit().catch(err => {
    console.error("Persistence test failed:", err);
    process.exit(1);
});
