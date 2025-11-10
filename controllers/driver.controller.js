// controllers/driver.controller.js
import Driver from "../models/driver.model.js";
import Vehicle from "../models/vehicle.model.js";

export const addDriver = async (req, res) => {
  try {
    const { name, licenseNumber, contactInfo, assignedVehicle } = req.body;

    if (!name || !licenseNumber || !contactInfo) {
      return res.status(400).json({ error: "Name, License, and Contact Info are required." });
    }

    const vendorId = req.user?.vendorId;
    if (!vendorId) {
      return res.status(401).json({ error: "Unauthorized vendor" });
    }

    if (assignedVehicle && !mongoose.Types.ObjectId.isValid(assignedVehicle)) {
      return res.status(400).json({ error: "Invalid vehicle ID." });
    }

    const driver = new Driver({
      name,
      licenseNumber,
      contactInfo,
      assignedVehicle: assignedVehicle || null,
      vendorId,
    });

    await driver.save();
    res.status(201).json({ message: "Driver added successfully!", driver });
  } catch (err) {
    console.error("❌ addDriver Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const listDrivers = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const drivers = await Driver.find({ vendorId }).populate("assignedVehicle", "registrationNumber");
    res.json({ drivers });
  } catch (err) {
    console.error("❌ listDrivers Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
