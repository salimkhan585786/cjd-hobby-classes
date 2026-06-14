import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../components/EmptyState';
import GalleryCard from '../components/GalleryCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import MediaPreview from '../components/MediaPreview';
import { useGallery } from '../hooks/useData';
import { FadeInView, ParallaxSection, StaggerContainer, StaggerItem, TiltCard, ZoomParallax, HorizontalScroll, MouseParallax } from '../components/Animation';

function Gallery() {
  const { gallery, loading } = useGallery();
  const [selected, setSelected] = useState(null);
  const categories = useMemo(() => ['All', ...new Set(gallery.map((item) => item.category))], [gallery]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!selected) return undefined;
    const handleKeyDown = (e) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected]);

  const filtered = useMemo(
    () => (filter === 'All' ? gallery : gallery.filter((item) => item.category === filter)),
    [filter, gallery]
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-14">
      {/* ── HEADER ── */}
      <FadeInView>
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Student gallery</p>
            <h1 className="mt-3 text-5xl font-semibold text-white">A colorful gallery of student achievements.</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <motion.button key={category} type="button" onClick={() => setFilter(category)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className={`rounded-full px-4 py-3 text-sm font-medium transition ${filter === category ? 'bg-violet-500 text-white' : 'bg-slate-900/80 text-slate-300 hover:bg-white/5'}`}>
                {category}
              </motion.button>
            ))}
          </div>
        </div>
      </FadeInView>

      {/* ── MASONRY GRID: Zoom + Tilt ── */}
      <ParallaxSection speed={0.08}>
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={i} className="h-80" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No artwork yet" description="This category will fill up as soon as the next batch uploads showcase pieces." />
        ) : (
          <div className="masonry-3col space-y-6 sm:masonry-2col lg:masonry-3col">
            {[0, 1, 2].map((col) => (
              <div key={col} className="break-inside-avoid space-y-6">
                {filtered.filter((_, i) => i % 3 === col).map((item, idx) => (
                  <StaggerItem key={item.id} delay={col * 0.1}>
                    <ZoomParallax scaleRange={[0.96, 1.02]}>
                      <TiltCard tiltAmount={5}>
                        <GalleryCard item={item} onOpen={setSelected} />
                      </TiltCard>
                    </ZoomParallax>
                  </StaggerItem>
                ))}
              </div>
            ))}
          </div>
        )}
      </ParallaxSection>

      {/* ── HORIZONTAL SCROLL GALLERY ── */}
      {gallery.length > 0 && (
        <FadeInView className="mt-20">
          <p className="mb-6 text-sm uppercase tracking-[0.24em] text-violet-300">Scroll horizontally</p>
          <HorizontalScroll>
            {gallery.slice(0, 8).map((item) => (
              <MouseParallax key={item.id} intensity={8}>
                {(mouse) => (
                  <motion.div style={{ x: mouse.x, y: mouse.y }} className="w-[350px] flex-shrink-0">
                    <TiltCard tiltAmount={6}>
                      <div className="glass-card overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-soft">
                        <MediaPreview src={item.image} alt={item.title} title={item.title} className="h-64 w-full" />
                        <div className="space-y-2 p-5">
                          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">{item.category}</p>
                          <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                          <p className="text-sm text-slate-400">by {item.artist}</p>
                        </div>
                      </div>
                    </TiltCard>
                  </motion.div>
                )}
              </MouseParallax>
            ))}
          </HorizontalScroll>
        </FadeInView>
      )}

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6" onClick={() => setSelected(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative grid max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/95 shadow-soft lg:grid-cols-[minmax(0,1.35fr)_420px]" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => setSelected(null)} className="absolute right-5 top-5 z-10 rounded-full bg-slate-900/85 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">Close</button>
              <div className="flex min-h-[320px] items-center justify-center bg-black p-4 sm:p-6">
                <MediaPreview src={selected.image} alt={selected.title} title={selected.title} className="h-full max-h-[78vh] w-full rounded-[1.75rem]" mediaFit="contain" mediaClassName="h-full w-full" controls />
              </div>
              <div className="flex max-h-[90vh] flex-col overflow-y-auto border-t border-white/10 bg-slate-950/98 lg:border-l lg:border-t-0">
                <div className="border-b border-white/10 p-6 pr-24">
                  <p className="text-sm uppercase tracking-[0.24em] text-violet-300">{selected.category}</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">{selected.title}</h2>
                  <p className="mt-3 text-sm text-slate-400">by {selected.artist || selected.mentor || 'Unknown artist'}</p>
                </div>
                <div className="flex-1 space-y-6 p-6">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Description</p>
                    <p className="mt-2 leading-7 text-slate-300">{selected.details || 'No description added yet.'}</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-900/80 p-5 space-y-4">
                    <div><p className="text-sm uppercase tracking-[0.18em] text-slate-400">Artist</p><p className="mt-1 text-white">{selected.artist}</p></div>
                    <div><p className="text-sm uppercase tracking-[0.18em] text-slate-400">Medium</p><p className="mt-1 text-white">{selected.medium}</p></div>
                    <div><p className="text-sm uppercase tracking-[0.18em] text-slate-400">Mentor</p><p className="mt-1 text-white">{selected.mentor}</p></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Gallery;
