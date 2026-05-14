-- Doctor approval workflow for user-submitted product reviews.
-- New reviews start unapproved and require explicit doctor action.
-- Pre-existing reviews remain visible (already isApproved=true).

ALTER TABLE "ProductReview" ALTER COLUMN "isApproved" SET DEFAULT false;
ALTER TABLE "ProductReview" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "ProductReview" ADD COLUMN "approvedById" TEXT;
ALTER TABLE "ProductReview" ADD COLUMN "approvalNote" TEXT;

-- Backfill: rows that were already isApproved=true get an approvedAt
-- timestamp = createdAt so the audit log isn't empty.
UPDATE "ProductReview"
SET "approvedAt" = "createdAt"
WHERE "isApproved" = true AND "approvedAt" IS NULL;
