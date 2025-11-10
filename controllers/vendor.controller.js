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
// controllers/vendor.controller.js

export const registerSuperVendor = async (req, res) => {
  try {
    const { name, username, password, contactInfo, region } = req.body;

    const existing = await Vendor.findOne({ username });
    if (existing)
      return res.status(400).json({ error: "Username already exists" });

    // ❌ REMOVE manual bcrypt.hash — schema does it automatically
    const newVendor = new Vendor({
      name,
      username,
      password, // pass plain password here
      contactInfo,
      role: "SuperVendor",
      region,
      isActive: true,
    });

    await newVendor.save(); // schema pre-save will hash it

    const token = jwt.sign(
      { vendorId: newVendor._id, role: newVendor.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "SuperVendor registered successfully!",
      vendor: newVendor,
      token,
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
      isActive: false,
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
// 📊 Fleet & Compliance Overview
// ================================
export const getVendorFleetOverview = async (req, res) => {
  try {
    if (req.user.role !== "SuperVendor")
      return res.status(403).json({ error: "Access denied" });

    const superVendorId = req.user.vendorId;
    const subvendors = await Vendor.find({ parentVendorId: superVendorId });

    const overview = [];

    for (const v of subvendors) {
      const vendorId = v._id;

      const [fleetCount, driverCount, totalDocs, approved, pending, rejected] =
        await Promise.all([
          Vehicle.countDocuments({ vendor: vendorId }),
          Driver.countDocuments({ vendor: vendorId }),
          Document.countDocuments({ vendorId }),
          Document.countDocuments({ vendorId, status: "Approved" }),
          Document.countDocuments({ vendorId, status: "Pending" }),
          Document.countDocuments({ vendorId, status: "Rejected" }),
        ]);

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

// ================================
// 🟢 Activate Vendor (Set Password)
// ================================
export const activateVendor = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Find vendor by username
    const vendor = await Vendor.findOne({ username });
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    // If already active, prevent reactivation
    if (vendor.isActive) {
      return res
        .status(400)
        .json({ error: "Account is already active. Please log in." });
    }

    // Hash and update new password
    vendor.password = password; // ✅ will be hashed automatically by pre('save')
    vendor.isActive = true;

    await vendor.save();

    res.json({
      message: "Account activated successfully! You can now log in.",
    });
  } catch (err) {
    console.error("❌ activateVendor Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
