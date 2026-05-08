import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DoctorProfileCard from '@/components/DoctorProfileCard';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Meet Your Doctor — Gut Shell',
  description: 'Learn about the functional nutritionist behind your consultation — credentials, specialization, and approach.',
};

export default async function AboutDoctorPage() {
  const profile = await prisma.doctorProfile.findFirst({
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-cream-dark to-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-10">
            <p className="text-primary-600 text-sm font-medium uppercase tracking-wider mb-2">Meet Your Doctor</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif">
              {profile ? `Dt. ${profile.user.name}` : 'Your Nutritionist'}
            </h1>
            {profile?.specialization && (
              <p className="text-gray-600 mt-2">{profile.specialization}</p>
            )}
          </div>

          {!profile ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <p className="text-5xl mb-4">🩺</p>
              <p className="text-gray-500">Doctor profile is being set up. Please check back soon.</p>
            </div>
          ) : (
            <>
              <DoctorProfileCard
                doctor={{
                  user: { name: profile.user.name },
                  bio: profile.bio,
                  shortBio: profile.shortBio,
                  specialization: profile.specialization,
                  qualifications: profile.qualifications,
                  experience: profile.experience,
                  consultationFee: profile.consultationFee,
                  profileImage: profile.profileImage,
                  isAcceptingPatients: profile.isAcceptingPatients,
                }}
              />

              <div className="text-center mt-10">
                <Link
                  href={profile.isAcceptingPatients ? '/#packages' : '/#contact'}
                  className="inline-block px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-sm"
                >
                  {profile.isAcceptingPatients ? 'Book a Consultation' : 'Get In Touch'}
                </Link>
                <p className="text-xs text-gray-400 mt-3">
                  {profile.isAcceptingPatients
                    ? 'Secure Razorpay checkout · Consultations via video call'
                    : 'Currently not accepting new patients — leave a message and we&apos;ll reach out.'}
                </p>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
