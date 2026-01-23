import { api } from '../api';

export const fetchApprovedVendors = async (authToken: string, page: number, pageSize: number) => {
    const response = await api.get(`/vendors/approved?page=${page}&pageSize=${pageSize}`, {
        headers: {
            'accept': '*/*'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch approved vendors');
    }

    return response.json();
};

export const fetchPendingVendors = async (authToken: string, page: number, pageSize: number) => {
    const response = await api.get(`/vendors/pending?page=${page}&pageSize=${pageSize}`, {
        headers: {
            'accept': '*/*'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch pending vendors');
    }

    return response.json();
};

export const fetchVendorById = async (authToken: string, id: number) => {
    const response = await api.get(`/vendors/${id}`, {
        headers: {
            'accept': '*/*'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch vendor details');
    }

    return response.json();
};

export const createVendor = async (authToken: string, vendorData: any) => {
    const response = await api.post(`/vendors`, vendorData, {
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create vendor');
    }

    return response.json();
};

export const approveVendor = async (authToken: string, id: number) => {
    const response = await api.post(`/vendors/${id}/approve`, undefined, {
        headers: {
            'accept': '*/*'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to approve vendor');
    }

    return response.json();
};
