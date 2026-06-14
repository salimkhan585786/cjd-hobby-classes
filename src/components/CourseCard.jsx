import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MediaPreview from './MediaPreview';
import { formatCurrency } from '../utils/helpers';

function CourseCard({
  course,
  actionLabel = 'Enroll',
  actionTo = '/register',
  onAction,
  actionDisabled = false,
  variant = 'violet',
}) {
  const detailsTo = `/courses/${encodeURIComponent(course.id || course.title)}`;

  const variantClasses = {
    violet: 'gradient-card-violet hover:glass-card-glow',
    fuchsia: 'gradient-card-fuchsia hover:glass-card-glow',
    cyan: 'gradient-card-cyan hover:glass-card-glow',
    pink: 'gradient-card-pink hover:glass-card-glow',
    default: 'gradient-card hover:glass-card-glow',
  };

  const cardClass = variantClasses[variant] || variantClasses.default;

  return (
    <motion.article
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`${cardClass} group overflow-hidden rounded-[2rem] border shadow-soft transition-all duration-300`}
    >
      <div className="relative h-64 overflow-hidden">
        <MediaPreview
          src={course.image}
          alt={course.title}
          title={course.title}
          className="h-full w-full"
          mediaClassName="transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between text-sm uppercase tracking-[0.24em] text-violet-300">
          <span>{course.level}</span>
          <span>{course.duration}</span>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-white">{course.title}</h3>
          <p className="mt-3 text-slate-400">{course.description}</p>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>{course.format}</span>
          <Link to={detailsTo} className="text-violet-300 transition hover:text-violet-200">
            View details <ArrowRight size={14} />
          </Link>
        </div>
        <div className="flex items-center justify-between pt-4">
          <span className="text-xl font-semibold text-white">{course.priceLabel || formatCurrency(course.price)}</span>
          {onAction ? (
            <button
              type="button"
              onClick={() => onAction(course)}
              disabled={actionDisabled}
              className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-4 py-3 text-sm text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-700"
            >
              {actionLabel} <ArrowRight size={16} />
            </button>
          ) : (
            <Link
              to={actionTo}
              className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-4 py-3 text-sm text-white transition hover:bg-violet-400"
            >
              {actionLabel} <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default CourseCard;
