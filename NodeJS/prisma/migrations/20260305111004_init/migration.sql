-- CreateEnum
CREATE TYPE "Location" AS ENUM ('Remote', 'In_site', 'Hybrid');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50),
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "role" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "userId" INTEGER NOT NULL,
    "major" INTEGER,
    "university" VARCHAR(100),
    "experience" VARCHAR(255),
    "gpa" DECIMAL(65,30),
    "graduationYear" TIMESTAMP(3),
    "linkedinUrl" VARCHAR(255),
    "githubUrl" VARCHAR(255),
    "certifications" TEXT,
    "cvUrl" VARCHAR(255),

    CONSTRAINT "Student_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Company" (
    "userId" INTEGER NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "industry" VARCHAR(100),
    "website" VARCHAR(255),
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Internship" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" VARCHAR(200),
    "postDate" DATE NOT NULL,
    "submissionDeadline" DATE NOT NULL,
    "duration" VARCHAR(50),
    "location" "Location" NOT NULL,
    "isPaid" BOOLEAN NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "Internship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternshipSkill" (
    "internshipId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "matchingScore" INTEGER,
    "date" DATE,

    CONSTRAINT "InternshipSkill_pkey" PRIMARY KEY ("internshipId","skillId")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "internshipId" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roadmap" (
    "roadmapId" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "desiredPosition" VARCHAR(100),
    "generatedAt" TIMESTAMP(3),

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("roadmapId")
);

-- CreateTable
CREATE TABLE "RoadmapNode" (
    "nodeId" INTEGER NOT NULL,
    "roadmapId" INTEGER NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "RoadmapNode_pkey" PRIMARY KEY ("nodeId","roadmapId")
);

-- CreateTable
CREATE TABLE "StudentInternship" (
    "studentId" INTEGER NOT NULL,
    "internshipId" INTEGER NOT NULL,

    CONSTRAINT "StudentInternship_pkey" PRIMARY KEY ("studentId","internshipId")
);

-- CreateTable
CREATE TABLE "StudentSkill" (
    "studentId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "experience" INTEGER,

    CONSTRAINT "StudentSkill_pkey" PRIMARY KEY ("studentId","skillId")
);

-- CreateTable
CREATE TABLE "CompanyLocation" (
    "companyId" INTEGER NOT NULL,
    "city" INTEGER NOT NULL,
    "country" INTEGER NOT NULL,
    "street" VARCHAR(50),

    CONSTRAINT "CompanyLocation_pkey" PRIMARY KEY ("companyId","city","country")
);

-- CreateTable
CREATE TABLE "InternshipLocation" (
    "internshipId" INTEGER NOT NULL,
    "city" INTEGER NOT NULL,
    "country" INTEGER NOT NULL,
    "street" VARCHAR(50),

    CONSTRAINT "InternshipLocation_pkey" PRIMARY KEY ("internshipId","city","country")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipSkill" ADD CONSTRAINT "InternshipSkill_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "Internship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipSkill" ADD CONSTRAINT "InternshipSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "Internship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapNode" ADD CONSTRAINT "RoadmapNode_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("roadmapId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentInternship" ADD CONSTRAINT "StudentInternship_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentInternship" ADD CONSTRAINT "StudentInternship_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "Internship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSkill" ADD CONSTRAINT "StudentSkill_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSkill" ADD CONSTRAINT "StudentSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyLocation" ADD CONSTRAINT "CompanyLocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipLocation" ADD CONSTRAINT "InternshipLocation_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "Internship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
