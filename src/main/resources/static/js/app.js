/**
 * STUDENT SKILL EXCHANGE PLATFORM
 * Core Frontend JavaScript Client Library
 */

const API = {
    async get(endpoint) {
        try {
            const res = await fetch(endpoint);
            return await res.json();
        } catch (err) {
            console.error("GET Error on " + endpoint, err);
            return { success: false, message: "Network error. Is the server running?" };
        }
    },

    async post(endpoint, data) {
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) {
            console.error("POST Error on " + endpoint, err);
            return { success: false, message: "Network error occurred" };
        }
    },

    async put(endpoint, data) {
        try {
            const res = await fetch(endpoint, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: data ? JSON.stringify(data) : null
            });
            return await res.json();
        } catch (err) {
            console.error("PUT Error on " + endpoint, err);
            return { success: false, message: "Network error occurred" };
        }
    },

    async delete(endpoint) {
        try {
            const res = await fetch(endpoint, { method: "DELETE" });
            return await res.json();
        } catch (err) {
            console.error("DELETE Error on " + endpoint, err);
            return { success: false, message: "Network error occurred" };
        }
    }
};

let CurrentUser = null;

// Initialize session state on every page load
document.addEventListener("DOMContentLoaded", async () => {
    await checkCurrentUser();
    setupNavigationState();
    startNotificationPolling();
});

async function checkCurrentUser() {
    const res = await API.get("/api/auth/current-user");
    if (res && res.success && res.data && res.data.authenticated) {
        CurrentUser = res.data;
        updateNavbarLoggedIn(CurrentUser);
    } else {
        CurrentUser = null;
        updateNavbarLoggedOut();
    }
}

function updateNavbarLoggedIn(user) {
    const userControls = document.getElementById("navbarUserControls");
    if (!userControls) return;

    const isAdmin = user.role === "ROLE_ADMIN";

    userControls.innerHTML = `
        <div class="d-flex align-items-center gap-3">
            ${!isAdmin ? `
            <a href="notifications.html" class="btn btn-light position-relative p-2 rounded-circle" title="Notifications">
                <i class="bi bi-bell text-primary-custom fs-5"></i>
                <span id="navNotificationBadge" class="notification-badge d-none">0</span>
            </a>
            ` : ''}

            <div class="dropdown">
                <button class="btn btn-light border dropdown-toggle d-flex align-items-center gap-2 rounded-pill px-3 py-1" type="button" data-bs-toggle="dropdown">
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}" class="rounded-circle" width="28" height="28" alt="User">
                    <span class="fw-semibold text-dark">${user.fullName || user.email}</span>
                    <span class="badge ${isAdmin ? 'bg-danger' : 'bg-primary'} ms-1" style="font-size:0.65rem;">${isAdmin ? 'ADMIN' : 'STUDENT'}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2">
                    ${!isAdmin ? `
                    <li><a class="dropdown-item py-2" href="dashboard.html"><i class="bi bi-speedometer2 me-2 text-primary-custom"></i>Dashboard</a></li>
                    <li><a class="dropdown-item py-2" href="profile.html"><i class="bi bi-person me-2 text-primary-custom"></i>My Profile</a></li>
                    <li><a class="dropdown-item py-2" href="skills.html"><i class="bi bi-mortarboard me-2 text-primary-custom"></i>My Skills</a></li>
                    <li><a class="dropdown-item py-2" href="matches.html"><i class="bi bi-stars me-2 text-pink-custom"></i>Find Matches</a></li>
                    <li><a class="dropdown-item py-2" href="requests.html"><i class="bi bi-arrow-left-right me-2 text-primary-custom"></i>Exchange Requests</a></li>
                    <li><a class="dropdown-item py-2" href="chat.html"><i class="bi bi-chat-dots me-2 text-primary-custom"></i>Messages</a></li>
                    <li><a class="dropdown-item py-2" href="verification.html"><i class="bi bi-patch-check me-2 text-success"></i>Skill Verification</a></li>
                    <li><a class="dropdown-item py-2" href="exchange-history.html"><i class="bi bi-clock-history me-2 text-primary-custom"></i>Exchange History</a></li>
                    ` : `
                    <li><a class="dropdown-item py-2" href="admin-dashboard.html"><i class="bi bi-shield-check me-2 text-danger"></i>Admin Control Panel</a></li>
                    `}
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger py-2" href="javascript:void(0)" onclick="logout()"><i class="bi bi-box-arrow-right me-2"></i>Sign Out</a></li>
                </ul>
            </div>
        </div>
    `;

    // Show student or admin navigation items in navbar
    const studentLinks = document.querySelectorAll(".nav-student-only");
    studentLinks.forEach(el => el.classList.remove("d-none"));

    const adminLinks = document.querySelectorAll(".nav-admin-only");
    adminLinks.forEach(el => {
        if (isAdmin) el.classList.remove("d-none");
    });
}

function updateNavbarLoggedOut() {
    const userControls = document.getElementById("navbarUserControls");
    if (!userControls) return;

    userControls.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <a href="login.html" class="btn btn-outline-custom">Sign In</a>
            <a href="register.html" class="btn btn-primary-custom">Get Started</a>
        </div>
    `;

    // Hide auth-only links
    document.querySelectorAll(".nav-student-only, .nav-admin-only").forEach(el => el.classList.add("d-none"));
}

async function logout() {
    await API.post("/api/auth/logout", {});
    CurrentUser = null;
    window.location.href = "login.html?logout=true";
}

function setupNavigationState() {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link").forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPath) {
            link.classList.add("active");
        }
    });
}

// Notification Polling
function startNotificationPolling() {
    if (!CurrentUser || CurrentUser.role === "ROLE_ADMIN") return;

    const poll = async () => {
        const res = await API.get("/api/notifications/unread-count");
        if (res && res.success) {
            const badge = document.getElementById("navNotificationBadge");
            if (badge) {
                if (res.data > 0) {
                    badge.innerText = res.data;
                    badge.classList.remove("d-none");
                } else {
                    badge.classList.add("d-none");
                }
            }
        }
    };

    poll();
    setInterval(poll, 15000); // Poll unread alerts every 15s
}

// Toast alerts helper
function showAlert(message, type = "success", containerId = "alertContainer") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
            <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    container.innerHTML = alertHtml;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Star rating UI helper
function renderStars(rating) {
    let stars = '';
    const rounded = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
        if (i <= rounded) {
            stars += '<i class="bi bi-star-fill text-warning me-1"></i>';
        } else {
            stars += '<i class="bi bi-star text-muted me-1"></i>';
        }
    }
    return `<span class="d-inline-flex align-items-center">${stars} <strong class="ms-1">${(rating || 0).toFixed(1)}</strong></span>`;
}
