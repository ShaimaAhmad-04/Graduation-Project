  import express from "express"
  import authenticate from "../middleware/authenticate.js"
  import authorizeRole from "../middleware/authorizeRole.js"
  import multer from "multer"

  const router = express.Router();
  const upload = multer({dest:"uploads/"}); // we use it as a temp to save the cv in
  router.post('/:id',authenticate,authorizeRole(0),upload.single("cv"),generateRoadmap);

  export default router;
