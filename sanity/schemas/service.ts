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
      title: 'Full Page Content',
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
      title: 'Key Benefits',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'conditions',
      title: 'Conditions Treated',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'sortOrder', title: 'Sort Order', type: 'number', initialValue: 0 }),
    defineField({ name: 'isActive', title: 'Active', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'subtitle', media: 'image' },
  },
});
