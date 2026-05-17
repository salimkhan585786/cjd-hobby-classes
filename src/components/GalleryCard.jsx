import { motion } from 'framer-motion';
import MediaPreview from './MediaPreview';

function GalleryCard({ item, onOpen }) {
  return (
    <motion.article whileHover={{ y: -8 }} className="group overflow-hidden rounded-[1.8rem] bg-slate-900/80 shadow-soft">
      <button type="button" onClick={() => onOpen(item)} className="block w-full text-left">
        <div className="relative h-80 overflow-hidden">
          <MediaPreview
            src={item.image}
            alt={item.title}
            title={item.title}
            className="h-full w-full"
            mediaClassName="transition duration-500 group-hover:scale-105"
            showLink={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent opacity-90" />
          <div className="absolute inset-x-0 bottom-0 p-4">
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
