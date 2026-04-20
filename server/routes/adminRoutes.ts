import express from "express";
import verifyUser from "../middleware/verifyUser";
import verifyAdmin from "../middleware/verifyAdmin";

import { getGuesthouses, createGuesthouse, deleteGuesthouse } from "../controllers/guesthouseController";
import { getRooms, addRoom, toggleRoom, deleteRoom } from "../controllers/roomController";
import { getBookings, updateBookingStatus } from "../controllers/bookingController";

const router = express.Router();

router.use(verifyUser, verifyAdmin);

router.get("/guesthouses", getGuesthouses);
router.post("/guesthouses", createGuesthouse);
router.delete("/guesthouses/:id", deleteGuesthouse);

router.get("/rooms/:guesthouseId", getRooms);
router.post("/rooms", addRoom);
router.patch("/rooms/:id", toggleRoom);
router.delete("/rooms/:id", deleteRoom);

router.get("/bookings", getBookings);
router.patch("/bookings/:id", updateBookingStatus);

export default router;