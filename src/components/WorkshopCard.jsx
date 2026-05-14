import { motion } from 'framer-motion';
import { CalendarDays, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/helpers';

function WorkshopCard({ workshop, actionTo = '/contact?topic=workshop', actionLabel = 'Register' }) {
  return (
    <motion.article whileHover={{ y: -6 }} className="glass-card overflow-hidden rounded-[2rem] border border-white/10 p-6 shadow-soft">
      <div className="flex items-center justify-between text-slate-300">
        <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-2 text-sm text-violet-200">
          <CalendarDays size={16} /> {formatDate(workshop.date, { month: 'short', day: 'numeric' })}
        </span>
        <span className="text-sm font-semibold text-white">{formatCurrency(workshop.price)}</span>
      </div>
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-2xl font-semibold text-white">{workshop.title}</h3>
          <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-slate-300">
            {workshop.mode}
          </span>
        </div>
        <p className="text-slate-400">{workshop.description}</p>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Users size={16} /> {workshop.seats} seats left
        </div>
        <Link to={actionTo} className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
          {actionLabel}
        </Link>
      </div>
    </motion.article>
  );
}

export default WorkshopCard;
