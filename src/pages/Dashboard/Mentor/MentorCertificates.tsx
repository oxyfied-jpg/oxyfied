import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
  FolderGit2,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  FileText
} from 'lucide-react';
import { certificateService } from '../../../services/certificateService';
import api from '../../../services/api';

interface CertificateRequestItem {
  id: string;
  studentId: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  courseId: string;
  course: {
    id: string;
    title: string;
    slug: string;
    duration?: string;
  };
  status: 'pending' | 'granted' | 'rejected';
  requestedAt: string;
  reviewedAt?: string | null;
  grantedAt?: string | null;
  rejectionReason?: string | null;
  certificateId?: string | null;
  certificate?: {
    id: string;
    certificateNumber: string;
    status: string;
    issueDate: string;
  } | null;
  submissionsCount?: number;
}

export const MentorCertificates: React.FC = () => {
  const [requests, setRequests] = useState<CertificateRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Submissions Viewer Modal
  const [selectedReqForProjects, setSelectedReqForProjects] = useState<CertificateRequestItem | null>(null);
  const [studentProjects, setStudentProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);

  // Grant Confirmation Modal
  const [targetReqForGrant, setTargetReqForGrant] = useState<CertificateRequestItem | null>(null);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [isGranting, setIsGranting] = useState(false);

  // Reject Modal
  const [targetReqForReject, setTargetReqForReject] = useState<CertificateRequestItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await certificateService.getMentorCertificateRequests();
      setRequests(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load mentor certificate requests:', err);
      setError('Failed to load certificate applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const showNotification = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 5000);
  };

  // Open Submissions Modal
  const handleOpenProjectsModal = async (reqItem: CertificateRequestItem) => {
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
  const handleOpenGrantModal = (reqItem: CertificateRequestItem) => {
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
      await fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to grant certificate.');
    } finally {
      setIsGranting(false);
    }
  };

  // Open Reject Modal
  const handleOpenRejectModal = (reqItem: CertificateRequestItem) => {
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
      await fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject certificate request.');
    } finally {
      setIsRejecting(false);
    }
  };

  // Filtered Requests
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.student.name.toLowerCase().includes(search.toLowerCase()) ||
      r.student.email.toLowerCase().includes(search.toLowerCase()) ||
      r.course.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.certificate?.certificateNumber && r.certificate.certificateNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const grantedCount = requests.filter((r) => r.status === 'granted').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-display font-extrabold text-stone-900">Certificate Requests</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/60">
              <ShieldCheck className="w-3 h-3 text-amber-600" />
              Mentor Verification Hub
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Review student project completion, verify practical submissions, and grant official verified credentials.
          </p>
        </div>

        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-xs self-start sm:self-auto">
            <Clock className="w-4 h-4 animate-pulse" />
            {pendingCount} {pendingCount === 1 ? 'Pending Review' : 'Pending Reviews'}
          </span>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-stone-200/80 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Total Applications</span>
          <span className="text-2xl font-display font-black text-stone-900 mt-1 block">{requests.length}</span>
        </div>
        <div className="bg-white border border-stone-200/80 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">Pending Review</span>
          <span className="text-2xl font-display font-black text-amber-600 mt-1 block">{pendingCount}</span>
        </div>
        <div className="bg-white border border-stone-200/80 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Granted & Issued</span>
          <span className="text-2xl font-display font-black text-emerald-600 mt-1 block">{grantedCount}</span>
        </div>
        <div className="bg-white border border-stone-200/80 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">Requires Action</span>
          <span className="text-2xl font-display font-black text-rose-600 mt-1 block">{rejectedCount}</span>
        </div>
      </div>

      {/* Notifications */}
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

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md bg-white border border-stone-200 p-1 rounded-2xl shadow-xs">
          <input
            type="text"
            placeholder="Filter by student name, email, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Request Statuses</option>
            <option value="pending">Pending Review Only</option>
            <option value="granted">Granted & Issued</option>
            <option value="rejected">Requires Action</option>
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
              When students complete their course syllabus and submit a certificate request, it will appear here for project verification.
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
                  const initials = reqItem.student.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
                  const isPending = reqItem.status === 'pending';
                  const isGranted = reqItem.status === 'granted';

                  return (
                    <tr key={reqItem.id} className="hover:bg-stone-50/60 transition-colors">
                      {/* Student Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-800 font-bold text-xs">
                            {initials || 'ST'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-stone-900">{reqItem.student.name}</span>
                            <span className="text-[11px] text-stone-400 font-mono">{reqItem.student.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-stone-900 block">{reqItem.course.title}</span>
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
                    {selectedReqForProjects.student.name} • {selectedReqForProjects.course.title}
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
                <strong>Student:</strong> {targetReqForGrant.student.name} ({targetReqForGrant.student.email})
              </p>
              <p>
                <strong>Course Track:</strong> {targetReqForGrant.course.title}
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
    </div>
  );
};
