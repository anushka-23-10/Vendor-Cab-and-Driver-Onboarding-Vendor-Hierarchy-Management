import express from "express";
import { onboardDriver, getDriversByVendor } from "../controllers/driver.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Onboard driver (SubVendor only)
router.post("/onboard", authenticate, onboardDriver);

// Get all drivers under a specific vendor
router.get("/:vendorId", authenticate, getDriversByVendor);

export default router;
