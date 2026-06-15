import { motion } from 'framer-motion';
import { memo } from 'react';

function StaggeredText({
  text = '',
  as: Tag = 'h1',
  className = '',
  segmentBy = 'words',
  delay = 80,
  duration = 0.6,
  direction = 'top',
  blur = true,
  staggerDirection = 'forward',
  threshold = 0.1,
}) {
  const segments = segmentBy === 'chars'
    ? text.split('')
    : text.split(/\s+/).filter(Boolean);

  const dirMap = {
    top: { y: 30, x: 0 },
    bottom: { y: -30, x: 0 },
    left: { y: 0, x: 30 },
    right: { y: 0, x: -30 },
  };
  const dir = dirMap[direction] || dirMap.top;

  const getDelay = (i) => {
    if (staggerDirection === 'reverse') {
      return (segments.length - 1 - i) * (delay / 1000);
    }
    if (staggerDirection === 'center') {
      const center = Math.floor(segments.length / 2);
      return Math.abs(center - i) * (delay / 1000);
    }
    return i * (delay / 1000);
  };

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: delay / 1000 },
    },
  };

  const child = {
    hidden: {
      opacity: 0,
      y: dir.y,
      x: dir.x,
      filter: blur ? 'blur(8px)' : 'blur(0px)',
    },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      x: 0,
      filter: blur ? 'blur(0px)' : 'blur(0px)',
      transition: {
        duration,
        delay: getDelay(i),
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      variants={container}
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', gap: segmentBy === 'words' ? '0.35em' : '0' }}
    >
      {segments.map((seg, i) => (
        <motion.span
          key={`${seg}-${i}`}
          variants={child}
          custom={i}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {seg}
        </motion.span>
      ))}
    </motion.div>
  );
}

export default memo(StaggeredText);
