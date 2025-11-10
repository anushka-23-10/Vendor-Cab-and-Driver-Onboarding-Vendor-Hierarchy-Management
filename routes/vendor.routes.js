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
// 🟣 Set permissions for a subvendor (SuperVendor only)
router.post(
  "/set-permissions",
  authenticate,
  authorize(["SuperVendor"]),
  async (req, res) => {
    try {
      const { subVendorId, permissions } = req.body;

      if (!subVendorId || !permissions)
        return res.status(400).json({ error: "Missing required fields" });

      const vendor = await Vendor.findById(subVendorId);
      if (!vendor)
        return res.status(404).json({ error: "SubVendor not found" });

      vendor.permissions = { ...vendor.permissions, ...permissions };
      await vendor.save();

      res.json({ message: "Permissions updated successfully", vendor });
    } catch (err) {
      console.error("❌ set-permissions:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/me", authenticate, getMyVendor);

router.get(
  "/fleet-overview",
  authenticate,
  authorize(["SuperVendor"]),
  getVendorFleetOverview
);
export default router;
