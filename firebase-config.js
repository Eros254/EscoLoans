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
    apiKey: "AIzaSyC8Ag7DkvawcbHwdKd4aR2QZgZAz4PhXQc",
    authDomain: "escoloans.firebaseapp.com",
    projectId: "escoloans",
    storageBucket: "escoloans.firebasestorage.app",
    messagingSenderId: "739698582341",
    appId: "1:739698582341:web:5395c67d60a2df89aa942c",
    measurementId: "G-729EQF43LD"
};

window.firebaseReady = false;
window.firebaseInitError = null;

// ===== Initialize Firebase =====
console.log('🔄 Initializing Firebase...');

try {
    // Check if already initialized
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized successfully');
    }

    // Get Auth and Firestore references
    window.firebaseAuth = firebase.auth();
    window.firebaseDb = firebase.firestore();

    // Enable offline persistence (don't set deprecated settings)
    window.firebaseDb.enablePersistence()
        .then(() => {
            console.log('✅ Firestore offline persistence enabled');
        })
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                console.warn('⚠️ Multiple tabs open - persistence disabled');
            } else if (err.code === 'unimplemented') {
                console.warn('⚠️ Persistence not supported');
            }
        });

    // Signal that Firebase is ready
    window.firebaseReady = true;
    window.firebaseInitError = null;
    console.log('✅ Firebase ready!');

} catch (error) {
    console.error('❌ Firebase error:', error);
    window.firebaseReady = false;
    window.firebaseInitError = {
        code: error.code || 'firebase/init-failed',
        message: error.message || 'Firebase failed to initialize.'
    };
}
