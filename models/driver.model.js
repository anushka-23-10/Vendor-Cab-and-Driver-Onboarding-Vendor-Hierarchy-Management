import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  licenseNo: String,
  assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
});

export default mongoose.model("Driver", driverSchema);
