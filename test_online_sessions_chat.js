/**
 * Comprehensive Test Suite for:
 * 1. Online Skill Exchange Sessions
 * 2. Zoom Integration (Server-to-Server OAuth & Graceful Fallback)
 * 3. Zero Credential Exposure
 * 4. Automatic System Message on Session Creation
 * 5. Share in Chat functionality & Session Cards
 * 6. Doubt flagging in Chat
 * 7. Exchange Notes CRUD
 * 8. Strict Authorization & Security Checks
 */

const http = require('http');

const BASE_URL = 'http://localhost:8080';

function request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            method,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(data);
                } catch (e) {
                    parsed = data;
                }
                resolve({ status: res.statusCode, data: parsed, headers: res.headers });
            });
        });

        req.on('error', reject);
        if (body) {
            req.write(typeof body === 'string' ? body : JSON.stringify(body));
        }
        req.end();
    });
}

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

async function runTests() {
    console.log("===================================================================");
    console.log("STARTING TEST SUITE: ONLINE SESSIONS + ZOOM + CHAT NOTES & DOUBTS");
    console.log("===================================================================\n");

    // 1. Authenticate as Student A (Harsh, ID 2)
    console.log("--- 1. Authenticate as Student A (Harsh) ---");
    const loginA = await request('POST', '/api/auth/login', {
        email: 'harsh@mgmmumbai.ac.in',
        password: 'password123'
    });
    assert(loginA.status === 200, "Student A logged in successfully");

    // 2. Student A sends a new ONLINE Exchange Proposal to Student B (Sejal)
    console.log("\n--- 2. Create and Accept ONLINE Exchange Request ---");
    const sendProp = await request('POST', '/api/exchange-requests', {
        receiverId: 3,
        skillOfferedId: 1,
        skillRequestedId: 4,
        learningMode: 'ONLINE',
        message: "Hi Sejal, let's learn online via Zoom!"
    });
    assert(sendProp.status === 200, "Created new ONLINE proposal");
    const targetReqId = sendProp.data.data.id;

    // Student B logs in and accepts the proposal
    await request('POST', '/api/auth/login', { email: 'sejal@mgmmumbai.ac.in', password: 'password123' });
    const acceptRes = await request('PUT', `/api/exchange-requests/${targetReqId}/accept`);
    assert(acceptRes.status === 200, `Online proposal #${targetReqId} accepted`);

    // 3. Unauthorized Student C (Raza, ID 4) cannot schedule session for this request
    console.log("\n--- 3. Authorization & RBAC on Scheduling ---");
    await request('POST', '/api/auth/login', { email: 'raza@mgmmumbai.ac.in', password: 'password123' });
    const forbidSched = await request('POST', '/api/online-sessions', {
        exchangeRequestId: targetReqId,
        title: "Malicious Schedule Attempt",
        scheduledDate: "2026-10-01",
        scheduledTime: "18:00",
        durationMinutes: 60
    });
    assert(forbidSched.status === 403, `Student C forbidden from scheduling session for request #${targetReqId} (403)`);

    // Switch back to Student A
    await request('POST', '/api/auth/login', { email: 'harsh@mgmmumbai.ac.in', password: 'password123' });

    // 4. Try scheduling for OFFLINE request #6 (must be rejected)
    console.log("\n--- 4. Verify Mode Validation (Online Only) ---");
    const offlineReq = await request('POST', '/api/online-sessions', {
        exchangeRequestId: 101, // Offline request
        title: "Should Fail",
        scheduledDate: "2026-10-01",
        scheduledTime: "18:00"
    });
    assert(offlineReq.status === 400 || offlineReq.status === 404, "Rejected scheduling online session for non-online exchange");

    // 5. Schedule Online Session for target request
    console.log("\n--- 5. Schedule Online Session (Zoom Meeting Created) ---");
    const scheduleRes = await request('POST', '/api/online-sessions', {
        exchangeRequestId: targetReqId,
        title: "Figma UI/UX & CSS Masterclass",
        scheduledDate: "2026-10-02",
        scheduledTime: "19:30",
        durationMinutes: 60,
        description: "Hands-on exploration of CSS grid and responsive Figma design systems."
    });
    assert(scheduleRes.status === 200, "Online session scheduled successfully (200 OK)");
    const newSession = scheduleRes.data.data;
    assert(newSession && newSession.id, "Session ID generated");
    assert(newSession.title === "Figma UI/UX & CSS Masterclass", "Session title saved correctly");
    assert(newSession.scheduledDate === "2026-10-02", "Scheduled date preserved");
    assert(newSession.scheduledTime === "19:30", "Scheduled time preserved");
    assert(newSession.status === "Scheduled", "Initial status is 'Scheduled'");
    assert(Boolean(newSession.zoomMeetingId), "Zoom meeting ID created");
    assert(typeof newSession.zoomJoinUrl === 'string' && newSession.zoomJoinUrl.includes('zoom.us'), "Zoom join URL generated");

    // 6. Security & Credential Check (Zero Leakage)
    console.log("\n--- 6. Zero Credential Exposure Check ---");
    const jsonString = JSON.stringify(scheduleRes.data);
    assert(!jsonString.includes("client_secret"), "No client_secret in API response");
    assert(!jsonString.includes("account_id"), "No account_id in API response");
    assert(!jsonString.includes("access_token"), "No access_token in API response");
    assert(!jsonString.includes("ZOOM_CLIENT_SECRET"), "No env secret in API response");

    // 7. Verify Automatic System Message created in conversation
    console.log("\n--- 7. Automatic System Message in Chat Conversation ---");
    const chatMsgs = await request('GET', '/api/messages/3');
    assert(chatMsgs.status === 200, "Fetched messages with partner 3 (Sejal)");
    const msgsList = chatMsgs.data.data;
    const sysMsg = msgsList.find(m => m.isSystem && m.messageText.includes("Online session scheduled for 2026-10-02 at 19:30"));
    assert(Boolean(sysMsg), "System message automatically added to chat: 'Online session scheduled for 2026-10-02 at 19:30.'");

    // 8. Participant can view online session details, unauthorized cannot
    console.log("\n--- 8. Session Inspection & IDOR Protection ---");
    const getSess = await request('GET', `/api/online-sessions/${newSession.id}`);
    assert(getSess.status === 200, "Participant can view session details");
    assert(getSess.data.data.zoomJoinUrl.includes("zoom.us"), "Join URL accessible to participant");

    // Student C tries to view Student A & B's session
    await request('POST', '/api/auth/login', { email: 'raza@mgmmumbai.ac.in', password: 'password123' });
    const forbidView = await request('GET', `/api/online-sessions/${newSession.id}`);
    assert(forbidView.status === 403, "Student C forbidden from viewing private session (403)");

    // Switch back to Student A
    await request('POST', '/api/auth/login', { email: 'harsh@mgmmumbai.ac.in', password: 'password123' });

    // 9. Update Session Status (Live -> Completed)
    console.log("\n--- 9. Session Status Updates ---");
    const updateLive = await request('PUT', `/api/online-sessions/${newSession.id}/status`, { status: "Live" });
    assert(updateLive.status === 200 && updateLive.data.data.status === "Live", "Session status updated to 'Live'");

    const updateCompleted = await request('PUT', `/api/online-sessions/${newSession.id}/status`, { status: "Completed" });
    assert(updateCompleted.status === 200 && updateCompleted.data.data.status === "Completed", "Session status updated to 'Completed'");

    // 10. Check Request Details endpoint includes onlineSession
    console.log("\n--- 10. Request Details & Enrichment ---");
    const reqDetails = await request('GET', `/api/exchange-requests/${targetReqId}/details`);
    assert(reqDetails.status === 200, `Fetched exchange request #${targetReqId} details`);
    assert(reqDetails.data.data.onlineSession !== null, "onlineSession is included in request details");
    assert(reqDetails.data.data.onlineSession.id === newSession.id, "Correct onlineSession attached");

    // 11. Send Doubt Message in Chat
    console.log("\n--- 11. Send Doubt Message in Chat ---");
    const doubtMsgRes = await request('POST', '/api/messages', {
        receiverId: 3,
        messageText: "How does CSS grid auto-fit differ from auto-fill in responsive breakpoints?",
        isDoubt: true
    });
    assert(doubtMsgRes.status === 200, "Doubt message posted successfully");
    assert(doubtMsgRes.data.data.isDoubt === true, "Message flagged with isDoubt: true");

    // Partner checks messages
    await request('POST', '/api/auth/login', { email: 'sejal@mgmmumbai.ac.in', password: 'password123' });
    const sejalMsgs = await request('GET', '/api/messages/2');
    const receivedDoubt = sejalMsgs.data.data.find(m => m.messageText.includes("CSS grid auto-fit"));
    assert(Boolean(receivedDoubt), "Partner received the doubt message");
    assert(receivedDoubt.isDoubt === true, "Partner sees isDoubt: true flag on message");

    // 12. Exchange Notes CRUD
    console.log("\n--- 12. Exchange Notes CRUD ---");
    const createNoteRes = await request('POST', '/api/exchange-notes', {
        partnerId: 2,
        exchangeRequestId: 3,
        topic: "Figma Component Variants",
        content: "1. Auto-layout properties\n2. Interactive hover states\n3. Exporting tokens as SVG"
    });
    assert(createNoteRes.status === 200, "Created exchange note");
    const noteId = createNoteRes.data.data.id;
    assert(Boolean(noteId), "Note ID generated");

    // List notes
    const listNotes = await request('GET', `/api/exchange-notes?partnerId=2`);
    assert(listNotes.status === 200, "Listed exchange notes for partner");
    assert(listNotes.data.data.some(n => n.id === noteId), "Newly created note is in the list");

    // Update note
    const updateNote = await request('PUT', `/api/exchange-notes/${noteId}`, {
        topic: "Figma Component Variants (Updated)",
        content: "1. Auto-layout\n2. Interactive states\n3. Exporting SVGs\n4. Doubt: how to nest frames properly?"
    });
    assert(updateNote.status === 200, "Note updated successfully");
    assert(updateNote.data.data.topic === "Figma Component Variants (Updated)", "Updated topic verified");

    // Student A tries to edit Sejal's note (should fail)
    await request('POST', '/api/auth/login', { email: 'harsh@mgmmumbai.ac.in', password: 'password123' });
    const forbidEditNote = await request('PUT', `/api/exchange-notes/${noteId}`, {
        topic: "Hacked Topic"
    });
    assert(forbidEditNote.status === 403, "Student A forbidden from editing Sejal's private note (403)");

    // Sejal deletes her note
    await request('POST', '/api/auth/login', { email: 'sejal@mgmmumbai.ac.in', password: 'password123' });
    const deleteNote = await request('DELETE', `/api/exchange-notes/${noteId}`);
    assert(deleteNote.status === 200, "Note deleted successfully");

    console.log("\n===================================================================");
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("===================================================================");

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error("Test execution error:", err);
    process.exit(1);
});
