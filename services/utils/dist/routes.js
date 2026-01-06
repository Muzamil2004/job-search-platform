import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
const router = express.Router();
router.post("/upload", async (req, res) => {
    try {
        const { buffer, public_id } = req.body;
        if (public_id) {
            await cloudinary.uploader.destroy(public_id);
        }
        const cloud = await cloudinary.uploader.upload(buffer);
        res.json({
            url: cloud.secure_url,
            public_id: cloud.public_id,
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
export default router;
