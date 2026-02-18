import { prisma } from "../db/db"
export const createCourse = async (data: any, instructorId: string) => {
    return prisma.course.create({
        data:{...data,instructorId}
    })
};
export const getCourse = async (page: number, limit: number) => {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        prisma.course.findMany({ skip, take: limit }),
        prisma.course.count()
    ])
    return {data,total}
}

export const getCourseById = async (id: string) => {
    return prisma.course.findUnique({
        where: { id },
        include:{lessons:true}
    })
}

export const updateCourse = async (courseId: string, userId: string, data: any)=>{
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.instructorId != userId) {
        throw new Error('Forbidden')
    }

    return prisma.course.update({
        where: { id: courseId },
        data,
    })
        
}

export const deleteCourse = async (courseId: string, userId: string) => {
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course || course.instructorId != userId)
        throw new Error("Forbidden")

    return prisma.course.delete({where:{id:courseId}})
}