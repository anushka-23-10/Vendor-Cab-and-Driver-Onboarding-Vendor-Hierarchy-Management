import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true, // ✅ Proper unique key
      trim: true,
    },
    model: { type: String, required: true },
    capacity: { type: Number, required: true },
    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"],
      required: true,
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Ensure correct index for registrationNumber
vehicleSchema.index({ registrationNumber: 1 }, { unique: true });

export default mongoose.model("Vehicle", vehicleSchema);
