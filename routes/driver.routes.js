import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { addDriver, getDrivers } from "../controllers/driver.controller.js";

const router = express.Router();

router.post(
  "/add",
  authenticate,
  authorize(["SuperVendor", "RegionalVendor", "CityVendor", "LocalVendor"]),
  addDriver
);

router.get(
  "/my",
  authenticate,
  authorize(["SuperVendor", "RegionalVendor", "CityVendor", "LocalVendor"]),
  getDrivers
);

export default router;
