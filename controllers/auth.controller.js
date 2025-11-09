import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Vendor from "../models/vendor.model.js";

// 🟢 Register SuperVendor (auto-creates Vendor record)
export const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashed,
      role: "SuperVendor",
      isActive: true,
    });

    // ✅ Auto create Vendor profile for SuperVendor
    const vendor = await Vendor.create({
      name: username,
      contactInfo: `${username}@example.com`,
      role: "SuperVendor",
      parentVendorId: null,
      userId: user._id,
    });

    const token = jwt.sign(
      { id: user._id.toString(), username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "SuperVendor registered successfully",
      token,
      vendor,
    });
  } catch (err) {
    console.error("❌ Register error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🟡 LOGIN
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.isActive)
      return res.status(403).json({ error: "Account not activated yet" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

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
