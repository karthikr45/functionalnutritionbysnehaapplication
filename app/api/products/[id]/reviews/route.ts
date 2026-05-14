import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = 10;
  const [reviews, total] = await Promise.all([
    prisma.productReview.findMany({
      where: { productId: params.id, isApproved: true },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.productReview.count({ where: { productId: params.id, isApproved: true } }),
  ]);
  return NextResponse.json({ reviews, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { rating, title, comment, orderId } = await req.json();
  if (!rating || rating < 1 || rating > 5 || !orderId) {
    return NextResponse.json({ error: 'Rating (1-5) and orderId required' }, { status: 400 });
  }

  // Verify the user has a delivered order with this product
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id, status: 'DELIVERED', items: { some: { productId: params.id } } },
  });
  if (!order) return NextResponse.json({ error: 'You can only review products from delivered orders' }, { status: 403 });

  // New reviews are unapproved until the doctor explicitly approves them.
  const review = await prisma.productReview.create({
    data: {
      productId: params.id,
      userId: session.user.id,
      orderId,
      rating,
      title,
      comment,
      isApproved: false,
    },
    include: { product: { select: { name: true } } },
  });

  // Notify the (single) doctor that there's a pending review to moderate.
  try {
    const doctor = await prisma.user.findFirst({
      where: { role: 'DOCTOR' },
      select: { id: true },
    });
    if (doctor) {
      createNotification({
        userId: doctor.id,
        type: 'REVIEW_PENDING',
        title: 'New review awaiting approval',
        message: `${session.user.name} left a ${rating}-star review for ${review.product.name}.`,
        link: '/doctor/reviews?status=pending',
      }).catch(() => {});
    }
  } catch {
    /* notification failure is non-fatal */
  }

  return NextResponse.json({ review }, { status: 201 });
}
