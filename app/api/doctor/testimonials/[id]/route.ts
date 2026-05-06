import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import type { TestimonialType } from '@prisma/client';

// PATCH — update an existing testimonial (must belong to the logged-in doctor)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.testimonial.findUnique({ where: { id: params.id } });
  if (!existing || existing.authorId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.patientName !== undefined) data.patientName = String(body.patientName).trim();
  if (body.title !== undefined) data.title = body.title ? String(body.title).trim() : null;
  if (body.quote !== undefined) data.quote = body.quote ? String(body.quote).trim() : null;
  if (body.content !== undefined) data.content = String(body.content);
  if (body.rating !== undefined) {
    const r = Number(body.rating);
    data.rating = Number.isFinite(r) ? Math.min(5, Math.max(1, Math.trunc(r))) : 5;
  }
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl || null;
  if (body.isPublished !== undefined) data.isPublished = Boolean(body.isPublished);
  if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured);
  if (body.sortOrder !== undefined) {
    const n = Number(body.sortOrder);
    data.sortOrder = Number.isFinite(n) ? Math.trunc(n) : 0;
  }
  if (body.type !== undefined) {
    const t: TestimonialType = body.type === 'CASE_STUDY' ? 'CASE_STUDY' : 'TESTIMONIAL';
    data.type = t;
  }

  const updated = await prisma.testimonial.update({ where: { id: params.id }, data });
  return NextResponse.json({ testimonial: updated });
}

// DELETE — remove a testimonial (must belong to the logged-in doctor)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const existing = await prisma.testimonial.findUnique({ where: { id: params.id } });
  if (!existing || existing.authorId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  await prisma.testimonial.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
