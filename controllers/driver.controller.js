import Driver from "../models/driver.model.js";
import Vendor from "../models/vendor.model.js";

// 🧩 Add Driver
export const createDriver = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor)
      return res.status(403).json({ error: "Vendor not found or unauthorized" });

    const { name, licenseNumber, contactInfo, assignedVehicle } = req.body;

    const driver = await Driver.create({
      name,
      licenseNumber,
      contactInfo,
      assignedVehicle,
      vendorId: vendor._id, // ✅ foreign key reference
    });

    console.log(`✅ Driver ${driver.name} added by ${vendor.name}`);
    res.status(201).json({ message: "Driver added successfully", driver });
  } catch (err) {
    console.error("❌ createDriver error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🧩 List Drivers belonging to this Vendor
export const getMyDrivers = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor)
      return res.status(403).json({ error: "Vendor not found or unauthorized" });

    const drivers = await Driver.find({ vendorId: vendor._id }).lean();

    res.status(200).json({ drivers });
  } catch (err) {
    console.error("❌ getMyDrivers error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
