/**
 * STUDENT SKILL EXCHANGE PLATFORM
 * Firebase Authentication Client Module
 * Supports 1-Click Google Sign-In & Firebase Auth Sync with Backend + Supabase
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase Project Configuration from your Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyBt40r_v3x_2zzeR-tRYO4lHGpq3rcxav4",
    authDomain: "skill-exchange-program-6647c.firebaseapp.com",
    projectId: "skill-exchange-program-6647c",
    storageBucket: "skill-exchange-program-6647c.firebasestorage.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Handle 1-Click Google Sign-In / Registration
 */
window.handleGoogleAuth = async function(btnElement) {
    let originalHtml = '';
    if (btnElement) {
        btnElement.disabled = true;
        originalHtml = btnElement.innerHTML;
        btnElement.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Connecting to Google...
        `;
    }

    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        if (typeof showAlert === 'function') {
            showAlert(`Google authentication verified for ${user.displayName || user.email}! Synchronizing session...`, "success");
        }

        const idToken = await user.getIdToken();

        // Send to backend to create or sync session + Supabase
        const payload = {
            email: user.email,
            fullName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || '',
            uid: user.uid,
            idToken: idToken
        };

        const res = await fetch('/api/auth/firebase-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data && data.success) {
            try {
                localStorage.setItem('landingPageVisited', 'true');
                localStorage.setItem('se_landing_viewed', 'true');
            } catch (e) {}
            if (typeof showAlert === 'function') {
                showAlert("Welcome! Redirecting to platform...", "success");
            }
            setTimeout(() => {
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect');
                const userRole = (data.data && data.data.role) || (data.user && data.user.role);
                const isStaff = userRole === 'ROLE_SUPER_ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'ROLE_ADMIN' || userRole === 'ADMIN';
                if (redirect && redirect !== 'index.html' && redirect !== 'landing.html' && redirect !== '/' && !redirect.includes('landing')) {
                    window.location.href = redirect;
                } else if (isStaff) {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 600);
        } else {
            throw new Error(data.message || "Failed to establish platform session.");
        }
    } catch (error) {
        console.error("Firebase Google Auth Error:", error);
        if (error.code === 'auth/popup-closed-by-user') {
            if (typeof showAlert === 'function') {
                showAlert("Google sign-in popup was closed before finishing.", "warning");
            }
        } else if (error.code === 'auth/popup-blocked') {
            if (typeof showAlert === 'function') {
                showAlert("Google sign-in popup was blocked by browser. Please allow popups.", "warning");
            }
        } else if (error.code === 'auth/configuration-not-found') {
            if (typeof showAlert === 'function') {
                showAlert("Google provider is not enabled yet in your Firebase Console! Go to Firebase Console ➔ Authentication ➔ Sign-in method, click Google, toggle Enable, and Save.", "warning");
            }
        } else {
            if (typeof showAlert === 'function') {
                showAlert("Google Sign-In failed: " + (error.message || "Unknown error"), "danger");
            }
        }
    } finally {
        if (btnElement) {
            btnElement.disabled = false;
            btnElement.innerHTML = originalHtml;
        }
    }
};

window.firebaseAuth = auth;
console.log("[FirebaseAuth] Initialized successfully with project skill-exchange-program-6647c");
