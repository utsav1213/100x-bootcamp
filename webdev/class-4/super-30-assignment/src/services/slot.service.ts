// src/services/slot.service.ts
import { prisma } from "../config";
import {
  timeToMinutes,
  minutesToTime,
  addMinutes,
  rangesOverlap,
} from "../utils/time.utils";
import { AppError } from "../utils/error.utils";

export interface Slot {
  slotId: string;
  startTime: string;
  endTime: string;
}

export async function getAvailableSlots(
  serviceId: string,
  targetDate: string, // format: YYYY-MM-DD
): Promise<Slot[]> {
  const dateObj = new Date(targetDate);
  if (isNaN(dateObj.getTime())) {
    throw new AppError("Invalid date format", 400);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dateObj < today) {
    throw new AppError("Cannot query/book past dates", 400);
  }

  const dayOfWeek = dateObj.getDay();

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { availabilities: true },
  });

  if (!service) {
    throw new AppError("Service not found", 404);
  }

  const availability = service.availabilities.find(
    (a) => a.dayOfWeek === dayOfWeek,
  );
  if (!availability) {
    return [];
  }

  const duration = service.durationMinutes;

  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      serviceId,
      date: dateObj,
      status: "BOOKED",
    },
    select: { startTime: true, endTime: true },
  });

  const slots: Slot[] = [];
  let currentMinutes = timeToMinutes(availability.startTime);

  while (currentMinutes + duration <= timeToMinutes(availability.endTime)) {
    const start = minutesToTime(currentMinutes);
    const end = addMinutes(start, duration);

    const hasConflict = bookedAppointments.some((appt) =>
      rangesOverlap(start, end, appt.startTime, appt.endTime),
    );

    if (!hasConflict) {
      const slotId = `${serviceId}_${targetDate}_${start.replace(":", "")}`;
      slots.push({ slotId, startTime: start, endTime: end });
    }

    currentMinutes += 30;
  }

  return slots;
}

export async function validateAndGetSlot(
  slotId: string,
): Promise<{
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
}> {
  const parts = slotId.split("_");
  if (parts.length !== 3) {
    throw new AppError("Invalid slotId format", 400);
  }

  const [serviceId, dateStr, timeStr] = parts;
  const startTime = `${timeStr.slice(0, 2)}:${timeStr.slice(2)}`;

  const availableSlots = await getAvailableSlots(serviceId, dateStr);
  const matchingSlot = availableSlots.find(
    (s) => s.slotId === slotId && s.startTime === startTime,
  );

  if (!matchingSlot) {
    throw new AppError("Slot not available or invalid", 400);
  }

  return {
    serviceId,
    date: dateStr,
    startTime: matchingSlot.startTime,
    endTime: matchingSlot.endTime,
  };
}
