import type { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      courseId?:string;
      userId?: string;
      role?: "STUDENT" | "INSTRUCTOR";
    }
  }
}

export {};
