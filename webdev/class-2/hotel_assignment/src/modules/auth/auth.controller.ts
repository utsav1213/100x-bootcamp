import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { generateId } from "../../utils/generateId";
import { error, success } from "../../utils/response";
import { pool } from "../../config/db";

const signupSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string(),
  role: z.enum(["customer", "owner"]).optional(),
  phone: z.string().optional(),
});

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) return error(res, "INVALID_REQUEST", 400);
    const { name, email, password, role, phone } = parsed.data;
    const existing = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (existing.rows.length) {
      return error(res, "EMAIL_ALREADY_EXISTS", 400);
    }
    const hashed = await bcrypt.hash(password, 10);
    const id = generateId("usr");
    const dbRole = (role || "customer").toUpperCase();
    await pool.query(
      "INSERT INTO users (id, name, email, password, role, phone, created_at) VALUES($1,$2,$3,$4,$5,$6,NOW())",
      [id, name, email, hashed, dbRole, phone || null],
    );
    return success(
      res,
      { id, name, email, role: role || "customer", phone: phone || null },
      201,
    );
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return error(res, "INVALID_REQUEST", 400);
    }
    const result = await pool.query("SELECT * from users WHERE email=$1", [
      email,
    ]);
    if (!result.rows.length) {
      return error(res, "INVALID_CREDENTIALS", 401);
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return error(res, "INVALID_CREDENTIALS", 401);
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role.toLowerCase() },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );
    return success(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
      },
    });
  } catch (err) {
    next(err);
  }
};
