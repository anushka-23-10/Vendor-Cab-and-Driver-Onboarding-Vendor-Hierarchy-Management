import Driver from "../models/driver.model.js";
import Vehicle from "../models/vehicle.model.js";

export const onboardDriver = async (req, res) => {
  try {
    const { name, licenseNo, assignedVehicle, vendorId } = req.body;
    const driver = await Driver.create({ name, licenseNo, assignedVehicle, vendorId });

    if (assignedVehicle) {
      await Vehicle.findByIdAndUpdate(assignedVehicle, { driverId: driver._id });
    }

    res.status(201).json({ message: "Driver onboarded successfully", driver });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all drivers under a vendor
export const getDriversByVendor = async (req, res) => {
  try {
    const drivers = await Driver.find({ vendorId: req.params.vendorId }).populate("assignedVehicle");
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
