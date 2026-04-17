import prisma from '../prisma/client.js'

export const getSkills = async (req, res) => {
  try {
    const skills = await prisma.skill.findMany()
    res.json(skills)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const addSkill = async (req, res) => {
  try {
    const { name } = req.body

    const existingSkill = await prisma.skill.findUnique({ where: { name } })
    if (existingSkill) {
      return res.status(400).json({ message: "Skill already exists" })
    }

    const skill = await prisma.skill.create({ data: { name } })
    res.json(skill)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteSkill = async (req, res) => {
  try {
    const skillId = parseInt(req.params.id)

    const skill = await prisma.skill.findUnique({ where: { id: skillId } })
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" })
    }

    await prisma.skill.delete({ where: { id: skillId } })
    res.json({ message: "Skill deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}