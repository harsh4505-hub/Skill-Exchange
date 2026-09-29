/**
 * test_landing_admin_kitaab_e2e.js
 * Comprehensive E2E test suite verifying:
 * 1. Public Landing Page header cleanliness & isolation (Logo + Login + Sign Up ONLY)
 * 2. Visitor routing rules (First-time visitor vs Returning visitor vs Authenticated user)
 * 3. Student Navigation isolation (Logo -> dashboard.html, Kitaab Ghar present, no Super Admin)
 * 4. Admin Panel Layout CSS & Responsive table scroll rules
 * 5. Admin Verification Dossier Endpoint & Inspection Modal data
 * 6. Student-Facing Kitaab Ghar API Endpoints (GET, POST, PUT, DELETE, My Listings)
 * 7. Kitaab Ghar Ownership Authorization (Student A can edit own; Student B blocked with 403)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080';

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  [PASS] ${message}`);
        passed++;
    } else {
        console.error(`  [FAIL] ${message}`);
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

function put(urlPath, data, cookie) {
    const url = new URL(urlPath, BASE_URL);
    const bodyStr = JSON.stringify(data);
    return request({
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(bodyStr),
            ...(cookie ? { 'Cookie': cookie } : {})
        }
    }, bodyStr);
}

function del(urlPath, cookie) {
    const url = new URL(urlPath, BASE_URL);
    return request({
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: 'DELETE',
        headers: cookie ? { 'Cookie': cookie } : {}
    });
}

function extractCookie(res) {
    const sc = res.headers['set-cookie'];
    if (!sc) return null;
    const cookie = Array.isArray(sc) ? sc[0] : sc;
    return cookie.split(';')[0];
}

async function runTests() {
    console.log('================================================================');
    console.log('  RUNNING COMPLETE E2E TEST SUITE: LANDING, NAVIGATION, ADMIN, DOSSIER, KITAAB GHAR');
    console.log('================================================================\n');

    // -------------------------------------------------------------
    // TEST SUITE 1: PUBLIC LANDING PAGE CONTENT & HEADER ISOLATION
    // -------------------------------------------------------------
    console.log('[TEST GROUP 1] Public Landing Page Header & Content Isolation');
    const landingRes = await get('/');
    assert(landingRes.statusCode === 200, 'GET / returns 200 OK');
    const landingHtml = landingRes.rawBody;

    // Verify root is landing page
    assert(landingHtml.includes('Peer-to-Peer Campus Learning Platform') || landingHtml.includes('Trade Skills'), 'GET / serves Landing page content');

    // Verify Header contains ONLY Logo + Login + Sign Up
    const headerMatch = landingHtml.match(/<header[\s\S]*?<\/header>/i);
    assert(headerMatch !== null, 'Landing page has a <header> element');
    if (headerMatch) {
        const headerContent = headerMatch[0];
        assert(headerContent.includes('LOGIN') || headerContent.includes('login.html'), 'Header contains LOGIN link/button');
        assert(headerContent.includes('SIGN UP') || headerContent.includes('sign-up') || headerContent.includes('register'), 'Header contains SIGN UP link/button');

        // Forbidden items in Public Landing Header
        assert(!headerContent.includes('How It Works'), 'Header does NOT contain "How It Works" tab');
        assert(!headerContent.includes('Learning Modes'), 'Header does NOT contain "Learning Modes" tab');
        assert(!headerContent.includes('Verification'), 'Header does NOT contain "Verification" tab');
        assert(!headerContent.includes('Kitab Bhandar'), 'Header does NOT contain "Kitab Bhandar" tab');
        assert(!headerContent.includes('Pricing'), 'Header does NOT contain "Pricing" tab');
        assert(!headerContent.includes('Skills Directory'), 'Header does NOT contain "Skills Directory" tab');
        assert(!headerContent.includes('All Links'), 'Header does NOT contain "All Links" directory dropdown');
        assert(!headerContent.includes('admin-dashboard'), 'Header does NOT contain Admin link');
        assert(!headerContent.includes('Super Admin'), 'Header does NOT contain Super Admin link');
    }

    // Verify Gateway scripts
    assert(landingHtml.includes('landingPageVisited') && landingHtml.includes('dashboard.html'), 'Landing page contains gateway script routing returning visitors');

    // -------------------------------------------------------------
    // TEST SUITE 2: STUDENT NAVBAR & ROUTING ISOLATION
    // -------------------------------------------------------------
    console.log('\n[TEST GROUP 2] Student Dashboard Navigation & Isolation');
    const dashRes = await get('/dashboard.html');
    assert(dashRes.statusCode === 200, 'GET /dashboard.html returns 200 OK');
    const dashHtml = dashRes.rawBody;

    // Verify Brand Logo links to dashboard.html, NOT index.html
    const brandMatch = dashHtml.match(/<a class="navbar-brand[^>]*href="([^"]*)"/i);
    assert(brandMatch && brandMatch[1] === 'dashboard.html', `Student Brand logo links to 'dashboard.html' (got: ${brandMatch ? brandMatch[1] : 'null'})`);

    // Verify Student Navbar has Kitaab Ghar
    assert(dashHtml.includes('kitaab-ghar.html') || dashHtml.includes('Kitaab Ghar'), 'Student navigation includes Kitaab Ghar');

    // Verify app.js role-based navbar enforcement
    const appJsPath = path.join(__dirname, 'src', 'main', 'resources', 'static', 'js', 'app.js');
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    assert(appJsContent.includes('.nav-admin-only'), 'app.js manages .nav-admin-only visibility');
    assert(appJsContent.includes('targetDashboard') && appJsContent.includes('dashboard.html'), 'app.js redirects authenticated non-admin students to dashboard.html');

    // -------------------------------------------------------------
    // TEST SUITE 3: ADMIN PANEL LAYOUT & RESPONSIVE TABLE CSS
    // -------------------------------------------------------------
    console.log('\n[TEST GROUP 3] Admin Panel Layout & Responsive Table Scroll Rules');
    const cssPath = path.join(__dirname, 'src', 'main', 'resources', 'static', 'css', 'style.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Verify overflow-x: hidden is NOT clipping admin-content-body
    const adminBodyCssMatch = cssContent.match(/\.admin-content-body\s*\{([^}]+)\}/);
    assert(adminBodyCssMatch !== null, 'Found .admin-content-body CSS rule');
    if (adminBodyCssMatch) {
        assert(!adminBodyCssMatch[1].includes('overflow-x: hidden'), '.admin-content-body does NOT have "overflow-x: hidden;"');
        assert(adminBodyCssMatch[1].includes('overflow-x: auto') || adminBodyCssMatch[1].includes('min-width: 0'), '.admin-content-body allows responsive overflow without clipping');
    }

    // Verify table responsive rules
    assert(cssContent.includes('.admin-view-pane .table-responsive') && cssContent.includes('overflow-x: auto'), 'CSS defines isolated .table-responsive scroll for admin panes');
    assert(cssContent.includes('.admin-view-pane .table') && cssContent.includes('min-width: 720px'), 'Admin tables have min-width: 720px for horizontal scrolling preservation');

    // -------------------------------------------------------------
    // TEST SUITE 4: ADMIN VERIFICATION INSPECTION DOSSIER
    // -------------------------------------------------------------
    console.log('\n[TEST GROUP 4] Admin Verification Dossier Endpoint & Modal Inspection');

    // Login as Admin
    const adminLoginRes = await post('/api/auth/login', {
        email: 'admin@mgmmumbai.ac.in',
        password: 'password123'
    });
    assert(adminLoginRes.statusCode === 200 && adminLoginRes.body.success, 'Admin login succeeds');
    const adminCookie = extractCookie(adminLoginRes);

    // Fetch verifications list to get an ID
    const verifListRes = await get('/api/admin/verifications', adminCookie);
    assert(verifListRes.statusCode === 200 && verifListRes.body.success, 'GET /api/admin/verifications returns 200 OK');
    const verifications = verifListRes.body.data || [];
    assert(verifications.length > 0, `Verifications list has ${verifications.length} items`);

    if (verifications.length > 0) {
        const testVerifId = verifications[0].id;
        console.log(`  Inspecting verification dossier for ID: ${testVerifId}`);

        // Fetch dossier details
        const dossierRes = await get(`/api/admin/verifications/${testVerifId}`, adminCookie);
        assert(dossierRes.statusCode === 200 && dossierRes.body.success, `GET /api/admin/verifications/${testVerifId} returns 200 OK`);
        
        const dossier = dossierRes.body.data;
        assert(dossier.student && dossier.student.name && dossier.student.email, 'Dossier includes Student profile (name, email, college)');
        assert(dossier.skill && dossier.skill.name, `Dossier includes Target Skill (${dossier.skill ? dossier.skill.name : 'none'})`);
        assert(dossier.project && dossier.project.title, `Dossier includes Compulsory Project proof (${dossier.project ? dossier.project.title : 'none'})`);
        assert(dossier.experience && (dossier.experience.role || dossier.experience.title), `Dossier includes Compulsory Experience proof (${dossier.experience ? (dossier.experience.role || dossier.experience.title) : 'none'})`);
        assert(dossier.certificate !== undefined, 'Dossier handles Certificate info cleanly (provided or optional note)');
    }

    // Verify Admin HTML has the Dossier Modal and handlers
    const adminDashRes = await get('/admin-dashboard.html', adminCookie);
    const adminDashHtml = adminDashRes.rawBody;
    assert(adminDashHtml.includes('adminVerificationDossierModal'), 'admin-dashboard.html contains #adminVerificationDossierModal markup');
    assert(adminDashHtml.includes('openVerificationDossierModal'), 'admin-dashboard.html contains openVerificationDossierModal function');
    assert(adminDashHtml.includes('renderDocumentViewer'), 'admin-dashboard.html contains renderDocumentViewer function for previewing images/docs');
    assert(adminDashHtml.includes('approveDossier') && adminDashHtml.includes('rejectDossier'), 'admin-dashboard.html contains approveDossier and rejectDossier actions');

    // -------------------------------------------------------------
    // TEST SUITE 5: STUDENT-FACING KITAAB GHAR MODULE & APIS
    // -------------------------------------------------------------
    console.log('\n[TEST GROUP 5] Student Kitaab Ghar Web Page & REST APIs');

    // Check student kitaab-ghar.html exists and is served
    const kitaabPageRes = await get('/kitaab-ghar.html');
    assert(kitaabPageRes.statusCode === 200, 'GET /kitaab-ghar.html returns 200 OK');
    const kitaabHtml = kitaabPageRes.rawBody;
    assert(kitaabHtml.includes('Kitaab Ghar') || kitaabHtml.includes('Campus Book & Notes Hub'), 'kitaab-ghar.html title/branding present');
    assert(kitaabHtml.includes('tab-books') && kitaabHtml.includes('tab-notes') && kitaabHtml.includes('tab-my-listings'), 'kitaab-ghar.html contains Books, Notes, and My Listings tabs');
    assert(kitaabHtml.includes('addListingModal') || kitaabHtml.includes('listItemModal'), 'kitaab-ghar.html contains Add Listing Modal for students');

    // Login as Student A (Harsh)
    const studentALogin = await post('/api/auth/login', {
        email: 'harsh@mgmmumbai.ac.in',
        password: 'password123'
    });
    assert(studentALogin.statusCode === 200 && studentALogin.body.success, 'Student A (Harsh) logs in successfully');
    const studentACookie = extractCookie(studentALogin);
    const studentAId = studentALogin.body.data.userId;

    // Test GET /api/kitab-ghar
    const getBooksRes = await get('/api/kitab-ghar', studentACookie);
    assert(getBooksRes.statusCode === 200 && getBooksRes.body.success, 'GET /api/kitab-ghar returns 200 OK');
    const initialItems = getBooksRes.body.data || [];
    assert(Array.isArray(initialItems), `Initial Kitaab Ghar items count: ${initialItems.length}`);

    // Test POST /api/kitab-ghar by Student A (Create a Book listing)
    const newBook = {
        title: 'Introduction to Algorithms 4th Edition (CLRS)',
        author: 'Thomas H. Cormen',
        subject: 'Design & Analysis of Algorithms',
        category: 'Computer Science & IT',
        department: 'Computer Science',
        semester: 'Semester 4',
        condition: 'Good',
        itemType: 'BOOK',
        description: 'Complete algorithm reference book with handwritten chapter bookmarks. Ready to swap for Python ML notes.',
        contactPreference: 'Chat on SkillExchange'
    };
    const createBookRes = await post('/api/kitab-ghar', newBook, studentACookie);
    assert(createBookRes.statusCode === 201 && createBookRes.body.success, 'POST /api/kitab-ghar creates new listing');
    const createdItem = createBookRes.body.data;
    assert(createdItem && createdItem.id, `Created listing received ID: ${createdItem ? createdItem.id : 'null'}`);
    assert(createdItem && createdItem.ownerId === studentAId, 'Listing ownerId matches Student A ID');
    assert(createdItem && createdItem.itemType === 'BOOK', 'Listing itemType is correctly saved as BOOK');

    // Test POST /api/kitab-ghar by Student A (Create a Notes listing)
    const newNotes = {
        title: 'Database Management Systems Handwritten Notes (Unit 1-5)',
        author: 'Harsh Vardhan',
        subject: 'DBMS',
        category: 'Computer Science & IT',
        department: 'Computer Science',
        semester: 'Semester 3',
        condition: 'Like New',
        itemType: 'NOTES',
        description: 'Comprehensive handwritten notes covering SQL, Normalization (1NF to BCNF), and Transaction concurrency.',
        contactPreference: 'Chat on SkillExchange'
    };
    const createNotesRes = await post('/api/kitab-ghar', newNotes, studentACookie);
    assert(createNotesRes.statusCode === 201 && createNotesRes.body.success, 'POST /api/kitab-ghar creates study notes listing');
    const createdNotesItem = createNotesRes.body.data;

    // Test GET /api/kitab-ghar/my-listings by Student A
    const myListingsRes = await get('/api/kitab-ghar/my-listings', studentACookie);
    assert(myListingsRes.statusCode === 200 && myListingsRes.body.success, 'GET /api/kitab-ghar/my-listings returns 200 OK');
    const studentAListings = myListingsRes.body.data || [];
    assert(studentAListings.some(item => item.id === createdItem.id), 'My listings contains the created Book');
    assert(studentAListings.some(item => item.id === createdNotesItem.id), 'My listings contains the created Notes');

    // Test PUT /api/kitab-ghar/:id (Student A updates own listing)
    const updateData = {
        title: 'Introduction to Algorithms 4th Edition (CLRS) - Revised',
        description: 'Updated description: Includes bonus flashcards for sorting algorithms.'
    };
    const updateRes = await put(`/api/kitab-ghar/${createdItem.id}`, updateData, studentACookie);
    assert(updateRes.statusCode === 200 && updateRes.body.success, 'Student A can update their own listing (200 OK)');
    assert(updateRes.body.data.title.includes('Revised'), 'Listing title was successfully updated');

    // -------------------------------------------------------------
    // TEST SUITE 6: KITAAB GHAR OWNERSHIP AUTHORIZATION
    // -------------------------------------------------------------
    console.log('\n[TEST GROUP 6] Kitaab Ghar Ownership Authorization (Anti-Tampering)');

    // Login as Student B (Sejal) to switch session to Student B
    const studentBLogin = await post('/api/auth/login', {
        email: 'sejal@mgmmumbai.ac.in',
        password: 'password123'
    });
    assert(studentBLogin.statusCode === 200 && studentBLogin.body.success, 'Student B (Sejal) logs in successfully');
    const studentBCookie = extractCookie(studentBLogin);

    // Student B attempts to UPDATE Student A's listing -> MUST BE 403 FORBIDDEN
    const maliciousUpdate = await put(`/api/kitab-ghar/${createdItem.id}`, {
        title: 'Hacked Title by Unauthorized User'
    }, studentBCookie);
    assert(maliciousUpdate.statusCode === 403, `Student B cannot edit Student A listing (HTTP 403 Forbidden, got: ${maliciousUpdate.statusCode})`);

    // Student B attempts to DELETE Student A's listing -> MUST BE 403 FORBIDDEN
    const maliciousDelete = await del(`/api/kitab-ghar/${createdItem.id}`, studentBCookie);
    assert(maliciousDelete.statusCode === 403, `Student B cannot delete Student A listing (HTTP 403 Forbidden, got: ${maliciousDelete.statusCode})`);

    // Switch session back to Student A (Harsh)
    await post('/api/auth/login', {
        email: 'harsh@mgmmumbai.ac.in',
        password: 'password123'
    });

    // Student A DELETES their own listing -> MUST BE 200 OK
    const legitDelete = await del(`/api/kitab-ghar/${createdNotesItem.id}`, studentACookie);
    assert(legitDelete.statusCode === 200 && legitDelete.body.success, 'Student A can delete their own listing (200 OK)');

    // Verify item was deleted from listings
    const verifyListings = await get('/api/kitab-ghar/my-listings', studentACookie);
    assert(!verifyListings.body.data.some(i => i.id === createdNotesItem.id), 'Deleted item no longer appears in listings');

    // -------------------------------------------------------------
    // TEST SUITE 7: CHAT PREFILL INTEGRATION FOR KITAAB GHAR SWAP
    // -------------------------------------------------------------
    console.log('\n[TEST GROUP 7] Chat & Swap Request Integration');
    const chatPageRes = await get('/chat.html', studentBCookie);
    assert(chatPageRes.statusCode === 200, 'GET /chat.html returns 200 OK');
    const chatHtml = chatPageRes.rawBody;
    assert(chatHtml.includes("urlParams.get('msg')") || chatHtml.includes("urlParams.get('partner')"), 'chat.html parses partner and pre-filled msg query params for book swaps');

    console.log('\n================================================================');
    console.log(`  E2E TEST SUMMARY: PASSED: ${passed}, FAILED: ${failed}`);
    console.log('================================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Test execution failed with error:', err);
    process.exit(1);
});
