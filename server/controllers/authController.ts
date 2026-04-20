import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response) => {
    try {
        const { full_name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // First user = admin
        const userCount = await User.countDocuments();
        const role = userCount === 0 ? "admin" : "user";

        const user = await User.create({
            full_name,
            email,
            password: hashedPassword,
            role
        });

        res.status(201).json({ message: "Account created" });

    } catch (error) {
        res.status(500).json({ message: "Signup failed" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });

        res.json({ message: "Login successful" });

    } catch {
        res.status(500).json({ message: "Login failed" });
    }
};

export const getMe = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch {
        res.status(500).json({ message: "Error fetching user" });
    }
};

export const logout = async (_req: Request, res: Response) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
};