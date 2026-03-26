import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    // Branding
    defineField({
      name: 'logo',
      title: 'Site Logo',
      type: 'image',
      options: { hotspot: true },
      description: 'Upload your logo. Used in Navbar, Footer, Sidebars, and Login page.',
    }),

    // Hero Section
    defineField({ name: 'heroBadge', title: 'Hero Badge Text', type: 'string', initialValue: 'Certified Functional Nutrition Consultant' }),
    defineField({ name: 'heroTitle', title: 'Hero Title', type: 'string', initialValue: 'Heal Your Body with Functional Nutrition' }),
    defineField({ name: 'heroSubtitle', title: 'Hero Subtitle', type: 'text', rows: 3 }),
    defineField({
      name: 'heroHighlights',
      title: 'Hero Highlights (3 items)',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (r) => r.max(3),
    }),
    defineField({
      name: 'heroStats',
      title: 'Hero Stats (trust badges)',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'number', title: 'Number', type: 'string' }),
          defineField({ name: 'label', title: 'Label', type: 'string' }),
        ],
      }],
    }),
    defineField({
      name: 'doctorImage',
      title: 'Doctor Profile Image (Hero & About)',
      type: 'image',
      options: { hotspot: true },
    }),

    // About Section
    defineField({ name: 'aboutName', title: 'About — Name', type: 'string', initialValue: 'Sneha' }),
    defineField({ name: 'aboutTitle', title: 'About — Section Title', type: 'string', initialValue: "Hi, I'm Sneha" }),
    defineField({
      name: 'aboutDescription',
      title: 'About — Description Paragraphs',
      type: 'array',
      of: [{ type: 'text' }],
    }),
    defineField({
      name: 'aboutCredentials',
      title: 'About — Qualifications',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'aboutStats',
      title: 'About — Stats',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'number', title: 'Number', type: 'string' }),
          defineField({ name: 'label', title: 'Label', type: 'string' }),
        ],
      }],
    }),
    defineField({ name: 'aboutSpecializations', title: 'About — Specialization Tags', type: 'string' }),
    defineField({
      name: 'aboutImage',
      title: 'About — Photo (optional, uses Doctor Image if empty)',
      type: 'image',
      options: { hotspot: true },
    }),

    // Social Links
    defineField({ name: 'instagramUrl', title: 'Instagram URL', type: 'url' }),
    defineField({ name: 'youtubeUrl', title: 'YouTube URL', type: 'url' }),
    defineField({ name: 'linkedinUrl', title: 'LinkedIn URL', type: 'url' }),
    defineField({ name: 'facebookUrl', title: 'Facebook URL', type: 'url' }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' };
    },
  },
});
