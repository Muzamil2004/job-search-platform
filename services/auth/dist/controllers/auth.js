import { TryCatch } from "../utils/TryCatch.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sql } from "../utils/db.js";
import bcrypt from 'bcrypt';
import getBuffer from "../utils/buffer.js";
import axios from "axios";
import jwt from 'jsonwebtoken';
import { forgotPasswordTemplate } from "../template.js";
import { publishToTopic } from "../producer.js";
export const registerUser = TryCatch(async (req, res, next) => {
    const { name, email, password, phoneNumber, role, bio } = req.body;
    if (!name || !email || !password || !phoneNumber || !role) {
        throw new ErrorHandler(400, "please fill all the details");
    }
    const existingUsers = await sql `SELECT user_id FROM users WHERE email = ${email}`;
    if (existingUsers.length > 0) {
        throw new ErrorHandler(409, "User with this email already exists");
    }
    const hashPass = await bcrypt.hash(password, 10);
    let registeredUser;
    if (role === 'recruiter') {
        const [user] = await sql `INSERT INTO users (name,email,password,phone_number,role) VALUES
             (${name},${email},${hashPass},${phoneNumber},${role},${bio}) RETURNING user_id,name,email,phone_number,role,created_at`;
        registeredUser = user;
    }
    else if (role === 'jobseeker') {
        const file = req.file;
        if (!file) {
            throw new ErrorHandler(400, "resume is required for jobseeker");
        }
        const fileBuffer = getBuffer(file);
        if (!fileBuffer || fileBuffer.content) {
            throw new ErrorHandler(500, "failed to generate buffer");
        }
        const { data } = await axios.post(`${process.env.UTILS_SERVICE}/api/utils/upload`, { buffer: fileBuffer.content });
        const [user] = await sql `INSERT INTO users (name,email,password,phone_number,role,bio ,resume,resume_public_id) VALUES
                (${name},${email},${hashPass},${phoneNumber},${role},${bio},${data.url},${data.public_id}) RETURNING user_id,name,email,phone_number,role,bio, resume,created_at`;
        registeredUser = user;
    }
    const token = jwt.sign({ id: registeredUser?.user_id }, process.env.JWT_SEC, {
        expiresIn: "15d",
    });
    res.json({
        message: "user registered",
        registeredUser,
        token
    });
});
export const loginUser = TryCatch(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ErrorHandler(400, "please fill all the details");
    }
    const user = await sql `SELECT u.user_id,u.name,u.email,u.password,u.phone_number,u.role,u.bio,u.resume,u.profile_pic,ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT 
    NULL) as skills FROM users u LEFT JOIN user_skills us ON u.user_id=us .user_id
    LEFT JOIN skills s ON us.skill_id =s.skill_id WHERE U.email =${email} GROUP BY u.user_id`;
    if (user.length === 0) {
        throw new ErrorHandler(400, "Invalid credentials");
    }
    const userObject = user[0];
    const matchPassword = await bcrypt.compare(password, userObject.password);
    if (!matchPassword) {
        throw new ErrorHandler(400, "Invalid credentials");
    }
    userObject.skills = userObject.skills || [];
    delete userObject.password;
    const token = jwt.sign({ id: userObject?.user_id }, process.env.JWT_SEC, {
        expiresIn: "15d",
    });
    res.json({
        message: "user Logged in",
        userObject,
        token
    });
});
export const forgotPassword = TryCatch(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        throw new ErrorHandler(400, "email is required");
    }
    const users = await sql `SELECT user_id,email FROM users WHERE email=${email}`;
    if (users.length === 0) {
        return res.json({
            message: "if that email exist, we have sent a reset link",
        });
    }
    const user = users[0];
    const resetToken = jwt.sign({
        email: user.email, type: "reset",
    }, process.env.JWT_SEC, { expiresIn: "15m" });
    const resetLink = `${process.env.Frontend_URL}/reset/${resetToken}`;
    const message = {
        to: email,
        subject: "RESET Your Password - CareerLens",
        html: forgotPasswordTemplate(resetLink),
    };
    await publishToTopic("send-mail", message).catch((error) => {
        console.log("failed to send message", error);
    });
    res.json({
        message: "if that email exist, we have sent a reset link",
    });
});
