import express from "express"
import authenticate from '../middleware/authenticate.js'
import authorizeRole from '../middleware/authorizeRole.js'
import { getSkills, addSkill, deleteSkill,createListing ,updateListing,deleteListing} from '../controllers/skillController.js'

const router = express.Router()

router.get("/", getSkills)                                    // public - anyone can view skills
router.post("/", authenticate, authorizeRole(1,2), addSkill)    // admin only
router.delete("/:id", authenticate, authorizeRole(1,2), deleteSkill) // admin only
// router.post('/skills', addSkill);

// router.post('/listings', createListing);
// router.put('/listings/:id', updateListing);
// router.delete('/listings/:id', deleteListing);

export default router