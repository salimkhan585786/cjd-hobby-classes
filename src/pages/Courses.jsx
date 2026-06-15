import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useAuth } from '../hooks/useAuth';
import { useStudentEnrollmentRequests, useStudentProfile } from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import { createEnrollmentRequest } from '../services/dataService';
import { useCourses } from '../hooks/useData';
import { FadeInView, StaggerContainer, StaggerItem, ParallaxSection } from '../components/Animation';

function Courses() {
  const { courses, loading } = useCourses();
  const { user, role } = useAuth();
  const { student } = useStudentProfile();
  const { enrollmentRequests } = useStudentEnrollmentRequests();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [level, setLevel] = useState('All');
  const [search, setSearch] = useState('');
  const [processingCourse, setProcessingCourse] = useState('');

  const levels = useMemo(() => ['All', ...new Set(courses.map((course) => course.level))], [courses]);

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => {
        const matchesLevel = level === 'All' || course.level === level;
        const term = search.trim().toLowerCase();
        const matchesSearch =
          !term ||
          course.title.toLowerCase().includes(term) ||
          course.description.toLowerCase().includes(term);
        return matchesLevel && matchesSearch;
      }),
    [courses, level, search]
  );

  const handleCourseAction = async (course) => {
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
      <FadeInView>
        <div className="mb-6 sm:mb-10 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-violet-300 sm:text-sm">Curriculum</p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">Courses built to grow artistic confidence.</h1>
          </div>
          <p className="max-w-xl text-sm text-slate-400 sm:text-base">
            Explore studio-led class tracks with realistic milestones, modern techniques, and consistent mentor feedback.
          </p>
        </div>
      </FadeInView>

      <FadeInView delay={0.1}>
        <div className="mb-6 sm:mb-10 grid gap-3 sm:gap-4 rounded-[2rem] border border-white/10 bg-slate-950/90 p-4 sm:p-6 shadow-soft lg:grid-cols-[1fr_auto]">
          <div>
            <label htmlFor="course-search" className="sr-only">Search courses</label>
            <input
              id="course-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by course or style"
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-3 py-3 text-sm text-slate-100 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500 sm:px-4 sm:py-4 sm:text-base"
            />
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {levels.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLevel(option)}
                className={`rounded-full px-3 py-2 text-xs font-medium transition sm:px-4 sm:py-3 sm:text-sm ${
                  option === level ? 'bg-violet-500 text-white' : 'bg-slate-900/80 text-slate-300 hover:bg-white/5'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </FadeInView>

      <ParallaxSection speed={0.08}>
        {loading ? (
          <div className="grid gap-4 grid-cols-2 md:gap-6 md:grid-cols-2 xl:gap-8 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <LoadingSkeleton key={index} className="h-[380px] md:h-[430px]" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <EmptyState
            title="No matching courses"
            description="Try a different level filter or search term to explore the full class catalog."
          />
        ) : (
          <StaggerContainer className="grid gap-4 grid-cols-2 md:gap-6 md:grid-cols-2 xl:gap-8 xl:grid-cols-3" staggerDelay={0.1}>
            {filteredCourses.map((course) => {
              const enrolled = student?.enrolledCourses?.includes(course.title);
              const activeRequest = enrollmentRequests.find(
                (item) =>
                  item.itemType === 'course' &&
                  item.itemTitle === course.title &&
                  !['Rejected', 'Cancelled'].includes(item.requestStatus)
              );
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

              return (
                <StaggerItem key={course.id}>
                  <CourseCard
                    course={course}
                    onAction={handleCourseAction}
                    actionLabel={actionLabel}
                    actionDisabled={Boolean(processingCourse) || enrolled || Boolean(activeRequest)}
                  />
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </ParallaxSection>
    </div>
  );
}

export default Courses;
