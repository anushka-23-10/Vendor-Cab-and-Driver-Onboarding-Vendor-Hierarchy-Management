// models/vehicle.model.js
import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: { type: String, required: true, unique: true },
    model: { type: String, required: true },
    capacity: { type: Number, required: true },
    fuelType: { type: String, required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);
