import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ── Create Doctor (Sneha) ──────────────────────────────────────────────
  const doctorPassword = await bcrypt.hash('Doctor@123', 10);
  const doctor = await prisma.user.upsert({
    where: { email: 'sneha@functionalnutrition.com' },
    update: {},
    create: {
      name: 'Sneha',
      email: 'sneha@functionalnutrition.com',
      password: doctorPassword,
      phone: '+91-9876543210',
      role: UserRole.DOCTOR,
      doctorProfile: {
        create: {
          bio: `Sneha is a certified Functional Nutrition Consultant with over 8 years of experience in personalized nutrition therapy. She combines the principles of functional medicine with evidence-based nutrition to create lasting health transformations.

She specializes in hormonal imbalances (PCOS, thyroid), gut health issues (IBS, bloating, acid reflux), diabetes management, weight management, and autoimmune conditions. Her approach goes beyond calorie counting — she looks at the complete health picture including lab work, lifestyle, stress, sleep, and gut health.

Sneha has helped over 500 clients achieve their health goals through personalized nutrition plans that are practical, rooted in Indian food habits, and scientifically sound.`,
          shortBio: 'Certified Functional Nutrition Consultant | 8+ Years Experience | 500+ Clients Transformed',
          specialization: 'Functional Nutrition, PCOS, Thyroid, Gut Health, Weight Management, Diabetes',
          qualifications: 'Certified Functional Nutrition Consultant, Advanced Clinical Nutrition & Dietetics, Functional Medicine Approach, Gut Microbiome & Hormonal Health Specialist',
          experience: 8,
          consultationFee: 1499,
          followUpFee: 799,
          isAcceptingPatients: true,
        },
      },
    },
    include: { doctorProfile: true },
  });

  // ── Doctor Availability (Mon–Sat, 9 AM–7 PM, 45-min slots) ─────────────
  if (doctor.doctorProfile) {
    await prisma.availability.deleteMany({ where: { doctorId: doctor.doctorProfile.id } });
    const workingDays = [1, 2, 3, 4, 5, 6]; // Mon-Sat
    for (const day of workingDays) {
      await prisma.availability.create({
        data: {
          doctorId: doctor.doctorProfile.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '19:00',
          slotDuration: 45,
          isActive: true,
        },
      });
    }
  }

  // ── Create Test Patient ──────────────────────────────────────────────────
  const patientPassword = await bcrypt.hash('Patient@123', 10);
  await prisma.user.upsert({
    where: { email: 'patient@example.com' },
    update: {},
    create: {
      name: 'Rahul Verma',
      email: 'patient@example.com',
      password: patientPassword,
      phone: '+91-9876543211',
      role: UserRole.PATIENT,
      patientProfile: {
        create: {
          gender: 'Male',
          city: 'Mumbai',
          state: 'Maharashtra',
          healthGoals: 'Weight loss and better energy levels',
        },
      },
    },
  });

  // ── Create Admin ──────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@functionalnutrition.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@functionalnutrition.com',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  // ── Create Super Admin ──────────────────────────────────────────────────
  const superAdminPassword = await bcrypt.hash('Maruthi@2013', 10);
  await prisma.user.upsert({
    where: { email: 'superadmin@admin.com' },
    update: { password: superAdminPassword },
    create: {
      name: 'Super Admin',
      email: 'superadmin@admin.com',
      password: superAdminPassword,
      role: UserRole.SUPER_ADMIN,
    },
  });

  // ── Create Packages ────────────────────────────────────────────────────────
  await prisma.package.deleteMany();

  await prisma.package.createMany({
    data: [
      {
        name: 'Single Consultation',
        description: 'Perfect for a one-time nutrition assessment and personalized diet plan to get you started.',
        price: 1499,
        sessions: 1,
        validity: 30,
        isActive: true,
        isPopular: false,
        sortOrder: 1,
        features: JSON.stringify([
          '60-min video consultation',
          'Complete health assessment',
          'Personalized diet plan',
          'Grocery list & recipes',
          '7-day WhatsApp support',
          'Lab report review',
        ]),
      },
      {
        name: 'Transformation Plan',
        description: 'Our most popular plan for lasting health transformation with regular follow-ups and ongoing support.',
        price: 4999,
        sessions: 4,
        validity: 90,
        isActive: true,
        isPopular: true,
        sortOrder: 2,
        features: JSON.stringify([
          '4 video consultations (60 min each)',
          'Detailed root cause analysis',
          'Monthly diet plan updates',
          'WhatsApp support throughout',
          'Lab report analysis & guidance',
          'Recipe booklet (50+ recipes)',
          'Supplement recommendations',
          'Progress tracking',
        ]),
      },
      {
        name: 'Complete Wellness',
        description: 'Comprehensive 6-month program for complex health conditions requiring deep functional nutrition intervention.',
        price: 8999,
        sessions: 8,
        validity: 180,
        isActive: true,
        isPopular: false,
        sortOrder: 3,
        features: JSON.stringify([
          '8 video consultations (60 min each)',
          'Advanced functional assessment',
          'Bi-weekly diet plan updates',
          'Priority WhatsApp support',
          'Comprehensive lab interpretation',
          'Supplement & nutraceutical plan',
          'Meal prep guides & recipes',
          'Hormonal balance protocol',
          'Gut healing protocol',
          'Progress tracking dashboard',
          'Family meal planning guide',
        ]),
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('  Doctor:  sneha@functionalnutrition.com    | Doctor@123');
  console.log('  Patient: patient@example.com               | Patient@123');
  console.log('  Admin:   admin@functionalnutrition.com    | Admin@123');
  console.log('  SuperAdmin: superadmin@admin.com         | Maruthi@2013');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
