import express from "express"
import authenticate from '../middleware/authenticate.js'
import authorizeRole from "../middleware/authorizeRole.js"
import {createListing,getListings,getListing,updateListing,deleteListing} from "../controllers/listingControllers.js"

const router = express.Router();
// check prisma schema
// roles : user=0   recruiter=1  admin=2
router.post("/",authenticate,authorizeRole(1),createListing);//create a listing
router.get("/",getListings);//get all listings, visit site
router.get("/:id",getListing);// get a specific listing
router.put("/:id",authenticate,authorizeRole(1),updateListing);//update or edit a listing, recruiter(owner) ONLY
router.delete("/:id",authenticate,authorizeRole(1,2),deleteListing);// delete listing recruiter + admin
//ownership checked in controller

export default router;



// TODO: when a recruiter registers, a Company record must be created automatically
// otherwise the foreign key constraint on Internship.companyId will fail
// fix: create Company record inside the register controller after user creation

// TODO: submissionDeadline is stored as @db.Date in prisma schema but prisma
// expects a full ISO-8601 string e.g "2025-06-01T00:00:00.000Z" when querying
// consider changing the schema to String or handling the conversion in the controller
