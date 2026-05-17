import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import GalleryCard from '../components/GalleryCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import MediaPreview from '../components/MediaPreview';
import { useGallery } from '../hooks/useData';

function Gallery() {
  const { gallery, loading } = useGallery();
  const [selected, setSelected] = useState(null);
  const categories = useMemo(() => ['All', ...new Set(gallery.map((item) => item.category))], [gallery]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!selected) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelected(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected]);

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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative grid max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/95 shadow-soft lg:grid-cols-[minmax(0,1.35fr)_420px]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute right-5 top-5 z-10 rounded-full bg-slate-900/85 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              Close
            </button>
            <div className="flex min-h-[320px] items-center justify-center bg-black p-4 sm:p-6">
              <MediaPreview
                src={selected.image}
                alt={selected.title}
                title={selected.title}
                className="h-full max-h-[78vh] w-full rounded-[1.75rem]"
                mediaFit="contain"
                mediaClassName="h-full w-full"
                controls
              />
            </div>
            <div className="flex max-h-[90vh] flex-col overflow-y-auto border-t border-white/10 bg-slate-950/98 lg:border-l lg:border-t-0">
              <div className="border-b border-white/10 p-6 pr-24">
                <p className="text-sm uppercase tracking-[0.24em] text-violet-300">{selected.category}</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">{selected.title}</h2>
                <p className="mt-3 text-sm text-slate-400">by {selected.artist || selected.mentor || 'Unknown artist'}</p>
              </div>
              <div className="flex-1 space-y-6 p-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Description</p>
                  <p className="mt-2 leading-7 text-slate-300">{selected.details || 'No description added yet.'}</p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-900/80 p-5">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Artist</p>
                    <p className="mt-1 text-white">{selected.artist}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Medium</p>
                    <p className="mt-1 text-white">{selected.medium}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Mentor</p>
                    <p className="mt-1 text-white">{selected.mentor}</p>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Gallery note</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    This layout keeps the full artwork visible on the left while the metadata stays readable on the right, similar to a desktop gallery viewer.
                  </p>
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
