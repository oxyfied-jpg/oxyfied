import api from './api';

export interface LoginActivity {
  id: string;
  userId?: string | null;
  email: string;
  userName?: string | null;
  role?: string | null;
  phone?: string | null;
  eventType: string;
  status: 'SUCCESS' | 'FAILED' | 'LOGGED_OUT' | 'EXPIRED' | 'BLOCKED' | 'DEVICE_REMOVED';
  failureReason?: string | null;
  ipAddress?: string | null;
  ipVersion?: string | null;
  locationApprox?: string | null;
  isp?: string | null;
  userAgent?: string | null;
  browserName?: string | null;
  browserVersion?: string | null;
  browserEngine?: string | null;
  operatingSystem?: string | null;
  osVersion?: string | null;
  deviceType?: 'Desktop' | 'Laptop' | 'Mobile' | 'Tablet' | null;
  platform?: string | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  devicePixelRatio?: number | null;
  touchSupport?: boolean | null;
  sessionId?: string | null;
  deviceSessionId?: string | null;
  authMethod: string;
  createdAt: string;
}

export interface LoginActivityStats {
  totalLogins: number;
  successfulToday: number;
  failedToday: number;
  activeSessions: number;
  activeDevices: number;
}

export interface ActiveSessionItem {
  id: string;
  sessionTokenMasked: string;
  createdAt: string;
  lastActivityAt: string;
  userAgent?: string | null;
  deviceType?: string;
  browser?: string;
  os?: string;
  ip?: string;
  isCurrent?: boolean;
}

export interface UserLoginOverview {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    avatar?: string;
  };
  totalLogins: number;
  successfulLogins: number;
  failedAttempts: number;
  activeSessions: ActiveSessionItem[];
  lastLogin?: {
    date: string;
    time: string;
    timestamp: string;
    ip: string;
    device: string;
    browser: string;
    os: string;
    status: string;
  } | null;
  loginHistory: LoginActivity[];
}

export interface LoginActivityFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  deviceType?: string;
  os?: string;
  browser?: string;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  userId?: string;
}

export interface SecurityAuditLogItem {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetUserId?: string | null;
  targetUserName?: string | null;
  targetSessionId?: string | null;
  ipAddress?: string | null;
  details?: string | null;
  createdAt: string;
}

export const loginActivityService = {
  // Query paginated and filtered login events
  getActivities: async (params?: LoginActivityFilterParams): Promise<{
    activities: LoginActivity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const response = await api.get('/admin/login-activity', { params });
    return response.data;
  },

  // Query high-level dashboard metrics
  getStats: async (): Promise<LoginActivityStats> => {
    const response = await api.get('/admin/login-activity/stats');
    return response.data;
  },

  // Query user-centric login history & active sessions
  getUserOverview: async (userId: string): Promise<UserLoginOverview> => {
    const response = await api.get(`/admin/login-activity/user/${userId}`);
    return response.data;
  },

  // Admin action: Revoke a specific user session / device
  revokeDevice: async (sessionId: string, userId?: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/admin/login-activity/revoke-device', {
      sessionId,
      userId,
      reason
    });
    return response.data;
  },

  // Export filtered login audit log to CSV
  exportCsv: async (params?: LoginActivityFilterParams): Promise<Blob> => {
    const response = await api.get('/admin/login-activity/export-csv', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Security audit log history
  getAuditLogs: async (): Promise<SecurityAuditLogItem[]> => {
    const response = await api.get('/admin/login-activity/audit-logs');
    return response.data;
  },

  // Get data retention setting
  getRetentionSetting: async (): Promise<{ retentionDays: number }> => {
    const response = await api.get('/admin/login-activity/retention');
    return response.data;
  },

  // Update data retention setting
  setRetentionSetting: async (retentionDays: number): Promise<{ success: boolean; retentionDays: number }> => {
    const response = await api.post('/admin/login-activity/retention', { retentionDays });
    return response.data;
  }
};
