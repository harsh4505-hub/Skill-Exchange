const http = require('http');

function fetchUrl(urlPath, options = {}) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 8080,
            path: urlPath,
            method: options.method || 'GET',
            headers: options.headers || {}
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
        });
        req.on('error', err => reject(err));
        if (options.body) req.write(options.body);
        req.end();
    });
}

async function runLandingStartPageTests() {
    console.log('===============================================================');
    console.log('  TESTING LANDING START PAGE & ONE-TIME ROUTING FLOW           ');
    console.log('===============================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(desc, condition, details = '') {
        if (condition) {
            console.log(`[PASS] ${desc}`);
            passed++;
        } else {
            console.error(`[FAIL] ${desc} ${details ? '- ' + details : ''}`);
            failed++;
        }
    }

    try {
        // 1. Landing Page Returns HTTP 200 OK
        const landingRes = await fetchUrl('/landing.html');
        assert('landing.html returns HTTP 200 OK', landingRes.statusCode === 200);

        // 2. Clean URL /landing Returns HTTP 200 OK
        const cleanLandingRes = await fetchUrl('/landing');
        assert('/landing clean URL rewrite returns HTTP 200 OK', cleanLandingRes.statusCode === 200);

        const html = landingRes.body;

        // 3. Branding and Logo
        assert('Contains Student Skill Exchange branding and logo', 
            html.includes('SKILL') && html.includes('EXCHANGE') && html.includes('CAMPUS NETWORK')
        );

        // 4. Short Explanation of Platform
        assert('Contains clear explanation of the campus skill barter platform', 
            html.includes('Share What You Know') && html.includes('Learn What You Need') && html.includes('reciprocal')
        );

        // 5. What Students Can Do (Section 1 Requirement)
        assert('Contains "What Students Can Do" section', html.includes('WHAT STUDENTS CAN DO'));
        assert('Contains "Learn Skills" pillar', html.includes('Learn Skills'));
        assert('Contains "Teach Skills" pillar', html.includes('Teach Skills'));
        assert('Contains "Find Partners" pillar', html.includes('Find Partners'));
        assert('Contains "Exchange Skills" pillar', html.includes('Exchange Skills'));

        // 6. Login and Sign Up Actions with enterAuthFlow
        assert('Contains Login CTA buttons with enterAuthFlow("login.html")', 
            html.includes("enterAuthFlow('login.html')")
        );
        assert('Contains Sign Up CTA buttons with enterAuthFlow("register.html")', 
            html.includes("enterAuthFlow('register.html')")
        );

        // 7. No Fake Profiles, Testimonials, or Names
        const fakeNames = ['Aarav Sharma', 'John Doe', 'Jane Doe', 'Alice Smith', 'Bob Johnson'];
        let hasFakeName = fakeNames.some(name => html.includes(name));
        assert('Zero fake testimonials or fake student names', !hasFakeName);

        // 8. No Marketplace, Trading, or Payment terminology
        const bannedTerms = ['buy now', 'sell skills', 'cart', 'checkout', 'pricing plans', 'subscription tier'];
        let hasBannedTerm = bannedTerms.some(term => html.toLowerCase().includes(term));
        assert('No marketplace, trading, or payment terminology on landing page', !hasBannedTerm);

        // 9. Authenticated Bypass Check on landing.html
        assert('landing.html includes client-side check to bypass landing for authenticated users', 
            html.includes('/api/auth/current-user') && html.includes("window.location.replace('index.html')")
        );

        // 10. Check index.html contains First-Time Visitor Gateway
        const indexRes = await fetchUrl('/index.html');
        assert('index.html returns HTTP 200 OK', indexRes.statusCode === 200);
        assert('index.html contains landingPageVisited check in head', 
            indexRes.body.includes('landingPageVisited') && indexRes.body.includes("window.location.replace('landing.html')")
        );
        assert('index.html redirects returning unauthenticated users to login.html', 
            indexRes.body.includes("window.location.replace('login.html')")
        );

        // 11. Check login.html contains already-authenticated bypass
        const loginRes = await fetchUrl('/login.html');
        assert('login.html returns HTTP 200 OK', loginRes.statusCode === 200);
        assert('login.html contains already-authenticated redirect to index.html', 
            loginRes.body.includes('/api/auth/current-user') && loginRes.body.includes("window.location.replace('index.html')")
        );
        assert('login.html stores landingPageVisited upon login success', 
            loginRes.body.includes("localStorage.setItem('landingPageVisited', 'true')")
        );

        // 12. Check register.html contains already-authenticated bypass & storage
        const regRes = await fetchUrl('/register.html');
        assert('register.html returns HTTP 200 OK', regRes.statusCode === 200);
        assert('register.html stores landingPageVisited upon registration success', 
            regRes.body.includes("localStorage.setItem('landingPageVisited', 'true')")
        );

        // 13. Check app.js route protection and logout behavior
        const appJsRes = await fetchUrl('/js/app.js');
        assert('app.js returns HTTP 200 OK', appJsRes.statusCode === 200);
        assert('app.js enforces route protection on unauthenticated protected routes', 
            appJsRes.body.includes('enforceRouteProtection') && appJsRes.body.includes('landingPageVisited')
        );
        assert('app.js preserves landingPageVisited on logout', 
            appJsRes.body.includes('logout()') && appJsRes.body.includes("localStorage.setItem(\"landingPageVisited\", \"true\")")
        );

        // 14. Check Clean URL routes
        const cleanRoutes = ['/landing', '/home', '/login', '/register', '/exchange-proposals', '/history', '/verify'];
        for (const route of cleanRoutes) {
            const res = await fetchUrl(route);
            assert(`Clean route ${route} resolves without 404/500 (Status: ${res.statusCode})`, res.statusCode === 200 || res.statusCode === 302);
        }

    } catch (err) {
        console.error('Test execution error:', err);
        failed++;
    }

    console.log('\n===============================================================');
    console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED                 `);
    console.log('===============================================================\n');

    process.exit(failed > 0 ? 1 : 0);
}

runLandingStartPageTests();
