-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "instagram" TEXT;

-- AlterTable
ALTER TABLE "TenantSettings" ADD COLUMN     "googleMapsUrl" TEXT,
ADD COLUMN     "wifiPassword" TEXT,
ADD COLUMN     "wifiSsid" TEXT;
