/*
  Warnings:

  - You are about to drop the column `email` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `Tenant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Tenant_email_key";

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "email",
DROP COLUMN "passwordHash",
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_stripeSubscriptionId_key" ON "Tenant"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
