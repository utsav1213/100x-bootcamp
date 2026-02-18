import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { createReview, getHotelReviews } from "./reviews.controller";

const router = Router();

router.post("/", authMiddleware, requireRole("customer"), createReview);

router.get("/hotel/:hotelId", getHotelReviews);

export default router;

