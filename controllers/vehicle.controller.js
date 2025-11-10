// controllers/vehicle.controller.js
import Vehicle from "../models/vehicle.model.js";
import Vendor from "../models/vendor.model.js";

export const addVehicle = async (req, res) => {
  try {
    const { registrationNumber, model, capacity, fuelType } = req.body;
    console.log("📩 Incoming Vehicle Add:", {
      registrationNumber,
      model,
      capacity,
      fuelType,
    });
    console.log("🔑 Vendor from token:", req.user);

    if (!registrationNumber || !model || !capacity || !fuelType) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const vendorId = req.user?.vendorId;
    if (!vendorId) {
      console.error("🚫 Vendor ID missing from token");
      return res.status(401).json({ error: "Unauthorized vendor" });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      console.error("🚫 Vendor not found in DB:", vendorId);
      return res.status(404).json({ error: "Vendor not found." });
    }

    const existing = await Vehicle.findOne({ registrationNumber });
    if (existing) {
      console.error("⚠️ Duplicate vehicle detected:", registrationNumber);
      return res.status(400).json({ error: "Vehicle already registered." });
    }

    const vehicle = new Vehicle({
      registrationNumber,
      model,
      capacity,
      fuelType,
      vendor: vendorId,
    });

    await vehicle.save();
    console.log("✅ Vehicle added:", vehicle);

    res.status(201).json({ message: "Vehicle added successfully!", vehicle });
  } catch (err) {
    console.error("❌ addVehicle Error Trace:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};

export const getVehicles = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const vehicles = await Vehicle.find({ vendor: vendorId }).populate(
      "assignedDriver",
      "name"
    );
    res.json({ vehicles });
  } catch (err) {
    console.error("❌ getVehicles Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const assignDriver = async (req, res) => {
  try {
    const { registrationNumber, driverId } = req.body;

    if (!registrationNumber || !driverId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const vendorId = req.user.vendorId;
    const vehicle = await Vehicle.findOne({
      registrationNumber,
      vendor: vendorId,
    });
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    vehicle.assignedDriver = driverId;
    await vehicle.save();

    res.json({ message: "Driver assigned successfully", vehicle });
  } catch (err) {
    console.error("❌ assignDriver Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFleetOverview = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const vehicles = await Vehicle.find({ vendor: vendorId }).populate(
      "assignedDriver",
      "name"
    );
    res.json({ fleet: vehicles });
  } catch (err) {
    console.error("❌ getFleetOverview Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
