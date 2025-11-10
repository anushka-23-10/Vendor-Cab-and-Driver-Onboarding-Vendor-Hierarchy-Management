import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    contactInfo: { type: String },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Driver", driverSchema);
