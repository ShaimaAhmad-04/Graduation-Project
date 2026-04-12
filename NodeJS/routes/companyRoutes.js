import express from "express"
import authenticate from "../middleware/authenticate.js"
import authorizeRole from "../middleware/authorizeRole.js"
import { getCompanyProfile,updateCompanyProfile } from "../controllers/companyController.js"


const router = express.Router()


router.get("/profile",authenticate,authorizeRole(1),getCompanyProfile);
router.put("/profile",authenticate,authorizeRole(1),updateCompanyProfile);

export default router;

