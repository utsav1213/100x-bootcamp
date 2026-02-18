// src/controllers/slot.controller.ts
import { Request, Response } from "express";
import { slotQuerySchema } from "../schemas";
import { getAvailableSlots } from "../services/slot.service";
import { AppError } from "../utils/error.utils";

export const getSlots = async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const result = slotQuerySchema.safeParse(req.query);

  if (!result.success) {
    throw new AppError("Invalid or missing date parameter (YYYY-MM-DD)", 400);
  }

  const slots = await getAvailableSlots(serviceId, result.data.date);

  res.json({
    serviceId,
    date: result.data.date,
    slots,
  });
};
