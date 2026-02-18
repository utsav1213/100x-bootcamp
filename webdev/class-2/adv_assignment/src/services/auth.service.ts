import { prisma } from '../db/db.ts'
import { hashPassword, comparePassword } from '../utils/hash'
import { signToken } from '../config/jwt'
import { SignupSchema } from '../schemas/auth.schema.ts'
export const singnup = async (
    email: string,
    password: string,
    name: string,
    role:'STUDENT'|'INSTRUCTOR'
) => {
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });
    if (existingUser) {
        throw new Error('user already exist')
    }
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role,
        }
    })
    const token = signToken({
        userId: user.id,
        role:user.role
    })
    return token;
}
export const login = async (email:string,password:string) => {
    const existingUser = await prisma.user.findUnique({
         where:{email}
    })
    if (!existingUser) {
        throw new Error("invalid credentials")
    }
    return signToken({
        userId: existingUser.id,
        role: existingUser.role
    })
    
}
