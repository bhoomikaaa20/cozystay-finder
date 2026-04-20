import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    full_name: string;
    email: string;
    password: string;
    role: "user" | "admin";
}

const userSchema = new Schema<IUser>({
    full_name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" }
}, { timestamps: true });

export default mongoose.model<IUser>("User", userSchema);