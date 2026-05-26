window.firebaseReady = false;
window.firebaseInitError = null;

initializeFirebase();

async function initializeFirebase() {
    console.log('Initializing Firebase configuration...');

    try {
        const response = await fetch('/api/firebase-config', {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw createFirebaseInitError(
                'firebase/config-fetch-failed',
                `Could not load Firebase config from /api/firebase-config (${response.status}).`
            );
        }

        const payload = await response.json();

        if (!payload || !payload.configured || !payload.firebaseConfig) {
            throw createFirebaseInitError(
                'firebase/config-missing',
                'Firebase environment variables are missing for this deployment.'
            );
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(payload.firebaseConfig);
            console.log('Firebase initialized successfully');
        }

        window.firebaseAuth = firebase.auth();
        window.firebaseDb = firebase.firestore();

        window.firebaseDb.enablePersistence()
            .then(() => {
                console.log('Firestore offline persistence enabled');
            })
            .catch((error) => {
                if (error.code === 'failed-precondition') {
                    console.warn('Multiple tabs open - persistence disabled');
                    return;
                }

                if (error.code === 'unimplemented') {
                    console.warn('Persistence not supported in this browser');
                    return;
                }

                console.warn('Firestore persistence error:', error);
            });

        window.firebaseReady = true;
        window.firebaseInitError = null;
        console.log('Firebase ready');
    } catch (error) {
        console.error('Firebase initialization error:', error);
        window.firebaseReady = false;
        window.firebaseInitError = {
            code: error.code || 'firebase/init-failed',
            message: error.message || 'Firebase failed to initialize.'
        };
    }
}

function createFirebaseInitError(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
}
