const { initiateStkPush } = require('../mpesa');

module.exports = async function handler(request, response) {
    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        response.status(405).json({ ok: false, error: 'Method not allowed.' });
        return;
    }

    try {
        const result = await initiateStkPush({
            phoneNumber: request.body.phoneNumber,
            amount: request.body.amount,
            accountReference: request.body.accountReference,
            transactionDesc: request.body.transactionDesc,
            callbackBaseUrl: getBaseUrl(request),
            loanId: request.body.loanId
        });

        response.status(200).json({
            ok: true,
            ...result
        });
    } catch (error) {
        response.status(400).json({
            ok: false,
            code: error.code || 'mpesa/unknown-error',
            error: error.message || 'Unable to initiate M-Pesa STK push.'
        });
    }
};

function getBaseUrl(request) {
    const forwardedProto = request.headers['x-forwarded-proto'] || 'https';
    const forwardedHost = request.headers['x-forwarded-host'] || request.headers.host;
    return `${forwardedProto}://${forwardedHost}`;
}
