import express from "express";
import {
  registerSuperVendor,
  loginVendor,
  createSubVendor,
  activateVendor,
  getMyVendor,
  getMySubVendors,
} from "../controllers/vendor.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { getVendorFleetOverview } from "../controllers/vendor.controller.js";

const router = express.Router();

// 🟢 Registration + Login
router.post("/register", registerSuperVendor);
router.post("/login", loginVendor);

// 🟣 Activation
router.post("/activate", activateVendor);

// 🧩 Vendor Hierarchy
router.post(
  "/create-subvendor",
  authenticate,
  authorize(["SuperVendor", "RegionalVendor", "CityVendor"]),
  createSubVendor
);
router.get(
  "/my-subvendors",
  authenticate,
  authorize(["SuperVendor", "RegionalVendor", "CityVendor"]),
  getMySubVendors
);
router.get("/me", authenticate, getMyVendor);

router.get(
  "/fleet-overview",
  authenticate,
  authorize(["SuperVendor"]),
  getVendorFleetOverview
);
export default router;
