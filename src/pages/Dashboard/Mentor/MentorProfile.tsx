import React, { useState, useEffect } from 'react';
import { 
  User, Award, AlignLeft, ShieldAlert, 
  Loader2, Check, Image as ImageIcon, Briefcase, Sparkles
} from 'lucide-react';
import { courseService } from '../../../services/courseService';

export const MentorProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [expertiseTags, setExpertiseTags] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const mentor = await courseService.getMentorProfile();
        setName(mentor.name);
        setDesignation(mentor.designation);
        setBio(mentor.bio);
        setProfileImage(mentor.profileImage);
        setExpertiseTags(mentor.expertise.join(', '));
        setError(null);
      } catch (err) {
        setError('Failed to fetch your mentor profile details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !designation || !bio) {
      setError('Please fill in name, designation, and biography details.');
      return;
    }

    const payload = {
      name,
      designation,
      bio,
      profileImage,
      expertise: expertiseTags.split(',').map(t => t.trim()).filter(t => t.length > 0)
    };

    try {
      setSaving(true);
      await courseService.updateMentorProfile(payload);
      setSuccess('Your profile details were updated successfully.');
      setError(null);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const parsedTags = expertiseTags.split(',').map(t => t.trim()).filter(t => t.length > 0);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-9 h-9 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Verifying Mentor Profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-3xl">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-stone-900 tracking-tight">Mentor Biography & Public Profile</h2>
        <p className="text-sm text-stone-500 mt-1">Configure credentials and profile details highlighted on Oxyfied course landing pages.</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Form Details Card */}
      <form 
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-xl border border-stone-200/80 p-6 sm:p-8 rounded-2xl shadow-xs space-y-6 text-stone-800"
      >
        {/* Profile Avatar Card Preview */}
        <div className="flex flex-col sm:flex-row items-center gap-5 bg-stone-50/70 p-5 rounded-2xl border border-stone-200/80">
          <div className="relative">
            <img
              src={profileImage || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120'}
              alt={name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-amber-500/20"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>
          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h4 className="font-display font-bold text-stone-900 text-lg leading-tight">{name || 'Your Name'}</h4>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[11px] font-semibold">
                Verified Instructor
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">{designation || 'Professional Title / Senior Role'}</p>
            {parsedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {parsedTags.map((tag, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-stone-200/70 text-stone-700 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-stone-400" />
              Mentor Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300"
            />
          </div>

          {/* Designation */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-stone-400" />
              Designation / Title
            </label>
            <input
              type="text"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300"
            />
          </div>
        </div>

        {/* Avatar Image URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-stone-400" />
            Avatar Picture URL
          </label>
          <input
            type="text"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300"
          />
        </div>

        {/* Expertise comma separated tags */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-stone-400" />
            Specializations (Comma-Separated)
          </label>
          <input
            type="text"
            value={expertiseTags}
            onChange={(e) => setExpertiseTags(e.target.value)}
            placeholder="Cloud Architecture, Python, Kubernetes, DevOps"
            className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300"
          />
        </div>

        {/* Biography text */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-stone-400" />
            Instructor Biography & Background
          </label>
          <textarea
            rows={5}
            required
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Detail your professional achievements, industry history, and teaching methodology..."
            className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300 resize-none leading-relaxed"
          />
        </div>

        {/* Save button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl flex items-center gap-2 shadow-sm shadow-amber-500/20 hover:shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Biography Changes
          </button>
        </div>
      </form>
    </div>
  );
};
