import express from "express";
import {
  registerSuperVendor,
  loginVendor,
  createSubVendor,
  activateVendor,
  getMyVendor,
  getMySubVendors,
  getVendorFleetOverview,
} from "../controllers/vendor.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import Vendor from "../models/vendor.model.js"; // ✅ Correct import (uppercase)

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

// 🟣 Vendor Info (for self)
router.get("/me", authenticate, getMyVendor);

// 🟣 Fleet Overview (SuperVendor only)
router.get(
  "/fleet-overview",
  authenticate,
  authorize(["SuperVendor"]),
  getVendorFleetOverview
);

// 🟣 Get specific SubVendor by ID (for permission viewing)
router.get("/:id", authenticate, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    res.json({ vendor });
  } catch (err) {
    console.error("❌ Error fetching vendor:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🟣 Set / Update SubVendor Permissions (SuperVendor only)
router.post(
  "/set-permissions",
  authenticate,
  authorize(["SuperVendor"]),
  async (req, res) => {
    try {
      const { subVendorId, permissions } = req.body;

      if (!subVendorId || !permissions) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const superVendor = await Vendor.findById(req.user.id);
      if (!superVendor || superVendor.role !== "SuperVendor") {
        return res
          .status(403)
          .json({ error: "Only SuperVendors can modify permissions" });
      }

      const subVendor = await Vendor.findById(subVendorId);
      if (!subVendor)
        return res.status(404).json({ error: "SubVendor not found" });

      // Ensure subvendor belongs to this supervendor
      if (String(subVendor.parentVendorId) !== String(superVendor._id)) {
        return res
          .status(403)
          .json({ error: "Cannot modify a vendor not under your hierarchy" });
      }

      subVendor.permissions = { ...subVendor.permissions, ...permissions };
      await subVendor.save();

      res.json({
        message: "Permissions updated successfully",
        permissions: subVendor.permissions,
      });
    } catch (err) {
      console.error("❌ set-permissions:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
