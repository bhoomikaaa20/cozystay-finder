import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import publicRoutes from "./routes/publicRoutes";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin: "http://localhost:8080", // your frontend port
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// ✅ Routes (FIXED)
app.use("/auth", authRoutes);
app.use("/bookings", bookingRoutes);
app.use("/", publicRoutes);
app.use("/admin", adminRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));