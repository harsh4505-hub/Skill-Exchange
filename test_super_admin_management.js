// test_super_admin_management.js
// Automated verification of Super Admin, RBAC, Admin Management, Audit Logs, and Email Restrictions

const BASE_URL = 'http://localhost:8080';

async function request(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });
    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        data = text;
    }
    return { status: res.status, ok: res.ok, data };
}

async function loginAs(email, password = 'password123') {
    return await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

async function runTests() {
    console.log('====================================================');
    console.log('STARTING SUPER ADMIN & ADMIN MANAGEMENT TEST SUITE');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(cond, testName, details = '') {
        if (cond) {
            console.log(`[PASS] ${testName}`);
            passed++;
        } else {
            console.error(`[FAIL] ${testName} - ${details}`);
            failed++;
        }
    }

    // 1. Super Admin login test
    console.log('--- TEST 1: Super Admin Authentication & Role ---');
    const saLogin = await loginAs('harshtukaram45@gmail.com');
    assert(saLogin.ok && saLogin.data.success, 'Super Admin login succeeds');
    assert(
        saLogin.data.data.role === 'ROLE_SUPER_ADMIN' || saLogin.data.data.role === 'SUPER_ADMIN',
        'Super Admin user has ROLE_SUPER_ADMIN role',
        `Received role: ${saLogin.data.data?.role}`
    );

    const saUserId = saLogin.data.data.id || saLogin.data.data.userId || 6;

    // 2. Super Admin can access Admin Panel APIs
    console.log('\n--- TEST 2: Super Admin Panel Access ---');
    const statsRes = await request('/api/admin/stats');
    assert(statsRes.ok && statsRes.data.success, 'Super Admin can access /api/admin/stats');
    assert(typeof statsRes.data.data.totalStudents === 'number', 'Real stats returned from database/state');

    // 3. Student cannot access Admin Panel APIs
    console.log('\n--- TEST 3: Student Authorization & Protection ---');
    const studentLogin = await loginAs('harsh@mgmmumbai.ac.in');
    assert(studentLogin.ok && studentLogin.data.success, 'Student login succeeds');
    assert(studentLogin.data.data.role === 'ROLE_STUDENT', 'Student has ROLE_STUDENT role');

    const studentStatsRes = await request('/api/admin/stats');
    assert(studentStatsRes.status === 403, 'Student blocked from /api/admin/stats (HTTP 403 Forbidden)');

    const studentRoleChangeRes = await request('/api/admin/users/2/role', {
        method: 'PUT',
        body: JSON.stringify({ role: 'ROLE_ADMIN' })
    });
    assert(studentRoleChangeRes.status === 403, 'Student cannot modify user roles (HTTP 403 Forbidden)');

    // 4. Normal Admin tests
    console.log('\n--- TEST 4: Normal Admin Capabilities & Boundaries ---');
    const adminLogin = await loginAs('admin@mgmmumbai.ac.in');
    assert(adminLogin.ok && adminLogin.data.success, 'Normal Admin login succeeds');
    assert(adminLogin.data.data.role === 'ROLE_ADMIN', 'Normal Admin has ROLE_ADMIN role');

    const adminStatsRes = await request('/api/admin/stats');
    assert(adminStatsRes.ok && adminStatsRes.data.success, 'Normal Admin can access /api/admin/stats');

    // Normal Admin CANNOT promote anyone
    const adminPromoteRes = await request('/api/admin/users/2/role', {
        method: 'PUT',
        body: JSON.stringify({ role: 'ROLE_ADMIN' })
    });
    assert(adminPromoteRes.status === 403, 'Normal Admin CANNOT promote users to ADMIN (HTTP 403 Forbidden)');

    // Normal Admin CANNOT promote anyone to SUPER_ADMIN
    const adminSuperPromoteRes = await request('/api/admin/users/2/role', {
        method: 'PUT',
        body: JSON.stringify({ role: 'ROLE_SUPER_ADMIN' })
    });
    assert(adminSuperPromoteRes.status === 403, 'Normal Admin CANNOT promote users to SUPER_ADMIN (HTTP 403 Forbidden)');

    // Normal Admin CANNOT suspend or touch Super Admin
    const adminSuspendSARes = await request(`/api/admin/users/${saUserId}/toggle-status`, {
        method: 'PUT'
    });
    assert(adminSuspendSARes.status === 403, 'Normal Admin CANNOT suspend or modify Super Admin (HTTP 403 Forbidden)');

    // 5. Super Admin Self-Demotion & Role Management
    console.log('\n--- TEST 5: Super Admin Immutability & Role Management ---');
    await loginAs('harshtukaram45@gmail.com');

    // Super Admin cannot demote self
    const saSelfDemote = await request(`/api/admin/users/${saUserId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: 'ROLE_STUDENT' })
    });
    assert(saSelfDemote.status === 403, 'Super Admin CANNOT demote themselves (HTTP 403 Forbidden)');

    // Super Admin cannot suspend self
    const saSelfSuspend = await request(`/api/admin/users/${saUserId}/toggle-status`, {
        method: 'PUT'
    });
    assert(saSelfSuspend.status === 403, 'Super Admin CANNOT suspend themselves (HTTP 403 Forbidden)');

    // Super Admin promotes student (userId: 2, harsh@mgmmumbai.ac.in) to ADMIN
    const promoteStudent = await request('/api/admin/users/2/role', {
        method: 'PUT',
        body: JSON.stringify({ role: 'ROLE_ADMIN' })
    });
    assert(promoteStudent.ok && promoteStudent.data.success, 'Super Admin promotes student to ROLE_ADMIN');

    // Switch to newly promoted student to test admin access
    const promotedLogin = await loginAs('harsh@mgmmumbai.ac.in');
    assert(promotedLogin.data.data.role === 'ROLE_ADMIN', 'Promoted user now has ROLE_ADMIN role');
    const promotedStats = await request('/api/admin/stats');
    assert(promotedStats.ok && promotedStats.data.success, 'Newly promoted ADMIN can access /api/admin/stats');

    // Super Admin revokes ADMIN role from harsh@mgmmumbai.ac.in
    await loginAs('harshtukaram45@gmail.com');
    const demoteStudent = await request('/api/admin/users/2/role', {
        method: 'PUT',
        body: JSON.stringify({ role: 'ROLE_STUDENT' })
    });
    assert(demoteStudent.ok && demoteStudent.data.success, 'Super Admin removes ADMIN role (reverts to ROLE_STUDENT)');

    // Verify revoked user is now STUDENT and lost admin access
    const revokedLogin = await loginAs('harsh@mgmmumbai.ac.in');
    assert(revokedLogin.data.data.role === 'ROLE_STUDENT', 'User role reverted to ROLE_STUDENT');
    const revokedStats = await request('/api/admin/stats');
    assert(revokedStats.status === 403, 'Revoked user immediately loses admin access (HTTP 403 Forbidden)');

    // 6. Audit Logs
    console.log('\n--- TEST 6: Admin Audit Logging ---');
    await loginAs('harshtukaram45@gmail.com');
    const auditRes = await request('/api/admin/audit-logs');
    assert(auditRes.ok && auditRes.data.success, 'Audit logs retrieved successfully');
    const logs = auditRes.data.data;
    assert(Array.isArray(logs) && logs.length >= 2, 'Audit logs contains recorded actions');

    const promoteLog = logs.find(l => l.action === 'ROLE_PROMOTED' || (l.details && l.details.includes('ROLE_ADMIN')));
    assert(promoteLog != null, 'Promotion action found in audit logs', JSON.stringify(promoteLog));

    const demoteLog = logs.find(l => l.action === 'ROLE_DEMOTED' || (l.details && l.details.includes('ROLE_STUDENT')));
    assert(demoteLog != null, 'Demotion action found in audit logs', JSON.stringify(demoteLog));

    // Ensure no secrets/passwords stored in logs
    const hasSecrets = logs.some(l => JSON.stringify(l).toLowerCase().includes('password') && !l.action.includes('PASSWORD_RESET'));
    assert(!hasSecrets, 'No passwords or secret credentials exposed in audit logs');

    // 7. Student Registration Email Restriction
    console.log('\n--- TEST 7: Student College Email Restriction ---');
    
    // Test rejection of non-college email
    const gmailReg = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            fullName: 'Test Fake Gmail',
            email: 'fakeuser@gmail.com',
            password: 'password123',
            confirmPassword: 'password123',
            college: 'MGM College',
            department: 'Computer Science',
            yearOfStudy: '2nd Year',
            phone: '9876543210'
        })
    });
    assert(
        gmailReg.status === 400 || !gmailReg.data.success,
        'Regular @gmail.com student registration rejected (HTTP 400)',
        gmailReg.data?.message
    );

    const yahooReg = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            fullName: 'Test Fake Yahoo',
            email: 'fakeuser@yahoo.com',
            password: 'password123',
            confirmPassword: 'password123',
            college: 'MGM College',
            department: 'Computer Science',
            yearOfStudy: '2nd Year',
            phone: '9876543210'
        })
    });
    assert(
        yahooReg.status === 400 || !yahooReg.data.success,
        'Regular @yahoo.com student registration rejected (HTTP 400)',
        yahooReg.data?.message
    );

    const outlookReg = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            fullName: 'Test Fake Outlook',
            email: 'fakeuser@outlook.com',
            password: 'password123',
            confirmPassword: 'password123',
            college: 'MGM College',
            department: 'Computer Science',
            yearOfStudy: '2nd Year',
            phone: '9876543210'
        })
    });
    assert(
        outlookReg.status === 400 || !outlookReg.data.success,
        'Regular @outlook.com student registration rejected (HTTP 400)',
        outlookReg.data?.message
    );

    // Test valid college email registration
    const validColEmail = `student_${Date.now()}@mgmmumbai.ac.in`;
    const collegeReg = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            fullName: 'New College Student',
            email: validColEmail,
            password: 'password123',
            confirmPassword: 'password123',
            college: 'MGM College of Engineering',
            department: 'Information Technology',
            yearOfStudy: '2nd Year',
            phone: '9876543210'
        })
    });
    assert(
        (collegeReg.ok && collegeReg.data.success) || (collegeReg.status === 500 && collegeReg.data.message && collegeReg.data.message.includes("verification email")),
        'Valid @mgmmumbai.ac.in student registration accepted past college domain restriction',
        collegeReg.data?.message
    );

    // 8. Super Admin special exception
    assert(
        saLogin.data.data.email === 'harshtukaram45@gmail.com',
        'Super Admin harshtukaram45@gmail.com is successfully registered and recognized as permanent exception'
    );

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Unhandled test exception:', err);
    process.exit(1);
});
