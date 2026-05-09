import express from "express"
import authenticate from '../middleware/authenticate.js'
import authorizeRole from '../middleware/authorizeRole.js'

import {
  getAllUsers,
  deleteUser,
  verifyCompany,
  getAllApplications,
  getAdminStats,
  getAllCompanies
} from '../controllers/adminController.js'

const router = express.Router()

router.get("/users", authenticate, authorizeRole(2), getAllUsers)
router.delete("/users/:id", authenticate, authorizeRole(2), deleteUser)

router.put("/companies/:id/verify", authenticate, authorizeRole(2), verifyCompany)
router.get("/companies", authenticate, authorizeRole(2), getAllCompanies)

router.get("/applications", authenticate, authorizeRole(2), getAllApplications)
router.get("/stats", authenticate, authorizeRole(2), getAdminStats)

export default router