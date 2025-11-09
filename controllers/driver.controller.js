// controllers/driver.controller.js
import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  contactInfo: { type: String, required: true },
  assignedVehicle: { type: String, default: "" },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true }, // foreign key
});

export const Driver = mongoose.model("Driver", driverSchema);

/**
 * Create a new driver under the logged-in vendor
 */
export const createDriver = async (req, res) => {
  try {
    if (!req.user?.vendorId)
      return res.status(401).json({ error: "Unauthorized" });

    const { name, licenseNumber, contactInfo, assignedVehicle } = req.body;

    if (!name || !licenseNumber || !contactInfo) {
      return res
        .status(400)
        .json({ error: "Name, license number, and contact info are required." });
    }

    const driver = await Driver.create({
      name,
      licenseNumber,
      contactInfo,
      assignedVehicle,
      vendorId: req.user.vendorId,
    });

    res
      .status(201)
      .json({ message: "Driver added successfully", driver });
  } catch (err) {
    console.error("createDriver error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Fetch all drivers for the logged-in vendor
 */
export const getMyDrivers = async (req, res) => {
  try {
    if (!req.user?.vendorId)
      return res.status(401).json({ error: "Unauthorized" });

    const drivers = await Driver.find({ vendorId: req.user.vendorId }).lean();

    res.json({ drivers });
  } catch (err) {
    console.error("getMyDrivers error:", err);
    res.status(500).json({ error: err.message });
  }
};
