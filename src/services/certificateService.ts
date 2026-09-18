import api from './api';
import type { 
  CertificateTemplate, 
  IssuedCertificate, 
  CertificateHistoryItem, 
  CertificateVerificationResult 
} from '../types/certificate';

export interface CreateTemplatePayload {
  name: string;
  description?: string;
  orientation: 'landscape' | 'portrait';
  width?: number;
  height?: number;
  backgroundImage?: string | null;
  elements: any[];
  isDefault?: boolean;
  isActive?: boolean;
}

export interface ManualGeneratePayload {
  userId: string;
  courseId: string;
  templateId?: string;
  issueDate?: string;
  completionDate?: string;
}

export const certificateService = {
  // --- Templates Management ---
  getTemplates: async (): Promise<CertificateTemplate[]> => {
    const response = await api.get('/admin/certificate-templates');
    return response.data;
  },

  getTemplate: async (id: string): Promise<CertificateTemplate> => {
    const response = await api.get(`/admin/certificate-templates/${id}`);
    return response.data;
  },

  createTemplate: async (payload: CreateTemplatePayload): Promise<CertificateTemplate> => {
    const response = await api.post('/admin/certificate-templates', payload);
    return response.data;
  },

  updateTemplate: async (id: string, payload: Partial<CreateTemplatePayload>): Promise<CertificateTemplate> => {
    const response = await api.put(`/admin/certificate-templates/${id}`, payload);
    return response.data;
  },

  duplicateTemplate: async (id: string): Promise<CertificateTemplate> => {
    const response = await api.post(`/admin/certificate-templates/${id}/duplicate`);
    return response.data;
  },

  deleteTemplate: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.delete(`/admin/certificate-templates/${id}`);
    return response.data;
  },

  toggleTemplateStatus: async (id: string, field: 'isActive' | 'isDefault'): Promise<CertificateTemplate> => {
    const response = await api.patch(`/admin/certificate-templates/${id}/toggle-status`, { field });
    return response.data;
  },

  uploadAsset: async (file: File, assetType: 'background' | 'logo' | 'signature' | 'badge' | 'asset' = 'asset'): Promise<{ url: string; fileName: string; size: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assetType', assetType);

    const response = await api.post('/admin/certificate-assets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // --- Admin Certificate Operations ---
  getAdminCertificates: async (params?: { search?: string; status?: string; courseId?: string }): Promise<IssuedCertificate[]> => {
    const response = await api.get('/admin/certificates', { params });
    return response.data;
  },

  generateCertificateManual: async (payload: ManualGeneratePayload): Promise<IssuedCertificate> => {
    const response = await api.post('/admin/certificates/generate', payload);
    return response.data;
  },

  reissueCertificate: async (id: string, reason?: string): Promise<IssuedCertificate> => {
    const response = await api.post(`/admin/certificates/${id}/reissue`, { reason });
    return response.data;
  },

  revokeCertificate: async (id: string, reason?: string): Promise<IssuedCertificate> => {
    const response = await api.post(`/admin/certificates/${id}/revoke`, { reason });
    return response.data;
  },

  getCertificateHistory: async (id: string): Promise<CertificateHistoryItem[]> => {
    const response = await api.get(`/admin/certificates/${id}/history`);
    return response.data;
  },

  // --- Student Certificates & Applications ---
  getMyCertificates: async (): Promise<{
    certificates: IssuedCertificate[];
    requests: any[];
    completedEligibleCourses: any[];
  }> => {
    const response = await api.get('/certificates/my-certificates');
    return response.data;
  },

  applyForCertificate: async (courseId: string): Promise<{ message: string; request: any }> => {
    const response = await api.post(`/certificates/apply/${courseId}`);
    return response.data;
  },

  // --- Mentor Certificate Operations ---
  getMentorCertificateRequests: async (): Promise<any[]> => {
    const response = await api.get('/mentor/certificate-requests');
    return response.data;
  },

  getStudentCourseSubmissions: async (requestId: string): Promise<{ request: any; submissions: any[] }> => {
    const response = await api.get(`/mentor/certificate-requests/${requestId}/submissions`);
    return response.data;
  },

  grantCertificateRequest: async (requestId: string): Promise<{ message: string; certificate: IssuedCertificate; request: any }> => {
    const response = await api.post(`/mentor/certificate-requests/${requestId}/grant`);
    return response.data;
  },

  rejectCertificateRequest: async (requestId: string, reason?: string): Promise<{ message: string; request: any }> => {
    const response = await api.post(`/mentor/certificate-requests/${requestId}/reject`, { reason });
    return response.data;
  },

  // --- Admin Certificate Requests ---
  getAdminCertificateRequests: async (): Promise<any[]> => {
    const response = await api.get('/admin/certificate-requests');
    return response.data;
  },

  // --- Public Verification ---
  verifyCertificate: async (certificateNumber: string): Promise<CertificateVerificationResult> => {
    const response = await api.get(`/public/verify-certificate/${encodeURIComponent(certificateNumber.trim())}`);
    return response.data;
  },

  // --- PDF Download Helper ---
  downloadPdf: async (certificateIdOrNumber: string, filename?: string) => {
    const response = await api.get(`/certificates/${certificateIdOrNumber}/pdf`, {
      responseType: 'blob'
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename || `Oxyfied-Certificate-${certificateIdOrNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }
};
