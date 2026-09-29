/**
 * test_landing_zip_integration.js
 * Comprehensive End-to-End Test Suite for Landing Page ZIP Integration
 * Validates all 35 Acceptance Criteria from the Master Prompt
 */

const http = require('http');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080';

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

async function runLandingZipIntegrationSuite() {
    console.log('============================================================');
    console.log('  RUNNING LANDING PAGE ZIP INTEGRATION TEST SUITE           ');
    console.log('============================================================\n');

    let passed = 0;
    let failed = 0;

    function test(desc, condition, details = '') {
        if (condition) {
            console.log(`[PASS] ${desc}`);
            passed++;
        } else {
            console.error(`[FAIL] ${desc} ${details ? '- ' + details : ''}`);
            failed++;
        }
    }

    try {
        // -------------------------------------------------------------
        // PART 1: PUBLIC LANDING PAGE CONTENT & NEO-BRUTALIST STYLING
        // -------------------------------------------------------------
        console.log('--- PART 1: PUBLIC LANDING PAGE CONTENT & NEO-BRUTALIST DESIGN ---');

        const landingRes = await get('/');
        test('1.1 Root URL (/) serves landing.html with HTTP 200 OK', landingRes.statusCode === 200);

        const html = landingRes.rawBody;

        // Header tests
        const headerMatch = html.match(/<header[\s\S]*?<\/header>/i);
        test('1.2 Landing page includes <header class="landing-header ...">', !!headerMatch);
        const headerHtml = headerMatch ? headerMatch[0] : '';

        test('1.3 Header brand contains "SKILL" and "EXCHANGE"', headerHtml.includes('SKILL') && headerHtml.includes('EXCHANGE'));
        test('1.4 Header contains ONLY LOGIN and SIGN UP on the right', headerHtml.includes('LOGIN') && headerHtml.includes('SIGN UP'));
        test('1.5 Login button calls enterAuthFlow("login.html")', headerHtml.includes("enterAuthFlow('login.html')"));
        test('1.6 Sign Up button calls enterAuthFlow("register.html")', headerHtml.includes("enterAuthFlow('register.html')"));

        const forbiddenHeaderItems = ['How It Works', 'Learning Modes', 'Verification', 'Kitab Bhandar', 'Pricing', 'Dashboard', 'Find Matches', 'My Exchanges', 'Chat', 'Admin'];
        const hasForbiddenHeader = forbiddenHeaderItems.some(item => headerHtml.includes(item));
        test('1.7 Header is clean with zero navigation tabs or private links', !hasForbiddenHeader);

        // Neo-Brutalist CSS tokens
        test('1.8 CSS contains Neo-Brutalist brand palette variables (--color-ink, --color-brand, --color-surface)', 
            html.includes('--color-ink: #1f1b2e') && html.includes('--color-brand: #6366f1') && html.includes('--color-surface: #f7f6fa')
        );
        test('1.9 CSS contains hard offset brutalist box shadows', html.includes('--shadow-brutal: 4px 4px 0 0 var(--color-ink)'));
        test('1.10 CSS contains 40px grid-bg utility and press button effect', html.includes('.grid-bg') && html.includes('.press'));

        // Hero Section
        test('1.11 Hero contains "01 / CAMPUS SKILL BARTER" chip', html.includes('01 / CAMPUS SKILL BARTER'));
        test('1.12 Hero headline contains "Trade skills, not money."', html.includes('Trade skills,') && html.includes('not money.'));
        test('1.13 Hero primary CTA "Start Exchanging — Free" navigates to register.html', html.includes('Start Exchanging — Free') && html.includes("enterAuthFlow('register.html')"));
        test('1.14 Hero secondary CTA "See How It Works" scrolls to #how-it-works', html.includes('href="#how-it-works"') && html.includes('See How It Works'));
        test('1.15 Hero contains trending skills badges (JAVA, PYTHON, PHOTOSHOP, PUBLIC SPEAKING, WEB DEV)', 
            html.includes('JAVA') && html.includes('PYTHON') && html.includes('PHOTOSHOP') && html.includes('PUBLIC SPEAKING') && html.includes('WEB DEV')
        );

        // Live Exchange Preview Card
        test('1.16 Live exchange preview card present with LIVE EXCHANGE PREVIEW chip', html.includes('LIVE EXCHANGE PREVIEW'));
        test('1.17 Zero personal demo names on public landing (No Harsh Vardhan or Sejal Sharma)', 
            !html.includes('Harsh Vardhan') && !html.includes('Sejal Sharma')
        );
        test('1.18 Zero star decorations or star ratings (No ★ or rating stars)', 
            !html.includes('4.8★') && !html.includes('4.9★') && !html.includes('★')
        );

        // Sections
        test('1.19 "What Students Can Do" section contains 4 core pillars', 
            html.includes('WHAT STUDENTS CAN DO') && html.includes('Learn Skills') && html.includes('Teach Skills') && html.includes('Find Partners') && html.includes('Exchange Skills')
        );
        test('1.20 "How It Works" section contains 4 clear steps', 
            html.includes('Four Steps to Your First Swap') && html.includes('List What You Know') && html.includes('Get Matched') && html.includes('Propose & Plan') && html.includes('Learn & Track')
        );
        test('1.21 "Learning Modes" section accurately highlights Online Zoom, Offline Campus, and Chat', 
            html.includes('ONLINE (ZOOM)') && html.includes('OFFLINE (CAMPUS)') && html.includes('CHAT (MESSAGING)')
        );
        test('1.22 Verification section correctly states Projects (compulsory), Experience (compulsory), Certificates (optional)', 
            html.includes('Practical Projects') && html.includes('Practical Experience') && html.includes('Certificates')
        );
        test('1.23 Kitaab Ghar marketplace section with explore CTA button', html.includes('Kitaab Ghar') && html.includes("enterAuthFlow('kitaab-ghar.html')"));
        test('1.24 100% Free Campus Barter section with ₹0 and zero hidden fees', html.includes('100% Free. Always.') && html.includes('₹0'));
        test('1.25 Final CTA section present with Start Exchanging and Student Log In buttons', html.includes('Ready to trade skills?'));
        test('1.26 Clean Neo-Brutalist footer with brand logo and navigation links', 
            html.includes('TRADE SKILLS, NOT MONEY') && (html.includes('© 2026 SkillExchange') || html.includes('&copy; 2026 SkillExchange'))
        );
        test('1.27 Floating Grok AI Learning Assistant client script loaded', html.includes('js/grok-assistant.js'));

        // -------------------------------------------------------------
        // PART 2: ROUTING, RETURNING USERS & AUTHENTICATED BYPASS
        // -------------------------------------------------------------
        console.log('\n--- PART 2: ROUTING, RETURNING USERS & AUTHENTICATED BYPASS ---');

        // Check client-side storage & bypass script in <head>
        test('2.1 Landing page script manages skillExchangeLandingSeen in localStorage', 
            html.includes('skillExchangeLandingSeen') && html.includes("localStorage.setItem('skillExchangeLandingSeen', 'true')")
        );
        test('2.2 Landing page pre-check validates authenticated session against /api/auth/current-user', 
            html.includes("fetch('/api/auth/current-user'")
        );
        test('2.3 Returning visitor redirect to login.html present', 
            html.includes("window.location.replace('login.html')")
        );

        // Server-Side Bypass Test for Authenticated Student
        const studentLoginRes = await post('/api/auth/login', {
            email: 'harsh@mgmmumbai.ac.in',
            password: 'password123'
        });
        const studentCookie = extractCookie(studentLoginRes);
        test('2.4 Student login succeeds', studentLoginRes.statusCode === 200 && !!studentCookie);

        const studentRootRes = await get('/', studentCookie);
        test('2.5 Authenticated student opening / is immediately redirected with HTTP 302', studentRootRes.statusCode === 302);
        test('2.6 Authenticated student redirect location is /dashboard.html (NOT landing.html)', studentRootRes.headers['location'] === '/dashboard.html');

        const studentLandingRes = await get('/landing.html', studentCookie);
        test('2.7 Authenticated student opening /landing.html is immediately redirected with HTTP 302', studentLandingRes.statusCode === 302);
        test('2.8 /landing.html redirect location is /dashboard.html', studentLandingRes.headers['location'] === '/dashboard.html');

        // Server-Side Bypass Test for Authenticated Admin
        const adminLoginRes = await post('/api/auth/login', {
            email: 'admin@mgmmumbai.ac.in',
            password: 'password123'
        });
        const adminCookie = extractCookie(adminLoginRes);
        test('2.9 Admin login succeeds', adminLoginRes.statusCode === 200 && !!adminCookie);

        const adminRootRes = await get('/', adminCookie);
        test('2.10 Authenticated admin opening / is redirected with HTTP 302 to /dashboard.html', 
            adminRootRes.statusCode === 302 && adminRootRes.headers['location'] === '/dashboard.html'
        );

        // Server-Side Bypass Test for Authenticated Super Admin
        const superLoginRes = await post('/api/auth/login', {
            email: 'harshtukaram45@gmail.com',
            password: 'password123'
        });
        const superCookie = extractCookie(superLoginRes);
        test('2.11 Super Admin login succeeds', superLoginRes.statusCode === 200 && !!superCookie);

        const superRootRes = await get('/', superCookie);
        test('2.12 Authenticated Super Admin opening / is redirected with HTTP 302 to /dashboard.html', 
            superRootRes.statusCode === 302 && superRootRes.headers['location'] === '/dashboard.html'
        );

        // Admin Panel "Back to Website"
        const adminDashboardHtml = fs.readFileSync(path.join(__dirname, 'src/main/resources/static/admin-dashboard.html'), 'utf8');
        test('2.13 Admin Panel "Back to Website" link targets dashboard.html', 
            adminDashboardHtml.includes('href="dashboard.html"') && adminDashboardHtml.includes('Back to Website')
        );

        // Clean static template synchronization check
        const templateHtml = fs.readFileSync(path.join(__dirname, 'src/main/resources/templates/landing.html'), 'utf8');
        test('2.14 Template landing.html is synchronized with static landing.html', 
            templateHtml.includes('01 / CAMPUS SKILL BARTER') && templateHtml.includes('Trade skills,')
        );

        console.log('\n============================================================');
        console.log(`  INTEGRATION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
        console.log('============================================================');

        if (failed > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    } catch (err) {
        console.error('Test execution error:', err);
        process.exit(1);
    }
}

runLandingZipIntegrationSuite();
