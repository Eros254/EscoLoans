# Esco Loans System

A modern, cloud-based loan application platform designed for fast and accessible lending to people in urgent financial need.

## Features

✨ **User Authentication**
- Secure sign-up and login with Firebase
- Email/password authentication
- User profile management

💰 **Loan Management**
- Apply for loans with 7 different categories
- Real-time loan calculations
- Track loan applications
- Edit and delete applications
- Dashboard with statistics

📊 **Smart Calculations**
- Automatic interest calculation
- Mandatory Kes. 2,000 facilitation fee
- Monthly payment breakdown
- Customizable loan duration (1-60 months)

🔐 **Security & Data**
- Firebase Firestore cloud database
- Real-time data synchronization
- User-specific data filtering
- Offline persistence support

## Loan Categories

- 🏠 Rent Loan
- 💼 Business Loan
- 🎓 School Fees
- ✈️ Vacation Loan
- 🏥 Hospital Bill
- 📚 Education Fee
- 🆘 Emergency Loan

## Quick Start

### Prerequisites
- Web browser (Chrome, Firefox, Safari, Edge)
- Firebase account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/esco-loans.git
   cd EscoLoans
   ```

2. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Get your Firebase credentials

3. **Configure Firebase**
   - Open `firebase-config.js`
   - Replace placeholder values with your Firebase credentials:
     ```javascript
     const firebaseConfig = {
         apiKey: "YOUR_API_KEY",
         authDomain: "YOUR_PROJECT.firebaseapp.com",
         projectId: "YOUR_PROJECT_ID",
         storageBucket: "YOUR_PROJECT.appspot.com",
         messagingSenderId: "YOUR_SENDER_ID",
         appId: "YOUR_APP_ID"
     };
     ```

4. **Enable Firebase Services**
   - Go to **Authentication** → Enable "Email/Password"
   - Go to **Firestore Database** → Create database (test mode)
   - Set up security rules (see FIREBASE_SETUP.md)

5. **Open the Application**
   - Open `esco.html` in your web browser
   - Sign up or log in
   - Start applying for loans!

## Project Structure

```
EscoLoans/
├── esco.html              # Main application layout
├── esco.css               # Styling and responsive design
├── esco.js                # Application logic and Firebase integration
├── firebase-config.js     # Firebase configuration (needs credentials)
├── README.md              # This file
├── FIREBASE_SETUP.md      # Detailed Firebase setup guide
└── .gitignore             # Git ignore file
```

## How It Works

### User Journey

1. **Sign Up** → Create account with email, password, and phone
2. **Login** → Access personalized dashboard
3. **Apply** → Fill loan application form
4. **Calculate** → View instant calculations (interest + fee + total)
5. **Confirm** → Submit application to Firestore
6. **Track** → Monitor loan status (Pending/Approved/Rejected)

### Loan Calculation

```
Total = Principal + Interest + Facilitation Fee
Interest = (Principal × Rate × Duration) ÷ 100 ÷ 12
Monthly Payment = Total ÷ Duration

Example:
- Principal: Kes. 50,000
- Interest Rate: 10% per year
- Duration: 12 months
- Fee: Kes. 2,000

Interest = (50,000 × 10 × 12) ÷ 100 ÷ 12 = 5,000
Total = 50,000 + 5,000 + 2,000 = 57,000
Monthly = 57,000 ÷ 12 = 4,750
```

## Database Structure

### Firebase Firestore Collections

**Users Collection** (`/users/{userId}`)
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+254700000000",
  "createdAt": "2026-05-25T10:30:00Z",
  "totalLoans": 2,
  "totalLoanAmount": 150000
}
```

**Loans Collection** (`/loans/{loanId}`)
```json
{
  "userId": "user123",
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "loanCategory": "rent-loan",
  "loanAmount": 50000,
  "loanDuration": 12,
  "interestRate": 10,
  "employmentStatus": "employed",
  "reason": "Emergency rent payment",
  "dateApplied": "2026-05-25T10:30:00Z",
  "status": "Pending"
}
```

## Security

⚠️ **Important Security Notes:**

- **Never commit** `firebase-config.js` with real credentials to public repos
- Use **environment variables** in production
- Enable **email verification** for new users
- Set **strict Firestore security rules** before deployment
- Implement **rate limiting** to prevent abuse

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Authentication + Firestore)
- **Hosting**: Can be deployed to Firebase Hosting, Netlify, Vercel, etc.

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers

## Minimum Loan Requirements

| Requirement | Value |
|-------------|-------|
| Minimum Amount | Kes. 50,000 |
| Maximum Amount | Kes. 5,000,000 |
| Facilitation Fee | Kes. 2,000 (mandatory) |
| Min Duration | 1 month |
| Max Duration | 60 months (5 years) |
| Interest Rate Range | 1% - 30% |

## Troubleshooting

### Firebase Not Initialized
- ✅ Check browser console (F12)
- ✅ Verify `firebase-config.js` has real credentials
- ✅ Ensure Firebase scripts are loaded

### Can't Sign Up
- ✅ Verify Email/Password auth is enabled
- ✅ Password must be at least 6 characters
- ✅ Check Firestore security rules

### Loans Not Saving
- ✅ Verify Firestore database is created
- ✅ Check security rules allow write operations
- ✅ Verify user is authenticated

### Real-time Updates Not Working
- ✅ Check browser console for errors
- ✅ Verify Firestore listeners are active
- ✅ Check network connection

## Future Enhancements

- [ ] SMS/Email notifications
- [ ] Loan payment tracking
- [ ] Admin dashboard for approvals
- [ ] Loan repayment calculator
- [ ] Credit score integration
- [ ] Multiple payment methods
- [ ] Mobile app version
- [ ] Advanced analytics

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support & Resources

- 📖 [Firebase Documentation](https://firebase.google.com/docs)
- 📚 [Firestore Guide](https://firebase.google.com/docs/firestore)
- 🔐 [Firebase Authentication](https://firebase.google.com/docs/auth)
- 📝 [Detailed Setup Guide](FIREBASE_SETUP.md)

## Author

**Esco Loans Development Team**

Built with ❤️ for people in financial need.

---

**Last Updated:** May 25, 2026

For detailed Firebase setup instructions, see [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
