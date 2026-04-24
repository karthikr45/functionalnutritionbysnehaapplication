import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const title = formData.get('title') as string;
  const type = formData.get('type') as string;
  const appointmentId = formData.get('appointmentId') as string | null;
  const notes = formData.get('notes') as string | null;

  if (!file || !title || !type) {
    return NextResponse.json({ error: 'file, title, and type are required' }, { status: 400 });
  }

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Only PDF and images are allowed' }, { status: 400 });
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { url, publicId } = await uploadToCloudinary(buffer, file.name, 'nutrition-docs');

  const document = await prisma.document.create({
    data: {
      uploadedById: session.user.id,
      title,
      type: type as any,
      fileUrl: url,
      filePublicId: publicId,
      fileType: file.type,
      fileSize: file.size,
      notes: notes || null,
      appointmentId: appointmentId || null,
    },
  });

  // Notify the doctor if patient uploads to an appointment
  if (appointmentId && session.user.role === 'PATIENT') {
    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: { select: { userId: true } } },
    });
    if (appt) {
      createNotification({
        userId: appt.doctor.userId,
        type: 'DOCUMENT',
        title: 'New document uploaded',
        message: `${session.user.name} uploaded "${title}" for your review.`,
        link: `/appointment/${appointmentId}`,
      }).catch(() => {});
    }
  }

  return NextResponse.json({ document }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const appointmentId = searchParams.get('appointmentId');

  let where: any = {};

  if (session.user.role === 'PATIENT') {
    where.uploadedById = session.user.id;
  } else if (session.user.role === 'DOCTOR') {
    // Doctor sees all documents shared or linked to their appointments
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (doctorProfile) {
      where.OR = [
        { uploadedById: session.user.id },
        {
          appointment: {
            doctorId: doctorProfile.id,
          },
        },
      ];
    }
  }

  if (appointmentId) where.appointmentId = appointmentId;

  const documents = await prisma.document.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      type: true,
      fileUrl: true,
      filePublicId: true,
      fileType: true,
      fileSize: true,
      notes: true,
      appointmentId: true,
      isShared: true,
      aiAnalyzedAt: true,
      createdAt: true,
      uploadedBy: { select: { name: true, role: true } },
    },
  });

  // Add boolean flag so clients can show 'View Insights' vs 'AI Insights'
  const docsWithFlag = documents.map((d) => ({ ...d, hasAiAnalysis: !!d.aiAnalyzedAt }));

  return NextResponse.json({ documents: docsWithFlag });
}
