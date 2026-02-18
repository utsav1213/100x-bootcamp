import * as z from 'zod'

export const SignupSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(["STUDENT",  "INSTRUCTOR"]),
});
export const LoginSchema = z.object({
    email: z.email(),
    password:z.string().min(6)
})