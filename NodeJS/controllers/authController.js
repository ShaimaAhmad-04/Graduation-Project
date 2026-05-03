import prisma from '../prisma/client.js'
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body
    const role = parseInt(req.body.role, 10)

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        password: hashedPassword,
        role,
        ...(role === 0 && { student: { create: {} } }),
        ...(role === 1 && { company: { create: { name: firstName } } })
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

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}


export const login = async (req,res)=>{
  try {

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },// from authenticate function
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true
        //only selected fields are sent
      }
    })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    })

    const validPassword = await bcrypt.compare(currentPassword, user.password)
    if (!validPassword) {
      return res.status(400).json({ message: "Current password is incorrect" })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword }
    })

    res.json({ message: "Password changed successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}


export const deleteAccount = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.userId }
    })
    res.json({ message: "Account deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}