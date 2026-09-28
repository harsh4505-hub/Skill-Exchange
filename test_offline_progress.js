const http = require('http');

function request(options, postData) {
    return new Promise((resolve, reject) => {
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
                resolve({ status: res.statusCode, headers: res.headers, body: parsed });
            });
        });
        req.on('error', reject);
        if (postData) {
            req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}

async function loginAs(email, password = 'password123') {
    const res = await request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email, password });
    return res;
}

async function runTests() {
    console.log("===================================================================");
    console.log("STARTING TEST SUITE: OFFLINE EXCHANGE PROGRESS TRACKING");
    console.log("===================================================================\n");

    let passed = 0;
    let failed = 0;

    function assert(cond, msg) {
        if (cond) {
            console.log(`  [PASS] ${msg}`);
            passed++;
        } else {
            console.error(`  [FAIL] ${msg}`);
            failed++;
        }
    }

    try {
        // Step 1: Login as Admin
        console.log("--- 1. Authenticate as Admin ---");
        const adminLogin = await loginAs('admin@mgmmumbai.ac.in');
        assert(adminLogin.status === 200 && adminLogin.body.success, "Admin logged in successfully");

        // Step 2: Check Pre-existing Offline Exchanges and Metrics
        console.log("\n--- 2. Check Offline Exchanges Metrics (Admin) ---");
        const metricsRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/offline-exchanges/metrics',
            method: 'GET'
        });
        assert(metricsRes.status === 200 && metricsRes.body.success, "Admin fetched offline metrics");
        const initialMetrics = metricsRes.body.data;
        console.log("     Initial metrics:", initialMetrics);
        assert(typeof initialMetrics.activeCount === 'number', "Active count is numeric");
        assert(typeof initialMetrics.overdueCount === 'number', "Overdue count is numeric");
        assert(initialMetrics.overdueCount >= 1, "Inactive exchange detected (overdueCount >= 1)");

        // Step 3: Verify Inactive Exchange Detection (Requirement 8)
        console.log("\n--- 3. Verify Overdue / Inactive Detection (Requirement 8) ---");
        const offlineListRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/offline-exchanges',
            method: 'GET'
        });
        assert(offlineListRes.status === 200 && offlineListRes.body.success, "Admin listed all offline exchanges");
        const overdueExchange = offlineListRes.body.data.find(e => e.isOverdue === true);
        assert(overdueExchange != null, "Found an offline exchange flagged with isOverdue=true");
        if (overdueExchange) {
            console.log(`     Overdue Exchange #${overdueExchange.id}: daysSinceLastActivity=${overdueExchange.daysSinceLastActivity}, statusLabel="${overdueExchange.statusLabel}"`);
            assert(overdueExchange.daysSinceLastActivity >= 7, "Overdue exchange is >= 7 days inactive");
            assert(overdueExchange.statusLabel === 'Progress update overdue', "Neutral status label is 'Progress update overdue'");
        }

        // Step 4: Login as Student A (Harsh, ID: 2) & Create new OFFLINE exchange request
        console.log("\n--- 4. Student A Creates OFFLINE Exchange Request ---");
        const studentALogin = await loginAs('harsh@mgmmumbai.ac.in');
        assert(studentALogin.status === 200 && studentALogin.body.success, "Student A logged in successfully");

        const createReqRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/exchange-requests',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            receiverId: 3, // Sejal
            skillOfferedId: 1, // Java
            skillRequestedId: 2, // React
            learningMode: 'OFFLINE',
            message: 'Let us meet at the College Library to exchange Java for React!'
        });
        assert(createReqRes.status === 200 && createReqRes.body.success, "Student A sent OFFLINE proposal");
        const newRequestId = createReqRes.body.data.id;
        console.log(`     Created Exchange Request ID: ${newRequestId}`);

        // Step 5: Login as Student B (Sejal, ID: 3) & Accept Request
        console.log("\n--- 5. Student B Accepts OFFLINE Request ---");
        const studentBLogin = await loginAs('sejal@mgmmumbai.ac.in');
        assert(studentBLogin.status === 200 && studentBLogin.body.success, "Student B logged in successfully");

        const acceptRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: `/api/exchange-requests/${newRequestId}/accept`,
            method: 'PUT'
        });
        assert(acceptRes.status === 200 && acceptRes.body.success, "Student B accepted the offline exchange proposal");

        // Step 6: Verify OfflineExchangeProgress Record was Created Automatically
        console.log("\n--- 6. Verify Offline Progress Record Auto-Creation ---");
        const progLookupRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: `/api/exchange-requests/${newRequestId}/offline-progress`,
            method: 'GET'
        });
        assert(progLookupRes.status === 200 && progLookupRes.body.success, "Fetched offline progress by request ID");
        const newOfflineProg = progLookupRes.body.data;
        const offlineProgId = newOfflineProg.id;
        console.log(`     Auto-created Offline Progress ID: ${offlineProgId}, Initial Stage: "${newOfflineProg.currentStage}", Pct: ${newOfflineProg.progressPercentage}%`);
        assert(newOfflineProg.currentStage === 'Exchange Accepted', "Initial stage is 'Exchange Accepted'");
        assert(newOfflineProg.progressPercentage === 0, "Initial progress is 0% (not automatically completed)");
        assert(newOfflineProg.status === 'ACTIVE', "Initial status is ACTIVE");

        // Step 7: Security Test - Unauthorized Student C (Raza, ID: 4) cannot view or update this offline exchange
        console.log("\n--- 7. Security & IDOR Enforcement ---");
        const studentCLogin = await loginAs('raza@mgmmumbai.ac.in');
        assert(studentCLogin.status === 200 && studentCLogin.body.success, "Student C logged in successfully");

        const unauthViewRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: `/api/offline-exchanges/${offlineProgId}`,
            method: 'GET'
        });
        assert(unauthViewRes.status === 403, "Student C forbidden from viewing unrelated offline exchange (403)");

        const unauthUpdateRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: `/api/offline-exchanges/${offlineProgId}/updates`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            sessionDate: '2026-09-29',
            progressPercentage: 50,
            topicsCovered: 'Hacking progress'
        });
        assert(unauthUpdateRes.status === 403, "Student C forbidden from submitting progress update (403)");

        // Step 8: Validation Test - Invalid Percentage and Empty Topics
        console.log("\n--- 8. Backend Input Validation ---");
        await loginAs('harsh@mgmmumbai.ac.in'); // Switch back to Student A

        const invalidPctRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: `/api/offline-exchanges/${offlineProgId}/updates`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            sessionDate: '2026-09-29',
            progressPercentage: 150, // Invalid > 100
            topicsCovered: 'Invalid test'
        });
        assert(invalidPctRes.status === 400, "Rejected invalid progressPercentage > 100 (400)");

        const emptyTopicsRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: `/api/offline-exchanges/${offlineProgId}/updates`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            sessionDate: '2026-09-29',
            progressPercentage: 30,
            topicsCovered: '   ' // Empty
        });
        assert(emptyTopicsRes.status === 400, "Rejected empty topicsCovered (400)");

        // Step 9: Scenario - Student submits first session update (30% - Java OOP basics)
        console.log("\n--- 9. Student Submits First Session Update (30%) ---");
        const update1Res = await request({
            hostname: 'localhost',
            port: 8080,
            path: `/api/offline-exchanges/${offlineProgId}/updates`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            sessionDate: '2026-09-29',
            stage: 'Learning in Progress',
            progressPercentage: 30,
            topicsCovered: 'Java OOP basics\nClasses and Objects',
            description: 'Conducted first offline session at Central Library. Reviewed class definitions and instantiated objects.',
            nextActivity: 'Inheritance and Polymorphism exercises',
            attachmentUrl: 'https://github.com/example/java-oop-notes'
        });
        assert(update1Res.status === 200 && update1Res.body.success, "Student A submitted 30% progress update");
        assert(update1Res.body.data.progressPercentage === 30, "Current progress updated to 30%");
        assert(update1Res.body.data.currentStage === 'Learning in Progress', "Stage updated to 'Learning in Progress'");

        // Step 10: Admin Inspects Progress Details
        console.log("\n--- 10. Admin Inspects Offline Progress Details (30%) ---");
        await loginAs('admin@mgmmumbai.ac.in'); // Switch to Admin
        const adminDetailRes1 = await request({
            hostname: 'localhost',
            port: 8080,
            path: `/api/offline-exchanges/${offlineProgId}`,
            method: 'GET'
        });
        assert(adminDetailRes1.status === 200 && adminDetailRes1.body.success, "Admin retrieved offline exchange detail");
        const detailData1 = adminDetailRes1.body.data;
        assert(detailData1.progressPercentage === 30, "Admin sees 30% progress");
        assert(detailData1.currentStage === 'Learning in Progress', "Admin sees stage 'Learning in Progress'");
        assert(detailData1.updates.length === 1, "Admin sees 1 recorded update");
        assert(detailData1.updates[0].topicsCovered.includes('Java OOP basics'), "Topics includes 'Java OOP basics'");

        // Step 11: Student submits second session update (60%)
        console.log("\n--- 11. Student Submits Second Session Update (60%) ---");
        await loginAs('sejal@mgmmumbai.ac.in'); // Switch to Student B
        const update2Res = await request({
            hostname: 'localhost',
            port: 8080,
            path: `/api/offline-exchanges/${offlineProgId}/updates`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            sessionDate: '2026-10-02',
            stage: 'Practice / Assignment',
            progressPercentage: 60,
            topicsCovered: 'Inheritance\nPolymorphism\nInterfaces',
            description: 'Deep dive into abstract classes and interfaces with peer code review.',
            nextActivity: 'Exception Handling & Mini Practice Project'
        });
        assert(update2Res.status === 200 && update2Res.body.success, "Student B submitted 60% progress update");
        assert(update2Res.body.data.progressPercentage === 60, "Current progress is 60%");

        // Step 12: Student submits final update reaching 100% -> Exchange Completed
        console.log("\n--- 12. Student Submits Final Update (100% - Completion) ---");
        await loginAs('harsh@mgmmumbai.ac.in'); // Switch to Student A
        const update3Res = await request({
            hostname: 'localhost',
            port: 8080,
            path: `/api/offline-exchanges/${offlineProgId}/updates`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            sessionDate: '2026-10-05',
            stage: 'Exchange Completed',
            progressPercentage: 100,
            topicsCovered: 'Exception Handling\nCollections Framework\nFinal Capstone Project Review',
            description: 'All offline sessions successfully completed. Both students fulfilled learning objectives.',
            nextActivity: 'Mutual rating and review'
        });
        assert(update3Res.status === 200 && update3Res.body.success, "Submitted 100% progress update");
        assert(update3Res.body.data.progressPercentage === 100, "Progress reached 100%");
        assert(update3Res.body.data.status === 'COMPLETED', "Offline exchange transitioned to COMPLETED");

        // Step 13: Admin Views Complete History & Updated Metrics
        console.log("\n--- 13. Admin Reviews Complete History and Metrics ---");
        await loginAs('admin@mgmmumbai.ac.in'); // Switch to Admin
        const adminDetailFinal = await request({
            hostname: 'localhost',
            port: 8080,
            path: `/api/offline-exchanges/${offlineProgId}`,
            method: 'GET'
        });
        assert(adminDetailFinal.status === 200 && adminDetailFinal.body.success, "Admin fetched complete final history");
        const finalDetail = adminDetailFinal.body.data;
        assert(finalDetail.progressPercentage === 100, "Final progress is 100%");
        assert(finalDetail.status === 'COMPLETED', "Status is COMPLETED");
        assert(finalDetail.updates.length === 3, "Timeline contains all 3 recorded session updates");

        const finalMetricsRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/offline-exchanges/metrics',
            method: 'GET'
        });
        assert(finalMetricsRes.status === 200, "Metrics fetched");
        console.log("     Updated metrics:", finalMetricsRes.body.data);
        assert(finalMetricsRes.body.data.completedCount >= 2, "Completed offline exchanges count incremented");

        // Step 14: Verify Web Pages Serve Cleanly
        console.log("\n--- 14. Verify HTML Pages Serve Cleanly ---");
        const adminPageRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/admin/offline-exchanges',
            method: 'GET'
        });
        assert(adminPageRes.status === 200, "GET /admin/offline-exchanges returned 200 OK");
        assert(typeof adminPageRes.body === 'string' && adminPageRes.body.includes('pane-offline-exchanges'), "Admin page contains pane-offline-exchanges");

        const requestsPageRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/requests',
            method: 'GET'
        });
        assert(requestsPageRes.status === 200, "GET /requests returned 200 OK");
        assert(typeof requestsPageRes.body === 'string' && requestsPageRes.body.includes('studentProgressModal'), "Requests page contains studentProgressModal");

        console.log("\n===================================================================");
        console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
        console.log("===================================================================");

        if (failed > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    } catch (err) {
        console.error("Test execution error:", err);
        process.exit(1);
    }
}

runTests();
