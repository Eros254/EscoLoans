// ===== Firebase Configuration =====
// Project: EscoLoans
// Project ID: escoloans
// Project Number: 739698582341
// 
// ⚠️ IMPORTANT: Get your credentials from Firebase Console:
// 1. Go to https://console.firebase.google.com/
// 2. Select your project "EscoLoans"
// 3. Go to Settings (⚙️) → Project settings
// 4. Scroll to "Your apps" section
// 5. Click on your web app to reveal the config
// 6. Copy the firebaseConfig object below

const firebaseConfig = {
    // Replace these with your actual Firebase credentials from Console
    apiKey: "YOUR_API_KEY_HERE",                    // Find in Firebase Console
    authDomain: "escoloans.firebaseapp.com",       // Usually projectId.firebaseapp.com
    projectId: "escoloans",
    storageBucket: "escoloans.appspot.com",        // Usually projectId.appspot.com
    messagingSenderId: "739698582341",              // Your project number
    appId: "1:739698582341:web:YOUR_APP_ID",       // Get from Firebase Console
    measurementId: "YOUR_MEASUREMENT_ID"            // Optional, for Analytics
};

// ===== Initialize Firebase =====
window.firebaseReady = (async function initializeFirebase() {
    // Check if Firebase config is properly set
    const isConfigured = firebaseConfig.apiKey && 
                         !firebaseConfig.apiKey.includes('YOUR_') &&
                         firebaseConfig.projectId === 'escoloans';

    if (!isConfigured) {
        const errorMsg = '❌ Firebase credentials not configured. Please add them to firebase-config.js';
        console.error(errorMsg);
        console.error('Instructions:');
        console.error('1. Go to https://console.firebase.google.com/');
        console.error('2. Select project "escoloans"');
        console.error('3. Settings → Project settings');
        console.error('4. Copy config from "Your apps" section');
        console.error('5. Update firebaseConfig in this file');
        showFirebaseBanner(errorMsg);
        throw new Error('Firebase not configured');
    }

    try {
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('✓ Firebase initialized for project: escoloans');
        }

        // Get Firestore instance
        const db = firebase.firestore();
        
        // Configure Firestore settings
        db.settings({
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
        });

        // Enable offline persistence
        db.enablePersistence().catch((error) => {
            if (error.code === 'failed-precondition') {
                console.log('ℹ️ Multiple tabs open, persistence disabled');
            } else if (error.code === 'unimplemented') {
                console.log('ℹ️ Persistence not supported in this browser');
            } else {
                console.error('❌ Firestore persistence error:', error);
            }
        });

        console.log('✓ Firebase initialized successfully');
        return {
            auth: firebase.auth(),
            db
        };
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        showFirebaseBanner('Firebase failed to initialize. Check browser console.');
        throw error;
    }
})();

function showFirebaseBanner(message) {
    window.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('firebaseWarningBanner')) {
            return;
        }

        const errorDiv = document.createElement('div');
        errorDiv.id = 'firebaseWarningBanner';
        errorDiv.style.cssText = [
            'position: fixed',
            'top: 0',
            'left: 0',
            'right: 0',
            'background: #dc3545',
            'color: white',
            'padding: 16px 20px',
            'text-align: center',
            'font-weight: 700',
            'z-index: 9999'
        ].join(';');
        errorDiv.textContent = message;
        document.body.insertBefore(errorDiv, document.body.firstChild);
    });
}
