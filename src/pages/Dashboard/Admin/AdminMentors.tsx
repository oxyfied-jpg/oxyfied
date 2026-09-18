import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Key, ShieldAlert, Loader2, X, Check 
} from 'lucide-react';
import { courseService } from '../../../services/courseService';

interface MentorObject {
  id: string;
  userId: string;
  name: string;
  email: string;
  designation: string;
  bio: string;
  profileImage: string;
  expertise: string[];
  status: 'active' | 'inactive';
  isActive: boolean;
  coursesCount?: number;
}

export const AdminMentors: React.FC = () => {
  const [mentors, setMentors] = useState<MentorObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal forms states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [selectedMentor, setSelectedMentor] = useState<MentorObject | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [expertiseInput, setExpertiseInput] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAdminMentors();
      setMentors(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch mentors database directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const openAddModal = () => {
    setModalType('add');
    setSelectedMentor(null);
    setName('');
    setEmail('');
    setDesignation('');
    setBio('');
    setProfileImage('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200');
    setExpertiseInput('');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (mentor: MentorObject) => {
    setModalType('edit');
    setSelectedMentor(mentor);
    setName(mentor.name);
    setEmail(mentor.email || '');
    setDesignation(mentor.designation);
    setBio(mentor.bio);
    setProfileImage(mentor.profileImage);
    setExpertiseInput(mentor.expertise.join(', '));
    setStatus(mentor.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !designation || !bio) {
      setError('Please fill in name, designation, and biography details.');
      return;
    }

    const tags = expertiseInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const payload = {
      name,
      email: email || undefined,
      designation,
      bio,
      profileImage: profileImage || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200',
      expertise: tags,
      status
    };

    try {
      setLoading(true);
      if (modalType === 'add') {
        const newMentor = await courseService.createMentor(payload);
        setMentors(prev => [...prev, newMentor]);
        setSuccessMsg(`Mentor "${name}" successfully registered. Default password is "mentorpassword123".`);
      } else {
        if (!selectedMentor) return;
        const updated = await courseService.updateMentor(selectedMentor.id, payload);
        setMentors(prev => prev.map(m => m.id === selectedMentor.id ? { ...m, ...updated } : m));
        setSuccessMsg(`Mentor "${name}" profile successfully updated.`);
      }
      setIsModalOpen(false);
      setError(null);
      
      // Clear toast success messages after 6s
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err) {
      setError('Failed to save mentor. Double check that email is unique.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mentor: MentorObject) => {
    const confirmMsg = `Are you sure you want to completely remove mentor "${mentor.name}"? This will delete their mentor profile and user account (only if they are not assigned to active courses).`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      await courseService.deleteMentor(mentor.id);
      setMentors(prev => prev.filter(m => m.id !== mentor.id));
      setSuccessMsg(`Mentor "${mentor.name}" successfully deleted.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete mentor.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger password reset handler (simulated or API endpoint triggers)
  const handleResetPassword = async (mentor: MentorObject) => {
    if (!window.confirm(`Reset password of mentor "${mentor.name}" to default "mentorpassword123"?`)) return;

    try {
      setLoading(true);
      await courseService.resetMentorPassword(mentor.id);
      setSuccessMsg(`Successfully reset password for "${mentor.name}" to default: mentorpassword123`);
      setTimeout(() => setSuccessMsg(null), 6000);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-stone-900">Mentors Management</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">Assign mentors, setup expert credentials, and manage instructor profiles.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-5 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all duration-200 hover:scale-[1.02] cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Add New Mentor
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200/80 text-rose-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Directory Table */}
      <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm overflow-hidden">
        {loading && mentors.length === 0 ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
            <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Syncing mentors directory...</span>
          </div>
        ) : mentors.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs font-medium">
            No mentors currently registered on the platform.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-100 text-stone-500 font-semibold">
                  <th className="px-6 py-4">Mentor</th>
                  <th className="px-6 py-4">Designation</th>
                  <th className="px-6 py-4">Expertise Keywords</th>
                  <th className="px-6 py-4 text-center">Assigned Courses</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {mentors.map(m => (
                  <tr key={m.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Name & profile */}
                    <td className="px-6 py-4 font-semibold text-stone-900">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.profileImage || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100'}
                          alt={m.name}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-stone-200"
                        />
                        <div className="flex flex-col">
                          <span>{m.name}</span>
                          <span className="text-[11px] text-stone-400 font-mono">{m.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-stone-700">{m.designation}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {m.expertise.map((tag, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[10px] font-medium rounded-md border border-stone-200/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    {/* Courses count */}
                    <td className="px-6 py-4 text-center font-mono font-bold text-amber-600">
                      {m.coursesCount ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        m.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 text-right space-x-1">
                      <button 
                        onClick={() => openEditModal(m)}
                        className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-all inline-block cursor-pointer"
                        title="Edit Mentor Profile"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleResetPassword(m)}
                        className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all inline-block cursor-pointer"
                        title="Reset Credentials to default"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(m)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all inline-block cursor-pointer"
                        title="Remove Mentor Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Mentor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <form 
            onSubmit={handleSubmit}
            className="bg-white border border-stone-200/80 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col text-left shadow-2xl"
          >
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
              <h3 className="font-display font-bold text-base text-stone-900">
                {modalType === 'add' ? 'Register New Mentor' : 'Edit Mentor Details'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal fields scroll body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs text-stone-800">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800 block">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Michael Kovac"
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800 block">Email Address</label>
                <input
                  type="email"
                  disabled={modalType === 'edit'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. michael.kovac@oxyfied.com"
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-40 disabled:pointer-events-none transition-all"
                />
                {modalType === 'add' && (
                  <p className="text-[10px] text-stone-400 mt-1">If left blank, email will auto-generate based on their name.</p>
                )}
              </div>

              {/* Designation */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800 block">Designation / Role Description</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Principal Cyber Architect"
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800 block">Professional Biography</label>
                <textarea
                  required
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Summarize the mentor's expertise history..."
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                />
              </div>

              {/* Profile Image URL */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800 block">Avatar Image URL</label>
                <input
                  type="text"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="Unsplash, cloud, or relative URL..."
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>

              {/* Expertise tags */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800 block">Expertise Areas (Comma Separated)</label>
                <input
                  type="text"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  placeholder="e.g. Reverse Engineering, C++, Threat Hunting"
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>

              {/* Status toggler */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800 block">Profile Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                >
                  <option value="active">Active & Authorized</option>
                  <option value="inactive">Suspended / Inactive</option>
                </select>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/80 text-right space-x-2.5">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer"
              >
                {modalType === 'add' ? 'Register Mentor' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
