/*
  Warnings:

  - You are about to drop the column `address` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `coverUrl` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `instagram` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Tenant` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TenantSettings" DROP CONSTRAINT "TenantSettings_tenantId_fkey";

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "address",
DROP COLUMN "coverUrl",
DROP COLUMN "description",
DROP COLUMN "instagram",
DROP COLUMN "logoUrl",
DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "TenantSettings" ADD COLUMN     "address" TEXT,
ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "phone" TEXT;

-- AddForeignKey
ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
