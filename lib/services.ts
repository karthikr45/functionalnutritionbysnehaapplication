// Single source of truth for the slug ↔ display-name mapping for service programs.
// Used by:
//  - app/doctor/packages/page.tsx (assign-to-program dropdown + label badge)
//  - components/ProgramPackages.tsx (homepage grouped section header)
export const SERVICE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: '— General (not tied to a program) —' },
  { value: 'gut-reset-program', label: 'Gut Reset Program' },
  { value: 'weight-management', label: 'Weight Management' },
  { value: 'metabolic-health-program', label: 'Metabolic Health Program' },
  { value: 'pregnancy-nutrition', label: 'Pregnancy Nutrition' },
  { value: 'personalized-nutrition-plan', label: 'One-Time Personalized Nutrition Plan' },
  { value: 'group-program', label: 'Group Program' },
];

export function getServiceLabel(slug: string | null | undefined): string {
  if (!slug) return 'General';
  return SERVICE_OPTIONS.find((s) => s.value === slug)?.label ?? slug;
}
