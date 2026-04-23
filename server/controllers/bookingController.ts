import { Request, Response } from "express";
import Booking from "../models/Booking";

export const getBookings = async (req: any, res: Response) => {
    const bookings = await Booking.find({}) // ✅ only user's bookings
        .populate({
            path: "room_id",
            populate: {
                path: "guesthouse_id",
            },
        })
        .populate("user_id") // ✅ ADD THIS
        .sort({ check_in: -1 });

    // ✅ Transform response to match frontend EXACTLY
    const formatted = bookings.map((b: any) => ({
        id: b._id,
        check_in: b.check_in,
        check_out: b.check_out,
        total_price: b.total_price,
        status: b.status,
        created_at: b.createdAt,

        // ✅ USER DATA
        user: b.user_id
            ? {
                name: b.user_id.full_name,
                email: b.user_id.email,
            }
            : null,

        rooms: b.room_id
            ? {
                name: b.room_id.name,
                room_type: b.room_id.room_type,
                guesthouses: b.room_id.guesthouse_id
                    ? {
                        id: b.room_id.guesthouse_id._id,
                        name: b.room_id.guesthouse_id.name,
                        location: b.room_id.guesthouse_id.location,
                        cover_image: b.room_id.guesthouse_id.cover_image,
                    }
                    : null,
            }
            : null,
    }));
    res.json(formatted);
};
export const updateBookingStatus = async (req: any, res: Response) => {
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    );

    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
};

// ✅ CREATE BOOKING (THIS WAS MISSING)
export const createBooking = async (req: any, res: Response) => {
    try {
        const { room_id, check_in, check_out, total_price } = req.body;

        // 🔍 Conflict check (important)
        const conflicts = await Booking.find({
            room_id,
            status: { $ne: "cancelled" },
            check_in: { $lt: check_out },
            check_out: { $gt: check_in },
        });

        if (conflicts.length > 0) {
            return res.status(400).json({ message: "Room already booked for selected dates" });
        }

        // ✅ Create booking
        const booking = await Booking.create({
            user_id: req.user.id,
            room_id,
            check_in,
            check_out,
            total_price,
            status: "confirmed",
        });

        res.status(201).json(booking);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Booking failed" });
    }
};