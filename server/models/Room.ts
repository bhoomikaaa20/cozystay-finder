import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
    guesthouse_id: string;
    name: string;
    room_type: string;
    description?: string;
    price_per_night: number;
    capacity: number;
    is_available: boolean;
}

const roomSchema = new Schema({
    guesthouse_id: { type: mongoose.Schema.Types.ObjectId, ref: "Guesthouse" },
    name: String,
    room_type: String,
    description: String,
    price_per_night: Number,
    capacity: Number,
    is_available: { type: Boolean, default: true }
});

export default mongoose.model<IRoom>("Room", roomSchema);