import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";
import { env } from "../config/env";


const router = Router();

const registerSchema = z.object({
    name : z.string().min(1),
    email : z.string().email(),
    password : z.string().min(6),
    mobile : z.string().optional()
});

router.post("/register" , async(req , res ,next) => {
    try {
        const { name , email , password , mobile} = registerSchema.parse(req.body);
        const existing = await UserModel.findOne({email});
        if(existing) return res.status(400).json({error : "Email already registered"});
        const passwordHash = await bcrypt.hash(password , 10);
        const user = await UserModel.create({name , email , mobile , passwordHash} );
        const token = jwt.sign({userId : user.id , email} , env.JWT_SECRET , {expiresIn : "7d"});
        res.json({id : user.id , name , email , mobile , token})
    } catch (error) {
        next(error)
    }
});

router.post("/login" , async (req , res , next ) => {
    try{
        const { email , password} = registerSchema.pick({email : true , password : true}).parse(req.body);
        const user = await UserModel.findOne({email});
        if(!user) return res.status(400).json({error : "Invalid credentials"});
        const ok = await bcrypt.compare(password , (user as any).passwordHash);
        if(!ok) return res.status(400).json({error : "Invalid credentials"});
        const token = jwt.sign({userId : user.id , email } , env.JWT_SECRET , {expiresIn : "7d"});
        res.json({ id: user.id, name: user.name, email: user.email, mobile: user.mobile, token });
    }catch(error) { 
        next(error)
    }
});

export default router;

