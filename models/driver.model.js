import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  contactInfo: { type: String, required: true },
  assignedVehicle: { type: String },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
});

export default mongoose.model("Driver", driverSchema);
