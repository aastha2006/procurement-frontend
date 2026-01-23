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
