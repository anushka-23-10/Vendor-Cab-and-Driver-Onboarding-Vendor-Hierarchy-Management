import express from "express";
import {
  createSubVendor,
  getSubVendors,
  getMyVendor,
} from "../controllers/vendor.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// ✅ Only these roles can create subvendors
router.post(
  "/create-subvendor",
  authenticate,
  authorize(["SuperVendor", "RegionalVendor", "CityVendor"]),
  createSubVendor
);

// ✅ Only Super/Regional/City vendors can view their subvendors
router.get(
  "/my-subvendors",
  authenticate,
  authorize(["SuperVendor", "RegionalVendor", "CityVendor"]),
  getSubVendors
);

// ✅ All vendors can fetch their info
router.get("/me", authenticate, getMyVendor);

export default router;
