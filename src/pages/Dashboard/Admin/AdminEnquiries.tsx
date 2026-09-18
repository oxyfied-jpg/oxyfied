import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Search, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  Briefcase, 
  GraduationCap, 
  Building2, 
  Handshake, 
  MessageSquare, 
  X, 
  Loader2, 
  RefreshCw,
  ExternalLink,
  Phone,
  Mail,
  Tag,
  Users
} from 'lucide-react';
import { enquiryService, type EnquiryObject, type EnquiryStatus } from '../../../services/enquiryService';

export const AdminEnquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<EnquiryObject[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Active Detail Modal
  const [activeEnquiry, setActiveEnquiry] = useState<EnquiryObject | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<EnquiryStatus>('new');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const fetchEnquiries = async () => {
    try {
      setIsLoading(true);
      const res = await enquiryService.getAdminEnquiries({
        type: selectedType,
        status: selectedStatus,
        search,
        page,
        limit: 20
      });
      setEnquiries(res.enquiries);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [selectedType, selectedStatus, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEnquiries();
  };

  const handleOpenDetail = (enquiry: EnquiryObject) => {
    setActiveEnquiry(enquiry);
    setEditNotes(enquiry.adminNotes || '');
    setEditStatus(enquiry.status);
    setUpdateSuccess(false);
  };

  const handleSaveUpdate = async () => {
    if (!activeEnquiry) return;
    try {
      setIsUpdating(true);
      const updated = await enquiryService.updateAdminEnquiry(activeEnquiry.id, {
        status: editStatus,
        adminNotes: editNotes
      });
      setActiveEnquiry(updated);
      setEnquiries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update enquiry. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this enquiry record?')) return;
    try {
      await enquiryService.deleteAdminEnquiry(id);
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      if (activeEnquiry?.id === id) {
        setActiveEnquiry(null);
      }
    } catch (err) {
      alert('Failed to delete enquiry.');
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'hire':
        return { label: 'Hire From Us', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Briefcase };
      case 'instructor':
        return { label: 'Instructor App', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: GraduationCap };
      case 'partner':
        return { label: 'Partnership', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Handshake };
      case 'corporate':
        return { label: 'Corporate Training', bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: Building2 };
      case 'collaboration':
        return { label: 'Collaboration', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Handshake };
      case 'career':
        return { label: 'Career Job App', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: Users };
      default:
        return { label: 'General Contact', bg: 'bg-stone-100 text-stone-700 border-stone-300', icon: MessageSquare };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-50 text-blue-700 border-blue-200 font-bold';
      case 'in_review':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
      case 'contacted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
      case 'closed':
        return 'bg-stone-100 text-stone-600 border-stone-200';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  const parseJsonData = (rawJson?: string | null) => {
    if (!rawJson) return null;
    try {
      return JSON.parse(rawJson);
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-taupe pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-amber-500" />
            <span>Enquiries &amp; Applications</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Centralized hub for Hire From Us requests, Instructor applications, Corporate inquiries, Partnerships, and Support messages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchEnquiries}
            className="px-3 py-2 bg-white border border-light-taupe rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-900 hover:border-stone-400 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-light-taupe p-4 rounded-2xl shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="sm:col-span-6 relative">
            <input
              type="text"
              placeholder="Search by name, email, company, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-stone-50 border border-light-taupe rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 px-3 bg-stone-50 border border-light-taupe rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-500 transition-all"
            >
              <option value="all">All Channels (All Types)</option>
              <option value="hire">Hire From Us</option>
              <option value="instructor">Instructor Applications</option>
              <option value="partner">Partnership Proposals</option>
              <option value="corporate">Corporate Training</option>
              <option value="collaboration">Industry Collaboration</option>
              <option value="career">Career Applications</option>
              <option value="contact">General Contact</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 px-3 bg-stone-50 border border-light-taupe rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-500 transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="new">New / Unread</option>
              <option value="in_review">In Review</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed / Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white border border-light-taupe rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <span className="text-xs text-stone-500 font-medium">Loading enquiries repository...</span>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-sm text-stone-900">No Enquiries Found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              No enquiry records match the selected filters. Incoming submissions from website forms will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-light-taupe bg-stone-50 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Channel / Type</th>
                  <th className="py-3 px-4">Sender / Organization</th>
                  <th className="py-3 px-4">Subject / Role</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-taupe text-xs text-stone-800">
                {enquiries.map((item) => {
                  const typeBadge = getTypeBadge(item.type);
                  const Icon = typeBadge.icon;
                  const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] border ${typeBadge.bg}`}>
                          <Icon className="w-3 h-3" />
                          <span>{typeBadge.label}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900 leading-tight">{item.name}</div>
                        <div className="text-[11px] text-stone-500 leading-tight mt-0.5">{item.email}</div>
                        {item.company && (
                          <div className="text-[10px] text-amber-700 font-medium">{item.company}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate">
                        <div className="font-medium text-stone-900 truncate">
                          {item.subject || item.role || item.type}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate mt-0.5 max-w-xs">
                          {item.message}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-stone-500">
                        {dateStr}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] border uppercase tracking-wider ${getStatusBadge(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-amber-500 hover:text-stone-950 font-semibold text-stone-700 transition-colors cursor-pointer text-xs inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Enquiry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-light-taupe flex items-center justify-between text-xs text-stone-500">
            <span>Showing page {page} of {totalPages} ({total} total entries)</span>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enquiry Detail & Audit Modal */}
      {activeEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-light-taupe rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar text-left">
            <button
              onClick={() => setActiveEnquiry(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] border uppercase font-bold ${getTypeBadge(activeEnquiry.type).bg}`}>
                  {getTypeBadge(activeEnquiry.type).label}
                </span>
                <span className="text-xs text-stone-400">
                  {new Date(activeEnquiry.createdAt).toLocaleString()}
                </span>
              </div>
              <h2 className="text-xl font-display font-extrabold text-stone-900 mt-2">
                {activeEnquiry.subject || activeEnquiry.name}
              </h2>
            </div>

            {/* Sender Meta Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50 p-4 rounded-2xl border border-light-taupe">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Contact Name</span>
                <span className="font-bold text-stone-900">{activeEnquiry.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Email Address</span>
                <a href={`mailto:${activeEnquiry.email}`} className="text-amber-700 font-semibold hover:underline flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>{activeEnquiry.email}</span>
                </a>
              </div>
              {activeEnquiry.phone && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Phone</span>
                  <a href={`tel:${activeEnquiry.phone}`} className="text-stone-800 font-semibold flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{activeEnquiry.phone}</span>
                  </a>
                </div>
              )}
              {activeEnquiry.company && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Organization</span>
                  <span className="font-bold text-stone-900">{activeEnquiry.company}</span>
                </div>
              )}
            </div>

            {/* Structured Custom Form Fields (e.g. resumeUrl, openings, etc) */}
            {(() => {
              const customData = parseJsonData(activeEnquiry.data);
              if (!customData || Object.keys(customData).length === 0) return null;
              return (
                <div className="space-y-2 border border-light-taupe p-4 rounded-2xl bg-amber-50/30">
                  <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Custom Submission Attributes
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(customData).map(([k, val]) => (
                      <div key={k} className="bg-white p-2.5 rounded-xl border border-light-taupe/80">
                        <span className="text-[10px] font-bold text-stone-400 uppercase block">{k.replace(/([A-Z])/g, ' $1')}</span>
                        {typeof val === 'string' && val.startsWith('http') ? (
                          <a href={val} target="_blank" rel="noopener noreferrer" className="text-amber-700 font-semibold hover:underline flex items-center gap-1 mt-0.5 truncate">
                            <span className="truncate">{val}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-stone-900 font-semibold">{String(val)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Message Body */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Full Message / Proposal Description
              </h4>
              <div className="p-4 bg-stone-50 rounded-2xl border border-light-taupe text-xs text-stone-800 leading-relaxed whitespace-pre-wrap">
                {activeEnquiry.message}
              </div>
            </div>

            {/* Admin Status & Notes Editor */}
            <div className="space-y-3 border-t border-light-taupe pt-4">
              <h4 className="text-[10px] font-bold text-stone-900 uppercase tracking-wider">
                Admin Status &amp; Internal Notes
              </h4>

              {updateSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Enquiry record updated successfully.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 block">Workflow Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as EnquiryStatus)}
                    className="w-full px-3 py-2 bg-stone-50 border border-light-taupe rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="new">New</option>
                    <option value="in_review">In Review</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed / Resolved</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 block">Internal Admin Notes</label>
                  <input
                    type="text"
                    placeholder="Add follow-up notes, assigned team lead, or interview dates..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-light-taupe rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveEnquiry(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleSaveUpdate}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Updates</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
