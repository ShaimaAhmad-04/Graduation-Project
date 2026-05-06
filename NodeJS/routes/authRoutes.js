import express from "express"
import { register, login, me } from '../controllers/authController.js'
import authenticate from '../middleware/authenticate.js'
import authorizeRole from '../middleware/authorizeRole.js'
import { resetPassword } from '../controllers/authController.js'

import { changePassword, deleteAccount, forgotPassword } from '../controllers/authController.js';


const router = express.Router()  // creates a Express router object, it's a container for grouping
// related routes together
router.post("/register", register)
router.post("/login", login)


// Called by the frontend to get the current logged in user's info.
// Requires a valid JWT token in the Authorization header.
// Used on app load, page refresh, or when displaying user profile.
router.get("/me", authenticate, me) // protected route

//test routes
// router.get("/student-only", authenticate, authorizeRole(1), (req, res) => {
//   res.json({ message: "Welcome student!" })
// })

// router.get("/company-only", authenticate, authorizeRole(2), (req, res) => {
//   res.json({ message: "Welcome company!" })
// })

//change password
router.put("/change-password", authenticate, changePassword)
router.delete("/delete-account", authenticate, deleteAccount)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
export default router
