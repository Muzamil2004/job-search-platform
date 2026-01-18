import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import {sql} from '../utils/db.js'


interface User{
    user_id:number;
    name: string;
    email:string;
    phone_number:string;
    resume: string | null;
    resume_public_id:string | null;
    profile_pic: string | null;
    profile_pic_public_id: string | null;
    skills: string[];
}

export interface AuthenticatedRequest extends Request{
    user?:User
}
export const isAuth=async(req:AuthenticatedRequest,res :Response,next:NextFunction):
Promise<void>=>{
    try{
        const authHeader=req.headers.authorization;

        if(!authHeader || authHeader?.startsWith("bearer")){
            res.status(401).json({
            message:"Authorisation header is missing or invalid",
        });
        return;
    }
    const token =authHeader.split(" ")[1]
    const decodedPayload = jwt.verify(
        token,process.env.JWT_SEC as string
    ) as JwtPayload
    if(!decodedPayload || !decodedPayload.id){
         res.status(401).json({
            message:"Invalid Token",
        });
        return;
    }
    const user =await sql`
    SELECT u.user_id,u.email,u.phone_number,u.role,u.bio,u.resume,u.resume_public_id,u.profile_pic,
    u.profile_pic_public_id ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as skills FROM users u LEFT JOIN user_skills us ON u.user_id =u.user_id
    LEFT JOIN skills s ON us.skills_id =s.skills_id WHERE u.user_id ${decodedPayload.id}  
    GROUP BY user_id`;
    
    if(user.length===0){
        res.status(401).json({
            message:"User associated with this token no longer exist.",
        });
        return;
    }
    const users =user[0] as User

    users.skills=users.skills ||[];

    req.user= users;

    next();

}catch(error){
    res.status(401).json({
        message:"Authentication failed please login again",
    });
}
};