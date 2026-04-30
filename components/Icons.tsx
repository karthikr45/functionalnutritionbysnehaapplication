interface IconProps {
  className?: string;
}

const iconStyle = 'stroke-current';

export function ClipboardCheckIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

export function HeartHandIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.364v-6m-3 3h6" />
    </svg>
  );
}

export function SproutIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V12m0 0c0-4 3-7 7-7-1 4-3 7-7 7zm0 0c0-4-3-7-7-7 1 4 3 7 7 7z" />
    </svg>
  );
}

export function HandHoldingHeartIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function LeafIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 21c0 0 2-4 7-4s7-9 7-9-2 4-7 4-7 9-7 9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 17V8" />
    </svg>
  );
}

export function MicroscopeIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v4m-4 4h8m-6-4a6 6 0 006-6" />
    </svg>
  );
}

export function BowlFoodIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M5 12a7 7 0 0114 0M7 12a5 5 0 0110 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12v2a7 7 0 0014 0v-2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8V6m3-2v4m3-2V4" />
    </svg>
  );
}

export function DnaIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4c0 4 12 4 12 8s-12 4-12 8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 4c0 4-12 4-12 8s12 4 12 8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10M7 17h10M8 12h8" />
    </svg>
  );
}

export function ScaleIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-7-7l7-7 7 7M3 21h18" />
    </svg>
  );
}

export function StethoscopeIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12V7a4 4 0 018 0v5" />
      <circle cx="10" cy="16" r="4" />
      <circle cx="18" cy="12" r="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 14v2a4 4 0 01-4 4" />
    </svg>
  );
}

export function GraduationIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 9l10 6 10-6-10-6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 11v5c0 2 3 4 6 4s6-2 6-4v-5" />
    </svg>
  );
}

export function CalendarIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export function HourglassIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h14M5 20h14M7 4v4a5 5 0 005 5 5 5 0 005-5V4M7 20v-4a5 5 0 015-5 5 5 0 015 5v4" />
    </svg>
  );
}

export function UsersIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

export function MedalIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <circle cx="12" cy="14" r="6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 2l1.5 5M15 2l-1.5 5M12 10v4m-2-2h4" />
    </svg>
  );
}

export function PillIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 3.5a5.657 5.657 0 018 8l-8 8a5.657 5.657 0 01-8-8l8-8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 13.5l8-8" />
    </svg>
  );
}

export function RunnerIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <circle cx="14" cy="4" r="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 20l3-7 3 2 4-5 2 6M9 13l-3 1" />
    </svg>
  );
}

export function NutritionPlanIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14h6M9 11h3" />
    </svg>
  );
}

export function PregnancyIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <circle cx="12" cy="5" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v2c0 3 2 5 4 6H8c2-1 4-3 4-6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 22h4" />
    </svg>
  );
}
