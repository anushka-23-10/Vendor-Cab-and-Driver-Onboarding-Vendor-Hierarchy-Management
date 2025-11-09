// routes/auth.routes.js
import express from "express";
import { register, login, activateAccount } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register); // only for SuperVendor
router.post("/login", login);
router.post("/activate", activateAccount);

export default router;
