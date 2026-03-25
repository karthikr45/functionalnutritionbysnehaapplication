import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Temporary debug endpoint — remove after fixing
export async function GET() {
  try {
    // Check if super admin exists
    const user = await prisma.user.findUnique({
      where: { email: 'superadmin@admin.com' },
      select: { id: true, email: true, name: true, role: true, isActive: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ exists: false, message: 'Super admin user not found in DB' });
    }

    // Test bcrypt
    const bcryptMatch = await bcrypt.compare('Maruthi@2013', user.password);

    // Test direct string comparison
    const roleCheck = user.role === 'SUPER_ADMIN';
    const roleValue = user.role;

    // Check all enum values
    const allRoles = await prisma.user.groupBy({ by: ['role'], _count: true });

    return NextResponse.json({
      exists: true,
      id: user.id,
      email: user.email,
      role: roleValue,
      roleIsSuperAdmin: roleCheck,
      isActive: user.isActive,
      bcryptMatch,
      passwordLength: user.password.length,
      allRolesInDB: allRoles,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
