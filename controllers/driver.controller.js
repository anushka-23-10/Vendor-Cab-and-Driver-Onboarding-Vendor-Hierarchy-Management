// controllers/driver.controller.js
import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  licenseNumber: String,
  assignedVehicle: { type: String, default: "" },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
});

export const Driver = mongoose.model("Driver", driverSchema);

/**
 * Create a new driver (SubVendor level)
 */
export const createDriver = async (req, res) => {
  try {
    if (!req.user || !req.user.vendorId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, phone, licenseNumber, assignedVehicle } = req.body;
    if (!name) return res.status(400).json({ error: "Driver name required" });

    const driver = await Driver.create({
      name,
      phone,
      licenseNumber,
      assignedVehicle,
      vendorId: req.user.vendorId,
    });

    res.status(201).json({ message: "Driver added successfully", driver });
  } catch (err) {
    console.error("createDriver error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * List all drivers under the vendor
 */
export const getMyDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ vendorId: req.user.vendorId }).lean();
    res.json({ drivers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
