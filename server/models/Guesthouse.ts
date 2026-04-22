import mongoose, { Schema, Document } from "mongoose";

export interface IGuesthouse extends Document {
    name: string;
    location: string;
    description?: string;
    cover_image?: string;
    price_from: number;
}

const guesthouseSchema = new mongoose.Schema({
    name: String,
    location: String,
    description: String,
    price_from: Number,

    cover_image: { type: String, required: true }, // ✅ ADD THIS

}, { timestamps: true });

export default mongoose.model<IGuesthouse>("Guesthouse", guesthouseSchema);