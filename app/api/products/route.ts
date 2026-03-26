import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const sort = searchParams.get('sort') || 'newest';
  const featured = searchParams.get('featured');
  const skip = (page - 1) * limit;

  const session = await getAuthSession();
  const isAdmin = session?.user?.role === 'DOCTOR' || session?.user?.role === 'SUPER_ADMIN';

  const where: any = isAdmin ? {} : { isActive: true };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { shortDescription: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (category) where.category = { slug: category };
  if (featured === 'true') where.isFeatured = true;
  if (tag) where.tags = { array_contains: [tag] };

  const orderBy: any = sort === 'price-asc' ? { price: 'asc' }
    : sort === 'price-desc' ? { price: 'desc' }
    : sort === 'rating' ? { avgRating: 'desc' }
    : sort === 'popular' ? { totalSold: 'desc' }
    : { createdAt: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, skip, take: limit, orderBy,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || !['DOCTOR', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  if (!body.name || !body.description || !body.price || !body.categoryId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: slugify(body.name),
      description: body.description,
      shortDescription: body.shortDescription,
      price: body.price,
      salePrice: body.salePrice || null,
      sku: body.sku || null,
      stock: body.stock || 0,
      lowStockThreshold: body.lowStockThreshold || 5,
      categoryId: body.categoryId,
      tags: body.tags || [],
      images: body.images || [],
      benefits: body.benefits || [],
      ingredients: body.ingredients,
      howToUse: body.howToUse,
      weight: body.weight,
      isActive: body.isActive ?? true,
      isFeatured: body.isFeatured ?? false,
      sortOrder: body.sortOrder || 0,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
