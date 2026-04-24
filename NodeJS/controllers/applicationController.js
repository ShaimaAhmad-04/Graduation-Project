import prisma from '../prisma/client.js'

// GET /applications/:internshipId — recruiter views applicants for their internship
export const getApplicants = async (req, res) => {
  const internshipId = parseInt(req.params.internshipId)
  const recruiterId = req.userId

  try {
    // Make sure this internship belongs to the recruiter
    const internship = await prisma.internship.findFirst({
      where: { id: internshipId, companyId: recruiterId }
    })

    if (!internship) {
      return res.status(403).json({ message: "Access denied" })
    }

    const applicants = await prisma.application.findMany({
      where: { internshipId },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true, phoneNumber: true }
            },
            studentSkills: {
              include: { skill: { select: { id: true, name: true } } }
            }
          }
        }
      }
    })

    res.status(200).json(applicants)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// PUT /applications/:id/status — recruiter accepts or rejects an application
export const updateApplicationStatus = async (req, res) => {
  const applicationId = parseInt(req.params.id)
  const { status } = req.body
  const recruiterId = req.userId

  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { internship: true }
    })

    if (!application) {
      return res.status(404).json({ message: "Application not found" })
    }

    if (application.internship.companyId !== recruiterId) {
      return res.status(403).json({ message: "Access denied" })
    }

    if (![0, 1, 2].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 0 (pending), 1 (accepted), 2 (rejected)" })
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status }
    })

    res.status(200).json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
