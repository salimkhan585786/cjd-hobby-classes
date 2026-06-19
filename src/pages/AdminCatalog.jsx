import { useEffect, useMemo, useState } from 'react';
import { Palette, Share2 } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import MediaPreview from '../components/MediaPreview';
import { useToast } from '../hooks/useToast';
import { useCourses, useGallery, useGalleryCollage, useWorkshops } from '../hooks/useData';
import {
  addCourse,
  addGalleryCollageItem,
  addGalleryItem,
  addWorkshop,
  deleteCourse,
  deleteGalleryCollageItem,
  deleteGalleryItem,
  deleteWorkshop,
  updateCourse,
  updateGalleryItem,
  updateWorkshop,
  uploadCourseMedia,
  uploadGalleryCollageImage,
  uploadGalleryImage,
  uploadWorkshopMedia,
} from '../services/dataService';
import { classNames, formatCurrency, formatDate } from '../utils/helpers';

const createLocalId = (prefix) => `local-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const isLocalId = (value) => String(value || '').startsWith('local-');
const GALLERY_MENTOR = 'HEMALI METHA';
const GALLERY_MEDIUM_OPTIONS = ['Pencil Sketch', 'Color Pencil', 'Acrylic', 'Watercolor', 'Oil Pastel', 'Digital Art', 'Mixed Media', 'Charcoal'];
const OTHER_CATEGORY = 'Other';
const getUploadErrorMessage = (error) => {
  const message = String(error?.message || '').toLowerCase();

  if (
    message.includes('cloudinary') ||
    message.includes('upload preset') ||
    message.includes('credentials') ||
    message.includes('secure url') ||
    message.includes('cors')
  ) {
    return 'Image upload failed. Check the Cloudinary cloud name, upload preset, or API credentials in the environment config.';
  }

  return 'Image upload failed. Please try again.';
};

function AdminCatalog() {
  const { courses, loading: coursesLoading, setCourses } = useCourses();
  const { workshops, loading: workshopsLoading, setWorkshops } = useWorkshops();
  const { gallery, loading: galleryLoading, setGallery } = useGallery();
  const { galleryCollage, loading: collageLoading, setGalleryCollage } = useGalleryCollage();
  const { showToast } = useToast();

  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    duration: '',
    price: '',
    priceLabel: '',
    level: 'Beginner',
    format: 'Offline',
    image: '',
    description: '',
  });
  const [editingWorkshopId, setEditingWorkshopId] = useState(null);
  const [workshopDateError, setWorkshopDateError] = useState('');
  const [workshopForm, setWorkshopForm] = useState({
    title: '',
    date: '',
    seats: '',
    price: '',
    mode: 'Offline',
    image: '',
    description: '',
  });
  const [editingGalleryId, setEditingGalleryId] = useState(null);
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    artist: '',
    category: '',
    customCategory: '',
    medium: GALLERY_MEDIUM_OPTIONS[0],
    mentor: GALLERY_MENTOR,
    image: '',
    details: '',
  });
  const [courseFile, setCourseFile] = useState(null);
  const [workshopFile, setWorkshopFile] = useState(null);
  const [galleryFile, setGalleryFile] = useState(null);
  const [collageFile, setCollageFile] = useState(null);
  const [collageUrl, setCollageUrl] = useState('');
  const coursePreviewUrl = useMemo(() => (courseFile ? URL.createObjectURL(courseFile) : ''), [courseFile]);
  const workshopPreviewUrl = useMemo(() => (workshopFile ? URL.createObjectURL(workshopFile) : ''), [workshopFile]);
  const galleryPreviewUrl = useMemo(() => (galleryFile ? URL.createObjectURL(galleryFile) : ''), [galleryFile]);
  const galleryCategoryOptions = useMemo(
    () => [...new Set(courses.map((course) => course.title).filter(Boolean))].concat(OTHER_CATEGORY),
    [courses]
  );
  const normalizedGalleryCategory = galleryForm.category === OTHER_CATEGORY
    ? galleryForm.customCategory.trim()
    : galleryForm.category;

  useEffect(() => {
    return () => {
      if (coursePreviewUrl) {
        URL.revokeObjectURL(coursePreviewUrl);
      }
    };
  }, [coursePreviewUrl]);

  useEffect(() => {
    return () => {
      if (workshopPreviewUrl) {
        URL.revokeObjectURL(workshopPreviewUrl);
      }
    };
  }, [workshopPreviewUrl]);

  useEffect(() => {
    return () => {
      if (galleryPreviewUrl) {
        URL.revokeObjectURL(galleryPreviewUrl);
      }
    };
  }, [galleryPreviewUrl]);

  useEffect(() => {
    if (!galleryForm.category && galleryCategoryOptions.length > 0) {
      setGalleryForm((current) => ({
        ...current,
        category: galleryCategoryOptions[0],
      }));
    }
  }, [galleryCategoryOptions, galleryForm.category]);

  const resetCourseForm = () => {
    setEditingCourseId(null);
    setCourseForm({
      title: '',
      duration: '',
      price: '',
      priceLabel: '',
      level: 'Beginner',
      format: 'Offline',
      image: '',
      description: '',
    });
    setCourseFile(null);
  };

  const resetWorkshopForm = () => {
    setEditingWorkshopId(null);
    setWorkshopDateError('');
    setWorkshopForm({
      title: '',
      date: '',
      seats: '',
      price: '',
      mode: 'Offline',
      image: '',
      description: '',
    });
    setWorkshopFile(null);
  };

  const resetGalleryForm = () => {
    setEditingGalleryId(null);
    setGalleryForm({
      title: '',
      artist: '',
      category: galleryCategoryOptions[0] || '',
      customCategory: '',
      medium: GALLERY_MEDIUM_OPTIONS[0],
      mentor: GALLERY_MENTOR,
      image: '',
      details: '',
    });
    setGalleryFile(null);
  };

  const handleSaveCourse = async (event) => {
    event.preventDefault();
    try {
      let mediaUrl = courseForm.image;

      if (courseFile) {
        const extension = courseFile.name?.split('.').pop() || 'jpg';
        const path = `courses/${Date.now()}_${courseForm.title || 'course'}.${extension}`;
        mediaUrl = await uploadCourseMedia(courseFile, path);
      }

      const payload = { ...courseForm, image: mediaUrl, price: Number(courseForm.price || 0) };
      payload.format = 'Offline';

      if (editingCourseId) {
        setCourses((current) =>
          current.map((item) => (item.id === editingCourseId ? { ...item, ...payload } : item))
        );
        if (!isLocalId(editingCourseId)) {
          try {
            await updateCourse(editingCourseId, payload);
          } catch (error) {
            console.error(error);
          }
        }
        showToast({ type: 'success', title: 'Course updated', message: `${payload.title} has been updated.` });
        resetCourseForm();
        return;
      }

      const id = await addCourse(payload);
      setCourses((current) => [{ id, ...payload }, ...current]);
      showToast({ type: 'success', title: 'Course added', message: `${payload.title} is now in the catalog.` });
      resetCourseForm();
    } catch (error) {
      console.error(error);
      showToast({ type: 'error', title: 'Course upload failed', message: getUploadErrorMessage(error) });
    }
  };

  const handleSaveWorkshop = async (event) => {
    event.preventDefault();
    setWorkshopDateError('');

    try {
      let mediaUrl = workshopForm.image;

      if (workshopFile) {
        const extension = workshopFile.name?.split('.').pop() || 'jpg';
        const path = `workshops/${Date.now()}_${workshopForm.title || 'workshop'}.${extension}`;
        mediaUrl = await uploadWorkshopMedia(workshopFile, path);
      }

      const payload = {
        ...workshopForm,
        image: mediaUrl,
        seats: Number(workshopForm.seats || 0),
        price: Number(workshopForm.price || 0),
      };
      payload.mode = 'Offline';

      if (editingWorkshopId) {
        setWorkshops((current) =>
          current.map((item) => (item.id === editingWorkshopId ? { ...item, ...payload } : item))
        );
        if (!isLocalId(editingWorkshopId)) {
          try {
            await updateWorkshop(editingWorkshopId, payload);
          } catch (error) {
            console.error(error);
          }
        }
        showToast({ type: 'success', title: 'Event updated', message: `${payload.title} has been updated.` });
        resetWorkshopForm();
        return;
      }

      const id = await addWorkshop(payload);
      setWorkshops((current) => [{ id, ...payload }, ...current]);
      resetWorkshopForm();
      showToast({ type: 'success', title: 'Event added', message: `${payload.title} is now available for registration.` });
    } catch (error) {
      console.error(error);
      showToast({ type: 'error', title: 'Event upload failed', message: getUploadErrorMessage(error) });
    }
  };

  const handleAddGallery = async (event) => {
    event.preventDefault();
    try {
      const finalCategory = normalizedGalleryCategory;

      let mediaUrl = galleryForm.image;

      if (galleryFile) {
        const extension = galleryFile.name?.split('.').pop() || 'jpg';
        const path = `gallery/${Date.now()}_${galleryForm.title || 'artwork'}.${extension}`;
        mediaUrl = await uploadGalleryImage(galleryFile, path);
      }

      const payload = {
        ...galleryForm,
        category: finalCategory,
        customCategory: galleryForm.category === OTHER_CATEGORY ? finalCategory : '',
        mentor: GALLERY_MENTOR,
        image: mediaUrl,
      };

      if (editingGalleryId) {
        setGallery((current) => current.map((item) => (item.id === editingGalleryId ? { ...item, ...payload } : item)));
        if (!isLocalId(editingGalleryId)) {
          await updateGalleryItem(editingGalleryId, payload);
        }
        resetGalleryForm();
        showToast({ type: 'success', title: 'Artwork updated', message: 'The gallery item has been updated.' });
        return;
      }

      const id = await addGalleryItem(payload);
      setGallery((current) => [{ id, ...payload }, ...current]);
      resetGalleryForm();
      showToast({ type: 'success', title: 'Artwork added', message: 'The gallery showcase has been updated.' });
    } catch (error) {
      console.error(error);
      showToast({ type: 'error', title: 'Gallery upload failed', message: getUploadErrorMessage(error) });
    }
  };

  const handleEditGallery = (item) => {
    const matchesCourse = galleryCategoryOptions.includes(item.category);
    setEditingGalleryId(item.id);
    setGalleryForm({
      title: item.title || '',
      artist: item.artist || '',
      category: matchesCourse ? item.category : OTHER_CATEGORY,
      customCategory: matchesCourse ? '' : item.category || item.customCategory || '',
      medium: item.medium || GALLERY_MEDIUM_OPTIONS[0],
      mentor: GALLERY_MENTOR,
      image: item.image || '',
      details: item.details || '',
    });
    setGalleryFile(null);
  };

  const handleDeleteGallery = async (galleryId) => {
    setGallery((current) => current.filter((item) => item.id !== galleryId));
    if (!isLocalId(galleryId)) {
      try {
        await deleteGalleryItem(galleryId);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleUploadCollage = async (event) => {
    event.preventDefault();
    if (!collageFile && !collageUrl.trim()) {
      showToast({ type: 'error', title: 'No media provided', message: 'Upload a file or paste a media URL.' });
      return;
    }
    try {
      let mediaUrl = collageUrl.trim();

      if (collageFile) {
        const extension = collageFile.name?.split('.').pop() || 'jpg';
        const path = `galleryCollage/${Date.now()}_collage.${extension}`;
        mediaUrl = await uploadGalleryCollageImage(collageFile, path);
      }

      if (!mediaUrl) {
        showToast({ type: 'error', title: 'No URL', message: 'A valid image URL is required.' });
        return;
      }

      const payload = { src: mediaUrl, alt: collageFile?.name?.replace(/\.[^/.]+$/, '') || 'Collage image', createdAt: Date.now() };
      const id = await addGalleryCollageItem(payload);
      setGalleryCollage((current) => [{ id, ...payload }, ...current]);
      setCollageFile(null);
      setCollageUrl('');
      showToast({ type: 'success', title: 'Image uploaded', message: 'Collage image has been added.' });
    } catch (error) {
      console.error('Collage upload error:', error);
      const message = String(error?.message || error?.code || '').toLowerCase();
      if (message.includes('permission') || message.includes('denied') || message.includes('unauthenticated') || message.includes('missing or insufficient permissions')) {
        showToast({ type: 'error', title: 'Firestore permission denied', message: 'Check that your admin email matches the Firestore rules and that the rules are deployed.' });
      } else {
        showToast({ type: 'error', title: 'Upload failed', message: error?.message || 'Something went wrong. Check the console for details.' });
      }
    }
  };

  const handleDeleteCollage = async (itemId) => {
    setGalleryCollage((current) => current.filter((item) => item.id !== itemId));
    if (!isLocalId(itemId)) {
      try {
        await deleteGalleryCollageItem(itemId);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeleteCourse = async (courseId) => {
    setCourses((current) => current.filter((item) => item.id !== courseId));
    if (!isLocalId(courseId)) {
      try {
        await deleteCourse(courseId);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleShareWorkshop = async (workshop) => {
    const url = `${window.location.origin}/events/${workshop.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: workshop.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast({ type: 'success', title: 'Link copied', message: 'Event link has been copied to clipboard.' });
      }
    } catch {
      // user cancelled
    }
  };

  const handleDeleteWorkshop = async (workshopId) => {
    setWorkshops((current) => current.filter((item) => item.id !== workshopId));
    if (!isLocalId(workshopId)) {
      try {
        await deleteWorkshop(workshopId);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleEditWorkshop = (workshop) => {
    setEditingWorkshopId(workshop.id);
    setWorkshopForm({
      title: workshop.title || '',
      date: workshop.date || '',
      seats: String(workshop.seats || ''),
      price: String(workshop.price || ''),
      mode: 'Offline',
      image: workshop.image || '',
      description: workshop.description || '',
    });
    setWorkshopFile(null);
  };

  const handleEditCourse = (course) => {
    setEditingCourseId(course.id);
    setCourseForm({
      title: course.title || '',
      duration: course.duration || '',
      price: String(course.price || ''),
      priceLabel: course.priceLabel || '',
      level: course.level || 'Beginner',
      format: 'Offline',
      image: course.image || '',
      description: course.description || '',
    });
    setCourseFile(null);
  };

  if (coursesLoading || workshopsLoading || galleryLoading) {
    return <LoadingSkeleton className="h-[480px]" />;
  }

  return (
    <div className="space-y-10">
      <section className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Catalog</p>
        <h2 className="mt-4 text-4xl font-semibold text-white">Courses, events, and gallery in one place.</h2>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Course manager</p>
          <form onSubmit={handleSaveCourse} className="mt-6 grid gap-4">
            <div>
              <label htmlFor="course-title" className="block text-sm text-slate-300">Course title</label>
              <input id="course-title" value={courseForm.title} onChange={(event) => setCourseForm((current) => ({ ...current, title: event.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
            </div>
            <div>
              <label htmlFor="course-description" className="block text-sm text-slate-300">Description</label>
              <textarea id="course-description" value={courseForm.description} onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))} rows="3" className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="course-duration" className="block text-sm text-slate-300">Duration</label>
                <input id="course-duration" value={courseForm.duration} onChange={(event) => setCourseForm((current) => ({ ...current, duration: event.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
              </div>
              <div>
                <label htmlFor="course-price" className="block text-sm text-slate-300">Price</label>
                <input id="course-price" type="number" min="0" value={courseForm.price} onChange={(event) => setCourseForm((current) => ({ ...current, price: event.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
              </div>
              <div>
                <label htmlFor="course-price-label" className="block text-sm text-slate-300">Custom price label <span className="text-slate-500">(optional)</span></label>
                <input id="course-price-label" value={courseForm.priceLabel} onChange={(event) => setCourseForm((current) => ({ ...current, priceLabel: event.target.value }))} placeholder="e.g. Depends on canvas size" className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="course-level" className="block text-sm text-slate-300">Level</label>
                <select id="course-level" value={courseForm.level} onChange={(event) => setCourseForm((current) => ({ ...current, level: event.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100">
                  {['Beginner', 'Intermediate', 'Advanced', 'All levels', 'Kids'].map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="course-format" className="block text-sm text-slate-300">Format</label>
                <input id="course-format" value="Offline" readOnly className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-400" />
              </div>
            </div>
            <div>
              <label htmlFor="course-image-url" className="block text-sm text-slate-300">Media URL <span className="text-slate-500">(image or video URL)</span></label>
              <input id="course-image-url" value={courseForm.image} onChange={(event) => setCourseForm((current) => ({ ...current, image: event.target.value }))} placeholder="https://..." className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
            </div>
            <div>
              <label htmlFor="course-file" className="block text-sm text-slate-300">Upload media file</label>
              <input id="course-file" type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif" onChange={(event) => setCourseFile(event.target.files?.[0] || null)} className="mt-2 w-full rounded-3xl border border-dashed border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
            </div>
            <p className="text-sm text-slate-400">Upload `png`, `jpg`, `jpeg`, `webp`, or `gif`, or paste an image or video URL.</p>
            <MediaPreview
              src={coursePreviewUrl || courseForm.image}
              alt={courseForm.title || 'Course preview'}
              title={courseForm.title || 'Course preview'}
              className="h-56 rounded-[1.5rem]"
            />
            <div className="flex gap-3">
              <button type="submit" className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">{editingCourseId ? 'Update course' : 'Add course'}</button>
              {editingCourseId ? <button type="button" onClick={resetCourseForm} className="rounded-full border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/5">Cancel edit</button> : null}
            </div>
          </form>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Current catalog</p>
          <div className="mt-6 space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="rounded-3xl bg-slate-900/80 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-white">{course.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{course.level} • {course.priceLabel || formatCurrency(course.price)}</p>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => handleEditCourse(course)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5">Edit</button>
                    <button type="button" onClick={() => handleDeleteCourse(course.id)} className="rounded-full bg-rose-500/20 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/30">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Event manager</p>
          <form onSubmit={handleSaveWorkshop} className="mt-6 grid gap-4">
            <div>
              <label htmlFor="workshop-title" className="block text-sm text-slate-300">Event title</label>
              <input id="workshop-title" value={workshopForm.title} onChange={(event) => setWorkshopForm((current) => ({ ...current, title: event.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
            </div>
            <div>
              <label htmlFor="workshop-description" className="block text-sm text-slate-300">Description</label>
              <textarea id="workshop-description" value={workshopForm.description} onChange={(event) => setWorkshopForm((current) => ({ ...current, description: event.target.value }))} rows="3" className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="workshop-date" className="block text-sm text-slate-300">Date and time</label>
                <input id="workshop-date" type="datetime-local" value={workshopForm.date} onChange={(event) => { setWorkshopDateError(''); setWorkshopForm((current) => ({ ...current, date: event.target.value })); }} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
                {workshopDateError && <p className="mt-1 text-sm text-rose-400">{workshopDateError}</p>}
              </div>
              <div>
                <label htmlFor="workshop-mode" className="block text-sm text-slate-300">Mode</label>
                <input id="workshop-mode" value="Offline" readOnly className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-400" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="workshop-seats" className="block text-sm text-slate-300">Total seats</label>
                <input id="workshop-seats" type="number" min="1" value={workshopForm.seats} onChange={(event) => setWorkshopForm((current) => ({ ...current, seats: event.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
              </div>
              <div>
                <label htmlFor="workshop-price" className="block text-sm text-slate-300">Price</label>
                <input id="workshop-price" type="number" min="0" value={workshopForm.price} onChange={(event) => setWorkshopForm((current) => ({ ...current, price: event.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
              </div>
            </div>
            <div>
              <label htmlFor="workshop-image-url" className="block text-sm text-slate-300">Media URL <span className="text-slate-500">(image or video URL)</span></label>
              <input id="workshop-image-url" value={workshopForm.image} onChange={(event) => setWorkshopForm((current) => ({ ...current, image: event.target.value }))} placeholder="https://..." className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
            </div>
            <div>
              <label htmlFor="workshop-file" className="block text-sm text-slate-300">Upload media file</label>
              <input id="workshop-file" type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif" onChange={(event) => setWorkshopFile(event.target.files?.[0] || null)} className="mt-2 w-full rounded-3xl border border-dashed border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
            </div>
            <p className="text-sm text-slate-400">Upload `png`, `jpg`, `jpeg`, `webp`, or `gif`, or paste an image or video URL.</p>
            <MediaPreview
              src={workshopPreviewUrl || workshopForm.image}
              alt={workshopForm.title || 'Event preview'}
              title={workshopForm.title || 'Event preview'}
              className="h-56 rounded-[1.5rem]"
            />
            <div className="flex gap-3">
              <button type="submit" className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">{editingWorkshopId ? 'Update event' : 'Add event'}</button>
              {editingWorkshopId ? <button type="button" onClick={resetWorkshopForm} className="rounded-full border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/5">Cancel edit</button> : null}
            </div>
          </form>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Event lineup</p>
          <div className="mt-6 space-y-4">
            {workshops.map((workshop) => (
              <div key={workshop.id} className="rounded-3xl bg-slate-900/80 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-white">{workshop.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{formatDate(workshop.date)} • {workshop.seats} seats</p>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => handleShareWorkshop(workshop)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5" title="Share event link">
                      <Share2 size={14} />
                    </button>
                    <button type="button" onClick={() => handleEditWorkshop(workshop)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5">Edit</button>
                    <button type="button" onClick={() => handleDeleteWorkshop(workshop.id)} className="rounded-full bg-rose-500/20 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/30">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <div className="flex items-center gap-3 text-violet-300">
            <Palette size={20} />
            <p className="text-sm uppercase tracking-[0.24em]">Gallery uploader</p>
          </div>
          <form onSubmit={handleAddGallery} className="mt-6 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="gallery-title" className="block text-sm text-slate-300">Artwork title</label>
                <input id="gallery-title" value={galleryForm.title} onChange={(event) => setGalleryForm((current) => ({ ...current, title: event.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
              </div>
              <div>
                <label htmlFor="gallery-artist" className="block text-sm text-slate-300">Student name</label>
                <input id="gallery-artist" value={galleryForm.artist} onChange={(event) => setGalleryForm((current) => ({ ...current, artist: event.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="gallery-medium" className="block text-sm text-slate-300">Medium</label>
                <select
                  id="gallery-medium"
                  value={galleryForm.medium}
                  onChange={(event) => setGalleryForm((current) => ({ ...current, medium: event.target.value }))}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
                >
                  {GALLERY_MEDIUM_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="gallery-mentor" className="block text-sm text-slate-300">Mentor</label>
                <input id="gallery-mentor" value={GALLERY_MENTOR} readOnly className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-400" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="gallery-category" className="block text-sm text-slate-300">Category</label>
                <select
                  id="gallery-category"
                  value={galleryForm.category}
                  onChange={(event) => setGalleryForm((current) => ({ ...current, category: event.target.value, customCategory: event.target.value === OTHER_CATEGORY ? current.customCategory : '' }))}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
                >
                  {galleryCategoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="gallery-image-url" className="block text-sm text-slate-300">Media URL <span className="text-slate-500">(image or video URL)</span></label>
                <input id="gallery-image-url" value={galleryForm.image} onChange={(event) => setGalleryForm((current) => ({ ...current, image: event.target.value }))} placeholder="https://..." className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
              </div>
            </div>
            {galleryForm.category === OTHER_CATEGORY ? (
              <div>
                <label htmlFor="gallery-custom-category" className="block text-sm text-slate-300">Custom category name</label>
                <input
                  id="gallery-custom-category"
                  value={galleryForm.customCategory}
                  onChange={(event) => setGalleryForm((current) => ({ ...current, customCategory: event.target.value }))}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
                />
              </div>
            ) : null}
            <div>
              <label htmlFor="gallery-file" className="block text-sm text-slate-300">Upload media file</label>
              <input id="gallery-file" type="file" accept="image/*,video/*" onChange={(event) => setGalleryFile(event.target.files?.[0] || null)} className="mt-2 w-full rounded-3xl border border-dashed border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
            </div>
            <div>
              <label htmlFor="gallery-details" className="block text-sm text-slate-300">Artwork notes</label>
              <textarea id="gallery-details" value={galleryForm.details} onChange={(event) => setGalleryForm((current) => ({ ...current, details: event.target.value }))} rows="3" className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
            </div>
            <MediaPreview
              src={galleryPreviewUrl || galleryForm.image}
              alt={galleryForm.title || 'Gallery preview'}
              title={galleryForm.title || 'Gallery preview'}
              className="h-56 rounded-[1.5rem]"
            />
            <div className="flex gap-3">
              <button type="submit" className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
                {editingGalleryId ? 'Update artwork entry' : 'Upload artwork entry'}
              </button>
              {editingGalleryId ? (
                <button
                  type="button"
                  onClick={resetGalleryForm}
                  className="rounded-full border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/5"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Latest gallery items</p>
          <div className="mt-6 space-y-4">
            {gallery.slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-3xl bg-slate-900/80 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="text-sm text-slate-400">{item.artist || item.mentor || 'Unknown artist'}</p>
                    <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                      <span className="rounded-full border border-white/10 px-3 py-1">{item.category || 'Gallery item'}</span>
                      <span className="rounded-full border border-white/10 px-3 py-1">{item.medium || GALLERY_MEDIUM_OPTIONS[0]}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleEditGallery(item)}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteGallery(item.id)}
                      className="rounded-full bg-rose-500/20 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Collage image uploader</p>
          <p className="mt-2 text-sm text-slate-400">Upload images for the exhibition-ready collage on the home page.</p>
          <form onSubmit={handleUploadCollage} className="mt-6 grid gap-4">
            <div>
              <label htmlFor="collage-url" className="block text-sm text-slate-300">Media URL <span className="text-slate-500">(image or video URL)</span></label>
              <input
                id="collage-url"
                value={collageUrl}
                onChange={(event) => setCollageUrl(event.target.value)}
                placeholder="https://..."
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="collage-file" className="block text-sm text-slate-300">Upload media file</label>
              <input
                id="collage-file"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={(event) => setCollageFile(event.target.files?.[0] || null)}
                className="mt-2 w-full rounded-3xl border border-dashed border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
            </div>
            <p className="text-sm text-slate-400">Paste an image URL or upload a file (png, jpg, jpeg, webp, gif).</p>
            {(collageFile || collageUrl.trim()) && (
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
                <img
                  src={collageFile ? URL.createObjectURL(collageFile) : collageUrl.trim()}
                  alt="Preview"
                  className="h-48 w-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
            <button type="submit" disabled={!collageFile && !collageUrl.trim()} className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed">
              Upload to collage
            </button>
          </form>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Collage images ({galleryCollage.length})</p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {galleryCollage.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-white/10">
                <img src={item.src} alt={item.alt} className="h-32 w-full object-cover sm:h-40" />
                <button
                  type="button"
                  onClick={() => handleDeleteCollage(item.id)}
                  className="absolute top-2 right-2 rounded-full bg-rose-500/80 p-1.5 text-white opacity-0 transition group-hover:opacity-100 hover:bg-rose-500"
                  title="Delete image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            ))}
            {galleryCollage.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-slate-500">No collage images uploaded yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminCatalog;
