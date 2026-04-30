'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

function useScrollProgress(ref: React.RefObject<HTMLElement | null>, offset = 0.2) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const start = window.innerHeight * (1 - offset);
      const end = -rect.height * offset;
      const raw = (start - rect.top) / (start - end);
      setProgress(Math.max(0, Math.min(1, raw)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref, offset]);

  return progress;
}

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
  const ref = useRef<HTMLSpanElement>(null);
  const progress = useScrollProgress(ref as React.RefObject<HTMLElement>, 0.1);

  const words = text.split(' ');

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => {
        const wordProgress = Math.max(0, Math.min(1, (progress * words.length - i) * 1.5));
        const isHighlight = highlight && word.includes(highlight);
        return (
          <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
            <span
              className={`inline-block ${isHighlight ? highlightClass : ''}`}
              style={{
                transform: `translateY(${(1 - wordProgress) * 120}%)`,
                opacity: wordProgress,
                transition: 'none',
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
            const eased = 1 - Math.pow(1 - progress, 4);
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

export function ClipRevealText({
  children,
  className = '',
  direction = 'up',
}: {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref as React.RefObject<HTMLElement>, 0.15);

  const eased = 1 - Math.pow(1 - progress, 3);

  const clipPaths: Record<string, string> = {
    up: `inset(${(1 - eased) * 100}% 0 0 0)`,
    left: `inset(0 ${(1 - eased) * 100}% 0 0)`,
    right: `inset(0 0 0 ${(1 - eased) * 100}%)`,
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        clipPath: clipPaths[direction],
        transform: direction === 'up' ? `translateY(${(1 - eased) * 30}px)` : 'none',
        willChange: 'clip-path, transform',
      }}
    >
      {children}
    </div>
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
  const progress = useScrollProgress(ref as React.RefObject<HTMLElement>, 0.1);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {text.split('').map((char, i) => {
        const charProgress = Math.max(0, Math.min(1, (progress * text.length * 0.8 - i) * 0.5));
        return (
          <span key={i} className="inline-block overflow-hidden">
            <span
              className="inline-block"
              style={{
                transform: `translateY(${(1 - charProgress) * 110}%) rotate(${(1 - charProgress) * 10}deg)`,
                opacity: charProgress,
              }}
              aria-hidden="true"
            >
              {char === ' ' ? ' ' : char}
            </span>
          </span>
        );
      })}
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
  const progress = useScrollProgress(ref as React.RefObject<HTMLElement>, 0.15);

  const eased = Math.max(0, Math.min(1, (progress - 0.1) * 1.5));
  const curtainProgress = Math.max(0, Math.min(1, (progress - 0.3) * 2));

  const transforms: Record<string, string> = {
    right: `translateX(${curtainProgress * 101}%)`,
    left: `translateX(${-curtainProgress * 101}%)`,
    up: `translateY(${-curtainProgress * 101}%)`,
    down: `translateY(${curtainProgress * 101}%)`,
  };

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div style={{ opacity: eased > 0.3 ? 1 : 0 }}>
        {children}
      </div>
      <div
        className={`absolute inset-0 ${color} z-10`}
        style={{ transform: transforms[direction] }}
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
    el.style.transform = `perspective(600px) rotateX(${-y * maxTilt}deg) rotateY(${x * maxTilt}deg) scale3d(1.03, 1.03, 1.03)`;
    const shine = el.querySelector('.tilt-shine') as HTMLElement;
    if (shine) {
      shine.style.opacity = '1';
      shine.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
    }
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    const shine = el.querySelector('.tilt-shine') as HTMLElement;
    if (shine) shine.style.opacity = '0';
  };

  return (
    <div
      ref={ref}
      className={`transition-transform duration-300 ease-out relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
      <div className="tilt-shine absolute inset-0 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-300 z-10" />
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

export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? window.scrollY / total : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 z-[100]">
      <div
        className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
        style={{ width: `${progress * 100}%`, transition: 'width 0.1s' }}
      />
    </div>
  );
}

export function MagneticButton({
  children,
  className = '',
  strength = 0.3,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = 'translate(0, 0)';
  };

  return (
    <div
      ref={ref}
      className={`inline-block transition-transform duration-300 ease-out ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
