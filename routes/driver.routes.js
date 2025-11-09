import express from "express";
import { createDriver, getMyDrivers } from "../controllers/driver.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// 🧩 Allow all vendors (except inactive ones)
router.post("/add", authenticate, authorize(["SuperVendor", "RegionalVendor", "CityVendor", "LocalVendor"]), createDriver);
router.get("/list", authenticate, authorize(["SuperVendor", "RegionalVendor", "CityVendor", "LocalVendor"]), getMyDrivers);

export default router;
