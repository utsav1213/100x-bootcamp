import { error } from "node:console"
import { prisma } from "../db/db"

export const createLesson = async (data: any, instructorId: string) => {
    const course = await prisma.course.findUnique({
        where:{id:data.courseId}
    })
    if (!course || course.instructorId != instructorId) {
        throw new Error('Forbidden');
    }
    return prisma.lesson.create({ data });
}
export const getLessons = async (courseId: string) => {
    return prisma.lesson.findMany({where:{courseId}})
}