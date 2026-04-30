'use client';

import { useEffect, useRef, useState } from 'react';

export function WordReveal({
  text,
  className = '',
  delay = 0,
  stagger = 80,
  highlight,
  highlightClass = 'text-primary-600',
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  highlight?: string;
  highlightClass?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = text.split(' ');

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => {
        const isHighlight = highlight && word.includes(highlight);
        return (
          <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
            <span
              className={`inline-block transition-all duration-700 ${isHighlight ? highlightClass : ''}`}
              style={{
                transitionDelay: `${delay + i * stagger}ms`,
                transform: visible ? 'translateY(0)' : 'translateY(110%)',
                opacity: visible ? 1 : 0,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function TypingEffect({
  text,
  className = '',
  delay = 800,
  speed = 30,
}: {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const timer = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [started, text, delay, speed]);

  return (
    <span ref={ref} className={className}>
      {displayed}
      {started && displayed.length < text.length && (
        <span className="inline-block w-0.5 h-[1em] bg-current animate-pulse ml-0.5 align-middle" />
      )}
    </span>
  );
}

export function CountUp({
  end,
  suffix = '',
  prefix = '',
  duration = 2000,
  className = '',
}: {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
}

export function SplitLetterReveal({
  text,
  className = '',
  delay = 0,
  stagger = 40,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {text.split('').map((char, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <span
            className="inline-block transition-all duration-500"
            style={{
              transitionDelay: `${delay + i * stagger}ms`,
              transform: visible ? 'translateY(0) rotate(0)' : 'translateY(100%) rotate(8deg)',
              opacity: visible ? 1 : 0,
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            aria-hidden="true"
          >
            {char === ' ' ? ' ' : char}
          </span>
        </span>
      ))}
    </span>
  );
}

export function GradientShimmer({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`bg-clip-text text-transparent bg-[length:200%_100%] animate-shimmer ${className}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, var(--primary-600) 0%, #D4A574 25%, var(--primary-600) 50%, #D4A574 75%, var(--primary-600) 100%)',
      }}
    >
      {children}
    </span>
  );
}

export function ImageReveal({
  children,
  className = '',
  color = 'bg-primary-600',
  direction = 'right',
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const transforms: Record<string, { initial: string; revealed: string }> = {
    right: { initial: 'translateX(0)', revealed: 'translateX(101%)' },
    left: { initial: 'translateX(0)', revealed: 'translateX(-101%)' },
    up: { initial: 'translateY(0)', revealed: 'translateY(-101%)' },
    down: { initial: 'translateY(0)', revealed: 'translateY(101%)' },
  };

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div
        style={{
          opacity: revealed ? 1 : 0,
          transition: 'opacity 0.01s',
          transitionDelay: revealed ? '0.4s' : '0s',
        }}
      >
        {children}
      </div>
      <div
        className={`absolute inset-0 ${color} z-10`}
        style={{
          transform: revealed ? transforms[direction].revealed : transforms[direction].initial,
          transition: 'transform 0.8s cubic-bezier(0.77, 0, 0.175, 1)',
          transitionDelay: revealed ? '0.3s' : '0s',
        }}
      />
    </div>
  );
}

export function TiltCard({
  children,
  className = '',
  maxTilt = 8,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(600px) rotateX(${-y * maxTilt}deg) rotateY(${x * maxTilt}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  };

  return (
    <div
      ref={ref}
      className={`transition-transform duration-300 ease-out ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

export function Parallax({
  children,
  speed = 0.3,
  className = '',
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const offset = (rect.top - window.innerHeight / 2) * speed;
      el.style.transform = `translateY(${offset}px)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
