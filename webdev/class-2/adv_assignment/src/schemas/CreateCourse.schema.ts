import * as z from "zod";

export const CourseSchema = z.object({
    title: z.string().min(2),
    discription: z.string().min(2),
    price:z.number().min(0)
})
