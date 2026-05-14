import { motion } from 'framer-motion';

function GalleryCard({ item, onOpen }) {
  return (
    <motion.article whileHover={{ y: -8 }} className="group overflow-hidden rounded-[1.8rem] bg-slate-900/80 shadow-soft">
      <button type="button" onClick={() => onOpen(item)} className="block w-full text-left">
        <div className="relative h-80 overflow-hidden">
          <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent p-4">
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">{item.category}</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
            <p className="text-sm text-slate-300">by {item.artist}</p>
            <p className="mt-2 text-xs text-slate-400">{item.medium}</p>
          </div>
        </div>
      </button>
    </motion.article>
  );
}

export default GalleryCard;
