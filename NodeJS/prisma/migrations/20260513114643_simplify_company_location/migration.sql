/*
  Warnings:

  - The `location` column on the `Internship` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `CompanyLocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InternshipLocation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CompanyLocation" DROP CONSTRAINT "CompanyLocation_companyId_fkey";

-- DropForeignKey
ALTER TABLE "InternshipLocation" DROP CONSTRAINT "InternshipLocation_internshipId_fkey";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "location" VARCHAR(255);

-- AlterTable
ALTER TABLE "Internship" DROP COLUMN "location",
ADD COLUMN     "location" VARCHAR(255);

-- DropTable
DROP TABLE "CompanyLocation";

-- DropTable
DROP TABLE "InternshipLocation";
