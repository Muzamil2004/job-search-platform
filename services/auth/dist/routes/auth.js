import express from 'express';
import { loginUser, registerUser } from '../controllers/auth.js';
import uploadFile from '../middleware/multer.js';
const router = express.Router();
router.post("/register", uploadFile, registerUser);
router.post("/login", loginUser);
export default router;
