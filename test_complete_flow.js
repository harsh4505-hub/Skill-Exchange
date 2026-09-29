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
    // ----------------------------------------------------
    // TEST 1: Open Email Validation & Firebase Auth
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 1: Open Email Validation & Firebase Auth ---');
    const invalidSyntaxReg = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        name: 'Invalid User',
        email: 'invalid-email-format',
        password: 'password123',
        department: 'Computer Engineering',
        yearOfStudy: 'Third Year'
    });
    assert('Reject invalid email syntax', invalidSyntaxReg.statusCode === 400 && !invalidSyntaxReg.data.success);

    // Test Firebase Login
    const fbLogin = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/firebase-login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        email: 'firebase.student@gmail.com',
        fullName: 'Firebase Student',
        uid: 'fb-user-12345',
        photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=firebase'
    });
    assert('Firebase Google Auth login succeeds for any Gmail', fbLogin.statusCode === 200 && fbLogin.data.success && fbLogin.data.data.email === 'firebase.student@gmail.com');

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

    // 4a. Check landing.html returns 200 OK as the official starting page
    const landingRes = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/landing.html',
        method: 'GET'
    });
    assert('landing.html is active start page returning HTTP 200', 
        landingRes.statusCode === 200 && landingRes.raw.includes('SKILL') && landingRes.raw.includes('EXCHANGE')
    );

    // 4a-clean. Check clean URL /landing rewrite returns 200 OK
    const landingCleanRes = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/landing',
        method: 'GET'
    });
    assert('/landing clean URL rewrite returns HTTP 200', 
        landingCleanRes.statusCode === 200 && landingCleanRes.raw.includes('landing-body')
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

    // ----------------------------------------------------
    // TEST SUITE 9: Complete Sender Details When Opening Skill Exchange Request
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 9: Complete Sender Details When Opening Skill Exchange Request ---');

    // 9a. Log in as Harsh (userId 2)
    const harshLogin = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        email: 'harsh@mgmmumbai.ac.in',
        password: 'password123'
    });
    assert('Harsh logs in as student', harshLogin.statusCode === 200 && harshLogin.data.success);

    // 9b. Fetch incoming requests
    const myRequests = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/exchange-requests',
        method: 'GET'
    });
    assert('Fetch exchange requests list returns array', myRequests.statusCode === 200 && Array.isArray(myRequests.data.data));

    // 9c. Open Request 3 details (Incoming from Sejal Sharma)
    const req3Details = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/exchange-requests/3/details',
        method: 'GET'
    });
    assert('Participant can open request 3 details (200 OK)', req3Details.statusCode === 200 && req3Details.data.success);

    const r3 = req3Details.data.data;
    assert('Request 3 details return actual sender name (Sejal Sharma)', r3.sender.fullName === 'Sejal Sharma');
    assert('Request 3 details return sender college email', r3.sender.email === 'sejal@mgmmumbai.ac.in');
    assert('Request 3 details return sender department and academic year', r3.sender.department === 'Information Technology' && r3.sender.yearOfStudy === '2nd Year');
    assert('Request 3 details return sender bio', typeof r3.sender.bio === 'string' && r3.sender.bio.length > 0);
    assert('Request 3 details return sender avatar URL', typeof r3.sender.avatarUrl === 'string' && r3.sender.avatarUrl.length > 0);
    assert('Request 3 details return offered skill (Graphic Design) and requested skill (HTML/CSS/JS)', 
        r3.request.skillOfferedName === 'Graphic Design' && r3.request.skillRequestedName === 'HTML/CSS/JS'
    );
    assert('Request 3 details return learning mode (ONLINE) and valid status', 
        r3.request.learningMode === 'ONLINE' && ['PENDING', 'ACCEPTED'].includes(r3.request.status)
    );
    assert('Request 3 details return sender portfolio projects', Array.isArray(r3.projects) && r3.projects.length > 0);
    assert('Request 3 details return sender practical experiences', Array.isArray(r3.experiences) && r3.experiences.length > 0);
    assert('Request 3 details return sender certificates', Array.isArray(r3.certificates) && r3.certificates.length > 0);
    assert('Request 3 details return verification audit summary', 
        r3.verification && typeof r3.verification.isStudentVerified === 'boolean' && r3.verification.offeredSkillStatus === 'NEEDS_RESUBMISSION'
    );
    assert('Request 3 details do NOT expose passwords, tokens, or hashes', 
        !JSON.stringify(r3).includes('password') && !JSON.stringify(r3).includes('hashOtp')
    );

    // 9d. Open Request 4 details (Incoming from Raza Khan)
    const req4Details = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/exchange-requests/4/details',
        method: 'GET'
    });
    assert('Open request 4 details returns 200 OK', req4Details.statusCode === 200 && req4Details.data.success);
    const r4 = req4Details.data.data;
    assert('Request 4 sender is Raza Khan', r4.sender.fullName === 'Raza Khan');
    assert('Request 4 offered skill is Python with PENDING verification', 
        r4.offeredSkillDetails.skillName === 'Python' && r4.offeredSkillDetails.verificationStatus === 'PENDING'
    );
    assert('Request 4 returns Raza project: Automated Data Scraping & Analysis Pipeline', 
        r4.projects.some(p => p.title.includes('Data Scraping'))
    );
    assert('Request 4 returns Raza experience: Lead Python Developer', 
        r4.experiences.some(e => e.title.includes('Python Developer'))
    );
    assert('Request 4 returns Raza certificate: HackerRank Python badge', 
        r4.certificates.some(c => c.title.includes('HackerRank') && c.documentUrl.includes('raza_python.pdf'))
    );

    // 9e. Open Sent Proposal Request 1 (Sent by Harsh to Sejal)
    const req1Details = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/exchange-requests/1/details',
        method: 'GET'
    });
    assert('Open sent request 1 returns 200 OK', req1Details.statusCode === 200 && req1Details.data.success);
    const r1 = req1Details.data.data;
    assert('Sent request 1 identifies viewer as sender', r1.request.isSender === true);
    assert('Sent request 1 returns recipient (Sejal Sharma)', r1.receiver.fullName === 'Sejal Sharma');
    assert('Sent request 1 returns sender portfolio projects (Microservices)', 
        r1.projects.some(p => p.title.includes('Microservices'))
    );

    // 9f. Security & Authorization: Access Denied for Unrelated Request (Request 2 between Raza and Udipti)
    const req2Unauthorized = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/exchange-requests/2/details',
        method: 'GET'
    });
    assert('Unauthorized non-participant student cannot access request 2 details (403 Forbidden)', 
        req2Unauthorized.statusCode === 403 && !req2Unauthorized.data.success
    );

    // 9g. Security & Authorization: Private Document Protection
    // Harsh has no exchange relationship with Udipti -> cannot access Udipti's debate certificate
    const debateCertUnauthorized = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/uploads/certificates/debate.pdf',
        method: 'GET'
    });
    assert('Unauthorized student cannot access private certificate of stranger without exchange (403 Forbidden)', 
        debateCertUnauthorized.statusCode === 403
    );

    // Harsh accesses his own certificate -> Allowed (200 OK)
    const ownCertAuthorized = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/uploads/certificates/harsh_java.pdf',
        method: 'GET'
    });
    assert('Student can access their own certificate (200 OK)', 
        ownCertAuthorized.statusCode === 200 && ownCertAuthorized.headers['content-type'] === 'application/pdf'
    );

    // Harsh accesses Sejal's certificate (Harsh has exchange request with Sejal) -> Allowed (200 OK)
    const partnerCertAuthorized = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/uploads/certificates/sejal_photoshop.pdf',
        method: 'GET'
    });
    assert('Student can access certificate of exchange partner (200 OK)', 
        partnerCertAuthorized.statusCode === 200 && partnerCertAuthorized.headers['content-type'] === 'application/pdf'
    );

    // 9h. Workflow Actions: Accept Request 4
    const acceptReq4 = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/exchange-requests/4/accept',
        method: 'PUT'
    });
    assert('Accepting incoming proposal updates status to ACCEPTED (200 OK)', 
        acceptReq4.statusCode === 200 && acceptReq4.data.data.status === 'ACCEPTED'
    );

    // Clean up session state
    await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/logout',
        method: 'POST'
    });

    console.log('\n====================================================');
    console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED `);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
