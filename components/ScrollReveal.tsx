'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

type Animation = 'fade-up' | 'fade-in' | 'fade-down' | 'slide-left' | 'slide-right' | 'scale-up' | 'blur-in';

interface Props {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}

function useScrollProgress(ref: React.RefObject<HTMLElement | null>, offset = 0.15) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setProgress(1); return; }
    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const start = window.innerHeight * (1 - offset);
      const end = window.innerHeight * 0.3;
      const raw = (start - rect.top) / (start - end);
      setProgress(Math.max(0, Math.min(1, raw)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref, offset]);
  return progress;
}

export default function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  className = '',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref as React.RefObject<HTMLElement>);

  const delayedProgress = delay > 0
    ? Math.max(0, Math.min(1, (progress - delay / 1000) * 1.5))
    : progress;

  const eased = 1 - Math.pow(1 - delayedProgress, 3);

  const transforms: Record<Animation, { transform: string; filter?: string }> = {
    'fade-up': { transform: `translateY(${(1 - eased) * 60}px)` },
    'fade-down': { transform: `translateY(${-(1 - eased) * 60}px)` },
    'fade-in': { transform: 'none' },
    'slide-left': { transform: `translateX(${-(1 - eased) * 80}px)` },
    'slide-right': { transform: `translateX(${(1 - eased) * 80}px)` },
    'scale-up': { transform: `scale(${0.85 + eased * 0.15})` },
    'blur-in': { transform: `translateY(${(1 - eased) * 30}px)`, filter: `blur(${(1 - eased) * 12}px)` },
  };

  const { transform, filter } = transforms[animation];

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: eased,
        transform,
        filter: filter || 'none',
        willChange: 'opacity, transform, filter',
      }}
    >
      {children}
    </div>
  );
}

export function StaggerReveal({
  children,
  animation = 'fade-up',
  staggerDelay = 100,
  baseDelay = 0,
  className = '',
}: {
  children: ReactNode[];
  animation?: Animation;
  staggerDelay?: number;
  baseDelay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <ScrollReveal key={i} animation={animation} delay={baseDelay + i * staggerDelay}>
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
}
