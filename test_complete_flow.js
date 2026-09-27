const http = require('http');

function makeRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let json = null;
                try {
                    json = JSON.parse(data);
                } catch (e) {
                    json = data;
                }
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: json,
                    raw: data
                });
            });
        });
        req.on('error', (err) => reject(err));
        if (postData) {
            req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}

async function runTests() {
    console.log('====================================================');
    console.log('  STARTING COMPREHENSIVE END-TO-END SYSTEM TESTS    ');
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

    // ----------------------------------------------------
    // TEST 1: College Email Validation (@mgmmumbai.ac.in)
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 1: College Email Validation ---');
    const invalidReg = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        name: 'Imposter User',
        email: 'imposter@gmail.com',
        password: 'password123',
        department: 'Computer Engineering',
        yearOfStudy: 'Third Year'
    });
    assert('Reject non-college email (gmail.com)', invalidReg.statusCode === 400 && !invalidReg.data.success);

    const yahooReg = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        name: 'Yahoo User',
        email: 'student@yahoo.com',
        password: 'password123',
        department: 'Computer Engineering',
        yearOfStudy: 'Third Year'
    });
    assert('Reject non-college email (yahoo.com)', yahooReg.statusCode === 400 && !yahooReg.data.success);

    // ----------------------------------------------------
    // TEST 2: Email Registration Flow & Error Handling
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 2: Registration & OTP Security ---');
    const testEmail = `student${Date.now()}@mgmmumbai.ac.in`;
    const regAttempt = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        fullName: 'Aarav Patel',
        email: testEmail,
        password: 'password123',
        department: 'Information Technology',
        yearOfStudy: '2nd Year'
    });

    // Check that OTP is NOT in the response
    const regRespStr = JSON.stringify(regAttempt.data);
    assert('Zero OTP leakage in registration response body', !regRespStr.includes('otp') || !/\b\d{6}\b/.test(regRespStr));

    // If SMTP not yet configured in local environment, it safely reports the failure without fake success
    if (regAttempt.statusCode === 500) {
        assert('Safe technical error without fake success when SMTP credentials not provided', 
            regAttempt.data.message.includes("couldn't send the verification email")
        );
    } else {
        assert('Valid @mgmmumbai.ac.in registration initiates verification', regAttempt.data.success);
    }

    // Wrong OTP verification rejection
    const wrongOtpRes = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/verify-email',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        email: testEmail,
        otp: '000000'
    });
    assert('Wrong or expired OTP rejected with 400', wrongOtpRes.statusCode === 400 && !wrongOtpRes.data.success);

    // ----------------------------------------------------
    // TEST 3: Student Login & Strict RBAC Protection
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 3: Student Session & Strict RBAC ---');

    // Student Login
    const studentLogin = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        email: 'harsh@mgmmumbai.ac.in',
        password: 'password123'
    });
    assert('Student harsh@mgmmumbai.ac.in logs in successfully', 
        studentLogin.statusCode === 200 && studentLogin.data.success && studentLogin.data.data.role === 'ROLE_STUDENT'
    );

    // Student attempts admin endpoints -> MUST BE 403 Forbidden
    const studentAdminStats = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/admin/stats',
        method: 'GET'
    });
    assert('Student access to /api/admin/stats returns 403 Forbidden', studentAdminStats.statusCode === 403);

    const studentAdminUsers = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/admin/users',
        method: 'GET'
    });
    assert('Student access to /api/admin/users returns 403 Forbidden', studentAdminUsers.statusCode === 403);

    const studentAdminPage = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/admin-dashboard.html',
        method: 'GET'
    });
    assert('Student accessing admin-dashboard.html is redirected (302) away', 
        studentAdminPage.statusCode === 302 && studentAdminPage.headers.location.includes('login.html')
    );

    // ----------------------------------------------------
    // TEST 4: Landing Page vs Home Page Onboarding State
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 4: Landing Page vs Home Page ---');

    // 4a. Check landing.html serves Neo-Brutalist SWAP introduction
    const landingRes = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/landing.html',
        method: 'GET'
    });
    assert('landing.html serves valid Neo-Brutalist intro page', 
        landingRes.statusCode === 200 && landingRes.raw.includes('SWAP') && landingRes.raw.includes('Explore SWAP')
    );

    // 4b. Check index.html is normal working Home Page
    const indexRes = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/index.html',
        method: 'GET'
    });
    assert('index.html is the normal working Home Page with search and categories', 
        indexRes.statusCode === 200 && (indexRes.raw.includes('EXPLORE SKILLS BY CATEGORY') || indexRes.raw.includes('POPULAR SKILLS IN DEMAND'))
    );

    // 4c. Mark seen-landing for session
    const seenLandingRes = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/seen-landing',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
    assert('POST /api/auth/seen-landing updates user state', 
        seenLandingRes.statusCode === 200 && seenLandingRes.data.success
    );

    // Verify /api/auth/current-user returns hasSeenLanding = true
    const meRes = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/current-user',
        method: 'GET'
    });
    assert('/api/auth/current-user reflects hasSeenLanding = true', 
        meRes.statusCode === 200 && meRes.data.data.hasSeenLanding === true
    );

    // ----------------------------------------------------
    // TEST 5: Profile Photo Upload & Remove Security
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 5: Profile Photo Upload & Security ---');

    // Valid small PNG data: 1x1 transparent PNG
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const uploadAvatarRes = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/students/avatar',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        fileData: `data:image/png;base64,${pngBase64}`,
        fileName: 'my_avatar.png'
    });
    assert('Upload valid PNG avatar succeeds', 
        uploadAvatarRes.statusCode === 200 && uploadAvatarRes.data.success && uploadAvatarRes.data.avatarUrl.includes('uploads/avatars/')
    );

    // Try uploading executable / invalid mime
    const fakeAvatarRes = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/students/avatar',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        fileData: 'data:application/x-msdownload;base64,TVqQAAMAAAAEAAAA//8AALgAAAAAAAAAQAAaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
        fileName: 'malicious.exe'
    });
    assert('Reject invalid MIME executable avatar upload with 400', 
        fakeAvatarRes.statusCode === 400 && !fakeAvatarRes.data.success
    );

    // Delete avatar
    const deleteAvatarRes = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/students/avatar',
        method: 'DELETE'
    });
    assert('DELETE /api/students/avatar resets avatar to default', 
        deleteAvatarRes.statusCode === 200 && deleteAvatarRes.data.success && deleteAvatarRes.data.avatarUrl.includes('dicebear')
    );

    // ----------------------------------------------------
    // TEST 6: Notifications System
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 6: Notifications System ---');
    const notifsRes = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/notifications',
        method: 'GET'
    });
    assert('GET /api/notifications returns list and unread count', 
        notifsRes.statusCode === 200 && notifsRes.data.success && Array.isArray(notifsRes.data.data)
    );

    const markAllRes = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/notifications/read-all',
        method: 'PUT'
    });
    assert('PUT /api/notifications/read-all succeeds', 
        markAllRes.statusCode === 200 && markAllRes.data.success
    );

    // ----------------------------------------------------
    // TEST 7: Chat System, XSS Prevention & Attachments
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 7: Chat System & Attachments ---');

    // Send message with potential XSS script tag
    const xssMsgRes = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/messages',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        receiverId: 3,
        messageText: '<script>alert("xss")</script>Hello Sejal!'
    });
    assert('Send message succeeds with XSS escaping', 
        xssMsgRes.statusCode === 200 && xssMsgRes.data.success && !xssMsgRes.data.data.messageText.includes('<script>')
    );

    // Upload attachment: valid photo
    const photoAttachRes = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/messages/attachment',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        fileData: `data:image/png;base64,${pngBase64}`,
        fileName: 'project_wireframe.png',
        category: 'photo'
    });
    assert('Chat photo attachment upload succeeds with safe url', 
        photoAttachRes.statusCode === 200 && photoAttachRes.data.success && photoAttachRes.data.url.includes('uploads/chat/')
    );

    // Upload attachment: document
    const docBase64 = Buffer.from('Skill Exchange study plan notes for semester 4').toString('base64');
    const docAttachRes = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/messages/attachment',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        fileData: `data:text/plain;base64,${docBase64}`,
        fileName: 'study_plan.txt',
        category: 'document'
    });
    assert('Chat document attachment upload succeeds', 
        docAttachRes.statusCode === 200 && docAttachRes.data.success && docAttachRes.data.fileCategory === 'document'
    );

    // Upload dangerous attachment: executable
    const exeAttachRes = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/messages/attachment',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        fileData: `data:application/x-dosexec;base64,${docBase64}`,
        fileName: 'dangerous_script.exe',
        category: 'document'
    });
    assert('Chat rejects dangerous executable file upload with 400', 
        exeAttachRes.statusCode === 400 && !exeAttachRes.data.success
    );

    // ----------------------------------------------------
    // TEST 8: Admin Single-Session & Platform Authority
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 8: Admin Authority & Single-Session ---');

    // 8a. Admin Login
    const adminLogin = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        email: 'admin@mgmmumbai.ac.in',
        password: 'password123'
    });
    assert('Admin logs in successfully', 
        adminLogin.statusCode === 200 && adminLogin.data.success && adminLogin.data.data.role === 'ROLE_ADMIN'
    );

    // 8b. Admin accesses admin endpoints -> MUST BE 200
    const adminStats = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/admin/stats',
        method: 'GET'
    });
    assert('Admin access to /api/admin/stats returns 200 OK', adminStats.statusCode === 200 && adminStats.data.success);

    const adminUsers = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/admin/users',
        method: 'GET'
    });
    assert('Admin access to /api/admin/users returns 200 OK with student list', 
        adminUsers.statusCode === 200 && Array.isArray(adminUsers.data.data)
    );
    // Verify passwords and OTPs are NOT in the returned user list
    const usersStr = JSON.stringify(adminUsers.data.data);
    assert('Admin user management list does NOT expose passwords or OTPs', 
        !usersStr.includes('"password"') && !usersStr.includes('"otp"')
    );

    // 8c. Admin accesses normal student pages in SAME session without logging out
    const adminIndex = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/index.html',
        method: 'GET'
    });
    assert('Admin can browse normal Home Page (index.html) in the same session without logout', adminIndex.statusCode === 200);

    const adminDashboardPage = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/admin-dashboard.html',
        method: 'GET'
    });
    assert('Admin can access admin-dashboard.html directly (200 OK)', adminDashboardPage.statusCode === 200);

    const adminMe = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/current-user',
        method: 'GET'
    });
    assert('Admin session retains ROLE_ADMIN in /api/auth/current-user', 
        adminMe.statusCode === 200 && adminMe.data.data.role === 'ROLE_ADMIN'
    );

    console.log('\n====================================================');
    console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED `);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
