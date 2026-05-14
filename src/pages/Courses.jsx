import { useMemo, useState } from 'react';
import CourseCard from '../components/CourseCard';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useCourses } from '../hooks/useData';

function Courses() {
  const { courses, loading } = useCourses();
  const [level, setLevel] = useState('All');
  const [search, setSearch] = useState('');

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

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-14">
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Curriculum</p>
          <h1 className="mt-3 text-5xl font-semibold text-white">Courses built to grow artistic confidence.</h1>
        </div>
        <p className="max-w-xl text-slate-400">
          Explore studio-led class tracks with realistic milestones, modern techniques, and consistent mentor feedback.
        </p>
      </div>

      <div className="mb-10 grid gap-4 rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-soft lg:grid-cols-[1fr_auto]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by course or style"
          className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
        />
        <div className="flex flex-wrap gap-3">
          {levels.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLevel(option)}
              className={`rounded-full px-4 py-3 text-sm font-medium transition ${
                option === level ? 'bg-violet-500 text-white' : 'bg-slate-900/80 text-slate-300 hover:bg-white/5'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-[430px]" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          title="No matching courses"
          description="Try a different level filter or search term to explore the full class catalog."
        />
      ) : (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Courses;
