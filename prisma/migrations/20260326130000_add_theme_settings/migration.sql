CREATE TABLE "ThemeSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "primaryColor" TEXT NOT NULL DEFAULT '#16a34a',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ThemeSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "ThemeSettings" ("id", "primaryColor", "updatedAt") VALUES ('global', '#16a34a', CURRENT_TIMESTAMP);
