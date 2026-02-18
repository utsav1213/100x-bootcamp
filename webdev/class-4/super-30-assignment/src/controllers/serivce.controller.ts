// src/controllers/service.controller.ts
import { Request, Response } from "express";
import { prisma } from "../config";
import { createServiceSchema, availabilitySchema } from "../schemas";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AppError } from "../utils/error.utils";
import { rangesOverlap } from "../utils/time.utils";

export const createService = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (req.user?.role !== "SERVICE_PROVIDER") {
    throw new AppError("Forbidden", 403);
  }

  const result = createServiceSchema.safeParse(req.body);
  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  const service = await prisma.service.create({
    data: {
      ...result.data,
      providerId: req.user.id,
    },
  });

  res.status(201).json(service);
};

export const setAvailability = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { serviceId } = req.params;

  if (req.user?.role !== "SERVICE_PROVIDER") {
    throw new AppError("Forbidden", 403);
  }

  const result = availabilitySchema.safeParse(req.body);
  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service || service.providerId !== req.user.id) {
    throw new AppError("Service not found or not owned by you", 403);
  }

  const existing = await prisma.availability.findMany({
    where: {
      serviceId,
      dayOfWeek: result.data.dayOfWeek,
    },
  });

  for (const slot of existing) {
    if (
      rangesOverlap(
        result.data.startTime,
        result.data.endTime,
        slot.startTime,
        slot.endTime,
      )
    ) {
      throw new AppError("Availability overlaps with existing slot", 409);
    }
  }

  const availability = await prisma.availability.create({
    data: {
      serviceId,
      ...result.data,
    },
  });

  res.status(201).json(availability);
};

export const getServices = async (req: Request, res: Response) => {
  const type = req.query.type as string | undefined;

  const services = await prisma.service.findMany({
    where: type ? { type: type as any } : undefined,
    include: {
      provider: { select: { name: true } },
    },
  });

  const response = services.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    durationMinutes: s.durationMinutes,
    providerName: s.provider.name,
  }));

  res.json(response);
};
