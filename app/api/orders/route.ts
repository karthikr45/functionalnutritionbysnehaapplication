import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { generateOrderNumber } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const isAdmin = ['DOCTOR', 'SUPER_ADMIN'].includes(session.user.role);

  const where: any = isAdmin ? {} : { userId: session.user.id };
  if (status && status !== 'ALL') where.status = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { shippingName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, skip: (page - 1) * limit, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        user: { select: { name: true, email: true } },
        payment: { select: { status: true, razorpayPaymentId: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { items, shipping } = await req.json();
  if (!items?.length || !shipping?.name || !shipping?.phone || !shipping?.address || !shipping?.city || !shipping?.state || !shipping?.pincode) {
    return NextResponse.json({ error: 'Items and shipping details required' }, { status: 400 });
  }

  // Validate stock and calculate totals
  const productIds = items.map((i: any) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  const orderItems: any[] = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
    if (product.stock < item.quantity) return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });

    const price = product.salePrice || product.price;
    const total = price * item.quantity;
    subtotal += total;

    const images = Array.isArray(product.images) ? product.images : [];
    orderItems.push({
      productId: product.id,
      productName: product.name,
      productImage: (images[0] as any)?.url || null,
      price,
      quantity: item.quantity,
      total,
    });
  }

  const shippingFee = subtotal >= 500 ? 0 : 50;
  const totalAmount = subtotal + shippingFee;

  // Create order and decrement stock in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        subtotal,
        shippingFee,
        totalAmount,
        shippingName: shipping.name,
        shippingPhone: shipping.phone,
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
        shippingState: shipping.state,
        shippingPincode: shipping.pincode,
        notes: shipping.notes,
        items: { create: orderItems },
        statusHistory: {
          create: { status: 'PENDING', note: 'Order placed', updatedById: session.user.id },
        },
      },
      include: { items: true },
    });

    // Decrement stock
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return newOrder;
  });

  return NextResponse.json({ order }, { status: 201 });
}
