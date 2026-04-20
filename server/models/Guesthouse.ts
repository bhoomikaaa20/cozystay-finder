import mongoose, { Schema, Document } from "mongoose";

export interface IGuesthouse extends Document {
    name: string;
    location: string;
    description?: string;
    cover_image?: string;
    price_from: number;
}

const guesthouseSchema = new Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: String,
    cover_image: String,
    price_from: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<IGuesthouse>("Guesthouse", guesthouseSchema);