/*
  Warnings:

  - You are about to drop the column `date` on the `InternshipSkill` table. All the data in the column will be lost.
  - You are about to drop the column `matchingScore` on the `InternshipSkill` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "matchingScore" INTEGER,
ALTER COLUMN "status" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "InternshipSkill" DROP COLUMN "date",
DROP COLUMN "matchingScore";
