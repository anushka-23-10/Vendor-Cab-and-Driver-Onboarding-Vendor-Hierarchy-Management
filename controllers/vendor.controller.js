import Vendor from "../models/vendor.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// 🧩 Get current vendor details
export const getMyVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id })
      .populate("parentVendorId", "name role")
      .lean();

    if (!vendor) {
      console.warn("⚠️ No vendor found for user:", req.user.username);
      return res.status(200).json({ vendor: null });
    }

    res.status(200).json({ vendor });
  } catch (err) {
    console.error("❌ getMyVendor error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🧩 Create SubVendor
export const createSubVendor = async (req, res) => {
  try {
    const { name, contactInfo, username, role } = req.body;
    const parentRole = req.user.role;

    const allowedRoles = {
      SuperVendor: ["RegionalVendor", "CityVendor", "LocalVendor"],
      RegionalVendor: ["CityVendor", "LocalVendor"],
      CityVendor: ["LocalVendor"],
      LocalVendor: [],
    };

    if (!allowedRoles[parentRole]?.includes(role)) {
      return res.status(403).json({
        error: `Invalid role assignment. ${parentRole} can only create: ${
          allowedRoles[parentRole].join(", ") || "none"
        }`,
      });
    }

    const existing = await User.findOne({ username });
    if (existing)
      return res.status(400).json({ error: "Username already exists" });

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      role,
      isActive: false,
    });

    const parentVendor = await Vendor.findOne({ userId: req.user.id });

    const subVendor = await Vendor.create({
      name,
      contactInfo,
      role,
      parentVendorId: parentVendor ? parentVendor._id : null,
      userId: newUser._id,
    });

    res.status(201).json({
      message: `${role} created successfully`,
      subVendor,
      tempPassword,
    });
  } catch (err) {
    console.error("❌ createSubVendor error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🧩 Get subvendors
export const getSubVendors = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor)
      return res.status(404).json({ error: "Vendor not found" });

    const subVendors = await Vendor.find({ parentVendorId: vendor._id })
      .select("name contactInfo role")
      .lean();

    res.status(200).json({ vendors: subVendors });
  } catch (err) {
    console.error("❌ getSubVendors error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
