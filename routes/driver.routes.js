import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { addDriver, listDrivers } from "../controllers/driver.controller.js";

const router = express.Router();

router.post(
  "/add",
  authenticate,
  authorize(["SuperVendor", "RegionalVendor", "CityVendor", "LocalVendor"]),
  addDriver
);

router.get(
  "/list",
  authenticate,
  authorize(["SuperVendor", "RegionalVendor", "CityVendor", "LocalVendor"]),
  listDrivers
);

export default router;
