import { db } from "./firebase-config.js";
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore";

// Registration Form
document.getElementById('registrationForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const referralCode = document.getElementById('referralCode').value;
    const paymentCode = document.getElementById('paymentCode').value;

    try {
        const docRef = await addDoc(collection(db, 'registrations'), {
            name,
            email,
            phone,
            referralCode,
            paymentCode,
            status: 'pending',
            timestamp: new Date()
        });

        alert('Registration successful, awaiting admin verification');
    } catch (error) {
        console.error('Error adding document: ', error);
        alert('Error during registration. Please try again.');
    }
});

// Login Form
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Simple email/password match for demo purpose
    const q = query(collection(db, 'users'), where('email', '==', email), where('password', '==', password));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
            sessionStorage.setItem('userId', doc.id);
            window.location.href = 'dashboard.html';
        });
    } else {
        alert('Invalid email or password');
    }
});

// Load Dashboard Data
async function loadDashboard() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        document.getElementById('userName').textContent = userData.name;
        document.getElementById('userReferralCode').textContent = userData.referralCode;
        document.getElementById('userWalletBalance').textContent = userData.walletBalance;

        const transactionHistory = document.getElementById('transactionHistory');
        userData.transactions.forEach(transaction => {
            const li = document.createElement('li');
            li.textContent = `${transaction.date} - ${transaction.amount} KES - ${transaction.type}`;
            transactionHistory.appendChild(li);
        });
    } else {
        console.log('No such user!');
    }
}

// Logout
document.getElementById('logoutButton')?.addEventListener('click', () => {
    sessionStorage.removeItem('userId');
    window.location.href = 'login.html';
});

// Load Pending Registrations for Admin
async function loadPendingRegistrations() {
    const q = query(collection(db, 'registrations'), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);

    const pendingRegistrations = document.getElementById('pendingRegistrations');
    querySnapshot.forEach((doc) => {
        const li = document.createElement('li');
        li.textContent = `${doc.data().name} - ${doc.data().email} - ${doc.data().phone}`;
        pendingRegistrations.appendChild(li);
    });
}

// Verify Payments
document.getElementById('verifyPaymentsButton')?.addEventListener('click', async () => {
    const q = query(collection(db, 'registrations'), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
        const registration = doc.data();
        
        // Mock verification for demonstration
        if (registration.paymentCode === '123456') {
            await updateDoc(doc(db, 'registrations', doc.id), {
                status: 'verified'
            });

            // Add user to users collection
            const referralUserQuery = query(collection(db, 'users'), where('referralCode', '==', registration.referralCode));
            const referralUserSnapshot = await getDocs(referralUserQuery);
            let referrerId = null;
            referralUserSnapshot.forEach((referrerDoc) => {
                referrerId = referrerDoc.id;
            });

            const newUserDocRef = await addDoc(collection(db, 'users'), {
                name: registration.name,
                email: registration.email,
                phone: registration.phone,
                referralCode: generateReferralCode(),
                walletBalance: 0,
                transactions: [],
                password: 'password123'
            });

            // Update referrer's wallet balance
            if (referrerId) {
                const referrerDoc = await getDoc(doc(db, 'users', referrerId));
                const referrerData = referrerDoc.data();
                const newBalance = referrerData.walletBalance + 75;
                const newTransactions = [...referrerData.transactions, {date: new Date(), amount: 75, type: 'Referral Bonus'}];

                await updateDoc(doc(db, 'users', referrerId), {
                    walletBalance: newBalance,
                    transactions: newTransactions
                });
            }

            alert('Verified registration and added new user');
        }
    });

    loadPendingRegistrations();
});

function generateReferralCode() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Call functions to load data
if (window.location.pathname.endsWith('dashboard.html')) {
    loadDashboard();
}

if (window.location.pathname.endsWith('admin.html')) {
    loadPendingRegistrations();
}
