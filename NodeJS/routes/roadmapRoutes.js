import express from 'express'
import authenticate from '../middleware/authenticate.js'
import authorizeRole from '../middleware/authorizeRole.js'
import { generateRoadmap } from '../controllers/roadmapController.js'

const router = express.Router()

router.post('/:listingId', authenticate, authorizeRole(0), generateRoadmap)

export default router
