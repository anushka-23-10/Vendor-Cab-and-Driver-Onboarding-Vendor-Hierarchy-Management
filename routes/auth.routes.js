import express from "express";
import { register, login } from "../controllers/auth.controller.js";

const router = express.Router();

// 🟢 Register SuperVendor
router.post("/register", register);

// 🟡 Login (SuperVendor or SubVendor)
router.post("/login", login);

export default router;
