import { Request , Response , NextFunction} from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthedRequest extends Request {
    user? : {userId : string ; email: string} ;
}

export const requiredAuth = (req: AuthedRequest , res: Response , next : NextFunction) => {
    const header = req.headers.authorization;
    if(!header?.startsWith("Bearer ")) return res.status(401).json({error : "Unauthorized"});

    const token = header.slice("Beared ".length);

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        if (typeof decoded === "object" && decoded !== null && "userId" in decoded && "email" in decoded) {
            req.user = {
                userId: (decoded as any).userId,
                email: (decoded as any).email
            };
            next();
        } else {
            return res.status(401).json({ error: "Unauthorized" });
        }
    } catch (err) {
        return res.status(401).json({ error: "Unauthorized" });
    }
}