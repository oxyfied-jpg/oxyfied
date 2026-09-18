import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Loader2,
  Eye,
  X,
  Download,
  RefreshCw,
  Monitor,
  Laptop,
  Smartphone,
  Tablet,
  CheckCircle2,
  XCircle,
  LogOut,
  Clock,
  AlertTriangle,
  Globe,
  Cpu,
  Layers,
  Shield,
  Copy,
  Check,
  Trash2,
  UserCheck,
  Calendar,
  SlidersHorizontal,
  Phone
} from 'lucide-react';
import {
  loginActivityService,
  type LoginActivity,
  type LoginActivityStats,
  type UserLoginOverview,
  type LoginActivityFilterParams
} from '../../../services/loginActivityService';

export const AdminLoginActivity: React.FC = () => {
  // Data state
  const [activities, setActivities] = useState<LoginActivity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // KPI summary stats
  const [stats, setStats] = useState<LoginActivityStats>({
    totalLogins: 0,
    successfulToday: 0,
    failedToday: 0,
    activeSessions: 0,
    activeDevices: 0
  });

  // Filter & Pagination parameters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [osFilter, setOsFilter] = useState('all');
  const [browserFilter, setBrowserFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Selected Activity / User Detail Modal state
  const [selectedActivity, setSelectedActivity] = useState<LoginActivity | null>(null);
  const [userOverview, setUserOverview] = useState<UserLoginOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Remove Device Confirmation Modal state
  const [deviceToRemove, setDeviceToRemove] = useState<{ sessionId: string; deviceLabel: string; userId?: string } | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Data Retention Settings Modal state
  const [isRetentionModalOpen, setIsRetentionModalOpen] = useState(false);
  const [retentionDays, setRetentionDays] = useState(90);
  const [retentionSaving, setRetentionSaving] = useState(false);
  const [retentionFeedback, setRetentionFeedback] = useState<string | null>(null);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Fetch KPI statistics
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await loginActivityService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch paginated login activities
  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Compute dates if pre-set range
      let sDate = startDate;
      let eDate = endDate;
      const now = new Date();

      if (dateRange === 'today') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        sDate = todayStart.toISOString();
      } else if (dateRange === '7days') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        sDate = d.toISOString();
      } else if (dateRange === '30days') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        sDate = d.toISOString();
      } else if (dateRange === '90days') {
        const d = new Date();
        d.setDate(d.getDate() - 90);
        sDate = d.toISOString();
      }

      const params: LoginActivityFilterParams = {
        page,
        limit,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        deviceType: deviceFilter !== 'all' ? deviceFilter : undefined,
        os: osFilter !== 'all' ? osFilter : undefined,
        browser: browserFilter !== 'all' ? browserFilter : undefined,
        startDate: sDate || undefined,
        endDate: eDate || undefined,
        sortBy,
        sortOrder
      };

      const res = await loginActivityService.getActivities(params);
      setActivities(res.activities);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load login activities:', err);
      setError('Unable to load login activity records. Please verify administrator authorization.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, deviceFilter, osFilter, browserFilter, dateRange, startDate, endDate, sortBy, sortOrder, page, limit]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Open dossier and fetch user-centric overview
  const handleOpenDossier = async (activity: LoginActivity) => {
    setSelectedActivity(activity);
    setIsDossierOpen(true);

    if (activity.userId) {
      try {
        setOverviewLoading(true);
        const data = await loginActivityService.getUserOverview(activity.userId);
        setUserOverview(data);
      } catch (err) {
        console.error('Failed to fetch user overview:', err);
        setUserOverview(null);
      } finally {
        setOverviewLoading(false);
      }
    } else {
      setUserOverview(null);
    }
  };

  // Revoke device action
  const handleConfirmRevoke = async () => {
    if (!deviceToRemove) return;
    try {
      setIsRevoking(true);
      await loginActivityService.revokeDevice(deviceToRemove.sessionId, deviceToRemove.userId);

      // Refresh overview if open
      if (selectedActivity?.userId) {
        const refreshed = await loginActivityService.getUserOverview(selectedActivity.userId);
        setUserOverview(refreshed);
      }

      // Refresh table & stats
      fetchActivities();
      fetchStats();
      setDeviceToRemove(null);
    } catch (err) {
      console.error('Failed to revoke device:', err);
      alert('Failed to revoke device session.');
    } finally {
      setIsRevoking(false);
    }
  };

  // Export CSV handler
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const params: LoginActivityFilterParams = {
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        deviceType: deviceFilter !== 'all' ? deviceFilter : undefined,
        os: osFilter !== 'all' ? osFilter : undefined,
        browser: browserFilter !== 'all' ? browserFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };

      const blob = await loginActivityService.exportCsv(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `oxyfied_login_audit_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export login activity CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  // Save retention setting handler
  const handleSaveRetention = async () => {
    try {
      setRetentionSaving(true);
      const res = await loginActivityService.setRetentionSetting(retentionDays);
      setRetentionFeedback(`Retention policy updated. ${res.retentionDays} days active.`);
      setTimeout(() => {
        setIsRetentionModalOpen(false);
        setRetentionFeedback(null);
        fetchStats();
        fetchActivities();
      }, 1200);
    } catch (err) {
      setRetentionFeedback('Failed to update retention policy.');
    } finally {
      setRetentionSaving(false);
    }
  };

  // Clipboard copy helper
  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Sort toggle helper
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // Reset filters helper
  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDeviceFilter('all');
    setOsFilter('all');
    setBrowserFilter('all');
    setDateRange('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  // Format Device Icon
  const getDeviceIcon = (deviceType?: string | null) => {
    const type = (deviceType || '').toLowerCase();
    if (type.includes('mobile') || type.includes('phone')) {
      return <Smartphone className="w-4 h-4 text-emerald-600" />;
    }
    if (type.includes('tablet') || type.includes('ipad')) {
      return <Tablet className="w-4 h-4 text-purple-600" />;
    }
    if (type.includes('laptop')) {
      return <Laptop className="w-4 h-4 text-blue-600" />;
    }
    return <Monitor className="w-4 h-4 text-amber-600" />;
  };

  // Format Status Badge
  const getStatusBadge = (status: string, failureReason?: string | null) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Successful</span>
          </span>
        );
      case 'FAILED':
        return (
          <span 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs"
            title={failureReason || 'Authentication failed'}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Failed</span>
          </span>
        );
      case 'LOGGED_OUT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-200 shadow-xs">
            <LogOut className="w-3.5 h-3.5 text-stone-500" />
            <span>Logged Out</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Expired</span>
          </span>
        );
      case 'BLOCKED':
      case 'DEVICE_REMOVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-indigo-600" />
            <span>{status === 'DEVICE_REMOVED' ? 'Device Removed' : 'Blocked'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
            {status}
          </span>
        );
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shadow-xs">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-stone-900 tracking-tight">
              Login Activity & Device Details
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time audit log of authenticated logins, active devices, client telemetry, and security events.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => { fetchStats(); fetchActivities(); }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : 'text-stone-500'}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsRetentionModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Configure data retention policy"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
            <span>Retention Policy</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={isExporting || total === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B1120] hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-amber-400" />}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* ========================================== */}
      {/* 1. DASHBOARD SUMMARY KPI CARDS */}
      {/* ========================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Logins */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs hover:border-amber-400/50 transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Total Logins</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-display font-extrabold text-stone-900">
              {statsLoading ? '...' : stats.totalLogins.toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">All-Time</span>
          </div>
        </div>

        {/* Successful Today */}
        <div className="bg-white border border-emerald-200/70 rounded-2xl p-4 shadow-xs hover:border-emerald-400 transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Successful Today</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-display font-extrabold text-emerald-700">
              {statsLoading ? '...' : stats.successfulToday.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">✓ Verified</span>
          </div>
        </div>

        {/* Failed Today */}
        <div className="bg-white border border-rose-200/70 rounded-2xl p-4 shadow-xs hover:border-rose-400 transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Failed Today</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-display font-extrabold text-rose-700">
              {statsLoading ? '...' : stats.failedToday.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">✕ Rejections</span>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs hover:border-amber-400 transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Active Sessions</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-display font-extrabold text-stone-900">
              {statsLoading ? '...' : stats.activeSessions.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* Active Devices */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs col-span-2 sm:col-span-1 hover:border-amber-400 transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Active Devices</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-display font-extrabold text-stone-900">
              {statsLoading ? '...' : stats.activeDevices.toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">Devices</span>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. SEARCH & ADVANCED FILTERS TOOLBAR */}
      {/* ========================================== */}
      <div className="bg-white border border-stone-200/80 p-4 rounded-2xl shadow-xs space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="relative sm:col-span-2 lg:col-span-4">
            <input
              type="text"
              placeholder="Search user, email, phone, device, browser, OS..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3.5 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Status filter */}
          <div className="relative lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="success">✓ Successful</option>
              <option value="failed">✕ Failed</option>
              <option value="logged_out">↪ Logged Out</option>
              <option value="blocked">⚠ Blocked</option>
              <option value="device_removed">⚠ Device Removed</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Device Type filter */}
          <div className="relative lg:col-span-2">
            <select
              value={deviceFilter}
              onChange={(e) => { setDeviceFilter(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Devices</option>
              <option value="desktop">💻 Desktop</option>
              <option value="laptop">💻 Laptop</option>
              <option value="mobile">📱 Mobile</option>
              <option value="tablet">📱 Tablet</option>
            </select>
            <Monitor className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* OS filter */}
          <div className="relative lg:col-span-2">
            <select
              value={osFilter}
              onChange={(e) => { setOsFilter(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Operating Systems</option>
              <option value="Windows">Windows</option>
              <option value="macOS">macOS</option>
              <option value="iOS">iOS / iPadOS</option>
              <option value="Android">Android</option>
              <option value="Linux">Linux</option>
            </select>
            <Cpu className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Browser filter */}
          <div className="relative lg:col-span-2">
            <select
              value={browserFilter}
              onChange={(e) => { setBrowserFilter(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Browsers</option>
              <option value="Chrome">Chrome</option>
              <option value="Safari">Safari</option>
              <option value="Edge">Edge</option>
              <option value="Firefox">Firefox</option>
              <option value="Opera">Opera</option>
              <option value="Brave">Brave</option>
            </select>
            <Globe className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Secondary filter controls (Date Range, Sort, Reset) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3 text-stone-400" />
              Date:
            </span>
            <select
              value={dateRange}
              onChange={(e) => { setDateRange(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            {/* Records per page */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-stone-500 font-medium">Per Page:</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none cursor-pointer"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Reset button */}
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 font-semibold transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 3. LOGIN ACTIVITY TABLE (DESKTOP) & CARDS (MOBILE) */}
      {/* ========================================== */}
      <div className="bg-white border border-stone-200/80 rounded-3xl shadow-xs overflow-hidden">
        {loading && activities.length === 0 ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
            <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Loading activity log...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Shield className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-800">No login activity records match your criteria.</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">Try adjusting the search query, date filter, or reset your search parameters.</p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View (md and above) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50/90 border-b border-stone-100 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-4 cursor-pointer hover:text-stone-900 transition-colors" onClick={() => handleSort('userName')}>
                      User <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-stone-900 transition-colors" onClick={() => handleSort('status')}>
                      Status <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-stone-900 transition-colors" onClick={() => handleSort('deviceType')}>
                      Device <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-stone-900 transition-colors" onClick={() => handleSort('browserName')}>
                      Browser <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-stone-900 transition-colors" onClick={() => handleSort('phone')}>
                      Phone Number <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-stone-900 transition-colors" onClick={() => handleSort('createdAt')}>
                      Login Time <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
                    </th>
                    <th className="px-6 py-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {activities.map((act) => {
                    const loginDate = new Date(act.createdAt);
                    const formattedDate = loginDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
                    const formattedTime = loginDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <tr
                        key={act.id}
                        onClick={() => handleOpenDossier(act)}
                        className="hover:bg-amber-50/30 cursor-pointer transition-colors group"
                      >
                        {/* 1. User info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold flex items-center justify-center text-xs shadow-xs ring-1 ring-stone-200 flex-shrink-0">
                              {(act.userName || act.email)[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-stone-900 block group-hover:text-amber-600 transition-colors truncate">
                                {act.userName || 'Anonymous / Unregistered'}
                              </span>
                              <span className="text-[11px] text-stone-500 font-mono block truncate max-w-[180px]">
                                {act.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Status */}
                        <td className="px-6 py-4">
                          {getStatusBadge(act.status, act.failureReason)}
                        </td>

                        {/* 3. Device (Device Type + OS) */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex-shrink-0">
                              {getDeviceIcon(act.deviceType)}
                            </div>
                            <div>
                              <span className="font-semibold text-stone-900 block leading-tight">
                                {act.deviceType || 'Desktop'}
                              </span>
                              <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                                {act.operatingSystem || 'Unknown OS'}{act.osVersion ? ` ${act.osVersion}` : ''}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 4. Browser */}
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-bold text-stone-800 block">
                              {act.browserName || 'Browser'} {act.browserVersion ? `v${act.browserVersion.split('.')[0]}` : ''}
                            </span>
                            <span className="text-[11px] text-stone-500 block">
                              {act.browserEngine ? `${act.browserEngine} Engine` : 'Browser'}
                            </span>
                          </div>
                        </td>

                        {/* 5. Phone Number */}
                        <td className="px-6 py-4">
                          {act.phone ? (
                            <span className="font-mono text-xs font-semibold text-stone-900 block">
                              {act.phone}
                            </span>
                          ) : (
                            <span className="text-xs text-stone-400 italic font-normal">
                              Not provided
                            </span>
                          )}
                        </td>

                        {/* 6. Login Time */}
                        <td className="px-6 py-4">
                          <span className="font-medium text-stone-800 block">{formattedDate}</span>
                          <span className="text-[11px] text-stone-500 font-mono block">{formattedTime}</span>
                        </td>

                        {/* 7. Details */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenDossier(act); }}
                            className="p-2 rounded-xl text-stone-400 group-hover:text-stone-900 group-hover:bg-white border border-transparent group-hover:border-stone-200 transition-all shadow-xs cursor-pointer"
                            title="Inspect complete technical dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (sm and below) */}
            <div className="md:hidden divide-y divide-stone-100">
              {activities.map((act) => {
                const loginDate = new Date(act.createdAt);
                const formattedDate = loginDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
                const formattedTime = loginDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={act.id}
                    onClick={() => handleOpenDossier(act)}
                    className="p-4 space-y-3 hover:bg-amber-50/30 transition-colors cursor-pointer"
                  >
                    {/* Top: User & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {(act.userName || act.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 text-xs block">{act.userName || 'Anonymous / Unregistered'}</span>
                          <span className="text-[10px] text-stone-500 font-mono block">{act.email}</span>
                        </div>
                      </div>
                      {getStatusBadge(act.status, act.failureReason)}
                    </div>

                    {/* Mid: Device + OS & Browser */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50/70 p-2.5 rounded-xl border border-stone-200/60">
                      <div className="flex items-center gap-2 min-w-0">
                        {getDeviceIcon(act.deviceType)}
                        <div className="min-w-0">
                          <span className="font-semibold text-stone-900 block truncate leading-tight">
                            {act.deviceType || 'Desktop'}
                          </span>
                          <span className="text-[10px] text-stone-500 block truncate leading-tight">
                            {act.operatingSystem || 'OS'}{act.osVersion ? ` ${act.osVersion}` : ''}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-stone-800 block truncate">
                          {act.browserName || 'Browser'} {act.browserVersion ? `v${act.browserVersion.split('.')[0]}` : ''}
                        </span>
                        <span className="text-[10px] text-stone-500 block truncate">
                          {act.browserEngine ? `${act.browserEngine} Engine` : 'Browser'}
                        </span>
                      </div>
                    </div>

                    {/* Phone Number & Login Time */}
                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-stone-400 flex-shrink-0" />
                        <span className="font-mono font-medium text-stone-800 text-[11px]">
                          {act.phone || <span className="text-stone-400 italic">Not provided</span>}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {formattedDate} {formattedTime}
                      </span>
                    </div>

                    {/* Bottom action */}
                    <div className="flex items-center justify-end text-[11px] font-bold text-amber-600 pt-1 border-t border-stone-100/80">
                      <span>View Technical Details →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Server-Side Pagination Footer */}
        <div className="px-6 py-4 bg-stone-50/70 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-stone-600 font-medium">
            Showing <span className="font-bold text-stone-900">{startRecord}–{endRecord}</span> of <span className="font-bold text-stone-900">{total.toLocaleString()}</span> login events
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1 || loading}
                className="p-1.5 bg-white border border-stone-200 hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-stone-700 transition-colors shadow-xs cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 text-xs font-bold text-stone-800 bg-white border border-stone-200 rounded-xl shadow-xs">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages || loading}
                className="p-1.5 bg-white border border-stone-200 hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-stone-700 transition-colors shadow-xs cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* 4. COMPLETE DEVICE & LOGIN DOSSIER MODAL */}
      {/* ========================================== */}
      {isDossierOpen && selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col text-left shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/90">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                  {getDeviceIcon(selectedActivity.deviceType)}
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-stone-900 leading-tight">
                    Login Activity Dossier
                  </h3>
                  <p className="text-[11px] text-stone-500 font-mono">
                    Log ID: {selectedActivity.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDossierOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-800 rounded-xl hover:bg-stone-200/60 transition-all cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              {/* Top Overview banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0B1120] text-white shadow-md">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-display font-black text-lg shadow-lg">
                    {(selectedActivity.userName || selectedActivity.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-white">
                      {selectedActivity.userName || 'Unregistered / Guest'}
                    </h4>
                    <span className="text-xs text-slate-300 font-mono block">{selectedActivity.email}</span>
                    {selectedActivity.phone && (
                      <span className="text-xs text-amber-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-amber-400" />
                        <span>{selectedActivity.phone}</span>
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mt-1">
                      Role: {selectedActivity.role || 'GUEST / UNKNOWN'}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Status</span>
                  <div className="mt-1">{getStatusBadge(selectedActivity.status, selectedActivity.failureReason)}</div>
                </div>
              </div>

              {/* Grid of Telemetry Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. USER & CONTACT INFORMATION */}
                <div className="p-4 bg-stone-50/70 border border-stone-200/80 rounded-2xl space-y-2.5">
                  <h5 className="text-[10px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-200 pb-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                    User & Contact Details
                  </h5>
                  <div className="space-y-1.5 text-xs text-stone-700">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Name:</span>
                      <span className="font-bold text-stone-900">{selectedActivity.userName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Email:</span>
                      <span className="font-mono">{selectedActivity.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Phone Number:</span>
                      {selectedActivity.phone ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-amber-800">{selectedActivity.phone}</span>
                          <button
                            onClick={() => copyToClipboard(selectedActivity.phone!, 'phone')}
                            className="p-1 text-stone-400 hover:text-stone-800 rounded transition-colors"
                            title="Copy Phone Number"
                          >
                            {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">Not provided</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">User ID:</span>
                      <span className="font-mono text-[10px] text-stone-600 bg-stone-100 px-1.5 py-0.2 rounded">
                        {selectedActivity.userId || 'Guest'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Account Role:</span>
                      <span className="font-bold uppercase text-[10px] bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.2 rounded-full">
                        {selectedActivity.role || 'Guest'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. LOGIN EVENT INFORMATION */}
                <div className="p-4 bg-stone-50/70 border border-stone-200/80 rounded-2xl space-y-2.5">
                  <h5 className="text-[10px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-200 pb-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Login Event Information
                  </h5>
                  <div className="space-y-1.5 text-xs text-stone-700">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Login Time:</span>
                      <span className="font-mono font-medium">{new Date(selectedActivity.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Event Type:</span>
                      <span className="font-bold">{selectedActivity.eventType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Auth Method:</span>
                      <span className="font-mono font-medium">{selectedActivity.authMethod}</span>
                    </div>
                    {selectedActivity.failureReason && (
                      <div className="flex justify-between text-rose-700">
                        <span className="font-medium">Failure Reason:</span>
                        <span className="font-semibold text-right max-w-[180px]">{selectedActivity.failureReason}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-1 border-t border-stone-200/60">
                      <span className="text-stone-500">Masked Session:</span>
                      <span className="font-mono text-[11px] bg-stone-200/70 px-2 py-0.5 rounded">
                        {selectedActivity.sessionId ? `${selectedActivity.sessionId.slice(0, 4)}••••••••${selectedActivity.sessionId.slice(-4)}` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. DEVICE & DISPLAY TELEMETRY */}
                <div className="p-4 bg-stone-50/70 border border-stone-200/80 rounded-2xl space-y-2.5">
                  <h5 className="text-[10px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-200 pb-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-600" />
                    Device & Platform Telemetry
                  </h5>
                  <div className="space-y-1.5 text-xs text-stone-700">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Device Category:</span>
                      <span className="font-bold text-stone-900">{selectedActivity.deviceType || 'Desktop'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Operating System:</span>
                      <span className="font-semibold text-stone-900">{selectedActivity.operatingSystem} {selectedActivity.osVersion || ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Platform:</span>
                      <span className="font-mono text-[11px]">{selectedActivity.platform || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Screen Resolution:</span>
                      <span className="font-mono">{selectedActivity.screenWidth && selectedActivity.screenHeight ? `${selectedActivity.screenWidth} x ${selectedActivity.screenHeight}` : '1920 x 1080'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Viewport Dimensions:</span>
                      <span className="font-mono">{selectedActivity.viewportWidth && selectedActivity.viewportHeight ? `${selectedActivity.viewportWidth} x ${selectedActivity.viewportHeight}` : '1536 x 730'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Pixel Ratio / Touch:</span>
                      <span>{selectedActivity.devicePixelRatio || 1}x • {selectedActivity.touchSupport ? 'Touch Enabled' : 'No Touch'}</span>
                    </div>
                  </div>
                </div>

                {/* 4. BROWSER SPECIFICATIONS */}
                <div className="p-4 bg-stone-50/70 border border-stone-200/80 rounded-2xl space-y-2.5">
                  <h5 className="text-[10px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-200 pb-1.5">
                    <Globe className="w-3.5 h-3.5 text-purple-600" />
                    Browser Specifications
                  </h5>
                  <div className="space-y-1.5 text-xs text-stone-700">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Browser:</span>
                      <span className="font-bold text-stone-900">{selectedActivity.browserName || 'Chrome'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Version:</span>
                      <span className="font-mono">{selectedActivity.browserVersion || 'Latest'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Rendering Engine:</span>
                      <span className="font-semibold">{selectedActivity.browserEngine || 'Blink / WebKit'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Security / Sandbox:</span>
                      <span className="text-emerald-700 font-medium">Standard Web Isolation</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RAW USER AGENT (Expandable) */}
              <div className="p-4 bg-stone-900 text-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Raw User Agent String
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedActivity.userAgent || '', 'ua')}
                    className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedField === 'ua' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'ua' ? 'Copied' : 'Copy UA'}</span>
                  </button>
                </div>
                <pre className="font-mono text-[11px] text-slate-300 bg-slate-950/60 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap break-all leading-relaxed border border-slate-800">
                  {selectedActivity.userAgent || 'No User-Agent header available for this request.'}
                </pre>
              </div>

              {/* ========================================== */}
              {/* 5. USER ACTIVE SESSIONS & DEVICE MANAGEMENT */}
              {/* ========================================== */}
              {selectedActivity.userId && (
                <div className="space-y-3 pt-2 border-t border-stone-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        Active Devices & Sessions ({userOverview?.activeSessions.length || 0})
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Manage concurrent signed-in devices for this account.
                      </p>
                    </div>
                  </div>

                  {overviewLoading ? (
                    <div className="p-6 text-center">
                      <Loader2 className="w-5 h-5 text-amber-500 animate-spin mx-auto mb-1" />
                      <span className="text-[11px] text-stone-400">Syncing active device telemetry...</span>
                    </div>
                  ) : !userOverview?.activeSessions || userOverview.activeSessions.length === 0 ? (
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 text-center text-xs text-stone-500 italic">
                      No currently active sessions found for this user account.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {userOverview.activeSessions.map((sess, idx) => (
                        <div
                          key={sess.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-stone-50/80 border border-stone-200/80 rounded-2xl shadow-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-700 shadow-xs">
                              {getDeviceIcon(sess.deviceType)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-stone-900 text-xs">
                                  Device {idx + 1}: {sess.browser || 'Browser'} on {sess.os || 'OS'}
                                </span>
                                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Active
                                </span>
                              </div>
                              <div className="text-[11px] text-stone-500 font-mono space-x-2 mt-0.5">
                                <span>Last Active: {new Date(sess.lastActivityAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span>•</span>
                                <span>Token: {sess.sessionTokenMasked}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => setDeviceToRemove({ sessionId: sess.id, deviceLabel: `${sess.browser || 'Device'} (${sess.os || 'OS'})`, userId: selectedActivity.userId || undefined })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-200 text-rose-600 text-xs font-semibold rounded-xl transition-all self-start sm:self-center cursor-pointer shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Device</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between">
              <span className="text-[11px] text-stone-400">
                Audited by Oxyfied Security Architecture
              </span>
              <button
                onClick={() => setIsDossierOpen(false)}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 transition-colors cursor-pointer shadow-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 6. REMOVE DEVICE CONFIRMATION MODAL */}
      {/* ========================================== */}
      {deviceToRemove && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 text-left shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-display font-bold text-lg text-stone-900">Remove this device?</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                This will immediately invalidate the session token and sign the user out of <span className="font-bold text-stone-800">{deviceToRemove.deviceLabel}</span>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeviceToRemove(null)}
                disabled={isRevoking}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                disabled={isRevoking}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {isRevoking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Remove Device</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 7. DATA RETENTION CONFIGURATION MODAL */}
      {/* ========================================== */}
      {isRetentionModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-stone-900">Login Activity Retention</h4>
                  <p className="text-[11px] text-stone-500">Configure audit log lifecycle policy</p>
                </div>
              </div>
              <button
                onClick={() => setIsRetentionModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700 pt-2">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                Automatic Purge Duration
              </label>
              <select
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
              >
                <option value={30}>30 Days (Fast rotation)</option>
                <option value={90}>90 Days (Recommended standard)</option>
                <option value={180}>180 Days (Semi-annual audit)</option>
                <option value={365}>1 Year (Extended compliance)</option>
                <option value={3650}>Indefinite (Keep all records)</option>
              </select>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Saving will retain login records within the chosen window and automatically clean up older historical events.
              </p>

              {retentionFeedback && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
                  {retentionFeedback}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
              <button
                onClick={() => setIsRetentionModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRetention}
                disabled={retentionSaving}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#0B1120] hover:bg-slate-800 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {retentionSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-amber-400" />}
                <span>Save Policy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
