import express from "express"
import authenticate from "../middleware/authenticate.js"
import authorizeRole from "../middleware/authorizeRole.js"
import { getStudentProfile, updateStudentProfile,getStudentCV,getStudentSkills,addStudentSkill,removeStudentSkill,getStudentApplications,getStudentRoadmaps,createRoadmap,applyToInternship,updateStudentUserInfo } from "../controllers/studentController.js"


const router = express.Router()



router.get("/profile", authenticate, authorizeRole(0), getStudentProfile)
router.put("/profile", authenticate, authorizeRole(0), updateStudentProfile)
router.get("/cv", authenticate, authorizeRole(0), getStudentCV)
router.get("/skills", authenticate, authorizeRole(0), getStudentSkills)
router.post("/skills", authenticate, authorizeRole(0), addStudentSkill)
router.delete("/skills/:skillId", authenticate, authorizeRole(0), removeStudentSkill)
router.get("/applications", authenticate, authorizeRole(0), getStudentApplications)
router.post("/applications", authenticate, authorizeRole(0), applyToInternship)
router.get("/roadmaps", authenticate, authorizeRole(0), getStudentRoadmaps)
router.post("/roadmaps", authenticate, authorizeRole(0), createRoadmap)
router.put("/info", authenticate, authorizeRole(0), updateStudentUserInfo)


export default router