// models/vehicle.model.js
import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: { type: String, required: true, unique: true },
    model: { type: String, required: true },
    capacity: { type: Number, required: true },
    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"],
      required: true,
    },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);
