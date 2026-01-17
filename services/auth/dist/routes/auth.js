import express from 'express';
import { forgotPassword, loginUser, registerUser } from '../controllers/auth.js';
import uploadFile from '../middleware/multer.js';
const router = express.Router();
router.post("/register", uploadFile, registerUser);
router.post("/login", loginUser);
router.post("/forgot", forgotPassword);
export default router;
