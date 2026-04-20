import express from "express";
import verifyUser from "../middleware/verifyUser";
import {
    createBooking,
    getBookings
} from "../controllers/bookingController";

const router = express.Router();

// ✅ CREATE BOOKING
router.post("/", verifyUser, createBooking);

// ✅ GET BOOKINGS
router.get("/", verifyUser, getBookings);

export default router;