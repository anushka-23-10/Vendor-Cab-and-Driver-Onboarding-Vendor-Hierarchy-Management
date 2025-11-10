// controllers/vendor.controller.js
import Vendor from "../models/vendor.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Vehicle from "../models/vehicle.model.js";
import Driver from "../models/driver.model.js";
import Document from "../models/document.model.js";

// ================================
// 🟢 Register SuperVendor
// ================================
export const registerSuperVendor = async (req, res) => {
  try {
    const { name, username, password, contactInfo, region } = req.body;

    const existing = await Vendor.findOne({ username });
    if (existing)
      return res.status(400).json({ error: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newVendor = new Vendor({
      name,
      username,
      password: hashedPassword,
      contactInfo,
      role: "SuperVendor",
      region,
      isActive: true,
    });

    await newVendor.save();

    res.status(201).json({
      message: "SuperVendor registered successfully!",
      vendor: newVendor,
    });
  } catch (err) {
    console.error("❌ registerSuperVendor Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ================================
// 🟣 Vendor Login
// ================================
export const loginVendor = async (req, res) => {
  try {
    const { username, password } = req.body;

    const vendor = await Vendor.findOne({ username });
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { vendorId: vendor._id, role: vendor.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: vendor.role,
      vendorId: vendor._id,
    });
  } catch (err) {
    console.error("❌ loginVendor Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ================================
// 🟠 Activate Vendor (Admin use)
// ================================
export const activateVendor = async (req, res) => {
  try {
    const { vendorId } = req.body;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    vendor.isActive = true;
    await vendor.save();

    res.json({ message: "Vendor activated successfully" });
  } catch (err) {
    console.error("❌ activateVendor Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ================================
// 🧩 Create SubVendor
// ================================
export const createSubVendor = async (req, res) => {
  try {
    const { name, contactInfo, username, role, region } = req.body;
    const parentVendorId = req.user.vendorId;

    const existing = await Vendor.findOne({ username });
    if (existing)
      return res.status(400).json({ error: "Username already exists" });

    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    const subVendor = new Vendor({
      name,
      contactInfo,
      username,
      password: hashedPassword,
      role,
      region,
      parentVendorId,
      isActive: true,
    });

    await subVendor.save();

    res.status(201).json({
      message: "SubVendor created successfully!",
      vendor: subVendor,
      generatedPassword: password,
    });
  } catch (err) {
    console.error("❌ createSubVendor Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ================================
// 📋 Get Logged-In Vendor Info
// ================================
export const getMyVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.vendorId).select("-password");
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    res.json({ vendor });
  } catch (err) {
    console.error("❌ getMyVendor Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ================================
// 🧾 Get SubVendors under a Vendor
// ================================
export const getMySubVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ parentVendorId: req.user.vendorId });
    console.log(`📋 Found subvendors: ${vendors.length}`);
    res.json({ vendors });
  } catch (err) {
    console.error("❌ getMySubVendors Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ================================
// ⚙️ Set or Update Permissions
// ================================
export const setPermissions = async (req, res) => {
  try {
    const { subVendorId, permissions } = req.body;
    const superVendorId = req.user.vendorId;

    const superVendor = await Vendor.findById(superVendorId);
    if (!superVendor || superVendor.role !== "SuperVendor") {
      return res.status(403).json({
        error: "Unauthorized. Only SuperVendors can modify permissions.",
      });
    }

    const subVendor = await Vendor.findById(subVendorId);
    if (!subVendor)
      return res.status(404).json({ error: "SubVendor not found" });

    if (String(subVendor.parentVendorId) !== String(superVendorId)) {
      return res
        .status(403)
        .json({ error: "Cannot modify vendor outside your hierarchy." });
    }

    subVendor.permissions = { ...subVendor.permissions, ...permissions };
    await subVendor.save();

    res.json({
      message: "Permissions updated successfully",
      permissions: subVendor.permissions,
    });
  } catch (err) {
    console.error("❌ setPermissions Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ================================
// 📊 Fleet & Compliance Overview (SuperVendor)
// ================================
export const getVendorFleetOverview = async (req, res) => {
  try {
    if (req.user.role !== "SuperVendor")
      return res.status(403).json({ error: "Access denied" });

    const superVendorId = req.user.id;

    // 🔹 Find subvendors belonging to this SuperVendor
    const subvendors = await Vendor.find({ parentVendor: superVendorId });

    const overview = [];

    for (const v of subvendors) {
      const vendorId = v._id;

      // ⚙️ Count related data
      const [fleetCount, driverCount, totalDocs, approved, pending, rejected] =
        await Promise.all([
          Vehicle.countDocuments({ vendor: vendorId }),
          Driver.countDocuments({ vendor: vendorId }),
          Document.countDocuments({ vendorId }),
          Document.countDocuments({ vendorId, status: "Approved" }),
          Document.countDocuments({ vendorId, status: "Pending" }),
          Document.countDocuments({ vendorId, status: "Rejected" }),
        ]);

      // 🧮 Calculate compliance rate
      const complianceRate =
        totalDocs === 0 ? 0 : ((approved / totalDocs) * 100).toFixed(1);

      overview.push({
        vendorId,
        vendorName: v.name,
        role: v.role,
        region: v.region || "N/A",
        fleetCount,
        driverCount,
        totalDocs,
        approved,
        pending,
        rejected,
        complianceRate,
      });
    }

    res.json({ overview });
  } catch (err) {
    console.error("❌ getVendorFleetOverview error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
