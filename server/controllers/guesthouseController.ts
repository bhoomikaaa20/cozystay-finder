import { Request, Response } from "express";
import Guesthouse from "../models/Guesthouse";

export const getGuesthouses = async (_req: Request, res: Response) => {
    const data = await Guesthouse.find().sort({ createdAt: -1 });
    res.json(data);
};

export const createGuesthouse = async (req: Request, res: Response) => {
    try {
        const { name, location, description, price_from, cover_image } = req.body;

        const gh = await Guesthouse.create({
            name,
            location,
            description,
            price_from,
            cover_image, // ✅ store image
        });

        res.json(gh);
    } catch (err) {
        res.status(500).json({ message: "Error creating guesthouse" });
    }
};

export const deleteGuesthouse = async (req: Request, res: Response) => {
    await Guesthouse.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
};