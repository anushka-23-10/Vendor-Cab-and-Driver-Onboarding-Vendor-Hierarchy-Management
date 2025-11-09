import { DriverService } from "../services/driver.service.js";

// 🟢 Onboard a new Driver
export const onboardDriver = async (req, res) => {
  try {
    const { name, licenseNo } = req.body;
    const vendorId = req.user.id; // Automatically link driver to logged-in vendor

    const driverService = new DriverService({
      name,
      licenseNo,
      vendorId
    });

    const newDriver = await driverService.onboardDriver();

    res.status(201).json({
      message: "Driver onboarded successfully ✅",
      driver: newDriver
    });
  } catch (err) {
    console.error("❌ Error onboarding driver:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟡 Get all Drivers for a Vendor
export const getDriversByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const drivers = await DriverService.getDriversByVendor(vendorId);
    res.status(200).json(drivers);
  } catch (err) {
    console.error("❌ Error fetching drivers:", err);
    res.status(500).json({ error: err.message });
  }
};
