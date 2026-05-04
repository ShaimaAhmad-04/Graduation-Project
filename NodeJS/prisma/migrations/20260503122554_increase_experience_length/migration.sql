/*
  Warnings:

  - The `graduationYear` column on the `Student` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `certifications` column on the `Student` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "experience" SET DATA TYPE TEXT,
DROP COLUMN "graduationYear",
ADD COLUMN     "graduationYear" INTEGER,
DROP COLUMN "certifications",
ADD COLUMN     "certifications" TEXT[];
