import { memo } from 'react';

function GalleryBackground({ className = '' }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* SVG noise texture */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.03]">
        <filter id="gallery-bg-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#gallery-bg-noise)" />
      </svg>

      {/* Wave layer 1 — base violet flow */}
      <div className="gallery-bg-wave-1 absolute inset-0">
        <svg viewBox="0 0 1440 800" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="gb-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.18)" />
              <stop offset="50%" stopColor="rgba(124, 58, 237, 0.12)" />
              <stop offset="100%" stopColor="rgba(167, 139, 250, 0.16)" />
            </linearGradient>
          </defs>
          <path
            d="M0,400 C180,320 360,480 540,400 C720,320 900,480 1080,400 C1260,320 1440,400 1440,400 L1440,800 L0,800 Z"
            fill="url(#gb-grad-1)"
          />
        </svg>
      </div>

      {/* Wave layer 2 — mid violet drift */}
      <div className="gallery-bg-wave-2 absolute inset-0">
        <svg viewBox="0 0 1440 800" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="gb-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(168, 85, 247, 0.14)" />
              <stop offset="50%" stopColor="rgba(147, 51, 234, 0.10)" />
              <stop offset="100%" stopColor="rgba(192, 132, 252, 0.12)" />
            </linearGradient>
          </defs>
          <path
            d="M0,380 C240,460 480,300 720,380 C960,460 1200,300 1440,380 L1440,800 L0,800 Z"
            fill="url(#gb-grad-2)"
          />
        </svg>
      </div>

      {/* Wave layer 3 — deep violet accent */}
      <div className="gallery-bg-wave-3 absolute inset-0">
        <svg viewBox="0 0 1440 800" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="gb-grad-3" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.10)" />
              <stop offset="100%" stopColor="rgba(124, 58, 237, 0.08)" />
            </linearGradient>
          </defs>
          <path
            d="M0,420 C360,340 720,500 1080,420 C1260,380 1380,440 1440,420 L1440,800 L0,800 Z"
            fill="url(#gb-grad-3)"
          />
        </svg>
      </div>

      {/* Ambient radial glow — centered, 2x scale */}
      <div className="gallery-bg-glow absolute inset-0" />
    </div>
  );
}

export default memo(GalleryBackground);
