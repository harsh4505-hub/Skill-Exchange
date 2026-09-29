/**
 * STUDENT SKILL EXCHANGE PLATFORM
 * Core Frontend JavaScript Client Library
 */

const API = {
    async get(endpoint) {
        try {
            const res = await fetch(endpoint, {
                credentials: 'include'
            });
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
                credentials: 'include',
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
                credentials: 'include',
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
            const res = await fetch(endpoint, {
                method: "DELETE",
                credentials: 'include'
            });
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
        enforceRouteProtection(true);
        loadGrokAssistant(CurrentUser);
    } else {
        CurrentUser = null;
        updateNavbarLoggedOut();
        enforceRouteProtection(false);
        if (typeof window.initGrokAssistant === 'function') window.initGrokAssistant(null);
    }
}

function loadGrokAssistant(user) {
    if (!user || !user.authenticated) return;
    if (typeof window.initGrokAssistant === 'function') {
        window.initGrokAssistant(user);
    } else {
        const s = document.createElement('script');
        s.src = '/js/grok-assistant.js';
        s.onload = () => {
            if (typeof window.initGrokAssistant === 'function') window.initGrokAssistant(user);
        };
        document.body.appendChild(s);
    }
}

function enforceRouteProtection(isAuthenticated) {
    const path = window.location.pathname.toLowerCase();
    const page = path.split("/").pop() || "index.html";

    // Public Pages (accessible without authentication)
    const isPublic = page === "landing.html" || page === "landing" ||
                     page === "login.html" || page === "login" ||
                     page === "register.html" || page === "register" ||
                     page === "verify-email.html" || page === "verify" ||
                     page === "forgot-password.html" || page === "links.html";

    const hasSeenLanding = localStorage.getItem("landingPageVisited") === "true" ||
                           localStorage.getItem("se_landing_viewed") === "true";

    if (isAuthenticated) {
        const role = (CurrentUser && CurrentUser.role) ? CurrentUser.role.toUpperCase() : '';
        const userIsAdmin = role.includes('ADMIN') || (CurrentUser && CurrentUser.isAdmin === true);

        // Never show Landing Page, Login, Register, or index to an authenticated user
        if (page === "landing.html" || page === "landing" ||
            (page === "login.html" && !window.location.search.includes("logout=true")) ||
            page === "register.html" || page === "index.html" || page === "home") {
            const targetDashboard = "dashboard.html";
            window.location.replace(targetDashboard);
        }
    } else {
        // If unauthenticated and attempting to access a protected page
        if (!isPublic) {
            if (!hasSeenLanding) {
                // New visitor on this browser/device -> Landing Page
                window.location.replace("landing.html");
            } else {
                // Returning visitor -> Login / Sign Up
                const redirectParam = (page !== "index.html" && page !== "landing.html") ? `?redirect=${encodeURIComponent(page)}` : "";
                window.location.replace(`login.html${redirectParam}`);
            }
        }
    }
}

function updateNavbarLoggedIn(user) {
    const userControls = document.getElementById("navbarUserControls");
    if (!userControls) return;

    const roleStr = (user.role || '').toUpperCase();
    const emailStr = (user.email || '').toLowerCase();
    const isSuperAdmin = roleStr === 'ROLE_SUPER_ADMIN' || roleStr === 'SUPER_ADMIN' || emailStr === 'harshtukaram45@gmail.com' || user.isSuperAdmin === true;
    const isAdmin = isSuperAdmin || roleStr === 'ROLE_ADMIN' || roleStr === 'ADMIN' || user.isAdmin === true;
    const roleLabel = isSuperAdmin ? 'SUPER ADMIN' : (isAdmin ? 'ADMIN' : 'STUDENT');
    const avatarSrc = user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId || user.id || 1}`;

    userControls.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            ${isAdmin ? `
            <!-- Direct Quick-Access Admin Panel Button (Staff Only) -->
            <a href="admin-dashboard.html" class="btn btn-sm btn-danger d-inline-flex align-items-center gap-1 shadow-sm border border-2 border-dark fw-bold text-white px-2 py-1" style="font-size:0.75rem;" title="${isSuperAdmin ? 'Open Super Admin Panel' : 'Open Admin Panel'}">
                <i class="bi ${isSuperAdmin ? 'bi-shield-lock-fill' : 'bi-shield-check'}"></i>
                <span class="d-none d-sm-inline">${isSuperAdmin ? 'Super Admin' : 'Admin Panel'}</span>
            </a>
            ` : ''}

            <!-- Notifications Dropdown -->
            <div class="dropdown">
                <button class="btn btn-outline-custom btn-sm position-relative p-2" type="button" id="navNotificationBtn" data-bs-toggle="dropdown" aria-expanded="false" title="Notifications" onclick="loadNavbarNotifications()">
                    <i class="bi bi-bell fs-6"></i>
                    <span id="navNotificationBadge" class="notification-badge d-none">0</span>
                </button>
                <div class="dropdown-menu dropdown-menu-end p-0 border border-2 border-dark" style="width: 340px; max-width: 90vw; box-shadow: 4px 4px 0 var(--border-color); border-radius: var(--radius-sm);" aria-labelledby="navNotificationBtn">
                    <div class="p-3 border-bottom border-2 border-dark d-flex align-items-center justify-content-between bg-light">
                        <div class="d-flex align-items-center gap-2">
                            <strong class="text-dark small text-uppercase" style="letter-spacing: 0.05em; font-family: var(--font-mono);">Notifications</strong>
                            <span class="badge bg-danger text-white rounded-pill" id="dropdownUnreadCount" style="font-size: 0.65rem;">0</span>
                        </div>
                        <button type="button" class="btn btn-sm btn-link text-decoration-none text-dark p-0 fw-bold small" onclick="markAllNotificationsRead(event)">
                            Mark all as read
                        </button>
                    </div>
                    <div id="navNotificationList" class="overflow-auto" style="max-height: 320px;">
                        <div class="text-center py-4 text-muted small">Click to load notifications</div>
                    </div>
                    <div class="p-2 border-top border-2 border-dark text-center bg-light">
                        <a href="notifications.html" class="small fw-bold text-dark text-decoration-underline">View Full Activity Feed &rarr;</a>
                    </div>
                </div>
            </div>

            <!-- Profile & Account Menu -->
            <div class="dropdown">
                <button class="btn btn-outline-custom btn-sm dropdown-toggle d-flex align-items-center gap-2 py-1 px-2" type="button" data-bs-toggle="dropdown">
                    <img src="${avatarSrc}" id="navUserAvatarImg" class="rounded-circle object-fit-cover border border-1 border-dark" width="28" height="28" style="aspect-ratio:1/1;" alt="User">
                    <span class="fw-bold text-dark small">${user.fullName || user.email}</span>
                    <span class="badge ${isSuperAdmin ? 'bg-dark text-white border border-light' : (isAdmin ? 'bg-danger text-white' : 'bg-primary text-white')} ms-1" style="font-size:0.62rem;">${roleLabel}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end mt-2 border border-2 border-dark" style="box-shadow: 4px 4px 0 var(--border-color);">
                    ${isAdmin ? `
                    <li><a class="dropdown-item py-2 fw-bold text-danger bg-danger-subtle border-bottom border-1 border-dark" href="admin-dashboard.html"><i class="bi bi-shield-lock-fill me-2 text-danger"></i>${isSuperAdmin ? 'Super Admin Panel' : 'Admin Panel'}</a></li>
                    ` : ''}
                    <li><a class="dropdown-item py-2" href="dashboard.html"><i class="bi bi-speedometer2 me-2 text-primary"></i>Dashboard</a></li>
                    <li><a class="dropdown-item py-2" href="profile.html"><i class="bi bi-person me-2 text-primary"></i>My Profile</a></li>
                    <li><a class="dropdown-item py-2" href="skills.html"><i class="bi bi-mortarboard me-2 text-primary"></i>My Skills</a></li>
                    <li><a class="dropdown-item py-2" href="matches.html"><i class="bi bi-stars me-2 text-danger"></i>Find Matches</a></li>
                    <li><a class="dropdown-item py-2" href="requests.html"><i class="bi bi-arrow-left-right me-2 text-primary"></i>Exchange Proposals</a></li>
                    <li><a class="dropdown-item py-2" href="chat.html"><i class="bi bi-chat-dots me-2 text-primary"></i>Messages</a></li>
                    <li><a class="dropdown-item py-2" href="kitaab-ghar.html"><i class="bi bi-book me-2 text-success"></i>Kitaab Ghar (Books & Notes)</a></li>
                    <li><a class="dropdown-item py-2" href="verification.html"><i class="bi bi-patch-check me-2 text-success"></i>Skill Verification</a></li>
                    <li><a class="dropdown-item py-2" href="exchange-history.html"><i class="bi bi-clock-history me-2 text-primary"></i>Exchange History</a></li>
                    <li><hr class="dropdown-divider border-dark"></li>
                    <li><a class="dropdown-item text-danger py-2 fw-bold" href="javascript:void(0)" onclick="logout()"><i class="bi bi-box-arrow-right me-2"></i>Sign Out</a></li>
                </ul>
            </div>
        </div>
    `;

    // Show student or admin navigation items in navbar
    const studentLinks = document.querySelectorAll(".nav-student-only");
    studentLinks.forEach(el => el.classList.remove("d-none"));

    const adminLinks = document.querySelectorAll(".nav-admin-only");
    adminLinks.forEach(el => {
        if (isAdmin) {
            el.classList.remove("d-none");
            el.style.display = "";
        } else {
            el.classList.add("d-none");
            el.style.display = "none";
        }
    });
}

function updateNavbarLoggedOut() {
    const userControls = document.getElementById("navbarUserControls");
    if (!userControls) return;

    userControls.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <a href="login.html" class="btn btn-outline-custom btn-sm px-3"><i class="bi bi-box-arrow-in-right me-1"></i>Login</a>
            <a href="register.html" class="btn btn-primary-custom btn-sm px-3"><i class="bi bi-person-plus me-1"></i>Sign Up</a>
        </div>
    `;

    // Hide auth-only links
    document.querySelectorAll(".nav-student-only, .nav-admin-only").forEach(el => el.classList.add("d-none"));
}

async function logout() {
    try {
        await API.post("/api/auth/logout", {});
    } catch (e) {}
    CurrentUser = null;
    try {
        localStorage.setItem("landingPageVisited", "true");
        localStorage.setItem("se_landing_viewed", "true");
    } catch (e) {}
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

// Interactive Notification System
async function loadNavbarNotifications() {
    const list = document.getElementById("navNotificationList");
    const countBadge = document.getElementById("dropdownUnreadCount");
    if (!list) return;

    list.innerHTML = '<div class="text-center py-3 text-muted small"><span class="spinner-border spinner-border-sm me-1"></span> Loading...</div>';

    const res = await API.get("/api/notifications");
    if (res && res.success && res.data && res.data.length > 0) {
        const unreadCount = res.data.filter(n => !n.isRead).length;
        if (countBadge) countBadge.innerText = unreadCount;
        const mainBadge = document.getElementById("navNotificationBadge");
        if (mainBadge) {
            if (unreadCount > 0) {
                mainBadge.innerText = unreadCount;
                mainBadge.classList.remove("d-none");
            } else {
                mainBadge.classList.add("d-none");
            }
        }

        list.innerHTML = res.data.slice(0, 8).map(n => {
            const isUnread = !n.isRead;
            const targetUrl = n.linkUrl || (n.type === 'EXCHANGE_REQUEST' ? 'requests.html' : (n.type === 'NEW_MESSAGE' ? 'chat.html' : (n.type && n.type.includes('VERIF') ? 'verification.html' : 'notifications.html')));
            return `
                <div class="p-2 px-3 border-bottom border-1 d-flex align-items-start gap-2 ${isUnread ? 'bg-light' : ''}" style="cursor: pointer; transition: background 0.15s;" onclick="handleNotificationClick(${n.id}, '${targetUrl}')" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='${isUnread ? '#f8fafc' : 'transparent'}'">
                    <div class="mt-1" style="font-size: 1.1rem;">
                        ${getNotificationIconHtml(n.type)}
                    </div>
                    <div class="flex-grow-1 overflow-hidden">
                        <div class="d-flex align-items-center justify-content-between gap-1">
                            <strong class="text-dark text-truncate small" style="font-size:0.82rem;">${escapeHtmlSafe(n.title)}</strong>
                            ${isUnread ? '<span class="badge bg-danger rounded-circle p-1" style="width:6px; height:6px;"></span>' : ''}
                        </div>
                        <p class="text-muted mb-0 small text-truncate" style="font-size:0.75rem;">${escapeHtmlSafe(n.message)}</p>
                        <small class="text-muted" style="font-family: var(--font-mono); font-size:0.68rem;">${formatTimeAgo(n.createdAt)}</small>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        if (countBadge) countBadge.innerText = '0';
        list.innerHTML = '<div class="text-center py-4 text-muted small"><i class="bi bi-bell-slash d-block fs-4 mb-1"></i>No notifications yet</div>';
    }
}

async function handleNotificationClick(id, targetUrl) {
    try {
        await API.put(`/api/notifications/${id}/read`);
    } catch (e) {}
    window.location.href = targetUrl;
}

async function markAllNotificationsRead(e) {
    if (e) e.stopPropagation();
    try {
        await API.put("/api/notifications/read-all");
        await loadNavbarNotifications();
    } catch (err) {
        console.error(err);
    }
}

function getNotificationIconHtml(type) {
    switch (type) {
        case 'EXCHANGE_REQUEST':
            return '<i class="bi bi-arrow-repeat text-primary"></i>';
        case 'VERIFICATION_APPROVED':
            return '<i class="bi bi-patch-check-fill text-success"></i>';
        case 'VERIFICATION_REJECTED':
            return '<i class="bi bi-x-circle-fill text-danger"></i>';
        case 'VERIFICATION_RESUBMISSION':
            return '<i class="bi bi-exclamation-triangle-fill text-warning"></i>';
        case 'NEW_MESSAGE':
            return '<i class="bi bi-chat-dots-fill text-info"></i>';
        case 'NEW_REVIEW':
            return '<i class="bi bi-chat-square-quote-fill text-primary"></i>';
        case 'ANNOUNCEMENT':
            return '<i class="bi bi-megaphone-fill text-danger"></i>';
        default:
            return '<i class="bi bi-info-circle-fill text-secondary"></i>';
    }
}

function escapeHtmlSafe(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatTimeAgo(dateString) {
    if (!dateString) return '';
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// Notification Polling
function startNotificationPolling() {
    if (!CurrentUser) return;

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
    setInterval(poll, 15000);
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

// Score rating UI helper (Professional numerical format: 4.8 / 5)
function renderStars(rating) {
    const score = Number(rating || 0).toFixed(1);
    return `<span class="badge bg-light text-dark border border-dark" style="font-family: var(--font-mono); font-size: 0.78rem;">${score} / 5</span>`;
}

// Automatically load and initialize the educational decorations & subtle grid system
if (typeof window !== 'undefined' && !window.SkillExchangeDecor) {
    const decorScript = document.createElement('script');
    decorScript.src = 'js/decorations.js';
    decorScript.defer = true;
    document.head.appendChild(decorScript);
}

// Global Password Visibility Toggle Helper (Accessible, Independent, Secure)
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    const icon = btn.querySelector('i');
    if (icon) {
        if (isPassword) {
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
            btn.setAttribute('aria-label', 'Hide password');
            btn.setAttribute('title', 'Hide password');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
            btn.setAttribute('aria-label', 'Show password');
            btn.setAttribute('title', 'Show password');
            btn.setAttribute('aria-pressed', 'false');
        }
    }
}
