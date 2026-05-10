import prisma from '../prisma/client.js'
import OpenAI from 'openai'

export const generateRoadmap = async (req, res) => {
  const listingId = parseInt(req.params.listingId)
  const studentId = req.userId

  console.log(`[roadmap] listingId=${listingId} studentId=${studentId}`)

  try {
    const ai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.BASE_URL,
    })
    // 1. Get student skills from DB
    const studentSkills = await prisma.studentSkill.findMany({
      where: { studentId },
      include: { skill: true }
    })

    console.log(`[roadmap] student skills: ${studentSkills.length}`)

    if (!studentSkills.length) {
      return res.status(400).json({ message: 'You have no skills on your profile. Please upload your CV first so we can generate a personalized roadmap.' })
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

    // 3. Call AI to generate roadmap as structured JSON
    const aiResponse = await ai.chat.completions.create({
      model: process.env.MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: `You are a career advisor. Always respond with valid JSON only — no markdown, no explanation outside the JSON.`
        },
        {
          role: 'user',
          content: `A student is applying for a "${internship.title}" internship.
Required skills: ${requiredSkills.join(', ')}.
Student's current skills: ${studentSkillNames.join(', ')}.

Identify the skill gaps and return a learning roadmap as a JSON object in this exact format:
{
  "summary": "One sentence describing the student's situation and what they need to focus on.",
  "steps": [
    {
      "title": "Short skill or topic name",
      "description": "What to learn and why it matters for this role.",
      "duration": "Estimated time (e.g. 1 week)",
      "resources": ["resource name or URL", "resource name or URL"]
    }
  ]
}

Rules:
- Each step covers exactly one skill or concept (not a broad category).
- Order steps logically (prerequisites first).
- 3 to 6 steps total.
- Only include skills the student is missing.
- If the student already has all required skills, return steps for deepening expertise.`
        }
      ]
    })

    let roadmap
    try {
      const raw = aiResponse.choices[0].message.content.trim()
      // Strip markdown code fences if the model wraps JSON in ```json ... ```
      const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      roadmap = JSON.parse(cleaned)
    } catch {
      roadmap = { summary: aiResponse.choices[0].message.content, steps: [] }
    }

    res.status(200).json({ roadmap })

  } catch (error) {
    console.error('[roadmap] error:', error.message)
    res.status(500).json({ error: error.message })
  }
}
