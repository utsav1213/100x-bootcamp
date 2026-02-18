import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../config/jwt";


export const authMiddleware = (req:Request,res:Response,next:NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error:"unauthorized"
        })
    }
    const token = authHeader.split(' ')[1];
    
    try {
        const payload = verifyToken(token as string);
        req.userId = payload.userId,
            req.role = payload.role;
        next();

            


    }
    catch(error)
    {
        return res.status(401).json({
            error:"Invalid or expired"
        })
    }

}
