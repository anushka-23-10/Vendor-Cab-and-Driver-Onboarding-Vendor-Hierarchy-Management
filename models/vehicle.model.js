import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  registrationNo: { type: String, required: true, unique: true },
  model: String,
  fuelType: String,
  capacity: Number,
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
});

export default mongoose.model("Vehicle", vehicleSchema);
