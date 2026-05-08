'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

export interface DoctorProfileCardData {
  user: { name: string };
  shortBio?: string | null;
  bio?: string | null;
  specialization?: string | null;
  qualifications?: string | null;
  experience?: number | null;
  consultationFee?: number;
  followUpFee?: number;
  profileImage?: string | null;
  isAcceptingPatients?: boolean;
}

interface Props {
  doctor: DoctorProfileCardData;
  variant?: 'full' | 'compact';
  showFees?: boolean;
}

export default function DoctorProfileCard({ doctor, variant = 'full', showFees = true }: Props) {
  const [showFullBio, setShowFullBio] = useState(false);
  const quals = doctor.qualifications
    ? doctor.qualifications.split(',').map((q) => q.trim()).filter(Boolean)
    : [];

  const hasLongBio = doctor.bio && doctor.bio.length > 200;
  const displayBio = !hasLongBio || showFullBio ? doctor.bio : `${doctor.bio!.slice(0, 200)}…`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary-50 border border-primary-100 overflow-hidden flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
          {doctor.profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={doctor.profileImage} alt={doctor.user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-primary-600">{doctor.user.name?.[0] || '🩺'}</span>
          )}
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <h3 className="font-bold text-gray-900 text-lg font-serif">Dr. {doctor.user.name}</h3>
            {doctor.isAcceptingPatients !== false && (
              <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-[11px] font-medium rounded-full">
                Accepting patients
              </span>
            )}
          </div>

          {doctor.specialization && (
            <p className="text-sm text-primary-700 font-medium mt-0.5">{doctor.specialization}</p>
          )}
          {doctor.shortBio && (
            <p className="text-sm text-gray-600 mt-1">{doctor.shortBio}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
            {quals.map((q) => (
              <span key={q} className="inline-flex items-center px-3 py-1 bg-primary-50 border border-primary-100 text-primary-700 text-xs rounded-full">
                {q}
              </span>
            ))}
          </div>
        </div>
      </div>

      {variant === 'full' && doctor.bio && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{displayBio}</p>
          {hasLongBio && (
            <button
              onClick={() => setShowFullBio((s) => !s)}
              className="mt-2 text-xs font-medium text-primary-600 hover:underline"
            >
              {showFullBio ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {showFees && (doctor.consultationFee !== undefined || doctor.followUpFee !== undefined) && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
          {doctor.consultationFee !== undefined && (
            <div className="bg-primary-50 rounded-xl p-3 text-center">
              <p className="text-[11px] text-primary-700 uppercase tracking-wide font-medium">Consultation</p>
              <p className="font-bold text-primary-700 mt-0.5">{formatCurrency(doctor.consultationFee)}</p>
            </div>
          )}
          {doctor.followUpFee !== undefined && (
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[11px] text-gray-600 uppercase tracking-wide font-medium">Follow-up</p>
              <p className="font-bold text-gray-700 mt-0.5">{formatCurrency(doctor.followUpFee)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
