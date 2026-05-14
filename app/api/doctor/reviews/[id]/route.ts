import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

// PATCH — approve / reject a review.
// Body: { action: 'approve' | 'reject', note?: string }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || (session.user.role !== 'DOCTOR' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, note } = await req.json();
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 });
  }

  const existing = await prisma.productReview.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

  const updated = await prisma.productReview.update({
    where: { id: params.id },
    data: {
      isApproved: action === 'approve',
      approvedAt: new Date(),
      approvedById: session.user.id,
      approvalNote: note || null,
    },
  });

  // Recompute the product's avg rating + totalReviews (approved only)
  const stats = await prisma.productReview.aggregate({
    where: { productId: existing.productId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: existing.productId },
    data: { avgRating: stats._avg.rating || 0, totalReviews: stats._count },
  });

  return NextResponse.json({ review: updated });
}

// DELETE — permanently remove a review.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || (session.user.role !== 'DOCTOR' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const existing = await prisma.productReview.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

  await prisma.productReview.delete({ where: { id: params.id } });

  // Recompute product stats
  const stats = await prisma.productReview.aggregate({
    where: { productId: existing.productId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: existing.productId },
    data: { avgRating: stats._avg.rating || 0, totalReviews: stats._count },
  });

  return NextResponse.json({ ok: true });
}
