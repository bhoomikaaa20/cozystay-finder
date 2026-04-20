import { Request, Response } from "express";
import Guesthouse from "../models/Guesthouse";

export const getGuesthouses = async (_req: Request, res: Response) => {
    const data = await Guesthouse.find().sort({ createdAt: -1 });
    res.json(data);
};

export const createGuesthouse = async (req: Request, res: Response) => {
    const guesthouse = await Guesthouse.create(req.body);
    res.json(guesthouse);
};

export const deleteGuesthouse = async (req: Request, res: Response) => {
    await Guesthouse.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
};