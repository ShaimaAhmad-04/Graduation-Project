/*
  Warnings:

  - You are about to drop the column `verified` on the `Company` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('verified', 'pending', 'unverified');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "matchingScore" INTEGER,
ALTER COLUMN "status" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "verified",
ADD COLUMN     "status" "CompanyStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Internship" ALTER COLUMN "postDate" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "submissionDeadline" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "InternshipSkill" ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3);
