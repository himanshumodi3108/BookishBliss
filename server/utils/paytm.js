// Paytm configuration
const PAYTM_MERCHANT_ID = process.env.PAYTM_MERCHANT_ID || '';
const PAYTM_MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY || '';
const PAYTM_WEBSITE = process.env.PAYTM_WEBSITE || 'WEBSTAGING';
const PAYTM_CHANNEL_ID = process.env.PAYTM_CHANNEL_ID || 'WEB';
const PAYTM_INDUSTRY_TYPE_ID = process.env.PAYTM_INDUSTRY_TYPE_ID || 'Retail';
const PAYTM_CALLBACK_URL = process.env.PAYTM_CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/payment/callback`;
const PAYTM_ENABLE = process.env.PAYTM_ENABLE === 'true'; // Control payment gateway

// Simple checksum generation (for demo - use proper Paytm SDK in production)
const generateChecksum = (params, key) => {
    const crypto = require('crypto');
    const string = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
    return crypto.createHmac('sha256', key).update(string).digest('hex');
};

// Generate Paytm payment parameters
const generatePaytmParams = async (orderId, amount, customerId, customerEmail, customerMobile) => {
    if (!PAYTM_ENABLE) {
        return null; // Payment gateway disabled
    }

    const params = {
        MID: PAYTM_MERCHANT_ID,
        WEBSITE: PAYTM_WEBSITE,
        CHANNEL_ID: PAYTM_CHANNEL_ID,
        INDUSTRY_TYPE_ID: PAYTM_INDUSTRY_TYPE_ID,
        ORDER_ID: orderId,
        CUST_ID: customerId,
        TXN_AMOUNT: amount.toString(),
        CALLBACK_URL: PAYTM_CALLBACK_URL,
        EMAIL: customerEmail || '',
        MOBILE_NO: customerMobile || '',
    };

    try {
        const checksum = generateChecksum(params, PAYTM_MERCHANT_KEY);
        return {
            ...params,
            CHECKSUMHASH: checksum
        };
    } catch (error) {
        console.error('Error generating Paytm checksum:', error);
        throw error;
    }
};

// Verify Paytm callback
const verifyPaytmCallback = async (body) => {
    if (!PAYTM_ENABLE) {
        return { verified: true, orderId: body.ORDERID || body.ORDER_ID, status: 'TXN_SUCCESS' }; // If disabled, always verify
    }

    const paytmChecksum = body.CHECKSUMHASH || body.CHECKSUMHASH;
    const bodyCopy = { ...body };
    delete bodyCopy.CHECKSUMHASH;

    const calculatedChecksum = generateChecksum(bodyCopy, PAYTM_MERCHANT_KEY);
    const isVerifySignature = calculatedChecksum === paytmChecksum;

    return {
        verified: isVerifySignature,
        orderId: body.ORDERID || body.ORDER_ID,
        transactionId: body.TXNID || body.TXN_ID,
        amount: body.TXNAMOUNT || body.TXN_AMOUNT,
        status: body.STATUS || body.STATUS,
        responseCode: body.RESPCODE || body.RESP_CODE
    };
};

module.exports = {
    generatePaytmParams,
    verifyPaytmCallback,
    PAYTM_ENABLE
};

