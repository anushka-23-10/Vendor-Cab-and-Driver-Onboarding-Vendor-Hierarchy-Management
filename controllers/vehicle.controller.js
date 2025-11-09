import Vehicle from "../models/vehicle.model.js";
import Vendor from "../models/vendor.model.js";
import Driver from "../models/driver.model.js";
import Document from "../models/document.model.js";
// 🟢 Add new vehicle
export const addVehicle = async (req, res) => {
  try {
    const { registrationNumber, model, seatingCapacity, fuelType } = req.body;
    const vendorId = req.user.id;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor || !vendor.isActive)
      return res.status(403).json({ error: "Unauthorized vendor" });

    const existing = await Vehicle.findOne({ registrationNumber });
    if (existing)
      return res.status(400).json({ error: "Vehicle already exists" });

    const vehicle = await Vehicle.create({
      registrationNumber,
      model,
      seatingCapacity,
      fuelType,
      vendorId,
    });

    res.status(201).json({ message: "Vehicle added successfully", vehicle });
  } catch (err) {
    console.error("❌ addVehicle error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🟡 Assign driver to vehicle
export const assignDriver = async (req, res) => {
  try {
    const { vehicleId, driverId } = req.body;
    const vendorId = req.user.id;

    const vehicle = await Vehicle.findOne({ _id: vehicleId, vendorId });
    if (!vehicle)
      return res
        .status(404)
        .json({ error: "Vehicle not found or unauthorized" });

    const driver = await Driver.findOne({ _id: driverId, vendorId });
    if (!driver)
      return res
        .status(404)
        .json({ error: "Driver not found or unauthorized" });

    vehicle.assignedDriver = driver._id;
    await vehicle.save();

    res.json({ message: "Driver assigned successfully", vehicle });
  } catch (err) {
    console.error("❌ assignDriver error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 📋 Get all vehicles for current vendor
export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ vendorId: req.user.id }).populate(
      "assignedDriver",
      "name licenseNumber"
    );
    res.json({ vehicles });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get Fleet Overview for a Vendor
export const getFleetOverview = async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Find all vehicles for the vendor
    const vehicles = await Vehicle.find({ vendorId }).lean();

    // Attach driver info to each vehicle
    const fleet = await Promise.all(
      vehicles.map(async (v) => {
        const driver = await Driver.findOne({ assignedVehicle: v._id });
        let compliance = "N/A";

        if (driver) {
          const docs = await Document.find({ driverId: driver._id });
          if (!docs.length) compliance = "⚠️ No Docs";
          else if (docs.some((d) => ["Rejected", "Expired"].includes(d.status)))
            compliance = "❌ Non-Compliant";
          else if (docs.every((d) => d.status === "Approved"))
            compliance = "✅ Compliant";
          else compliance = "🕒 Pending";
        }

        return {
          registrationNumber: v.registrationNumber,
          model: v.model,
          fuelType: v.fuelType,
          seatingCapacity: v.seatingCapacity,
          assignedDriver: driver ? driver.name : "-",
          compliance,
        };
      })
    );

    res.json({ fleet });
  } catch (err) {
    console.error("❌ getFleetOverview:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
