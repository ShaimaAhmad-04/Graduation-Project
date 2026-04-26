import express from "express"
import authenticate from "../middleware/authenticate.js"
import authorizeRole from "../middleware/authorizeRole.js"
import {
  getCompanyProfile,
  updateCompanyProfile,
  getCompanyApplications,
  getClosingSoonInternships,
  getTopMatchingApplicants,
  getInternshipStats,
  getCompanyDashboardSummary,
  updateCompanyUserInfo
} from "../controllers/companyController.js"

const router = express.Router()

router.get("/profile", authenticate, authorizeRole(1), getCompanyProfile)
router.put("/profile", authenticate, authorizeRole(1), updateCompanyProfile)
router.get("/applications", authenticate, authorizeRole(1), getCompanyApplications)
router.get("/internships/closing-soon", authenticate, authorizeRole(1), getClosingSoonInternships)
router.get("/applicants/top-matching", authenticate, authorizeRole(1), getTopMatchingApplicants)
router.get("/internships/stats", authenticate, authorizeRole(1), getInternshipStats)
router.get("/dashboard", authenticate, authorizeRole(1), getCompanyDashboardSummary)
router.put("/info", authenticate, authorizeRole(1), updateCompanyUserInfo)

export default router