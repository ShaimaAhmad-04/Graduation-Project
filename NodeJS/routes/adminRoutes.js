import express from "express"
import authenticate from '../middleware/authenticate.js'
import authorizeRole from '../middleware/authorizeRole.js'
import { getAllUsers, deleteUser, verifyCompany, getAllApplications } from '../controllers/adminController.js'

const router = express.Router()

// admin role = 2
router.get("/users", authenticate, authorizeRole(2), getAllUsers)
router.delete("/users/:id", authenticate, authorizeRole(2), deleteUser)
router.put("/companies/:id/verify", authenticate, authorizeRole(2), verifyCompany)
router.get("/applications", authenticate, authorizeRole(2), getAllApplications)
// router.get("/search", authenticate, authorizeRole(2), searchUsers)

export default router