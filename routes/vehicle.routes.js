import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { addVehicle, assignDriver, getVehicles } from "../controllers/vehicle.controller.js";

const router = express.Router();

router.post("/add", authenticate, authorize(["SuperVendor", "RegionalVendor", "CityVendor", "LocalVendor"]), addVehicle);
router.post("/assign-driver", authenticate, authorize(["SuperVendor", "RegionalVendor", "CityVendor", "LocalVendor"]), assignDriver);
router.get("/my", authenticate, authorize(["SuperVendor", "RegionalVendor", "CityVendor", "LocalVendor"]), getVehicles);

export default router;
