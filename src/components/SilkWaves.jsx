import { memo } from 'react';

const waves = [
  { className: 'silk-wave-1', opacity: 0.12, color: 'rgba(139, 92, 246, 0.5)' },
  { className: 'silk-wave-2', opacity: 0.08, color: 'rgba(168, 85, 247, 0.4)' },
  { className: 'silk-wave-3', opacity: 0.06, color: 'rgba(192, 132, 252, 0.3)' },
];

function SilkWaves({ className = '' }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Noise texture */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.02]">
        <filter id="silk-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#silk-noise)" />
      </svg>

      {/* Animated wave layers */}
      {waves.map((wave, i) => (
        <div
          key={i}
          className={`absolute inset-0 ${wave.className}`}
          style={{ opacity: wave.opacity }}
        >
          <svg
            viewBox="0 0 1440 600"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              <linearGradient id={`silk-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={wave.color} />
                <stop offset="50%" stopColor="rgba(124, 58, 237, 0.3)" />
                <stop offset="100%" stopColor={wave.color} />
              </linearGradient>
            </defs>
            <path
              d={`M0,${300 + i * 40} C${360 + i * 50},${200 + i * 30} ${720 - i * 30},${400 - i * 20} 1440,${280 + i * 35} L1440,600 L0,600 Z`}
              fill={`url(#silk-grad-${i})`}
            />
          </svg>
        </div>
      ))}

      {/* Ambient gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/8 via-transparent to-purple-500/5 silk-ambient" />
    </div>
  );
}

export default memo(SilkWaves);
