import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

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

  const review = await prisma.productReview.create({
    data: { productId: params.id, userId: session.user.id, orderId, rating, title, comment },
  });

  // Update product avg rating and total reviews
  const stats = await prisma.productReview.aggregate({
    where: { productId: params.id, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: params.id },
    data: { avgRating: stats._avg.rating || 0, totalReviews: stats._count },
  });

  return NextResponse.json({ review }, { status: 201 });
}
