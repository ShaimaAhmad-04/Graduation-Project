import { subscribeToArray } from 'rxjs/internal/util/subscribeToArray';
import prisma from '../prisma/client.js'


export const applyApplication= async(req,res)=>{
  const internshipID =parseInt(req.params.id);
  const studentID=req.userID;
    try {
    const existing = await prisma.application.findFirst({
      where: { studentID, internshipID },
    });

    if (existing) {
      return res.status(409).json({ message: "You have already applied to this internship" });
    }

    const application = await prisma.application.create({
      data: {
        studentID,
        internshipID,
        status: 0,
      },
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error:error.message});
  }
};



export const getApplication = async (req, res) => {
  const studentId = req.userId;

  try {
    const applications = await prisma.application.findMany({
      where: { studentId },
      include: { internship: true },
    });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getApplicants = async (req, res) => {
  const internshipId = parseInt(req.params.id);
  const recruiterId = req.userId;

  try {
    const internship = await prisma.internship.findFirst({
      where: { id: internshipId, companyId: recruiterId },
    });

    if (!internship) {
      return res.status(403).json({ message: "Access denied" });
    }

    const applicants = await prisma.application.findMany({
      where: { internshipId},
      include: { student: true },
    });

    res.status(200).json(applicants);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStatus = async (req, res) => {
  const applicationId = parseInt(req.params.id);
  const { status } = req.body;
  const recruiterId = req.userId;

  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { internship: true },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.internship.companyId !== recruiterId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (![0, 1, 2].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
