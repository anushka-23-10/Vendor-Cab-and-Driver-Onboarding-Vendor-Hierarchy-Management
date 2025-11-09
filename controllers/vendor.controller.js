import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Vendor from "../models/vendor.model.js";

// 🟢 Register SuperVendor
export const registerSuperVendor = async (req, res) => {
  try {
    const { username, password, name, contactInfo, region } = req.body;

    const existing = await Vendor.findOne({ username });
    if (existing)
      return res.status(400).json({ error: "Username already exists" });

    // ❌ don't hash manually — model will hash automatically
    const vendor = await Vendor.create({
      username,
      password,
      name,
      contactInfo,
      region: region || "Head Office",
      role: "SuperVendor",
      isActive: true,
    });

    const token = jwt.sign(
      { id: vendor._id, username: vendor.username, role: vendor.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "SuperVendor registered successfully",
      token,
    });
  } catch (err) {
    console.error("❌ registerSuperVendor:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🟡 Login (any vendor)
export const loginVendor = async (req, res) => {
  try {
    const { username, password } = req.body;
    const vendor = await Vendor.findOne({ username });
    if (!vendor) return res.status(404).json({ error: "User not found" });

    if (!vendor.isActive)
      return res.status(403).json({ error: "Account not activated" });

    const match = await bcrypt.compare(password, vendor.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: vendor._id, username: vendor.username, role: vendor.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error("❌ loginVendor:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🧩 Create SubVendor
export const createSubVendor = async (req, res) => {
  try {
    const { name, username, contactInfo, role, region, password } = req.body;

    if (!name || !username || !contactInfo || !role)
      return res.status(400).json({ error: "Missing required fields" });

    const parent = await Vendor.findById(req.user.id);
    if (!parent)
      return res.status(404).json({ error: "Parent vendor not found" });

    const allowed = {
      SuperVendor: ["RegionalVendor", "CityVendor", "LocalVendor"],
      RegionalVendor: ["CityVendor", "LocalVendor"],
      CityVendor: ["LocalVendor"],
      LocalVendor: [],
    };

    if (!allowed[parent.role]?.includes(role)) {
      return res.status(403).json({
        error: `${parent.role} can only create: ${
          allowed[parent.role].join(", ") || "none"
        }`,
      });
    }

    const existing = await Vendor.findOne({ username });
    if (existing)
      return res.status(400).json({ error: "Username already exists" });

    const tempPassword = password || Math.random().toString(36).slice(-8);

    // ❌ don't hash here; let pre-save handle it
    const subVendor = await Vendor.create({
      name,
      username,
      contactInfo,
      role,
      region: region || "Unassigned",
      password: tempPassword,
      parentVendorId: parent._id,
      isActive: false,
    });

    res.status(201).json({
      message: `SubVendor created successfully. Temporary password: ${tempPassword}`,
      subVendor,
    });
  } catch (err) {
    console.error("❌ createSubVendor error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};

// 🟣 Activate account
export const activateVendor = async (req, res) => {
  try {
    const { username, password } = req.body;
    const vendor = await Vendor.findOne({ username });
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    if (vendor.isActive)
      return res.status(400).json({ error: "Already activated" });

    vendor.password = password; // model will hash automatically
    vendor.isActive = true;
    await vendor.save();

    res.json({
      message: "✅ Account activated successfully! You can now log in.",
    });
  } catch (err) {
    console.error("❌ activateVendor:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔍 Get current vendor
export const getMyVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.id).populate(
      "parentVendorId",
      "name role"
    );
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    res.json({ vendor });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// 📋 Get subvendors of logged-in vendor
export const getMySubVendors = async (req, res) => {
  try {
    const mySubvendors = await Vendor.find({
      parentVendorId: req.user.id,
    }).select("name username contactInfo role region isActive");

    console.log("📋 Found subvendors:", mySubvendors.length);

    res.json({ vendors: mySubvendors });
  } catch (err) {
    console.error("❌ getMySubVendors:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
