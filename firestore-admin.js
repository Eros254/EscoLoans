const crypto = require('crypto');

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

async function updateLoanPaymentStatus(loanId, updates) {
    const projectId = process.env.FIREBASE_PROJECT_ID || '';
    const accessToken = await getGoogleAccessToken();

    if (!projectId) {
        const error = new Error('Missing FIREBASE_PROJECT_ID for Firestore updates.');
        error.code = 'firestore/project-missing';
        throw error;
    }

    const documentUrl = new URL(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/loans/${loanId}`
    );

    Object.keys(updates).forEach((fieldPath) => {
        documentUrl.searchParams.append('updateMask.fieldPaths', fieldPath);
    });

    const response = await fetch(documentUrl, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fields: toFirestoreFields(updates)
        })
    });

    const payload = await response.json();

    if (!response.ok) {
        const error = new Error(payload.error && payload.error.message
            ? payload.error.message
            : 'Unable to update loan payment status in Firestore.');
        error.code = 'firestore/update-failed';
        error.payload = payload;
        throw error;
    }

    return payload;
}

async function getGoogleAccessToken() {
    const credentials = getServiceAccountCredentials();
    const jwt = createSignedJwt(credentials);
    const body = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
    });

    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
    });
    const payload = await response.json();

    if (!response.ok || !payload.access_token) {
        const error = new Error(payload.error_description || 'Unable to get Google access token.');
        error.code = 'firestore/token-failed';
        error.payload = payload;
        throw error;
    }

    return payload.access_token;
}

function getServiceAccountCredentials() {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        return {
            clientEmail: parsed.client_email,
            privateKey: parsed.private_key
        };
    }

    const clientEmail = process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL || '';
    const privateKey = (process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n');

    const missing = [];
    if (!clientEmail) missing.push('FIREBASE_SERVICE_ACCOUNT_EMAIL');
    if (!privateKey) missing.push('FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY');

    if (missing.length > 0) {
        const error = new Error(`Missing Firebase service account credentials: ${missing.join(', ')}`);
        error.code = 'firestore/service-account-missing';
        throw error;
    }

    return {
        clientEmail,
        privateKey
    };
}

function createSignedJwt(credentials) {
    const now = Math.floor(Date.now() / 1000);
    const header = {
        alg: 'RS256',
        typ: 'JWT'
    };
    const claimSet = {
        iss: credentials.clientEmail,
        scope: 'https://www.googleapis.com/auth/datastore',
        aud: GOOGLE_TOKEN_URL,
        exp: now + 3600,
        iat: now
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
    const signingInput = `${encodedHeader}.${encodedClaimSet}`;
    const signature = crypto.sign('RSA-SHA256', Buffer.from(signingInput), credentials.privateKey);

    return `${signingInput}.${base64UrlEncode(signature)}`;
}

function toFirestoreFields(values) {
    const fields = {};

    Object.entries(values).forEach(([key, value]) => {
        fields[key] = toFirestoreValue(value);
    });

    return fields;
}

function toFirestoreValue(value) {
    if (value === null || value === undefined) {
        return { nullValue: null };
    }

    if (typeof value === 'string') {
        return { stringValue: value };
    }

    if (typeof value === 'boolean') {
        return { booleanValue: value };
    }

    if (typeof value === 'number') {
        return Number.isInteger(value)
            ? { integerValue: String(value) }
            : { doubleValue: value };
    }

    if (value instanceof Date) {
        return { timestampValue: value.toISOString() };
    }

    if (Array.isArray(value)) {
        return {
            arrayValue: {
                values: value.map((item) => toFirestoreValue(item))
            }
        };
    }

    if (typeof value === 'object' && value.__timestamp === true) {
        return { timestampValue: value.value };
    }

    if (typeof value === 'object') {
        return {
            mapValue: {
                fields: toFirestoreFields(value)
            }
        };
    }

    return { stringValue: String(value) };
}

function base64UrlEncode(value) {
    const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

module.exports = {
    updateLoanPaymentStatus
};
