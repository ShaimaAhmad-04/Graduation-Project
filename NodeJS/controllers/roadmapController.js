import prisma from '../prisma/client.js'
import fetch from 'node-fetch'
import fs from 'fs'
import FormData from 'form-data'
import OpenAI from 'OpenAI'


// setting up AI client

const ai= new openAI({
  apiKey:process.env.OPENAI_API_KEY,
  baseURL: process.env.BASE_URL,
});
//When a student uploads a CV, multer saves it temporarily on disk and gives you req.file.
//now we'll take that file and send it to the FastAPI server

export const generateRoadmap = async (req, res) => {
  const listingId = parseInt(req.params.listingId)
  const studentId = req.userId

  try {
    // 1. Forward CV to Python
    const formData = new FormData()
    formData.append('file', fs.createReadStream(req.file.path), req.file.originalname)

    const pythonRes = await fetch('http://localhost:8000/upload-cv', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    })

    if (!pythonRes.ok) {
      return res.status(500).json({ message: 'CV parsing failed' })
    }

    const pythonData = await pythonRes.json()
    const studentSkills = pythonData.data.skills

    // 2. Cleanup temp file as python already has it
    fs.unlinkSync(req.file.path)

    // 3. Get internship + required skills from DB
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

    // 4. Call AI to generate roadmap
    const aiResponse = await ai.chat.completions.create({
      model: process.env.MODEL_NAME,
      messages: [
        {
          role: 'user',
          content: `
            A student is applying for a "${internship.title}" internship.
            The internship requires these skills: ${requiredSkills.join(', ')}.
            The student currently has these skills: ${studentSkills.join(', ')}.
            Identify the skill gaps and generate a clear structured learning roadmap.
            Include specific resources, estimated time per skill, and a logical learning order.
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