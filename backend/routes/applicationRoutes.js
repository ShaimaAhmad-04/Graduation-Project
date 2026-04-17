  import express from "express"
  import authenticate from "../middleware/authenticate.js"
  import authorizeRole from "../middleware/authorizeRole.js"
  import { applyApplication, getApplication, getApplicants, updateStatus } from "../controllers/applicationController.js"



  const router = express.Router();

  // check prisma schema
  // 0 for pending 1 for accepted 2 for rejected

  router.post("/:id",authenticate,authorizeRole(0),applyApplication);//applies application the listing
  router.get("/",authenticate,authorizeRole(0),getApplication);
  router.get("/:id",authenticate,authorizeRole(1),getApplicants);
  router.put("/:id",authenticate,authorizeRole(1,2),updateStatus);


  export default router;




  