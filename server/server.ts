import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";

dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/rooms", require("./routes/roomRoutes"));
app.use("/bookings", require("./routes/bookingRoutes"));

app.listen(5000, () => console.log("Server running on port 5000"));