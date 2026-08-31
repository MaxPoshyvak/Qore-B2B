-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "selectedModifiers" JSONB;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "selectedModifiers" JSONB;
