// Single source of truth for service / program metadata.
// Used by:
//  - app/doctor/packages/page.tsx (assign-to-program dropdown + label badge)
//  - app/patient/packages/page.tsx (segmented package picker headers + card badges)
//  - components/ProgramPackages.tsx (homepage grouped section, when re-enabled)

export interface ServiceMeta {
  value: string;
  label: string;
  emoji: string;
  tagline: string;
  // Tailwind classes — applied to section accent bar / pill
  accentBg: string;
  accentText: string;
}

export const SERVICE_OPTIONS: ServiceMeta[] = [
  { value: '', label: '— General (not tied to a program) —', emoji: '📦', tagline: 'À la carte options', accentBg: 'bg-gray-100', accentText: 'text-gray-700' },
  { value: 'gut-reset-program', label: 'Gut Reset Program', emoji: '🌿', tagline: 'Heal from the root, not the symptoms.', accentBg: 'bg-primary-100', accentText: 'text-primary-700' },
  { value: 'weight-management', label: 'Weight Management', emoji: '⚖️', tagline: 'Sustainable weight loss — no crash diets.', accentBg: 'bg-amber-100', accentText: 'text-amber-800' },
  { value: 'metabolic-health-program', label: 'Metabolic Health Program', emoji: '🩺', tagline: 'For PCOS, diabetes, thyroid & cardiac care.', accentBg: 'bg-rose-100', accentText: 'text-rose-700' },
  { value: 'pregnancy-nutrition', label: 'Pregnancy Nutrition', emoji: '🤰', tagline: 'Nourish for two, every trimester.', accentBg: 'bg-pink-100', accentText: 'text-pink-700' },
  { value: 'personalized-nutrition-plan', label: 'One-Time Personalized Nutrition Plan', emoji: '📋', tagline: 'A complete blueprint, tailored to you.', accentBg: 'bg-indigo-100', accentText: 'text-indigo-700' },
  { value: 'group-program', label: 'Group Program', emoji: '👥', tagline: 'Heal with a community by your side.', accentBg: 'bg-teal-100', accentText: 'text-teal-700' },
];

const META_BY_SLUG: Record<string, ServiceMeta> = SERVICE_OPTIONS.reduce(
  (acc, opt) => ({ ...acc, [opt.value]: opt }),
  {},
);

export function getServiceLabel(slug: string | null | undefined): string {
  if (!slug) return 'General';
  return META_BY_SLUG[slug]?.label ?? slug;
}

export function getServiceMeta(slug: string | null | undefined): ServiceMeta {
  if (slug && META_BY_SLUG[slug]) return META_BY_SLUG[slug];
  // Fallback for unknown slugs or general / no-slug packages
  return {
    value: slug || '',
    label: slug ? slug.replace(/-/g, ' ') : 'General',
    emoji: '📦',
    tagline: 'À la carte options',
    accentBg: 'bg-gray-100',
    accentText: 'text-gray-700',
  };
}

