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
  updateCompanyUserInfo,
  createCompanyProfile
} from "../controllers/companyController.js"

const router = express.Router()

// 🔐 ALL company routes should be protected
const companyAccess = [authenticate, authorizeRole(1)]

// Create company profile
router.post('/', authenticate, authorizeRole(1), createCompanyProfile)

// Company profile
router.get('/profile', ...companyAccess, getCompanyProfile)
router.put('/', ...companyAccess, updateCompanyProfile)

// Dashboard data
router.get("/applications", ...companyAccess, getCompanyApplications)
router.get("/internships/closing-soon", ...companyAccess, getClosingSoonInternships)
router.get("/applicants/top-matching", ...companyAccess, getTopMatchingApplicants)
router.get("/internships/stats", ...companyAccess, getInternshipStats)
router.get("/dashboard", ...companyAccess, getCompanyDashboardSummary)

// User info update
router.put("/info", ...companyAccess, updateCompanyUserInfo)

export default router