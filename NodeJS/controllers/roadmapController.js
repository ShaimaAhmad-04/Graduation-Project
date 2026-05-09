import prisma from '../prisma/client.js'
import OpenAI from 'openai'

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.BASE_URL,
})

export const generateRoadmap = async (req, res) => {
  const listingId = parseInt(req.params.listingId)
  const studentId = req.userId

  try {
    // 1. Get student skills from DB
    const studentSkills = await prisma.studentSkill.findMany({
      where: { studentId },
      include: { skill: true }
    })

    if (!studentSkills.length) {
      return res.status(400).json({ message: 'No skills found. Please upload your CV first.' })
    }

    const studentSkillNames = studentSkills.map(s => s.skill.name)

    // 2. Get internship + required skills from DB
    const internship = await prisma.internship.findUnique({
      where: { id: listingId },
      include: {
        internshipSkills: {
          include: { skill: true }
        }
      }
    })

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' })
    }

    const requiredSkills = internship.internshipSkills.map(s => s.skill.name)

    // 3. Call AI to generate roadmap
    const aiResponse = await ai.chat.completions.create({
      model: process.env.MODEL_NAME,
      messages: [
        {
          role: 'user',
          content: `
            A student is applying for a "${internship.title}" internship.
            The internship requires these skills: ${requiredSkills.join(', ')}.
            The student currently has these skills: ${studentSkillNames.join(', ')}.
            Identify the skill gaps and generate a clear structured learning roadmap.
            Include specific resources, estimated time per skill, and a logical learning order.
            - Each step must be specific to a single technology or concept, not a broad category
            (e.g. "Learn React hooks" not "Learn frontend development").
          `
        }
      ]
    })

    const roadmap = aiResponse.choices[0].message.content

    res.status(200).json({ roadmap })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
