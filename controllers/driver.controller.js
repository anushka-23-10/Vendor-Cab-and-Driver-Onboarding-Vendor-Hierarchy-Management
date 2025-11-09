import Driver from "../models/driver.model.js";
import Vendor from "../models/vendor.model.js";

// 🟢 Add Driver (only active vendors)
export const createDriver = async (req, res) => {
  try {
    const { name, licenseNumber, contactInfo, assignedVehicle } = req.body;
    const vendorId = req.user.id;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor || !vendor.isActive)
      return res.status(403).json({ error: "Vendor not found or unauthorized" });

    const driver = await Driver.create({
      name,
      licenseNumber,
      contactInfo,
      assignedVehicle,
      vendorId,
    });

    res.status(201).json({ message: "Driver added successfully", driver });
  } catch (err) {
    console.error("❌ createDriver error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 📋 List all drivers of current vendor
export const getMyDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ vendorId: req.user.id }).select(
      "name licenseNumber contactInfo assignedVehicle"
    );
    res.json({ drivers });
  } catch (err) {
    console.error("❌ getMyDrivers error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
