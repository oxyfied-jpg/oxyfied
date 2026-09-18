import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, 
  ShieldAlert, Loader2, Eye, ToggleLeft, ToggleRight, X, BookOpen, CheckCircle
} from 'lucide-react';
import { courseService } from '../../../services/courseService';

interface EnrolledCourseInfo {
  id: string;
  courseId: string;
  courseTitle: string;
  status: string;
  progress: number;
  createdAt: string;
}

interface UserObject {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'student' | 'admin' | 'mentor';
  status: 'active' | 'inactive';
  createdAt: string;
  enrollmentsCount: number;
  enrollments: EnrolledCourseInfo[];
  progress: Record<string, string[]>;
  activeSession?: {
    id: string;
    createdAt: string;
    lastActivityAt: string;
    userAgent?: string;
  } | null;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserObject[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and pagination state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 8;

  // Selection states for detail Modal
  const [selectedUser, setSelectedUser] = useState<UserObject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        role: roleFilter,
        status: statusFilter,
        sortBy,
        sortOrder,
        page,
        limit
      };
      const data = await courseService.getUsers(params);
      setUsers(data.users);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user accounts directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, sortBy, sortOrder, page]);

  // Toggle user status handler
  const handleToggleStatus = async (user: UserObject) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    const confirmMsg = `Are you sure you want to set status of ${user.name} to ${nextStatus.toUpperCase()}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      await courseService.updateUser(user.id, { status: nextStatus, role: user.role });
      // Update local state instantly
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => prev ? { ...prev, status: nextStatus } : null);
      }
    } catch (err) {
      setError('Failed to update account status.');
    } finally {
      setLoading(false);
    }
  };

  // Change user role handler
  const handleChangeRole = async (user: UserObject, nextRole: 'student' | 'admin' | 'mentor') => {
    if (!window.confirm(`Promote/Change role of ${user.name} to ${nextRole.toUpperCase()}?`)) return;

    try {
      setLoading(true);
      await courseService.updateUser(user.id, { role: nextRole, status: user.status });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: nextRole } : u));
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => prev ? { ...prev, role: nextRole } : null);
      }
    } catch (err) {
      setError('Failed to change user role.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-stone-200 pb-4">
        <h2 className="text-2xl font-display font-extrabold text-stone-900">Users Directory</h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">Manage registered student, mentor, and administrator profiles ({total} total registered users).</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200/80 text-rose-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 bg-white border border-stone-200/80 p-4 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3.5 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Role filter */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3.5 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Administrator</option>
          </select>
          <Filter className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3.5 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Deactivated</option>
          </select>
          <Filter className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Reset button */}
        <button 
          onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setPage(1); }}
          className="py-2 px-4 text-xs font-semibold rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors cursor-pointer"
        >
          Reset Filters
        </button>
      </div>

      {/* Users table */}
      <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
            <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Syncing users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs font-medium">
            No registered users match the search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-100 text-stone-500 font-semibold">
                  <th className="px-6 py-4 cursor-pointer hover:text-stone-900 transition-colors" onClick={() => handleSort('name')}>
                    User Name <ArrowUpDown className="w-3.5 h-3.5 inline ml-0.5" />
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-stone-900 transition-colors" onClick={() => handleSort('email')}>
                    Email <ArrowUpDown className="w-3.5 h-3.5 inline ml-0.5" />
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-stone-900 transition-colors" onClick={() => handleSort('phone')}>
                    Phone Number <ArrowUpDown className="w-3.5 h-3.5 inline ml-0.5" />
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-stone-900 transition-colors" onClick={() => handleSort('createdAt')}>
                    Joined <ArrowUpDown className="w-3.5 h-3.5 inline ml-0.5" />
                  </th>
                  <th className="px-6 py-4 text-center">Role</th>
                  <th className="px-6 py-4 text-center">Tracks Enrolled</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* User profile info */}
                    <td className="px-6 py-4 font-semibold text-stone-900">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-stone-200"
                        />
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-stone-500">{u.email}</td>
                    <td className="px-6 py-4 font-mono text-stone-700">
                      {u.phone ? (
                        <span className="font-semibold text-stone-900">{u.phone}</span>
                      ) : (
                        <span className="text-stone-400 italic">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-stone-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u, e.target.value as any)}
                        className="bg-stone-50 border border-stone-200 text-stone-800 text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                      >
                        <option value="student">Student</option>
                        <option value="mentor">Mentor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-amber-600">{u.enrollmentsCount}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 text-right space-x-1.5">
                      <button 
                        onClick={() => { setSelectedUser(u); setIsModalOpen(true); }}
                        className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-all cursor-pointer"
                        title="View Profile Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          u.status === 'active' 
                            ? 'text-amber-600 hover:bg-amber-50' 
                            : 'text-stone-400 hover:bg-stone-100'
                        }`}
                        title={u.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                      >
                        {u.status === 'active' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-stone-50/60 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">
              Showing page <span className="text-stone-900 font-bold">{page}</span> of <span className="text-stone-900 font-bold">{totalPages}</span> ({total} users)
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="p-1.5 bg-white border border-stone-200 hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-stone-700 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="p-1.5 bg-white border border-stone-200 hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-stone-700 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-stone-200/80 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col text-left shadow-2xl">
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
              <h3 className="font-display font-bold text-base text-stone-900">User Profile Dossier</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Profile Details card */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 bg-stone-50/80 p-5 rounded-2xl border border-stone-200/60">
                <img
                  src={selectedUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120'}
                  alt={selectedUser.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-amber-500/20 shadow-sm"
                />
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <h4 className="font-display font-bold text-stone-900 text-lg">{selectedUser.name}</h4>
                  <span className="text-xs text-stone-500 font-mono block">{selectedUser.email}</span>
                  {selectedUser.phone && <span className="text-xs text-stone-500 block">Phone: {selectedUser.phone}</span>}
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
                    <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-200/60 text-amber-800 text-[10px] uppercase font-bold rounded-full">
                      Role: {selectedUser.role}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                      selectedUser.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                        : 'bg-stone-100 text-stone-600 border border-stone-200'
                    }`}>
                      Status: {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Session details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider block border-b border-stone-100 pb-2">
                  Session Telemetry & Security
                </h4>
                
                {selectedUser.activeSession ? (
                  <div className="p-4 bg-stone-50/70 border border-stone-200/80 rounded-2xl space-y-3 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Active Session Connected
                        </p>
                        <p className="text-[11px] text-stone-500 font-mono">
                          Started: {new Date(selectedUser.activeSession.createdAt).toLocaleString()}
                        </p>
                        <p className="text-[11px] text-stone-500 font-mono">
                          Last Active: {new Date(selectedUser.activeSession.lastActivityAt).toLocaleString()}
                        </p>
                        {selectedUser.activeSession.userAgent && (
                          <p className="text-[11px] text-stone-500 font-mono truncate max-w-[280px] sm:max-w-md" title={selectedUser.activeSession.userAgent}>
                            Device: {selectedUser.activeSession.userAgent}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to revoke the active session for ${selectedUser.name}? The user will be forced to log in again.`)) {
                            try {
                              setLoading(true);
                              await courseService.revokeUserSession(selectedUser.id);
                              setSelectedUser(prev => prev ? { ...prev, activeSession: null } : null);
                              setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, activeSession: null } : u));
                            } catch (err) {
                              setError('Failed to revoke session.');
                            } finally {
                              setLoading(false);
                            }
                          }
                        }}
                        className="px-3.5 py-1.5 bg-white border border-stone-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-stone-700 text-xs font-semibold rounded-xl transition-all self-start sm:self-center cursor-pointer shadow-xs"
                      >
                        Revoke Active Session
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic py-2">No active session found for this user.</p>
                )}
              </div>

              {/* Enrollment tracks history */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider block border-b border-stone-100 pb-2">
                  Course Enrollment Timeline
                </h4>
                
                {selectedUser.enrollments.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-4">No active course enrollments registered for this user.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedUser.enrollments.map(e => {
                      const lessonsCompletedCount = selectedUser.progress[e.courseId]?.length || 0;
                      
                      return (
                        <div key={e.id} className="p-4 bg-stone-50/70 border border-stone-200/80 rounded-2xl space-y-3 shadow-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              <span className="text-xs font-bold text-stone-900 leading-tight">{e.courseTitle}</span>
                            </div>
                            <span className="text-[10px] text-stone-400 font-mono">Enrolled: {new Date(e.createdAt).toLocaleDateString()}</span>
                          </div>

                          {/* Progress */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between text-[11px] text-stone-600 font-semibold">
                                <span>Track Progress</span>
                                <span className="font-mono text-stone-900">{e.progress}% ({lessonsCompletedCount} lessons)</span>
                              </div>
                              <div className="w-full bg-stone-200/80 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${e.progress}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                e.status === 'completed' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                                  : 'bg-stone-100 text-stone-700 border border-stone-200'
                              }`}>
                                {e.status}
                              </span>
                              {e.status === 'completed' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/80 text-right">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 transition-colors cursor-pointer shadow-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
