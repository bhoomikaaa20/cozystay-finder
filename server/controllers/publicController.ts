import { Request, Response } from "express";
import Guesthouse from "../models/Guesthouse";
import Room from "../models/Room";

export const getGuesthouseDetails = async (req: Request, res: Response) => {
    const { id } = req.params;

    const guesthouse = await Guesthouse.findById(id);
    const rooms = await Room.find({ guesthouse_id: id }).sort({ price_per_night: 1 });

    res.json({
        guesthouse,
        rooms,
    });
};
export const getAllGuesthouses = async (req: any, res: Response) => {
    try {
        const guesthouses = await Guesthouse.find().sort({ createdAt: -1 });
        res.json(guesthouses);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch guesthouses" });
    }
};