const functions = require('@netlify/functions');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://phoronetworks.firebaseio.com"
});

const db = admin.firestore();

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    const data = JSON.parse(event.body);

    try {
        const docRef = await db.collection('registrations').add({
            name: data.name,
            email: data.email,
            phone: data.phone,
            referralCode: data.referralCode,
            paymentCode: data.paymentCode,
            timestamp: new Date()
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ id: docRef.id }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: 'Error adding document: ' + error.message,
        };
    }
};
