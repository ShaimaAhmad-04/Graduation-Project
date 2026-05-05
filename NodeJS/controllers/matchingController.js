import prisma from "../prisma/client.js"
import axios from "axios"

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000"

export const calculateAndSaveMatch = async (req, res) => {
  try {
    const studentId = req.userId
    const internshipId = Number(req.params.internshipId)

    if (!internshipId) {
      return res.status(400).json({ message: "Invalid internship ID" })
    }

    // 1. Get student skills
    const studentSkillRecords = await prisma.studentSkill.findMany({
      where: { studentId },
      include: {
        skill: true
      }
    })

    const studentSkills = studentSkillRecords.map(record => record.skill.name)

    if (studentSkills.length === 0) {
      return res.status(400).json({
        message: "Student has no skills saved yet"
      })
    }

    // 2. Get internship required skills
    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: {
        company: {
          select: {
            userId: true,
            name: true
          }
        },
        internshipSkills: {
          include: {
            skill: true
          }
        }
      }
    })

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" })
    }

    const requiredSkills = internship.internshipSkills.map(
      item => item.skill.name
    )

    if (requiredSkills.length === 0) {
      return res.status(400).json({
        message: "This internship has no required skills"
      })
    }

    // 3. Send skills to Python
    const pythonResponse = await axios.post(
      `${PYTHON_API_URL}/calculate-match`,
      {
        studentSkills,
        requiredSkills
      }
    )

    const matchResult = pythonResponse.data

    // 4. Save/update application with matching result
    const application = await prisma.application.upsert({
      where: {
        studentId_internshipId: {
          studentId,
          internshipId
        }
      },
      update: {
        matchingScore: matchResult.score,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        matchDetails: matchResult.details
      },
      create: {
        studentId,
        internshipId,
        status: 0,
        matchingScore: matchResult.score,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        matchDetails: matchResult.details
      }
    })

    res.status(200).json({
      message: "Match score calculated and saved successfully",
      application,
      internship: {
        id: internship.id,
        title: internship.title,
        company: internship.company
      },
      studentSkills,
      requiredSkills,
      score: matchResult.score,
      matchedSkills: matchResult.matchedSkills,
      missingSkills: matchResult.missingSkills,
      details: matchResult.details
    })

  } catch (error) {
    res.status(500).json({
      message: "Failed to calculate and save match score",
      error: error.message
    })
  }
}