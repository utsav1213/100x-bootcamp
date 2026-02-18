import { z } from "zod";
import { isValidTime } from "../utils/time.utils";
export const registerSchema = z.object({
  name: z.string().min(2, "name is too short"),
  email: z.email("Invalid email"),
  password: z.string().min(2, "password is too short"),
  role: z.enum(["USER", "SERVICE_PROVIDER"]),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(2),
});
export const createServiceSchema = z.object({
  name: z.string(),
  type: z.enum([
    "MEDICAL",
    "HOUSE_HELP",
    "BEAUTY",
    "FITNESS",
    "EDUCATION",
    "OTHER",
  ]),
  durationMinutes: z.number().refine((n) => [30, 60, 90, 120].includes(n), {
    message: "Duration must be 30,60,90 or 120 minutes",
  }),
});
export const availabilitySchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().refine(isValidTime),
    endTime: z.string().refine(isValidTime),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "startTime must be before endTime",
    path: ["endTime"],
  });

export const slotQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
});

export const bookAppointmentSchema = z.object({
  slotId: z.string().min(10, "Invalid slot ID"),
});
