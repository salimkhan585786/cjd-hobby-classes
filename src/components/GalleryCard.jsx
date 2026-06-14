import { motion } from 'framer-motion';
import MediaPreview from './MediaPreview';

function GalleryCard({ item, onOpen, variant = 'violet' }) {
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
      whileHover={{ y: -10, scale: 1.015 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`${cardClass} group overflow-hidden rounded-[1.8rem] shadow-soft transition-all duration-300`}
    >
      <button type="button" onClick={() => onOpen(item)} className="block w-full text-left">
        <div className="relative h-80 overflow-hidden">
          <MediaPreview
            src={item.image}
            alt={item.title}
            title={item.title}
            className="h-full w-full"
            mediaClassName="transition duration-700 group-hover:scale-110"
            showLink={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-violet-200 [text-shadow:0_2px_10px_rgba(0,0,0,0.95)]">{item.category}</p>
            <h3 className="mt-2 text-xl font-semibold text-white [text-shadow:0_4px_18px_rgba(0,0,0,1)]">{item.title}</h3>
            <p className="text-sm text-slate-100 [text-shadow:0_3px_12px_rgba(0,0,0,0.95)]">by {item.artist}</p>
            <p className="mt-2 text-xs text-slate-200 [text-shadow:0_2px_10px_rgba(0,0,0,0.95)]">{item.medium}</p>
          </div>
        </div>
      </button>
    </motion.article>
  );
}

export default GalleryCard;
