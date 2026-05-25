# Esco Loans System - Firebase Backend Setup Guide

## Overview
Your Esco Loans System is now connected to Firebase for:
- User authentication (Login/Sign Up)
- Cloud database (Firestore) for persistent data storage
- Real-time data synchronization

## Files Created/Modified

### New Files:
- **firebase-config.js** - Firebase configuration file
- **esco-firebase.js** - Complete Firebase-enabled version (backup)

### Modified Files:
- **esco.html** - Added authentication modal and Firebase script tags
- **esco.css** - Added authentication UI styles
- **esco.js** - Converted to use Firebase instead of localStorage

## Setup Instructions

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project" or select an existing one
3. Name your project (e.g., "Esco Loans")
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Get Firebase Credentials
1. In Firebase Console, click the gear icon ⚙️ → "Project settings"
2. Scroll to "Your apps" section
3. If no web app exists, click "Add app" and select "Web" (</>)
4. Copy the entire Firebase config object

### Step 3: Update firebase-config.js
Open `firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",           // From Firebase Console
    authDomain: "YOUR_AUTH_DOMAIN",   // e.g., "your-project.firebaseapp.com"
    projectId: "YOUR_PROJECT_ID",     // e.g., "your-project-id"
    storageBucket: "YOUR_STORAGE_BUCKET",     // e.g., "your-project.appspot.com"
    messagingSenderId: "YOUR_SENDER_ID",      // From Firebase Console
    appId: "YOUR_APP_ID"              // From Firebase Console
};
```

### Step 4: Enable Authentication
1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Email/Password" provider
3. Click "Save"

### Step 5: Create Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select region closest to you
5. Click "Create"

### Step 6: Set Firestore Security Rules (Important!)
For production, update your Firestore rules. Go to Firestore → Rules and set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Allow users to read/write their own loans
    match /loans/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Database Structure

### Users Collection (`/users/{userId}`)
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+254700000000",
  "createdAt": "2026-05-25T10:30:00Z",
  "totalLoans": 2,
  "totalLoanAmount": 150000
}
```

### Loans Collection (`/loans/{loanId}`)
```json
{
  "userId": "user123",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+254700000000",
  "loanCategory": "rent-loan",
  "loanAmount": 50000,
  "loanDuration": 12,
  "interestRate": 10,
  "facilitation_fee": 2000,
  "employmentStatus": "employed",
  "reason": "Need urgent rent payment",
  "dateApplied": "2026-05-25T10:30:00Z",
  "status": "Pending"
}
```

## Features

### User Authentication
- **Sign Up**: New users create account with name, email, password, and phone
- **Login**: Existing users log in with email and password
- **Logout**: Users can securely log out

### Loan Management
- **Apply for Loan**: Submit loan applications with automatic calculations
- **View Active Loans**: See all your loan applications in real-time
- **Edit Loans**: Modify existing loan applications
- **Delete Loans**: Remove loan applications
- **Auto-calculated Totals**: 
  - Principal + Interest + Kes. 2,000 (facilitation fee) = Total
  - Monthly payment automatically calculated

### Dashboard
- Total applications count
- Total loan amount distributed
- Approved loans count
- Pending loans count

## Testing the System

1. Open `esco.html` in your browser
2. Click "Sign Up" to create a new account
3. Enter your details:
   - Full Name
   - Email
   - Password (min 6 characters)
   - Phone Number
4. You'll be logged in automatically
5. Fill the loan application form:
   - Minimum: Kes. 50,000
   - Facilitation Fee: Kes. 2,000 (automatically added)
6. Click "Calculate & Apply"
7. Verify the summary and click "Confirm Application"
8. Your loan appears in "Your Active Loans" section

## Important Notes

⚠️ **Security Reminder:**
- Never commit `firebase-config.js` with real credentials to public repositories
- Use environment variables in production
- Enable authentication required for all Firestore operations
- Set proper security rules before deploying

🔒 **Best Practices:**
- Keep Firebase rules strict (test mode should not be used in production)
- Implement email verification for new users
- Add rate limiting to prevent abuse
- Monitor Firestore usage to manage costs

## Troubleshooting

### Users can't sign up
- Verify Email/Password authentication is enabled in Firebase Console
- Check browser console for error messages
- Ensure password is at least 6 characters

### Loans not saving
- Check Firestore is created and accessible
- Verify security rules allow write operations
- Check browser console for Firebase errors

### Real-time updates not working
- Ensure `onSnapshot` listeners are properly set up
- Check Firestore security rules
- Verify user is authenticated

## Support & Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

**Your Esco Loans System is now ready with a Firebase backend!** 🎉
