import { NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { UserRole } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Super admin: fixed credentials — auto-create or fix role
        if (credentials.email.toLowerCase() === 'superadmin@admin.com' && credentials.password === 'Maruthi@2013') {
          try {
            if (user) {
              // Update existing user to SUPER_ADMIN role
              if (user.role !== 'SUPER_ADMIN') {
                user = await prisma.user.update({
                  where: { id: user.id },
                  data: { role: 'SUPER_ADMIN' },
                });
              }
            } else {
              // Create new super admin user
              const hashed = await bcrypt.hash('Maruthi@2013', 10);
              user = await prisma.user.create({
                data: {
                  name: 'Super Admin',
                  email: 'superadmin@admin.com',
                  password: hashed,
                  role: 'SUPER_ADMIN',
                },
              });
            }
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              image: user.image,
            };
          } catch (err) {
            console.error('[super-admin-auth] Error:', err);
            return null;
          }
        }

        if (!user || !user.isActive) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
};

export const getAuthSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  // If super admin is impersonating, return a modified session
  // that looks like the impersonated user for API compatibility
  if (session.user.role === 'SUPER_ADMIN') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = cookies();
      const raw = cookieStore.get('impersonation')?.value;
      if (raw) {
        const impersonation = JSON.parse(raw);
        const impersonatedUser = await prisma.user.findUnique({
          where: { id: impersonation.impersonatedUserId },
          select: { id: true, name: true, email: true, role: true, image: true },
        });
        if (impersonatedUser) {
          return {
            ...session,
            user: {
              id: impersonatedUser.id,
              name: impersonatedUser.name,
              email: impersonatedUser.email,
              role: impersonatedUser.role,
              image: impersonatedUser.image,
            },
            superAdmin: {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
            },
          };
        }
      }
    } catch {}
  }

  return session;
};

// Raw session without impersonation — use in superadmin API routes
export const getRawAuthSession = () => getServerSession(authOptions);

// Extend next-auth types
declare module 'next-auth' {
  interface User {
    role: UserRole;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      image?: string | null;
    };
    superAdmin?: {
      id: string;
      name: string;
      email: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
