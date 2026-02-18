import * as z from 'zod'

export const CreateLessoin = z.object({
    title: z.string().min(2),
    content: z.string().min(2),
    courseId:z.string()
})
