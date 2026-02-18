// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config";
import { generateToken } from "../utils/jwt";
import { registerSchema, loginSchema } from "../schemas";
import { AppError } from "../utils/error.utils";

export const register = async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  const { name, email, password, role } = result.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role },
  });

  res.status(201).json({
    message: `User created successfully with id ${user.id}`,
  });
};

export const login = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken({ id: user.id, role: user.role });
  res.json({ token });
};
