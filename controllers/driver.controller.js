import Driver from "../models/driver.model.js";
import Document from "../models/document.model.js";

// ✅ Helper to check compliance of a single driver
const checkDriverCompliance = async (driverId) => {
  const docs = await Document.find({ driverId });
  if (!docs.length) return false;

  for (const d of docs) {
    if (["Rejected", "Expired", "Pending"].includes(d.status)) {
      return false;
    }
  }
  return true;
};

// ✅ Add Driver
export const createDriver = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { name, licenseNumber, contactInfo, assignedVehicle } = req.body;

    const driver = await Driver.create({
      name,
      licenseNumber,
      contactInfo,
      assignedVehicle,
      vendorId,
    });

    res.status(201).json({ message: "Driver added", driver });
  } catch (err) {
    console.error("❌ createDriver:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get My Drivers (now includes compliance check)
export const getMyDrivers = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const drivers = await Driver.find({ vendorId }).lean();

    // ⚡ Add compliance info
    const driversWithCompliance = await Promise.all(
      drivers.map(async (d) => {
        const compliant = await checkDriverCompliance(d._id);
        return { ...d, compliant };
      })
    );

    res.json({ drivers: driversWithCompliance });
  } catch (err) {
    console.error("❌ getMyDrivers:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
