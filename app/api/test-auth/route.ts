import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check if SUPER_ADMIN already exists in the enum
    const enumCheck = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 1 FROM pg_enum WHERE enumlabel = 'SUPER_ADMIN'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
    `);

    if (enumCheck.length === 0) {
      // Add SUPER_ADMIN to enum — must run outside transaction
      await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN'`);
    }

    // Update user role via raw SQL (bypasses Prisma enum validation)
    const updated = await prisma.$executeRawUnsafe(
      `UPDATE "User" SET "role" = 'SUPER_ADMIN' WHERE "email" = 'superadmin@admin.com'`
    );

    // Create AuditLog table if missing
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT NOT NULL,
        "superAdminId" TEXT NOT NULL,
        "impersonatedUserId" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "entity" TEXT,
        "entityId" TEXT,
        "details" TEXT,
        "ipAddress" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "AuditLog_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "AuditLog_impersonatedUserId_fkey" FOREIGN KEY ("impersonatedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    // Verify with raw SQL (avoids Prisma enum cache issue)
    const user = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, email, role FROM "User" WHERE email = 'superadmin@admin.com'`
    );

    const allRoles = await prisma.$queryRawUnsafe<any[]>(
      `SELECT role, COUNT(*)::int as count FROM "User" GROUP BY role`
    );

    return NextResponse.json({
      success: true,
      message: 'SUPER_ADMIN enum added and user role updated. Restart dev server (rm -rf .next && npm run dev), then login.',
      enumExisted: enumCheck.length > 0,
      rowsUpdated: updated,
      user: user[0] || null,
      allRolesInDB: allRoles,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
