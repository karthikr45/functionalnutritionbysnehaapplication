-- Add optional recipientId to Document so doctor can assign uploads to a specific patient.
ALTER TABLE "Document" ADD COLUMN "recipientId" TEXT;

-- Indexes for the two read paths (by recipient, by uploader).
CREATE INDEX "Document_recipientId_idx" ON "Document"("recipientId");
CREATE INDEX "Document_uploadedById_idx" ON "Document"("uploadedById");

-- FK to User, set null on user deletion to preserve doc history.
ALTER TABLE "Document" ADD CONSTRAINT "Document_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
