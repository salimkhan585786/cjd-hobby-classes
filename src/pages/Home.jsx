import { motion } from 'framer-motion';
import { ArrowRight, Brush, HeartHandshake, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import FAQItem from '../components/FAQItem';
import LoadingSkeleton from '../components/LoadingSkeleton';
import MediaPreview from '../components/MediaPreview';
import StatCounter from '../components/StatCounter';
import WorkshopCard from '../components/WorkshopCard';
import { useCourses, useFaqs, useGallery, useTestimonials, useWorkshops } from '../hooks/useData';
import { heroStats } from '../services/dummyData';

const valueProps = [
  {
    title: 'Mentor-led learning plans',
    description: 'Structured curriculum paths for children, hobby learners, and portfolio-focused artists.',
  },
  {
    title: 'Premium showcase culture',
    description: 'Students finish each phase with review-ready work, growth notes, and meaningful milestones.',
  },
  {
    title: 'Offline studio batches only',
    description: 'Join guided in-studio classes, weekend labs, and focused practice sessions inside the academy.',
  },
];

function Home() {
  const { courses, loading: coursesLoading } = useCourses();
  const { workshops, loading: workshopsLoading } = useWorkshops();
  const { gallery, loading: galleryLoading } = useGallery();
  const { testimonials } = useTestimonials();
  const { faqs } = useFaqs();

  return (
    <div className="space-y-24 px-6 pb-16 pt-10 sm:px-10 lg:px-14">
      <section className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-slate-950/90 p-10 shadow-soft sm:p-14">
        <div className="absolute -right-20 top-10 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-2 text-sm uppercase tracking-[0.28em] text-violet-200">
              New season enrollment
            </span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-semibold leading-tight text-white sm:text-6xl"
            >
              Modern art classes for students who want skill, confidence, and a beautiful portfolio.
            </motion.h1>
            <p className="max-w-xl text-lg leading-8 text-slate-300">
              CJD HOBBY CLASSES Art Academy blends premium design, thoughtful mentorship, and real progress tracking for drawing, painting, workshops, and custom portrait commissions.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-violet-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-violet-400"
              >
                Join Classes
              </Link>
              <Link
                to="/workshops"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-slate-900/80 px-6 py-4 text-base text-slate-100 transition hover:bg-slate-900"
              >
                Book Workshop
              </Link>
              <Link
                to="/order"
                className="inline-flex items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 px-6 py-4 text-base text-violet-100 transition hover:bg-violet-500/20"
              >
                Order Portrait
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="grid gap-5">
              <div className="glass-card flex min-h-[220px] items-end overflow-hidden rounded-[2.2rem] p-6 shadow-soft">
                <div className="pointer-events-none absolute inset-0 opacity-55">
                  <MediaPreview
                    src={gallery[0]?.image}
                    alt={gallery[0]?.title || 'Featured artwork'}
                    title={gallery[0]?.title || 'Featured artwork'}
                    className="h-full w-full"
                    mediaClassName="object-cover"
                    showLink={false}
                  />
                </div>
                <div className="relative z-10 max-w-sm">
                  <p className="text-sm uppercase tracking-[0.24em] text-violet-200">Featured artwork</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">{gallery[0]?.title || 'Student showcase'}</h2>
                  <p className="mt-2 text-slate-200">A gallery-style learning experience where every batch creates polished portfolio work.</p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="glass-card rounded-[2rem] p-5 shadow-soft">
                  <div className="flex items-center gap-3 text-violet-300">
                    <Brush size={20} />
                    <span className="text-sm uppercase tracking-[0.24em]">Course paths</span>
                  </div>
                  <p className="mt-4 text-xl font-semibold text-white">From pencil foundations to digital illustration</p>
                </div>
                <div className="glass-card rounded-[2rem] p-5 shadow-soft">
                  <div className="flex items-center gap-3 text-violet-300">
                    <Sparkles size={20} />
                    <span className="text-sm uppercase tracking-[0.24em]">Class management</span>
                  </div>
                  <p className="mt-4 text-xl font-semibold text-white">Attendance, feedback, fees, orders, and progress in one flow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {heroStats.map((item) => (
          <StatCounter key={item.label} item={item} />
        ))}
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-violet-300">Featured artwork</p>
            <h2 className="mt-3 text-4xl font-semibold text-white">Student work that feels exhibition-ready.</h2>
          </div>
          <Link to="/gallery" className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
            View Gallery <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {galleryLoading
            ? Array.from({ length: 3 }).map((_, index) => <LoadingSkeleton key={index} className="h-[360px]" />)
            : gallery.slice(0, 3).map((item) => (
                <div key={item.id} className="glass-card overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-soft">
                  <MediaPreview src={item.image} alt={item.title} title={item.title} className="h-72 w-full" />
                  <div className="space-y-2 p-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-violet-300">{item.category}</p>
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-slate-400">
                      by {item.artist} • {item.medium}
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          { title: '92% average attendance', description: 'Students stay engaged because lessons are structured, visual, and mentor-led.' },
          { title: '1:1 feedback loops', description: 'Every batch includes critique notes, review milestones, and personal progress support.' },
          { title: 'Showcase-first mindset', description: 'Students build real finished work they can proudly share with family, colleges, or clients.' },
        ].map((item) => (
          <div key={item.title} className="glass-card rounded-[2rem] border border-white/10 p-6 shadow-soft">
            <div className="flex items-center gap-3 text-violet-300">
              <Star size={18} />
              <span className="text-sm uppercase tracking-[0.24em]">Student success</span>
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-slate-400">{item.description}</p>
          </div>
        ))}
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Available courses</p>
            <h2 className="text-4xl font-semibold text-white">Creative learning paths for every age and ambition.</h2>
          </div>
          <Link to="/courses" className="rounded-full border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/5">
            Explore all courses
          </Link>
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          {coursesLoading
            ? Array.from({ length: 3 }).map((_, index) => <LoadingSkeleton key={index} className="h-[420px]" />)
            : courses.slice(0, 3).map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Workshops</p>
            <h2 className="text-4xl font-semibold text-white">Upcoming creative experiences.</h2>
          </div>
          <Link to="/workshops" className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
            See all workshops
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {workshopsLoading
            ? Array.from({ length: 3 }).map((_, index) => <LoadingSkeleton key={index} className="h-72" />)
            : workshops.map((workshop) => <WorkshopCard key={workshop.id} workshop={workshop} />)}
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card rounded-[2rem] border border-white/10 p-10 shadow-soft">
          <div className="flex items-center gap-4 text-violet-300">
            <HeartHandshake size={24} />
            <span className="text-sm uppercase tracking-[0.24em]">Why choose us</span>
          </div>
          <div className="mt-8 grid gap-6">
            {valueProps.map((item) => (
              <div key={item.title} className="rounded-3xl bg-slate-950/80 p-6 shadow-soft">
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-[2rem] border border-white/10 p-10 shadow-soft">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-violet-300">
              <Sparkles size={24} />
              <span className="text-sm uppercase tracking-[0.24em]">Instagram style gallery</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {gallery.slice(0, 4).map((item) => (
                <div key={item.id} className="overflow-hidden rounded-3xl">
                  <MediaPreview src={item.image} alt={item.title} title={item.title} className="h-32 w-full" />
                </div>
              ))}
            </div>
            <p className="text-slate-400">A premium visual feed of mentor critiques, workshop moments, and student showcase highlights.</p>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Testimonials</p>
          <h2 className="text-4xl font-semibold text-white">What our students and parents say.</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <motion.article whileHover={{ y: -6 }} key={item.name} className="glass-card rounded-[2rem] border border-white/10 p-8 shadow-soft">
              <p className="text-lg leading-8 text-slate-200">"{item.feedback}"</p>
              <div className="mt-6 space-y-1">
                <p className="font-semibold text-white">{item.name}</p>
                <p className="text-sm uppercase tracking-[0.24em] text-violet-300">{item.role}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">FAQ</p>
          <h2 className="text-4xl font-semibold text-white">Frequently asked questions.</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {faqs.map((item) => (
            <FAQItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </section>

      <section className="rounded-[3rem] border border-white/10 bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-cyan-500/10 p-10 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.24em] text-violet-200">Ready to start?</p>
            <h2 className="mt-3 text-4xl font-semibold text-white">Build your next artistic chapter with a polished, mentor-led academy experience.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="rounded-full bg-violet-500 px-6 py-4 text-center font-semibold text-white transition hover:bg-violet-400">
              Create student account
            </Link>
            <Link to="/contact" className="rounded-full border border-white/10 px-6 py-4 text-center text-slate-100 transition hover:bg-white/5">
              Ask a question
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
