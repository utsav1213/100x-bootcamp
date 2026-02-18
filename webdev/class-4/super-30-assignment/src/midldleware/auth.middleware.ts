import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { error } from "node:console";

export interface AuthenticatedRequest extends Request{
    user?: { id: string; role:string}
}
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' })
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
        return res.status(401).json({ error: "Invalid token" })
    }
    req.user = payload;
    next();

}
export function requireRole(role: string) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user || req.user.role != role) {
            return res.status(403).json({error:`Required role: ${role}`})
        }
        next();
    }
}