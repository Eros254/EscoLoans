const crypto = require('crypto');

const DEFAULT_CALLBACK_PATH = '/api/mpesa-callback';

async function initiateStkPush({
    phoneNumber,
    amount,
    accountReference,
    transactionDesc,
    callbackBaseUrl,
    loanId
}) {
    const config = getMpesaConfig();
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const timestamp = generateTimestamp();
    const password = Buffer.from(
        `${config.shortcode}${config.passkey}${timestamp}`,
        'utf8'
    ).toString('base64');
    const token = await getAccessToken(config);
    const callbackUrl = new URL(DEFAULT_CALLBACK_PATH, ensureTrailingSlash(callbackBaseUrl));
    if (loanId) {
        callbackUrl.searchParams.set('loanId', loanId);
    }

    const response = await fetch(`${config.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            BusinessShortCode: config.shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: config.transactionType,
            Amount: Math.round(Number(amount)),
            PartyA: normalizedPhone,
            PartyB: config.shortcode,
            PhoneNumber: normalizedPhone,
            CallBackURL: callbackUrl.toString(),
            AccountReference: accountReference,
            TransactionDesc: transactionDesc,
            Remark: loanId || accountReference
        })
    });

    const payload = await response.json();

    if (!response.ok || payload.errorCode) {
        const error = new Error(payload.errorMessage || payload.ResponseDescription || 'M-Pesa STK push failed.');
        error.code = payload.errorCode || 'mpesa/stk-push-failed';
        error.payload = payload;
        throw error;
    }

    return {
        normalizedPhone,
        callbackUrl: callbackUrl.toString(),
        merchantRequestId: payload.MerchantRequestID || '',
        checkoutRequestId: payload.CheckoutRequestID || '',
        responseCode: payload.ResponseCode || '',
        responseDescription: payload.ResponseDescription || '',
        customerMessage: payload.CustomerMessage || ''
    };
}

function getMpesaConfig() {
    const config = {
        environment: process.env.MPESA_ENVIRONMENT || 'sandbox',
        consumerKey: process.env.MPESA_CONSUMER_KEY || '',
        consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
        shortcode: process.env.MPESA_SHORTCODE || '',
        passkey: process.env.MPESA_PASSKEY || '',
        transactionType: process.env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline',
        baseUrl: process.env.MPESA_BASE_URL || ''
    };

    if (!config.baseUrl) {
        config.baseUrl = config.environment === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    const missing = Object.entries({
        MPESA_CONSUMER_KEY: config.consumerKey,
        MPESA_CONSUMER_SECRET: config.consumerSecret,
        MPESA_SHORTCODE: config.shortcode,
        MPESA_PASSKEY: config.passkey
    }).filter(([, value]) => !value).map(([key]) => key);

    if (missing.length > 0) {
        const error = new Error(`Missing M-Pesa configuration: ${missing.join(', ')}`);
        error.code = 'mpesa/config-missing';
        throw error;
    }

    return config;
}

async function getAccessToken(config) {
    const credentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`, 'utf8').toString('base64');
    const response = await fetch(`${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
            Authorization: `Basic ${credentials}`
        }
    });
    const payload = await response.json();

    if (!response.ok || !payload.access_token) {
        const error = new Error(payload.errorMessage || 'Unable to get M-Pesa access token.');
        error.code = payload.errorCode || 'mpesa/token-failed';
        error.payload = payload;
        throw error;
    }

    return payload.access_token;
}

function normalizePhoneNumber(phoneNumber) {
    const digits = String(phoneNumber || '').replace(/\D/g, '');

    if (digits.length === 9 && digits.startsWith('7')) {
        return `254${digits}`;
    }

    if (digits.length === 10 && digits.startsWith('0')) {
        return `254${digits.slice(1)}`;
    }

    if (digits.length === 12 && digits.startsWith('254')) {
        return digits;
    }

    const error = new Error('Use a valid Kenyan M-Pesa number in the format 07XXXXXXXX or 2547XXXXXXXX.');
    error.code = 'mpesa/invalid-phone';
    throw error;
}

function generateTimestamp() {
    const date = new Date();
    const parts = [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds())
    ];

    return parts.join('');
}

function ensureTrailingSlash(value) {
    return value.endsWith('/') ? value : `${value}/`;
}

function pad(value) {
    return String(value).padStart(2, '0');
}

module.exports = {
    initiateStkPush,
    normalizePhoneNumber
};
