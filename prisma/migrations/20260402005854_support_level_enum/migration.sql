/*
  Warnings:

  - Changed the type of `supportLevel` on the `Agent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SupportLevel" AS ENUM ('LEVEL_1', 'LEVEL_2', 'LEVEL_3');

-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "supportLevel",
ADD COLUMN     "supportLevel" "SupportLevel" NOT NULL;
