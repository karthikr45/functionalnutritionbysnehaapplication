ALTER TABLE "Package" ADD COLUMN "serviceSlug" TEXT;
CREATE INDEX "Package_serviceSlug_idx" ON "Package"("serviceSlug");
