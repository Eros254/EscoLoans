const { updateLoanPaymentStatus } = require('../firestore-admin');

module.exports = async function handler(request, response) {
    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        response.status(405).json({ ok: false, error: 'Method not allowed.' });
        return;
    }

    const loanId = request.query && request.query.loanId;
    const callback = (request.body && request.body.Body && request.body.Body.stkCallback) || {};

    console.log('M-Pesa callback received:', JSON.stringify(request.body || {}, null, 2));

    if (loanId) {
        try {
            await updateLoanPaymentStatus(loanId, buildLoanPaymentUpdate(callback, request.body));
        } catch (error) {
            console.error('Error updating Firestore from M-Pesa callback:', error);
        }
    }

    response.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Accepted'
    });
};

function buildLoanPaymentUpdate(callback, rawPayload) {
    const metadata = extractMetadata(callback.CallbackMetadata);
    const resultCode = Number(callback.ResultCode || 0);
    const success = resultCode === 0;

    return {
        feeStatus: success ? 'Paid' : 'Payment Failed',
        processingStage: success ? 'Verification Queue' : 'Awaiting New Payment Prompt',
        status: success ? 'Fee Paid' : 'Payment Failed',
        nextStep: success
            ? 'Your payment was received. Your application is now in verification before final cash collection instructions.'
            : (callback.ResultDesc || 'The payment prompt did not complete. Please try again.'),
        mpesaCallbackReceivedAt: { __timestamp: true, value: new Date().toISOString() },
        mpesaResultCode: resultCode,
        mpesaResultDesc: callback.ResultDesc || '',
        mpesaMerchantRequestId: callback.MerchantRequestID || '',
        mpesaCheckoutRequestId: callback.CheckoutRequestID || '',
        mpesaReceiptNumber: metadata.MpesaReceiptNumber || '',
        mpesaTransactionDate: metadata.TransactionDate ? String(metadata.TransactionDate) : '',
        amountPaid: metadata.Amount ? Number(metadata.Amount) : 0,
        paymentPhone: metadata.PhoneNumber ? String(metadata.PhoneNumber) : '',
        mpesaRawCallback: rawPayload || {}
    };
}

function extractMetadata(callbackMetadata) {
    const result = {};
    const items = callbackMetadata && Array.isArray(callbackMetadata.Item)
        ? callbackMetadata.Item
        : [];

    items.forEach((item) => {
        result[item.Name] = item.Value;
    });

    return result;
}
