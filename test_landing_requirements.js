const http = require('http');

function fetchUrl(urlPath) {
    return new Promise((resolve, reject) => {
        http.get('http://localhost:8080' + urlPath, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        }).on('error', err => reject(err));
    });
}

async function verifyLandingPage() {
    console.log('====================================================');
    console.log('  TESTING STUDENT SKILL EXCHANGE LANDING PAGE       ');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(desc, condition, details = '') {
        if (condition) {
            console.log(`[PASS] ${desc}`);
            passed++;
        } else {
            console.error(`[FAIL] ${desc} - ${details}`);
            failed++;
        }
    }

    // 1. HTTP Status Check
    const landingRes = await fetchUrl('/landing.html');
    assert('landing.html returns HTTP 200 OK', landingRes.statusCode === 200);

    const landingCleanRes = await fetchUrl('/landing');
    assert('/landing clean URL rewrite returns HTTP 200 OK', landingCleanRes.statusCode === 200);

    const html = landingRes.body;

    // 2. Branding & Navigation
    assert('Brand logo and name present', html.includes('Skill<strong>Exchange</strong>') && html.includes('STUDENT NETWORK'));
    assert('Login button with proceedFromLanding present', html.includes("proceedFromLanding('login.html')") && html.includes('Log In'));
    assert('Sign Up button with proceedFromLanding present', html.includes("proceedFromLanding('register.html')") && html.includes('Sign Up'));

    // 3. Hero Section
    assert('Hero headline "Share Your Skills. Learn Something New." present', 
        html.includes('Share Your Skills.') && html.includes('Learn Something New.')
    );
    assert('Hero supporting text present', 
        html.includes('Connect with students who can teach what you want to learn')
    );
    assert('Primary CTA "Explore Skill Exchange" present', 
        html.includes('Explore Skill Exchange') && html.includes("proceedFromLanding('index.html')")
    );

    // 4. Barter Demonstration Visual
    assert('Reciprocal Barter Concept Visual Box present', 
        html.includes('RECIPROCAL EXCHANGE EXAMPLE') && html.includes('100% MATCH')
    );
    assert('Barter trade shows offered and returned skills', 
        html.includes('SKILL OFFERED') && html.includes('SKILL RETURNED')
    );

    // 5. How It Works (4 Steps)
    assert('How It Works Section heading present', html.includes('HOW THE PLATFORM WORKS'));
    assert('Step 01 Create Your Profile present', html.includes('01') && html.includes('Create Your Profile'));
    assert('Step 02 Discover Skills present', html.includes('02') && html.includes('Discover Skills'));
    assert('Step 03 Connect present', html.includes('03') && html.includes('Connect'));
    assert('Step 04 Exchange Knowledge present', html.includes('04') && html.includes('Exchange Knowledge'));

    // 6. Teach + Learn Sections
    assert('Skills I Can Teach section present', html.includes('Skills I Can Teach') && html.includes('Share the skills and knowledge you already have'));
    assert('Skills I Want to Learn section present', html.includes('Skills I Want to Learn') && html.includes('Discover skills you want to develop'));

    // 7. Skill Verification Rules (Exact project rules)
    assert('Skill Verification Section present', html.includes('VERIFIED SKILL CREDENTIALS'));
    assert('Projects COMPULSORY rule present', html.includes('Projects') && html.includes('COMPULSORY'));
    assert('Experience COMPULSORY rule present', html.includes('Experience') && html.includes('COMPULSORY'));
    assert('Certificate OPTIONAL rule present', html.includes('Certificate') && html.includes('OPTIONAL'));

    // 8. Final CTA Banner
    assert('Final CTA Banner present', html.includes('Ready to Exchange Knowledge on Campus?'));

    // 9. No Personal Names / No Fake Testimonials
    const personalNames = ['Aarav', 'Rahul', 'Harsh', 'Sejal', 'Raza', 'Udipti', 'John Doe', 'Jane Doe'];
    let foundPersonalName = false;
    for (const name of personalNames) {
        if (html.includes(name)) {
            foundPersonalName = true;
            console.error(`Found personal name in landing page: ${name}`);
        }
    }
    assert('No personal names or fake profiles found in landing page', !foundPersonalName);

    // 10. Once-Only Logic in index.html
    const indexRes = await fetchUrl('/index.html');
    assert('index.html returns HTTP 200 OK', indexRes.statusCode === 200);
    assert('index.html contains se_landing_viewed once-only check', 
        indexRes.body.includes('se_landing_viewed') && indexRes.body.includes("window.location.replace('landing.html')")
    );
    assert('landing.html contains authenticated bypass check', 
        html.includes('/api/auth/current-user') && html.includes("window.location.replace('index.html')")
    );

    console.log('\n====================================================');
    console.log(`  LANDING PAGE VERIFICATION: ${passed} PASSED, ${failed} FAILED `);
    console.log('====================================================\n');

    process.exit(failed > 0 ? 1 : 0);
}

verifyLandingPage().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
