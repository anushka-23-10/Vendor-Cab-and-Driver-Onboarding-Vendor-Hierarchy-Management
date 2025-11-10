// models/driver.model.js
import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  contactInfo: { type: String, required: true },
  assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  compliant: { type: Boolean, default: false },
});

export default mongoose.model("Driver", driverSchema);
