// ===== Esco Loans System - JavaScript with Firebase Backend ===== //

// Loan categories with descriptions
const LOAN_CATEGORIES = {
    'rent-loan': 'Rent Loan',
    'business-loan': 'Business Loan',
    'school-fees': 'School Fees',
    'vacation-loan': 'Vacation Loan',
    'hospital-bill': 'Hospital Bill',
    'education-fee': 'Education Fee',
    'emergency-loan': 'Emergency Loan'
};

const MIN_LOAN_AMOUNT = 50000;
const FACILITATION_FEE = 2000;

// Global user reference
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupAuthListeners();
    setupApplicationListeners();
    monitorAuthState();
});

// ===== Authentication State Monitoring =====
function monitorAuthState() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is logged in
            currentUser = user;
            showMainApp();
            loadUserData(user.uid);
        } else {
            // User is logged out
            currentUser = null;
            showAuthModal();
        }
    });
}

// ===== Show/Hide Auth Modal and Main App =====
function showAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

function showMainApp() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
}

// ===== Authentication Event Listeners =====
function setupAuthListeners() {
    // Tab switching
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
        btn.addEventListener('click', switchAuthTab);
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Sign up form
    document.getElementById('signupForm').addEventListener('submit', handleSignup);

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// ===== Switch Auth Tabs =====
function switchAuthTab(e) {
    const tabName = e.target.dataset.tab;

    // Remove active class from all buttons and content
    document.querySelectorAll('.auth-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to clicked button and corresponding content
    e.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');

    // Clear error messages
    document.getElementById('loginError').textContent = '';
    document.getElementById('signupError').textContent = '';
}

// ===== Handle Login =====
function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorElement = document.getElementById('loginError');

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            // Clear form
            document.getElementById('loginForm').reset();
            errorElement.textContent = '';
        })
        .catch((error) => {
            errorElement.textContent = error.message;
        });
}

// ===== Handle Sign Up =====
function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const phone = document.getElementById('signupPhone').value;
    const errorElement = document.getElementById('signupError');

    if (password.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters long';
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Save user profile to Firestore
            return firebase.firestore().collection('users').doc(user.uid).set({
                fullName: name,
                email: email,
                phone: phone,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                totalLoans: 0,
                totalLoanAmount: 0
            }).then(() => {
                // Update auth profile
                return user.updateProfile({
                    displayName: name
                });
            });
        })
        .then(() => {
            // Clear form
            document.getElementById('signupForm').reset();
            errorElement.textContent = '';
        })
        .catch((error) => {
            errorElement.textContent = error.message;
        });
}

// ===== Handle Logout =====
function handleLogout() {
    firebase.auth().signOut()
        .then(() => {
            currentUser = null;
            document.getElementById('loanForm').reset();
            hideSummary();
        })
        .catch((error) => {
            alert('Error logging out: ' + error.message);
        });
}

// ===== Load User Data =====
function loadUserData(userId) {
    firebase.firestore().collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                const greeting = `Welcome, ${userData.fullName}!`;
                document.getElementById('userGreeting').textContent = greeting;

                // Populate email field
                document.getElementById('email').value = userData.email;
                document.getElementById('phone').value = userData.phone;
                document.getElementById('fullName').value = userData.fullName;
            }
        })
        .catch((error) => {
            console.error('Error loading user data:', error);
        });

    // Load applications from Firestore
    loadApplicationsFromFirestore(userId);
}

// ===== Application Event Listeners =====
function setupApplicationListeners() {
    const loanForm = document.getElementById('loanForm');
    const confirmBtn = document.getElementById('confirmBtn');
    const editBtn = document.getElementById('editBtn');

    loanForm.addEventListener('submit', handleLoanSubmit);
    confirmBtn.addEventListener('click', confirmApplication);
    editBtn.addEventListener('click', editApplication);

    // Real-time calculation
    document.getElementById('loanAmount').addEventListener('input', calculateLoan);
    document.getElementById('loanDuration').addEventListener('input', calculateLoan);
    document.getElementById('interestRate').addEventListener('input', calculateLoan);
}

// ===== Form Validation =====
function validateLoanForm(formData) {
    const errors = [];

    // Check minimum amount
    if (formData.loanAmount < MIN_LOAN_AMOUNT) {
        errors.push(`Loan amount must be at least Kes. ${MIN_LOAN_AMOUNT.toLocaleString()}`);
    }

    // Check maximum amount
    if (formData.loanAmount > 5000000) {
        errors.push('Loan amount cannot exceed Kes. 5,000,000');
    }

    // Validate duration
    if (formData.loanDuration < 1 || formData.loanDuration > 60) {
        errors.push('Loan duration must be between 1 and 60 months');
    }

    // Validate interest rate
    if (formData.interestRate < 1 || formData.interestRate > 30) {
        errors.push('Interest rate must be between 1% and 30%');
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        errors.push('Please enter a valid email address');
    }

    // Validate phone
    if (formData.phone.replace(/\D/g, '').length < 10) {
        errors.push('Please enter a valid phone number');
    }

    return errors;
}

// ===== Calculate Loan Amount =====
function calculateLoan() {
    const amount = parseFloat(document.getElementById('loanAmount').value) || 0;
    const duration = parseInt(document.getElementById('loanDuration').value) || 0;
    const rate = parseFloat(document.getElementById('interestRate').value) || 0;

    if (amount < MIN_LOAN_AMOUNT || duration < 1) {
        hideSummary();
        return;
    }

    // Simple Interest Formula: I = P * R * T / 100
    const totalInterest = (amount * rate * duration) / (12 * 100);
    const totalWithInterest = amount + totalInterest;
    const totalAmount = totalWithInterest + FACILITATION_FEE;
    const monthlyPayment = totalAmount / duration;

    updateSummary({
        principal: amount,
        duration: duration,
        rate: rate,
        interest: totalInterest,
        facilitation: FACILITATION_FEE,
        total: totalAmount,
        monthly: monthlyPayment
    });
}

// ===== Update Summary Display =====
function updateSummary(data) {
    document.getElementById('summaryCategory').textContent = 
        LOAN_CATEGORIES[document.getElementById('loanCategory').value] || 'Not Selected';
    document.getElementById('summaryPrincipal').textContent = 
        'Kes. ' + data.principal.toLocaleString('en-KE', {maximumFractionDigits: 0});
    document.getElementById('summaryDuration').textContent = 
        data.duration + ' month' + (data.duration > 1 ? 's' : '');
    document.getElementById('summaryRate').textContent = data.rate + '%';
    document.getElementById('summaryInterest').textContent = 
        'Kes. ' + data.interest.toLocaleString('en-KE', {maximumFractionDigits: 0});
    document.getElementById('summaryFacilitation').textContent = 
        'Kes. ' + data.facilitation.toLocaleString('en-KE', {maximumFractionDigits: 0});
    document.getElementById('summaryTotal').textContent = 
        'Kes. ' + data.total.toLocaleString('en-KE', {maximumFractionDigits: 0});
    document.getElementById('summaryMonthly').textContent = 
        'Kes. ' + data.monthly.toLocaleString('en-KE', {maximumFractionDigits: 0});

    showSummary();
}

// ===== Handle Loan Submission =====
function handleLoanSubmit(e) {
    e.preventDefault();

    if (!currentUser) {
        alert('You must be logged in to apply for a loan');
        return;
    }

    // Collect form data
    const formData = {
        userId: currentUser.uid,
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        loanCategory: document.getElementById('loanCategory').value,
        loanAmount: parseFloat(document.getElementById('loanAmount').value),
        loanDuration: parseInt(document.getElementById('loanDuration').value),
        interestRate: parseFloat(document.getElementById('interestRate').value),
        employmentStatus: document.getElementById('employmentStatus').value,
        reason: document.getElementById('reason').value,
        dateApplied: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'Pending'
    };

    // Validate form
    const errors = validateLoanForm(formData);
    if (errors.length > 0) {
        alert('Validation Errors:\n' + errors.join('\n'));
        return;
    }

    // Store temporarily for confirmation
    window.currentLoan = formData;
    document.getElementById('loanForm').style.display = 'none';
}

// ===== Confirm Application =====
function confirmApplication() {
    if (!window.currentLoan) return;

    // Save to Firestore
    firebase.firestore().collection('loans').add(window.currentLoan)
        .then((docRef) => {
            alert('✓ Loan application submitted successfully!\n\nApplication ID: ' + docRef.id + '\n\nYou will receive updates via email and SMS.');

            // Update user stats
            return firebase.firestore().collection('users').doc(currentUser.uid).update({
                totalLoans: firebase.firestore.FieldValue.increment(1),
                totalLoanAmount: firebase.firestore.FieldValue.increment(window.currentLoan.loanAmount)
            }).then(() => {
                // Reset form
                document.getElementById('loanForm').reset();
                document.getElementById('loanForm').style.display = 'block';
                hideSummary();
                window.currentLoan = null;

                // Reload applications
                loadApplicationsFromFirestore(currentUser.uid);
                updateDashboard(currentUser.uid);
            });
        })
        .catch((error) => {
            alert('Error submitting application: ' + error.message);
        });
}

// ===== Edit Application =====
function editApplication() {
    document.getElementById('loanForm').style.display = 'block';
    hideSummary();
    window.currentLoan = null;
}

// ===== Show/Hide Summary =====
function showSummary() {
    document.getElementById('summarySection').style.display = 'block';
}

function hideSummary() {
    document.getElementById('summarySection').style.display = 'none';
}

// ===== Load Applications from Firestore =====
function loadApplicationsFromFirestore(userId) {
    firebase.firestore().collection('loans')
        .where('userId', '==', userId)
        .orderBy('dateApplied', 'desc')
        .onSnapshot((snapshot) => {
            const loans = [];
            snapshot.forEach((doc) => {
                loans.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            displayLoans(loans);
        });
}

// ===== Display Loans =====
function displayLoans(loans) {
    const loansList = document.getElementById('loansList');

    if (loans.length === 0) {
        loansList.innerHTML = '<p class="empty-state">No active loans yet. Apply now to get started!</p>';
        return;
    }

    loansList.innerHTML = loans.map(loan => createLoanCard(loan)).join('');

    // Add event listeners to action buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editLoan(btn.dataset.loanId));
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteLoan(btn.dataset.loanId));
    });
}

// ===== Create Loan Card HTML =====
function createLoanCard(loan) {
    const dateApplied = loan.dateApplied ? new Date(loan.dateApplied.toDate()).toLocaleDateString('en-KE') : 'N/A';
    const totalInterest = (loan.loanAmount * loan.interestRate * loan.loanDuration) / (12 * 100);
    const totalAmount = loan.loanAmount + totalInterest + FACILITATION_FEE;
    const monthlyPayment = totalAmount / loan.loanDuration;

    const statusClass = loan.status.toLowerCase().replace(' ', '-');

    return `
        <div class="loan-card">
            <div class="loan-card-info">
                <div class="loan-info-item">
                    <h4>Applicant</h4>
                    <p>${loan.fullName}</p>
                </div>
                <div class="loan-info-item">
                    <h4>Loan Type</h4>
                    <p>${LOAN_CATEGORIES[loan.loanCategory]}</p>
                </div>
                <div class="loan-info-item">
                    <h4>Amount</h4>
                    <p>Kes. ${loan.loanAmount.toLocaleString('en-KE', {maximumFractionDigits: 0})}</p>
                </div>
                <div class="loan-info-item">
                    <h4>Monthly Payment</h4>
                    <p>Kes. ${monthlyPayment.toLocaleString('en-KE', {maximumFractionDigits: 0})}</p>
                </div>
                <div class="loan-info-item">
                    <h4>Duration</h4>
                    <p>${loan.loanDuration} months</p>
                </div>
                <div class="loan-info-item">
                    <h4>Interest Rate</h4>
                    <p>${loan.interestRate}%</p>
                </div>
                <div class="loan-info-item">
                    <h4>Date Applied</h4>
                    <p>${dateApplied}</p>
                </div>
                <div class="loan-info-item">
                    <h4>Status</h4>
                    <span class="status-badge ${statusClass}">${loan.status}</span>
                </div>
            </div>
            <div class="loan-actions">
                <button class="btn-edit" data-loan-id="${loan.id}">✎ Edit</button>
                <button class="btn-delete" data-loan-id="${loan.id}">✕ Delete</button>
            </div>
        </div>
    `;
}

// ===== Edit Loan =====
function editLoan(loanId) {
    firebase.firestore().collection('loans').doc(loanId).get()
        .then((doc) => {
            if (doc.exists) {
                const loan = doc.data();

                // Populate form with loan data
                document.getElementById('fullName').value = loan.fullName;
                document.getElementById('email').value = loan.email;
                document.getElementById('phone').value = loan.phone;
                document.getElementById('loanCategory').value = loan.loanCategory;
                document.getElementById('loanAmount').value = loan.loanAmount;
                document.getElementById('loanDuration').value = loan.loanDuration;
                document.getElementById('interestRate').value = loan.interestRate;
                document.getElementById('employmentStatus').value = loan.employmentStatus;
                document.getElementById('reason').value = loan.reason;

                // Remove old loan
                deleteLoan(loanId);

                // Scroll to form
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
}

// ===== Delete Loan =====
function deleteLoan(loanId) {
    if (confirm('Are you sure you want to delete this loan application?')) {
        firebase.firestore().collection('loans').doc(loanId).delete()
            .then(() => {
                loadApplicationsFromFirestore(currentUser.uid);
                updateDashboard(currentUser.uid);
            })
            .catch((error) => {
                alert('Error deleting loan: ' + error.message);
            });
    }
}

// ===== Update Dashboard Statistics =====
function updateDashboard(userId) {
    firebase.firestore().collection('loans')
        .where('userId', '==', userId)
        .onSnapshot((snapshot) => {
            const loans = [];
            snapshot.forEach((doc) => {
                loans.push(doc.data());
            });

            const totalApplications = loans.length;
            const totalLoaned = loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
            const approvedLoans = loans.filter(loan => loan.status === 'Approved').length;
            const pendingLoans = loans.filter(loan => loan.status === 'Pending').length;

            document.getElementById('totalApplications').textContent = totalApplications;
            document.getElementById('totalLoaned').textContent = 
                'Kes. ' + totalLoaned.toLocaleString('en-KE', {maximumFractionDigits: 0});
            document.getElementById('approvedLoans').textContent = approvedLoans;
            document.getElementById('pendingLoans').textContent = pendingLoans;
        });
}

// ===== Utility Functions =====
function generateId() {
    return 'LOAN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// ===== Format Currency =====
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES'
    }).format(amount);
}
