import { motion } from 'framer-motion';
import { CalendarDays, Share2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import MediaPreview from './MediaPreview';
import { formatCurrency, formatDate } from '../utils/helpers';

function EventCard({
  event,
  actionTo = '/contact?topic=event',
  actionLabel = 'Enquiry',
  onAction,
  actionDisabled = false,
  variant = 'violet',
  showShare = true,
}) {
  const variantClasses = {
    violet: 'gradient-card-violet hover:glass-card-glow',
    fuchsia: 'gradient-card-fuchsia hover:glass-card-glow',
    cyan: 'gradient-card-cyan hover:glass-card-glow',
    pink: 'gradient-card-pink hover:glass-card-glow',
    default: 'gradient-card hover:glass-card-glow',
  };

  const cardClass = variantClasses[variant] || variantClasses.default;

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/events/${event.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Event link copied to clipboard!');
      }
    } catch {
      // user cancelled or clipboard failed
    }
  };

  return (
    <motion.article
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`${cardClass} overflow-hidden rounded-[2rem] border p-4 sm:p-5 md:p-6 shadow-soft transition-all duration-300`}
    >
      <Link to={`/events/${event.id}`} className="block">
        <div className="mb-4 sm:mb-5 overflow-hidden rounded-[1.5rem]">
          <MediaPreview
            src={event.image}
            alt={event.title}
            title={event.title}
            className="h-40 sm:h-48 md:h-56 w-full transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-2.5 py-1.5 text-xs text-violet-200 border border-violet-500/20 sm:px-3 sm:py-2 sm:text-sm">
            <CalendarDays size={14} sm:size={16} /> {formatDate(event.date, { month: 'short', day: 'numeric' })}
          </span>
          <span className="text-xs font-semibold text-white sm:text-sm">{formatCurrency(event.price)}</span>
        </div>
        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <h3 className="text-xl font-semibold text-white sm:text-2xl">{event.title}</h3>
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300 border border-white/10 sm:px-3 sm:py-1.5 sm:text-xs">
              {event.mode}
            </span>
          </div>
          <p className="text-sm text-slate-400 sm:text-base">{event.description}</p>
        </div>
      </Link>
      <div className="mt-4 sm:mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-300 sm:text-sm">
          <Users size={14} sm:size={16} /> {event.seats} seats left
        </div>
        <div className="flex items-center gap-2">
          {showShare && (
            <button
              type="button"
              onClick={handleShare}
              className="relative z-10 rounded-full border border-white/10 p-2.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              title="Share event"
            >
              <Share2 size={14} sm:size={16} />
            </button>
          )}
          <Link to="/contact?topic=event" className="relative z-10 rounded-full bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-400 sm:px-5 sm:py-3 sm:text-sm">
            {actionLabel}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default EventCard;
