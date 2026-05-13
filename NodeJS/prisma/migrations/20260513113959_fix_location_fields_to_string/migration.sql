/*
  Warnings:

  - The primary key for the `CompanyLocation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `InternshipLocation` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "CompanyLocation" DROP CONSTRAINT "CompanyLocation_pkey",
ALTER COLUMN "city" SET DATA TYPE TEXT,
ALTER COLUMN "country" SET DATA TYPE TEXT,
ADD CONSTRAINT "CompanyLocation_pkey" PRIMARY KEY ("companyId", "city", "country");

-- AlterTable
ALTER TABLE "InternshipLocation" DROP CONSTRAINT "InternshipLocation_pkey",
ALTER COLUMN "city" SET DATA TYPE TEXT,
ALTER COLUMN "country" SET DATA TYPE TEXT,
ADD CONSTRAINT "InternshipLocation_pkey" PRIMARY KEY ("internshipId", "city", "country");
