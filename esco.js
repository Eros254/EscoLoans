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
const JOURNEY_STEP_IDS = [
    'journeyIntro',
    'journeyCategories',
    'journeyApproved',
    'journeyFee',
    'journeyStatement',
    'journeyRejected'
];

// Global user reference
let currentUser = null;
let currentEditingLoanId = null;
let currentEditingLoanAmount = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 App starting, waiting for Firebase...');
    
    setupJourneyListeners();
    resetLoanJourney();

    // Wait for Firebase to be ready
    let firebaseReady = false;
    for (let i = 0; i < 50; i++) {
        if (window.firebaseAuth && window.firebaseDb) {
            firebaseReady = true;
            console.log('✅ Firebase ready!');
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!firebaseReady) {
        console.error('❌ Firebase failed to initialize');
        renderFirebaseStatus(window.firebaseInitError);
        disableAuthAndLoanActions();
        return;
    }

    setupAuthListeners();
    setupApplicationListeners();
    monitorAuthState();
});

function renderFirebaseStatus(error) {
    const statusElement = document.getElementById('firebaseStatus');

    if (!statusElement) {
        return;
    }

    if (!error) {
        statusElement.style.display = 'none';
        statusElement.className = 'firebase-status';
        statusElement.textContent = '';
        return;
    }

    const hint = getFirebaseTroubleshootingHint(error);
    statusElement.className = 'firebase-status error';
    statusElement.innerHTML = `
        <strong>Firebase setup error</strong>
        <div>${escapeHtml(error.message || 'Firebase failed to initialize.')}</div>
        <div><strong>Error code:</strong> ${escapeHtml(error.code || 'unknown')}</div>
        <div>${escapeHtml(hint)}</div>
    `;
    statusElement.style.display = 'block';
}

function getFirebaseTroubleshootingHint(error) {
    const errorCode = (error && error.code) || '';
    const errorMessage = (error && error.message) || '';

    if (errorCode.includes('auth/invalid-api-key') || errorMessage.toLowerCase().includes('api key')) {
        return 'Check the Firebase web app API key in firebase-config.js or your environment-based config.';
    }

    if (errorCode.includes('auth/network-request-failed') || errorMessage.toLowerCase().includes('network')) {
        return 'The browser could not reach Firebase. Check your internet connection and any firewall or ad blocker.';
    }

    if (errorCode.includes('app/duplicate-app')) {
        return 'Firebase was initialized more than once. Make sure only one config script runs on the page.';
    }

    if (errorMessage.toLowerCase().includes('offline persistence')) {
        return 'This usually means persistence is unsupported in the current browser or blocked by another open tab.';
    }

    return 'Verify Email/Password auth is enabled, Firestore exists, and the Firebase project values match your web app.';
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getFriendlyFirebaseAuthError(error) {
    if (!error) {
        return 'An unexpected Firebase error occurred.';
    }

    switch (error.code) {
        case 'auth/operation-not-allowed':
            return 'Email/Password sign-in is disabled in Firebase. Open Firebase Console > Authentication > Sign-in method, then enable Email/Password.';
        case 'auth/invalid-api-key':
            return 'Your Firebase API key is invalid. Check the Firebase web app config values.';
        case 'auth/network-request-failed':
            return 'Firebase could not be reached. Check your internet connection and browser/network blockers.';
        default:
            return error.message || 'An unexpected Firebase error occurred.';
    }
}

// ===== Authentication State Monitoring =====
function monitorAuthState() {
    window.firebaseAuth.onAuthStateChanged((user) => {
        console.log('Auth state changed:', user ? 'Logged in' : 'Logged out');
        
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
    }, (error) => {
        console.error('Auth state listener error:', error);
    });
}

// ===== Show/Hide Auth Modal and Main App =====
function showAuthModal() {
    const authModal = document.getElementById('authModal');
    const mainApp = document.getElementById('mainApp');
    
    if (authModal && mainApp) {
        authModal.style.display = 'flex';
        mainApp.style.display = 'none';
    }
}

function showMainApp() {
    const authModal = document.getElementById('authModal');
    const mainApp = document.getElementById('mainApp');
    
    if (authModal && mainApp) {
        authModal.style.display = 'none';
        mainApp.style.display = 'block';
        console.log('✓ Main app displayed');
    } else {
        console.error('❌ DOM elements not found:', { authModal, mainApp });
    }
}

function disableAuthAndLoanActions() {
    document.querySelectorAll('button, input, select, textarea').forEach((element) => {
        if (element.id === 'journeyStartOverBtn' || element.id === 'journeyRestartBtn') {
            return;
        }

        element.disabled = true;
    });
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

    if (!firebase.auth) {
        errorElement.textContent = '❌ Firebase not initialized. Check browser console.';
        return;
    }

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            // Clear form
            document.getElementById('loginForm').reset();
            errorElement.textContent = '';
            console.log('✓ Login successful');
        })
        .catch((error) => {
            console.error('Login error:', error);
            errorElement.textContent = getFriendlyFirebaseAuthError(error);
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

    if (!firebase.auth) {
        errorElement.textContent = '❌ Firebase not initialized. Check browser console and follow FIREBASE_SETUP.md';
        return;
    }

    errorElement.textContent = '⏳ Creating account...';

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('✓ User created in Firebase Auth');

            // Save user profile to Firestore
            return firebase.firestore().collection('users').doc(user.uid).set({
                fullName: name,
                email: email,
                phone: phone,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                totalLoans: 0,
                totalLoanAmount: 0
            }).then(() => {
                console.log('✓ User profile saved to Firestore');
                // Update auth profile
                return user.updateProfile({
                    displayName: name
                });
            });
        })
        .then(() => {
            console.log('✓ Signup complete');
            // Clear form and show success
            document.getElementById('signupForm').reset();
            errorElement.textContent = '✓ Account created! Loading dashboard...';
            errorElement.style.color = '#28a745';
            
            // The auth state listener will handle showing the main app
            setTimeout(() => {
                errorElement.textContent = '';
                errorElement.style.color = '';
            }, 3000);
        })
        .catch((error) => {
            console.error('Signup error:', error);
            errorElement.textContent = '❌ ' + getFriendlyFirebaseAuthError(error);
            errorElement.style.color = '#dc3545';
        });
}

// ===== Handle Logout =====
function handleLogout() {
    firebase.auth().signOut()
        .then(() => {
            currentUser = null;
            currentEditingLoanId = null;
            currentEditingLoanAmount = 0;
            document.getElementById('loanForm').reset();
            hideSummary();
            resetLoanJourney();
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
    loanForm.addEventListener('reset', handleLoanFormReset);
    confirmBtn.addEventListener('click', confirmApplication);
    editBtn.addEventListener('click', editApplication);

    // Real-time calculation
    document.getElementById('loanAmount').addEventListener('input', calculateLoan);
    document.getElementById('loanDuration').addEventListener('input', calculateLoan);
    document.getElementById('interestRate').addEventListener('input', calculateLoan);
}

// ===== Journey Flow =====
function setupJourneyListeners() {
    document.getElementById('journeyYesBtn').addEventListener('click', () => showJourneyStep('journeyCategories'));
    document.getElementById('journeyNoBtn').addEventListener('click', () => showJourneyStep('journeyRejected'));
    document.getElementById('journeyCategoryBtn').addEventListener('click', handleJourneyCategory);
    document.getElementById('journeyAccessBtn').addEventListener('click', () => showJourneyStep('journeyFee'));
    document.getElementById('journeyFeeBtn').addEventListener('click', () => showJourneyStep('journeyStatement'));
    document.getElementById('journeyUnlockBtn').addEventListener('click', unlockLoanForm);
    document.getElementById('journeyStartOverBtn').addEventListener('click', resetLoanJourney);
    document.getElementById('journeyRestartBtn').addEventListener('click', resetLoanJourney);
}

function showJourneyStep(stepId) {
    JOURNEY_STEP_IDS.forEach((id) => {
        const step = document.getElementById(id);
        step.classList.toggle('active', id === stepId);
        step.classList.remove('is-complete');
    });
}

function handleJourneyCategory() {
    const selectedCategory = document.getElementById('journeyCategory').value;

    if (!selectedCategory) {
        alert('Please choose a category to continue.');
        return;
    }

    document.getElementById('loanCategory').value = selectedCategory;
    document.getElementById('journeyApprovedCategory').textContent =
        `Selected category: ${LOAN_CATEGORIES[selectedCategory]}`;
    showJourneyStep('journeyApproved');
}

function unlockLoanForm() {
    const loanForm = document.getElementById('loanForm');
    const selectedCategory = document.getElementById('journeyCategory').value;

    loanForm.classList.remove('locked');
    loanForm.style.display = 'block';
    markJourneyComplete('journeyStatement');
    applyJourneyLoanDefaults(selectedCategory);
    calculateLoan();
    document.getElementById('employmentStatus').focus();
}

function resetLoanJourney() {
    const loanForm = document.getElementById('loanForm');
    const journeyCategory = document.getElementById('journeyCategory');
    const loanAmount = document.getElementById('loanAmount');

    currentEditingLoanId = null;
    currentEditingLoanAmount = 0;
    showJourneyStep('journeyIntro');
    journeyCategory.value = '';
    document.getElementById('journeyApprovedCategory').textContent = 'Selected category: -';
    loanForm.classList.add('locked');
    loanForm.style.display = 'none';
    document.getElementById('loanForm').reset();
    hideSummary();
    loanAmount.readOnly = false;
    loanAmount.removeAttribute('aria-readonly');
}

function markJourneyComplete(stepId) {
    showJourneyStep(stepId);
    document.getElementById(stepId).classList.add('is-complete');
}

function applyJourneyLoanDefaults(selectedCategory) {
    document.getElementById('loanCategory').value = selectedCategory;
    document.getElementById('loanAmount').value = MIN_LOAN_AMOUNT;
    document.getElementById('loanAmount').readOnly = true;
    document.getElementById('loanAmount').setAttribute('aria-readonly', 'true');
}

function handleLoanFormReset() {
    if (document.getElementById('loanForm').classList.contains('locked')) {
        return;
    }

    const selectedCategory = document.getElementById('journeyCategory').value;
    const profileValues = getProfileFieldValues();

    setTimeout(() => {
        restoreProfileFieldValues(profileValues);
        applyJourneyLoanDefaults(selectedCategory);
        hideSummary();
    }, 0);
}

function getProfileFieldValues() {
    return {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };
}

function restoreProfileFieldValues(values) {
    document.getElementById('fullName').value = values.fullName;
    document.getElementById('email').value = values.email;
    document.getElementById('phone').value = values.phone;
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

    const loanRef = currentEditingLoanId
        ? firebase.firestore().collection('loans').doc(currentEditingLoanId)
        : firebase.firestore().collection('loans').doc();
    const successMessage = currentEditingLoanId
        ? '✓ Loan application updated successfully!\n\nApplication ID: '
        : '✓ Loan application submitted successfully!\n\nApplication ID: ';
    const totalLoanAmountIncrement = currentEditingLoanId
        ? window.currentLoan.loanAmount - currentEditingLoanAmount
        : window.currentLoan.loanAmount;

    loanRef.set(window.currentLoan)
        .then(() => {
            alert(successMessage + loanRef.id + '\n\nYou will receive updates via email and SMS.');

            // Update user stats
            return firebase.firestore().collection('users').doc(currentUser.uid).update({
                totalLoans: firebase.firestore.FieldValue.increment(currentEditingLoanId ? 0 : 1),
                totalLoanAmount: firebase.firestore.FieldValue.increment(totalLoanAmountIncrement)
            }).then(() => {
                const profileValues = getProfileFieldValues();

                // Reset form
                document.getElementById('loanForm').reset();
                restoreProfileFieldValues(profileValues);
                resetLoanJourney();
                window.currentLoan = null;
                currentEditingLoanId = null;
                currentEditingLoanAmount = 0;

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
                currentEditingLoanId = loanId;
                currentEditingLoanAmount = loan.loanAmount;

                document.getElementById('journeyCategory').value = loan.loanCategory;
                document.getElementById('journeyApprovedCategory').textContent =
                    `Selected category: ${LOAN_CATEGORIES[loan.loanCategory]}`;
                markJourneyComplete('journeyStatement');
                document.getElementById('loanForm').classList.remove('locked');
                document.getElementById('loanForm').style.display = 'block';

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
                document.getElementById('loanAmount').readOnly = loan.loanAmount === MIN_LOAN_AMOUNT;
                document.getElementById('loanAmount').setAttribute('aria-readonly', String(loan.loanAmount === MIN_LOAN_AMOUNT));

                // Scroll to form
                window.scrollTo({ top: 0, behavior: 'smooth' });
                calculateLoan();
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
