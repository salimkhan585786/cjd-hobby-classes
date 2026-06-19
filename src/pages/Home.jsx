import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Brush, HeartHandshake, Sparkles, Star } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import FAQItem from '../components/FAQItem';
import LoadingSkeleton from '../components/LoadingSkeleton';
import MediaPreview from '../components/MediaPreview';
import StatCounter from '../components/StatCounter';
import EventCard from '../components/EventCard';
import GalleryCollage from '../components/GalleryCollage';
import SilkWaves from '../components/SilkWaves';
import StaggeredText from '../components/StaggeredText';
import { useCourses, useFaqs, useGallery, useTestimonials, useWorkshops } from '../hooks/useData';
import { heroStats } from '../services/dummyData';
import {
  ParallaxSection, FadeInView, StaggerContainer, StaggerItem,
  FloatingElement, MouseParallax, ZoomParallax,
  LayeredParallax, ParallaxLayer, RotateParallax,
  TiltCard, MagneticButton, FadeInParallax,
} from '../components/Animation';

const valueProps = [
  { title: 'Mentor-led learning plans', description: 'Structured curriculum paths for children, hobby learners, and portfolio-focused artists.' },
  { title: 'Premium showcase culture', description: 'Students finish each phase with review-ready work, growth notes, and meaningful milestones.' },
  { title: 'Offline studio batches only', description: 'Join guided in-studio classes, weekend labs, and focused practice sessions inside the academy.' },
];

function Home() {
  const { courses, loading: coursesLoading } = useCourses();
  const { workshops, loading: workshopsLoading } = useWorkshops();
  const { gallery, loading: galleryLoading } = useGallery();
  const { testimonials } = useTestimonials();
  const { faqs } = useFaqs();

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.96]);

  const ctaRef = useRef(null);
  const { scrollYProgress: ctaProgress } = useScroll({ target: ctaRef, offset: ['start end', 'end start'] });
  const ctaY = useTransform(ctaProgress, [0, 1], [60, -60]);

  return (
    <div className="space-y-16 px-4 pb-12 pt-6 sm:space-y-24 sm:px-10 lg:px-14">

      {/* ── HERO: 3D Layered Parallax + Mouse Parallax ── */}
      <LayeredParallax className="relative rounded-[3rem] border border-white/10 bg-slate-950/90 shadow-soft">
        <MouseParallax intensity={12}>
          {(mouse) => (
              <motion.section
                ref={heroRef}
                style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
                className="relative overflow-hidden p-6 sm:p-10 lg:p-14 min-h-[55vh] sm:min-h-[70vh]"
              >
              {/* Silk Waves animated background */}
              <SilkWaves />

              {/* Floating decorative blobs — react to mouse */}
              <FloatingElement className="absolute -right-20 top-10 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" duration={6} />
              <FloatingElement className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl" duration={8} amplitude={15} />
              <motion.div style={{ x: mouse.x, y: mouse.y }} className="absolute -right-32 top-20 h-40 w-40 rounded-full bg-violet-500/10 blur-2xl" />
              <motion.div style={{ x: useTransform(mouse.x, (v) => -v * 0.6), y: useTransform(mouse.y, (v) => -v * 0.6) }} className="absolute -left-24 bottom-10 h-48 w-48 rounded-full bg-pink-500/10 blur-2xl" />

              <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <div className="max-w-2xl space-y-6">
                  <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-3 py-1.5 text-xs uppercase tracking-[0.28em] text-violet-200 sm:text-sm sm:px-4 sm:py-2">
                    New season enquiry
                  </motion.span>
                  <StaggeredText
                    as="h1"
                    text="Modern art classes for students who want skill, confidence, and a beautiful portfolio."
                    className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl"
                    segmentBy="words"
                    delay={80}
                    duration={0.6}
                    blur={true}
                    staggerDirection="center"
                  />
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                    CJD HOBBY CLASSES Art Academy blends premium design, thoughtful mentorship, and real progress tracking for drawing, painting, events, and custom portrait commissions.
                  </motion.p>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="flex flex-col gap-3 sm:flex-row">
                    <MagneticButton className="inline-flex items-center justify-center rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 sm:px-6 sm:py-4 sm:text-base">
                      <Link to="/contact">Enquiry</Link>
                    </MagneticButton>
                    <MagneticButton className="inline-flex items-center justify-center rounded-full border border-white/10 bg-slate-900/80 px-5 py-3 text-sm text-slate-100 transition hover:bg-slate-900 sm:px-6 sm:py-4 sm:text-base">
                      <Link to="/events">Book Event</Link>
                    </MagneticButton>
                    <MagneticButton className="inline-flex items-center justify-center rounded-full border border-violet-500 bg-violet-500/15 px-5 py-3 text-sm text-violet-100 transition hover:bg-violet-500/25 sm:px-6 sm:py-4 sm:text-base">
                      <Link to="/order">Order Portrait</Link>
                    </MagneticButton>
                  </motion.div>
                </div>

                <ParallaxLayer depth={0.3}>
                  <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.7 }} className="relative">
                      <div className="grid gap-4 sm:gap-5">
                        <div className="glass-card flex min-h-[180px] sm:min-h-[220px] items-end overflow-hidden rounded-[2.2rem] p-4 sm:p-6 shadow-soft">
                          <div className="pointer-events-none absolute inset-0 opacity-55">
                            <MediaPreview src={gallery[0]?.image} alt={gallery[0]?.title || 'Featured artwork'} title={gallery[0]?.title || 'Featured artwork'} className="h-full w-full" mediaClassName="object-cover" showLink={false} />
                          </div>
                          <div className="relative z-10 max-w-sm">
                            <p className="text-xs uppercase tracking-[0.24em] text-violet-200 sm:text-sm">Featured artwork</p>
                            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{gallery[0]?.title || 'Student showcase'}</h2>
                            <p className="mt-2 text-sm text-slate-200 sm:text-base">A gallery-style learning experience where every batch creates polished portfolio work.</p>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                          <div className="glass-card rounded-[2rem] p-4 sm:p-5 shadow-soft">
                            <div className="flex items-center gap-3 text-violet-300"><Brush size={18} sm:size={20} /><span className="text-xs uppercase tracking-[0.24em] sm:text-sm">Course paths</span></div>
                            <p className="mt-3 text-lg font-semibold text-white sm:text-xl">From pencil foundations to digital illustration</p>
                          </div>
                          <div className="glass-card rounded-[2rem] p-4 sm:p-5 shadow-soft">
                            <div className="flex items-center gap-3 text-violet-300"><Sparkles size={18} sm:size={20} /><span className="text-xs uppercase tracking-[0.24em] sm:text-sm">Class management</span></div>
                            <p className="mt-3 text-lg font-semibold text-white sm:text-xl">Attendance, feedback, fees, orders, and progress in one flow</p>
                          </div>
                        </div>
                      </div>
                  </motion.div>
                </ParallaxLayer>
              </div>
            </motion.section>
          )}
        </MouseParallax>
      </LayeredParallax>

      {/* ── STATS ── */}
      <StaggerContainer className="grid gap-6 lg:grid-cols-3">
        {heroStats.map((item) => (
          <StaggerItem key={item.label}><StatCounter item={item} /></StaggerItem>
        ))}
      </StaggerContainer>

      {/* ── GALLERY: Collage with Parallax ── */}
      <GalleryCollage limit={15} />

      {/* ── STUDENT SUCCESS: Rotational Parallax ── */}
      <RotateParallax rotateRange={[-3, 3]} axis="y">
        <StaggerContainer className="grid gap-4 grid-cols-1 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: '92% average attendance', description: 'Students stay engaged because lessons are structured, visual, and mentor-led.' },
            { title: '1:1 feedback loops', description: 'Every batch includes critique notes, review milestones, and personal progress support.' },
            { title: 'Showcase-first mindset', description: 'Students build real finished work they can proudly share with family, colleges, or clients.' },
          ].map((item) => (
            <StaggerItem key={item.title}>
              <div className="glass-card rounded-[2rem] border border-white/10 p-4 sm:p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
                <div className="flex items-center gap-2 text-violet-300"><Star size={16} sm:size={18} /><span className="text-xs uppercase tracking-[0.24em] sm:text-sm">Student success</span></div>
                <h3 className="mt-3 text-xl font-semibold text-white sm:text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-400 sm:text-base">{item.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </RotateParallax>

      {/* ── COURSES ── */}
      <ParallaxSection speed={0.12} direction="down">
        <FadeInView>
          <section className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-violet-300 sm:text-sm">Available courses</p>
                <h2 className="text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">Creative learning paths for every age and ambition.</h2>
              </div>
              <Link to="/courses" className="rounded-full border border-white/10 px-4 py-2.5 text-xs text-slate-200 transition hover:bg-white/5 sm:px-5 sm:py-3 sm:text-sm">Explore all courses</Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {coursesLoading
                ? Array.from({ length: 3 }).map((_, i) => <LoadingSkeleton key={i} className="h-[420px]" />)
                : courses.slice(0, 3).map((course, idx) => <CourseCard key={course.id} course={course} variant={['violet', 'fuchsia', 'cyan'][idx % 3]} />)}
            </div>
          </section>
        </FadeInView>
      </ParallaxSection>

      {/* ── EVENTS ── */}
      <ParallaxSection speed={0.15}>
        <FadeInView>
          <section className="space-y-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-violet-300 sm:text-sm">Events</p>
                <h2 className="text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">Upcoming creative experiences.</h2>
              </div>
              <Link to="/events" className="rounded-full bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-400 sm:px-5 sm:py-3 sm:text-sm">See all events</Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workshopsLoading
                ? Array.from({ length: 3 }).map((_, i) => <LoadingSkeleton key={i} className="h-72" />)
                : workshops.slice(0, 3).map((workshop, idx) => <EventCard key={workshop.id} event={workshop} variant={['violet', 'fuchsia', 'pink'][idx % 3]} />)}
            </div>
          </section>
        </FadeInView>
      </ParallaxSection>

      {/* ── WHY CHOOSE US + INSTAGRAM GALLERY: Fade-In Parallax ── */}
      <FadeInParallax
        className="rounded-[3rem]"
        background={<div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-pink-500/5" />}
      >
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <FadeInView direction="left">
            <div className="glass-card rounded-[2rem] border border-white/10 p-6 sm:p-8 lg:p-10 shadow-soft">
              <div className="flex items-center gap-3 text-violet-300">
                <HeartHandshake size={20} sm:size={24} />
                <span className="text-xs uppercase tracking-[0.24em] sm:text-sm">Why choose us</span>
              </div>
              <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6">
                {valueProps.map((item, index) => (
                  <motion.div key={item.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }} className="rounded-3xl bg-slate-950/80 p-4 sm:p-6 shadow-soft transition-transform duration-300 hover:translate-x-1">
                    <h3 className="text-lg font-semibold text-white sm:text-xl">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-400 sm:text-base">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeInView>
          <FadeInView direction="right">
            <div className="glass-card rounded-[2rem] border border-white/10 p-6 sm:p-8 lg:p-10 shadow-soft">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 text-violet-300">
                  <Sparkles size={20} sm:size={24} />
                  <span className="text-xs uppercase tracking-[0.24em] sm:text-sm">Instagram style gallery</span>
                </div>
                <StaggerContainer className="grid grid-cols-2 gap-3 sm:gap-4" staggerDelay={0.1}>
                  {gallery.slice(0, 4).map((item) => (
                    <StaggerItem key={item.id}>
                      <ZoomParallax scaleRange={[0.96, 1.04]}>
                        <div className="overflow-hidden rounded-3xl">
                          <MediaPreview src={item.image} alt={item.title} title={item.title} className="h-24 sm:h-32 w-full" />
                        </div>
                      </ZoomParallax>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
                <p className="text-sm text-slate-400 sm:text-base">A premium visual feed of mentor critiques, event moments, and student showcase highlights.</p>
              </div>
            </div>
          </FadeInView>
        </div>
      </FadeInParallax>

      {/* ── TESTIMONIALS: Tilt Cards ── */}
      <ParallaxSection speed={0.1}>
        <FadeInView>
          <section className="space-y-6 sm:space-y-8">
            <div className="space-y-2 sm:space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-violet-300 sm:text-sm">Testimonials</p>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">What our students and parents say.</h2>
            </div>
            <StaggerContainer className="grid gap-4 grid-cols-1 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.12}>
              {testimonials.map((item) => (
                <StaggerItem key={item.name}>
                  <TiltCard tiltAmount={8}>
                    <article className="glass-card rounded-[2rem] border border-white/10 p-5 sm:p-6 lg:p-8 shadow-soft">
                      <p className="text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">&ldquo;{item.feedback}&rdquo;</p>
                      <div className="mt-4 sm:mt-6 space-y-1">
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-xs uppercase tracking-[0.24em] text-violet-300 sm:text-sm">{item.role}</p>
                      </div>
                    </article>
                  </TiltCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        </FadeInView>
      </ParallaxSection>

      {/* ── FAQ ── */}
      <FadeInView>
        <section className="space-y-6 sm:space-y-8">
          <div className="space-y-2 sm:space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-violet-300 sm:text-sm">FAQ</p>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">Frequently asked questions.</h2>
          </div>
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {faqs.map((item) => (
              <FAQItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </section>
      </FadeInView>

      {/* ── CTA: Magnetic Buttons + Parallax ── */}
      <motion.div ref={ctaRef} style={{ y: ctaY }}>
        <FadeInView>
          <RotateParallax rotateRange={[-2, 2]} axis="both">
            <section className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-cyan-500/10 p-6 sm:p-8 lg:p-10 shadow-soft">
              <FloatingElement className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-violet-500/10 blur-2xl" duration={5} />
              <FloatingElement className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-2xl" duration={7} />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-violet-200 sm:text-sm">Ready to start?</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">Build your next artistic chapter with a polished, mentor-led academy experience.</h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <MagneticButton className="rounded-full bg-violet-500 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-violet-400 sm:px-6 sm:py-4 sm:text-base">
                    <Link to="/contact">Make an enquiry</Link>
                  </MagneticButton>
                  <MagneticButton className="rounded-full border border-white/10 px-5 py-3 text-center text-sm text-slate-100 transition hover:bg-white/5 sm:px-6 sm:py-4 sm:text-base">
                    <Link to="/contact">Ask a question</Link>
                  </MagneticButton>
                </div>
              </div>
            </section>
          </RotateParallax>
        </FadeInView>
      </motion.div>
    </div>
  );
}

export default Home;
