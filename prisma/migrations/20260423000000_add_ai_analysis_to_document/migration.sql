-- Add AI analysis cache to Document
ALTER TABLE "Document" ADD COLUMN "aiAnalysis" TEXT;
ALTER TABLE "Document" ADD COLUMN "aiAnalyzedAt" TIMESTAMP(3);
