import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

// GET — list the patient's own submissions (for status visibility).
export async function GET() {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const items = await prisma.testimonial.findMany({
    where: { authorId: session.user.id, source: 'PATIENT' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      patientName: true,
      title: true,
      content: true,
      rating: true,
      isApproved: true,
      approvedAt: true,
      approvalNote: true,
      isPublished: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ testimonials: items });
}

// POST — patient submits a testimonial. Created as unapproved; doctor
// reviews via /doctor/testimonials.
export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { patientName, title, content, rating, imageUrl } = body ?? {};
  if (!content || typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'Please share your story before submitting.' }, { status: 400 });
  }

  const r = Number(rating);
  const ratingInt = Number.isFinite(r) ? Math.min(5, Math.max(1, Math.trunc(r))) : 5;

  const created = await prisma.testimonial.create({
    data: {
      authorId: session.user.id,
      source: 'PATIENT',
      patientName: (patientName && String(patientName).trim()) || session.user.name || 'Anonymous',
      type: 'TESTIMONIAL',
      title: title ? String(title).trim() : null,
      content: String(content).trim(),
      rating: ratingInt,
      imageUrl: imageUrl || null,
      isApproved: false,
      isPublished: true, // published flag stays on; isApproved is the gate
    },
  });

  // Notify the (single) doctor that there's a pending testimonial.
  try {
    const doctor = await prisma.user.findFirst({
      where: { role: 'DOCTOR' },
      select: { id: true },
    });
    if (doctor) {
      createNotification({
        userId: doctor.id,
        type: 'TESTIMONIAL_PENDING',
        title: 'New patient story awaiting approval',
        message: `${session.user.name} shared a ${ratingInt}-star story.`,
        link: '/doctor/testimonials?status=pending',
      }).catch(() => {});
    }
  } catch {
    /* notification failure non-fatal */
  }

  return NextResponse.json({ testimonial: created }, { status: 201 });
}
