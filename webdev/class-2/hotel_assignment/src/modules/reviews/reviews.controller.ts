import { Request, Response, NextFunction } from "express";
import { pool } from "../../config/db";
import { generateId } from "../../utils/generateId";
import { success, error } from "../../utils/response";

export const createReview = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) return error(res, "INVALID_REQUEST", 400);

    if (rating < 1 || rating > 5) return error(res, "INVALID_REQUEST", 400);

    const bookingResult = await pool.query(
      "SELECT * FROM bookings WHERE id=$1",
      [bookingId],
    );

    if (!bookingResult.rows.length) return error(res, "BOOKING_NOT_FOUND", 404);

    const booking = bookingResult.rows[0];

    if (booking.user_id !== req.user.userId)
      return error(res, "FORBIDDEN", 403);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkOut = new Date(booking.check_out_date);

    if (!(checkOut < today && booking.status === "confirmed"))
      return error(res, "BOOKING_NOT_ELIGIBLE", 400);

    const duplicate = await pool.query(
      "SELECT 1 FROM reviews WHERE booking_id=$1",
      [bookingId],
    );

    if (duplicate.rows.length) return error(res, "ALREADY_REVIEWED", 400);

    const id = generateId("review");

    await pool.query(
      `INSERT INTO reviews
     (id,user_id,hotel_id,booking_id,rating,comment)
     VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        id,
        req.user.userId,
        booking.hotel_id,
        bookingId,
        rating,
        comment || null,
      ],
    );

    const hotel = await pool.query(
      "SELECT rating,total_reviews FROM hotels WHERE id=$1",
      [booking.hotel_id],
    );

    const oldRating = Number(hotel.rows[0].rating);
    const totalReviews = hotel.rows[0].total_reviews;

    const newRating = (oldRating * totalReviews + rating) / (totalReviews + 1);

    await pool.query(
      "UPDATE hotels SET rating=$1, total_reviews=$2 WHERE id=$3",
      [newRating, totalReviews + 1, booking.hotel_id],
    );

    return success(
      res,
      {
        id,
        userId: req.user.userId,
        hotelId: booking.hotel_id,
        bookingId,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      },
      201,
    );
  } catch (err) {
    next(err);
  }
};
/* GET HOTEL REVIEWS */
export const getHotelReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { hotelId } = req.params;

    if (!hotelId) return error(res, "INVALID_REQUEST", 400);

    const reviews = await pool.query(
      `SELECT r.id,
            r.rating,
            r.comment,
            r.created_at,
            u.name as user_name
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.hotel_id=$1
     ORDER BY r.created_at DESC`,
      [hotelId],
    );

    return success(res, reviews.rows);
  } catch (err) {
    next(err);
  }
};
