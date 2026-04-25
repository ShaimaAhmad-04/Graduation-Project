import prisma from '../prisma/client.js'

export const getCompanyProfile = async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.userId },
      include: {
        user: {
          select: {
            firstName: true,
            email: true,
            phoneNumber: true,
            role: true
          }
        }
      }
    })

    if (!company) {
      return res.status(404).json({ message: "Company profile not found!" })
    }

    res.json(company)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateCompanyProfile = async (req, res) => {
  try {
    const { name, description, industry, website } = req.body

    if (!name) {
      return res.status(400).json({ message: "Required fields are missing!" })
    }

    const company = await prisma.company.update({
      where: { userId: req.userId },
      data: { name, description, industry, website }
    })

    res.json(company)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// return all listings for a company with match score for each applicant
export const getCompanyApplications = async (req, res) => {
  try {
    const companyId = req.userId

    const applications = await prisma.application.findMany({
      where: {
        internship: { companyId }
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            },
            studentSkills: {
              include: { skill: true }
            }
          }
        },
        internship: {
          include: { internshipSkills: true }
        }
      }
    })
    // app short for application
    const result = applications.map(app => {
      //filler matching algorithm until we do it
      //basic skill matching
      const studentSkillIds = app.student.studentSkills.map(s => s.skillId)
      const internshipSkillIds = app.internship.internshipSkills.map(s => s.skillId)
      const matchedSkills = studentSkillIds.filter(id => internshipSkillIds.includes(id))
      const matchingScore = internshipSkillIds.length > 0
        ? Math.round((matchedSkills.length / internshipSkillIds.length) * 100)
        : 0

      return {
        applicationId: app.id,
        applicantName: `${app.student.user.firstName} ${app.student.user.lastName}`,
        major: app.student.major,
        matchingScore,
        status: app.status
      }
    })

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Top 3 closing soon internships (within 7 days)
export const getClosingSoonInternships = async (req, res) => {
  try {
    const companyId = req.userId
    const now = new Date()
    const in7Days = new Date()
    in7Days.setDate(now.getDate() + 7)

    const internships = await prisma.internship.findMany({
      where: {
        companyId,
        submissionDeadline: {
          gte: now,
          lte: in7Days
        }
      },
      include: {
        _count: { select: { applications: true } }
      },
      orderBy: { submissionDeadline: 'asc' },
      take: 3
    })

    const result = internships.map(i => ({
      title: i.title,
      deadline: i.submissionDeadline,
      applicantsCount: i._count.applications
    }))

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Top 3 matching applicants across all applications
export const getTopMatchingApplicants = async (req, res) => {
  try {
    const companyId = req.userId

    const applications = await prisma.application.findMany({
      where: {
        internship: { companyId }
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            },
            studentSkills: true
          }
        },
        internship: {
          include: { internshipSkills: true }
        }
      }
    })

    const scored = applications.map(app => {
      const studentSkillIds = app.student.studentSkills.map(s => s.skillId)
      const internshipSkillIds = app.internship.internshipSkills.map(s => s.skillId)
      const matchedSkills = studentSkillIds.filter(id => internshipSkillIds.includes(id))
      const matchingScore = internshipSkillIds.length > 0
        ? Math.round((matchedSkills.length / internshipSkillIds.length) * 100)
        : 0

      return {
        applicantName: `${app.student.user.firstName} ${app.student.user.lastName}`,
        major: app.student.major,
        matchingScore
      }
    })

    const top3 = scored.sort((a, b) => b.matchingScore - a.matchingScore).slice(0, 3)
    res.json(top3)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Application stats per company
export const getInternshipStats = async (req, res) => {
  try {
    const companyId = req.userId

    const internships = await prisma.internship.findMany({
      where: { companyId },
      include: { applications: true }
    })

    const result = internships.map(i => ({
      internshipId: i.id,
      title: i.title,
      postDate: i.postDate,
      totalApplications: i.applications.length,
      pending: i.applications.filter(a => a.status === 0).length,
      accepted: i.applications.filter(a => a.status === 1).length,
      rejected: i.applications.filter(a => a.status === 2).length
    }))

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Company dashboard summary counts
export const getCompanyDashboardSummary = async (req, res) => {
  try {
    const companyId = req.userId

    const activeInternships = await prisma.internship.count({
      where: { companyId, status: true }
    })

    const totalApplicants = await prisma.application.count({
      where: {
        internship: { companyId, status: true }
      }
    })

    const pendingReviews = await prisma.application.count({
      where: {
        internship: { companyId },
        status: 0
      }
    })

    const totalAccepted = await prisma.application.count({
      where: {
        internship: { companyId },
        status: 1
      }
    })

    res.json({
      activeInternships,
      totalApplicants,
      pendingReviews,
      totalAccepted
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}