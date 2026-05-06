import prisma from '../prisma/client.js'

export const getSkills = async (req, res) => {
  try {
    const search = req.query.search?.trim();

    const skills = await prisma.skill.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : undefined, // better than {}
    });

    return res.json(skills);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
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
export const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      submissionDeadline,
      duration,
      location,
      isPaid,
      status,
      skillIds
    } = req.body;

    const listing = await prisma.internship.create({
      data: {
        title,
        description,
        submissionDeadline: new Date(submissionDeadline),
        duration,
        location,
        isPaid,
        status,

        internshipSkills: {
          create: skillIds.map(id => ({
            skillId: id
          }))
        }
      },
      include: {
        internshipSkills: true
      }
    });

    res.json({ listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const deleteListing = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.internship.delete({
      where: { id }
    });

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const updateListing = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const {
      title,
      description,
      submissionDeadline,
      duration,
      location,
      isPaid,
      status,
      skillIds
    } = req.body;

    const updatedListing = await prisma.internship.update({
      where: { id },
      data: {
        title,
        description,
        submissionDeadline: new Date(submissionDeadline),
        duration,
        location,
        isPaid,
        status,

        internshipSkills: {
          deleteMany: {},
          create: skillIds.map(id => ({
            skillId: id
          }))
        }
      }
    });

    res.json({ updatedListing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};