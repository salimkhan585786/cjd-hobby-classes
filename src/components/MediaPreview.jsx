import { ExternalLink, Instagram, PlayCircle } from 'lucide-react';
import { classNames, getInstagramEmbedUrl, getMediaKind } from '../utils/helpers';

function MediaPreview({
  src,
  alt,
  className,
  mediaClassName,
  mediaFit = 'cover',
  title,
  controls = false,
  autoPlay = false,
  muted = true,
  loop = true,
  showLink = true,
}) {
  const mediaKind = getMediaKind(src);
  const embedUrl = getInstagramEmbedUrl(src);

  if (mediaKind === 'instagram' && embedUrl) {
    return (
      <div className={classNames('relative overflow-hidden bg-slate-950', className)}>
        <iframe
          title={title || alt || 'Instagram post'}
          src={embedUrl}
          className={classNames('h-full w-full border-0 bg-white', mediaClassName)}
          allowTransparency
          allowFullScreen
        />
        {showLink ? (
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-slate-950/85 px-3 py-2 text-xs font-semibold text-white shadow-soft backdrop-blur"
          >
            <Instagram size={14} />
            View on Instagram
          </a>
        ) : null}
      </div>
    );
  }

  if (mediaKind === 'video') {
    return (
      <div className={classNames('relative overflow-hidden bg-slate-950', className)}>
        <video
          src={src}
          className={classNames('h-full w-full object-cover', mediaClassName)}
          controls={controls}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
        />
        {!controls ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/20">
            <PlayCircle size={48} className="text-white/90" />
          </div>
        ) : null}
      </div>
    );
  }

  if (mediaKind === 'image') {
    return (
      <div className={classNames('relative overflow-hidden bg-slate-950', className)}>
        <img
          src={src}
          alt={alt}
          className={classNames(`h-full w-full ${mediaFit === 'contain' ? 'object-contain' : 'object-cover'}`, mediaClassName)}
        />
      </div>
    );
  }

  return (
    <div className={classNames('flex h-full min-h-40 items-center justify-center rounded-[1.5rem] bg-slate-900/80 p-6 text-center', className)}>
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Media pending</p>
        <p className="text-sm text-slate-400">Add an image URL, video URL, or Instagram post/reel link.</p>
        {showLink && src ? (
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
          >
            Open media <ExternalLink size={14} />
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default MediaPreview;
