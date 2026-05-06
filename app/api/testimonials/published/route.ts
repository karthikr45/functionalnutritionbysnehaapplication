import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Public list — testimonials and case studies marked isPublished, ordered by
// featured first, then sortOrder, then newest. Used on the homepage.
export async function GET() {
  try {
    const items = await prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        patientName: true,
        type: true,
        title: true,
        content: true,
        rating: true,
        imageUrl: true,
        isFeatured: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ testimonials: items });
  } catch (e) {
    console.error('GET /api/testimonials/published failed', e);
    return NextResponse.json({ testimonials: [] });
  }
}
