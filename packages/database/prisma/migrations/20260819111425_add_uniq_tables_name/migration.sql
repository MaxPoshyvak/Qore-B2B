/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,name]` on the table `Table` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Table_tenantId_name_key" ON "Table"("tenantId", "name");
