import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
    defineField({ name: 'youtubeUrl', title: 'YouTube URL', type: 'url', description: 'Paste full YouTube video URL (e.g. https://www.youtube.com/watch?v=xxxxx)' }),
    defineField({ name: 'videoFile', title: 'Upload Video (if not YouTube)', type: 'file', options: { accept: 'video/*' } }),
    defineField({ name: 'thumbnail', title: 'Thumbnail Image', type: 'image', options: { hotspot: true }, description: 'Custom thumbnail. If empty, YouTube thumbnail is used.' }),
    defineField({ name: 'category', title: 'Category Label', type: 'string', initialValue: 'Youtube', description: 'Badge text shown on the card (e.g. Youtube, Podcast, Testimonial)' }),
    defineField({ name: 'sortOrder', title: 'Sort Order', type: 'number', initialValue: 0 }),
    defineField({ name: 'isActive', title: 'Active', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'category', media: 'thumbnail' },
  },
});
