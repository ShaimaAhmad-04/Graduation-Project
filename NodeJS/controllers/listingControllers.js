import prisma from '../prisma/client.js'

export const createListing = async (req, res) => {
  try {
    const companyId = parseInt(req.userId, 10);
    const { title, submissionDeadline, location, isPaid, status, description, duration, skillIds } = req.body;
    const postDate = new Date();

    if (!title || !submissionDeadline || !location || isPaid === undefined || status === undefined) {
      return res.status(400).json({ message: "Required field(s) are missing!" });
    }
    if (!Array.isArray(skillIds) || skillIds.length === 0) { // we add skills to the validation to make sure every listing has skills that we can use later to create mathcing 
      return res.status(400).json({ message: "At least one skill is required." });
    }

    // Ensure company record exists (safe after DB resets)
    const companyExists = await prisma.company.findUnique({ where: { userId: companyId } });
    if (!companyExists) {
      const user = await prisma.user.findUnique({ where: { id: companyId }, select: { firstName: true } });
      if (!user) return res.status(404).json({ message: 'User not found. Please log out and sign in again.' });
      await prisma.company.create({ data: { userId: companyId, name: user.firstName } });
    }

    const listing = await prisma.internship.create({
      data: { companyId, title, postDate, submissionDeadline, location, isPaid, status, description, duration }
    });

    // Save required skills
    if (Array.isArray(skillIds) && skillIds.length > 0) {
      await prisma.internshipSkill.createMany({
        data: skillIds.map(skillId => ({ internshipId: listing.id, skillId }))
      });
    }

    res.status(200).json({ listing });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export const getListings = async (req, res) => {
  try {
    //When the frontend calls GET /listings?location=Remote&isPaid=true
    const { location, isPaid, status, skillId } = req.query
    // location = "Remote", isPaid = "true"

    // all filters are optional — if none provided, returns all listings
    // usage: GET /listings?location=Remote&isPaid=true&skillId=1

    const listings = await prisma.internship.findMany({
      where: {
        ...(location && { location }),
        //only add location to the filter if it was provided
        ...(isPaid !== undefined && { isPaid: isPaid === "true" }),
        ...(status !== undefined && { status: status === "true" }),
        ...(skillId && {
          internshipSkills: {
            some: {
              skillId: parseInt(skillId)
            }
          }
        })
        //return internships that have at least one skill matching this skillId
      },
      include: {
        company: {
          select: { name: true, verified: true }
        },
        internshipSkills: {
          include: {
            skill: {
              select: { name: true }
            }
          }
        }
      }
    });

    res.status(200).json({ listings });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export const getListing = async (req, res) => {
  try {
    const listingId = parseInt(req.params.id); // cause the id isn't coming from the req.body but from the route
    // parseInt is used cause the route params apparently comes in string and not int

    const listing = await prisma.internship.findUnique({
      where: { id: listingId },
      include: {
        company: { select: { name: true, verified: true } },
        internshipSkills: {
          include: { skill: { select: { name: true } } }
        }
      }
    });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found!" });
    }

    res.status(200).json({ listing });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export const updateListing = async (req, res) => {
  try {
    const listingId = parseInt(req.params.id);
    const listing = await prisma.internship.findUnique({ where: { id: listingId } });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found!" });
    }

    if (req.userId != listing.companyId) {
      // this checks if the requester is the owner of the listing
      return res.status(403).json({ message: "User is not authorized!" });
    }

    const { title, submissionDeadline, location, isPaid, status, description, duration, skillIds } = req.body;

    const updatedListing = await prisma.internship.update({
      where: { id: listingId },
      data: { title, submissionDeadline, location, isPaid, status, description, duration }
    });

    // Update skills if provided
    if (Array.isArray(skillIds)) {
      await prisma.internshipSkill.deleteMany({ where: { internshipId: listingId } });
      if (skillIds.length > 0) {
        await prisma.internshipSkill.createMany({
          data: skillIds.map(skillId => ({ internshipId: listingId, skillId }))
        });
      }
    }

    res.status(200).json({ updatedListing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const deleteListing = async (req, res) => {
  try {
    const listingId = parseInt(req.params.id);
    const listing = await prisma.internship.findUnique({ where: { id: listingId } });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found!" });
    }

    if (req.userId != listing.companyId && req.userRole != 2) {
      // if he's not the owner and isn't an admin
      return res.status(403).json({ message: "User is not authorized!" });
    }

    await prisma.internship.delete({ where: { id: listing.id } });

    res.status(200).json({ message: "Deletion successful!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const addSkillToListing = async (req, res) => {
  try {
    const internshipId = parseInt(req.params.id)
    const { skillName } = req.body

    if (!skillName || skillName.trim().length < 2 || skillName.trim().length > 50) {
      return res.status(400).json({ message: "Invalid skill name" })
    }

    const internship = await prisma.internship.findUnique({ where: { id: internshipId } })

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" })
    }

    if (internship.companyId !== req.userId) {
      return res.status(403).json({ message: "Access denied" })
    }

    const skill = await prisma.skill.upsert({
      where: { name: skillName.trim() },
      update: {},
      create: { name: skillName.trim() }
    })

    const existing = await prisma.internshipSkill.findUnique({
      where: {
        internshipId_skillId: { internshipId, skillId: skill.id }
      }
    })

    if (existing) {
      return res.status(400).json({ message: "Skill already added to this internship" })
    }

    const internshipSkill = await prisma.internshipSkill.create({
      data: { internshipId, skillId: skill.id }
    })

    res.json(internshipSkill)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}