// import React, { useState, useEffect } from 'react';
// import { 
//   Plus, Edit, Trash2, BookOpen, Layers, Users, FolderOpen, 
//   Check, Loader2, AlertCircle, X 
// } from 'lucide-react';
// import { courseService } from '../../../services/courseService';
// import api from '../../../services/api';
// import type { Course, Instructor, Category } from '../../../types';

// export const AdminPanel: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<'courses' | 'categories' | 'instructors' | 'classroom'>('courses');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [successMsg, setSuccessMsg] = useState<string | null>(null);

//   // Loaded database items
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [instructors, setInstructors] = useState<Instructor[]>([]);
  
//   // Selection states for Modules/Lessons management
//   const [selectedCourseId, setSelectedCourseId] = useState<string>('');
//   const [activeCourseDetails, setActiveCourseDetails] = useState<any>(null);

//   // Form active modals/mode states
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
//   const [editId, setEditId] = useState<string | null>(null);

//   // Individual Form fields states
//   // 1. Category Form Fields
//   const [categoryName, setCategoryName] = useState('');
//   const [categorySlug, setCategorySlug] = useState('');

//   // 2. Instructor Form Fields
//   const [instName, setInstName] = useState('');
//   const [instDesignation, setInstDesignation] = useState('');
//   const [instBio, setInstBio] = useState('');
//   const [instImage, setInstImage] = useState('');

//   // 3. Course Form Fields
//   const [courseTitle, setCourseTitle] = useState('');
//   const [courseSlug, setCourseSlug] = useState('');
//   const [courseShortDesc, setCourseShortDesc] = useState('');
//   const [courseDesc, setCourseDesc] = useState('');
//   const [courseThumbnail, setCourseThumbnail] = useState('');
//   const [courseCatId, setCourseCatId] = useState('');
//   const [courseInstId, setCourseInstId] = useState('');
//   const [coursePrice, setCoursePrice] = useState(0);
//   const [courseDiscountPrice, setCourseDiscountPrice] = useState('');
//   const [courseDuration, setCourseDuration] = useState('');
//   const [courseLevel, setCourseLevel] = useState('Beginner');
//   const [courseStatus, setCourseStatus] = useState('draft');
//   const [courseFeatured, setCourseFeatured] = useState(false);
//   const [courseSkills, setCourseSkills] = useState('');
//   const [courseReqs, setCourseReqs] = useState('');
//   const [courseWhoFor, setCourseWhoFor] = useState('');

//   // 4. Module & Lesson Form states
//   const [isModuleFormOpen, setIsModuleFormOpen] = useState(false);
//   const [moduleFormMode, setModuleFormMode] = useState<'create' | 'edit'>('create');
//   const [editModuleId, setEditModuleId] = useState<string | null>(null);
//   const [moduleTitle, setModuleTitle] = useState('');
//   const [moduleSortOrder, setModuleSortOrder] = useState(1);

//   const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);
//   const [lessonFormMode, setLessonFormMode] = useState<'create' | 'edit'>('create');
//   const [editLessonId, setEditLessonId] = useState<string | null>(null);
//   const [targetModuleId, setTargetModuleId] = useState('');
//   const [lessonTitle, setLessonTitle] = useState('');
//   const [lessonDuration, setLessonDuration] = useState('');
//   const [lessonVideoType, setLessonVideoType] = useState<'youtube' | 'hls'>('youtube');
//   const [lessonYoutubeId, setLessonYoutubeId] = useState('');
//   const [lessonIsPreview, setLessonIsPreview] = useState(false);
//   const [lessonSortOrder, setLessonSortOrder] = useState(1);

//   const extractYoutubeId = (input: string) => {
//     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
//     const match = input.match(regExp);
//     return (match && match[2].length === 11) ? match[2] : input;
//   };

//   // Fetch initial tables data
//   const loadData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const coursesData = await courseService.getCourses();
//       setCourses(coursesData);

//       const catsData = await courseService.getAdminCategories();
//       setCategories(catsData);

//       const instsData = await courseService.getAdminInstructors();
//       setInstructors(instsData);
//     } catch (err) {
//       console.error(err);
//       setError('Failed to fetch administrative lists.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   // Fetch individual course modules and lessons for classroom tab
//   const loadCourseDetails = async (courseId: string) => {
//     if (!courseId) {
//       setActiveCourseDetails(null);
//       return;
//     }
//     try {
//       setLoading(true);
//       const data = await api.get(`/courses/${courseId}`); // details endpoint returns entire curriculum
//       setActiveCourseDetails(data.data);
//     } catch (err) {
//       setError('Failed to retrieve course curriculum structure.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (activeTab === 'classroom' && selectedCourseId) {
//       loadCourseDetails(selectedCourseId);
//     }
//   }, [activeTab, selectedCourseId]);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') {
//         setIsFormOpen(false);
//         setIsModuleFormOpen(false);
//         setIsLessonFormOpen(false);
//       }
//     };
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, []);

//   const triggerSuccess = (msg: string) => {
//     setSuccessMsg(msg);
//     setTimeout(() => setSuccessMsg(null), 3000);
//   };

//   // 1. DELETE Handlers
//   const handleDeleteCategory = async (id: string) => {
//     if (!window.confirm('Are you sure you want to delete this Category? Course relations will be broken.')) return;
//     try {
//       await courseService.deleteCategory(id);
//       triggerSuccess('Category deleted successfully.');
//       loadData();
//     } catch (err) {
//       setError('Failed to delete category.');
//     }
//   };

//   const handleDeleteInstructor = async (id: string) => {
//     if (!window.confirm('Are you sure you want to delete this Instructor? Course relations will be broken.')) return;
//     try {
//       await courseService.deleteInstructor(id);
//       triggerSuccess('Instructor deleted successfully.');
//       loadData();
//     } catch (err) {
//       setError('Failed to delete instructor.');
//     }
//   };

//   const handleDeleteCourse = async (id: string) => {
//     if (!window.confirm('Are you sure you want to delete this Course Program? All nested modules, lessons, progress and enrollments will be deleted permanently.')) return;
//     try {
//       await courseService.deleteCourse(id);
//       triggerSuccess('Course Program deleted.');
//       loadData();
//     } catch (err) {
//       setError('Failed to delete course.');
//     }
//   };

//   const handleDeleteModule = async (moduleId: string) => {
//     if (!window.confirm('Are you sure? Deleting this module will delete all its lessons.')) return;
//     try {
//       await courseService.deleteModule(moduleId);
//       triggerSuccess('Module deleted.');
//       loadCourseDetails(selectedCourseId);
//     } catch (err) {
//       setError('Failed to delete module.');
//     }
//   };

//   const handleDeleteLesson = async (lessonId: string) => {
//     if (!window.confirm('Delete this lesson?')) return;
//     try {
//       await courseService.deleteLesson(lessonId);
//       triggerSuccess('Lesson deleted.');
//       loadCourseDetails(selectedCourseId);
//     } catch (err) {
//       setError('Failed to delete lesson.');
//     }
//   };

//   // 2. OPEN Forms Handlers
//   const openCreateForm = () => {
//     setFormMode('create');
//     setEditId(null);
//     setError(null);
    
//     // Clear inputs
//     setCategoryName('');
//     setCategorySlug('');
//     setInstName('');
//     setInstDesignation('');
//     setInstBio('');
//     setInstImage('');
//     setCourseTitle('');
//     setCourseSlug('');
//     setCourseShortDesc('');
//     setCourseDesc('');
//     setCourseThumbnail('');
//     setCourseCatId(categories[0]?.id || '');
//     setCourseInstId(instructors[0]?.id || '');
//     setCoursePrice(0);
//     setCourseDiscountPrice('');
//     setCourseDuration('');
//     setCourseLevel('Beginner');
//     setCourseStatus('draft');
//     setCourseFeatured(false);
//     setCourseSkills('');
//     setCourseReqs('');
//     setCourseWhoFor('');

//     setIsFormOpen(true);
//   };

//   const openEditForm = (item: any) => {
//     setFormMode('edit');
//     setEditId(item.id);
//     setError(null);

//     if (activeTab === 'categories') {
//       setCategoryName(item.name);
//       setCategorySlug(item.slug);
//     } else if (activeTab === 'instructors') {
//       setInstName(item.name);
//       setInstDesignation(item.designation || item.role || '');
//       setInstBio(item.bio || '');
//       setInstImage(item.profileImage || item.image || '');
//     } else if (activeTab === 'courses') {
//       setCourseTitle(item.title);
//       setCourseSlug(item.slug);
//       setCourseShortDesc(item.description || '');
//       setCourseDesc(item.description || '');
//       setCourseThumbnail(item.image || '');
//       // Look up corresponding original items to fill IDs if possible
//       const matchedCat = categories.find(c => c.name === item.category);
//       setCourseCatId(matchedCat?.id || categories[0]?.id || '');
//       // Wait, we need to load fuller details for edit form to populate description, skills, etc.
//       api.get(`/courses/${item.slug}`).then((res) => {
//         const fullCourse = res.data;
//         setCourseDesc(fullCourse.description || '');
//         setCourseShortDesc(fullCourse.shortDescription || fullCourse.description || '');
//         setCourseCatId(fullCourse.categoryId || matchedCat?.id || '');
//         setCourseInstId(fullCourse.instructorId || instructors[0]?.id || '');
//         setCoursePrice(fullCourse.price || 0);
//         setCourseDiscountPrice(fullCourse.discountPrice ? String(fullCourse.discountPrice) : '');
//         setCourseDuration(fullCourse.duration || '');
//         setCourseLevel(fullCourse.level || 'Beginner');
//         setCourseStatus(fullCourse.status || 'draft');
//         setCourseFeatured(fullCourse.isFeatured || false);
//         setCourseSkills((fullCourse.skills || []).join(', '));
//         setCourseReqs((fullCourse.requirements || []).join('\n'));
//         setCourseWhoFor((fullCourse.whoIsItFor || []).join('\n'));
//       }).catch(() => {});
//     }

//     setIsFormOpen(true);
//   };

//   // 3. SUBMIT Forms Handlers
//   const handleMainFormSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       if (activeTab === 'categories') {
//         if (formMode === 'create') {
//           await courseService.createCategory({ name: categoryName, slug: categorySlug });
//           triggerSuccess('Category created successfully.');
//         } else {
//           await courseService.updateCategory(editId!, { name: categoryName, slug: categorySlug });
//           triggerSuccess('Category updated successfully.');
//         }
//       } 
      
//       else if (activeTab === 'instructors') {
//         const payload = { name: instName, designation: instDesignation, bio: instBio, profileImage: instImage };
//         if (formMode === 'create') {
//           await courseService.createInstructor(payload);
//           triggerSuccess('Instructor created successfully.');
//         } else {
//           await courseService.updateInstructor(editId!, payload);
//           triggerSuccess('Instructor updated successfully.');
//         }
//       } 
      
//       else if (activeTab === 'courses') {
//         const payload = {
//           title: courseTitle,
//           slug: courseSlug,
//           shortDescription: courseShortDesc || courseDesc.substring(0, 100),
//           description: courseDesc,
//           thumbnail: courseThumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop',
//           categoryId: courseCatId,
//           instructorId: courseInstId,
//           price: Number(coursePrice),
//           discountPrice: courseDiscountPrice ? Number(courseDiscountPrice) : undefined,
//           duration: courseDuration,
//           level: courseLevel,
//           status: courseStatus,
//           isFeatured: courseFeatured,
//           skills: courseSkills.split(',').map(s => s.trim()).filter(Boolean),
//           requirements: courseReqs.split('\n').map(s => s.trim()).filter(Boolean),
//           whoIsItFor: courseWhoFor.split('\n').map(s => s.trim()).filter(Boolean),
//         };

//         if (formMode === 'create') {
//           await courseService.createCourse(payload);
//           triggerSuccess('Course Program created successfully.');
//         } else {
//           await courseService.updateCourse(editId!, payload);
//           triggerSuccess('Course Program updated successfully.');
//         }
//       }

//       setIsFormOpen(false);
//       loadData();
//     } catch (err: any) {
//       console.error(err);
//       setError(err.response?.data?.error || 'Validation error saving changes.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Module Forms Actions
//   const openCreateModuleForm = () => {
//     setModuleFormMode('create');
//     setEditModuleId(null);
//     setModuleTitle('');
//     setModuleSortOrder((activeCourseDetails?.modules?.length || 0) + 1);
//     setIsModuleFormOpen(true);
//   };

//   const openEditModuleForm = (mod: any) => {
//     setModuleFormMode('edit');
//     setEditModuleId(mod.id);
//     setModuleTitle(mod.title);
//     setModuleSortOrder(mod.sortOrder || 1);
//     setIsModuleFormOpen(true);
//   };

//   const handleModuleFormSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!moduleTitle.trim()) return;
//     try {
//       setLoading(true);
//       if (moduleFormMode === 'create') {
//         await courseService.createModule({
//           courseId: selectedCourseId,
//           title: moduleTitle,
//           sortOrder: Number(moduleSortOrder)
//         });
//         triggerSuccess('Module created.');
//       } else {
//         await courseService.updateModule(editModuleId!, {
//           title: moduleTitle,
//           sortOrder: Number(moduleSortOrder)
//         });
//         triggerSuccess('Module updated.');
//       }
//       setIsModuleFormOpen(false);
//       loadCourseDetails(selectedCourseId);
//     } catch (err) {
//       setError('Failed to save module details.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Lesson Forms Actions
//   const openCreateLessonForm = (moduleId: string) => {
//     setLessonFormMode('create');
//     setEditLessonId(null);
//     setTargetModuleId(moduleId);
//     setLessonTitle('');
//     setLessonDuration('');
//     setLessonVideoType('youtube');
//     setLessonYoutubeId('');
//     setLessonIsPreview(false);
//     // Auto-calculate sortOrder
//     const targetMod = activeCourseDetails?.modules?.find((m: any) => m.id === moduleId);
//     setLessonSortOrder((targetMod?.lessons?.length || 0) + 1);
//     setIsLessonFormOpen(true);
//   };

//   const openEditLessonForm = (moduleId: string, lesson: any) => {
//     setLessonFormMode('edit');
//     setEditLessonId(lesson.id);
//     setTargetModuleId(moduleId);
//     setLessonTitle(lesson.title);
//     setLessonDuration(lesson.duration || '');
//     setLessonVideoType('youtube'); // fallback
//     setLessonYoutubeId('');
//     setLessonIsPreview(lesson.isPreview || false);
//     setLessonSortOrder(lesson.sortOrder || 1);
    
//     // Fetch lesson private YouTube Video details
//     api.get(`/admin/lessons/${lesson.id}`).then((res) => {
//       const fullLesson = res.data;
//       setLessonVideoType(fullLesson.videoType || 'youtube');
//       setLessonYoutubeId(fullLesson.youtubeVideoId || '');
//     }).catch(() => {});

//     setIsLessonFormOpen(true);
//   };

//   const handleLessonFormSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!lessonTitle.trim()) return;
//     try {
//       setLoading(true);
//       const payload = {
//         moduleId: targetModuleId,
//         courseId: selectedCourseId,
//         title: lessonTitle,
//         duration: lessonDuration,
//         videoType: lessonVideoType,
//         youtubeVideoId: lessonYoutubeId,
//         isPreview: lessonIsPreview,
//         sortOrder: Number(lessonSortOrder),
//         isActive: true
//       };

//       if (lessonFormMode === 'create') {
//         await courseService.createLesson(payload);
//         triggerSuccess('Lesson created.');
//       } else {
//         await courseService.updateLesson(editLessonId!, payload);
//         triggerSuccess('Lesson updated.');
//       }
//       setIsLessonFormOpen(false);
//       loadCourseDetails(selectedCourseId);
//     } catch (err) {
//       setError('Failed to save lesson settings.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-8 text-left">
//       <div className="border-b border-stone-850 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-display font-extrabold text-white">System Admin Workstation</h1>
//           <p className="text-xs text-stone-450 mt-1">Manage courses, instructors, lessons, and database configurations.</p>
//         </div>
        
//         {activeTab !== 'classroom' && (
//           <button
//             onClick={openCreateForm}
//             className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shadow-lg self-start"
//           >
//             <Plus className="w-4 h-4" />
//             Create New
//           </button>
//         )}
//       </div>

//       {/* Tabs list Navigation */}
//       <div className="flex border-b border-stone-850 gap-2 overflow-x-auto scrollbar-none">
//         {[
//           { id: 'courses', label: 'Programs (Courses)', icon: BookOpen },
//           { id: 'classroom', label: 'Modules & Lessons', icon: FolderOpen },
//           { id: 'categories', label: 'Categories', icon: Layers },
//           { id: 'instructors', label: 'Instructors', icon: Users },
//         ].map((tab) => {
//           const Icon = tab.icon;
//           return (
//             <button
//               key={tab.id}
//               onClick={() => {
//                 setActiveTab(tab.id as any);
//                 setError(null);
//               }}
//               className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
//                 activeTab === tab.id
//                   ? 'border-amber-500 text-amber-400 font-bold'
//                   : 'border-transparent text-stone-400 hover:text-white'
//               }`}
//             >
//               <Icon className="w-4 h-4" />
//               {tab.label}
//             </button>
//           );
//         })}
//       </div>

//       {/* Messages */}
//       {error && (
//         <div className="bg-red-950/20 border border-red-900/40 p-4 rounded-xl flex items-start gap-3">
//           <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
//           <div>
//             <span className="text-xs font-semibold text-red-400 block">Operation Failed</span>
//             <p className="text-[11px] text-red-300/80 mt-0.5 leading-relaxed">{error}</p>
//           </div>
//         </div>
//       )}

//       {successMsg && (
//         <div className="bg-emerald-950/20 border border-emerald-900/40 p-3.5 rounded-xl flex items-center gap-2">
//           <Check className="w-4 h-4 text-emerald-450" />
//           <span className="text-xs text-emerald-450 font-bold">{successMsg}</span>
//         </div>
//       )}

//       {/* TAB CONTENT PANELS */}
      
//       {/* 1. COURSES TAB */}
//       {activeTab === 'courses' && (
//         <div className="bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden shadow-xl">
//           <div className="overflow-x-auto">
//             <table className="w-full text-xs text-left">
//               <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider text-[10px] border-b border-stone-850">
//                 <tr>
//                   <th className="px-6 py-4 font-bold">Image / Title</th>
//                   <th className="px-6 py-4 font-bold">Category</th>
//                   <th className="px-6 py-4 font-bold">Level / Duration</th>
//                   <th className="px-6 py-4 font-bold">Price</th>
//                   <th className="px-6 py-4 font-bold">Status</th>
//                   <th className="px-6 py-4 font-bold text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-stone-850/65 text-stone-300">
//                 {courses.length === 0 ? (
//                   <tr>
//                     <td colSpan={6} className="px-6 py-10 text-center text-stone-500">No programs in database.</td>
//                   </tr>
//                 ) : (
//                   courses.map((item) => (
//                     <tr key={item.id} className="hover:bg-stone-850/30 transition-colors">
//                       <td className="px-6 py-4 flex items-center gap-3">
//                         <img src={item.image} alt="" className="w-12 h-8 object-cover rounded bg-stone-950 border border-stone-800" />
//                         <div>
//                           <strong className="text-white block font-bold">{item.title}</strong>
//                           <span className="text-[10px] text-stone-550 block font-mono">{item.slug}</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 font-medium">{item.category}</td>
//                       <td className="px-6 py-4 text-stone-400">
//                         {item.level} <span className="text-stone-600 font-mono">//</span> {item.duration}
//                       </td>
//                       <td className="px-6 py-4 font-bold text-white">₹{item.price}</td>
//                       <td className="px-6 py-4">
//                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
//                           item.status === 'available'
//                             ? 'bg-emerald-950/20 text-emerald-450 border-emerald-900/35'
//                             : 'bg-stone-950 text-amber-500 border-amber-900/30'
//                         }`}>
//                           {item.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-right">
//                         <div className="flex items-center justify-end gap-2.5">
//                           <button
//                             onClick={() => openEditForm(item)}
//                             className="p-1 hover:text-amber-400 transition-colors"
//                             title="Edit Program Details"
//                           >
//                             <Edit className="w-4 h-4" />
//                           </button>
//                           <button
//                             onClick={() => handleDeleteCourse(item.id)}
//                             className="p-1 hover:text-red-500 transition-colors"
//                             title="Delete Program"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* 2. CATEGORIES TAB */}
//       {activeTab === 'categories' && (
//         <div className="bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden shadow-xl max-w-3xl">
//           <table className="w-full text-xs text-left">
//             <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider text-[10px] border-b border-stone-850">
//               <tr>
//                 <th className="px-6 py-4 font-bold">Category Name</th>
//                 <th className="px-6 py-4 font-bold">Slug Name</th>
//                 <th className="px-6 py-4 font-bold text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-stone-850/65 text-stone-300">
//               {categories.length === 0 ? (
//                 <tr>
//                   <td colSpan={3} className="px-6 py-8 text-center text-stone-500">No categories loaded.</td>
//                 </tr>
//               ) : (
//                 categories.map((item) => (
//                   <tr key={item.id} className="hover:bg-stone-850/30 transition-colors">
//                     <td className="px-6 py-4 font-bold text-white">{item.name}</td>
//                     <td className="px-6 py-4 font-mono text-stone-450">{item.slug}</td>
//                     <td className="px-6 py-4 text-right">
//                       <div className="flex items-center justify-end gap-2.5">
//                         <button onClick={() => openEditForm(item)} className="p-1 hover:text-amber-400 transition-colors">
//                           <Edit className="w-4 h-4" />
//                         </button>
//                         <button onClick={() => handleDeleteCategory(item.id)} className="p-1 hover:text-red-500 transition-colors">
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* 3. INSTRUCTORS TAB */}
//       {activeTab === 'instructors' && (
//         <div className="bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden shadow-xl">
//           <table className="w-full text-xs text-left">
//             <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider text-[10px] border-b border-stone-850">
//               <tr>
//                 <th className="px-6 py-4 font-bold">Instructor Info</th>
//                 <th className="px-6 py-4 font-bold">Designation (Role)</th>
//                 <th className="px-6 py-4 font-bold">Bio Summary</th>
//                 <th className="px-6 py-4 font-bold text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-stone-850/65 text-stone-300">
//               {instructors.length === 0 ? (
//                 <tr>
//                   <td colSpan={4} className="px-6 py-8 text-center text-stone-500">No instructors loaded.</td>
//                 </tr>
//               ) : (
//                 instructors.map((item) => (
//                   <tr key={item.id} className="hover:bg-stone-850/30 transition-colors">
//                     <td className="px-6 py-4 flex items-center gap-3">
//                       <img src={item.profileImage || item.image} alt="" className="w-8 h-8 rounded-full object-cover bg-stone-950 border border-stone-800" />
//                       <strong className="text-white block font-bold">{item.name}</strong>
//                     </td>
//                     <td className="px-6 py-4 text-stone-400 font-medium">{item.designation || item.role}</td>
//                     <td className="px-6 py-4 text-stone-500 max-w-sm truncate">{item.bio}</td>
//                     <td className="px-6 py-4 text-right">
//                       <div className="flex items-center justify-end gap-2.5">
//                         <button onClick={() => openEditForm(item)} className="p-1 hover:text-amber-400 transition-colors">
//                           <Edit className="w-4 h-4" />
//                         </button>
//                         <button onClick={() => handleDeleteInstructor(item.id)} className="p-1 hover:text-red-500 transition-colors">
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* 4. CLASSROOM SYLLABUS TAB */}
//       {activeTab === 'classroom' && (
//         <div className="space-y-6">
//           <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//             <div className="space-y-1">
//               <label className="text-[10px] font-bold text-stone-450 uppercase tracking-wider block">Target Learning Program</label>
//               <select
//                 value={selectedCourseId}
//                 onChange={(e) => setSelectedCourseId(e.target.value)}
//                 className="bg-stone-955 border border-stone-800 text-xs px-3 py-2 rounded-lg text-white font-semibold focus:outline-none focus:border-amber-500 w-64 mt-1"
//               >
//                 <option value="">-- Choose Program --</option>
//                 {courses.map(c => (
//                   <option key={c.id} value={c.id}>{c.title}</option>
//                 ))}
//               </select>
//             </div>

//             {selectedCourseId && (
//               <button
//                 onClick={openCreateModuleForm}
//                 className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg self-start sm:self-end"
//               >
//                 <Plus className="w-3.5 h-3.5" />
//                 Add Module
//               </button>
//             )}
//           </div>

//           {!selectedCourseId ? (
//             <div className="border-2 border-dashed border-stone-850 p-12 text-center rounded-2xl">
//               <FolderOpen className="w-8 h-8 text-stone-600 mx-auto mb-2" />
//               <p className="text-xs text-stone-500">Please choose a program above to configure its learning syllabus modules.</p>
//             </div>
//           ) : !activeCourseDetails ? (
//             <div className="flex justify-center py-12">
//               <Loader2 className="w-6 h-6 text-amber-505 animate-spin" />
//             </div>
//           ) : (
//             <div className="space-y-5">
//               {activeCourseDetails.modules?.length === 0 ? (
//                 <div className="border border-stone-850 p-8 text-center rounded-2xl bg-stone-900">
//                   <p className="text-xs text-stone-500">This course program has no curriculum modules configured yet.</p>
//                 </div>
//               ) : (
//                 activeCourseDetails.modules.map((mod: any) => (
//                   <div key={mod.id} className="bg-stone-900 border border-stone-850 rounded-2xl p-5 space-y-4">
//                     <div className="flex items-center justify-between border-b border-stone-850 pb-3">
//                       <div className="flex items-center gap-2">
//                         <span className="font-mono text-[10px] text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-550/15">
//                           Module {mod.sortOrder}
//                         </span>
//                         <h3 className="font-display font-bold text-white text-sm">{mod.title}</h3>
//                       </div>
                      
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => openCreateLessonForm(mod.id)}
//                           className="px-2.5 py-1 bg-stone-950 hover:bg-stone-850 border border-stone-800 text-[10px] font-bold rounded text-amber-400 inline-flex items-center gap-1"
//                         >
//                           <Plus className="w-3 h-3" /> Add Lesson
//                         </button>
//                         <button onClick={() => openEditModuleForm(mod)} className="p-1 hover:text-amber-400 text-stone-500">
//                           <Edit className="w-3.5 h-3.5" />
//                         </button>
//                         <button onClick={() => handleDeleteModule(mod.id)} className="p-1 hover:text-red-500 text-stone-500">
//                           <Trash2 className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                     </div>

//                     {/* Module Lessons list */}
//                     <div className="space-y-2">
//                       {mod.lessons?.length === 0 ? (
//                         <span className="text-[10px] text-stone-600 italic block py-2 pl-2">No lessons inside this module.</span>
//                       ) : (
//                         mod.lessons.map((lesson: any) => (
//                           <div key={lesson.id} className="flex items-center justify-between bg-stone-955 border border-stone-800/80 p-3 rounded-xl pl-4 hover:border-stone-750 transition-colors">
//                             <div className="flex items-center gap-3">
//                               <span className="text-[10px] text-stone-500 font-bold font-mono">
//                                 L.{lesson.sortOrder}
//                               </span>
//                               <div>
//                                 <span className="text-xs font-semibold text-white block">{lesson.title}</span>
//                                 <div className="flex items-center gap-2 mt-0.5">
//                                   <span className="text-[9px] text-stone-500 font-medium font-mono">{lesson.duration}</span>
//                                   {lesson.isPreview && (
//                                     <span className="text-[8px] bg-emerald-950/20 text-emerald-450 border border-emerald-900/35 px-1 py-0.2 rounded font-bold uppercase">
//                                       Free Preview
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>

//                             <div className="flex items-center gap-2">
//                               <button onClick={() => openEditLessonForm(mod.id, lesson)} className="p-1 hover:text-amber-400 text-stone-500">
//                                 <Edit className="w-3.5 h-3.5" />
//                               </button>
//                               <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1 hover:text-red-500 text-stone-500">
//                                 <Trash2 className="w-3.5 h-3.5" />
//                               </button>
//                             </div>
//                           </div>
//                         ))
//                       )}
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {/* 5. MAIN MAIN MODAL DIALOGS */}
//       {isFormOpen && (
//         <div 
//           onClick={(e) => {
//             if (e.target === e.currentTarget) setIsFormOpen(false);
//           }}
//           className="fixed inset-0 bg-black/75 backdrop-blur-[4px] flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in"
//         >
//           <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-4 animate-scale-in text-left">
//             <button
//               onClick={() => setIsFormOpen(false)}
//               className="absolute top-4 right-4 p-1.5 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors"
//             >
//               <X className="w-5 h-5" />
//             </button>

//             <h2 className="text-base font-display font-extrabold text-white border-b border-stone-800 pb-3 uppercase tracking-wider">
//               {formMode === 'create' ? 'Create' : 'Modify'} {activeTab.slice(0, -1)} Settings
//             </h2>

//             <form onSubmit={handleMainFormSubmit} className="space-y-5 text-xs">
              
//               {/* Category Subform */}
//               {activeTab === 'categories' && (
//                 <div className="space-y-4">
//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Category Name</label>
//                     <input
//                       type="text"
//                       required
//                       value={categoryName}
//                       onChange={(e) => {
//                         setCategoryName(e.target.value);
//                         setCategorySlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
//                       }}
//                       className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
//                     />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">URL Slug Name</label>
//                     <input
//                       type="text"
//                       required
//                       value={categorySlug}
//                       onChange={(e) => setCategorySlug(e.target.value)}
//                       className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 font-mono"
//                     />
//                   </div>
//                 </div>
//               )}

//               {/* Instructor Subform */}
//               {activeTab === 'instructors' && (
//                 <div className="space-y-4">
//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Instructor Full Name</label>
//                     <input
//                       type="text"
//                       required
//                       value={instName}
//                       onChange={(e) => setInstName(e.target.value)}
//                       className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
//                     />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Designation (Role)</label>
//                     <input
//                       type="text"
//                       required
//                       value={instDesignation}
//                       onChange={(e) => setInstDesignation(e.target.value)}
//                       placeholder="e.g. Principal Security Analyst"
//                       className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
//                     />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Profile Picture URL</label>
//                     <input
//                       type="url"
//                       value={instImage}
//                       onChange={(e) => setInstImage(e.target.value)}
//                       className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 font-mono"
//                     />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Bio Description</label>
//                     <textarea
//                       rows={4}
//                       value={instBio}
//                       onChange={(e) => setInstBio(e.target.value)}
//                       className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 resize-none"
//                     />
//                   </div>
//                 </div>
//               )}

//               {/* Course Subform */}
//               {activeTab === 'courses' && (
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div className="space-y-1.5">
//                       <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Program Title</label>
//                       <input
//                         type="text"
//                         required
//                         value={courseTitle}
//                         onChange={(e) => {
//                           setCourseTitle(e.target.value);
//                           setCourseSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
//                         }}
//                         className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
//                       />
//                     </div>
//                     <div className="space-y-1.5">
//                       <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">URL Slug Name</label>
//                       <input
//                         type="text"
//                         required
//                         value={courseSlug}
//                         onChange={(e) => setCourseSlug(e.target.value)}
//                         className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 font-mono"
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div className="space-y-1.5">
//                       <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Category Type</label>
//                       <select
//                         value={courseCatId}
//                         onChange={(e) => setCourseCatId(e.target.value)}
//                         className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%23a8a29e%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[size:16px_16px] bg-no-repeat pr-10"
//                       >
//                         {categories.map(c => (
//                           <option key={c.id} value={c.id}>{c.name}</option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="space-y-1.5">
//                       <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Lead Instructor</label>
//                       <select
//                         value={courseInstId}
//                         onChange={(e) => setCourseInstId(e.target.value)}
//                         className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%23a8a29e%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[size:16px_16px] bg-no-repeat pr-10"
//                       >
//                         {instructors.map(ins => (
//                           <option key={ins.id} value={ins.id}>{ins.name}</option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-3 gap-3">
//                     <div className="space-y-1.5">
//                       <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Selling Price (₹)</label>
//                       <input
//                         type="number"
//                         required
//                         value={coursePrice}
//                         onChange={(e) => setCoursePrice(Number(e.target.value))}
//                         className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 font-mono"
//                       />
//                     </div>
//                     <div className="space-y-1.5">
//                       <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Discount Price (₹)</label>
//                       <input
//                         type="number"
//                         value={courseDiscountPrice}
//                         onChange={(e) => setCourseDiscountPrice(e.target.value)}
//                         placeholder="None"
//                         className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 font-mono"
//                       />
//                     </div>
//                     <div className="space-y-1.5">
//                       <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Level Target</label>
//                       <select
//                         value={courseLevel}
//                         onChange={(e) => setCourseLevel(e.target.value)}
//                         className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%23a8a29e%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[size:16px_16px] bg-no-repeat pr-10"
//                       >
//                         <option value="Beginner">Beginner</option>
//                         <option value="Intermediate">Intermediate</option>
//                         <option value="Advanced">Advanced</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-1.5">
//                       <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Duration (e.g. 15 hours)</label>
//                       <input
//                         type="text"
//                         required
//                         value={courseDuration}
//                         onChange={(e) => setCourseDuration(e.target.value)}
//                         className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
//                       />
//                     </div>
//                     <div className="space-y-1.5">
//                       <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Status</label>
//                       <select
//                         value={courseStatus}
//                         onChange={(e) => setCourseStatus(e.target.value)}
//                         className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%23a8a29e%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[size:16px_16px] bg-no-repeat pr-10"
//                       >
//                         <option value="draft">Draft (Hidden)</option>
//                         <option value="available">Available (Active)</option>
//                         <option value="coming-soon">Coming Soon</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Thumbnail Image URL</label>
//                     <input
//                       type="url"
//                       value={courseThumbnail}
//                       onChange={(e) => setCourseThumbnail(e.target.value)}
//                       className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 font-mono"
//                     />
//                   </div>

//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Skills Taught (comma-separated)</label>
//                     <input
//                       type="text"
//                       value={courseSkills}
//                       onChange={(e) => setCourseSkills(e.target.value)}
//                       placeholder="Security scanning, PenTesting, Metasploit"
//                       className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
//                     />
//                   </div>

//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Short Description</label>
//                     <input
//                       type="text"
//                       value={courseShortDesc}
//                       onChange={(e) => setCourseShortDesc(e.target.value)}
//                       className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
//                     />
//                   </div>

//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Full Description</label>
//                     <textarea
//                       rows={3}
//                       required
//                       value={courseDesc}
//                       onChange={(e) => setCourseDesc(e.target.value)}
//                       className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 resize-none"
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div className="space-y-1.5">
//                       <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Prerequisites (one per line)</label>
//                       <textarea
//                         rows={2}
//                         value={courseReqs}
//                         onChange={(e) => setCourseReqs(e.target.value)}
//                         className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 resize-none"
//                       />
//                     </div>
//                     <div className="space-y-1.5">
//                       <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Who is it for? (one per line)</label>
//                       <textarea
//                         rows={2}
//                         value={courseWhoFor}
//                         onChange={(e) => setCourseWhoFor(e.target.value)}
//                         className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 resize-none"
//                       />
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 pt-2">
//                     <input
//                       type="checkbox"
//                       id="courseFeatured"
//                       checked={courseFeatured}
//                       onChange={(e) => setCourseFeatured(e.target.checked)}
//                       className="rounded accent-amber-500 bg-stone-955 border-stone-855 w-4 h-4 cursor-pointer"
//                     />
//                     <label htmlFor="courseFeatured" className="text-stone-300 font-semibold cursor-pointer select-none">
//                       Feature on Homepage banner slider grids
//                     </label>
//                   </div>
//                 </div>
//               )}

//               {/* Submit Buttons footer */}
//               <div className="flex items-center justify-end gap-3 border-t border-stone-850 pt-4 mt-2">
//                 <button
//                   type="button"
//                   onClick={() => setIsFormOpen(false)}
//                   className="px-4 py-2 border border-stone-850 rounded-lg text-stone-400 hover:text-white transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="btn-primary px-5 py-2 rounded-lg text-stone-950 font-bold inline-flex items-center gap-1.5 shadow-md"
//                 >
//                   {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
//                   Save Settings
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* MODULE DIALOG */}
//       {isModuleFormOpen && (
//         <div 
//           onClick={(e) => {
//             if (e.target === e.currentTarget) setIsModuleFormOpen(false);
//           }}
//           className="fixed inset-0 bg-black/75 backdrop-blur-[4px] flex items-center justify-center p-4 z-50 animate-fade-in"
//         >
//           <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6 relative space-y-4 shadow-2xl animate-scale-in text-left">
//             <button 
//               onClick={() => setIsModuleFormOpen(false)} 
//               className="absolute top-4 right-4 p-1.5 hover:bg-stone-805 rounded-lg text-stone-400 hover:text-white transition-colors"
//             >
//               <X className="w-5 h-5" />
//             </button>
//             <h3 className="text-base font-display font-extrabold text-white border-b border-stone-800 pb-2.5 uppercase tracking-wider">
//               {moduleFormMode === 'create' ? 'Create' : 'Edit'} Syllabus Module
//             </h3>
//             <form onSubmit={handleModuleFormSubmit} className="space-y-4 text-xs">
//               <div className="space-y-1.5">
//                 <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Module Title</label>
//                 <input
//                   type="text"
//                   required
//                   value={moduleTitle}
//                   onChange={(e) => setModuleTitle(e.target.value)}
//                   className="w-full bg-stone-950 border border-stone-850 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
//                 />
//               </div>
//               <div className="space-y-1.5">
//                 <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Sort Order Sequence</label>
//                 <input
//                   type="number"
//                   required
//                   value={moduleSortOrder}
//                   onChange={(e) => setModuleSortOrder(Number(e.target.value))}
//                   className="w-full bg-stone-955 border border-stone-850 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 font-mono"
//                 />
//               </div>
//               <div className="flex justify-end gap-3 border-t border-stone-850 pt-4 mt-2">
//                 <button type="button" onClick={() => setIsModuleFormOpen(false)} className="px-4 py-2 border border-stone-850 rounded-lg text-stone-450 hover:text-white transition-colors">Cancel</button>
//                 <button type="submit" className="btn-primary px-5 py-2 rounded-lg font-bold text-stone-950 shadow-md">Save Module</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* LESSON DIALOG */}
//       {isLessonFormOpen && (
//         <div 
//           onClick={(e) => {
//             if (e.target === e.currentTarget) setIsLessonFormOpen(false);
//           }}
//           className="fixed inset-0 bg-black/75 backdrop-blur-[4px] flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in"
//         >
//           <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6 relative space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in text-left">
//             <button 
//               onClick={() => setIsLessonFormOpen(false)} 
//               className="absolute top-4 right-4 p-1.5 hover:bg-stone-805 rounded-lg text-stone-400 hover:text-white transition-colors"
//             >
//               <X className="w-5 h-5" />
//             </button>
//             <h3 className="text-base font-display font-extrabold text-white border-b border-stone-850 pb-2.5 uppercase tracking-wider">
//               {lessonFormMode === 'create' ? 'Create' : 'Edit'} Lesson Details
//             </h3>
//             <form onSubmit={handleLessonFormSubmit} className="space-y-4 text-xs">
//               <div className="space-y-1.5">
//                 <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Lesson Title</label>
//                 <input
//                   type="text"
//                   required
//                   value={lessonTitle}
//                   onChange={(e) => setLessonTitle(e.target.value)}
//                   className="w-full bg-stone-955 border border-stone-850 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1.5">
//                   <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Duration (e.g. 10m 15s)</label>
//                   <input
//                     type="text"
//                     required
//                     value={lessonDuration}
//                     onChange={(e) => setLessonDuration(e.target.value)}
//                     className="w-full bg-stone-955 border border-stone-850 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
//                   />
//                 </div>
//                 <div className="space-y-1.5">
//                   <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Sort Sequence</label>
//                   <input
//                     type="number"
//                     required
//                     value={lessonSortOrder}
//                     onChange={(e) => setLessonSortOrder(Number(e.target.value))}
//                     className="w-full bg-stone-955 border border-stone-850 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 font-mono"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Video Provider Type</label>
//                 <select
//                   value={lessonVideoType}
//                   onChange={(e) => setLessonVideoType(e.target.value as any)}
//                   className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%23a8a29e%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[size:16px_16px] bg-no-repeat pr-10"
//                 >
//                   <option value="youtube">YouTube Unlisted URL / Video ID</option>
//                   <option value="hls">Secure HLS Stream</option>
//                 </select>
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">
//                   {lessonVideoType === 'youtube' ? 'YouTube Video ID (11 chars)' : 'HLS Video Stream URL'}
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={lessonYoutubeId}
//                   onChange={(e) => {
//                     const val = e.target.value;
//                     if (lessonVideoType === 'youtube') {
//                       setLessonYoutubeId(extractYoutubeId(val));
//                     } else {
//                       setLessonYoutubeId(val);
//                     }
//                   }}
//                   placeholder={lessonVideoType === 'youtube' ? 'e.g. dQw4w9WgXcQ' : 'e.g. https://domain.com/video.m3u8'}
//                   className="w-full bg-stone-955 border border-stone-850 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 font-mono"
//                 />
//               </div>

//               <div className="flex items-center gap-3 pt-2">
//                 <input
//                   type="checkbox"
//                   id="lessonPreview"
//                   checked={lessonIsPreview}
//                   onChange={(e) => setLessonIsPreview(e.target.checked)}
//                   className="w-4 h-4 accent-amber-500 rounded bg-stone-955 border-stone-850 cursor-pointer"
//                 />
//                 <label htmlFor="lessonPreview" className="text-stone-300 font-semibold cursor-pointer select-none">
//                   Allow Free Preview before checkout
//                 </label>
//               </div>

//               <div className="flex justify-end gap-3 border-t border-stone-850 pt-4 mt-2">
//                 <button type="button" onClick={() => setIsLessonFormOpen(false)} className="px-4 py-2 border border-stone-855 rounded-lg text-stone-450 hover:text-white transition-colors">Cancel</button>
//                 <button type="submit" className="btn-primary px-5 py-2 rounded-lg font-bold text-stone-955 shadow-md">Save Lesson</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };













import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, BookOpen, Layers, Users, FolderOpen, 
  Check, Loader2, AlertCircle, X 
} from 'lucide-react';
import { courseService } from '../../../services/courseService';
import api from '../../../services/api';
import type { Course, Instructor, Category } from '../../../types';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'categories' | 'instructors' | 'classroom'>('courses');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Loaded database items
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  
  // Selection states for Modules/Lessons management
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [activeCourseDetails, setActiveCourseDetails] = useState<any>(null);

  // Form active modals/mode states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<string | null>(null);

  // Individual Form fields states
  // 1. Category Form Fields
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');

  // 2. Instructor Form Fields
  const [instName, setInstName] = useState('');
  const [instDesignation, setInstDesignation] = useState('');
  const [instBio, setInstBio] = useState('');
  const [instImage, setInstImage] = useState('');

  // 3. Course Form Fields
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSlug, setCourseSlug] = useState('');
  const [courseShortDesc, setCourseShortDesc] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseThumbnail, setCourseThumbnail] = useState('');
  const [courseCatId, setCourseCatId] = useState('');
  const [courseInstId, setCourseInstId] = useState('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [courseDiscountPrice, setCourseDiscountPrice] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  const [courseLevel, setCourseLevel] = useState('Beginner');
  const [courseStatus, setCourseStatus] = useState('draft');
  const [courseFeatured, setCourseFeatured] = useState(false);
  const [courseSkills, setCourseSkills] = useState('');
  const [courseReqs, setCourseReqs] = useState('');
  const [courseWhoFor, setCourseWhoFor] = useState('');

  // 4. Module & Lesson Form states
  const [isModuleFormOpen, setIsModuleFormOpen] = useState(false);
  const [moduleFormMode, setModuleFormMode] = useState<'create' | 'edit'>('create');
  const [editModuleId, setEditModuleId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleSortOrder, setModuleSortOrder] = useState(1);

  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);
  const [lessonFormMode, setLessonFormMode] = useState<'create' | 'edit'>('create');
  const [editLessonId, setEditLessonId] = useState<string | null>(null);
  const [targetModuleId, setTargetModuleId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDuration, setLessonDuration] = useState('');
  const [lessonVideoType, setLessonVideoType] = useState<'youtube' | 'hls'>('youtube');
  const [lessonYoutubeId, setLessonYoutubeId] = useState('');
  const [lessonIsPreview, setLessonIsPreview] = useState(false);
  const [lessonSortOrder, setLessonSortOrder] = useState(1);

  const extractYoutubeId = (input: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = input.match(regExp);
    return (match && match[2].length === 11) ? match[2] : input;
  };

  // Fetch initial tables data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const coursesData = await courseService.getCourses();
      setCourses(coursesData);

      const catsData = await courseService.getAdminCategories();
      setCategories(catsData);

      const instsData = await courseService.getAdminInstructors();
      setInstructors(instsData);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch administrative lists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch individual course modules and lessons for classroom tab
  const loadCourseDetails = async (courseId: string) => {
    if (!courseId) {
      setActiveCourseDetails(null);
      return;
    }
    try {
      setLoading(true);
      const data = await api.get(`/courses/${courseId}`); // details endpoint returns entire curriculum
      setActiveCourseDetails(data.data);
    } catch (err) {
      setError('Failed to retrieve course curriculum structure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'classroom' && selectedCourseId) {
      loadCourseDetails(selectedCourseId);
    }
  }, [activeTab, selectedCourseId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFormOpen(false);
        setIsModuleFormOpen(false);
        setIsLessonFormOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // 1. DELETE Handlers
  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Category? Course relations will be broken.')) return;
    try {
      await courseService.deleteCategory(id);
      triggerSuccess('Category deleted successfully.');
      loadData();
    } catch (err) {
      setError('Failed to delete category.');
    }
  };

  const handleDeleteInstructor = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Instructor? Course relations will be broken.')) return;
    try {
      await courseService.deleteInstructor(id);
      triggerSuccess('Instructor deleted successfully.');
      loadData();
    } catch (err) {
      setError('Failed to delete instructor.');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Course Program? All nested modules, lessons, progress and enrollments will be deleted permanently.')) return;
    try {
      await courseService.deleteCourse(id);
      triggerSuccess('Course Program deleted.');
      loadData();
    } catch (err) {
      setError('Failed to delete course.');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm('Are you sure? Deleting this module will delete all its lessons.')) return;
    try {
      await courseService.deleteModule(moduleId);
      triggerSuccess('Module deleted.');
      loadCourseDetails(selectedCourseId);
    } catch (err) {
      setError('Failed to delete module.');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await courseService.deleteLesson(lessonId);
      triggerSuccess('Lesson deleted.');
      loadCourseDetails(selectedCourseId);
    } catch (err) {
      setError('Failed to delete lesson.');
    }
  };

  // 2. OPEN Forms Handlers
  const openCreateForm = () => {
    setFormMode('create');
    setEditId(null);
    setError(null);
    
    // Clear inputs
    setCategoryName('');
    setCategorySlug('');
    setInstName('');
    setInstDesignation('');
    setInstBio('');
    setInstImage('');
    setCourseTitle('');
    setCourseSlug('');
    setCourseShortDesc('');
    setCourseDesc('');
    setCourseThumbnail('');
    setCourseCatId(categories[0]?.id || '');
    setCourseInstId(instructors[0]?.id || '');
    setCoursePrice(0);
    setCourseDiscountPrice('');
    setCourseDuration('');
    setCourseLevel('Beginner');
    setCourseStatus('draft');
    setCourseFeatured(false);
    setCourseSkills('');
    setCourseReqs('');
    setCourseWhoFor('');

    setIsFormOpen(true);
  };

  const openEditForm = (item: any) => {
    setFormMode('edit');
    setEditId(item.id);
    setError(null);

    if (activeTab === 'categories') {
      setCategoryName(item.name);
      setCategorySlug(item.slug);
    } else if (activeTab === 'instructors') {
      setInstName(item.name);
      setInstDesignation(item.designation || item.role || '');
      setInstBio(item.bio || '');
      setInstImage(item.profileImage || item.image || '');
    } else if (activeTab === 'courses') {
      setCourseTitle(item.title);
      setCourseSlug(item.slug);
      setCourseShortDesc(item.description || '');
      setCourseDesc(item.description || '');
      setCourseThumbnail(item.image || '');
      // Look up corresponding original items to fill IDs if possible
      const matchedCat = categories.find(c => c.name === item.category);
      setCourseCatId(matchedCat?.id || categories[0]?.id || '');
      // Wait, we need to load fuller details for edit form to populate description, skills, etc.
      api.get(`/courses/${item.slug}`).then((res) => {
        const fullCourse = res.data;
        setCourseDesc(fullCourse.description || '');
        setCourseShortDesc(fullCourse.shortDescription || fullCourse.description || '');
        setCourseCatId(fullCourse.categoryId || matchedCat?.id || '');
        setCourseInstId(fullCourse.instructorId || instructors[0]?.id || '');
        setCoursePrice(fullCourse.price || 0);
        setCourseDiscountPrice(fullCourse.discountPrice ? String(fullCourse.discountPrice) : '');
        setCourseDuration(fullCourse.duration || '');
        setCourseLevel(fullCourse.level || 'Beginner');
        setCourseStatus(fullCourse.status || 'draft');
        setCourseFeatured(fullCourse.isFeatured || false);
        setCourseSkills((fullCourse.skills || []).join(', '));
        setCourseReqs((fullCourse.requirements || []).join('\n'));
        setCourseWhoFor((fullCourse.whoIsItFor || []).join('\n'));
      }).catch(() => {});
    }

    setIsFormOpen(true);
  };

  // 3. SUBMIT Forms Handlers
  const handleMainFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (activeTab === 'categories') {
        if (formMode === 'create') {
          await courseService.createCategory({ name: categoryName, slug: categorySlug });
          triggerSuccess('Category created successfully.');
        } else {
          await courseService.updateCategory(editId!, { name: categoryName, slug: categorySlug });
          triggerSuccess('Category updated successfully.');
        }
      } 
      
      else if (activeTab === 'instructors') {
        const payload = { name: instName, designation: instDesignation, bio: instBio, profileImage: instImage };
        if (formMode === 'create') {
          await courseService.createInstructor(payload);
          triggerSuccess('Instructor created successfully.');
        } else {
          await courseService.updateInstructor(editId!, payload);
          triggerSuccess('Instructor updated successfully.');
        }
      } 
      
      else if (activeTab === 'courses') {
        const payload = {
          title: courseTitle,
          slug: courseSlug,
          shortDescription: courseShortDesc || courseDesc.substring(0, 100),
          description: courseDesc,
          thumbnail: courseThumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop',
          categoryId: courseCatId,
          instructorId: courseInstId,
          price: Number(coursePrice),
          discountPrice: courseDiscountPrice ? Number(courseDiscountPrice) : undefined,
          duration: courseDuration,
          level: courseLevel,
          status: courseStatus,
          isFeatured: courseFeatured,
          skills: courseSkills.split(',').map(s => s.trim()).filter(Boolean),
          requirements: courseReqs.split('\n').map(s => s.trim()).filter(Boolean),
          whoIsItFor: courseWhoFor.split('\n').map(s => s.trim()).filter(Boolean),
        };

        if (formMode === 'create') {
          await courseService.createCourse(payload);
          triggerSuccess('Course Program created successfully.');
        } else {
          await courseService.updateCourse(editId!, payload);
          triggerSuccess('Course Program updated successfully.');
        }
      }

      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Validation error saving changes.');
    } finally {
      setLoading(false);
    }
  };

  // Module Forms Actions
  const openCreateModuleForm = () => {
    setModuleFormMode('create');
    setEditModuleId(null);
    setModuleTitle('');
    setModuleSortOrder((activeCourseDetails?.modules?.length || 0) + 1);
    setIsModuleFormOpen(true);
  };

  const openEditModuleForm = (mod: any) => {
    setModuleFormMode('edit');
    setEditModuleId(mod.id);
    setModuleTitle(mod.title);
    setModuleSortOrder(mod.sortOrder || 1);
    setIsModuleFormOpen(true);
  };

  const handleModuleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;
    try {
      setLoading(true);
      if (moduleFormMode === 'create') {
        await courseService.createModule({
          courseId: selectedCourseId,
          title: moduleTitle,
          sortOrder: Number(moduleSortOrder)
        });
        triggerSuccess('Module created.');
      } else {
        await courseService.updateModule(editModuleId!, {
          title: moduleTitle,
          sortOrder: Number(moduleSortOrder)
        });
        triggerSuccess('Module updated.');
      }
      setIsModuleFormOpen(false);
      loadCourseDetails(selectedCourseId);
    } catch (err) {
      setError('Failed to save module details.');
    } finally {
      setLoading(false);
    }
  };

  // Lesson Forms Actions
  const openCreateLessonForm = (moduleId: string) => {
    setLessonFormMode('create');
    setEditLessonId(null);
    setTargetModuleId(moduleId);
    setLessonTitle('');
    setLessonDuration('');
    setLessonVideoType('youtube');
    setLessonYoutubeId('');
    setLessonIsPreview(false);
    // Auto-calculate sortOrder
    const targetMod = activeCourseDetails?.modules?.find((m: any) => m.id === moduleId);
    setLessonSortOrder((targetMod?.lessons?.length || 0) + 1);
    setIsLessonFormOpen(true);
  };

  const openEditLessonForm = (moduleId: string, lesson: any) => {
    setLessonFormMode('edit');
    setEditLessonId(lesson.id);
    setTargetModuleId(moduleId);
    setLessonTitle(lesson.title);
    setLessonDuration(lesson.duration || '');
    setLessonVideoType('youtube'); // fallback
    setLessonYoutubeId('');
    setLessonIsPreview(lesson.isPreview || false);
    setLessonSortOrder(lesson.sortOrder || 1);
    
    // Fetch lesson private YouTube Video details
    api.get(`/admin/lessons/${lesson.id}`).then((res) => {
      const fullLesson = res.data;
      setLessonVideoType(fullLesson.videoType || 'youtube');
      setLessonYoutubeId(fullLesson.youtubeVideoId || '');
    }).catch(() => {});

    setIsLessonFormOpen(true);
  };

  const handleLessonFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;
    try {
      setLoading(true);
      const payload = {
        moduleId: targetModuleId,
        courseId: selectedCourseId,
        title: lessonTitle,
        duration: lessonDuration,
        videoType: lessonVideoType,
        youtubeVideoId: lessonYoutubeId,
        isPreview: lessonIsPreview,
        sortOrder: Number(lessonSortOrder),
        isActive: true
      };

      if (lessonFormMode === 'create') {
        await courseService.createLesson(payload);
        triggerSuccess('Lesson created.');
      } else {
        await courseService.updateLesson(editLessonId!, payload);
        triggerSuccess('Lesson updated.');
      }
      setIsLessonFormOpen(false);
      loadCourseDetails(selectedCourseId);
    } catch (err) {
      setError('Failed to save lesson settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div className="border-b border-stone-850 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-white">System Admin Workstation</h1>
          <p className="text-xs text-stone-450 mt-1">Manage courses, instructors, lessons, and database configurations.</p>
        </div>
        
        {activeTab !== 'classroom' && (
          <button
            onClick={openCreateForm}
            className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shadow-lg self-start"
          >
            <Plus className="w-4 h-4" />
            Create New
          </button>
        )}
      </div>

      {/* Tabs list Navigation */}
      <div className="flex border-b border-stone-850 gap-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'courses', label: 'Programs (Courses)', icon: BookOpen },
          { id: 'classroom', label: 'Modules & Lessons', icon: FolderOpen },
          { id: 'categories', label: 'Categories', icon: Layers },
          { id: 'instructors', label: 'Instructors', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setError(null);
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-400 font-bold'
                  : 'border-transparent text-stone-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-950/20 border border-red-900/40 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-red-400 block">Operation Failed</span>
            <p className="text-[11px] text-red-300/80 mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-950/20 border border-emerald-900/40 p-3.5 rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-450" />
          <span className="text-xs text-emerald-450 font-bold">{successMsg}</span>
        </div>
      )}

      {/* TAB CONTENT PANELS */}
      
      {/* 1. COURSES TAB */}
      {activeTab === 'courses' && (
        <div className="bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider text-[10px] border-b border-stone-850">
                <tr>
                  <th className="px-6 py-4 font-bold">Image / Title</th>
                  <th className="px-6 py-4 font-bold">Category</th>
                  <th className="px-6 py-4 font-bold">Level / Duration</th>
                  <th className="px-6 py-4 font-bold">Price</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-850/65 text-stone-300">
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-stone-500">No programs in database.</td>
                  </tr>
                ) : (
                  courses.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-850/30 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img src={item.image} alt="" className="w-12 h-8 object-cover rounded bg-stone-950 border border-stone-800" />
                        <div>
                          <strong className="text-white block font-bold">{item.title}</strong>
                          <span className="text-[10px] text-stone-550 block font-mono">{item.slug}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{item.category}</td>
                      <td className="px-6 py-4 text-stone-400">
                        {item.level} <span className="text-stone-600 font-mono">//</span> {item.duration}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">₹{item.price}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                          item.status === 'available'
                            ? 'bg-emerald-950/20 text-emerald-450 border-emerald-900/35'
                            : 'bg-stone-950 text-amber-500 border-amber-900/30'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => openEditForm(item)}
                            className="p-1 hover:text-amber-400 transition-colors"
                            title="Edit Program Details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(item.id)}
                            className="p-1 hover:text-red-500 transition-colors"
                            title="Delete Program"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden shadow-xl max-w-3xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider text-[10px] border-b border-stone-850">
              <tr>
                <th className="px-6 py-4 font-bold">Category Name</th>
                <th className="px-6 py-4 font-bold">Slug Name</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-850/65 text-stone-300">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-stone-500">No categories loaded.</td>
                </tr>
              ) : (
                categories.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-850/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{item.name}</td>
                    <td className="px-6 py-4 font-mono text-stone-450">{item.slug}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button onClick={() => openEditForm(item)} className="p-1 hover:text-amber-400 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteCategory(item.id)} className="p-1 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. INSTRUCTORS TAB */}
      {activeTab === 'instructors' && (
        <div className="bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider text-[10px] border-b border-stone-850">
              <tr>
                <th className="px-6 py-4 font-bold">Instructor Info</th>
                <th className="px-6 py-4 font-bold">Designation (Role)</th>
                <th className="px-6 py-4 font-bold">Bio Summary</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-850/65 text-stone-300">
              {instructors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-stone-500">No instructors loaded.</td>
                </tr>
              ) : (
                instructors.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-850/30 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={item.profileImage || item.image} alt="" className="w-8 h-8 rounded-full object-cover bg-stone-950 border border-stone-800" />
                      <strong className="text-white block font-bold">{item.name}</strong>
                    </td>
                    <td className="px-6 py-4 text-stone-400 font-medium">{item.designation || item.role}</td>
                    <td className="px-6 py-4 text-stone-500 max-w-sm truncate">{item.bio}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button onClick={() => openEditForm(item)} className="p-1 hover:text-amber-400 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteInstructor(item.id)} className="p-1 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. CLASSROOM SYLLABUS TAB */}
      {activeTab === 'classroom' && (
        <div className="space-y-6">
          <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-450 uppercase tracking-wider block">Target Learning Program</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-64 mt-1 bg-[#1c1917] border border-[#44403c] text-[#f5f5f4] text-xs px-3 py-2.5 rounded-lg font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 hover:border-stone-600 transition-all cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                <option value="" style={{ backgroundColor: '#1c1917', color: '#f5f5f4' }}>
                  -- Choose Program --
                </option>
                {courses.map(c => (
                  <option
                    key={c.id}
                    value={c.id}
                    style={{ backgroundColor: '#1c1917', color: '#f5f5f4' }}
                  >
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedCourseId && (
              <button
                onClick={openCreateModuleForm}
                className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg self-start sm:self-end"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Module
              </button>
            )}
          </div>

          {!selectedCourseId ? (
            <div className="border-2 border-dashed border-stone-850 p-12 text-center rounded-2xl">
              <FolderOpen className="w-8 h-8 text-stone-600 mx-auto mb-2" />
              <p className="text-xs text-stone-500">Please choose a program above to configure its learning syllabus modules.</p>
            </div>
          ) : !activeCourseDetails ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-amber-505 animate-spin" />
            </div>
          ) : (
            <div className="space-y-5">
              {activeCourseDetails.modules?.length === 0 ? (
                <div className="border border-stone-850 p-8 text-center rounded-2xl bg-stone-900">
                  <p className="text-xs text-stone-500">This course program has no curriculum modules configured yet.</p>
                </div>
              ) : (
                activeCourseDetails.modules.map((mod: any) => (
                  <div key={mod.id} className="bg-stone-900 border border-stone-850 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-850 pb-3 gap-2.5">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-mono text-[10px] text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-550/15 flex-shrink-0">
                          Module {mod.sortOrder}
                        </span>
                        <h3 className="font-display font-bold text-white text-sm break-words min-w-0 flex-1">{mod.title}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                        <button
                          onClick={() => openCreateLessonForm(mod.id)}
                          className="px-2.5 py-1 bg-stone-950 hover:bg-stone-850 border border-stone-800 text-[10px] font-bold rounded text-amber-400 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Lesson
                        </button>
                        <button onClick={() => openEditModuleForm(mod)} className="p-1 hover:text-amber-400 text-stone-500 cursor-pointer" title="Edit Module">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteModule(mod.id)} className="p-1 hover:text-red-500 text-stone-500 cursor-pointer" title="Delete Module">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Module Lessons list */}
                    <div className="space-y-2">
                      {mod.lessons?.length === 0 ? (
                        <span className="text-[10px] text-stone-600 italic block py-2 pl-2">No lessons inside this module.</span>
                      ) : (
                        mod.lessons.map((lesson: any) => (
                          <div key={lesson.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-stone-955 border border-stone-800/80 p-3 rounded-xl hover:border-stone-750 transition-colors gap-2.5">
                            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                              <span className="text-[10px] text-stone-500 font-bold font-mono flex-shrink-0 mt-0.5 sm:mt-0">
                                L.{lesson.sortOrder}
                              </span>
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-semibold text-white block break-words">{lesson.title}</span>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span className="text-[9px] text-stone-500 font-medium font-mono">{lesson.duration}</span>
                                  {lesson.isPreview && (
                                    <span className="text-[8px] bg-emerald-950/20 text-emerald-450 border border-emerald-900/35 px-1 py-0.2 rounded font-bold uppercase">
                                      Free Preview
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                              <button onClick={() => openEditLessonForm(mod.id, lesson)} className="p-1 hover:text-amber-400 text-stone-500 cursor-pointer" title="Edit Lesson">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1 hover:text-red-500 text-stone-500 cursor-pointer" title="Delete Lesson">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. MAIN MAIN MODAL DIALOGS */}
      {isFormOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFormOpen(false);
          }}
          className="fixed inset-0 bg-black/75 backdrop-blur-[4px] flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in"
        >
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-4 animate-scale-in text-left">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-display font-extrabold text-white border-b border-stone-800 pb-3 uppercase tracking-wider">
              {formMode === 'create' ? 'Create' : 'Modify'} {activeTab.slice(0, -1)} Settings
            </h2>

            <form onSubmit={handleMainFormSubmit} className="space-y-5 text-xs">
              
              {/* Category Subform */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Category Name</label>
                    <input
                      type="text"
                      required
                      value={categoryName}
                      onChange={(e) => {
                        setCategoryName(e.target.value);
                        setCategorySlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }}
                      className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">URL Slug Name</label>
                    <input
                      type="text"
                      required
                      value={categorySlug}
                      onChange={(e) => setCategorySlug(e.target.value)}
                      className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Instructor Subform */}
              {activeTab === 'instructors' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Instructor Full Name</label>
                    <input
                      type="text"
                      required
                      value={instName}
                      onChange={(e) => setInstName(e.target.value)}
                      className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Designation (Role)</label>
                    <input
                      type="text"
                      required
                      value={instDesignation}
                      onChange={(e) => setInstDesignation(e.target.value)}
                      placeholder="e.g. Principal Security Analyst"
                      className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Profile Picture URL</label>
                    <input
                      type="url"
                      value={instImage}
                      onChange={(e) => setInstImage(e.target.value)}
                      className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Bio Description</label>
                    <textarea
                      rows={4}
                      value={instBio}
                      onChange={(e) => setInstBio(e.target.value)}
                      className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Course Subform */}
              {activeTab === 'courses' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Program Title</label>
                      <input
                        type="text"
                        required
                        value={courseTitle}
                        onChange={(e) => {
                          setCourseTitle(e.target.value);
                          setCourseSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                        }}
                        className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">URL Slug Name</label>
                      <input
                        type="text"
                        required
                        value={courseSlug}
                        onChange={(e) => setCourseSlug(e.target.value)}
                        className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Category Type</label>
                      <select
                        value={courseCatId}
                        onChange={(e) => setCourseCatId(e.target.value)}
                        className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%23a8a29e%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[size:16px_16px] bg-no-repeat pr-10"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Lead Instructor</label>
                      <select
                        value={courseInstId}
                        onChange={(e) => setCourseInstId(e.target.value)}
                        className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%23a8a29e%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[size:16px_16px] bg-no-repeat pr-10"
                      >
                        {instructors.map(ins => (
                          <option key={ins.id} value={ins.id}>{ins.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Selling Price (₹)</label>
                      <input
                        type="number"
                        required
                        value={coursePrice}
                        onChange={(e) => setCoursePrice(Number(e.target.value))}
                        className="w-full bg-stone-955 border border-stone-850 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Discount Price (₹)</label>
                      <input
                        type="number"
                        value={courseDiscountPrice}
                        onChange={(e) => setCourseDiscountPrice(e.target.value)}
                        placeholder="None"
                        className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Level Target</label>
                      <select
                        value={courseLevel}
                        onChange={(e) => setCourseLevel(e.target.value)}
                        className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%23a8a29e%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[size:16px_16px] bg-no-repeat pr-10"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Duration (e.g. 15 hours)</label>
                      <input
                        type="text"
                        required
                        value={courseDuration}
                        onChange={(e) => setCourseDuration(e.target.value)}
                        className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Status</label>
                      <select
                        value={courseStatus}
                        onChange={(e) => setCourseStatus(e.target.value)}
                        className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%23a8a29e%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[size:16px_16px] bg-no-repeat pr-10"
                      >
                        <option value="draft">Draft (Hidden)</option>
                        <option value="available">Available (Active)</option>
                        <option value="coming-soon">Coming Soon</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Thumbnail Image URL</label>
                    <input
                      type="url"
                      value={courseThumbnail}
                      onChange={(e) => setCourseThumbnail(e.target.value)}
                      className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Skills Taught (comma-separated)</label>
                    <input
                      type="text"
                      value={courseSkills}
                      onChange={(e) => setCourseSkills(e.target.value)}
                      placeholder="Security scanning, PenTesting, Metasploit"
                      className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Short Description</label>
                    <input
                      type="text"
                      value={courseShortDesc}
                      onChange={(e) => setCourseShortDesc(e.target.value)}
                      className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Full Description</label>
                    <textarea
                      rows={3}
                      required
                      value={courseDesc}
                      onChange={(e) => setCourseDesc(e.target.value)}
                      className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Prerequisites (one per line)</label>
                      <textarea
                        rows={2}
                        value={courseReqs}
                        onChange={(e) => setCourseReqs(e.target.value)}
                        className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 resize-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Who is it for? (one per line)</label>
                      <textarea
                        rows={2}
                        value={courseWhoFor}
                        onChange={(e) => setCourseWhoFor(e.target.value)}
                        className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="courseFeatured"
                      checked={courseFeatured}
                      onChange={(e) => setCourseFeatured(e.target.checked)}
                      className="rounded accent-amber-500 bg-stone-955 border-stone-855 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="courseFeatured" className="text-stone-300 font-semibold cursor-pointer select-none">
                      Feature on Homepage banner slider grids
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Buttons footer */}
              <div className="flex items-center justify-end gap-3 border-t border-stone-850 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-stone-850 rounded-lg text-stone-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-5 py-2 rounded-lg text-stone-950 font-bold inline-flex items-center gap-1.5 shadow-md"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODULE DIALOG */}
      {isModuleFormOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModuleFormOpen(false);
          }}
          className="fixed inset-0 bg-black/75 backdrop-blur-[4px] flex items-center justify-center p-4 z-50 animate-fade-in"
        >
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6 relative space-y-4 shadow-2xl animate-scale-in text-left">
            <button 
              onClick={() => setIsModuleFormOpen(false)} 
              className="absolute top-4 right-4 p-1.5 hover:bg-stone-805 rounded-lg text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-display font-extrabold text-white border-b border-stone-800 pb-2.5 uppercase tracking-wider">
              {moduleFormMode === 'create' ? 'Create' : 'Edit'} Syllabus Module
            </h3>
            <form onSubmit={handleModuleFormSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Module Title</label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-850 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Sort Order Sequence</label>
                <input
                  type="number"
                  required
                  value={moduleSortOrder}
                  onChange={(e) => setModuleSortOrder(Number(e.target.value))}
                  className="w-full bg-stone-955 border border-stone-850 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 font-mono"
                />
              </div>
              <div className="flex justify-end gap-3 border-t border-stone-850 pt-4 mt-2">
                <button type="button" onClick={() => setIsModuleFormOpen(false)} className="px-4 py-2 border border-stone-850 rounded-lg text-stone-450 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="btn-primary px-5 py-2 rounded-lg font-bold text-stone-950 shadow-md">Save Module</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LESSON DIALOG */}
      {isLessonFormOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLessonFormOpen(false);
          }}
          className="fixed inset-0 bg-black/75 backdrop-blur-[4px] flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in"
        >
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6 relative space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in text-left">
            <button 
              onClick={() => setIsLessonFormOpen(false)} 
              className="absolute top-4 right-4 p-1.5 hover:bg-stone-805 rounded-lg text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-display font-extrabold text-white border-b border-stone-850 pb-2.5 uppercase tracking-wider">
              {lessonFormMode === 'create' ? 'Create' : 'Edit'} Lesson Details
            </h3>
            <form onSubmit={handleLessonFormSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Lesson Title</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full bg-stone-955 border border-stone-850 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Duration (e.g. 10m 15s)</label>
                  <input
                    type="text"
                    required
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    className="w-full bg-stone-955 border border-stone-850 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Sort Sequence</label>
                  <input
                    type="number"
                    required
                    value={lessonSortOrder}
                    onChange={(e) => setLessonSortOrder(Number(e.target.value))}
                    className="w-full bg-stone-955 border border-stone-850 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Video Provider Type</label>
                <select
                  value={lessonVideoType}
                  onChange={(e) => setLessonVideoType(e.target.value as any)}
                  className="w-full bg-stone-955 border border-stone-855 text-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%23a8a29e%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[size:16px_16px] bg-no-repeat pr-10"
                >
                  <option value="youtube">YouTube Unlisted URL / Video ID</option>
                  <option value="hls">Secure HLS Stream</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">
                  {lessonVideoType === 'youtube' ? 'YouTube Video ID (11 chars)' : 'HLS Video Stream URL'}
                </label>
                <input
                  type="text"
                  required
                  value={lessonYoutubeId}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (lessonVideoType === 'youtube') {
                      setLessonYoutubeId(extractYoutubeId(val));
                    } else {
                      setLessonYoutubeId(val);
                    }
                  }}
                  placeholder={lessonVideoType === 'youtube' ? 'e.g. dQw4w9WgXcQ' : 'e.g. https://domain.com/video.m3u8'}
                  className="w-full bg-stone-955 border border-stone-850 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="lessonPreview"
                  checked={lessonIsPreview}
                  onChange={(e) => setLessonIsPreview(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded bg-stone-955 border-stone-850 cursor-pointer"
                />
                <label htmlFor="lessonPreview" className="text-stone-300 font-semibold cursor-pointer select-none">
                  Allow Free Preview before checkout
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-stone-850 pt-4 mt-2">
                <button type="button" onClick={() => setIsLessonFormOpen(false)} className="px-4 py-2 border border-stone-855 rounded-lg text-stone-450 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="btn-primary px-5 py-2 rounded-lg font-bold text-stone-955 shadow-md">Save Lesson</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
