import { prisma } from './prisma';
import { cookies } from 'next/headers';

export interface ImpersonationData {
  impersonatedUserId: string;
  impersonatedUserName: string;
  impersonatedUserRole: string;
  superAdminId: string;
}

export function getImpersonationCookie(): ImpersonationData | null {
  try {
    const cookieStore = cookies();
    const raw = cookieStore.get('impersonation')?.value;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function logAuditAction({
  superAdminId,
  impersonatedUserId,
  action,
  entity,
  entityId,
  details,
}: {
  superAdminId: string;
  impersonatedUserId: string;
  action: string;
  entity?: string;
  entityId?: string;
  details?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        superAdminId,
        impersonatedUserId,
        action,
        entity,
        entityId,
        details,
      },
    });
  } catch (err) {
    console.error('[audit-log] Failed to create audit log:', err);
  }
}
