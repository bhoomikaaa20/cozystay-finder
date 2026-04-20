import express from "express";
import { signup, login, getMe, logout } from "../controllers/authController";
import verifyUser from "../middleware/verifyUser";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", verifyUser, getMe);
router.post("/logout", logout);

export default router;