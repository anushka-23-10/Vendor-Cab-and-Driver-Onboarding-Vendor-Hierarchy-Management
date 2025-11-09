import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
// import User from "../models/user.model.js";
import Vendor from "../models/vendor.model.js";

// 🟢 Register SuperVendor
export const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existing = await Vendor.findOne({ username });
    if (existing)
      return res.status(400).json({ error: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await Vendor.create({
      username,
      password: hashed,
      role: "SuperVendor",
      isActive: true,
    });

    await Vendor.create({
      name: username,
      contactInfo: `${username}@example.com`,
      role: "SuperVendor",
      region: "Head Office",
      userId: user._id,
      parentVendorId: null,
    });

    const token = jwt.sign(
      { id: user._id.toString(), username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({ message: "SuperVendor registered successfully", token });
  } catch (err) {
    console.error("❌ Register error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🟡 Login (works for all roles)
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Vendor.findOne({ username });

    if (!user)
      return res.status(404).json({ error: "User not found" });

    // 🔐 Block inactive accounts
    if (!user.isActive)
      return res.status(403).json({ error: "Account not activated. Please activate first." });

    // ✅ Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: "Invalid credentials" });

    // ✅ Ensure vendor record exists
    let vendor = await Vendor.findOne({ userId: user._id });
    if (!vendor) {
      vendor = await Vendor.create({
        name: user.username,
        contactInfo: `${user.username}@example.com`,
        role: user.role,
        region: "AutoAssigned",
        userId: user._id,
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log(`✅ Login success: ${user.username} (${user.role})`);
    res.status(200).json({ token });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🟣 Activate Account (for subvendors)
export const activateAccount = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await Vendor.findOne({ username });
    if (!user)
      return res.status(404).json({ error: "User not found" });

    if (user.isActive)
      return res.status(400).json({ error: "Account already activated" });

    // ✅ Set new password + activate
    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.isActive = true;
    await user.save();

    res.status(200).json({ message: "Account activated successfully" });
  } catch (err) {
    console.error("❌ Activation error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
