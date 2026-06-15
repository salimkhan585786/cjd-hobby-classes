import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import MediaPreview from '../components/MediaPreview';
import { useAuth } from '../hooks/useAuth';
import { useCourses, useGallery, useStudentEnrollmentRequests, useStudentProfile } from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import { createEnrollmentRequest } from '../services/dataService';
import { formatCurrency, slugify } from '../utils/helpers';

function CourseDetails() {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { student } = useStudentProfile();
  const { enrollmentRequests } = useStudentEnrollmentRequests();
  const { courses, loading: coursesLoading } = useCourses();
  const { gallery, loading: galleryLoading } = useGallery();
  const { showToast } = useToast();
  const [processingCourse, setProcessingCourse] = useState('');
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  const course = useMemo(
    () => courses.find((item) => slugify(item.title) === courseSlug || String(item.id) === String(courseSlug)),
    [courseSlug, courses]
  );

  const linkedGallery = useMemo(() => {
    if (!course?.title) {
      return [];
    }

    const courseKey = slugify(course.title);
    return gallery.filter((item) => slugify(item.category) === courseKey);
  }, [course, gallery]);

  const activeRequest = useMemo(
    () =>
      enrollmentRequests.find(
        (item) =>
          item.itemType === 'course' &&
          item.itemTitle === course?.title &&
          !['Rejected', 'Cancelled'].includes(item.requestStatus)
      ),
    [course?.title, enrollmentRequests]
  );

  const enrolled = course?.title ? student?.enrolledCourses?.includes(course.title) : false;

  const actionLabel = !user
    ? 'Join now'
    : role !== 'student'
      ? 'Admin view'
      : enrolled
        ? 'Enrolled'
        : activeRequest
          ? activeRequest.requestStatus === 'Approved'
            ? 'Await payment'
            : 'Requested'
          : 'Request enroll';

  const handleCourseAction = async () => {
    if (!course) {
      return;
    }

    if (!user) {
      navigate('/register');
      return;
    }

    if (role !== 'student') {
      navigate('/admin');
      return;
    }

    try {
      setProcessingCourse(course.id);
      await createEnrollmentRequest({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        course,
      });
      showToast({
        type: 'success',
        title: 'Request submitted',
        message: `${course.title} is waiting for admin approval before payment opens.`,
      });
      navigate('/student#classes');
    } catch (error) {
      console.error(error);
      showToast({
        type: 'error',
        title: 'Enrollment failed',
        message: 'The course could not be added right now.',
      });
    } finally {
      setProcessingCourse('');
    }
  };

  if (coursesLoading || galleryLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
        <LoadingSkeleton className="h-[620px]" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
        <EmptyState
          title="Course not found"
          description="This course may have been removed or the link may be out of date."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
      <section className="grid gap-8 rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-violet-300 transition hover:text-violet-200">
            Back to courses
          </Link>
          <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.24em] text-violet-300">
            <span>{course.level}</span>
            <span>{course.duration}</span>
            <span>{course.format}</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">{course.title}</h1>
            <p className="mt-4 max-w-3xl text-base text-slate-300 sm:text-lg">{course.description}</p>
          </div>
          <div className="rounded-[2rem] bg-slate-900/80 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Course fee</p>
            <p className="mt-3 text-xl font-semibold text-white sm:text-2xl lg:text-3xl">{course.priceLabel || formatCurrency(course.price)}</p>
            <p className="mt-3 text-slate-400">
              Each class includes in-studio guidance, review support, and a gallery feed of student outcomes tied to this course.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={handleCourseAction}
              disabled={Boolean(processingCourse) || enrolled || Boolean(activeRequest)}
              className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-700"
            >
              {actionLabel} <ArrowRight size={16} />
            </button>
            <Link
              to="/gallery"
              className="rounded-full border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/5"
            >
              Browse full gallery
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80">
          <MediaPreview
            src={course.image}
            alt={course.title}
            title={course.title}
            className="h-full min-h-[360px] w-full"
          />
        </div>
      </section>

      <section className="rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Course gallery</p>
            <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl lg:text-3xl">Student work from {course.title}</h2>
          </div>
          <p className="max-w-xl text-slate-400">
            Every gallery item tagged to this course appears here automatically, so the page stays in sync with admin uploads.
          </p>
        </div>

        {linkedGallery.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No gallery items yet"
              description="Upload artwork in the admin catalog and assign it to this course title to fill this section."
            />
          </div>
        ) : (
          <div className="mt-8 flex gap-6 overflow-x-auto pb-4">
            {linkedGallery.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedArtwork(item)}
                className="w-[290px] shrink-0 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 text-left transition hover:-translate-y-1"
              >
                <MediaPreview
                  src={item.image}
                  alt={item.title}
                  title={item.title}
                  className="h-64 w-full"
                  mediaClassName="object-cover"
                  showLink={false}
                />
                <div className="space-y-2 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-violet-300">{item.medium}</p>
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-slate-300">{item.artist || item.mentor || 'Unknown artist'}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedArtwork ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6"
          onClick={() => setSelectedArtwork(null)}
        >
          <div
            className="relative grid max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/95 shadow-soft lg:grid-cols-[minmax(0,1.35fr)_420px]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedArtwork(null)}
              className="absolute right-5 top-5 z-10 rounded-full bg-slate-900/85 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              Close
            </button>
            <div className="flex min-h-[320px] items-center justify-center bg-black p-4 sm:p-6">
              <MediaPreview
                src={selectedArtwork.image}
                alt={selectedArtwork.title}
                title={selectedArtwork.title}
                className="h-full max-h-[78vh] w-full rounded-[1.75rem]"
                mediaFit="contain"
                mediaClassName="h-full w-full"
                controls
              />
            </div>
            <div className="flex max-h-[90vh] flex-col overflow-y-auto border-t border-white/10 bg-slate-950/98 lg:border-l lg:border-t-0">
              <div className="border-b border-white/10 p-6 pr-24">
                <p className="text-sm uppercase tracking-[0.24em] text-violet-300">{selectedArtwork.category}</p>
                <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">{selectedArtwork.title}</h2>
                <p className="mt-3 text-sm text-slate-400">
                  by {selectedArtwork.artist || selectedArtwork.mentor || 'Unknown artist'}
                </p>
              </div>
              <div className="flex-1 space-y-6 p-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Description</p>
                  <p className="mt-2 leading-7 text-slate-300">
                    {selectedArtwork.details || 'No description added yet.'}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-900/80 p-5">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Artist</p>
                    <p className="mt-1 text-white">{selectedArtwork.artist}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Medium</p>
                    <p className="mt-1 text-white">{selectedArtwork.medium}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Mentor</p>
                    <p className="mt-1 text-white">{selectedArtwork.mentor}</p>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Course gallery note</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    This popup now matches the main gallery viewer, with the full artwork on the left and details on the right.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default CourseDetails;
