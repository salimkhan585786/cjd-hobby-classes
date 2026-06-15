import { memo } from 'react';

const bars = [
  { left: '0%', width: '35%', delay: '0s', color: 'from-purple-900/40 via-violet-800/20 to-transparent' },
  { left: '25%', width: '30%', delay: '1.2s', color: 'from-fuchsia-900/30 via-purple-700/15 to-transparent' },
  { left: '50%', width: '35%', delay: '0.6s', color: 'from-violet-900/35 via-indigo-800/18 to-transparent' },
  { left: '65%', width: '30%', delay: '1.8s', color: 'from-purple-800/25 via-violet-600/12 to-transparent' },
  { left: '80%', width: '25%', delay: '0.3s', color: 'from-indigo-900/30 via-purple-900/15 to-transparent' },
];

function ShadowBars({ className = '' }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg className="absolute inset-0 h-full w-full opacity-[0.03]">
        <filter id="shadow-bars-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#shadow-bars-noise)" />
      </svg>

      {bars.map((bar, i) => (
        <div
          key={i}
          className={`absolute top-0 h-full bg-gradient-to-b ${bar.color} shadow-bar-sway`}
          style={{
            left: bar.left,
            width: bar.width,
            animationDelay: bar.delay,
            animationDuration: `${6 + i * 1.5}s`,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-purple-800/5 shadow-bar-pulse" />
    </div>
  );
}

export default memo(ShadowBars);
