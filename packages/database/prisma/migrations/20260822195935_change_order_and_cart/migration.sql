-- AlterTable
ALTER TABLE "CartSession" ADD COLUMN     "confirmedGuests" TEXT[] DEFAULT ARRAY[]::TEXT[];
