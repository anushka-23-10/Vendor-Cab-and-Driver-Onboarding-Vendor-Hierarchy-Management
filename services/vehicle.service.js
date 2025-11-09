// Handles vehicle onboarding and retrieval
import Vehicle from "../models/vehicle.model.js";

export class VehicleService {
  constructor(vehicleData) {
    this.registrationNo = vehicleData.registrationNo;
    this.model = vehicleData.model;
    this.fuelType = vehicleData.fuelType;
    this.capacity = vehicleData.capacity;
    this.vendorId = vehicleData.vendorId;
  }

  async addVehicle() {
    const vehicle = new Vehicle({
      registrationNo: this.registrationNo,
      model: this.model,
      fuelType: this.fuelType,
      capacity: this.capacity,
      vendorId: this.vendorId,
    });
    return await vehicle.save();
  }

  static async getVehiclesByVendor(vendorId) {
    return await Vehicle.find({ vendorId });
  }
}
