import jwt from 'jsonwebtoken'
import { error } from 'node:console';
const JWT_SECRET = process.env.JWT_SECRET as string;


if (!JWT_SECRET) {
    throw new Error('jew toke is not defined')
}

export interface JwtPayLoad{
    userId: string,
    role: 'STUDENT'|'INSTRUCTOR'
}

export const signToken = (payload: JwtPayLoad)=>{
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn:'7d'
    })
}

export const verifyToken = (token: string) => {
    return jwt.verify(token,JWT_SECRET) as JwtPayLoad
}