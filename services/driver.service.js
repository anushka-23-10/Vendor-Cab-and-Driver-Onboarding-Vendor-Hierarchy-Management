// Handles driver onboarding and linking to vehicles
// Demonstrates Composition (Vendor → Drivers)
import Driver from "../models/driver.model.js";
import Vehicle from "../models/vehicle.model.js";

export class DriverService {
  constructor(driverData) {
    this.name = driverData.name;
    this.licenseNo = driverData.licenseNo;
    this.assignedVehicle = driverData.assignedVehicle;
    this.vendorId = driverData.vendorId;
  }

  async onboardDriver() {
    const driver = new Driver({
      name: this.name,
      licenseNo: this.licenseNo,
      assignedVehicle: this.assignedVehicle,
      vendorId: this.vendorId,
    });

    const savedDriver = await driver.save();

    // Link driver to a vehicle if provided
    if (this.assignedVehicle) {
      await Vehicle.findByIdAndUpdate(this.assignedVehicle, {
        driverId: savedDriver._id,
      });
    }

    return savedDriver;
  }

  static async getDriversByVendor(vendorId) {
    return await Driver.find({ vendorId }).populate("assignedVehicle");
  }
}
