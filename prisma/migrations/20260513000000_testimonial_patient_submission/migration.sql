-- Patient-submitted testimonials with doctor approval workflow.
-- Existing rows are doctor-authored and stay visible (source=DOCTOR,
-- isApproved=true backfill).

CREATE TYPE "TestimonialSource" AS ENUM ('DOCTOR', 'PATIENT');

ALTER TABLE "Testimonial" ADD COLUMN "source" "TestimonialSource" NOT NULL DEFAULT 'DOCTOR';
ALTER TABLE "Testimonial" ADD COLUMN "isApproved" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Testimonial" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "Testimonial" ADD COLUMN "approvedById" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN "approvalNote" TEXT;

-- Backfill: existing rows are doctor-authored & already published, mark
-- them as approved at their creation time so the audit log isn't empty.
UPDATE "Testimonial" SET "approvedAt" = "createdAt" WHERE "approvedAt" IS NULL;

CREATE INDEX "Testimonial_isApproved_source_idx" ON "Testimonial"("isApproved", "source");
