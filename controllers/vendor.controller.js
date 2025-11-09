// controllers/vendor.controller.js
import Vendor from "../models/vendor.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * Utility to determine allowed child vendor types based on parent role
 */
const allowedChildren = {
  SuperVendor: ["RegionalVendor", "CityVendor", "LocalVendor"],
  RegionalVendor: ["CityVendor", "LocalVendor"],
  CityVendor: ["LocalVendor"],
  LocalVendor: [], // cannot create new
};

/**
 * Create subvendor (SuperVendor or SubVendor depending on hierarchy)
 */
export const createSubVendor = async (req, res) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parentRole = req.user.role;
    const childAllowed = allowedChildren[parentRole] || [];

    if (childAllowed.length === 0) {
      return res.status(403).json({ error: `${parentRole} cannot create new subvendors.` });
    }

    const { name, contactInfo, role, username, superVendorId } = req.body;

    if (!name || !username || !role || !superVendorId) {
      return res.status(400).json({ error: "name, username, role, and superVendorId are required" });
    }

    // Validate allowed role creation
    if (!childAllowed.includes(role)) {
      return res.status(400).json({
        error: `Invalid role assignment. ${parentRole} can only create: ${childAllowed.join(", ")}.`,
      });
    }

    const parentVendorObjectId = req.user.vendorId;
    const normalizedUsername = username.toLowerCase();

    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) return res.status(400).json({ error: "Username already exists" });

    // Create vendor (no address now)
    const subVendor = await Vendor.create({
      name,
      contactInfo,
      role,
      parentVendorId: parentVendorObjectId,
      superVendorId,
    });

    const tempPassword = crypto.randomBytes(6).toString("hex");
    const hashedTemp = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
      username: normalizedUsername,
      password: hashedTemp,
      role: "SubVendor",
      vendorId: subVendor._id,
      parentVendorId: parentVendorObjectId,
      isActive: false,
    });

    res.status(201).json({
      message: `${role} created successfully. Activation required.`,
      subVendor: { id: subVendor._id, name: subVendor.name, role: subVendor.role },
      tempPasswordForDemo: tempPassword,
    });
  } catch (err) {
    console.error("createSubVendor error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * List all direct child vendors
 */
export const getSubVendors = async (req, res) => {
  try {
    const parentId = req.user.vendorId;
    const vendors = await Vendor.find({ parentVendorId: parentId }).lean();
    res.json({ vendors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get current vendor info (for role + superVendorId)
 */
export const getMyVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.vendorId).lean();
    res.json({ vendor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
