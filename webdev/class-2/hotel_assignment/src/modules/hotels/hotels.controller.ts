import { Request, Response, NextFunction } from "express";
import { pool } from "../../config/db";
import { generateId } from "../../utils/generateId";
import { success, error } from "../../utils/response";

/* CREATE HOTEL */
export const createHotel = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, description, city, country, amenities } = req.body;

    if (!name || !city || !country) return error(res, "INVALID_REQUEST", 400);

    const id = generateId("hotel");

    await pool.query(
      `INSERT INTO hotels 
     (id, owner_id, name, description, city, country, amenities, rating, total_reviews)
     VALUES ($1,$2,$3,$4,$5,$6,$7,0,0)`,
      [
        id,
        req.user.userId,
        name,
        description || null,
        city,
        country,
        JSON.stringify(amenities || []),
      ],
    );

    return success(
      res,
      {
        id,
        ownerId: req.user.userId,
        name,
        description: description || null,
        city,
        country,
        amenities: amenities || [],
        rating: 0,
        totalReviews: 0,
      },
      201,
    );
  } catch (err) {
    next(err);
  }
};

/* ADD ROOM */
export const addRoom = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { hotelId } = req.params;
    const { roomNumber, roomType, pricePerNight, maxOccupancy } = req.body;

    if (!roomNumber || !roomType || !pricePerNight || !maxOccupancy)
      return error(res, "INVALID_REQUEST", 400);

    const hotel = await pool.query("SELECT * FROM hotels WHERE id=$1", [
      hotelId,
    ]);

    if (!hotel.rows.length) return error(res, "HOTEL_NOT_FOUND", 404);

    if (hotel.rows[0].owner_id !== req.user.userId)
      return error(res, "FORBIDDEN", 403);

    const duplicate = await pool.query(
      "SELECT 1 FROM rooms WHERE hotel_id=$1 AND room_number=$2",
      [hotelId, roomNumber],
    );

    if (duplicate.rows.length) return error(res, "ROOM_ALREADY_EXISTS", 400);

    const id = generateId("room");

    await pool.query(
      `INSERT INTO rooms 
     (id, hotel_id, room_number, room_type, price_per_night, max_occupancy)
     VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, hotelId, roomNumber, roomType, pricePerNight, maxOccupancy],
    );

    return success(
      res,
      {
        id,
        hotelId,
        roomNumber,
        roomType,
        pricePerNight,
        maxOccupancy,
      },
      201,
    );
  } catch (err) {
    next(err);
  }
};

/* GET HOTELS */
export const getHotels = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { city, country, minPrice, maxPrice, minRating } = req.query;

    let conditions: string[] = [];
    let values: any[] = [];
    let index = 1;

    if (city) {
      conditions.push(`LOWER(h.city) = LOWER($${index++})`);
      values.push(city);
    }

    if (country) {
      conditions.push(`LOWER(h.country) = LOWER($${index++})`);
      values.push(country);
    }

    if (minRating) {
      conditions.push(`h.rating >= $${index++}`);
      values.push(minRating);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await pool.query(
      `
    SELECT h.*, MIN(r.price_per_night) as min_price
    FROM hotels h
    LEFT JOIN rooms r ON r.hotel_id = h.id
    ${whereClause}
    GROUP BY h.id
    `,
      values,
    );

    let hotels = result.rows;

    if (minPrice) {
      hotels = hotels.filter(
        (h) => h.min_price !== null && Number(h.min_price) >= Number(minPrice),
      );
    }

    if (maxPrice) {
      hotels = hotels.filter(
        (h) => h.min_price !== null && Number(h.min_price) <= Number(maxPrice),
      );
    }

    const formatted = hotels.map((h) => ({
      id: h.id,
      name: h.name,
      description: h.description,
      city: h.city,
      country: h.country,
      amenities: h.amenities,
      rating: Number(h.rating),
      totalReviews: h.total_reviews,
      minPricePerNight: Number(h.min_price),
    }));

    return success(res, formatted);
  } catch (err) {
    next(err);
  }
};

/* GET HOTEL DETAILS */
export const getHotel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { hotelId } = req.params;

    const hotel = await pool.query("SELECT * FROM hotels WHERE id=$1", [
      hotelId,
    ]);

    if (!hotel.rows.length) return error(res, "HOTEL_NOT_FOUND", 404);

    const rooms = await pool.query("SELECT * FROM rooms WHERE hotel_id=$1", [
      hotelId,
    ]);

    return success(res, {
      id: hotel.rows[0].id,
      ownerId: hotel.rows[0].owner_id,
      name: hotel.rows[0].name,
      description: hotel.rows[0].description,
      city: hotel.rows[0].city,
      country: hotel.rows[0].country,
      amenities: hotel.rows[0].amenities,
      rating: Number(hotel.rows[0].rating),
      totalReviews: hotel.rows[0].total_reviews,
      rooms: rooms.rows.map((r) => ({
        id: r.id,
        roomNumber: r.room_number,
        roomType: r.room_type,
        pricePerNight: Number(r.price_per_night),
        maxOccupancy: r.max_occupancy,
      })),
    });
  } catch (err) {
    next(err);
  }
};
