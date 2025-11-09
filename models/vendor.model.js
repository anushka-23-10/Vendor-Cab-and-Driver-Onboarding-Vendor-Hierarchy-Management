import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactInfo: { type: String, required: true },
  role: {
    type: String,
    enum: ["SuperVendor", "RegionalVendor", "CityVendor", "LocalVendor"],
    required: true,
  },
  region: { type: String, default: "General" },
  parentVendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export default mongoose.model("Vendor", vendorSchema);
