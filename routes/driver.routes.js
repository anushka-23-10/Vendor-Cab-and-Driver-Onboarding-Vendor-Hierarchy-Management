// routes/driver.routes.js
import express from "express";
import { createDriver, getMyDrivers } from "../controllers/driver.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", authenticate, createDriver);
router.get("/list", authenticate, getMyDrivers);

export default router;
