function LoadingSkeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-[1.5rem] bg-white/5 ${className}`.trim()} />;
}

export default LoadingSkeleton;
