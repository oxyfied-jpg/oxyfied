import api from './api';

export type EnquiryType =
  | 'contact'
  | 'hire'
  | 'instructor'
  | 'partner'
  | 'corporate'
  | 'collaboration'
  | 'career';

export type EnquiryStatus = 'new' | 'in_review' | 'contacted' | 'closed';

export interface EnquiryPayload {
  type: EnquiryType;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  subject?: string;
  message: string;
  data?: Record<string, any>;
}

export interface EnquiryObject {
  id: string;
  type: EnquiryType;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  subject?: string | null;
  message: string;
  data?: string | null;
  status: EnquiryStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryFilters {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const enquiryService = {
  // Public Submission
  submitEnquiry: async (payload: EnquiryPayload): Promise<{ success: boolean; message: string; enquiry?: EnquiryObject }> => {
    try {
      const response = await api.post('/enquiries', {
        ...payload,
        data: payload.data ? JSON.stringify(payload.data) : undefined
      });
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to submit your request. Please try again.';
      throw new Error(errorMsg);
    }
  },

  // Admin Endpoints
  getAdminEnquiries: async (filters: EnquiryFilters = {}): Promise<{
    enquiries: EnquiryObject[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    try {
      const params = new URLSearchParams();
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`/admin/enquiries?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch admin enquiries:', error);
      return { enquiries: [], total: 0, page: 1, totalPages: 1 };
    }
  },

  getAdminEnquiryById: async (id: string): Promise<EnquiryObject | null> => {
    try {
      const response = await api.get(`/admin/enquiries/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get enquiry detail:', error);
      return null;
    }
  },

  updateAdminEnquiry: async (
    id: string,
    updates: { status?: EnquiryStatus; adminNotes?: string }
  ): Promise<EnquiryObject> => {
    const response = await api.patch(`/admin/enquiries/${id}`, updates);
    return response.data;
  },

  deleteAdminEnquiry: async (id: string): Promise<boolean> => {
    await api.delete(`/admin/enquiries/${id}`);
    return true;
  }
};
