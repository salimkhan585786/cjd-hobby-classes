import { useRef, useCallback, memo } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

const EASE_SMOOTH = [0.22, 1, 0.36, 1];
const SPRING_SMOOTH = { stiffness: 200, damping: 28, mass: 0.6 };
const SPRING_SNAPPY = { stiffness: 300, damping: 30, mass: 0.5 };

/* ─────────────────────────────────────────────
   1. Scroll Parallax (basic scroll-based movement)
   ───────────────────────────────────────────── */
export const ParallaxSection = memo(function ParallaxSection({ children, className = '', speed = 0.3, direction = 'up' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const isHorizontal = direction === 'left' || direction === 'right';
  const multiplier = direction === 'down' || direction === 'right' ? -1 : 1;
  const distance = isHorizontal ? 80 * speed : 100 * speed;

  const y = useTransform(scrollYProgress, [0, 1], isHorizontal ? [0, 0] : [distance * multiplier, -distance * multiplier]);
  const x = useTransform(scrollYProgress, [0, 1], isHorizontal ? [-distance * multiplier, distance * multiplier] : [0, 0]);

  return (
    <motion.div ref={ref} style={{ y, x, willChange: 'transform' }} className={className}>
      {children}
    </motion.div>
  );
});

/* ─────────────────────────────────────────────
   2. Mouse Parallax
   Elements shift based on cursor position
   ───────────────────────────────────────────── */
export const MouseParallax = memo(function MouseParallax({ children, className = '', intensity = 20 }) {
  const ref = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_SMOOTH);
  const y = useSpring(rawY, SPRING_SMOOTH);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    rawX.set(nx * intensity);
    rawY.set(ny * intensity);
  }, [rawX, rawY, intensity]);

  const handleMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  if (typeof children === 'function') {
    return (
      <div ref={ref} className={className} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        {children({ x, y })}
      </div>
    );
  }

  return (
    <div ref={ref} className={className} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <motion.div style={{ x, y, willChange: 'transform' }}>{children}</motion.div>
    </div>
  );
});

/* ─────────────────────────────────────────────
   3. 3D Layered Parallax
   Container + child layers move at different depths
   ───────────────────────────────────────────── */
export const LayeredParallax = memo(function LayeredParallax({ children, className = '' }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}>
      {children}
    </div>
  );
});

export const ParallaxLayer = memo(function ParallaxLayer({ children, depth = 0.5, className = '' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const translateZ = depth * 200;
  const y = useTransform(scrollYProgress, [0, 1], [120 * depth, -120 * depth]);
  const scale = 1 + depth * 0.08;

  return (
    <motion.div
      ref={ref}
      style={{
        y,
        transform: `translateZ(${translateZ}px) scale(${scale})`,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

/* ─────────────────────────────────────────────
   4. Zoom Parallax
   Elements scale up/down on scroll
   ───────────────────────────────────────────── */
export const ZoomParallax = memo(function ZoomParallax({ children, className = '', scaleRange = [0.94, 1.03] }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [scaleRange[0], 1, 1, scaleRange[1]]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6]);

  return (
    <motion.div ref={ref} style={{ scale, opacity, willChange: 'transform, opacity' }} className={className}>
      {children}
    </motion.div>
  );
});

/* ─────────────────────────────────────────────
   5. Fade-In Parallax
   Background shifts slowly, content fades in/out
   ───────────────────────────────────────────── */
export const FadeInParallax = memo(function FadeInParallax({ children, background, className = '', bgSpeed = 0.15 }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [-100 * bgSpeed, 100 * bgSpeed]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [60, 0, 0, -60]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {background && (
        <motion.div style={{ y: bgY, willChange: 'transform' }} className="absolute inset-0 -z-10">
          {background}
        </motion.div>
      )}
      <motion.div style={{ opacity: contentOpacity, y: contentY, willChange: 'transform, opacity' }} className="relative z-10">
        {children}
      </motion.div>
    </div>
  );
});

/* ─────────────────────────────────────────────
   6. Rotate Parallax
   Elements tilt/rotate on scroll axis
   ───────────────────────────────────────────── */
export const RotateParallax = memo(function RotateParallax({ children, className = '', rotateRange = [-5, 5], axis = 'y' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], axis === 'x' || axis === 'both' ? rotateRange : [0, 0]);
  const rotateY = useTransform(scrollYProgress, [0, 1], axis === 'y' || axis === 'both' ? rotateRange : [0, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', willChange: 'transform' }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

/* ─────────────────────────────────────────────
   7. Horizontal Scroll
   Vertical scroll converts to horizontal motion
   ───────────────────────────────────────────── */
export const HorizontalScroll = memo(function HorizontalScroll({ children, className = '' }) {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);

  return (
    <div ref={targetRef} className={`relative h-[200vh] ${className}`}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x, willChange: 'transform' }} className="flex gap-8 pl-8">
          {children}
        </motion.div>
      </div>
    </div>
  );
});

/* ─────────────────────────────────────────────
   8. FadeInView (scroll-triggered entrance)
   ───────────────────────────────────────────── */
export const FadeInView = memo(function FadeInView({ children, className = '', delay = 0, direction = 'up' }) {
  const offset = { up: { y: 50, x: 0 }, down: { y: -50, x: 0 }, left: { y: 0, x: 50 }, right: { y: 0, x: -50 } };
  const o = offset[direction] || offset.up;

  return (
    <motion.div
      initial={{ opacity: 0, y: o.y, x: o.x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay, ease: EASE_SMOOTH }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

/* ─────────────────────────────────────────────
   9. Stagger Container & Item
   ───────────────────────────────────────────── */
export const StaggerContainer = memo(function StaggerContainer({ children, className = '', staggerDelay = 0.08 }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={{ visible: { transition: { staggerChildren: staggerDelay } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

export const StaggerItem = memo(function StaggerItem({ children, className = '' }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_SMOOTH } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

/* ─────────────────────────────────────────────
   10. ScaleOnScroll
   ───────────────────────────────────────────── */
export const ScaleOnScroll = memo(function ScaleOnScroll({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay, ease: EASE_SMOOTH }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

/* ─────────────────────────────────────────────
   11. FloatingElement (continuous bob)
   ───────────────────────────────────────────── */
export const FloatingElement = memo(function FloatingElement({ children, className = '', amplitude = 10, duration = 4 }) {
  return (
    <motion.div
      animate={{ y: [amplitude, -amplitude, amplitude] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

/* ─────────────────────────────────────────────
   12. ParallaxImage (scroll-based image shift)
   ───────────────────────────────────────────── */
export const ParallaxImage = memo(function ParallaxImage({ src, alt, className = '', speed = 0.15 }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-40 * speed, 40 * speed]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1, 1.05]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale, willChange: 'transform' }}
        className="h-full w-full object-cover"
      />
    </div>
  );
});

/* ─────────────────────────────────────────────
   13. TiltCard (mouse-based 3D tilt)
   ───────────────────────────────────────────── */
export const TiltCard = memo(function TiltCard({ children, className = '', tiltAmount = 6 }) {
  const ref = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [tiltAmount, -tiltAmount]), SPRING_SNAPPY);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-tiltAmount, tiltAmount]), SPRING_SNAPPY);
  const glare = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 0.12]), SPRING_SNAPPY);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', willChange: 'transform' }}
      className={className}
    >
      <motion.div style={{ opacity: glare }} className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] bg-gradient-to-br from-white/10 to-transparent" />
      {children}
    </motion.div>
  );
});

/* ─────────────────────────────────────────────
   14. ScrollProgress (top bar)
   ───────────────────────────────────────────── */
export const ScrollProgress = memo(function ScrollProgress({ className = '' }) {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{ scaleX: scrollYProgress, willChange: 'transform' }}
      className={`fixed left-0 right-0 top-0 z-[9999] h-[3px] origin-left bg-violet-500 ${className}`}
    />
  );
});

/* ─────────────────────────────────────────────
   15. MagneticButton
   ───────────────────────────────────────────── */
export const MagneticButton = memo(function MagneticButton({ children, className = '', strength = 0.25 }) {
  const ref = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_SNAPPY);
  const y = useSpring(rawY, SPRING_SNAPPY);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    rawX.set((e.clientX - rect.left - rect.width / 2) * strength);
    rawY.set((e.clientY - rect.top - rect.height / 2) * strength);
  }, [rawX, rawY, strength]);

  const handleMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y, willChange: 'transform' }}
      whileTap={{ scale: 0.96 }}
      className={className}
    >
      {children}
    </motion.button>
  );
});
