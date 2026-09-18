import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Ban,
  Download,
  Copy,
  Check,
  Eye,
  Layers,
  Clock,
  ShieldCheck,
  Loader2,
  Trash2,
  Edit,
  X,
  FolderGit2,
  ExternalLink,
  FileText
} from 'lucide-react';
import { CertificateDesigner } from '../../../components/certificate/CertificateDesigner';
import { CertificateCanvas } from '../../../components/certificate/CertificateCanvas';
import { CertificatePreviewModal } from '../../../components/certificate/CertificatePreviewModal';
import type {
  CertificateTemplate,
  IssuedCertificate,
  CertificateHistoryItem
} from '../../../types/certificate';
import { certificateService } from '../../../services/certificateService';
import { courseService } from '../../../services/courseService';
import { userService } from '../../../services/userService';
import api from '../../../services/api';

export const AdminCertificates: React.FC = () => {
  // Main view state: 'list' | 'designer'
  const [viewMode, setViewMode] = useState<'list' | 'designer'>('list');
  const [activeTab, setActiveTab] = useState<'templates' | 'issued' | 'requests' | 'audit'>('templates');

  // Templates state
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null);

  // Certificates list state
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Certificate Requests state
  const [requests, setRequests] = useState<any[]>([]);
  const [requestSearch, setRequestSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');

  // Submissions Viewer Modal
  const [selectedReqForProjects, setSelectedReqForProjects] = useState<any | null>(null);
  const [studentProjects, setStudentProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);

  // Grant Confirmation Modal
  const [targetReqForGrant, setTargetReqForGrant] = useState<any | null>(null);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [isGranting, setIsGranting] = useState(false);

  // Reject Modal
  const [targetReqForReject, setTargetReqForReject] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');

  // Loading & Feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Preview Modal
  const [previewCert, setPreviewCert] = useState<IssuedCertificate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<CertificateTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Manual Generation Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualUserId, setManualUserId] = useState('');
  const [manualCourseId, setManualCourseId] = useState('');
  const [manualTemplateId, setManualTemplateId] = useState('');
  const [manualIssueDate, setManualIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualCompletionDate, setManualCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Reissue / Revoke Modals
  const [actionTargetCert, setActionTargetCert] = useState<IssuedCertificate | null>(null);
  const [actionType, setActionType] = useState<'reissue' | 'revoke' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // History Audit Modal
  const [historyCert, setHistoryCert] = useState<IssuedCertificate | null>(null);
  const [historyLogs, setHistoryLogs] = useState<CertificateHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Toast / Copy helper
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tmplList, certList, reqList, courseList, userList] = await Promise.all([
        certificateService.getTemplates(),
        certificateService.getAdminCertificates(),
        certificateService.getAdminCertificateRequests().catch(() => []),
        courseService.getAdminCourses(),
        userService.getUsers().catch(() => [])
      ]);
      setTemplates(Array.isArray(tmplList) ? tmplList : []);
      setCertificates(Array.isArray(certList) ? certList : []);
      setRequests(Array.isArray(reqList) ? reqList : []);
      setCourses(Array.isArray(courseList) ? courseList : ((courseList as any)?.courses || []));
      setUsers(Array.isArray(userList) ? userList : ((userList as any)?.users || []));
      setError(null);
    } catch (err: any) {
      console.error('Failed to load certificates suite:', err);
      setError('Failed to load certificate templates and credentials registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  // Template Actions
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setViewMode('designer');
  };

  const handleEditTemplate = (tmpl: CertificateTemplate) => {
    setEditingTemplate(tmpl);
    setViewMode('designer');
  };

  const handleDuplicateTemplate = async (tmpl: CertificateTemplate) => {
    try {
      setLoading(true);
      const duplicated = await certificateService.duplicateTemplate(tmpl.id);
      setTemplates((prev) => [duplicated, ...prev]);
      showNotification(`Duplicated template "${tmpl.name}".`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to duplicate template.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (tmpl: CertificateTemplate) => {
    if (!window.confirm(`Delete certificate template "${tmpl.name}"? This action cannot be undone.`)) return;
    try {
      setLoading(true);
      await certificateService.deleteTemplate(tmpl.id);
      setTemplates((prev) => prev.filter((t) => t.id !== tmpl.id));
      showNotification(`Deleted template "${tmpl.name}".`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete template.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTemplateStatus = async (tmpl: CertificateTemplate, field: 'isDefault' | 'isActive') => {
    try {
      const updated = await certificateService.toggleTemplateStatus(tmpl.id, field);
      setTemplates((prev) =>
        prev.map((t) => {
          if (field === 'isDefault') {
            return t.id === tmpl.id ? { ...t, isDefault: true, isActive: true } : { ...t, isDefault: false };
          }
          return t.id === tmpl.id ? updated : t;
        })
      );
      showNotification(`Updated template "${tmpl.name}" settings.`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update template status.');
    }
  };

  // Manual Generation Submit
  const handleOpenManualModal = () => {
    const userArr = Array.isArray(users) ? users : [];
    const courseArr = Array.isArray(courses) ? courses : [];
    const tmplArr = Array.isArray(templates) ? templates : [];
    setManualUserId(userArr[0]?.id || '');
    setManualCourseId(courseArr[0]?.id || '');
    const defTmpl = tmplArr.find((t) => t.isDefault) || tmplArr[0];
    setManualTemplateId(defTmpl?.id || '');
    setManualIssueDate(new Date().toISOString().split('T')[0]);
    setManualCompletionDate(new Date().toISOString().split('T')[0]);
    setIsManualModalOpen(true);
  };

  const handleManualGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUserId || !manualCourseId) {
      setError('Please select both a student and a target course track.');
      return;
    }

    try {
      setIsGenerating(true);
      const payload = {
        userId: manualUserId,
        courseId: manualCourseId,
        templateId: manualTemplateId || undefined,
        issueDate: manualIssueDate,
        completionDate: manualCompletionDate
      };
      const created = await certificateService.generateCertificateManual(payload);
      setCertificates((prev) => [created, ...prev]);
      setIsManualModalOpen(false);
      showNotification(`Certificate ${created.certificateNumber} successfully generated!`);
      // Open preview of newly created certificate
      setPreviewCert(created);
      setPreviewTemplate(null);
      setIsPreviewOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate certificate.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Reissue / Revoke Action Handlers
  const handleOpenActionModal = (cert: IssuedCertificate, type: 'reissue' | 'revoke') => {
    setActionTargetCert(cert);
    setActionType(type);
    setActionReason('');
  };

  const handleExecuteAction = async () => {
    if (!actionTargetCert || !actionType) return;
    try {
      setIsProcessingAction(true);
      if (actionType === 'reissue') {
        const reissued = await certificateService.reissueCertificate(actionTargetCert.id, actionReason);
        setCertificates((prev) => prev.map((c) => (c.id === actionTargetCert.id ? reissued : c)));
        showNotification(`Certificate ${reissued.certificateNumber} reissued successfully.`);
      } else {
        const revoked = await certificateService.revokeCertificate(actionTargetCert.id, actionReason);
        setCertificates((prev) => prev.map((c) => (c.id === actionTargetCert.id ? revoked : c)));
        showNotification(`Certificate ${revoked.certificateNumber} has been revoked.`);
      }
      setActionTargetCert(null);
      setActionType(null);
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${actionType} certificate.`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // View Audit History
  const handleOpenHistory = async (cert: IssuedCertificate) => {
    setHistoryCert(cert);
    setIsHistoryOpen(true);
    try {
      setLoadingHistory(true);
      const logs = await certificateService.getCertificateHistory(cert.id);
      setHistoryLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Copy verification link
  const handleCopyLink = (certNumber: string) => {
    const url = `${window.location.origin}/verify-certificate/${certNumber}`;
    navigator.clipboard.writeText(url);
    setCopiedId(certNumber);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Download PDF directly
  const handleDownloadPdf = async (cert: IssuedCertificate) => {
    try {
      await certificateService.downloadPdf(cert.id, `Oxyfied-Certificate-${cert.certificateNumber}.pdf`);
    } catch (err) {
      setError('Failed to download certificate PDF.');
    }
  };

  // Open Submissions Modal
  const handleOpenProjectsModal = async (reqItem: any) => {
    setSelectedReqForProjects(reqItem);
    setIsProjectsModalOpen(true);
    try {
      setLoadingProjects(true);
      const res = await certificateService.getStudentCourseSubmissions(reqItem.id);
      setStudentProjects(res.submissions || []);
    } catch (err) {
      console.error(err);
      setStudentProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Open Grant Modal
  const handleOpenGrantModal = (reqItem: any) => {
    setTargetReqForGrant(reqItem);
    setIsGrantModalOpen(true);
  };

  // Confirm Grant
  const handleConfirmGrant = async () => {
    if (!targetReqForGrant) return;
    try {
      setIsGranting(true);
      const res = await certificateService.grantCertificateRequest(targetReqForGrant.id);
      setIsGrantModalOpen(false);
      setTargetReqForGrant(null);
      showNotification(`Certificate ${res.certificate.certificateNumber} successfully generated and granted to ${res.request.student.name}!`);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to grant certificate.');
    } finally {
      setIsGranting(false);
    }
  };

  // Open Reject Modal
  const handleOpenRejectModal = (reqItem: any) => {
    setTargetReqForReject(reqItem);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  // Confirm Reject
  const handleConfirmReject = async () => {
    if (!targetReqForReject) return;
    try {
      setIsRejecting(true);
      await certificateService.rejectCertificateRequest(targetReqForReject.id, rejectReason);
      setIsRejectModalOpen(false);
      setTargetReqForReject(null);
      showNotification(`Certificate request for ${targetReqForReject.student.name} marked as requiring further action.`);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject certificate request.');
    } finally {
      setIsRejecting(false);
    }
  };

  // Filtered Certificates
  const filteredCertificates = certificates.filter((c) => {
    const matchesSearch =
      c.certificateNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.user.name.toLowerCase().includes(search.toLowerCase()) ||
      c.user.email.toLowerCase().includes(search.toLowerCase()) ||
      c.course.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || c.courseId === courseFilter;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  // Filtered Certificate Requests
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.student.name.toLowerCase().includes(requestSearch.toLowerCase()) ||
      r.student.email.toLowerCase().includes(requestSearch.toLowerCase()) ||
      r.course.title.toLowerCase().includes(requestSearch.toLowerCase()) ||
      (r.certificate?.certificateNumber && r.certificate.certificateNumber.toLowerCase().includes(requestSearch.toLowerCase()));
    const matchesStatus = requestStatusFilter === 'all' || r.status === requestStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingRequestsCount = requests.filter((r) => r.status === 'pending').length;

  // Calculate statistics
  const totalIssued = certificates.filter((c) => c.status === 'issued').length;
  const totalRevoked = certificates.filter((c) => c.status === 'revoked').length;

  if (viewMode === 'designer') {
    return (
      <CertificateDesigner
        initialTemplate={editingTemplate}
        onSave={(saved) => {
          setTemplates((prev) => {
            const exists = prev.find((t) => t.id === saved.id);
            if (exists) return prev.map((t) => (t.id === saved.id ? saved : t));
            return [saved, ...prev];
          });
          setViewMode('list');
          showNotification(`Template "${saved.name}" saved.`);
        }}
        onCancel={() => setViewMode('list')}
      />
    );
  }

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-display font-extrabold text-stone-900">Certificate Hub</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/60">
              <ShieldCheck className="w-3 h-3 text-amber-600" />
              Dynamic Credentials Suite
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Design visual certificate templates, review student certificate applications & project submissions, issue credentials, or review cryptographic verification logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            onClick={handleOpenManualModal}
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Certificate</span>
          </button>

          <button
            onClick={handleCreateTemplate}
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Design Template</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-stone-200/80 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Active Templates</span>
          <span className="text-2xl font-display font-black text-stone-900 mt-1 block">
            {templates.filter((t) => t.isActive).length}
          </span>
        </div>
        <div className="bg-white border border-stone-200/80 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Issued Credentials</span>
          <span className="text-2xl font-display font-black text-emerald-600 mt-1 block">{totalIssued}</span>
        </div>
        <div className="bg-white border border-stone-200/80 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">Pending Requests</span>
          <span className="text-2xl font-display font-black text-amber-600 mt-1 block">{pendingRequestsCount}</span>
        </div>
        <div className="bg-white border border-stone-200/80 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Revoked</span>
          <span className="text-2xl font-display font-black text-rose-600 mt-1 block">{totalRevoked}</span>
        </div>
      </div>

      {/* Feedback alerts */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-stone-200 gap-2">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'templates'
              ? 'border-amber-500 text-amber-800 bg-amber-50/40 rounded-t-xl'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Certificate Templates ({templates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('issued')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'issued'
              ? 'border-amber-500 text-amber-800 bg-amber-50/40 rounded-t-xl'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Issued Registry ({certificates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'requests'
              ? 'border-amber-500 text-amber-800 bg-amber-50/40 rounded-t-xl'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Certificate Requests ({requests.length})</span>
          {pendingRequestsCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500 text-slate-950">
              {pendingRequestsCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: CERTIFICATE TEMPLATES GALLERY */}
      {activeTab === 'templates' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {loading && templates.length === 0 ? (
            <div className="p-16 text-center">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
              <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
                Loading Certificate Templates...
              </span>
            </div>
          ) : templates.length === 0 ? (
            <div className="bg-white border border-stone-200 p-12 rounded-3xl text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-stone-900 text-base">No Certificate Templates Found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Create a template in the visual designer to assign to courses and issue to students.
              </p>
              <button
                onClick={handleCreateTemplate}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Template</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="bg-white border border-stone-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group"
                >
                  {/* Template Visual Mini-Canvas Preview Container */}
                  <div
                    onClick={() => {
                      setPreviewTemplate(tmpl);
                      setPreviewCert(null);
                      setIsPreviewOpen(true);
                    }}
                    className="h-52 bg-[#EBE7DF] border-b border-stone-100 relative overflow-hidden flex items-center justify-center cursor-pointer group-hover:opacity-95 transition-opacity p-3"
                  >
                    <div className="transform scale-[0.27] sm:scale-[0.31] pointer-events-none origin-center">
                      <CertificateCanvas
                        orientation={tmpl.orientation}
                        backgroundImage={tmpl.backgroundImage}
                        elements={tmpl.elements || []}
                        isEditable={false}
                        zoom={1}
                      />
                    </div>

                    {/* Default & Active Tags overlay */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                      {tmpl.isDefault && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-xs flex items-center gap-1">
                          <Check className="w-3 h-3" /> System Default
                        </span>
                      )}
                      {!tmpl.isActive && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-800 text-white shadow-xs">
                          Deactivated
                        </span>
                      )}
                    </div>

                    {/* Preview overlay button */}
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 bg-white/90 backdrop-blur text-stone-900 rounded-xl text-xs font-bold shadow flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-amber-600" /> Full Preview
                      </span>
                    </div>
                  </div>

                  {/* Template Meta Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold text-stone-900 text-sm truncate">{tmpl.name}</h3>
                        <span className="text-[10px] font-mono uppercase font-semibold text-stone-400">
                          {tmpl.orientation}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                        {tmpl.description || 'Customizable certificate layout with dynamic variable placeholders.'}
                      </p>
                    </div>

                    {/* Statistics Row */}
                    <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 pt-2 border-t border-stone-100">
                      <span>Assigned Courses: <strong className="text-amber-700">{tmpl.coursesCount || 0}</strong></span>
                      <span>Issued: <strong className="text-stone-900">{tmpl.certificatesCount || 0}</strong></span>
                    </div>

                    {/* Template Card Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => handleEditTemplate(tmpl)}
                        className="flex-1 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Canvas</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDuplicateTemplate(tmpl)}
                          className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                          title="Duplicate Template"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleTemplateStatus(tmpl, 'isDefault')}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            tmpl.isDefault ? 'text-amber-600 bg-amber-50' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                          }`}
                          title={tmpl.isDefault ? 'Currently Default' : 'Set as System Default'}
                        >
                          <Award className="w-4 h-4" />
                        </button>

                        {!tmpl.isDefault && (
                          <button
                            onClick={() => handleDeleteTemplate(tmpl)}
                            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Delete Template"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ISSUED CERTIFICATES REGISTRY */}
      {activeTab === 'issued' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md bg-white border border-stone-200 p-1 rounded-2xl shadow-xs">
              <input
                type="text"
                placeholder="Filter by student name, email, course, or ID (e.g. OXY-2026-)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            {/* Filter Selectors */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="issued">Issued</option>
                <option value="reissued">Reissued</option>
                <option value="revoked">Revoked</option>
              </select>

              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer max-w-[200px] truncate"
              >
                <option value="all">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Certificates Table */}
          <div className="bg-white border border-stone-200/80 rounded-3xl shadow-xs overflow-hidden">
            {loading && certificates.length === 0 ? (
              <div className="p-16 text-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
                  Syncing certificates directory...
                </span>
              </div>
            ) : filteredCertificates.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-display font-bold text-stone-900 text-sm">No Issued Certificates Yet</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  No certificates have been issued yet. You can manually generate a certificate for any student or wait for students to complete 100% of their syllabus.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleOpenManualModal}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Issue First Certificate</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50/80 border-b border-stone-100 text-stone-500 font-semibold">
                      <th className="px-6 py-4">Recipient Student</th>
                      <th className="px-6 py-4">Course Track</th>
                      <th className="px-6 py-4">Certificate ID</th>
                      <th className="px-6 py-4">Issued Date</th>
                      <th className="px-6 py-4 text-center">Source</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {filteredCertificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-stone-50/60 transition-colors">
                        {/* Student */}
                        <td className="px-6 py-4 font-semibold text-stone-900">
                          <div className="flex flex-col">
                            <span>{cert.user.name}</span>
                            <span className="text-[11px] text-stone-400 font-mono font-normal">
                              {cert.user.email}
                            </span>
                          </div>
                        </td>

                        {/* Course */}
                        <td className="px-6 py-4 font-medium text-stone-700 max-w-xs truncate">
                          {cert.course.title}
                        </td>

                        {/* Certificate Number */}
                        <td className="px-6 py-4 font-mono font-bold text-amber-800">
                          {cert.certificateNumber}
                        </td>

                        {/* Issue Date */}
                        <td className="px-6 py-4 font-mono text-stone-500">
                          {new Date(cert.issueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>

                        {/* Source */}
                        <td className="px-6 py-4 text-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                            {cert.generatedBy}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              cert.status === 'issued'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : cert.status === 'reissued'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {cert.status === 'revoked' ? <Ban className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                            {cert.status}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                          {/* View Preview */}
                          <button
                            onClick={() => {
                              setPreviewCert(cert);
                              setPreviewTemplate(null);
                              setIsPreviewOpen(true);
                            }}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer inline-block"
                            title="View Certificate"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Download High-Res PDF */}
                          {cert.status !== 'revoked' && (
                            <button
                              onClick={() => handleDownloadPdf(cert)}
                              className="p-1.5 text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer inline-block"
                              title="Download High-Res PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}

                          {/* Copy Verification Link */}
                          <button
                            onClick={() => handleCopyLink(cert.certificateNumber)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer inline-block"
                            title="Copy Verification Link"
                          >
                            {copiedId === cert.certificateNumber ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          {/* Audit History */}
                          <button
                            onClick={() => handleOpenHistory(cert)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer inline-block"
                            title="Audit Log"
                          >
                            <Clock className="w-4 h-4" />
                          </button>

                          {/* Reissue Button */}
                          {cert.status !== 'revoked' && (
                            <button
                              onClick={() => handleOpenActionModal(cert, 'reissue')}
                              className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer inline-block"
                              title="Reissue Certificate"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}

                          {/* Revoke Button */}
                          {cert.status !== 'revoked' && (
                            <button
                              onClick={() => handleOpenActionModal(cert, 'revoke')}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-block"
                              title="Revoke Certificate"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CERTIFICATE REQUESTS & VERIFICATION WORKFLOW */}
      {activeTab === 'requests' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md bg-white border border-stone-200 p-1 rounded-2xl shadow-xs">
              <input
                type="text"
                placeholder="Filter requests by student name, email, or course..."
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={requestStatusFilter}
                onChange={(e) => setRequestStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses ({requests.length})</option>
                <option value="pending">Pending Review Only ({requests.filter(r => r.status === 'pending').length})</option>
                <option value="granted">Granted & Issued ({requests.filter(r => r.status === 'granted').length})</option>
                <option value="rejected">Requires Action ({requests.filter(r => r.status === 'rejected').length})</option>
              </select>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white border border-stone-200/80 rounded-3xl shadow-xs overflow-hidden">
            {loading && requests.length === 0 ? (
              <div className="p-16 text-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
                  Loading Certificate Requests...
                </span>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-display font-bold text-stone-900 text-sm">No Certificate Requests Found</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  When students complete their course syllabus and submit a certificate request, it will appear here for project verification and administrative review.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50/80 border-b border-stone-100 text-stone-500 font-semibold">
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Course Program</th>
                      <th className="px-6 py-4">Applied Date</th>
                      <th className="px-6 py-4 text-center">Projects Status</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {filteredRequests.map((reqItem) => {
                      const initials = reqItem.student?.name
                        ? reqItem.student.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
                        : 'ST';
                      const isPending = reqItem.status === 'pending';
                      const isGranted = reqItem.status === 'granted';

                      return (
                        <tr key={reqItem.id} className="hover:bg-stone-50/60 transition-colors">
                          {/* Student Details */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-800 font-bold text-xs">
                                {initials}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-stone-900">{reqItem.student?.name || 'Unknown Student'}</span>
                                <span className="text-[11px] text-stone-400 font-mono">{reqItem.student?.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Course */}
                          <td className="px-6 py-4">
                            <span className="font-semibold text-stone-900 block">{reqItem.course?.title}</span>
                            {reqItem.mentor && (
                              <span className="text-[11px] text-stone-500 block">Mentor: {reqItem.mentor.name}</span>
                            )}
                          </td>

                          {/* Applied Date */}
                          <td className="px-6 py-4 text-stone-500 font-mono">
                            {new Date(reqItem.requestedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>

                          {/* Project Submissions Badge */}
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleOpenProjectsModal(reqItem)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer"
                            >
                              <FolderGit2 className="w-3.5 h-3.5 text-amber-600" />
                              <span>{reqItem.submissionsCount || 0} Submissions</span>
                            </button>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 text-center">
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Pending Review
                              </span>
                            )}
                            {isGranted && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Granted
                              </span>
                            )}
                            {reqItem.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                Requires Action
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenProjectsModal(reqItem)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                              >
                                View Projects
                              </button>

                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleOpenRejectModal(reqItem)}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                                  >
                                    Reject
                                  </button>

                                  <button
                                    onClick={() => handleOpenGrantModal(reqItem)}
                                    className="px-4 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Award className="w-3.5 h-3.5" />
                                    <span>Grant Certificate</span>
                                  </button>
                                </>
                              )}

                              {isGranted && reqItem.certificate && (
                                <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                                  {reqItem.certificate.certificateNumber}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANUAL CERTIFICATE GENERATION MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <form
            onSubmit={handleManualGenerate}
            className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 text-left shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-base text-stone-900">
                  Manual Certificate Issuance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Manually issue an official credential for a student when automatic generation failed or for administrative awards.
            </p>

            {/* Select Student */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 block">1. Select Recipient Student</label>
              <select
                required
                value={manualUserId}
                onChange={(e) => setManualUserId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
              >
                {(Array.isArray(users) ? users : []).length === 0 ? (
                  <option value="" disabled>No students found</option>
                ) : (
                  (Array.isArray(users) ? users : []).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Select Course */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 block">2. Select Program Track</label>
              <select
                required
                value={manualCourseId}
                onChange={(e) => setManualCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
              >
                {(Array.isArray(courses) ? courses : []).length === 0 ? (
                  <option value="" disabled>No courses found</option>
                ) : (
                  (Array.isArray(courses) ? courses : []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Select Certificate Template */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 block">3. Certificate Template Layout</label>
              <select
                value={manualTemplateId}
                onChange={(e) => setManualTemplateId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
              >
                <option value="">Default Certificate Template</option>
                {(Array.isArray(templates) ? templates : []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.isDefault ? '(System Default)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 block">Issue Date</label>
                <input
                  type="date"
                  required
                  value={manualIssueDate}
                  onChange={(e) => setManualIssueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 block">Completion Date</label>
                <input
                  type="date"
                  required
                  value={manualCompletionDate}
                  onChange={(e) => setManualCompletionDate(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="px-5 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                <span>Issue Certificate</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REISSUE / REVOKE ACTION MODAL */}
      {actionTargetCert && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    actionType === 'reissue' ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                  }`}
                >
                  {actionType === 'reissue' ? <RotateCcw className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                </div>
                <h3 className="font-display font-bold text-base text-stone-900">
                  {actionType === 'reissue' ? 'Reissue Certificate' : 'Revoke Credential'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setActionTargetCert(null);
                  setActionType(null);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {actionType === 'reissue'
                ? `Reissuing will refresh the template snapshot for ${actionTargetCert.user.name} (${actionTargetCert.certificateNumber}) while preserving full historical audit logs.`
                : `Revoking credential ${actionTargetCert.certificateNumber} will immediately mark it invalid on the public verification registry.`}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 block">Reason / Audit Note</label>
              <textarea
                rows={3}
                required
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={
                  actionType === 'reissue'
                    ? 'e.g. Corrected name spelling / updated syllabus branding.'
                    : 'e.g. Academic integrity violation / duplicate enrollment.'
                }
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setActionTargetCert(null);
                  setActionType(null);
                }}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={isProcessingAction}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-md text-white flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
                  actionType === 'reissue'
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                }`}
              >
                {isProcessingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{actionType === 'reissue' ? 'Confirm Reissue' : 'Confirm Revoke'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT HISTORY TIMELINE MODAL */}
      {isHistoryOpen && historyCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h3 className="font-display font-bold text-sm text-stone-900">
                  Audit History: {historyCert.certificateNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {loadingHistory ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-1" />
                  <span className="text-xs text-stone-400 font-semibold">Loading history events...</span>
                </div>
              ) : historyLogs.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-6">No audit records found.</p>
              ) : (
                <div className="relative border-l-2 border-amber-200 pl-4 space-y-4 ml-2">
                  {historyLogs.map((log) => (
                    <div key={log.id} className="relative space-y-1">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-white" />
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold uppercase tracking-wider text-stone-800">
                          {log.action}
                        </span>
                        <span className="text-stone-400 font-mono">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600">{log.details || 'Event logged.'}</p>
                      <span className="text-[10px] text-stone-400 block font-mono">
                        By: {log.performedBy}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STUDENT PROJECTS INSPECTION MODAL */}
      {isProjectsModalOpen && selectedReqForProjects && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full p-6 text-left shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-stone-900">
                    Student Project Submissions
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {selectedReqForProjects.student?.name} • {selectedReqForProjects.course?.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProjectsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingProjects ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-7 h-7 text-amber-500 animate-spin mx-auto mb-2" />
                  <span className="text-xs text-stone-400">Loading project files...</span>
                </div>
              ) : studentProjects.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                  <FileText className="w-8 h-8 text-stone-400 mx-auto" />
                  <h4 className="font-bold text-xs text-stone-800">No project files found</h4>
                  <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                    The student has completed lessons but has not submitted distinct project assignments for this track.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {studentProjects.map((sub) => {
                    const baseURL = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : (typeof window !== 'undefined' ? window.location.origin : '');
                    const fileUrl = `${baseURL}${sub.filePath}`;

                    return (
                      <div
                        key={sub.id}
                        className="p-4 bg-stone-50 border border-stone-200/80 rounded-2xl flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1 truncate">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                            {sub.lesson?.title || 'Assignment'}
                          </span>
                          <h4 className="font-semibold text-xs text-stone-900 truncate">
                            {sub.fileName || 'Project Work'}
                          </h4>
                          <span className="text-[10px] text-stone-400 font-mono block">
                            Submitted: {new Date(sub.createdAt).toLocaleDateString()} • {sub.fileSize || 'Standard'}
                          </span>
                        </div>

                        <div>
                          {sub.googleDriveUrl ? (
                            <a
                              href={sub.googleDriveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                            >
                              <span>Drive Link</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-stone-200 text-stone-800 hover:bg-stone-300 flex items-center gap-1.5 transition-colors"
                            >
                              <span>Open File</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-stone-100">
              <span className="text-[11px] text-stone-400 font-medium">
                Verify that all required capstones meet passing criteria.
              </span>
              <button
                type="button"
                onClick={() => setIsProjectsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY GRANT CONFIRMATION MODAL */}
      {isGrantModalOpen && targetReqForGrant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-display font-bold text-base text-stone-900">
                  Grant Certificate?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGrantModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
              <p className="font-semibold text-stone-900 text-sm">
                Please confirm that you have reviewed the student's required projects and verified that they have been successfully completed.
              </p>
              <p className="text-stone-500">
                Once granted, the certificate will be generated for the student.
              </p>
            </div>

            <div className="text-xs text-stone-500 space-y-1">
              <p>
                <strong>Student:</strong> {targetReqForGrant.student?.name} ({targetReqForGrant.student?.email})
              </p>
              <p>
                <strong>Course Track:</strong> {targetReqForGrant.course?.title}
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsGrantModalOpen(false)}
                disabled={isGranting}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmGrant}
                disabled={isGranting}
                className="px-5 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGranting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                <span>Grant Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT REQUEST MODAL */}
      {isRejectModalOpen && targetReqForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <h3 className="font-display font-bold text-base text-stone-900">
                  Reject Certificate Request
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Specify the feedback or project requirements the student must resolve before re-applying for their certificate.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 block">Feedback / Reason for Student</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Capstone project 2 was not submitted. Please submit your project work and apply again."
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                disabled={isRejecting}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isRejecting}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isRejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                <span>Send Feedback & Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL PREVIEW MODAL */}
      <CertificatePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        certificate={previewCert}
        template={previewTemplate}
      />
    </div>
  );
};
