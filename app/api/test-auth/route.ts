import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Temporary endpoint to fix super admin role — remove after fixing
export async function GET() {
  try {
    // Step 1: Add SUPER_ADMIN to the PostgreSQL enum if it doesn't exist
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SUPER_ADMIN' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')) THEN
          ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';
        END IF;
      END
      $$;
    `);

    // Step 2: Update the super admin user's role using raw SQL
    await prisma.$executeRawUnsafe(`
      UPDATE "User" SET "role" = 'SUPER_ADMIN' WHERE "email" = 'superadmin@admin.com'
    `);

    // Step 3: Also create AuditLog table if it doesn't exist
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

    // Step 4: Verify
    const user = await prisma.user.findUnique({
      where: { email: 'superadmin@admin.com' },
      select: { id: true, email: true, role: true },
    });

    const allRoles = await prisma.user.groupBy({ by: ['role'], _count: true });

    return NextResponse.json({
      success: true,
      message: 'Super admin role fixed! Please restart the dev server and login.',
      user,
      allRolesInDB: allRoles,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
