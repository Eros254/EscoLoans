// ===== Firebase Configuration Loader =====
// Loads public Firebase web config from the Vercel API endpoint.

window.firebaseReady = (async function initializeFirebase() {
    let response;
    let config;

    try {
        response = await fetch('/api/firebase-config', {
            headers: {
                Accept: 'application/json'
            }
        });
    } catch (error) {
        console.error('❌ Failed to reach Firebase config endpoint:', error);
        showFirebaseBanner('Firebase setup could not be loaded. Please try again later.');
        throw error;
    }

    if (!response.ok) {
        console.error('❌ Firebase config endpoint returned an error:', response.status);
        showFirebaseBanner('Firebase is not configured for this deployment yet.');
        throw new Error('Firebase config endpoint failed');
    }

    config = await response.json();

    if (!config.configured) {
        console.error('❌ Firebase environment variables are missing on the server.');
        showFirebaseBanner('Firebase is not configured for this deployment yet.');
        throw new Error('Firebase is not configured');
    }

    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(config.firebaseConfig);
        }

        const db = firebase.firestore();
        db.settings({
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
        });

        db.enablePersistence().catch((error) => {
            if (error.code === 'failed-precondition') {
                console.log('Multiple tabs open, persistence disabled');
            } else if (error.code === 'unimplemented') {
                console.log('Persistence not supported in this browser');
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
        showFirebaseBanner('Firebase failed to initialize. Check browser console for details.');
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
