import { useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import GalleryCard from '../components/GalleryCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useGallery } from '../hooks/useData';

function Gallery() {
  const { gallery, loading } = useGallery();
  const [selected, setSelected] = useState(null);
  const categories = useMemo(() => ['All', ...new Set(gallery.map((item) => item.category))], [gallery]);
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(
    () => (filter === 'All' ? gallery : gallery.filter((item) => item.category === filter)),
    [filter, gallery]
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-14">
      <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Student gallery</p>
          <h1 className="mt-3 text-5xl font-semibold text-white">A colorful gallery of student achievements.</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              className={`rounded-full px-4 py-3 text-sm font-medium transition ${
                filter === category ? 'bg-violet-500 text-white' : 'bg-slate-900/80 text-slate-300 hover:bg-white/5'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-80" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No artwork yet" description="This category will fill up as soon as the next batch uploads showcase pieces." />
      ) : (
        <div className="masonry-3col space-y-6 sm:masonry-2col lg:masonry-3col">
          <div className="break-inside-avoid space-y-6">
            {filtered.filter((_, index) => index % 3 === 0).map((item) => (
              <GalleryCard key={item.id} item={item} onOpen={setSelected} />
            ))}
          </div>
          <div className="break-inside-avoid space-y-6">
            {filtered.filter((_, index) => index % 3 === 1).map((item) => (
              <GalleryCard key={item.id} item={item} onOpen={setSelected} />
            ))}
          </div>
          <div className="break-inside-avoid space-y-6">
            {filtered.filter((_, index) => index % 3 === 2).map((item) => (
              <GalleryCard key={item.id} item={item} onOpen={setSelected} />
            ))}
          </div>
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6">
          <div className="relative max-h-[90vh] max-w-4xl overflow-auto rounded-[2.5rem] border border-white/10 bg-slate-950/95 shadow-soft">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute right-5 top-5 rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              Close
            </button>
            <img src={selected.image} alt={selected.title} className="h-[420px] w-full object-cover" />
            <div className="grid gap-6 p-8 md:grid-cols-[1fr_0.8fr]">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.24em] text-violet-300">{selected.category}</p>
                <h2 className="text-3xl font-semibold text-white">{selected.title}</h2>
                <p className="text-slate-300">{selected.details}</p>
              </div>
              <div className="space-y-4 rounded-[2rem] bg-slate-900/80 p-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Artist</p>
                  <p className="mt-1 text-white">{selected.artist}</p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Medium</p>
                  <p className="mt-1 text-white">{selected.medium}</p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Mentor</p>
                  <p className="mt-1 text-white">{selected.mentor}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Gallery;
