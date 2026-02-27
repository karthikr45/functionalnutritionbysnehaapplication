import { UserRole, AppointmentStatus, AppointmentType, PackageBookingStatus, PaymentStatus, DocumentType } from '@prisma/client';

export type { UserRole, AppointmentStatus, AppointmentType, PackageBookingStatus, PaymentStatus, DocumentType };

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface AvailableSlot {
  date: string;
  slots: TimeSlot[];
}

export interface PackageFeature {
  text: string;
}

export interface BookingFormData {
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  healthConcerns?: string;
  packageBookingId?: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}
