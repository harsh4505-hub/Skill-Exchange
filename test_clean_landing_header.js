const http = require('http');

function fetchUrl(urlPath) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 8080,
            path: urlPath,
            method: 'GET'
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
        });
        req.on('error', err => reject(err));
        req.end();
    });
}

async function runHeaderTests() {
    console.log('===================================================================');
    console.log('  TESTING CLEAN LANDING PAGE HEADER REQUIREMENTS                   ');
    console.log('===================================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(desc, condition, details = '') {
        if (condition) {
            console.log(`  [PASS] ${desc}`);
            passed++;
        } else {
            console.error(`  [FAIL] ${desc} ${details ? '- ' + details : ''}`);
            failed++;
        }
    }

    try {
        const landingRes = await fetchUrl('/landing.html');
        assert('Landing page returns HTTP 200 OK', landingRes.statusCode === 200);

        const html = landingRes.body;

        // Extract <header class="landing-header ...">...</header>
        const headerMatch = html.match(/<header[\s\S]*?<\/header>/i);
        assert('Header element found in landing.html', !!headerMatch);

        const headerHtml = headerMatch ? headerMatch[0] : '';

        // 1. Branding on the left
        assert('Header contains SkillExchange branding and logo', 
            headerHtml.includes('SKILL') && 
            headerHtml.includes('EXCHANGE') && 
            headerHtml.includes('bi-arrow-left-right')
        );

        // 2. Far Right contains ONLY LOGIN and SIGN UP
        assert('Header contains LOGIN button', headerHtml.includes('LOGIN'));
        assert('Header contains SIGN UP button', headerHtml.includes('SIGN UP'));
        assert('LOGIN opens login.html', headerHtml.includes("login.html"));
        assert('SIGN UP opens register.html', headerHtml.includes("register.html"));

        // 3. Prohibited navigation items completely removed from header
        const prohibitedTabs = [
            'How It Works',
            'Learning Modes',
            'Verification',
            'Kitab Bhandar',
            'Pricing',
            'Skills Directory',
            'All Links',
            'Dashboard',
            'Find Matches',
            'My Exchanges',
            'Chat',
            'bi-bell',
            'navbar-toggler',
            'dropdown'
        ];

        prohibitedTabs.forEach(tab => {
            assert(`Prohibited item "${tab}" is NOT in landing header`, !headerHtml.includes(tab));
        });

        // 4. No authenticated user elements in landing header
        assert('No notification badge or bell in landing header', !headerHtml.includes('notification'));
        assert('No avatar image in landing header', !headerHtml.includes('avatar'));
        assert('No user profile controls in landing header', !headerHtml.includes('navbarUserControls'));

        // 5. Responsive structure: header uses d-flex justify-content-between with no middle nav
        assert('Landing header uses container d-flex justify-content-between', 
            headerHtml.includes('d-flex') && headerHtml.includes('justify-content-between')
        );
        assert('No <nav> links block in landing header', !headerHtml.includes('<nav'));

        // 6. Verify authenticated website (index.html) still preserves its navigation
        const indexRes = await fetchUrl('/index.html');
        assert('Main website index.html returns HTTP 200', indexRes.statusCode === 200);
        assert('Main website index.html still preserves "How It Works"', indexRes.body.includes('How It Works'));
        assert('Main website index.html still preserves "Learning Modes"', indexRes.body.includes('Learning Modes'));
        assert('Main website index.html still preserves "Kitab Bhandar"', indexRes.body.includes('Kitab Bhandar'));
        assert('Main website index.html still preserves "Pricing"', indexRes.body.includes('Pricing'));
        assert('Main website index.html still preserves "Skills Directory"', indexRes.body.includes('Skills Directory'));

    } catch (err) {
        console.error('Test execution error:', err);
        failed++;
    }

    console.log('\n===================================================================');
    console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED                       `);
    console.log('===================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
}

runHeaderTests();
