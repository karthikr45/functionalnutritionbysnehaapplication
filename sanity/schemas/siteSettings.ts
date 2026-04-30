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
    defineField({ name: 'heroBadge', title: 'Hero Badge Text', type: 'string', initialValue: 'Certified Gut Shell Consultant' }),
    defineField({ name: 'heroTitle', title: 'Hero Title', type: 'string', initialValue: 'Heal Your Body with Gut Shell' }),
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
      title: 'Doctor Profile Image (Mobile / Portrait)',
      type: 'image',
      options: { hotspot: true },
      description: 'Portrait image used on mobile hero and About section.',
    }),
    defineField({
      name: 'heroDesktopImage',
      title: 'Hero Desktop Image (Wide / Landscape)',
      type: 'image',
      options: { hotspot: true },
      description: 'Wide image for desktop hero banner. If empty, falls back to the portrait image.',
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

    // Contact Details
    defineField({ name: 'contactEmail', title: 'Contact Email', type: 'string', initialValue: 'gutshell.com@gmail.com' }),
    defineField({ name: 'contactPhone', title: 'Phone / WhatsApp Number', type: 'string', initialValue: '+91 93916 75213' }),
    defineField({ name: 'whatsappNumber', title: 'WhatsApp Number (digits only, with country code)', type: 'string', initialValue: '919391675213', description: 'Used for wa.me links. Example: 919391675213' }),
    defineField({ name: 'consultationHours', title: 'Consultation Hours', type: 'string', initialValue: 'Mon–Sat, 9 AM – 7 PM' }),
    defineField({ name: 'consultationMode', title: 'Consultation Mode', type: 'string', initialValue: 'Online (Pan India & International)' }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' };
    },
  },
});
