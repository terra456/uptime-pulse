-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
UPDATE "Service" SET "isActive" = 'true' WHERE "isActive" IS NULL;