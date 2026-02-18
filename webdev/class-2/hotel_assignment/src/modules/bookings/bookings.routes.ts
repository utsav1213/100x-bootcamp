import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import {
  createBooking,
  cancelBooking,
  getMyBookings,
} from "./bookings.controller";

const router = Router();

router.post("/", authMiddleware, requireRole("customer"), createBooking);

router.put("/:bookingId/cancel", authMiddleware, cancelBooking);

router.patch("/:bookingId/cancel", authMiddleware, cancelBooking);

router.get("/", authMiddleware, getMyBookings);
router.get("/my", authMiddleware, getMyBookings);

export default router;
