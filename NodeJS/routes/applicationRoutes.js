import express from 'express'
import authenticate from '../middleware/authenticate.js'
import authorizeRole from '../middleware/authorizeRole.js'
import { getApplicants, updateApplicationStatus } from '../controllers/applicationController.js'

const router = express.Router()

router.get('/:internshipId', authenticate, authorizeRole(1), getApplicants)
router.put('/:id/status', authenticate, authorizeRole(1), updateApplicationStatus)

export default router
