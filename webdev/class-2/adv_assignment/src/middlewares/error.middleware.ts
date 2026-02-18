import type { Request, Response, NextFunction } from "express";
import { timeStamp } from "node:console";

export const errorMiddleware = (err:any,req:Request,res:Response,next:NextFunction) => {
    res.status(err.statusCode || 500).json({
        error: err.message || "Internal server error",
        statusCode: err.statusCode || 500,
        timeStamp: new Date().toISOString(),
    })
}