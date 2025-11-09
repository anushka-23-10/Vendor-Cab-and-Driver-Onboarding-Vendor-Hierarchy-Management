import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  seatingCapacity: { type: Number, required: true },
  fuelType: { type: String, enum: ["Petrol", "Diesel", "CNG", "Electric"], required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Vehicle", vehicleSchema);
