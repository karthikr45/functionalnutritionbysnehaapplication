import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import type { TestimonialType } from '@prisma/client';

// GET — list ALL testimonials (own + patient submissions) with optional
// status filter (pending | approved | rejected). Single-doctor practice.
export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const status = req.nextUrl.searchParams.get('status'); // 'pending' | 'approved' | 'rejected' | null
    const where: any = {};
    if (status === 'pending') {
      where.isApproved = false;
      where.approvedAt = null;
    } else if (status === 'approved') {
      where.isApproved = true;
    } else if (status === 'rejected') {
      where.isApproved = false;
      where.approvedAt = { not: null };
    }

    const items = await prisma.testimonial.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        author: { select: { name: true, email: true, role: true } },
      },
    });

    const counts = await prisma.$transaction([
      prisma.testimonial.count({ where: { isApproved: false, approvedAt: null } }),
      prisma.testimonial.count({ where: { isApproved: true } }),
      prisma.testimonial.count({ where: { isApproved: false, approvedAt: { not: null } } }),
    ]);

    return NextResponse.json({
      testimonials: items,
      counts: { pending: counts[0], approved: counts[1], rejected: counts[2] },
    });
  } catch (e) {
    console.error('GET /api/doctor/testimonials failed:', e);
    return NextResponse.json({ testimonials: [], counts: { pending: 0, approved: 0, rejected: 0 }, error: 'Failed to load' }, { status: 200 });
  }
}

// POST — doctor creates a new testimonial directly. Marked as approved
// on creation since the doctor is the moderator.
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
      source: 'DOCTOR',
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
      isApproved: true,
      approvedAt: new Date(),
      approvedById: session.user.id,
    },
  });
  return NextResponse.json({ testimonial: created });
}
