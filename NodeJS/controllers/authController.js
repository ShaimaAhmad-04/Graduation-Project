import prisma from '../prisma/client.js'
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import crypto from 'crypto'
import { sendResetEmail } from "../utils/email.js";


export const register = async (req, res) => {
  try {
    console.log("Register attempt:", req.body)
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
    console.error("Register error:", error) // add this
    res.status(500).json({ error: error.message })
  }
}


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

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
      where: { id: req.userId },
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


export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await prisma.user.findUnique({ where: { id: req.userId } })

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
    await prisma.user.delete({ where: { id: req.userId } })
    res.json({ message: "Account deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("🔥 forgotPassword called for:", email);

    const user = await prisma.user.findUnique({ where: { email } });
    console.log("✅ User lookup done:", user ? "found" : "not found");

    if (!user) {
      return res.status(404).json({ message: "No account found with this email address." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    console.log("✅ Token generated");

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 1000 * 60 * 15)
      }
    });
    console.log("✅ DB updated");

    const resetLink = `http://localhost:4200/reset-password?token=${resetToken}&email=${email}`;
    console.log("✅ Reset link:", resetLink);

    await sendResetEmail(email, resetLink);
    console.log("✅ Email sent");

    res.json({ message: "Reset link sent! Please check your inbox." });

  } catch (error) {
    console.error("❌ forgotPassword error:", error.message);
    res.status(500).json({ error: error.message });
  }
};


export const resetPassword = async (req, res) => {
  try {
    // Read from body first, fall back to query params
    const email = req.body.email || req.query.email;
    const token = req.body.token || req.query.token;
    const { newPassword } = req.body;

    console.log("🔑 token:", token);
    console.log("📧 email:", email);
    console.log("🔒 newPassword:", newPassword);

    if (!token || !email || !newPassword) {
      return res.status(400).json({ message: "Missing token, email, or new password" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        email,
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    res.json({ message: "Password reset successfully" });

  } catch (error) {
    console.error("❌ resetPassword error:", error.message);
    res.status(500).json({ error: error.message });
  }
};