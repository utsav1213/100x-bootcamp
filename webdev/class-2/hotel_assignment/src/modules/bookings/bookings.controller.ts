import { Request, Response, NextFunction } from "express";
import { pool } from "../../config/db";
import { generateId } from "../../utils/generateId";
import { success, error } from "../../utils/response";

/* CREATE BOOKING */
export const createBooking = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { roomId, checkInDate, checkOutDate, guests } = req.body;

    if (!roomId || !checkInDate || !checkOutDate || !guests)
      return error(res, "INVALID_REQUEST", 400);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) return error(res, "INVALID_REQUEST", 400);

    if (checkOut <= today) return error(res, "INVALID_DATES", 400);

    const roomResult = await pool.query(
      `SELECT r.*, h.owner_id FROM rooms r
     JOIN hotels h ON r.hotel_id = h.id
     WHERE r.id=$1`,
      [roomId],
    );

    if (!roomResult.rows.length) return error(res, "ROOM_NOT_FOUND", 404);

    const room = roomResult.rows[0];

    if (room.owner_id === req.user.userId) return error(res, "FORBIDDEN", 403);

    if (guests > room.max_occupancy) return error(res, "INVALID_CAPACITY", 400);

    const conflict = await pool.query(
      `SELECT 1 FROM bookings
     WHERE room_id=$1
     AND status='confirmed'
     AND $2 < check_out_date
     AND $3 > check_in_date
     LIMIT 1`,
      [roomId, checkInDate, checkOutDate],
    );

    if (conflict.rows.length) return error(res, "ROOM_NOT_AVAILABLE", 400);

    const nights =
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);
    const totalPrice = nights * Number(room.price_per_night);

    const id = generateId("booking");

    const booking = await pool.query(
      `INSERT INTO bookings
     (id,user_id,room_id,hotel_id,check_in_date,check_out_date,guests,total_price,status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'confirmed')
     RETURNING *`,
      [
        id,
        req.user.userId,
        roomId,
        room.hotel_id,
        checkInDate,
        checkOutDate,
        guests,
        totalPrice,
      ],
    );

    return success(
      res,
      {
        id,
        userId: req.user.userId,
        roomId,
        hotelId: room.hotel_id,
        checkInDate,
        checkOutDate,
        guests,
        totalPrice,
        status: "confirmed",
        bookingDate: booking.rows[0].booking_date,
      },
      201,
    );
  } catch (err) {
    next(err);
  }
};
/* CANCEL BOOKING */
export const cancelBooking = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) return error(res, "INVALID_REQUEST", 400);

    const bookingResult = await pool.query(
      "SELECT * FROM bookings WHERE id=$1",
      [bookingId],
    );

    if (!bookingResult.rows.length) return error(res, "BOOKING_NOT_FOUND", 404);

    const booking = bookingResult.rows[0];

    if (booking.user_id !== req.user.userId)
      return error(res, "FORBIDDEN", 403);

    if (booking.status === "cancelled")
      return error(res, "ALREADY_CANCELLED", 400);

    const now = new Date();
    const checkIn = new Date(booking.check_in_date);

    const diffInHours = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24)
      return error(res, "CANCELLATION_DEADLINE_PASSED", 400);

    const cancelledAt = new Date().toISOString();

    await pool.query(
      "UPDATE bookings SET status='cancelled', cancelled_at=$1 WHERE id=$2",
      [cancelledAt, bookingId],
    );

    return success(res, {
      id: bookingId,
      status: "cancelled",
      cancelledAt,
    });
  } catch (err) {
    next(err);
  }
};
/* GET MY BOOKINGS */
export const getMyBookings = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status } = req.query;

    let query = `SELECT b.id, b.user_id, b.room_id, b.hotel_id,
     b.check_in_date as "checkInDate",
     b.check_out_date as "checkOutDate",
     b.guests, b.total_price as "totalPrice",
     b.status, b.booking_date as "bookingDate",
     b.cancelled_at as "cancelledAt",
     r.room_number as "roomNumber",
     r.room_type as "roomType",
     h.name as "hotelName"
     FROM bookings b
     JOIN rooms r ON b.room_id = r.id
     JOIN hotels h ON b.hotel_id = h.id
     WHERE b.user_id=$1`;

    const values: any[] = [req.user.userId];

    if (status) {
      query += ` AND b.status=$2`;
      values.push(status);
    }

    query += ` ORDER BY b.booking_date DESC`;

    const result = await pool.query(query, values);

    return success(
      res,
      result.rows.map((b: any) => ({
        id: b.id,
        userId: b.user_id,
        roomId: b.room_id,
        hotelId: b.hotel_id,
        checkInDate: b.checkInDate,
        checkOutDate: b.checkOutDate,
        guests: b.guests,
        totalPrice: Number(b.totalPrice),
        status: b.status,
        bookingDate: b.bookingDate,
        cancelledAt: b.cancelledAt,
        roomNumber: b.roomNumber,
        roomType: b.roomType,
        hotelName: b.hotelName,
      })),
    );
  } catch (err) {
    next(err);
  }
};
