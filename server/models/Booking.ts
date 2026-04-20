import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
    user_id: string;
    room_id: string;
    check_in: Date;
    check_out: Date;
    total_price: number;
    status: string;
}

const bookingSchema = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    room_id: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    check_in: Date,
    check_out: Date,
    total_price: Number,
    status: { type: String, default: "pending" }
});

export default mongoose.model<IBooking>("Booking", bookingSchema);