// controllers/vendor.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Vendor from "../models/vendor.model.js";
import { Types } from "mongoose";

// 🟢 Register SuperVendor
export const registerSuperVendor = async (req, res) => {
  try {
    const { name, username, password, region } = req.body;
    if (!name || !username || !password)
      return res.status(400).json({ error: "All fields are required" });

    const existing = await Vendor.findOne({ username });
    if (existing) return res.status(400).json({ error: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const vendor = new Vendor({
      name,
      username,
      password: hashed,
      role: "SuperVendor",
      region,
      isActive: true,
    });
    await vendor.save();

    res.status(201).json({ message: "SuperVendor registered successfully", vendor });
  } catch (err) {
    console.error("❌ registerSuperVendor Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🟣 Login vendor
export const loginVendor = async (req, res) => {
  try {
    const { username, password } = req.body;
    const vendor = await Vendor.findOne({ username });

    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    const valid = await bcrypt.compare(password, vendor.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    if (!vendor.isActive)
      return res.status(403).json({ error: "Account not activated" });

    // ✅ Include vendorId in token
    const token = jwt.sign(
      { vendorId: vendor._id.toString(), role: vendor.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        role: vendor.role,
        region: vendor.region,
      },
    });
  } catch (err) {
    console.error("❌ loginVendor Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🟢 Get logged-in vendor details
export const getMyVendor = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;

    if (!Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({ error: "Invalid vendor ID" });
    }

    const vendor = await Vendor.findById(vendorId).select("-password");
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    res.json({ vendor });
  } catch (err) {
    console.error("❌ getMyVendor Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🟣 Create SubVendor
export const createSubVendor = async (req, res) => {
  try {
    const { name, contactInfo, username, role, region } = req.body;
    if (!name || !contactInfo || !username || !role)
      return res.status(400).json({ error: "Missing fields" });

    const existing = await Vendor.findOne({ username });
    if (existing)
      return res.status(400).json({ error: "Username already exists" });

    const password = Math.random().toString(36).slice(-8); // random temp pwd
    const hashed = await bcrypt.hash(password, 10);

    const subVendor = new Vendor({
      name,
      contactInfo,
      username,
      password: hashed,
      role,
      region,
      parentVendor: req.user.vendorId,
    });

    await subVendor.save();

    res.json({
      message: "SubVendor created successfully",
      subVendor,
      tempPassword: password,
    });
  } catch (err) {
    console.error("❌ createSubVendor Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🟣 Get SubVendors
export const getMySubVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ parentVendor: req.user.vendorId }).select(
      "-password"
    );
    console.log("📋 Found subvendors:", vendors.length);
    res.json({ vendors });
  } catch (err) {
    console.error("❌ getMySubVendors Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🟢 Fleet Overview (for SuperVendor dashboard)
export const getVendorFleetOverview = async (req, res) => {
  try {
    const vendors = await Vendor.find({ parentVendor: req.user.vendorId });
    const overview = vendors.map((v) => ({
      vendorName: v.name,
      role: v.role,
      region: v.region,
      fleetCount: Math.floor(Math.random() * 10),
      driverCount: Math.floor(Math.random() * 20),
      totalDocs: 10,
      approved: 7,
      pending: 2,
      rejected: 1,
      complianceRate: 70 + Math.floor(Math.random() * 20),
    }));
    res.json({ overview });
  } catch (err) {
    console.error("❌ getVendorFleetOverview Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
