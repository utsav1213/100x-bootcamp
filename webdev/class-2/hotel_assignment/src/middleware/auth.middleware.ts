import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { error } from "../utils/response";

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) return error(res, "UNAUTHORIZED", 401);
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch {
    return error(res, "UNAUTHORIZED", 401);
  }
};
