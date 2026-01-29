import { api } from '../api';

export const fetchRecentRFQs = async (authToken: string) => {
    const response = await api.get(`/procurement/rfq?page=0&pageSize=100`, {
        headers: { 'accept': '*/*' }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch RFQs');
    }
    return response.json();
};

export const fetchRFQComparison = async (authToken: string, rfqId: number) => {
    const response = await api.get(`/procurement/rfq/${rfqId}/comparison`, {
        headers: { 'accept': '*/*' }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch comparison data');
    }
    return response.json();
};

export const selectRFQVendor = async (authToken: string, rfqId: number, vendorId: number) => {
    // We need the user ID to pass as 'selectedBy'. ideally backend should extract from token, 
    // but the endpoint expects a body with { vendorId, selectedBy }.
    // We can extract it from the token here.
    const tokenParts = authToken.split('.');
    const payload = JSON.parse(atob(tokenParts[1]));
    const userId = payload.userId || payload.id;

    const response = await api.post(`/procurement/rfq/${rfqId}/select-vendor`, {
        vendorId: vendorId,
        selectedBy: userId
    }, {
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to select vendor');
    }
    return response.json();
};

export const generatePOFromQuotation = async (
    authToken: string,
    prId: number,
    vendorId: number,
    totalAmount: number,
    gst: number
) => {
    // Endpoint: POST /api/procurement/po?prId=...&vendorId=...&totalAmount=...&gst=...
    const params = new URLSearchParams({
        prId: prId.toString(),
        vendorId: vendorId.toString(),
        totalAmount: totalAmount.toString(),
        gst: gst.toString()
    });


    const response = await api.post(`/procurement/po?${params.toString()}`, undefined, {
        headers: { 'accept': '*/*' }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to generate Purchase Order');
    }
    return response.json();
};

export const fetchPurchaseOrders = async (authToken: string) => {
    const response = await api.get('/procurement/po', {
        headers: { 'accept': '*/*' }
    });
    if (!response.ok) throw new Error('Failed to fetch Purchase Orders');
    return response.json();
};

export const fetchInvoices = async (authToken: string) => {
    const response = await api.get('/procurement/invoice', {
        headers: { 'accept': '*/*' }
    });
    if (!response.ok) throw new Error('Failed to fetch Invoices');
    return response.json();
};

export const fetchPayments = async (authToken: string) => {
    const response = await api.get('/procurement/payment', {
        headers: { 'accept': '*/*' }
    });
    if (!response.ok) throw new Error('Failed to fetch Payments');
    return response.json();
};

export const submitInvoice = async (
    authToken: string,
    poId: number,
    vendorId: number,
    invoiceNumber: string,
    date: string,
    amount: number,
    gst: number
) => {
    const params = new URLSearchParams({
        poId: poId.toString(),
        vendorId: vendorId.toString(),
        invoiceNumber: invoiceNumber,
        invoiceDate: date,
        amount: amount.toString(),
        gst: gst.toString()
    });

    const response = await api.post(`/procurement/invoice?${params.toString()}`, undefined, {
        headers: { 'accept': '*/*' }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to submit invoice');
    }
    return response.json();
};

export const recordPayment = async (
    authToken: string,
    invoiceId: number,
    amount: number,
    mode: string,
    reference: string
) => {
    const params = new URLSearchParams({
        invoiceId: invoiceId.toString(),
        amount: amount.toString(),
        mode: mode,
        reference: reference
    });

    const response = await api.post(`/procurement/payment?${params.toString()}`, undefined, {
        headers: { 'accept': '*/*' }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to record payment');
    }
    return response.json();
};
