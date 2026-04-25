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

export const applyToInternship = async (req, res) => {
  try {
    const { internshipId } = req.body
    const studentId = req.userId

    const existing = await prisma.application.findFirst({
      where: { studentId, internshipId }
    })
    if (existing) {
      return res.status(400).json({ message: "You have already applied to this internship" })
    }

    const application = await prisma.application.create({
      data: { studentId, internshipId, status: 0 }
    })

    res.status(201).json(application)
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

const ROADMAP_STEPS = {
  'Full Stack Developer':          ['Frontend Basics', 'Backend Development', 'Databases & APIs', 'Deployment & DevOps'],
  'Frontend Developer':            ['HTML & CSS Fundamentals', 'JavaScript Mastery', 'Modern Frameworks', 'Performance & Testing'],
  'Backend Developer':             ['Programming Fundamentals', 'Server & APIs', 'Databases & ORM', 'Security & Scalability'],
  'Mobile App Developer':          ['Mobile UI Fundamentals', 'Cross-Platform Development', 'State & Storage', 'Publishing & Testing'],
  'DevOps Engineer':               ['Linux & Networking', 'CI/CD Pipelines', 'Containers & Orchestration', 'Monitoring & Cloud'],
  'Data Scientist':                ['Python & Statistics', 'Data Wrangling', 'Machine Learning Models', 'Data Visualization'],
  'Machine Learning Engineer':     ['Math & Python Foundations', 'ML Algorithms', 'Deep Learning', 'MLOps & Deployment'],
  'UI/UX Designer':                ['Design Principles', 'Wireframing & Prototyping', 'User Research', 'Design Systems'],
  'Cybersecurity Analyst':         ['Networking Basics', 'Security Fundamentals', 'Ethical Hacking', 'Incident Response'],
  'Cloud Infrastructure Engineer': ['Cloud Basics', 'Infrastructure as Code', 'Networking & Storage', 'Cost & Performance'],
  'Business Intelligence Analyst': ['SQL & Data Modeling', 'BI Tools', 'Dashboard Design', 'Advanced Analytics'],
  'Digital Marketing Specialist':  ['Marketing Fundamentals', 'SEO & Content', 'Social Media & Ads', 'Analytics & Reporting'],
};

export const createRoadmap = async (req, res) => {
  try {
    const { desiredPosition } = req.body;
    const studentId = req.userId;

    if (!desiredPosition) {
      return res.status(400).json({ message: 'desiredPosition is required' });
    }

    const steps = ROADMAP_STEPS[desiredPosition] ?? ['Foundation Skills', 'Core Technologies', 'Build Projects', 'Advanced Concepts'];

    const roadmap = await prisma.roadmap.create({
      data: {
        studentId,
        desiredPosition,
        generatedAt: new Date(),
        nodes: {
          create: steps.map((title, index) => ({
            nodeId: index + 1,
            title,
            orderIndex: index + 1
          }))
        }
      },
      include: { nodes: { orderBy: { orderIndex: 'asc' } } }
    });

    res.status(201).json(roadmap);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

export const updateStudentUserInfo = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber } = req.body

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { firstName, lastName, phoneNumber },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        email: true,
        role: true
      }
    })

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}