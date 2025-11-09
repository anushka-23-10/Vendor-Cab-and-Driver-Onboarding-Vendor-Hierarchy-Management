import express from "express";
import { createDriver, getMyDrivers } from "../controllers/driver.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ Authenticated route to add driver
router.post("/add", authenticate, createDriver);

// ✅ Fetch all drivers belonging to this vendor
router.get("/list", authenticate, getMyDrivers);

export default router;
