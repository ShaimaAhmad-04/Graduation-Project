import express from "express"
import authenticate from "../middleware/authenticate.js"
import authorizeRole from "../middleware/authorizeRole.js"
import { calculateAndSaveMatch } from "../controllers/matchingController.js"

const router = express.Router()

router.post(
  "/internship/:internshipId/save",
  authenticate,
  authorizeRole(1),
  calculateAndSaveMatch
)

export default router