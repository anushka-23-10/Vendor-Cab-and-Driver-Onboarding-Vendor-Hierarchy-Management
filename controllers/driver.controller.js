import Driver from "../models/driver.model.js";
import Vehicle from "../models/vehicle.model.js";

// ✅ Add new driver
export const addDriver = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { name, licenseNumber, contactInfo, assignedVehicle } = req.body;

    if (!name || !licenseNumber) {
      return res.status(400).json({ error: "Name and license number are required" });
    }

    const driver = new Driver({
      name,
      licenseNumber,
      contactInfo,
      vendor: vendorId, // ✅ FIXED field name
      assignedVehicle: assignedVehicle || null,
    });

    await driver.save();
    res.status(201).json({ message: "Driver added successfully", driver });
  } catch (err) {
    console.error("❌ addDriver Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get all drivers for a vendor
export const listDrivers = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;

    // ✅ Using `vendor` field (not `vendorId`)
    const drivers = await Driver.find({ vendor: vendorId })
      .populate("assignedVehicle", "registrationNumber model fuelType capacity")
      .lean();

    console.log("👥 Returning drivers:", drivers.length);

    res.json({
      success: true,
      count: drivers.length,
      drivers,
    });
  } catch (err) {
    console.error("❌ listDrivers Error Trace:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
