import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { createHotel, addRoom, getHotels, getHotel } from "./hotels.controller";
export const hotelsRoutes = Router();
hotelsRoutes.post("/", authMiddleware, requireRole("owner"), createHotel);
hotelsRoutes.post(
  "/:hotelId/rooms",
  authMiddleware,
  requireRole("owner"),
  addRoom,
);
hotelsRoutes.get("/", authMiddleware, getHotels);
hotelsRoutes.get("/:hotelId", authMiddleware, getHotel);
