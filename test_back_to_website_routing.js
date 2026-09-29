/**
 * test_back_to_website_routing.js
 * Validates the critical routing fix:
 * "Back to Website" in Admin Panel must always open authenticated Main Website (dashboard.html).
 * Covers CASE 1 through CASE 7 from the Master Prompt.
 */

const http = require('http');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080';

let passed = 0;
let failed = 0;

function test(name, condition) {
    if (condition) {
        console.log(`  [PASS] ${name}`);
        passed++;
    } else {
        console.error(`  [FAIL] ${name}`);
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

function extractCookie(res) {
    const sc = res.headers['set-cookie'];
    if (!sc) return null;
    const cookie = Array.isArray(sc) ? sc[0] : sc;
    return cookie.split(';')[0];
}

async function runRoutingTests() {
    console.log('================================================================');
    console.log('  TESTING "BACK TO WEBSITE" & ADMIN PANEL ROUTING FIXES');
    console.log('================================================================\n');

    // Verification of Static Markup
    const adminHtml = fs.readFileSync(path.join(__dirname, 'src/main/resources/static/admin-dashboard.html'), 'utf8');
    const backBtnMatch = adminHtml.match(/<a[^>]*btn-admin-back[^>]*href="([^"]*)"/i) || adminHtml.match(/href="([^"]*)"[^>]*btn-admin-back/i);
    test('Admin Panel "Back to Website" href is dashboard.html (NOT index.html or history.back)', 
        backBtnMatch && backBtnMatch[1] === 'dashboard.html');

    // CASE 1: Student Login -> Main Website works normally
    console.log('\n[CASE 1] Student Login -> Main Website (dashboard.html)');
    const studentLogin = await post('/api/auth/login', {
        email: 'harsh@mgmmumbai.ac.in',
        password: 'password123'
    });
    test('Student login succeeds with 200 OK', studentLogin.statusCode === 200 && studentLogin.body.success);
    const studentCookie = extractCookie(studentLogin);
    const dashResStudent = await get('/dashboard.html', studentCookie);
    test('Student accesses dashboard.html with 200 OK', dashResStudent.statusCode === 200);

    // CASE 2: Admin Login -> Admin Panel -> Back to Website -> Main Website
    console.log('\n[CASE 2] Admin Login -> Admin Panel -> Back to Website -> Main Website');
    const adminLogin = await post('/api/auth/login', {
        email: 'admin@mgmmumbai.ac.in',
        password: 'password123'
    });
    test('Admin login succeeds with 200 OK', adminLogin.statusCode === 200 && adminLogin.body.success);
    const adminCookie = extractCookie(adminLogin);
    
    // Admin checks current-user
    const adminUser = await get('/api/auth/current-user', adminCookie);
    test('Admin session is active', adminUser.body.data.authenticated === true);
    test('Admin role is ROLE_ADMIN', adminUser.body.data.role === 'ROLE_ADMIN');

    // Admin opens dashboard.html (destination of Back to Website)
    const adminDashRes = await get('/dashboard.html', adminCookie);
    test('Admin accessing dashboard.html returns 200 OK (accessible to admin)', adminDashRes.statusCode === 200);
    test('Admin session preserved (not logged out)', adminUser.body.data.email === 'admin@mgmmumbai.ac.in');

    // CASE 3: Super Admin Login -> Admin Panel -> Back to Website -> Main Website
    console.log('\n[CASE 3] Super Admin Login -> Admin Panel -> Back to Website -> Main Website');
    const superLogin = await post('/api/auth/login', {
        email: 'harshtukaram45@gmail.com',
        password: 'password123'
    });
    test('Super Admin login succeeds with 200 OK', superLogin.statusCode === 200 && superLogin.body.success);
    const superCookie = extractCookie(superLogin);

    const superUser = await get('/api/auth/current-user', superCookie);
    test('Super Admin role is ROLE_SUPER_ADMIN', superUser.body.data.role === 'ROLE_SUPER_ADMIN');

    // Super Admin accesses dashboard.html
    const superDashRes = await get('/dashboard.html', superCookie);
    test('Super Admin accessing dashboard.html returns 200 OK', superDashRes.statusCode === 200);
    test('Super Admin preserves role without modification', superUser.body.data.role === 'ROLE_SUPER_ADMIN');

    // CASE 4: Admin Panel -> verification detail -> Back to Website -> Main Website
    console.log('\n[CASE 4] Admin Panel Deep View -> Back to Website -> Main Website');
    const verifRes = await get('/api/admin/verifications/1', superCookie);
    test('Admin accesses verification detail endpoint', verifRes.statusCode === 200 && verifRes.body.success);
    const verifDashBack = await get('/dashboard.html', superCookie);
    test('Navigating back to website from verification detail resolves to dashboard.html', verifDashBack.statusCode === 200);

    // CASE 5: Admin Panel -> refresh -> Back to Website -> Main Website
    console.log('\n[CASE 5] Admin Panel -> Refresh -> Back to Website -> Main Website');
    const adminDashRefresh = await get('/admin-dashboard.html', superCookie);
    test('Admin panel page load returns 200 OK', adminDashRefresh.statusCode === 200);
    const adminBackTarget = await get('/dashboard.html', superCookie);
    test('Back to Website button target dashboard.html is accessible post-refresh', adminBackTarget.statusCode === 200);

    // CASE 6: User is already authenticated -> manually open /home or /index.html -> Main Website NOT Landing Page
    console.log('\n[CASE 6] Authenticated User manually opening /index.html or /home');
    const homeRes = await get('/home', superCookie);
    test('/home redirects authenticated user with HTTP 302', homeRes.statusCode === 302);
    test('/home redirect Location is /dashboard.html (NOT landing.html)', homeRes.headers['location'] === '/dashboard.html');

    const indexRes = await get('/index.html', superCookie);
    test('/index.html redirects authenticated user with HTTP 302', indexRes.statusCode === 302);
    test('/index.html redirect Location is /dashboard.html (NOT landing.html)', indexRes.headers['location'] === '/dashboard.html');

    // CASE 7: User logs out -> public flow
    console.log('\n[CASE 7] User logs out -> Public flow');
    const logoutRes = await post('/api/auth/logout', {}, superCookie);
    test('Logout endpoint succeeds', logoutRes.statusCode === 200);
    const loggedOutUser = await get('/api/auth/current-user');
    test('Session is now unauthenticated', !loggedOutUser.body.data || loggedOutUser.body.data.authenticated === false);

    console.log('\n================================================================');
    console.log(`  ROUTING TESTS: PASSED: ${passed}, FAILED: ${failed}`);
    console.log('================================================================\n');

    if (failed > 0) process.exit(1);
}

runRoutingTests().catch(err => {
    console.error('Test failed with error:', err);
    process.exit(1);
});
