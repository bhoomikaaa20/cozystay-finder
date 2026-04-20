import { Request, Response } from "express";
import Room from "../models/Room";

export const getRooms = async (req: Request, res: Response) => {
    const rooms = await Room.find({ guesthouse_id: req.params.guesthouseId });
    res.json(rooms);
};

export const addRoom = async (req: Request, res: Response) => {
    const room = await Room.create(req.body);
    res.json(room);
};

export const toggleRoom = async (req: Request, res: Response) => {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Not found" });

    room.is_available = !room.is_available;
    await room.save();

    res.json(room);
};

export const deleteRoom = async (req: Request, res: Response) => {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
};