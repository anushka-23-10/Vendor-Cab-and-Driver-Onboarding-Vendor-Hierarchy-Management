import express from "express";
import { onboardDriver, getDriversByVendor } from "../controllers/driver.controller.js";
import { authenticate } from "../config/auth.js";

const router = express.Router();

router.post("/onboard", authenticate, onboardDriver);
router.get("/:vendorId", authenticate, getDriversByVendor);

export default router;
