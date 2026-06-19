import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CalendarDays, Share2, Users, ZoomIn, ZoomOut, X } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import MediaPreview from '../components/MediaPreview';
import { useWorkshops } from '../hooks/useData';
import { calculateCountdown, formatCurrency, formatDate } from '../utils/helpers';
import { FadeInView } from '../components/Animation';

function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { workshops, loading } = useWorkshops();

  const event = useMemo(
    () => workshops.find((w) => w.id === eventId) || null,
    [workshops, eventId]
  );

  const isUpcoming = event ? new Date(event.date).getTime() > Date.now() : false;

  const [countdown, setCountdown] = useState(() =>
    event && isUpcoming ? calculateCountdown(event.date) : { days: 0, hours: 0, minutes: 0, seconds: 0, completed: true }
  );
  const [imageModal, setImageModal] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!event || !isUpcoming) return undefined;

    const updateCountdown = () => {
      setCountdown(calculateCountdown(event.date));
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [event, isUpcoming]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: event?.title || 'Event', url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Event link copied to clipboard!');
      }
    } catch {
      // user cancelled or clipboard failed
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
        <LoadingSkeleton className="h-[500px]" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-16 text-center">
        <FadeInView>
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Event not found</p>
          <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">This event doesn&apos;t exist or has been removed.</h1>
          <Link to="/events" className="mt-8 inline-flex items-center gap-2 rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
            <ArrowLeft size={16} /> Back to events
          </Link>
        </FadeInView>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
      <FadeInView>
        <div className="mb-6">
          <Link to="/events" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
            <ArrowLeft size={16} /> Back to events
          </Link>
        </div>

        <div className="glass-card overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/90 shadow-soft">
          {event.image && (
            <div className="overflow-hidden cursor-pointer" onClick={() => { setImageModal(true); setZoom(1); }}>
              <MediaPreview
                src={event.image}
                alt={event.title}
                title={event.title}
                className="h-64 sm:h-80 w-full transition hover:scale-105"
              />
            </div>
          )}

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-3 py-1.5 text-xs text-violet-200 border border-violet-500/20">
                <CalendarDays size={14} /> {formatDate(event.date, { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300 border border-white/10">
                {event.mode}
              </span>
              <span className="text-sm font-semibold text-white">{formatCurrency(event.price)}</span>
            </div>

            <h1 className="text-3xl font-semibold text-white sm:text-4xl">{event.title}</h1>

            <p className="mt-4 text-base text-slate-400 sm:text-lg leading-7">{event.description}</p>

            <div className="mt-6 flex items-center gap-2 text-sm text-slate-300">
              <Users size={16} /> {event.seats} seats left
            </div>

            {isUpcoming && !countdown.completed && (
              <div className="mt-8 rounded-2xl bg-slate-900/80 p-4 sm:p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-violet-300 mb-3">Event will be held in</p>
                <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center text-white">
                  {[
                    { label: 'Days', value: countdown.days },
                    { label: 'Hours', value: countdown.hours },
                    { label: 'Mins', value: countdown.minutes },
                    { label: 'Secs', value: countdown.seconds },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-xl bg-slate-950/80 px-2 py-3 sm:px-3 sm:py-4"
                    >
                      <p className="text-xl font-semibold sm:text-2xl">{String(item.value).padStart(2, '0')}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-400 sm:text-xs">{item.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {isUpcoming && (
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/contact?topic=event" className="rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
                  Enquire now
                </Link>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm text-slate-200 transition hover:bg-white/5"
                >
                  <Share2 size={16} /> Share event
                </button>
              </div>
            )}

            {!isUpcoming && (
              <div className="mt-8 rounded-2xl bg-slate-900/80 p-4 text-center">
                <p className="text-sm text-slate-400">This event has already ended.</p>
                <Link to="/events" className="mt-3 inline-flex items-center gap-2 text-sm text-violet-300 transition hover:text-violet-200">
                  Browse upcoming events <ArrowLeft size={14} className="rotate-180" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </FadeInView>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {imageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 sm:p-6"
            onClick={() => setImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-slate-900/80 px-5 py-3">
                <p className="text-sm text-slate-300 truncate">{event.title}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <ZoomOut size={18} />
                  </button>
                  <span className="min-w-[3rem] text-center text-xs text-slate-400">{Math.round(zoom * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(z + 0.25, 5))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <ZoomIn size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageModal(false)}
                    className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-500 text-white transition hover:bg-violet-400"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="overflow-auto max-h-[80vh] flex items-center justify-center p-2">
                <img
                  src={event.image}
                  alt={event.title}
                  className="transition-transform duration-200 select-none"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                  draggable={false}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EventDetail;
