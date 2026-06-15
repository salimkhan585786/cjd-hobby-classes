import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGalleryCollage } from '../hooks/useData';
import GalleryBackground from './GalleryBackground';

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;
const BATCH_SIZE = 8;

const VISUAL_VARIANTS = [
  { colSpan: 'col-span-1', rowSpan: 'row-span-2', height: 'h-[180px] md:h-[420px]', rotate: 'md:-rotate-2', speed: 0.15, tape: true },
  { colSpan: 'col-span-2', rowSpan: 'row-span-1', height: 'h-[140px] md:h-[260px]', rotate: 'md:rotate-1', speed: 0.25, tape: false },
  { colSpan: 'col-span-1', rowSpan: 'row-span-1', height: 'h-[150px] md:h-[280px]', rotate: 'md:rotate-3', speed: 0.1, tape: true },
  { colSpan: 'col-span-1', rowSpan: 'row-span-2', height: 'h-[180px] md:h-[400px]', rotate: 'md:-rotate-1', speed: 0.35, tape: false },
  { colSpan: 'col-span-2', rowSpan: 'row-span-1', height: 'h-[150px] md:h-[280px]', rotate: 'md:rotate-2', speed: 0.2, tape: true },
  { colSpan: 'col-span-1', rowSpan: 'row-span-1', height: 'h-[150px] md:h-[300px]', rotate: 'md:-rotate-3', speed: 0.3, tape: false },
  { colSpan: 'col-span-2', rowSpan: 'row-span-1', height: 'h-[140px] md:h-[260px]', rotate: 'md:rotate-1', speed: 0.18, tape: true },
  { colSpan: 'col-span-1', rowSpan: 'row-span-2', height: 'h-[180px] md:h-[420px]', rotate: 'md:-rotate-2', speed: 0.4, tape: false },
  { colSpan: 'col-span-1', rowSpan: 'row-span-1', height: 'h-[150px] md:h-[280px]', rotate: 'md:rotate-2', speed: 0.12, tape: true },
  { colSpan: 'col-span-2', rowSpan: 'row-span-1', height: 'h-[150px] md:h-[280px]', rotate: 'md:-rotate-1', speed: 0.28, tape: false },
  { colSpan: 'col-span-1', rowSpan: 'row-span-1', height: 'h-[150px] md:h-[300px]', rotate: 'md:rotate-3', speed: 0.22, tape: true },
  { colSpan: 'col-span-1', rowSpan: 'row-span-2', height: 'h-[180px] md:h-[400px]', rotate: 'md:-rotate-2', speed: 0.32, tape: false },
];

function CollageCard({ item, index, onOpen }) {
  const cardRef = useRef(null);
  const v = VISUAL_VARIANTS[index % VISUAL_VARIANTS.length];

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const viewH = window.innerHeight;
          const progress = (viewH - rect.top) / (viewH + rect.height);
          const offset = (progress - 0.5) * 100 * v.speed;
          el.style.transform = `translateY(${offset}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [v.speed]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: (index % BATCH_SIZE) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onOpen(item)}
      className={`${v.colSpan} ${v.rowSpan} ${v.rotate} group relative cursor-pointer overflow-hidden rounded-sm border-4 border-white shadow-xl hover:scale-105 transition-transform duration-300`}
    >
      <div className={`${v.height} overflow-hidden`}>
        <img
          src={item.src}
          alt={item.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      {v.tape && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-6 w-14 bg-yellow-200 opacity-60 rotate-45 rounded-sm" />
      )}
    </motion.div>
  );
}

function GalleryCollage({ limit }) {
  const { galleryCollage, loading } = useGalleryCollage();
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const sentinelRef = useRef(null);

  const isLimited = typeof limit === 'number';
  const sourceItems = isLimited ? galleryCollage.slice(0, limit) : galleryCollage;
  const visibleItems = isLimited ? sourceItems : sourceItems.slice(0, visibleCount);
  const hasMore = !isLimited && visibleCount < sourceItems.length;

  useEffect(() => {
    if (isLimited || !hasMore || !sentinelRef.current) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, galleryCollage.length));
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isLimited, hasMore, galleryCollage.length]);

  useEffect(() => {
    if (!isLimited) setVisibleCount(BATCH_SIZE);
  }, [isLimited, galleryCollage.length]);

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
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

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
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setZoom(2);
    }
  }, [zoom]);

  useEffect(() => {
    if (!selected) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
      if (e.key === '0') { setZoom(1); setPosition({ x: 0, y: 0 }); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, handleClose, zoomIn, zoomOut]);

  if (loading || galleryCollage.length === 0) return null;

  return (
    <>
      <section className="relative rounded-[3rem] bg-slate-950 overflow-hidden py-6 sm:py-10 md:py-16 px-4 sm:px-6 lg:px-10 xl:px-14">
        <GalleryBackground />
        <div className="relative mx-auto max-w-7xl space-y-6 sm:space-y-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-violet-300 sm:text-sm">Gallery</p>
              <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl md:text-4xl">Student work that feels exhibition-ready.</h2>
            </div>
            {isLimited && (
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 sm:px-5 sm:py-3 sm:text-sm"
              >
                View Gallery <ArrowRight size={14} sm:size={16} />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-5 auto-rows-auto">
            {visibleItems.map((item, index) => (
              <CollageCard key={item.id} item={item} index={index} onOpen={handleOpen} />
            ))}
          </div>

          {hasMore && <div ref={sentinelRef} className="h-10" />}
        </div>
      </section>

      {/* ── IMAGE MODAL ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6"
            onClick={handleClose}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-3 top-3 z-20 rounded-full bg-black/70 p-2 text-white backdrop-blur-sm transition hover:bg-black/90 sm:right-5 sm:top-5 sm:p-3"
            >
              <X size={20} />
            </button>

            <div className="absolute left-3 top-3 z-20 flex gap-2 sm:left-5 sm:top-5">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                disabled={zoom >= ZOOM_MAX}
                className="rounded-full bg-black/70 p-2 text-white backdrop-blur-sm transition hover:bg-black/90 disabled:opacity-40 disabled:cursor-not-allowed sm:p-3"
                title="Zoom in (+)"
              >
                <ZoomIn size={20} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                disabled={zoom <= ZOOM_MIN}
                className="rounded-full bg-black/70 p-2 text-white backdrop-blur-sm transition hover:bg-black/90 disabled:opacity-40 disabled:cursor-not-allowed sm:p-3"
                title="Zoom out (-)"
              >
                <ZoomOut size={20} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); resetZoom(); }}
                disabled={zoom === 1}
                className="rounded-full bg-black/70 p-2 text-white backdrop-blur-sm transition hover:bg-black/90 disabled:opacity-40 disabled:cursor-not-allowed sm:p-3"
                title="Reset zoom (0)"
              >
                <RotateCcw size={20} />
              </button>
              <span className="hidden items-center rounded-full bg-black/70 px-3 py-2 text-xs text-white/70 backdrop-blur-sm sm:flex">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex max-h-[90vh] max-w-[95vw] items-center justify-center overflow-hidden sm:max-h-[85vh] sm:max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onDoubleClick={handleDoubleClick}
              style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
            >
              <img
                src={selected.src}
                alt={selected.alt}
                className="select-none object-contain transition-transform duration-200 ease-out"
                style={{
                  transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                  maxWidth: '100%',
                  maxHeight: '90vh',
                }}
                draggable={false}
              />
            </motion.div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm text-white/80 backdrop-blur-sm sm:bottom-6">
              {selected.alt}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default GalleryCollage;
