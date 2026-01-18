import express from 'express';
import { isAuth } from '../middleware/auth';
import { getUserProfile, myProfile, updateProfilePic, updateUserProfile } from '../controllers/user';

const router=express.Router();
router.get("/me",isAuth,myProfile);
router.get("/:userId",isAuth,getUserProfile);
router.put("/:userId",isAuth,updateUserProfile);
router.put("/update/profile",isAuth,updateUserProfile);
router.put("/update/pic",isAuth,updateProfilePic);



export default router;