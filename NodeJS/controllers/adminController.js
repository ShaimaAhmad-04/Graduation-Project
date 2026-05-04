import prisma from '../prisma/client.js'

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true
      }
    })
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id)

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    await prisma.user.delete({ where: { id: userId } })
    res.json({ message: "User deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Verify a company
export const verifyCompany = async (req, res) => {
  try {
    const companyId = parseInt(req.params.id)

    const company = await prisma.company.findUnique({ where: { userId: companyId } })
    if (!company) {
      return res.status(404).json({ message: "Company not found" })
    }

    const updated = await prisma.company.update({
      where: { userId: companyId },
      data: { verified: true }
    })

    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get all applications
export const getAllApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        internship: {
          select: {
            title: true,
            company: {
              select: { name: true }
            }
          }
        }
      }
    })
    res.json(applications)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const searchUsers = async (req, res) => {
  try {
    const { query, role } = req.query
    // role is optional — if provided, filter by role (0=student, 1=company)
    // query searches by name or email

    const users = await prisma.user.findMany({
      where: {
        ...(role !== undefined && { role: parseInt(role) }),
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true
      }
    })

    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}