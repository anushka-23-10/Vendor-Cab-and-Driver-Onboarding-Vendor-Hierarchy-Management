// routes/vendor.routes.js
import express from "express";
import {
  registerSuperVendor,
  loginVendor,
  createSubVendor,
  getMyVendor,
  getMySubVendors,
  getVendorFleetOverview,
} from "../controllers/vendor.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import Vendor from "../models/vendor.model.js";

const router = express.Router();

router.post("/register", registerSuperVendor);
router.post("/login", loginVendor);

router.get("/me", authenticate, getMyVendor);

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

router.get(
  "/fleet-overview",
  authenticate,
  authorize(["SuperVendor"]),
  getVendorFleetOverview
);

router.get("/:id", authenticate, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).select("-password");
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    res.json({ vendor });
  } catch (err) {
    console.error("❌ vendor/:id error", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/set-permissions", authenticate, async (req, res) => {
  try {
    const { subVendorId, permissions } = req.body;
    const superVendor = await Vendor.findById(req.user.vendorId);
    if (!superVendor || superVendor.role !== "SuperVendor")
      return res
        .status(403)
        .json({ error: "Only SuperVendors can modify permissions" });

    const subVendor = await Vendor.findById(subVendorId);
    if (!subVendor)
      return res.status(404).json({ error: "SubVendor not found" });

    if (String(subVendor.parentVendor) !== String(superVendor._id)) {
      return res
        .status(403)
        .json({ error: "Not authorized to modify this subvendor" });
    }

    subVendor.permissions = { ...subVendor.permissions, ...permissions };
    await subVendor.save();

    res.json({
      message: "Permissions updated successfully",
      vendor: subVendor,
    });
  } catch (err) {
    console.error("❌ set-permissions error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
