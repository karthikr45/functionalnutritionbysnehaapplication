import Razorpay from 'razorpay';
import crypto from 'crypto';

let _razorpay: Razorpay | null = null;

function getRazorpay() {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return _razorpay;
}

export { getRazorpay as razorpay };

export async function createRazorpayOrder(amount: number, receipt: string) {
  const order = await getRazorpay().orders.create({
    amount: Math.round(amount * 100), // paise
    currency: 'INR',
    receipt,
    notes: { app: 'Functional Nutrition by Sneha' },
  });
  return order;
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}
