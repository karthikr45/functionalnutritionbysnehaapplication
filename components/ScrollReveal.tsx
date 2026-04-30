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

export default function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 800,
  threshold = 0.15,
  className = '',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setIsVisible(true); return; }

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); } },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const baseStyle: React.CSSProperties = {
    transitionProperty: 'opacity, transform, filter',
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    transitionDelay: `${delay}ms`,
  };

  const hiddenStyles: Record<Animation, React.CSSProperties> = {
    'fade-up': { opacity: 0, transform: 'translateY(40px)' },
    'fade-down': { opacity: 0, transform: 'translateY(-40px)' },
    'fade-in': { opacity: 0 },
    'slide-left': { opacity: 0, transform: 'translateX(-60px)' },
    'slide-right': { opacity: 0, transform: 'translateX(60px)' },
    'scale-up': { opacity: 0, transform: 'scale(0.9)' },
    'blur-in': { opacity: 0, filter: 'blur(10px)', transform: 'translateY(20px)' },
  };

  const visibleStyle: React.CSSProperties = {
    opacity: 1,
    transform: 'translate(0, 0) scale(1)',
    filter: 'blur(0px)',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...baseStyle, ...(isVisible ? visibleStyle : hiddenStyles[animation]) }}
    >
      {children}
    </div>
  );
}

export function StaggerReveal({
  children,
  animation = 'fade-up',
  staggerDelay = 120,
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
