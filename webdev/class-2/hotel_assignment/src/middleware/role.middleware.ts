import { Response, NextFunction } from "express";
import { error } from "../utils/response";
export const requireRole = (role: "owner" | "customer") => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role.toLowerCase() !== role.toLowerCase()) {
      return error(res, "FORBIDDEN", 403);
    }
    next();
  };
};
