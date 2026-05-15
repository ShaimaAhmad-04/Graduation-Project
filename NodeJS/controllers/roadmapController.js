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
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a senior technical career coach. Always respond with valid JSON only matching the exact schema provided. Never omit any field. Recommend modern tools relevant to 2025/2026.'
        },
        {
          role: 'user',
          content: `A student is applying for a "${internship.title}" internship.
Required skills: ${requiredSkills.join(', ')}.
Student's CURRENT skills (do NOT include these as steps): ${studentSkillNames.join(', ')}.

Return a JSON object that EXACTLY matches this schema — every field is required:
{
  "summary": "2-3 sentences: which required skills the student already has, which are missing, and how prepared they are overall.",
  "totalWeeks": 8,
  "steps": [
    {
      "title": "TypeScript",
      "description": "Why this skill is required for ${internship.title} and what to learn.",
      "duration": "2 weeks",
      "priority": "essential",
      "practiceTask": "Build a typed component or module that uses this skill in a real scenario.",
      "resources": ["https://official-docs.com", "https://freecodecamp.org"]
    }
  ]
}

Rules:
- totalWeeks = sum of all step duration weeks as a number.
- priority must be exactly "essential" or "recommended".
- practiceTask must be a single actionable sentence.
- ONLY include skills from the required list that are NOT in the student's current skills.
- 3 to 6 steps, essential gaps first.
- Each step = ONE specific skill or tool.
- All resource URLs must be free and real.
- If student has all required skills, return 3 steps to deepen expertise for interviews.`
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
