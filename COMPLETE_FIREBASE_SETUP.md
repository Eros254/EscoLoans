# Complete Your Firebase Setup - EscoLoans Project

Your Firebase project details:
- **Project Name**: EscoLoans
- **Project ID**: escoloans
- **Project Number**: 739698582341

## Step-by-Step: Get Your Web App Config

### 1. Go to Firebase Console
Visit: https://console.firebase.google.com/

### 2. Select Your Project
- Click on "EscoLoans" project from the list

### 3. Get Web App Credentials
- Click ⚙️ (Settings icon) in top-left
- Select "Project settings"
- Scroll down to "Your apps" section
- Look for your web app (if none exists, click `</> Add app`)

### 4. Copy Your Config
You should see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "escoloans.firebaseapp.com",
  projectId: "escoloans",
  storageBucket: "escoloans.appspot.com",
  messagingSenderId: "739698582341",
  appId: "1:739698582341:web:...",
  measurementId: "G-..."
};
```

### 5. Update firebase-config.js
Open `firebase-config.js` and replace these values:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",              // ← Replace
    authDomain: "escoloans.firebaseapp.com",
    projectId: "escoloans",
    storageBucket: "escoloans.appspot.com",
    messagingSenderId: "739698582341",
    appId: "1:739698582341:web:YOUR_APP_ID", // ← Replace
    measurementId: "YOUR_MEASUREMENT_ID"      // ← Optional
};
```

### 6. Enable Firebase Services

#### Enable Authentication
1. Go to "Authentication" in left sidebar
2. Click "Get started"
3. Click "Email/Password"
4. Enable it and click "Save"

#### Enable Firestore
1. Go to "Firestore Database" in left sidebar
2. Click "Create database"
3. Start in **Test mode** (development)
4. Choose region close to you
5. Click "Create"

#### Update Firestore Security Rules
Go to Firestore → Rules tab and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write only their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Users can create loans and read/write their own loans
    match /loans/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

Click "Publish" to save.

## Testing Your Setup

### 1. Open esco.html
Open the file in your browser

### 2. Check Console
Press `F12` or `Ctrl+Shift+I` to open Developer Console

### 3. You should see:
✓ Firebase initialized successfully

### 4. Try to Sign Up
- Click "Sign Up" tab
- Create a test account
- You should be logged in automatically

### 5. Check Firestore
- Go to Firestore in Firebase Console
- You should see "users" collection with your new user

## Troubleshooting

### "Firebase credentials not configured"
- Copy `apiKey` and `appId` from Firebase Console
- Update firebase-config.js
- Refresh browser

### "Firebase initialization error"
- Check browser console (F12)
- Verify firebaseConfig values are correct
- Make sure no placeholder values remain

### Can't sign up
- Check Authentication is enabled in Firebase
- Verify Firestore database exists
- Check security rules are published

### Data not saving
- Verify Firestore database exists
- Check security rules are correct
- Look at Firestore "Logs" tab for errors

## Important Security Notes

⚠️ **DO NOT commit firebase-config.js with real credentials to public repos!**

When ready for production:
1. Create environment variables for credentials
2. Use a backend server to deliver config securely
3. Or use Firebase hosting with automatic environment setup

## Commit Your Configuration

Once Firebase is set up:

```bash
# Add changes
git add .

# Commit
git commit -m "Configure Firebase for EscoLoans project

- Project: EscoLoans (escoloans)
- Authentication: Email/Password enabled
- Firestore: Database created with security rules
- Ready for testing"

# Push to GitHub
git push origin master
```

## Next Steps

1. ✅ Complete firebase-config.js setup
2. ✅ Enable Authentication
3. ✅ Create Firestore database
4. ✅ Set security rules
5. Test sign up and loan application
6. Commit and push to GitHub

Need help? Check the browser console for detailed error messages!
