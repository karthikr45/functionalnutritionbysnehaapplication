import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import type { TestimonialType } from '@prisma/client';

// GET — list all testimonials authored by the logged-in doctor
export async function GET() {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await prisma.testimonial.findMany({
    where: { authorId: session.user.id },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json({ testimonials: items });
}

// POST — create a new testimonial / case study
export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const {
    patientName,
    type,
    title,
    quote,
    content,
    rating,
    imageUrl,
    isPublished,
    isFeatured,
    sortOrder,
  } = body ?? {};

  if (!patientName || !content) {
    return NextResponse.json({ error: 'patientName and content are required' }, { status: 400 });
  }

  const ratingInt = Number.isFinite(Number(rating)) ? Math.min(5, Math.max(1, Math.trunc(Number(rating)))) : 5;
  const t: TestimonialType = type === 'CASE_STUDY' ? 'CASE_STUDY' : 'TESTIMONIAL';

  const created = await prisma.testimonial.create({
    data: {
      authorId: session.user.id,
      patientName: String(patientName).trim(),
      type: t,
      title: title ? String(title).trim() : null,
      quote: quote ? String(quote).trim() : null,
      content: String(content),
      rating: ratingInt,
      imageUrl: imageUrl || null,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      isFeatured: Boolean(isFeatured),
      sortOrder: Number.isFinite(Number(sortOrder)) ? Math.trunc(Number(sortOrder)) : 0,
    },
  });
  return NextResponse.json({ testimonial: created });
}
