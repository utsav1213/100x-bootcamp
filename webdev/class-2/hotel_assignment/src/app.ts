import express, { Request, Response, NextFunction } from "express";
import { authRoutes } from "./modules/auth/auth.routes";
import { hotelsRoutes } from "./modules/hotels/hotels.routes";
import bookingsRoutes from "./modules/bookings/bookings.routes";
import reviewsRoutes from "./modules/reviews/reviews.routes";

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/reviews", reviewsRoutes);

// Global error handler - returns JSON instead of HTML
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res
    .status(500)
    .json({ success: false, data: null, error: "INTERNAL_SERVER_ERROR" });
});

export default app;
