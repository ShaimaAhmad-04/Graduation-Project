import express from "express"
import authenticate from '../middleware/authenticate.js'
import authorizeRole from '../middleware/authorizeRole.js'
import { getSkills, addSkill, deleteSkill } from '../controllers/skillController.js'

const router = express.Router()

router.get("/", getSkills)                                    // public - anyone can view skills
router.post("/", authenticate, authorizeRole(2), addSkill)    // admin only
router.delete("/:id", authenticate, authorizeRole(2), deleteSkill) // admin only

export default router