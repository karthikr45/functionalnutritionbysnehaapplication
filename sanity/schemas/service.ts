import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'subtitle', title: 'Subtitle / Tagline', type: 'string' }),
    defineField({ name: 'description', title: 'Short Description', type: 'text', rows: 3 }),
    defineField({ name: 'icon', title: 'Icon (emoji or text)', type: 'string' }),
    defineField({
      name: 'image',
      title: 'Card Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'body',
      title: 'Full Page Content (Rich Text)',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'caption', type: 'string', title: 'Caption' }],
        },
      ],
    }),
    defineField({
      name: 'benefits',
      title: 'Conditions / Benefits List',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of conditions addressed or key benefits',
    }),
    defineField({
      name: 'conditions',
      title: 'Condition Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Short condition labels shown as chips/tags',
    }),

    // Extended fields for detailed service pages
    defineField({
      name: 'philosophy',
      title: 'Philosophy / Approach Quote',
      type: 'text',
      rows: 3,
      description: 'Shown as an italic quote block. E.g. "We follow Food as Medicine..."',
    }),
    defineField({
      name: 'whyGutHealth',
      title: 'Why This Matters Section',
      type: 'text',
      rows: 3,
      description: 'Explanation shown in a dark card. E.g. "70-80% of your immune system lives in your gut..."',
    }),
    defineField({
      name: 'steps',
      title: 'How to Join — Steps',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'title', title: 'Step Title', type: 'string' }),
          defineField({ name: 'description', title: 'Step Description', type: 'text', rows: 3 }),
          defineField({ name: 'link', title: 'Action Link (URL)', type: 'url' }),
          defineField({ name: 'linkText', title: 'Link Button Text', type: 'string' }),
          defineField({
            name: 'includes',
            title: 'What\'s Included (list)',
            type: 'array',
            of: [{ type: 'string' }],
          }),
          defineField({
            name: 'notes',
            title: 'Important Notes (list)',
            type: 'array',
            of: [{ type: 'string' }],
          }),
        ],
        preview: {
          select: { title: 'title' },
        },
      }],
    }),
    defineField({
      name: 'programStructure',
      title: 'Program Structure (list)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'E.g. "30-min onboarding call", "WhatsApp support", etc.',
    }),
    defineField({
      name: 'investment',
      title: 'Investment / Pricing Text',
      type: 'string',
      description: 'E.g. "3 months — ₹50,000 (includes weekly review calls)"',
    }),
    defineField({
      name: 'guidelinesSuitable',
      title: 'Guidelines — Suitable For',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'E.g. "Ages 10-50", "Requires home-cooked meals"',
    }),
    defineField({
      name: 'guidelinesNotIncluded',
      title: 'Guidelines — Not Included',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'E.g. "Medical prescriptions", "Emergency medical care"',
    }),

    defineField({ name: 'sortOrder', title: 'Sort Order', type: 'number', initialValue: 0 }),
    defineField({ name: 'isActive', title: 'Active', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'subtitle', media: 'image' },
  },
});
