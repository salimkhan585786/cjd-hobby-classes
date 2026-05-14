import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

const getNumericValue = (value) => {
  const raw = String(value || '');
  const suffix = raw.endsWith('+') ? '+' : '';
  const multiplier = raw.toLowerCase().includes('k') ? 1000 : 1;
  const number = Number.parseFloat(raw.replace(/[^\d.]/g, '')) || 0;

  return {
    target: number * multiplier,
    suffix,
    short: raw.toLowerCase().includes('k'),
  };
};

function StatCounter({ item }) {
  const [count, setCount] = useState(0);
  const config = useMemo(() => getNumericValue(item.value), [item.value]);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = config.target / steps;

    const timer = window.setInterval(() => {
      start += increment;
      if (start >= config.target) {
        setCount(config.target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [config.target]);

  const formatted = config.short
    ? `${(count / 1000).toFixed(count >= 1000 ? 1 : 0)}K${config.suffix}`
    : `${count}${config.suffix}`;

  return (
    <motion.div whileHover={{ y: -6 }} className="glass-card rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
      <p className="text-4xl font-semibold text-white">{formatted}</p>
      <p className="mt-2 text-sm uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
    </motion.div>
  );
}

export default StatCounter;
