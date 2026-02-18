import type { Request, Response } from "express";
import * as service from "../services/course.service";
import { serve } from "bun";
import { JSDocParsingMode } from "typescript";

export const createCourse = async (req: Request, res: Response) => {
    const course = await service.createCourse(req.body,req.userId!);
    res.status(201).json(course);
}
export const getCourse = async (req: Request, res: Response) => {
    const page = Number(req.query.page || 1)
    const limit = Number(req.query.limit || 10)
    const result=await service.getCourse(page,limit)
      res.json({ ...result, page, limit });
}
export const getCourseById = async (req: Request, res: Response) => {
    const coursebyId = await (req.params);
    res.status(201).json(coursebyId)
}
export const updateCourse = async (req: Request, res: Response)=>{
    const updatedcourse = await service.updateCourse(req.body, req.courseId!, req.userId);
    res.status(201).json(updateCourse)
    
}
