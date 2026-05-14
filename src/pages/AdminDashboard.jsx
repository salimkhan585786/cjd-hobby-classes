import { useMemo, useState } from 'react';
import { BarChart3, ClipboardList, DollarSign, Megaphone, Palette, Users2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StatusPill from '../components/StatusPill';
import {
  useAnnouncements,
  useCourses,
  useFees,
  useGallery,
  useInquiries,
  useOrders,
  useStudents,
  useWorkshops,
} from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import {
  addAnnouncement,
  addCourse,
  addGalleryItem,
  addWorkshop,
  deleteCourse,
  deleteWorkshop,
  initializeFirestoreData,
  updateCourse,
  updateInquiry,
} from '../services/dataService';
import { formatCurrency, formatDate } from '../utils/helpers';

const createLocalId = (prefix) => `local-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const isLocalId = (value) => String(value || '').startsWith('local-');

function AdminDashboard() {
  const { courses, loading: coursesLoading, setCourses } = useCourses();
  const { workshops, loading: workshopsLoading, setWorkshops } = useWorkshops();
  const { students, loading: studentsLoading } = useStudents();
  const { gallery, loading: galleryLoading, setGallery } = useGallery();
  const { inquiries, loading: inquiriesLoading, setInquiries } = useInquiries();
  const { orders, loading: ordersLoading } = useOrders();
  const { fees, loading: feesLoading } = useFees();
  const { announcements, loading: announcementsLoading, setAnnouncements } = useAnnouncements();
  const { showToast } = useToast();

  const [seedStatus, setSeedStatus] = useState('');
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    duration: '',
    price: '',
    level: 'Beginner',
    format: 'Online live',
    image: '',
    description: '',
  });
  const [workshopForm, setWorkshopForm] = useState({
    title: '',
    date: '',
    seats: '',
    price: '',
    mode: 'Online live',
    description: '',
  });
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    artist: '',
    category: 'Sketch',
    medium: '',
    mentor: '',
    image: '',
    details: '',
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    audience: 'Students',
  });

  const totalRevenue = useMemo(
    () => fees.reduce((sum, item) => sum + Number(item.paid || 0), 0),
    [fees]
  );
  const totalOutstanding = useMemo(
    () => fees.reduce((sum, item) => sum + Math.max(Number(item.amount || 0) - Number(item.paid || 0), 0), 0),
    [fees]
  );
  const orderStats = useMemo(
    () => ({
      active: orders.filter((item) => item.status !== 'completed').length,
      inquiries: inquiries.filter((item) => item.status === 'new').length,
    }),
    [orders, inquiries]
  );

  const resetCourseForm = () => {
    setEditingCourseId(null);
    setCourseForm({
      title: '',
      duration: '',
      price: '',
      level: 'Beginner',
      format: 'Online live',
      image: '',
      description: '',
    });
  };

  const handleSeedData = async () => {
    setSeedStatus('Seeding sample data...');

    try {
      const result = await initializeFirestoreData();
      const seededCount = result.filter((item) => item.seeded).length;
      setSeedStatus(
        seededCount > 0
          ? `Seeded ${seededCount} empty collections successfully.`
          : 'Collections already contained data, so nothing new was seeded.'
      );
      showToast({
        type: 'success',
        title: 'Seed process finished',
        message: seededCount > 0 ? 'Sample records were added successfully.' : 'Existing collections were left untouched.',
      });
    } catch (error) {
      console.error(error);
      setSeedStatus('Unable to seed data. Check Firebase rules and connectivity.');
      showToast({
        type: 'error',
        title: 'Seed failed',
        message: 'Sample data could not be written to Firestore.',
      });
    }
  };

  const handleSaveCourse = async (event) => {
    event.preventDefault();
    const payload = {
      ...courseForm,
      price: Number(courseForm.price || 0),
    };

    if (editingCourseId) {
      setCourses((current) => current.map((item) => (item.id === editingCourseId ? { ...item, ...payload } : item)));
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

    try {
      const id = await addCourse(payload);
      setCourses((current) => [{ id, ...payload }, ...current]);
    } catch (error) {
      console.error(error);
      setCourses((current) => [{ id: createLocalId('course'), ...payload }, ...current]);
    }

    showToast({ type: 'success', title: 'Course added', message: `${payload.title} is now in the catalog.` });
    resetCourseForm();
  };

  const handleEditCourse = (course) => {
    setEditingCourseId(course.id);
    setCourseForm({
      title: course.title || '',
      duration: course.duration || '',
      price: String(course.price || ''),
      level: course.level || 'Beginner',
      format: course.format || 'Online live',
      image: course.image || '',
      description: course.description || '',
    });
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
    showToast({ type: 'success', title: 'Course removed', message: 'The course was removed from the dashboard list.' });
  };

  const handleAddWorkshop = async (event) => {
    event.preventDefault();
    const payload = {
      ...workshopForm,
      date: workshopForm.date,
      seats: Number(workshopForm.seats || 0),
      price: Number(workshopForm.price || 0),
    };

    try {
      const id = await addWorkshop(payload);
      setWorkshops((current) => [{ id, ...payload }, ...current]);
    } catch (error) {
      console.error(error);
      setWorkshops((current) => [{ id: createLocalId('workshop'), ...payload }, ...current]);
    }

    setWorkshopForm({
      title: '',
      date: '',
      seats: '',
      price: '',
      mode: 'Online live',
      description: '',
    });
    showToast({ type: 'success', title: 'Workshop added', message: `${payload.title} is now live.` });
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
    showToast({ type: 'success', title: 'Workshop removed', message: 'The workshop has been removed from the list.' });
  };

  const handleAddGallery = async (event) => {
    event.preventDefault();
    const payload = { ...galleryForm };

    try {
      const id = await addGalleryItem(payload);
      setGallery((current) => [{ id, ...payload }, ...current]);
    } catch (error) {
      console.error(error);
      setGallery((current) => [{ id: createLocalId('gallery'), ...payload }, ...current]);
    }

    setGalleryForm({
      title: '',
      artist: '',
      category: 'Sketch',
      medium: '',
      mentor: '',
      image: '',
      details: '',
    });
    showToast({ type: 'success', title: 'Artwork added', message: 'The gallery showcase has been updated.' });
  };

  const handleInquiryStatus = async (inquiryId, status) => {
    setInquiries((current) => current.map((item) => (item.id === inquiryId ? { ...item, status } : item)));
    if (!isLocalId(inquiryId)) {
      try {
        await updateInquiry(inquiryId, { status });
      } catch (error) {
        console.error(error);
      }
    }
    showToast({ type: 'success', title: 'Inquiry updated', message: `Marked as ${status}.` });
  };

  const handleAnnouncement = async (event) => {
    event.preventDefault();
    const payload = {
      ...announcementForm,
      createdAt: new Date().toISOString(),
    };

    try {
      const id = await addAnnouncement(payload);
      setAnnouncements((current) => [{ id, ...payload }, ...current]);
    } catch (error) {
      console.error(error);
      setAnnouncements((current) => [{ id: createLocalId('announcement'), ...payload }, ...current]);
    }

    setAnnouncementForm({
      title: '',
      message: '',
      audience: 'Students',
    });
    showToast({ type: 'success', title: 'Announcement sent', message: 'The dashboard announcement has been saved.' });
  };

  if (
    coursesLoading ||
    workshopsLoading ||
    studentsLoading ||
    inquiriesLoading ||
    ordersLoading ||
    feesLoading ||
    galleryLoading ||
    announcementsLoading
  ) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-32" />
        <div className="grid gap-6 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-40" />
          ))}
        </div>
        <LoadingSkeleton className="h-[480px]" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Active students', value: students.length, icon: Users2 },
          { title: 'New inquiries', value: orderStats.inquiries, icon: ClipboardList },
          { title: 'Revenue collected', value: formatCurrency(totalRevenue), icon: DollarSign },
          { title: 'Open orders', value: orderStats.active, icon: BarChart3 },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="glass-card rounded-[2rem] border border-white/10 p-6 shadow-soft">
              <div className="flex items-center gap-3 text-violet-300">
                <Icon size={22} />
              </div>
              <p className="mt-5 text-3xl font-semibold text-white">{card.value}</p>
              <p className="mt-2 text-slate-400">{card.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Analytics</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Revenue, fees, and student momentum</h2>
            </div>
            <span className="rounded-full bg-violet-500/15 px-4 py-3 text-sm text-violet-200">Stable growth</span>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { label: 'Fees collected', value: totalRevenue, tone: 'from-violet-500/20 to-violet-500/5' },
              { label: 'Outstanding dues', value: totalOutstanding, tone: 'from-amber-500/20 to-amber-500/5' },
              { label: 'Gallery pieces', value: gallery.length, tone: 'from-sky-500/20 to-sky-500/5', asCurrency: false },
            ].map((card) => (
              <div key={card.label} className={`rounded-[2rem] bg-gradient-to-br ${card.tone} p-6`}>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-300">{card.label}</p>
                <p className="mt-4 text-3xl font-semibold text-white">
                  {card.asCurrency === false ? `${card.value}` : formatCurrency(card.value)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Recent activity</p>
            <div className="mt-8 space-y-4 text-slate-300">
              {[
                `${students.length} student records available`,
                `${orders.filter((item) => item.status === 'pending').length} orders waiting for action`,
                `${announcements.length} active announcements in circulation`,
              ].map((note) => (
                <div key={note} className="rounded-3xl bg-slate-900/80 p-5">
                  {note}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Sample data</p>
            <button
              type="button"
              onClick={handleSeedData}
              className="mt-6 w-full rounded-full bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              Seed Firebase collections
            </button>
            {seedStatus ? <p className="mt-3 text-sm text-violet-200">{seedStatus}</p> : null}
          </div>
        </div>
      </div>

      <section id="catalog" className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Course manager</p>
          <form onSubmit={handleSaveCourse} className="mt-6 grid gap-4">
            <input
              value={courseForm.title}
              onChange={(event) => setCourseForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Course title"
              className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
            />
            <textarea
              value={courseForm.description}
              onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Short description"
              rows="3"
              className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={courseForm.duration}
                onChange={(event) => setCourseForm((current) => ({ ...current, duration: event.target.value }))}
                placeholder="Duration"
                className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
              <input
                value={courseForm.price}
                onChange={(event) => setCourseForm((current) => ({ ...current, price: event.target.value }))}
                placeholder="Price"
                className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={courseForm.level}
                onChange={(event) => setCourseForm((current) => ({ ...current, level: event.target.value }))}
                className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              >
                {['Beginner', 'Intermediate', 'Advanced', 'All levels', 'Kids'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                value={courseForm.format}
                onChange={(event) => setCourseForm((current) => ({ ...current, format: event.target.value }))}
                placeholder="Format"
                className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
            </div>
            <input
              value={courseForm.image}
              onChange={(event) => setCourseForm((current) => ({ ...current, image: event.target.value }))}
              placeholder="Image URL"
              className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
            />
            <div className="flex gap-3">
              <button type="submit" className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
                {editingCourseId ? 'Update course' : 'Add course'}
              </button>
              {editingCourseId ? (
                <button type="button" onClick={resetCourseForm} className="rounded-full border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/5">
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Current catalog</p>
          <div className="mt-6 space-y-4">
            {courses.slice(0, 5).map((course) => (
              <div key={course.id} className="rounded-3xl bg-slate-900/80 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-white">{course.title}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {course.level} • {formatCurrency(course.price)}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => handleEditCourse(course)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDeleteCourse(course.id)} className="rounded-full bg-rose-500/20 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/30">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Workshop manager</p>
          <form onSubmit={handleAddWorkshop} className="mt-6 grid gap-4">
            <input
              value={workshopForm.title}
              onChange={(event) => setWorkshopForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Workshop title"
              className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
            />
            <textarea
              value={workshopForm.description}
              onChange={(event) => setWorkshopForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Workshop description"
              rows="3"
              className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="datetime-local"
                value={workshopForm.date}
                onChange={(event) => setWorkshopForm((current) => ({ ...current, date: event.target.value }))}
                className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
              <input
                value={workshopForm.mode}
                onChange={(event) => setWorkshopForm((current) => ({ ...current, mode: event.target.value }))}
                placeholder="Mode"
                className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={workshopForm.seats}
                onChange={(event) => setWorkshopForm((current) => ({ ...current, seats: event.target.value }))}
                placeholder="Seats"
                className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
              <input
                value={workshopForm.price}
                onChange={(event) => setWorkshopForm((current) => ({ ...current, price: event.target.value }))}
                placeholder="Price"
                className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
            </div>
            <button type="submit" className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
              Add workshop
            </button>
          </form>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Workshop lineup</p>
          <div className="mt-6 space-y-4">
            {workshops.map((workshop) => (
              <div key={workshop.id} className="rounded-3xl bg-slate-900/80 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-white">{workshop.title}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {formatDate(workshop.date)} • {workshop.seats} seats
                    </p>
                  </div>
                  <button type="button" onClick={() => handleDeleteWorkshop(workshop.id)} className="rounded-full bg-rose-500/20 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/30">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <div className="flex items-center gap-3 text-violet-300">
            <Palette size={20} />
            <p className="text-sm uppercase tracking-[0.24em]">Gallery uploader</p>
          </div>
          <form onSubmit={handleAddGallery} className="mt-6 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={galleryForm.title}
                onChange={(event) => setGalleryForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Artwork title"
                className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
              <input
                value={galleryForm.artist}
                onChange={(event) => setGalleryForm((current) => ({ ...current, artist: event.target.value }))}
                placeholder="Student name"
                className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={galleryForm.medium}
                onChange={(event) => setGalleryForm((current) => ({ ...current, medium: event.target.value }))}
                placeholder="Medium"
                className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
              <input
                value={galleryForm.mentor}
                onChange={(event) => setGalleryForm((current) => ({ ...current, mentor: event.target.value }))}
                placeholder="Mentor"
                className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={galleryForm.category}
                onChange={(event) => setGalleryForm((current) => ({ ...current, category: event.target.value }))}
                className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              >
                {['Sketch', 'Watercolor', 'Oil', 'Digital', 'Kids', 'Anime'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                value={galleryForm.image}
                onChange={(event) => setGalleryForm((current) => ({ ...current, image: event.target.value }))}
                placeholder="Image URL"
                className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
            </div>
            <textarea
              value={galleryForm.details}
              onChange={(event) => setGalleryForm((current) => ({ ...current, details: event.target.value }))}
              placeholder="Artwork notes"
              rows="3"
              className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
            />
            <button type="submit" className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
              Upload artwork entry
            </button>
          </form>
        </div>

        <div id="students" className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Student roster</p>
          <div className="mt-6 space-y-4">
            {students.map((student) => (
              <div key={student.id} className="rounded-3xl bg-slate-900/80 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-white">{student.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{student.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full bg-white/5 px-3 py-2 text-sm text-slate-300">{student.level}</span>
                    <StatusPill value={student.feeStatus} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="inquiries" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Inquiry inbox</p>
          <div className="mt-6 space-y-4">
            {inquiries.length === 0 ? (
              <EmptyState title="No inquiries" description="Fresh leads from the contact page will appear here." />
            ) : (
              inquiries.map((inquiry) => (
                <div key={inquiry.id} className="rounded-3xl bg-slate-900/80 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-semibold text-white">{inquiry.name}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {inquiry.email} • {inquiry.interest}
                      </p>
                      <p className="mt-3 text-slate-300">{inquiry.message}</p>
                    </div>
                    <div className="space-y-3">
                      <StatusPill value={inquiry.status} />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleInquiryStatus(inquiry.id, 'contacted')} className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/5">
                          Contacted
                        </button>
                        <button type="button" onClick={() => handleInquiryStatus(inquiry.id, 'closed')} className="rounded-full bg-violet-500 px-3 py-2 text-xs text-white transition hover:bg-violet-400">
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <div className="flex items-center gap-3 text-violet-300">
            <Megaphone size={20} />
            <p className="text-sm uppercase tracking-[0.24em]">Announcements</p>
          </div>
          <form onSubmit={handleAnnouncement} className="mt-6 grid gap-4">
            <input
              value={announcementForm.title}
              onChange={(event) => setAnnouncementForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Announcement title"
              className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
            />
            <select
              value={announcementForm.audience}
              onChange={(event) => setAnnouncementForm((current) => ({ ...current, audience: event.target.value }))}
              className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
            >
              {['Students', 'Public', 'Parents'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <textarea
              value={announcementForm.message}
              onChange={(event) => setAnnouncementForm((current) => ({ ...current, message: event.target.value }))}
              placeholder="Announcement message"
              rows="4"
              className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
            />
            <button type="submit" className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
              Save announcement
            </button>
          </form>
          <div className="mt-8 space-y-4">
            {announcements.slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-3xl bg-slate-900/80 p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300">{item.audience}</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{item.message}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="finance" className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Fee tracking</p>
        <div className="mt-6 grid gap-4">
          {fees.map((fee) => (
            <div key={fee.id} className="rounded-3xl bg-slate-900/80 p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
                <div>
                  <p className="font-semibold text-white">{fee.studentEmail}</p>
                  <p className="mt-1 text-sm text-slate-400">{fee.plan}</p>
                </div>
                <p className="text-sm text-slate-300">{formatCurrency(fee.paid)} paid</p>
                <p className="text-sm text-slate-300">Due {formatDate(fee.dueDate)}</p>
                <StatusPill value={fee.status} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
