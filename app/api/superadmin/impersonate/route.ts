import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRawAuthSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = await getRawAuthSession();
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.role === 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Cannot impersonate another super admin' }, { status: 403 });
  }

  // Log the impersonation start
  await logAuditAction({
    superAdminId: session.user.id,
    impersonatedUserId: user.id,
    action: 'START_IMPERSONATION',
    details: `Started impersonating ${user.name} (${user.email}) as ${user.role}`,
  });

  const impersonationData = {
    impersonatedUserId: user.id,
    impersonatedUserName: user.name,
    impersonatedUserRole: user.role,
    superAdminId: session.user.id,
  };

  const response = NextResponse.json({ success: true, user });
  response.cookies.set('impersonation', JSON.stringify(impersonationData), {
    httpOnly: false, // Need client-side access for the banner
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 4, // 4 hours
  });

  return response;
}

export async function DELETE(req: NextRequest) {
  const session = await getRawAuthSession();
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Read impersonation cookie to log stop
  const raw = req.cookies.get('impersonation')?.value;
  if (raw) {
    try {
      const data = JSON.parse(raw);
      await logAuditAction({
        superAdminId: session.user.id,
        impersonatedUserId: data.impersonatedUserId,
        action: 'STOP_IMPERSONATION',
        details: `Stopped impersonating ${data.impersonatedUserName}`,
      });
    } catch {}
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('impersonation');
  return response;
}
