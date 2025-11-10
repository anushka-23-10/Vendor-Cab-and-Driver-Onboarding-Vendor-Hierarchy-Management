import Driver from "../models/driver.model.js";

export const addDriver = async (req, res) => {
  try {
    const { name, licenseNumber, assignedVehicle } = req.body;

    if (!name || !licenseNumber)
      return res.status(400).json({ error: "Missing fields" });

    const driver = new Driver({
      name,
      licenseNumber,
      assignedVehicle,
      vendor: req.user.vendorId,
    });

    await driver.save();
    res.status(201).json({ message: "Driver added successfully", driver });
  } catch (err) {
    console.error("❌ addDriver Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ vendor: req.user.vendorId });
    res.json({ drivers });
  } catch (err) {
    console.error("❌ getDrivers Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
