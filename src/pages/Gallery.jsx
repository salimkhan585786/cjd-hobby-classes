import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import GalleryCard from '../components/GalleryCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useGallery } from '../hooks/useData';
import { FadeInView, ParallaxSection, StaggerContainer, StaggerItem, TiltCard, ZoomParallax, HorizontalScroll, MouseParallax } from '../components/Animation';
import GalleryCollage from '../components/GalleryCollage';

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

function Gallery() {
  const { gallery, loading } = useGallery();
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const imageContainerRef = useRef(null);
  const categories = useMemo(() => ['All', ...new Set(gallery.map((item) => item.category))], [gallery]);
  const [filter, setFilter] = useState('All');

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, ZOOM_MAX));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, ZOOM_MIN));
  }, []);

  const handleOpen = useCallback((item) => {
    setSelected(item);
    resetZoom();
  }, [resetZoom]);

  const handleClose = useCallback(() => {
    setSelected(null);
    resetZoom();
  }, [resetZoom]);

  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((prev) => Math.min(Math.max(prev + delta, ZOOM_MIN), ZOOM_MAX));
    }
  }, []);

  const handlePointerDown = useCallback((e) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { ...position };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [zoom, position]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPosition({ x: posStart.current.x + dx, y: posStart.current.y + dy });
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (zoom > 1) {
      resetZoom();
    } else {
      setZoom(2);
    }
  }, [zoom, resetZoom]);

  useEffect(() => {
    if (!selected) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
      if (e.key === '0') resetZoom();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, handleClose, zoomIn, zoomOut, resetZoom]);

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
                        <GalleryCard item={item} onOpen={handleOpen} />
                      </TiltCard>
                    </ZoomParallax>
                  </StaggerItem>
                ))}
              </div>
            ))}
          </div>
        )}
      </ParallaxSection>

    

      {/* ── PARALLAX COLLAGE ── */}
      <div className="mt-20">
        <GalleryCollage />
      </div>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-3 sm:p-6"
            onClick={handleClose}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-3 top-3 z-20 rounded-full bg-slate-900/90 p-2 text-slate-300 backdrop-blur-sm transition hover:bg-slate-800 hover:text-white sm:right-5 sm:top-5 sm:p-3"
            >
              <X size={20} />
            </button>

            {/* Zoom controls */}
            <div className="absolute left-3 top-3 z-20 flex gap-2 sm:left-5 sm:top-5">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                disabled={zoom >= ZOOM_MAX}
                className="rounded-full bg-slate-900/90 p-2 text-slate-300 backdrop-blur-sm transition hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed sm:p-3"
                title="Zoom in (+)"
              >
                <ZoomIn size={20} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                disabled={zoom <= ZOOM_MIN}
                className="rounded-full bg-slate-900/90 p-2 text-slate-300 backdrop-blur-sm transition hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed sm:p-3"
                title="Zoom out (-)"
              >
                <ZoomOut size={20} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); resetZoom(); }}
                disabled={zoom === 1}
                className="rounded-full bg-slate-900/90 p-2 text-slate-300 backdrop-blur-sm transition hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed sm:p-3"
                title="Reset zoom (0)"
              >
                <RotateCcw size={20} />
              </button>
              <span className="hidden items-center rounded-full bg-slate-900/90 px-3 py-2 text-xs text-slate-400 backdrop-blur-sm sm:flex">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-soft sm:rounded-[2.5rem] lg:max-h-[90vh] lg:flex-row lg:grid-cols-[minmax(0,1.35fr)_420px]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image panel with zoom */}
              <div
                ref={imageContainerRef}
                className="relative flex min-h-[250px] items-center justify-center overflow-hidden bg-black sm:min-h-[320px] lg:min-h-0"
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onDoubleClick={handleDoubleClick}
                style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
              >
                <img
                  src={selected.image}
                  alt={selected.title}
                  className="select-none rounded-none object-contain transition-transform duration-200 ease-out"
                  style={{
                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                  }}
                  draggable={false}
                />
              </div>

              {/* Details panel */}
              <div className="flex max-h-[40vh] flex-col overflow-y-auto border-t border-white/10 bg-slate-950/98 sm:max-h-[35vh] lg:max-h-none lg:border-l lg:border-t-0">
                <div className="border-b border-white/10 p-5 pr-16 sm:p-6 sm:pr-24">
                  <p className="text-sm uppercase tracking-[0.24em] text-violet-300">{selected.category}</p>
                  <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">{selected.title}</h2>
                  <p className="mt-2 text-sm text-slate-400 sm:mt-3">by {selected.artist || selected.mentor || 'Unknown artist'}</p>
                </div>
                <div className="flex-1 space-y-4 p-5 sm:space-y-6 sm:p-6">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Description</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">{selected.details || 'No description added yet.'}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-slate-900/80 p-4 space-y-3 sm:rounded-[1.5rem] sm:p-5 sm:space-y-4">
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
