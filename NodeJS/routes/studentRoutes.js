import express from "express"
import authenticate from "../middleware/authenticate.js"
import authorizeRole from "../middleware/authorizeRole.js"
import multer from "multer"
import path from "path"
import { getStudentProfile, updateStudentProfile, getStudentCV, uploadCV, getStudentSkills, addStudentSkill, removeStudentSkill, getStudentApplications, withdrawApplication, getStudentRoadmaps, createRoadmap, applyToInternship, updateStudentUserInfo, generateAIRoadmap } from "../controllers/studentController.js"

const router = express.Router()

const cvStorage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `cv_${req.userId}_${Date.now()}${path.extname(file.originalname)}`)
  }
})
const cvUpload = multer({
  storage: cvStorage,
  fileFilter: (req, file, cb) => {
    cb(null, file.mimetype === 'application/pdf')
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
})



router.get("/profile", authenticate, authorizeRole(0), getStudentProfile)
router.put("/profile", authenticate, authorizeRole(0), updateStudentProfile)
router.get("/cv", authenticate, authorizeRole(0), getStudentCV)
router.post("/cv", authenticate, authorizeRole(0), cvUpload.single("cv"), uploadCV)
router.get("/skills", authenticate, authorizeRole(0), getStudentSkills)
router.post("/skills", authenticate, authorizeRole(0), addStudentSkill)
router.delete("/skills/:skillId", authenticate, authorizeRole(0), removeStudentSkill)
router.get("/applications", authenticate, authorizeRole(0), getStudentApplications)
router.post("/applications", authenticate, authorizeRole(0), applyToInternship)
router.delete("/applications/:id", authenticate, authorizeRole(0), withdrawApplication)
router.get("/roadmaps", authenticate, authorizeRole(0), getStudentRoadmaps)
router.post("/roadmaps", authenticate, authorizeRole(0), createRoadmap)
router.post("/roadmaps/ai", authenticate, authorizeRole(0), generateAIRoadmap)
router.put("/info", authenticate, authorizeRole(0), updateStudentUserInfo)


export default router