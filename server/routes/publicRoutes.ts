import express from "express";
import { getGuesthouseDetails, getAllGuesthouses } from "../controllers/publicController";

const router = express.Router();

router.get("/guesthouse/:id", getGuesthouseDetails);
router.get("/guesthouses", getAllGuesthouses);

export default router;