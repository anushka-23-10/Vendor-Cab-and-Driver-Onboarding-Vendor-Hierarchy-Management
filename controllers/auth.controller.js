// controllers/auth.controller.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user.model.js";
import Vendor from "../models/vendor.model.js";

/**
 * Register SuperVendor only (accepts optional superVendorId)
 * We hash the password explicitly here (once) and store lowercase username.
 */
export const register = async (req, res) => {
  try {
    let { username, password, superVendorId } = req.body;
    if (!username || !password) return res.status(400).json({ error: "username and password required" });

    username = username.toLowerCase();

    // ensure unique username
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create vendor record (SuperVendor)
    const vendor = await Vendor.create({
      name: username,
      role: "SuperVendor",
      parentVendorId: null,
      superVendorId: superVendorId || null,
    });

    // Create user and mark active immediately for SuperVendor
    const user = await User.create({
      username,
      password: hashedPassword,
      role: "SuperVendor",
      vendorId: vendor._id,
      parentVendorId: null,
      isActive: true,
    });

    return res.status(201).json({
      message: "SuperVendor registered successfully",
      user: { username: user.username, role: user.role, vendorId: user.vendorId },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(400).json({ error: err.message });
  }
};

/**
 * Login for any user (super + subvendors)
 */
export const login = async (req, res) => {
  try {
    let { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "username and password required" });

    username = username.toLowerCase();
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.isActive) return res.status(403).json({ error: "Account not activated. Please activate your account first." });

    // Debug logging (remove in production)
    console.log("🔍 LOGIN ATTEMPT:");
    console.log("Entered username:", username);
    console.log("Entered password:", password);
    console.log("Stored hash:", user.password);
    console.log("User role:", user.role);
    console.log("IsActive:", user.isActive);

    const match = await bcrypt.compare(password, user.password);
    console.log("Password match result:", match);

    if (!match) return res.status(401).json({ error: "Invalid credentials. Please check your password." });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
        vendorId: user.vendorId,
        parentVendorId: user.parentVendorId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ token, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Activate account (manual - subvendor sets password)
 * This endpoint sets a new password and flips isActive -> true
 */
export const activateAccount = async (req, res) => {
  try {
    let { username, newPassword } = req.body;
    if (!username || !newPassword) return res.status(400).json({ error: "username and newPassword required" });

    username = username.toLowerCase();
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isActive) return res.status(400).json({ error: "Account already activated" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.isActive = true;
    // clear any activation token if used
    user.activationToken = null;
    await user.save();

    return res.json({ message: "Account activated successfully" });
  } catch (err) {
    console.error("Activate error:", err);
    return res.status(500).json({ error: err.message });
  }
};
