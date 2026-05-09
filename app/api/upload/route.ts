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
  const recipientId = formData.get('recipientId') as string | null;
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

  // Doctor must assign DIET_PLAN / PRESCRIPTION uploads to a specific patient,
  // otherwise no one can see them.
  if (session.user.role === 'DOCTOR' && !recipientId && (type === 'DIET_PLAN' || type === 'PRESCRIPTION')) {
    return NextResponse.json(
      { error: 'Please assign this document to a patient before uploading.' },
      { status: 400 },
    );
  }

  // If a recipient is specified, validate they exist and (for doctor uploads)
  // that they are actually a patient who's had an appointment with this doctor.
  let validRecipientId: string | null = null;
  if (recipientId) {
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, role: true, patientProfile: { select: { id: true } } },
    });
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 400 });
    }
    if (session.user.role === 'DOCTOR') {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (!doctorProfile || !recipient.patientProfile) {
        return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 });
      }
      const link = await prisma.appointment.findFirst({
        where: { doctorId: doctorProfile.id, patientId: recipient.patientProfile.id },
        select: { id: true },
      });
      if (!link) {
        return NextResponse.json({ error: 'You can only assign documents to patients you have an appointment with.' }, { status: 403 });
      }
    }
    validRecipientId = recipient.id;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { url, publicId } = await uploadToCloudinary(buffer, file.name, 'nutrition-docs');

  const document = await prisma.document.create({
    data: {
      uploadedById: session.user.id,
      recipientId: validRecipientId,
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

  // Notification routing
  if (session.user.role === 'PATIENT') {
    // Patient uploaded — notify their doctor(s)
    if (appointmentId) {
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
    } else {
      const patientProfile = await prisma.patientProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (patientProfile) {
        const doctors = await prisma.appointment.findMany({
          where: { patientId: patientProfile.id },
          select: { doctor: { select: { userId: true } } },
          distinct: ['doctorId'],
        });
        for (const a of doctors) {
          createNotification({
            userId: a.doctor.userId,
            type: 'DOCUMENT',
            title: 'New patient document',
            message: `${session.user.name} uploaded "${title}".`,
            link: '/doctor/documents',
          }).catch(() => {});
        }
      }
    }
  } else if (session.user.role === 'DOCTOR' && validRecipientId) {
    // Doctor uploaded for a specific patient — notify the patient
    createNotification({
      userId: validRecipientId,
      type: 'DOCUMENT',
      title: 'Your dietitian sent you a document',
      message: `"${title}" has been added to your documents.`,
      link: '/patient/documents',
    }).catch(() => {});
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
    // Patient sees their own uploads OR documents addressed to them.
    where.OR = [
      { uploadedById: session.user.id },
      { recipientId: session.user.id },
    ];
  } else if (session.user.role === 'DOCTOR') {
    // Doctor sees:
    //   1. Their own uploads (sent or unsent)
    //   2. Documents tied to any of their appointments
    //   3. Standalone documents uploaded by any patient who has had at
    //      least one appointment with them (covers patient-side uploads
    //      from /patient/documents that aren't linked to an appointment)
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (doctorProfile) {
      const patientLinks = await prisma.appointment.findMany({
        where: { doctorId: doctorProfile.id },
        select: { patient: { select: { userId: true } } },
        distinct: ['patientId'],
      });
      const patientUserIds = patientLinks.map((a) => a.patient.userId);

      where.OR = [
        { uploadedById: session.user.id },
        { appointment: { doctorId: doctorProfile.id } },
        ...(patientUserIds.length > 0
          ? [{ uploadedById: { in: patientUserIds }, appointmentId: null }]
          : []),
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
      uploadedById: true,
      recipientId: true,
      uploadedBy: { select: { name: true, role: true } },
      recipient: { select: { name: true } },
    },
  });

  // Add boolean flag so clients can show 'View Insights' vs 'AI Insights'
  const docsWithFlag = documents.map((d) => ({ ...d, hasAiAnalysis: !!d.aiAnalyzedAt }));

  return NextResponse.json({ documents: docsWithFlag });
}
