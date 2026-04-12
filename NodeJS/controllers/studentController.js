import prisma from '../prisma/client.js'


// Returns the full profile of the logged in student
export const getStudentProfile = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.userId },// from authenticate.js
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            role: true
          }
        }
      }
    })

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" })
    }

    res.json(student)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Updates the logged in student's profile
export const updateStudentProfile = async (req, res) => {
  try {
    const {
      major,
      university,
      experience,
      gpa,
      graduationYear,
      linkedinUrl,
      githubUrl,
      certifications,
      cvUrl
    } = req.body

    const student = await prisma.student.update({
      where: { userId: req.userId },
      data: {
        major,
        university,
        experience,
        gpa,
        graduationYear,
        linkedinUrl,
        githubUrl,
        certifications,
        cvUrl
      }
    })

    res.json(student)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getStudentCV = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.userId },
      select: {
        cvUrl: true
      }
    })

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    res.json(student)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getStudentSkills = async (req, res) => {
  try {
    const skills = await prisma.studentSkill.findMany({
      where: { studentId: req.userId },
      include: {
        skill: {
          select: {
            name: true
          }
        }
      }
    })

    res.json(skills)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}


export const addStudentSkill = async (req, res) => {
  try {
    const { skillId, experience } = req.body

    const skill = await prisma.skill.findUnique({
      where: { id: skillId }
    })

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" })
    }

    const existingSkill = await prisma.studentSkill.findUnique({
      where: {
        studentId_skillId: {
          studentId: req.userId,
          skillId
        }
      }
    })

    if (existingSkill) {
      return res.status(400).json({ message: "Skill already added" })
    }

    const studentSkill = await prisma.studentSkill.create({
      data: {
        studentId: req.userId,
        skillId,
        experience
      }
    })

    res.json(studentSkill)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
export const removeStudentSkill = async (req, res) => {
  try {
    const skillId = parseInt(req.params.skillId)

    const existingSkill = await prisma.studentSkill.findUnique({
      where: {
        studentId_skillId: {
          studentId: req.userId,
          skillId
        }
      }
    })

    if (!existingSkill) {
      return res.status(404).json({ message: "Skill not found" })
    }

    await prisma.studentSkill.delete({
      where: {
        studentId_skillId: {
          studentId: req.userId,
          skillId
        }
      }
    })

    res.json({ message: "Skill removed successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getStudentApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { studentId: req.userId },
      include: {
        internship: {
          select: {
            title: true,
            description: true,
            location: true,
            isPaid: true,
            status: true,
            submissionDeadline: true
          }
        }
      }
    })

    res.json(applications)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getStudentRoadmaps = async (req, res) => {
  try {
    const roadmaps = await prisma.roadmap.findMany({
      where: { studentId: req.userId },
      include: {
        nodes: {
          orderBy: {
            orderIndex: "asc" 
          }
        }
      }
    })

    res.json(roadmaps)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}