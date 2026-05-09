-- Add PaymentMode enum and Payment.mode column.
-- All existing payment rows are tagged as TEST (the user confirmed all
-- pre-existing payments were made with Razorpay test keys before live
-- keys were configured). Going forward, /api/payment/create-order sets
-- mode based on the RAZORPAY_KEY_ID prefix (rzp_test_* or rzp_live_*).
CREATE TYPE "PaymentMode" AS ENUM ('TEST', 'LIVE');

-- Default 'TEST' so existing rows are correctly tagged on the column add.
ALTER TABLE "Payment" ADD COLUMN "mode" "PaymentMode" NOT NULL DEFAULT 'TEST';

-- Index for the revenue queries that filter by mode = 'LIVE'.
CREATE INDEX "Payment_mode_status_idx" ON "Payment"("mode", "status");
