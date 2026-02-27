import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ── Create Doctor ────────────────────────────────────────────────────────
  const doctorPassword = await bcrypt.hash('Doctor@123', 10);
  const doctor = await prisma.user.upsert({
    where: { email: 'dr.priya@nutritioncare.com' },
    update: {},
    create: {
      name: 'Dr. Priya Sharma',
      email: 'dr.priya@nutritioncare.com',
      password: doctorPassword,
      phone: '+91-9876543210',
      role: UserRole.DOCTOR,
      doctorProfile: {
        create: {
          bio: `Dr. Priya Sharma is a certified Clinical Nutritionist and Dietitian with over 10 years of experience in personalized nutrition therapy. She holds a Master's degree in Food Science and Nutrition from Delhi University and is a registered member of the Indian Dietetic Association (IDA).

She specializes in weight management, therapeutic diets for diabetes, PCOS, thyroid disorders, and sports nutrition. Her evidence-based, holistic approach combines nutritional science with behavioral psychology to create sustainable, lifestyle-based solutions for her clients.

Dr. Priya has helped over 5,000 patients achieve their health goals through personalized nutrition plans that are practical, culturally appropriate, and scientifically sound.`,
          shortBio: 'Certified Clinical Nutritionist & Dietitian | 10+ Years Experience | 5000+ Patients Transformed',
          specialization: 'Clinical Nutrition, Weight Management, Therapeutic Diets, Sports Nutrition',
          qualifications: 'M.Sc. Food Science & Nutrition (Delhi University), Registered Dietitian (RD), Certified Diabetes Educator (CDE)',
          experience: 10,
          consultationFee: 800,
          followUpFee: 500,
          isAcceptingPatients: true,
        },
      },
    },
    include: { doctorProfile: true },
  });

  // ── Doctor Availability (Mon–Sat, 9 AM–6 PM, 45-min slots) ─────────────
  if (doctor.doctorProfile) {
    await prisma.availability.deleteMany({ where: { doctorId: doctor.doctorProfile.id } });
    const workingDays = [1, 2, 3, 4, 5, 6]; // Mon-Sat
    for (const day of workingDays) {
      await prisma.availability.create({
        data: {
          doctorId: doctor.doctorProfile.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
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
    where: { email: 'admin@nutritioncare.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@nutritioncare.com',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  // ── Create Packages ────────────────────────────────────────────────────────
  await prisma.package.deleteMany();

  await prisma.package.createMany({
    data: [
      {
        name: 'Starter Plan',
        description: 'Perfect for those beginning their nutrition journey. Includes a comprehensive assessment and personalized diet plan.',
        price: 1999,
        sessions: 2,
        validity: 30,
        isActive: true,
        isPopular: false,
        sortOrder: 1,
        features: JSON.stringify([
          '1 Initial Consultation (45 min)',
          '1 Follow-up Session (30 min)',
          'Personalized Diet Plan',
          'Body Composition Analysis',
          'WhatsApp Support for 30 days',
          'Diet Chart & Meal Prep Guide',
        ]),
      },
      {
        name: 'Transformation Plan',
        description: 'Our most popular 3-month program for sustainable weight management and lifestyle transformation.',
        price: 4999,
        sessions: 6,
        validity: 90,
        isActive: true,
        isPopular: true,
        sortOrder: 2,
        features: JSON.stringify([
          '1 Initial Consultation (60 min)',
          '5 Follow-up Sessions (45 min each)',
          'Customized Meal Plans (updated monthly)',
          'Grocery Shopping Guide',
          'Recipe Book (50+ healthy recipes)',
          'Body Composition Tracking',
          'WhatsApp Support for 90 days',
          'Supplement Recommendations',
          'Exercise & Nutrition Sync',
        ]),
      },
      {
        name: 'Premium Wellness',
        description: 'Comprehensive 6-month wellness program with priority access, lab interpretation, and continuous support.',
        price: 8999,
        sessions: 12,
        validity: 180,
        isActive: true,
        isPopular: false,
        sortOrder: 3,
        features: JSON.stringify([
          '1 Initial Consultation (60 min)',
          '11 Follow-up Sessions (45 min each)',
          'Priority Appointment Booking',
          'Lab Report Interpretation',
          'Quarterly Health Assessment',
          'Customized Meal Plans (updated bi-weekly)',
          'Exclusive Recipe Database Access',
          'WhatsApp Priority Support (180 days)',
          'Supplement & Nutraceutical Plan',
          'Hormonal Balance Nutrition',
          'Mindful Eating Workshop (online)',
          'Family Meal Planning Guide',
        ]),
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('  Doctor:  dr.priya@nutritioncare.com  | Doctor@123');
  console.log('  Patient: patient@example.com          | Patient@123');
  console.log('  Admin:   admin@nutritioncare.com      | Admin@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
