import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShieldAlert, Loader2, BookOpen, Sparkles, FileText, CheckCircle2, ChevronDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { courseService } from '../../../services/courseService';

interface CategoryOption {
  id: string;
  name: string;
}

export const MentorAddCourse: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('8 Weeks');
  const [level, setLevel] = useState('Beginner');
  const [skillsInput, setSkillsInput] = useState('');
  const [reqsInput, setReqsInput] = useState('');
  const [whoInput, setWhoInput] = useState('');
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setFetchingCategories(true);
        const data = await courseService.getAdminCategories();
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
        setError(null);
      } catch (err) {
        setError('Failed to fetch categories list.');
      } finally {
        setFetchingCategories(false);
      }
    };
    fetchCats();
  }, []);

  // Autofill slug from title
  useEffect(() => {
    setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  }, [title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !categoryId || !price) {
      setError('Please fill in title, slug, category, and price details.');
      return;
    }

    const payload = {
      title,
      slug,
      shortDescription: shortDesc,
      description,
      thumbnail,
      categoryId,
      price: parseFloat(price),
      duration,
      level,
      skills: skillsInput.split(',').map(s => s.trim()).filter(s => s.length > 0),
      requirements: reqsInput.split(',').map(s => s.trim()).filter(s => s.length > 0),
      whoIsItFor: whoInput.split(',').map(s => s.trim()).filter(s => s.length > 0),
      previewVideoUrl: previewVideoUrl.trim() || null
    };
    try {
      setLoading(true);
      await courseService.createMentorCourse(payload);
      setError(null);
      navigate('/mentor/dashboard/courses');
      setTimeout(() => {
        window.location.reload();
      }, 200);
    } catch (err) {
      console.error('Error creating mentor course:', err);
      setError('Failed to save program track. Verify slug is unique.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCategories) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-9 h-9 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Loading Catalog Configurations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-4xl">
      {/* Back button & Title */}
      <div className="space-y-3">
        <Link 
          to="/mentor/dashboard/courses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Tracks</span>
        </Link>
        <div>
          <h2 className="text-2xl font-display font-extrabold text-stone-900 tracking-tight">Create Technical Program Track</h2>
          <p className="text-sm text-stone-500 mt-1">Configure curriculum specs and publish parameters. New tracks are authored as Drafts by default.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form 
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-xl border border-stone-200/80 p-6 sm:p-8 rounded-2xl shadow-xs space-y-8 text-stone-800"
      >
        {/* Live Preview Card */}
        <div className="p-5 rounded-2xl bg-stone-50/70 border border-stone-200/80 flex flex-col sm:flex-row items-center gap-5">
          <img
            src={thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600'}
            alt="Track preview"
            className="w-full sm:w-44 h-28 rounded-xl object-cover border border-stone-200 shadow-xs"
          />
          <div className="space-y-1.5 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                {level}
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {duration}
              </span>
            </div>
            <h4 className="font-display font-bold text-stone-900 text-base leading-snug">
              {title || 'Your Course Track Title'}
            </h4>
            <p className="text-xs text-stone-500 line-clamp-2">
              {shortDesc || 'Short description headline outlining the course goals...'}
            </p>
          </div>
        </div>

        {/* Section 1: Basic Track Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2 border-b border-stone-100 pb-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            Core Track Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Title */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-stone-700">Program Track Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Exploitation & Advanced Buffer Overflows"
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">URL Route Slug</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. exploitation-and-advanced-buffer-overflows"
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Domain Category</label>
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full pl-3.5 pr-9 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300 appearance-none cursor-pointer"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Estimated Duration</label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 10 Weeks"
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300"
              />
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Pricing (₹ INR)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 199"
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300"
              />
            </div>

            {/* Difficulty Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Skill Level</label>
              <div className="relative">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full pl-3.5 pr-9 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300 appearance-none cursor-pointer"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Thumbnail Image URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Cover Thumbnail URL</label>
              <input
                type="text"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300"
              />
            </div>

            {/* Preview Video URL */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-stone-700">Course Preview Video URL (Public Trailer)</label>
              <input
                type="url"
                value={previewVideoUrl}
                onChange={(e) => setPreviewVideoUrl(e.target.value)}
                placeholder="e.g. https://www.youtube.com/watch?v=... or MP4/Bunny stream URL"
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300"
              />
              <p className="text-[10px] text-stone-400">
                Publicly visible video displayed in the Course Details "Preview" tab. No student login required.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Narrative & Description */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2 border-b border-stone-100 pb-2">
            <FileText className="w-4 h-4 text-amber-500" />
            Curriculum Narrative & Content
          </h3>

          <div className="space-y-4">
            {/* Short description summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Course Summary Headline</label>
              <input
                type="text"
                required
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Explain course goals and practical takeaways in one punchy sentence..."
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300"
              />
            </div>

            {/* Full description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Comprehensive Course Syllabus Details</label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the modules, live lab exercises, architecture patterns, and capstone project requirements..."
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300 resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Tags and Audience */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2 border-b border-stone-100 pb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Target Audience & Requirements
          </h3>

          <div className="space-y-4">
            {/* Skills tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Skills Gained (Comma-Separated)</label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g. Immunity Debugger, Stack overflows, SEH overwrite, Shellcode encoding"
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300"
              />
            </div>

            {/* Reqs tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Prerequisites (Comma-Separated)</label>
              <input
                type="text"
                value={reqsInput}
                onChange={(e) => setReqsInput(e.target.value)}
                placeholder="e.g. Basic assembly concepts, Python script writing, Linux terminal basics"
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300"
              />
            </div>

            {/* Who is it for */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Target Audience (Comma-Separated)</label>
              <input
                type="text"
                value={whoInput}
                onChange={(e) => setWhoInput(e.target.value)}
                placeholder="e.g. Penetration testers, Exploit researchers, Security engineers"
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
          <Link 
            to="/mentor/dashboard/courses"
            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl flex items-center gap-2 shadow-sm shadow-amber-500/20 hover:shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Save & Publish Track
          </button>
        </div>
      </form>
    </div>
  );
};
